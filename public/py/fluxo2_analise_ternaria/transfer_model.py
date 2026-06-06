# AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
# Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
# SPDX-License-Identifier: AGPL-3.0-only
# See LICENSE file in the project root.
#
# Final empirical transfer model + literature ternary viscosity mesh (MethodsX).
#
# Faithful port of the authoritative reference implementation from the
# supplementary package: 2_code/final_model.py + repro_base.py (NpzMolarMesh,
# MU_WATER_LIT).
#
# Final model (fixed_layer_24C_song_anchor):
#   - observable: RAW same-session flow-time ratio A_obs = t_sample / t_water
#     (NO temperature correction);
#   - reference: Song2008-anchored literature viscosity mesh queried at a FIXED
#     24 deg C layer;
#   - transfer: A_pred = (1 + B*W_A + C*W_A^2) * mu_lit(W_A, z, 24) / mu_water(24).
#
# IMPORTANT (article nomenclature): A_obs is the operational kinematic flow
# ratio of the syringe-needle set, NOT a real dynamic viscosity. The same-session
# water reference acts as an internal thermal and hardware standard, so session
# temperature is recorded as quality-control metadata but is NOT an input of the
# inversion.

import math
from pathlib import Path

import numpy as np
from scipy.interpolate import LinearNDInterpolator

# ---------------------------------------------------------------------
# Constants (final_parameters.yaml :: model / final_model.py)
# ---------------------------------------------------------------------
MESH_QUERY_TEMP_C = 24.0
B_FINAL = 0.08259129646036734
C_FINAL = 0.1340338334788857

# Molar masses (g/mol)
M_WATER = 18.01528
M_METHANOL = 32.04186
M_ETHANOL = 46.06844

MESH_FILENAME_NPZ = "mesh_20_50C_song_anchor.npz"


# ---------------------------------------------------------------------
# Literature water viscosity (Kestin, Sokolov & Wakeham, 1978)
# Used only as the denominator mu_water(24) of the mesh viscosity ratio.
# ---------------------------------------------------------------------
def MU_WATER_LIT(temp_c):
    """Pure-water dynamic viscosity in mPa.s (Kestin-Sokolov-Wakeham, 1978)."""
    t = float(temp_c)
    d = 20.0 - t
    rhs = (d / (t + 96.0)) * (1.2378 - 1.303e-3 * d + 3.06e-6 * d * d + 2.55e-8 * d * d * d)
    return 1.002 * (10.0 ** rhs)


def temperature_is_missing(temp_c):
    """Return True when a measured temperature was not provided (QC metadata)."""
    if temp_c is None:
        return True
    try:
        return math.isnan(float(temp_c))
    except (TypeError, ValueError):
        return True


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

    def mu_at_mass_vectorized_layer(self, w_alcohol_arr, z_methanol_arr, temp_int):
        """Vectorized mesh lookup at an integer temperature layer (exact layer)."""
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
        return self._layer(int(temp_int))(xw, xme)


# ---------------------------------------------------------------------
# Empirical transfer model (final_model.py)
# ---------------------------------------------------------------------
def observed_ratio_local_water(t_sample, t_water_local):
    """Eq. (3): raw sample-to-water flow ratio measured in the same session."""
    return float(t_sample) / float(t_water_local)


def predicted_ratio(w_alcohol, z_methanol, mesh_mu_at_mass, mu_water_lit=MU_WATER_LIT,
                    b=B_FINAL, c=C_FINAL, layer_temp_c=MESH_QUERY_TEMP_C):
    """Eq. (5): predicted flow ratio for a candidate composition (fixed 24 C layer)."""
    w = float(w_alcohol)
    mu_ratio = float(mesh_mu_at_mass(w, float(z_methanol), float(layer_temp_c))) / float(
        mu_water_lit(float(layer_temp_c)))
    return max(1e-8, 1.0 + b * w + c * w * w) * mu_ratio


def invert_final_model(t_sample, t_water_local, known_w_alcohol,
                       mesh_mu_at_mass, mu_water_lit=MU_WATER_LIT, w_tolerance=0.02,
                       w_steps=41, z_steps=81):
    """Eq. (6): grid inversion around the density-based total alcohol fraction.

    The target is the RAW same-session flow ratio; no temperature input is
    required. The density estimate (w_rho) constrains W_A to +/- w_tolerance; the
    flow ratio selects the ethanol:methanol proportion. Returns the composition
    with the minimum absolute log-ratio error.
    """
    target = math.log(max(1e-8, observed_ratio_local_water(t_sample, t_water_local)))
    lo = max(0.0, float(known_w_alcohol) - float(w_tolerance))
    hi = min(1.0, float(known_w_alcohol) + float(w_tolerance))
    best = None
    for i in range(w_steps):
        w = lo + (hi - lo) * i / max(1, w_steps - 1)
        for j in range(z_steps):
            z = j / max(1, z_steps - 1)
            pred = math.log(predicted_ratio(w, z, mesh_mu_at_mass, mu_water_lit))
            err = abs(pred - target)
            if best is None or err < best["err_log"]:
                best = {
                    "w_total_pred": w,
                    "z_methanol_pred": z,
                    "w_methanol_pred": w * z,
                    "w_ethanol_pred": w * (1.0 - z),
                    "w_water_pred": 1.0 - w,
                    "err_log": err,
                }
    return best


# ---------------------------------------------------------------------
# Predicted-ratio grid for the downstream statistical layer
# ---------------------------------------------------------------------
# The statistical layer (hypothesis candidates + Monte Carlo) operates on a
# regular (w, z) grid through MalhaBusca. We provide it the same physics as the
# point inversion: G(w, z) = A_pred(w, z) on a 0.001-step grid, computed once
# from the literature mesh (24 C layer) + transfer factor and cached per mesh.
_APRED_GRID_CACHE = {}


def build_apred_grid(mesh: NpzMolarMesh, cache_key=None, n_w=1001, n_z=1001):
    """Build (w_values, z_values, A_pred grid) for MalhaBusca consumption.

    Grid axes: w in [0, 1] and z in [0, 1], both with 0.001 step (1001 points),
    matching the index convention of the statistical layer. Values are the
    predicted flow ratios A_pred(w, z) = (1 + B*w + C*w^2) *
    mu_lit(w, z, 24C) / mu_water(24C). float32 to keep memory low.
    """
    key = cache_key if cache_key is not None else id(mesh)
    cached = _APRED_GRID_CACHE.get(key)
    if cached is not None:
        return cached

    w_values = np.linspace(0.0, 1.0, int(n_w))
    z_values = np.linspace(0.0, 1.0, int(n_z))
    ww, zz = np.meshgrid(w_values, z_values, indexing="ij")

    mu = mesh.mu_at_mass_vectorized_layer(ww.ravel(), zz.ravel(), int(MESH_QUERY_TEMP_C))
    mu = np.asarray(mu, dtype=float).reshape(ww.shape)

    factor = np.maximum(1e-8, 1.0 + B_FINAL * ww + C_FINAL * ww * ww)
    grid = (factor * (mu / MU_WATER_LIT(MESH_QUERY_TEMP_C))).astype(np.float32)

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
