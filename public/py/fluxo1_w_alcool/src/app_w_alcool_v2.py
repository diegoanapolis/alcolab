# AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
# Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
# SPDX-License-Identifier: AGPL-3.0-only
# See LICENSE file in the project root.

"""
App: initial w_alcool estimation + optional label ABV conversion (% v/v -> % m/m)

Implements:
1) labelUnit + labelAbv: if labelUnit indicates % v/v or °GL, convert labelAbv to % m/m using conversao_vv_para_wE_20C.csv (20°C mesh).

2) Initial w_alcool determination:
2.1) method = "Balança" -> dens_rel = sampleMass / waterMass -> w_et (H2O-EtOH mesh at sampleTemperature) and w_met (H2O-MeOH mesh at sampleTemperature) -> w_alcool = mean(w_et, w_met)

2.2) method = "Densímetro ou alcôometro" and measuredUnit = "g/mL" or "g/cm³"
     dens_rel = measuredValue / rho_water(sampleTemperature) -> same as 2.1

2.3.1) method = "Densímetro ou alcôometro" and measuredUnit = "% v/v - rótulo"
       w_alcool = convert_vv_to_mm(measuredValue) using conversao_vv_para_wE_20C.csv (20°C mesh)

2.3.2) method = "Densímetro ou alcôometro" and measuredUnit = "% v/v" or "°GL"
       Use temp2 = sampleTemperature2 (user provided)
       - get rho_abs_20 = density from densidade_alcool_gl20a30.csv at temp=20°C for the given °GL (1 by 1; linear interpolation supported)
       - dens_rel = rho_abs_20 / rho_water(temp2)
       - use dens_rel_bin_H2O_EtOH.csv at temp2 to invert and obtain w_etanol
       - w_alcool = w_etanol

2.4) method = "Densímetro ou alcôometro" and measuredUnit = "% m/m" or "INPM"
     w_alcool = measuredValue/100

Also outputs:
temp = sampleTemperature
delta_v = 4
hm = 7
temp_agua = waterTemperature
temp2 = sampleTemperature2 (when present)

Input: Excel with one sheet.
Output: Excel with original columns + computed columns for checking.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Tuple, List

import numpy as np


def _is_na(x) -> bool:
    try:
        return x is None or (isinstance(x, float) and np.isnan(x))
    except Exception:
        return x is None


def _not_na(x) -> bool:
    return not _is_na(x)


from utils_nopandas import read_csv_table


# -----------------------------
# Utilities
# -----------------------------
def _norm(s: str) -> str:
    return (s or "").strip().lower()


def rho_water_g_per_ml(temp_c: float) -> float:
    """
    Density of pure water (g/mL) as a function of temperature (°C).
    Uses the commonly cited polynomial (Kell-like) valid ~0–100°C.
    """
    T = float(temp_c)
    rho_kg_m3 = (
        999.842594
        + 6.793952e-2 * T
        - 9.095290e-3 * T**2
        + 1.001685e-4 * T**3
        - 1.120083e-6 * T**4
        + 6.536332e-9 * T**5
    )
    return rho_kg_m3 / 1000.0  # g/mL


def linear_interp(x: float, x0: float, y0: float, x1: float, y1: float) -> float:
    if x1 == x0:
        return float(y0)
    return float(y0) + (float(y1) - float(y0)) * (float(x) - float(x0)) / (float(x1) - float(x0))


def convert_vv_to_mm_percent(abv_vv_percent: float, conv_df: dict) -> Tuple[float, float]:
    """
    Convert % v/v at 20°C to:
      - % m/m (w/w in %)
      - mass fraction (0..1)
    using conversao_vv_para_wE_20C.csv
    """
    df = conv_df
    xcol = "Sv_%_v_v_20C"
    ycol_pct = "wE_%_m_m"
    ycol_w = "wE_mass_fraction"

    x = float(abv_vv_percent)
    xs = df[xcol].astype(float)
    yp = df[ycol_pct].astype(float)
    yw = df[ycol_w].astype(float)

    # clamp
    if x <= xs.min():
        return float(yp[0]), float(yw[0])
    if x >= xs.max():
        return float(yp[-1]), float(yw[-1])

    i = int(np.searchsorted(xs, x) - 1)
    i = max(0, min(i, len(xs) - 2))
    mm_pct = linear_interp(x, xs[i], yp[i], xs[i + 1], yp[i + 1])
    w = linear_interp(x, xs[i], yw[i], xs[i + 1], yw[i + 1])
    return float(mm_pct), float(w)


def parse_density_mesh(df: dict) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """Parse a density mesh already loaded as dict from read_csv_table.

    Returns: w_pct (n,), temps (m,), temp_cols (list[str]).
    """
    header = df.get('header')
    cols = df.get('cols')
    if header is None or cols is None:
        # allow passing raw (header, cols) shaped dicts
        if isinstance(df, dict) and all(isinstance(v, np.ndarray) for v in df.values()):
            # best-effort: first key is w_pct, remaining are temps
            keys = list(df.keys())
            header = keys
            cols = df
        else:
            raise ValueError("Invalid density mesh table object.")
    if len(header) < 4:
        raise ValueError("Density mesh CSV has too few columns.")
    temp_cols = [c for c in header[2:]]
    temps = np.array([float(c) for c in temp_cols], dtype=float)
    w_pct = cols[header[0]].astype(float)
    return w_pct, temps, temp_cols


def densrel_from_mesh_at_temp(mesh_df: dict, temp_c: float) -> Tuple[np.ndarray, np.ndarray]:
    """
    Get curve dens_rel(w) at a given temperature (°C) by interpolating between
    nearest temperature columns.
    Returns:
      w (mass fraction, 0..1)
      dens_rel
    """
    w_pct, temps, temp_cols = parse_density_mesh(mesh_df)
    T = float(temp_c)

    # clamp
    if T <= temps.min():
        d = mesh_df['cols'][temp_cols[int(np.argmin(temps))]].astype(float)
    elif T >= temps.max():
        d = mesh_df['cols'][temp_cols[int(np.argmax(temps))]].astype(float)
    else:
        j = int(np.searchsorted(temps, T) - 1)
        j = max(0, min(j, len(temps) - 2))
        t0, t1 = temps[j], temps[j + 1]
        c0, c1 = temp_cols[j], temp_cols[j + 1]
        d0 = mesh_df['cols'][c0].astype(float)
        d1 = mesh_df['cols'][c1].astype(float)
        d = d0 + (d1 - d0) * (T - t0) / (t1 - t0)

    w = (w_pct / 100.0).astype(float)
    return w, d.astype(float)


def invert_density_to_w(dens_rel: float, w_curve: np.ndarray, d_curve: np.ndarray) -> float:
    """
    Invert dens_rel -> w by monotonic piecewise linear interpolation.
    Handles curves that may be decreasing or increasing.
    Returns w in 0..1.
    """
    d = float(dens_rel)
    # Ensure no NaNs
    mask = np.isfinite(w_curve) & np.isfinite(d_curve)
    w = w_curve[mask]
    dc = d_curve[mask]
    if len(w) < 2:
        return float("nan")

    # Determine monotonic direction (usually decreasing with alcohol)
    if dc[0] > dc[-1]:
        # decreasing; make x increasing for interpolation
        x = dc[::-1]
        y = w[::-1]
    else:
        x = dc
        y = w

    # clamp
    if d <= x.min():
        return float(y[0])
    if d >= x.max():
        return float(y[-1])

    i = int(np.searchsorted(x, d) - 1)
    i = max(0, min(i, len(x) - 2))
    return float(linear_interp(d, x[i], y[i], x[i + 1], y[i + 1]))


def load_gl_density_table(path: Path) -> dict:
    """Load GL density table CSV into a dict with axes + columns arrays.

    Expected: first column 'GL', remaining columns are temperatures (as strings, e.g. '20','21',...).
    """
    header, cols = read_csv_table(path)
    if header and (header[0] == '' or header[0] is None):
        header[0] = 'GL'
        cols['GL'] = cols.pop('')

    if 'GL' not in cols:
        # sometimes first column name may vary; assume first column is GL
        gl_key = header[0]
        cols['GL'] = cols[gl_key]
    gls = cols['GL'].astype(float)
    temp_cols = [c for c in header if c != 'GL']
    temps = np.array([float(c) for c in temp_cols], dtype=float)
    return {'gls': gls, 'temp_cols': temp_cols, 'temps': temps, 'cols': cols}


def gl_density_abs(df_gl: dict, gl_value: float, temp_c: float = 20.0) -> float:
    """
    Bilinear interpolation in (GL, temp) space for the absolute density table.
    """
    g = float(gl_value)
    T = float(temp_c)

    # available axes
    gls = df_gl["GL"].astype(float).to_numpy()
    temp_cols = [c for c in df_gl.columns if c != "GL"]
    temps = np.array([float(c) for c in temp_cols], dtype=float)

    # clamp in temp
    if T <= temps.min():
        t0 = t1 = temps.min()
    elif T >= temps.max():
        t0 = t1 = temps.max()
    else:
        j = int(np.searchsorted(temps, T) - 1)
        j = max(0, min(j, len(temps) - 2))
        t0, t1 = temps[j], temps[j + 1]

    # function to interpolate along GL for a given temp column name
    def interp_gl_at_temp(temp_val: float) -> float:
        col = str(int(round(temp_val))) if str(int(round(temp_val))) in df_gl.columns else str(temp_val)
        # robust: pick closest column name by float
        if col not in df_gl.columns:
            # choose nearest
            nearest = temp_cols[int(np.argmin(np.abs(temps - temp_val)))]
            col = nearest
        ys = df_gl[col].astype(float).to_numpy()

        # clamp GL
        if g <= gls.min():
            return float(ys[0])
        if g >= gls.max():
            return float(ys[-1])

        i = int(np.searchsorted(gls, g) - 1)
        i = max(0, min(i, len(gls) - 2))
        return linear_interp(g, gls[i], ys[i], gls[i + 1], ys[i + 1])

    rho0 = interp_gl_at_temp(t0)
    if t0 == t1:
        return float(rho0)
    rho1 = interp_gl_at_temp(t1)
    return float(linear_interp(T, t0, rho0, t1, rho1))


# -----------------------------
# Row processing
# -----------------------------
def process_row(row: dict, conv: dict, dens_et: dict, dens_met: dict, dens_gl: dict, dens_rel_bin_et: dict) -> dict:
    out = {}

    # ---- (1) label conversion (only for label; always at 20°C per your rule)
    label_unit = str(row.get("labelUnit", "") or "").strip()
    label_abv = row.get("labelAbv", np.nan)

    label_mm = label_abv
    label_note = ""
    lu = _norm(label_unit)

    if lu in {"inpm", "% m/m", "%m/m"}:
        label_note = "label already in % m/m (INPM)."
    elif lu in {"% v/v - bebidas", "º gl - gay-lussac", "°gl", "ºgl", "% v/v"}:
        if _not_na(label_abv):
            mm, _w = convert_vv_to_mm_percent(float(label_abv), conv)
            label_mm = mm
            label_note = "converted labelAbv from % v/v to % m/m using conversao_vv_para_wE_20C.csv (20°C mesh)."
        else:
            label_note = "labelUnit indicates % v/v but labelAbv is missing."
    else:
        if label_unit != "":
            label_note = f"labelUnit '{label_unit}' not recognized; labelAbv kept as-is."
        else:
            label_note = "labelUnit empty; labelAbv kept as-is."

    out["labelAbv_mm"] = label_mm
    out["labelAbv_mm_note"] = label_note

    # ---- (1b) labelEt/labelMet (optional) + beverageType (required) -> estimated composition outputs
    beverage_type = str(row.get("beverageType", "") or "").strip()

    label_et = row.get("labelEt", np.nan)
    label_met = row.get("labelMet", np.nan)

    def _to_float_or_nan(x):
        if _is_na(x):
            return np.nan
        try:
            # allow "12,3" style
            if isinstance(x, str):
                x = x.strip().replace(",", ".")
            return float(x)
        except Exception:
            return np.nan

    label_et_f = _to_float_or_nan(label_et)
    label_met_f = _to_float_or_nan(label_met)

    w_et_est = np.nan
    w_met_est = np.nan
    w_agua_est = np.nan

    label_abv_present = _not_na(label_abv) and str(label_abv).strip() != ""

    # beverageType validation and rule-based estimates
    bev_set_ethanol = {
        "Vodka",
        "Cachaça branca",
        "Whisky",
        "Aguardente",
        "Rum branco",
        "Gin seco",
        "Tequila blanca",
        "Pisco",
        "Tiquira",
        "Etanol comercial*",
        "Etanol combustível",
    }

    if beverage_type in bev_set_ethanol and label_abv_present:
        # 3.1
        if _not_na(label_mm):
            w_et_est = float(label_mm) / 100.0
            w_met_est = 0.0
            w_agua_est = 1.0 - w_et_est

    elif beverage_type == "Metanol comercial" and label_abv_present:
        # 3.2
        if _not_na(label_mm):
            w_met_est = float(label_mm) / 100.0
            w_et_est = 0.0
            w_agua_est = 1.0 - w_met_est

    elif beverage_type == "Outra hidroalcoólica" and _not_na(label_et_f) and _not_na(label_met_f):
        # 3.3
        w_et_est = float(label_et_f) / 100.0
        w_met_est = float(label_met_f) / 100.0
        w_agua_est = 1.0 - (w_et_est + w_met_est)

    out["w_et_est"] = w_et_est
    out["w_met_est"] = w_met_est
    out["w_agua_est"] = w_agua_est


    # Common variables requested
    sample_temp = row.get("sampleTemperature", np.nan)
    water_temp = row.get("waterTemperature", np.nan)
    sample_temp2 = row.get("sampleTemperature2", np.nan)

    out["temp"] = sample_temp
    # delta_v and hm: optional inputs; default to 4 and 7 when missing/blank/0
    delta_v_in = row.get("delta_v", np.nan)
    hm_in = row.get("hm", np.nan)
    try:
        dv = float(delta_v_in) if _not_na(delta_v_in) else np.nan
    except Exception:
        dv = np.nan
    try:
        hm_val = float(hm_in) if _not_na(hm_in) else np.nan
    except Exception:
        hm_val = np.nan
    if (_is_na(dv)) or (dv == 0):
        dv = 4.0
    if (_is_na(hm_val)) or (hm_val == 0):
        hm_val = 7.0
    out["delta_v"] = dv
    out["hm"] = hm_val
    out["temp_agua"] = water_temp
    out["temp2"] = sample_temp2

    method = str(row.get("method", "") or "").strip()
    dens_rel = np.nan
    w_et = np.nan
    w_met = np.nan
    w_alcool = np.nan
    src = ""

    # ---- (2) w_alcool determination
    if _norm(method) == "balança":
        water_mass = row.get("waterMass", np.nan)
        sample_mass = row.get("sampleMass", np.nan)
        if _not_na(water_mass) and _not_na(sample_mass) and float(water_mass) != 0:
            dens_rel = float(sample_mass) / float(water_mass)
            src = "density_rel from masses (sampleMass/waterMass)"
        else:
            src = "missing waterMass/sampleMass for Balança"

    elif _norm(method) in {"densímetro ou alcôometro", "densimetro ou alcoometro"}:
        measured_unit = str(row.get("measuredUnit", "") or "").strip()
        measured_value = row.get("measuredValue", np.nan)
        mu = _norm(measured_unit)

        if mu in {"g/ml", "g/cm³", "g/cm3"}:
            # measured density -> density relative vs water at sampleTemperature
            if _not_na(measured_value) and _not_na(sample_temp):
                dens_rel = float(measured_value) / rho_water_g_per_ml(float(sample_temp))
                src = "density_rel from measured density / rho_water(sampleTemperature)"
            else:
                src = "missing measuredValue or sampleTemperature for density unit"

        elif mu in {"% v/v - rótulo", "% v/v - rotulo", "% v/v - bebidas"}:
            # 2.3.1: label-type measured value, always at 20°C table
            # Inclui "% v/v - bebidas" que é equivalente a "% v/v - rótulo"
            if _not_na(measured_value):
                _mm, w = convert_vv_to_mm_percent(float(measured_value), conv)
                w_alcool = float(w)
                src = "w_alcool from measured % v/v (label/bebidas) converted to mass fraction (20°C mesh)"
            else:
                src = "missing measuredValue for % v/v - rótulo"

        elif (("% v/v" in mu) or ("gl" in mu)) and ("rótulo" not in mu) and ("rotulo" not in mu) and ("bebidas" not in mu):
            # 2.3.2: álcool (%v/v ou °GL) medido em uma temperatura informada.
            # A UI atual não coleta sampleTemperature2; então usamos sampleTemperature como padrão.
            t_meas = sample_temp2 if _not_na(sample_temp2) else sample_temp
            if _is_na(t_meas):
                src = "missing sampleTemperature for measuredUnit % v/v/°GL"
            elif _is_na(measured_value):
                src = "missing measuredValue for measuredUnit % v/v/°GL"
            else:
                t_meas_f = float(t_meas)
                # Step 1: density of solution at the measurement temperature
                rho_abs_t = gl_density_abs(dens_gl_df, float(measured_value), t_meas_f)
                # Step 2: density relative vs water at the same temperature
                rho_w_t = rho_water_g_per_ml(t_meas_f)
                dens_rel = rho_abs_t / rho_w_t
                # Step 3-4: invert in ethanol binary relative density mesh at the same temperature
                w_curve, d_curve = densrel_from_mesh_at_temp(dens_rel_bin_et, t_meas_f)
                w_etanol = invert_density_to_w(float(dens_rel), w_curve, d_curve)
                w_et = w_etanol
                w_alcool = w_etanol
                src = "w_alcool from °GL/%v/v using: rho_abs(GL,temp)/rho_water(temp) then invert dens_rel_bin_H2O_EtOH at temp"
        elif mu in {"% m/m", "%m/m", "inpm", "% m/m ou inpm", "%m/m ou inpm"}:
            # 2.4
            if _not_na(measured_value):
                w_alcool = float(measured_value) / 100.0
                src = "w_alcool directly from measured % m/m (INPM)"
            else:
                src = "missing measuredValue for % m/m (INPM)"
        else:
            src = f"measuredUnit '{measured_unit}' not recognized"

    else:
        src = f"method '{method}' not recognized"

    # If we have dens_rel but not w_alcool, use meshes (EtOH/MeOH mean).
    # For "Balança" (mass/mass), do NOT depend on the input temperature (use a fixed 20°C reference).
    if _not_na(dens_rel) and _is_na(w_alcool):
        if _norm(method) == "balança":
            t_use = 20.0
            t_src = "20°C (fixed)"
        else:
            if _is_na(sample_temp):
                t_use = None
            else:
                t_use = float(sample_temp)
            t_src = "sampleTemperature"

        if t_use is not None:
            w_curve_et, d_curve_et = densrel_from_mesh_at_temp(dens_et, float(t_use))
            w_curve_met, d_curve_met = densrel_from_mesh_at_temp(dens_met, float(t_use))

            w_et = invert_density_to_w(float(dens_rel), w_curve_et, d_curve_et)
            w_met = invert_density_to_w(float(dens_rel), w_curve_met, d_curve_met)
            w_alcool = float(np.nanmean([w_et, w_met]))
            src = (src + " + " if src else "") + f"meshes(EtOH/MeOH) mean at {t_src}"

    out["dens_rel"] = dens_rel
    out["w_alcool"] = w_alcool
    out["w_alcool_src"] = src

    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", "-i", default="input_exemplo.xlsx", help="Input Excel file")
    p.add_argument("--output", "-o", default="outputs.xlsx", help="Output Excel file")

    # CSV inputs
    p.add_argument("--conv", default="conversao_vv_para_wE_20C.csv", help="Conversion CSV (%v/v -> %m/m @20°C)")
    p.add_argument("--dens_et", default="dens_rel_bin_H2O_EtOH.csv", help="Relative density mesh (H2O-EtOH)")
    p.add_argument("--dens_met", default="dens_rel_bin_H2O_MetOH.csv", help="Relative density mesh (H2O-MeOH)")
    p.add_argument("--dens_gl", default="densidade_alcool_gl20a30.csv", help="Absolute density table by °GL and temperature (20–30°C)")
    p.add_argument("--dens_rel_bin_et", default="dens_rel_bin_H2O_EtOH.csv", help="Relative density binary mesh (H2O-EtOH) used in 2.3.2")

    args = p.parse_args()
    base = Path(__file__).resolve().parent

    _, conv_cols = read_csv_table(base / args.conv)
    conv_df = conv_cols
    dens_gl_df = load_gl_density_table(base / args.dens_gl)

    inp = pd.read_excel(base / args.input)

    # ---- beverageType is mandatory (column must exist and must not be blank)
    if "beverageType" not in inp.columns:
        raise ValueError("Missing required column: 'beverageType'")

    allowed_beverage_types = {
        "Vodka",
        "Cachaça branca",
        "Whisky",
        "Aguardente",
        "Rum branco",
        "Gin seco",
        "Tequila blanca",
        "Pisco",
        "Tiquira",
        "Etanol comercial*",
        "Etanol combustível",
        "Metanol comercial",
        "Outra hidroalcoólica",
    }

    bt_series = inp["beverageType"].astype(str).str.strip()
    missing_bt = bt_series.eq("") | bt_series.eq("nan") | bt_series.isna()

    if bool(missing_bt.any()):
        bad_rows = (missing_bt[missing_bt].index + 2).tolist()  # +2: header row + 1-indexed excel
        raise ValueError(f"'beverageType' is required but is blank in Excel row(s): {bad_rows}")

    invalid_bt = ~bt_series.isin(allowed_beverage_types)
    if bool(invalid_bt.any()):
        bad = inp.loc[invalid_bt, "beverageType"].astype(str).str.strip().unique().tolist()
        bad_rows = (invalid_bt[invalid_bt].index + 2).tolist()
        raise ValueError(f"Invalid beverageType value(s) {bad} in Excel row(s): {bad_rows}. Allowed: {sorted(allowed_beverage_types)}")

    rows = []
    for _, r in inp.iterrows():
        rows.append(process_row(r, conv_df, dens_et, dens_met, dens_gl_df, dens_rel_bin_et))

    out_df = pd.concat([inp.reset_index(drop=True), pd.DataFrame(rows)], axis=1)
    out_df.to_excel(base / args.output, index=False)
    print(f"Saved: {base / args.output}")


if __name__ == "__main__":
    main()
