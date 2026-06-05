# AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
# Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
# SPDX-License-Identifier: AGPL-3.0-only
# See LICENSE file in the project root.
#
# Empirical transfer model + literature ternary viscosity mesh (MethodsX article).
#
# This module is a faithful port of the authoritative reference implementation
# from the supplementary package:
#   - water20_local_model_final.py  (Eqs. 3-8: observed/predicted flow ratios,
#     effective temperature, grid inversion, constants B/C/K_ideal/k_hw)
#   - repro_base.py                 (NpzMolarMesh literature-mesh lookup by mass
#     fraction + MU_WATER_LIT, Kestin-Sokolov-Wakeham 1978)
#
# IMPORTANT (article nomenclature): the observed quantity A_obs is the
# sample-to-water flow-time ratio measured with the syringe-needle set. It is an
# operational kinematic flow ratio, NOT a real dynamic viscosity. The factor
# (1 + B*W_A + C*W_A^2) bridges this operational response to the dynamic
# viscosity ratio scale of the literature mesh, equivalent at 20 deg C.

import math
from pathlib import Path

import numpy as np
from scipy.interpolate import LinearNDInterpolator

# ---------------------------------------------------------------------
# Constants (final_parameters.yaml / water20_local_model_final.py)
# ---------------------------------------------------------------------
REF_TEMP_C = 20.0
B_WATER20_LOCAL = -0.17397814118294327
C_WATER20_LOCAL = 0.4372089688313428
K_IDEAL_WATER20_LOCAL = 0.0050626672540227706

# Molar masses (g/mol)
M_WATER = 18.01528
M_METHANOL = 32.04186
M_ETHANOL = 46.06844

MESH_FILENAME_NPZ = "mesh_20_50C_song_anchor.npz"


# ---------------------------------------------------------------------
# Literature water viscosity (Kestin, Sokolov & Wakeham, 1978)
# ---------------------------------------------------------------------
def MU_WATER_LIT(temp_c):
    """Pure-water dynamic viscosity in mPa.s (Kestin-Sokolov-Wakeham, 1978).

    log10(mu(T)/mu(20)) = [(20-T)/(T+96)] * (1.2378 - 1.303e-3*(20-T)
                          + 3.06e-6*(20-T)^2 + 2.55e-8*(20-T)^3)
    Sign convention checked against: mu(10)=1.3075, mu(20)=1.0020,
    mu(25)=0.8901, mu(30)=0.7972, mu(50)=0.5471 mPa.s.
    """
    t = float(temp_c)
    d = 20.0 - t
    rhs = (d / (t + 96.0)) * (1.2378 - 1.303e-3 * d + 3.06e-6 * d * d + 2.55e-8 * d * d * d)
    return 1.002 * (10.0 ** rhs)


def k_hw_water_calibration(temp_c):
    """Hardware water-flow calibration used to estimate effective temperature."""
    return -0.002845 * float(temp_c) + 0.6684


# ---------------------------------------------------------------------
# Literature ternary mesh, queried by mass fraction (repro_base.NpzMolarMesh)
# ---------------------------------------------------------------------
class NpzMolarMesh:
    """Ternary viscosity mesh loaded from an .npz, queried by mass fraction.

    The mesh stores dynamic viscosity (mPa.s) on an integer mole-percent simplex
    grid, one layer per integer temperature (T20..T50). ``mu_at_mass`` converts
    the mass composition (total alcohol mass fraction ``w_alcohol`` and methanol
    mass fraction in the alcohol ``z_methanol``) to mole fractions, interpolates
    the viscosity linearly within the composition grid, and linearly between the
    two bracketing temperature layers.
    """

    def __init__(self, npz_path):
        self._d = np.load(str(npz_path))
        self._temps = sorted(
            {int(k[1:k.index("_")]) for k in self._d.files if k.endswith("_mu_mPa_s")}
        )
        self._interp = {}

    def _layer(self, temp_int):
        t = int(temp_int)
        if t not in self._interp:
            xw = self._d[f"T{t}_xW_percent"].astype(float)
            xme = self._d[f"T{t}_xMe_percent"].astype(float)
            mu = self._d[f"T{t}_mu_mPa_s"].astype(float)
            self._interp[t] = LinearNDInterpolator(np.column_stack([xw, xme]), mu)
        return self._interp[t]

    def mu_at_mass(self, w_alcohol, z_methanol, temp_c):
        w_a = float(w_alcohol)
        z = float(z_methanol)
        w_w = 1.0 - w_a
        w_m = w_a * z
        w_e = w_a * (1.0 - z)
        n_w = w_w / M_WATER
        n_m = w_m / M_METHANOL
        n_e = w_e / M_ETHANOL
        s = n_w + n_m + n_e
        xw = 100.0 * n_w / s
        xme = 100.0 * n_m / s
        lo_t, hi_t = self._temps[0], self._temps[-1]
        t = min(hi_t, max(lo_t, float(temp_c)))
        lo = int(math.floor(t))
        hi = int(math.ceil(t))
        if lo == hi:
            return float(self._layer(lo)(xw, xme))
        a = (t - lo) / (hi - lo)
        return float((1.0 - a) * self._layer(lo)(xw, xme) + a * self._layer(hi)(xw, xme))

    def mu_at_mass_vectorized_T20(self, w_alcohol_arr, z_methanol_arr):
        """Vectorized T=20 deg C mesh lookup for arrays of (w_alcohol, z_methanol)."""
        w_a = np.asarray(w_alcohol_arr, dtype=float)
        z = np.asarray(z_methanol_arr, dtype=float)
        w_w = 1.0 - w_a
        w_m = w_a * z
        w_e = w_a * (1.0 - z)
        n_w = w_w / M_WATER
        n_m = w_m / M_METHANOL
        n_e = w_e / M_ETHANOL
        s = n_w + n_m + n_e
        xw = 100.0 * n_w / s
        xme = 100.0 * n_m / s
        return self._layer(int(REF_TEMP_C))(xw, xme)


# ---------------------------------------------------------------------
# Empirical transfer model (water20_local_model_final.py — Eqs. 3-8)
# ---------------------------------------------------------------------
def observed_ratio_local_water(t_sample, t_water_local):
    """Eq. (3): sample-to-water flow ratio measured in the same session."""
    return float(t_sample) / float(t_water_local)


def estimate_effective_temperature_from_water(
    t_water_local,
    mu_water_lit=MU_WATER_LIT,
    k_ideal=K_IDEAL_WATER20_LOCAL,
    k_hw=k_hw_water_calibration,
    temp_bounds=(15.0, 35.0),
    n_iter=70,
):
    """Eq. (7): effective operational session temperature from local water flow.

    Fallback for sessions without a measured temperature; bisection in
    [15, 35] deg C. Interpreted as an effective temperature of the water-flow
    response, not as an independent physical thermometer.
    """
    target = float(t_water_local)
    lo, hi = map(float, temp_bounds)

    def water_time(temp_c):
        return float(k_hw(temp_c)) * float(mu_water_lit(temp_c)) / float(k_ideal)

    f_lo = water_time(lo) - target
    f_hi = water_time(hi) - target
    if f_lo == 0:
        return lo
    if f_hi == 0:
        return hi
    if f_lo * f_hi > 0:
        return lo if abs(f_lo) < abs(f_hi) else hi

    for _ in range(n_iter):
        mid = 0.5 * (lo + hi)
        f_mid = water_time(mid) - target
        if f_mid == 0:
            return mid
        if f_lo * f_mid <= 0:
            hi = mid
            f_hi = f_mid
        else:
            lo = mid
            f_lo = f_mid
    return 0.5 * (lo + hi)


def temperature_is_missing(temp_c):
    """Return True when a measured temperature was not provided."""
    if temp_c is None:
        return True
    try:
        return math.isnan(float(temp_c))
    except (TypeError, ValueError):
        return True


def resolve_temperature_for_water20(t_water_local, temp_c, mu_water_lit=MU_WATER_LIT):
    """Use measured temperature when available, otherwise estimate it from water."""
    if temperature_is_missing(temp_c):
        return estimate_effective_temperature_from_water(t_water_local, mu_water_lit)
    return float(temp_c)


def observed_ratio_20c(t_sample, t_water_local, temp_c, mu_water_lit=MU_WATER_LIT):
    """Eq. (4): observed flow ratio normalized to the water viscosity at 20 deg C."""
    temp_used = resolve_temperature_for_water20(t_water_local, temp_c, mu_water_lit)
    a_obs = observed_ratio_local_water(t_sample, t_water_local)
    return a_obs * float(mu_water_lit(temp_used)) / float(mu_water_lit(REF_TEMP_C))


def predicted_ratio_20c(w_alcohol, z_methanol, mesh_mu_at_mass, mu_water_lit=MU_WATER_LIT,
                        b=B_WATER20_LOCAL, c=C_WATER20_LOCAL):
    """Eq. (6): predicted 20 deg C flow ratio for a candidate composition."""
    w = float(w_alcohol)
    mu_ratio_20 = float(mesh_mu_at_mass(w, float(z_methanol), REF_TEMP_C)) / float(mu_water_lit(REF_TEMP_C))
    return max(1e-8, 1.0 + b * w + c * w * w) * mu_ratio_20


def invert_water20_local(t_sample, t_water_local, temp_c, known_w_alcohol,
                         mesh_mu_at_mass, mu_water_lit=MU_WATER_LIT, w_tolerance=0.02,
                         w_steps=41, z_steps=81):
    """Eq. (8): grid inversion around the density-based total alcohol fraction.

    The density estimate (w_rho) constrains W_A to +/- w_tolerance; the flow
    ratio selects the ethanol:methanol proportion. Returns the composition with
    the minimum absolute log-ratio error.
    """
    temp_used = resolve_temperature_for_water20(t_water_local, temp_c, mu_water_lit)
    target = math.log(max(1e-8, observed_ratio_20c(t_sample, t_water_local, temp_used, mu_water_lit)))
    lo = max(0.0, float(known_w_alcohol) - float(w_tolerance))
    hi = min(1.0, float(known_w_alcohol) + float(w_tolerance))
    best = None
    for i in range(w_steps):
        w = lo + (hi - lo) * i / max(1, w_steps - 1)
        for j in range(z_steps):
            z = j / max(1, z_steps - 1)
            pred = math.log(predicted_ratio_20c(w, z, mesh_mu_at_mass, mu_water_lit))
            err = abs(pred - target)
            if best is None or err < best["err_log"]:
                best = {
                    "w_total_pred": w,
                    "z_methanol_pred": z,
                    "w_methanol_pred": w * z,
                    "w_ethanol_pred": w * (1.0 - z),
                    "w_water_pred": 1.0 - w,
                    "temp_used_c": temp_used,
                    "temperature_source": "water_effective" if temperature_is_missing(temp_c) else "measured",
                    "err_log": err,
                }
    return best


# ---------------------------------------------------------------------
# Predicted-ratio grid for the downstream statistical layer
# ---------------------------------------------------------------------
# The statistical layer (hypothesis candidates + Monte Carlo) operates on a
# regular (w, z) grid through MalhaBusca. We provide it the same physics as the
# point inversion: G(w, z) = A_pred,20(w, z) on a 0.001-step grid, computed
# once from the literature mesh + transfer factor and cached per mesh file.
_APRED_GRID_CACHE = {}


def build_apred20_grid(mesh: NpzMolarMesh, cache_key=None, n_w=1001, n_z=1001):
    """Build (w_values, z_values, A_pred,20 grid) for MalhaBusca consumption.

    Grid axes: w in [0, 1] and z in [0, 1], both with 0.001 step (1001 points),
    matching the index convention of the statistical layer. Values are the
    predicted 20 deg C flow ratios A_pred,20(w, z) = (1 + B*w + C*w^2) *
    mu_lit(w, z, 20C) / mu_water(20C). float32 to keep memory low.
    """
    key = cache_key if cache_key is not None else id(mesh)
    cached = _APRED_GRID_CACHE.get(key)
    if cached is not None:
        return cached

    w_values = np.linspace(0.0, 1.0, int(n_w))
    z_values = np.linspace(0.0, 1.0, int(n_z))
    ww, zz = np.meshgrid(w_values, z_values, indexing="ij")

    mu = mesh.mu_at_mass_vectorized_T20(ww.ravel(), zz.ravel())
    mu = np.asarray(mu, dtype=float).reshape(ww.shape)

    factor = np.maximum(1e-8, 1.0 + B_WATER20_LOCAL * ww + C_WATER20_LOCAL * ww * ww)
    grid = (factor * (mu / MU_WATER_LIT(REF_TEMP_C))).astype(np.float32)

    # Defensive: the mesh interpolator may return NaN exactly on degenerate
    # corners; fill any NaN from the nearest valid neighbor along z.
    if np.isnan(grid).any():
        for i in range(grid.shape[0]):
            rowv = grid[i]
            if np.isnan(rowv).any():
                valid = np.where(~np.isnan(rowv))[0]
                if valid.size:
                    nan_idx = np.where(np.isnan(rowv))[0]
                    nearest = valid[np.abs(valid[None, :] - nan_idx[:, None]).argmin(axis=1)]
                    rowv[nan_idx] = rowv[nearest]

    result = (w_values, z_values, grid)
    _APRED_GRID_CACHE[key] = result
    return result
