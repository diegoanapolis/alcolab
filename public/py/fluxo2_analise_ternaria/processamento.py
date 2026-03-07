# AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
# Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
# SPDX-License-Identifier: AGPL-3.0-only
# See LICENSE file in the project root.

import math
import re
import zlib
from pathlib import Path
from typing import Tuple, Dict, List, Optional

import numpy as np

from utils_nopandas import read_csv_table
from scipy import stats

# ---------------------------------------------------------------------
# Configurações
# ---------------------------------------------------------------------
MALHA_FILENAME = "malha_viscosidade_ajuste_bordas.csv"
MALHA_FILENAME_NPZ = "malha_viscosidade_ajuste_bordas_f32.npz"
MALHA_COARSE_NPZ = "malha_viscosidade_ajuste_bordas_coarse251_f32.npz"

# Número padrão de simulações Monte Carlo (pode ser ajustado)
MC_N_DEFAULT = 3000

# Limites de decisão (probabilidade)
P_CUTOFF_HIGH_SELECTIVITY = 0.70
P_CUTOFF_LOW_SELECTIVITY = 0.80

# Região de baixa seletividade da malha
W_LOW_SELECTIVITY = 0.20

# Se muito baixo álcool estimado, concluir como aquoso/diluído
W_AQUOSO_DILUIDO = 0.025  # 2.5%

# Pureza
W_PURE_ALCOHOL = 0.98
W_PURE_WATER = 0.97

# Desvio padrão default quando n=1 (pedido do usuário)
SD_DEFAULT_N1 = 0.025

# Erro mínimo para evitar divisões por zero
SE_MIN_ABS = 1e-6

# Incerteza da malha (mPa·s). Se você tiver um desvio padrão por célula ou RMSE global,
# coloque aqui ou implemente função por região/célula.
MALHA_SIGMA_DEFAULT = 0.0

# Confiança para o teste de média (95% => alpha=0.05)
ALPHA_MEDIA = 0.05


def _interp_water_mu(temp_ref_df: Optional[Dict[str, np.ndarray]], temp_c: float) -> Optional[float]:
    """Interpola a viscosidade da água (mesmas unidades da malha) a partir da tabela.

    A tabela pública tem cabeçalho com typo ("temperarua"); aqui aceitamos variações.
    Retorna None se não for possível interpolar.
    """
    if temp_ref_df is None:
        return None
    keys = list(temp_ref_df.keys())
    t_key = None
    v_key = None
    for k in keys:
        kk = str(k).strip().lower()
        if t_key is None and ("temper" in kk or kk in {"t", "temp"}):
            t_key = k
        if v_key is None and ("visc" in kk or "mu" in kk):
            v_key = k
    if t_key is None or v_key is None:
        return None

    temps = np.asarray(temp_ref_df.get(t_key, np.array([])), dtype=float)
    mus = np.asarray(temp_ref_df.get(v_key, np.array([])), dtype=float)
    if temps.size == 0 or mus.size == 0:
        return None
    m = np.isfinite(temps) & np.isfinite(mus)
    if not np.any(m):
        return None
    temps = temps[m]
    mus = mus[m]

    order = np.argsort(temps)
    temps = temps[order]
    mus = mus[order]

    t = float(temp_c)
    t = float(np.clip(t, float(temps[0]), float(temps[-1])))
    return float(np.interp(t, temps, mus))


def _stable_seed_32(*parts: object) -> int:
    """Gera um seed 32-bit estável (cross-platform) a partir de partes.

    Evita usar `hash()` do Python (não determinístico entre execuções).
    """
    payload = "|".join(str(p) for p in parts).encode("utf-8", errors="replace")
    return int(zlib.crc32(payload) & 0xFFFFFFFF)


def _count_rep_values(rep: object) -> int:
    """Conta valores numéricos em strings do tipo '98;100' (ignora vazios).

    Retorna quantos valores adicionais foram informados.
    """
    if rep is None or (isinstance(rep, float) and np.isnan(rep)):
        return 0
    txt = str(rep).strip()
    if not txt:
        return 0
    parts = [p.strip() for p in re.split(r"[;\n,]+", txt) if p.strip()]
    out = 0
    for p in parts:
        try:
            float(p)
            out += 1
        except Exception:
            pass
    return int(out)


def carregar_malha_e_referencia(base_dir: Path):
    """Carrega malha e referência.

    Otimização: prefere arquivos binários float32 (.npz) quando disponíveis
    para evitar parse de CSV pesado, especialmente em Pyodide/mobile.

    Retorna:
      - malha_full: MalhaBusca (full-resolution)
      - malha_coarse: MalhaBusca (coarse)
      - temp_ref_df, temp_col (mantidos para compatibilidade)
    """
    base_dir = Path(base_dir)

    # 1) Malha full
    npz_full = base_dir / MALHA_FILENAME_NPZ
    csv_full = base_dir / MALHA_FILENAME

    if npz_full.exists():
        d = np.load(npz_full)
        w = d["w"].astype(np.float32)
        z = d["z"].astype(np.float32)
        mu = d["mu"].astype(np.float32)
        malha_full = MalhaBusca.from_arrays(w, z, mu)
    else:
        if not csv_full.exists():
            raise RuntimeError(
                f"Arquivo de malha não encontrado: {csv_full}. Coloque {MALHA_FILENAME_NPZ} ou {MALHA_FILENAME} em {base_dir}."
            )
        header, cols = read_csv_table(csv_full)
        malha_df = {k: v for k,v in cols.items()}
        if "w_alcool" not in malha_df.columns:
            raise RuntimeError("A malha não contém a coluna 'w_alcool'.")
        visc_cols = [c for c in malha_df.columns if c.startswith("mu_zmet_")]
        if not visc_cols:
            raise RuntimeError("A malha não contém colunas do tipo 'mu_zmet_*'.")
        malha_full = MalhaBusca(malha_df)

    # 2) Malha coarse (opcional)
    npz_coarse = base_dir / MALHA_COARSE_NPZ
    malha_coarse = None
    if npz_coarse.exists():
        d = np.load(npz_coarse)
        w = d["w"].astype(np.float32)
        z = d["z"].astype(np.float32)
        mu = d["mu"].astype(np.float32)
        malha_coarse = MalhaBusca.from_arrays(w, z, mu)

    # Referência de temperatura (mantida como CSV leve)
    temp_ref_path = base_dir / "temperatura_referencia_v2.csv"
    if temp_ref_path.exists():
        htr, ctr = read_csv_table(temp_ref_path)
        temp_ref_df = {k: v for k,v in ctr.items()}
        temp_col = None
    else:
        temp_ref_df, temp_col = None, None

    return malha_full, malha_coarse, temp_ref_df, temp_col


def compute_mu_abs(hm_cm: float, t_s: float, delta_v_uL: float, rho: float = 997.0) -> float:
    """Calcula viscosidade absoluta (mPa·s / cP) usando a mesma fórmula do Excel."""
    r = 0.0002065  # raio interno (m)
    g = 9.81
    L = 0.025

    mu = 1000.0 * math.pi * (r ** 4) * rho * g * (hm_cm / 100.0) * t_s
    mu /= (8.0 * L * (delta_v_uL * 1e-6))
    return float(mu)


class MalhaBusca:
    """Estrutura otimizada para buscar o valor mais próximo na malha."""

    def __init__(self, malha_df: object):
        self.w_alcool_values = malha_df["w_alcool"].astype(float)

        visc_cols = [c for c in malha_df.columns if c.startswith("mu_zmet_")]

        def _z_from_col(c: str) -> float:
            return float(c.replace("mu_zmet_", ""))

        visc_cols = sorted(visc_cols, key=_z_from_col)

        self.visc_cols = visc_cols
        self.zmet_values = np.array([_z_from_col(c) for c in visc_cols], dtype=float)

        self.visc_array = malha_df[self.visc_cols].astype(float)

    @classmethod
    def from_arrays(cls, w_alcool_values: np.ndarray, zmet_values: np.ndarray, visc_array: np.ndarray) -> "MalhaBusca":
        obj = cls.__new__(cls)
        obj.w_alcool_values = np.asarray(w_alcool_values, dtype=float)
        obj.zmet_values = np.asarray(zmet_values, dtype=float)
        obj.visc_array = np.asarray(visc_array, dtype=float)
        return obj

    def w_to_idx(self, w: float) -> int:
        w = float(np.clip(w, 0.0, 1.0))
        idx = int(round(w * 1000.0))
        return int(np.clip(idx, 0, len(self.w_alcool_values) - 1))

    def z_to_idx(self, z: float) -> int:
        z = float(np.clip(z, float(self.zmet_values.min()), float(self.zmet_values.max())))
        idx = int(round(z * 1000.0))  # Nova malha começa em z=0.000 (removido -1)
        return int(np.clip(idx, 0, len(self.zmet_values) - 1))

    def idx_to_w(self, idx: int) -> float:
        return float(self.w_alcool_values[int(np.clip(idx, 0, len(self.w_alcool_values) - 1))])

    def idx_to_z(self, idx: int) -> float:
        return float(self.zmet_values[int(np.clip(idx, 0, len(self.zmet_values) - 1))])

    def mu_at(self, w_idx: int, z_idx: int) -> float:
        return float(self.visc_array[int(w_idx), int(z_idx)])

    def _w_range_idx(self, w_input: float) -> Tuple[int, int]:
        w_lower = max(0.0, w_input - 0.025)
        w_upper = min(1.0, w_input + 0.025)
        return self.w_to_idx(w_lower), self.w_to_idx(w_upper)

    def find_best_composition(self, target_mu: float, w_alcool_est: float):
        """Busca melhor (w,z) com range absoluto ±0.025 (sem expansão)."""
        def _range_idx(w_input: float, pct: float) -> Tuple[int, int]:
            w_lower = max(0.0, w_input - pct)
            w_upper = min(1.0, w_input + pct)
            lo_i, hi_i = self.w_to_idx(w_lower), self.w_to_idx(w_upper)
            return (lo_i, hi_i) if lo_i <= hi_i else (hi_i, lo_i)

        def _argmin_on_window(lo: int, hi: int) -> Tuple[int, int, float]:
            idx_rows = np.arange(lo, hi + 1)
            sub = self.visc_array[idx_rows, :]
            diff = np.abs(sub - target_mu)
            flat_index = int(np.argmin(diff))
            sub_row, col = np.unravel_index(flat_index, diff.shape)
            global_row = int(idx_rows[sub_row])
            return global_row, int(col), float(diff[sub_row, col])

        # Busca direta em ±2.5%
        lo, hi = _range_idx(w_alcool_est, 0.025)
        wi, zi, _ = _argmin_on_window(lo, hi)

        mu_best = float(self.visc_array[wi, zi])
        w_alcool_best = float(self.w_alcool_values[wi])
        z_met_best = float(self.zmet_values[zi])

        return w_alcool_best, z_met_best, mu_best

    def best_on_binario(self, target_mu: float, w_input: float, which: str) -> Tuple[float, float, float]:
        """Melhor hipótese binária com range absoluto ±0.025 (sem expansão)."""
        def _range_idx(w0: float, pct: float) -> Tuple[int, int]:
            w_lower = max(0.0, w0 - pct)
            w_upper = min(1.0, w0 + pct)
            lo_i, hi_i = self.w_to_idx(w_lower), self.w_to_idx(w_upper)
            return (lo_i, hi_i) if lo_i <= hi_i else (hi_i, lo_i)

        def _argmin_w_on_z(lo: int, hi: int, z_idx: int) -> Tuple[int, float]:
            best_wi = lo
            best_d = float("inf")
            for wi in range(lo, hi + 1):
                d = abs(self.mu_at(wi, z_idx) - target_mu)
                if d < best_d:
                    best_d = d
                    best_wi = wi
            return best_wi, best_d

        if which.lower() == "etoh":
            z_idx = self.z_to_idx(float(self.zmet_values.min()))
        elif which.lower() == "meoh":
            z_idx = self.z_to_idx(1.0)
        else:
            raise ValueError("which deve ser 'etoh' ou 'meoh'.")

        lo, hi = _range_idx(w_input, 0.025)
        wi, _ = _argmin_w_on_z(lo, hi, z_idx)

        return self.idx_to_w(wi), self.idx_to_z(z_idx), self.mu_at(wi, z_idx)

    def best_on_z_fixed(self, target_mu: float, w_input: float, z: float) -> Tuple[float, float, float]:
        lo, hi = self._w_range_idx(w_input)
        z_idx = self.z_to_idx(z)
        best = (None, None, float("inf"))
        for wi in range(min(lo, hi), max(lo, hi) + 1):
            mu = self.mu_at(wi, z_idx)
            d = abs(mu - target_mu)
            if d < best[2]:
                best = (wi, z_idx, d)
        wi, zi, _ = best
        return self.idx_to_w(wi), self.idx_to_z(zi), self.mu_at(wi, zi)

    def best_in_patch(self, target_mu: float, w0: float, z0: float, w_input: float, step: int = 2) -> Tuple[float, float, float]:
        w0_idx = self.w_to_idx(w0)
        z0_idx = self.z_to_idx(z0)

        w_lo, w_hi = self._w_range_idx(w_input)
        w_lo, w_hi = min(w_lo, w_hi), max(w_lo, w_hi)

        best = (None, None, float("inf"))
        for di in range(-step, step + 1):
            wi = int(np.clip(w0_idx + di, w_lo, w_hi))
            for dj in range(-step, step + 1):
                zj = int(np.clip(z0_idx + dj, 0, len(self.zmet_values) - 1))
                mu = self.mu_at(wi, zj)
                d = abs(mu - target_mu)
                if d < best[2]:
                    best = (wi, zj, d)
        wi, zi, _ = best
        return self.idx_to_w(wi), self.idx_to_z(zi), self.mu_at(wi, zi)

    def candidate_patch_ternario(self, w0: float, z0: float, w_input: float, step: int = 2) -> np.ndarray:
        w0_idx = self.w_to_idx(w0)
        z0_idx = self.z_to_idx(z0)
        w_lo, w_hi = self._w_range_idx(w_input)
        w_lo, w_hi = min(w_lo, w_hi), max(w_lo, w_hi)

        w_idxs = sorted({int(np.clip(w0_idx + di, w_lo, w_hi)) for di in range(-step, step + 1)})
        z_idxs = sorted({int(np.clip(z0_idx + dj, 0, len(self.zmet_values) - 1)) for dj in range(-step, step + 1)})

        mus = [self.mu_at(wi, zj) for wi in w_idxs for zj in z_idxs]
        return np.array(mus, dtype=float)


    def mu_bilinear(self, w_val: float, z_val: float) -> float:
        """Interpolação bilinear na malha (w,z). Assume eixos monotônicos."""
        w = float(np.clip(w_val, float(self.w_alcool_values.min()), float(self.w_alcool_values.max())))
        z = float(np.clip(z_val, float(self.zmet_values.min()), float(self.zmet_values.max())))

        i = int(np.searchsorted(self.w_alcool_values, w) - 1)
        j = int(np.searchsorted(self.zmet_values, z) - 1)
        i = int(np.clip(i, 0, len(self.w_alcool_values) - 2))
        j = int(np.clip(j, 0, len(self.zmet_values) - 2))

        w0 = float(self.w_alcool_values[i]); w1 = float(self.w_alcool_values[i+1])
        z0 = float(self.zmet_values[j]); z1 = float(self.zmet_values[j+1])

        # Pesos
        tw = 0.0 if w1 == w0 else (w - w0) / (w1 - w0)
        tz = 0.0 if z1 == z0 else (z - z0) / (z1 - z0)

        m00 = float(self.visc_array[i, j])
        m10 = float(self.visc_array[i+1, j])
        m01 = float(self.visc_array[i, j+1])
        m11 = float(self.visc_array[i+1, j+1])

        m0 = m00 * (1.0 - tw) + m10 * tw
        m1 = m01 * (1.0 - tw) + m11 * tw
        return float(m0 * (1.0 - tz) + m1 * tz)

    def find_best_composition_fast(self, target_mu: float, w_alcool_est: float, coarse: "MalhaBusca" = None):
        """Busca com coarse + refino local (bilinear) na malha full.

        - Usa coarse para encontrar ponto inicial rapidamente (útil em Monte Carlo)
        - Refina localmente na malha full por varredura bilinear em uma janela pequena
        """
        if coarse is None:
            return self.find_best_composition(target_mu, w_alcool_est)

        # 1) coarse
        w0, z0, _ = coarse.find_best_composition(target_mu, w_alcool_est)

        # 2) janela local no full
        wi0 = self.w_to_idx(w0)
        zj0 = self.z_to_idx(z0)

        w_lo_idx = int(np.clip(wi0 - 4, 0, len(self.w_alcool_values) - 2))
        w_hi_idx = int(np.clip(wi0 + 4, 0, len(self.w_alcool_values) - 2))
        z_lo_idx = int(np.clip(zj0 - 4, 0, len(self.zmet_values) - 2))
        z_hi_idx = int(np.clip(zj0 + 4, 0, len(self.zmet_values) - 2))

        w_lo = float(self.w_alcool_values[w_lo_idx]); w_hi = float(self.w_alcool_values[w_hi_idx+1])
        z_lo = float(self.zmet_values[z_lo_idx]); z_hi = float(self.zmet_values[z_hi_idx+1])

        # Varredura fina (bilinear) – 21x21 = 441 avaliações (barato)
        n = 21
        best = (None, None, None, float("inf"))
        for a in range(n):
            wv = w_lo + (w_hi - w_lo) * (a / (n - 1))
            for b in range(n):
                zv = z_lo + (z_hi - z_lo) * (b / (n - 1))
                muv = self.mu_bilinear(wv, zv)
                d = abs(muv - target_mu)
                if d < best[3]:
                    best = (wv, zv, muv, d)

        return float(best[0]), float(best[1]), float(best[2])
    def candidate_binario(self, w_input: float, which: str) -> np.ndarray:
        w_lo, w_hi = self._w_range_idx(w_input)
        w_lo, w_hi = min(w_lo, w_hi), max(w_lo, w_hi)

        if which.lower() == "etoh":
            z_idx = self.z_to_idx(float(self.zmet_values.min()))
        elif which.lower() == "meoh":
            z_idx = self.z_to_idx(1.0)
        else:
            raise ValueError("which deve ser 'etoh' ou 'meoh'.")

        return np.array([self.mu_at(wi, z_idx) for wi in range(w_lo, w_hi + 1)], dtype=float)

    def candidate_trace_minor(self, w_input: float, major: str, minor_values: List[float]) -> np.ndarray:
        w_lo, w_hi = self._w_range_idx(w_input)
        w_lo, w_hi = min(w_lo, w_hi), max(w_lo, w_hi)

        mus = []
        for wi in range(w_lo, w_hi + 1):
            w_total = self.idx_to_w(wi)
            if w_total <= 0:
                continue
            for w_minor in minor_values:
                if w_minor >= w_total:
                    continue
                if major.lower() == "etoh":
                    z = w_minor / w_total
                elif major.lower() == "meoh":
                    z = 1.0 - (w_minor / w_total)
                else:
                    raise ValueError("major deve ser 'etoh' ou 'meoh'.")
                z_idx = self.z_to_idx(z)
                mus.append(self.mu_at(wi, z_idx))

        return np.array(mus, dtype=float) if mus else np.array([], dtype=float)

    def best_trace_minor(self, target_mu: float, w_input: float, major: str, minor_values: List[float]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        w_lo, w_hi = self._w_range_idx(w_input)
        w_lo, w_hi = min(w_lo, w_hi), max(w_lo, w_hi)

        best = (None, None, float("inf"), None)  # wi, zi, diff, mu
        for wi in range(w_lo, w_hi + 1):
            w_total = self.idx_to_w(wi)
            if w_total <= 0:
                continue
            for w_minor in minor_values:
                if w_minor >= w_total:
                    continue
                if major.lower() == "etoh":
                    z = w_minor / w_total
                elif major.lower() == "meoh":
                    z = 1.0 - (w_minor / w_total)
                else:
                    raise ValueError("major deve ser 'etoh' ou 'meoh'.")
                zi = self.z_to_idx(z)
                mu = self.mu_at(wi, zi)
                d = abs(mu - target_mu)
                if d < best[2]:
                    best = (wi, zi, d, mu)
        if best[0] is None:
            return None, None, None
        wi, zi, _, mu = best
        return self.idx_to_w(wi), self.idx_to_z(zi), float(mu)


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def _classificar_por_z(z: float) -> str:
    if z <= 0.0015:
        return "bin_etoh"
    if z >= 0.9995:
        return "bin_meoh"
    return "ternario"


def _fmt_comp(w: float, et: float, met: float, agua: Optional[float] = None) -> str:
    # saída em % com 1 decimal, padronizada com os 2.5 termos
    return f"w{w*100:.1f} et{et*100:.1f} met{met*100:.1f}"


def _one_sample_test(mu_mean: float, mu_ref: float, sd: float, n: int, alpha: float = ALPHA_MEDIA) -> Dict[str, object]:
    """Teste de comparação de média contra valor de referência (malha).

    - Se n>=2: usa t-teste de 1 amostra (bicaudal)
    - Se n==1: usa aproximação normal com sd default (pedido)
    Retorna:
      t_or_z, p_value, significativo (p<alpha), diferenca (mu_mean - mu_ref)
    """
    n = int(max(1, n))
    sd = float(sd)
    if n == 1:
        sd = SD_DEFAULT_N1 if sd <= 0 else sd
        se = max(SE_MIN_ABS, sd)
        z = (mu_mean - mu_ref) / se
        p = 2.0 * (1.0 - stats.norm.cdf(abs(z)))
        return {"stat": float(z), "p_value": float(p), "significativo": bool(p < alpha), "diff": float(mu_mean - mu_ref), "tipo": "z"}
    else:
        sd = SD_DEFAULT_N1 if sd <= 0 else sd
        se = max(SE_MIN_ABS, sd / math.sqrt(n))
        t = (mu_mean - mu_ref) / se
        df = n - 1
        p = 2.0 * (1.0 - stats.t.cdf(abs(t), df=df))
        return {"stat": float(t), "p_value": float(p), "significativo": bool(p < alpha), "diff": float(mu_mean - mu_ref), "tipo": "t"}


# ---------------------------------------------------------------------
# Pipeline principal (por linha)
# ---------------------------------------------------------------------

def process_dataframe(rows: List[Dict[str, object]], malha_full, malha_coarse=None, temp_ref_df=None, temp_col=None) -> List[Dict[str, object]]:
    """Processa a lista de linhas (dicts) e devolve lista de resultados (sem estatística), sem pandas."""
    # shallow-copy rows
    out_rows: List[Dict[str, object]] = [dict(r) for r in rows]

    # vetorizado
    hm = np.array([float(r.get("hm")) for r in out_rows], dtype=float)
    delta_v = np.array([float(r.get("delta_v")) for r in out_rows], dtype=float)
    t_agua = np.array([float(r.get("t_agua")) for r in out_rows], dtype=float)
    t_amostra = np.array([float(r.get("t_amostra")) for r in out_rows], dtype=float)

    r0 = 0.0002065
    rho = 1000.0
    g = 9.81
    L = 0.025
    k = (1000.0 * math.pi * (r0 ** 4) * rho * g) / (8.0 * L)

    mu_agua_abs = k * (hm / 100.0) * t_agua / (delta_v * 1e-6)
    mu_amostra_abs = k * (hm / 100.0) * t_amostra / (delta_v * 1e-6)

    mu20 = _interp_water_mu(temp_ref_df, 20.0)
    mu20 = 0.61453 if mu20 is None else float(mu20)

    mu_ratio = np.where(mu_agua_abs != 0.0, (mu_amostra_abs / mu_agua_abs), np.nan)
    mu_amostra_abs_corr = mu_ratio * mu20

    malha = malha_full if isinstance(malha_full, MalhaBusca) else MalhaBusca(malha_full)

    w_best_arr = np.zeros(len(out_rows), dtype=float)
    z_best_arr = np.zeros(len(out_rows), dtype=float)
    mu_best_arr = np.zeros(len(out_rows), dtype=float)

    for i, row in enumerate(out_rows):
        try:
            t_agua_row = float(row.get("temp_agua", row.get("waterTemperature", float("nan"))))
        except Exception:
            t_agua_row = float("nan")
        mu_w_t = _interp_water_mu(temp_ref_df, t_agua_row) if np.isfinite(t_agua_row) else None
        if mu_w_t is not None:
            row["mu_agua_ref"] = float(mu_w_t)
            row["mu_agua_ref_20"] = float(mu20)
            row["mu_temp_corr_factor"] = float(mu20 / mu_w_t) if float(mu_w_t) != 0.0 else float("nan")
            if np.isfinite(mu_ratio[i]):
                row["mu_amostra_est_temp"] = float(mu_ratio[i] * float(mu_w_t))

        row["mu_agua_abs"] = float(mu_agua_abs[i])
        row["mu_amostra_abs"] = float(mu_amostra_abs[i])
        row["mu_amostra_abs_corr"] = float(mu_amostra_abs_corr[i])

        w_est = float(row.get("w_alcool"))
        mu_target = float(row["mu_amostra_abs_corr"])
        wb, zb, mub = malha.find_best_composition(mu_target, w_est)
        if wb == 0.0:
            zb = 0.028
        w_best_arr[i] = wb
        z_best_arr[i] = zb
        mu_best_arr[i] = mub

    for i, row in enumerate(out_rows):
        row["w_alcool_best"] = float(w_best_arr[i])
        row["z_met_best"] = float(z_best_arr[i])
        row["mu_malha_best"] = float(mu_best_arr[i])

        row["met_est_frac"] = float(row["w_alcool_best"] * row["z_met_best"])
        row["et_est"] = float(row["w_alcool_best"] * (1.0 - row["z_met_best"]))
        row["agua_est"] = float(1.0 - row["w_alcool_best"])
        row["met_est"] = float(row["met_est_frac"])
        row["w_alcool_est"] = float(row["et_est"] + row["met_est_frac"])

        row["erro_mu_malha"] = float(row["mu_amostra_abs_corr"] - row["mu_malha_best"])
        row["classe_best"] = _classificar_por_z(float(row["z_met_best"]))

    return out_rows


# ---------------------------------------------------------------------
# Repetições e estatística (apenas na aba 'repeticoes')
# ---------------------------------------------------------------------

def _build_mean_inputs(rows: List[Dict[str, object]]) -> List[Dict[str, object]]:
    if not rows:
        return []
    if "amostra" not in rows[0]:
        raise ValueError("Coluna 'amostra' é obrigatória para cálculo de repetições.")

    special_first = {"w_agua_est", "w_et_est", "w_met_est"}

    # infer numeric columns: values are int/float for all non-null rows
    cols = list(rows[0].keys())
    numeric_cols: List[str] = []
    for c in cols:
        if c == "amostra" or c in special_first:
            continue
        ok = True
        for r in rows:
            v = r.get(c, None)
            if v is None or (isinstance(v, float) and np.isnan(v)):
                continue
            if not isinstance(v, (int, float, np.number)):
                ok = False
                break
        if ok:
            numeric_cols.append(c)
    non_numeric_cols = [c for c in cols if c != "amostra" and c not in numeric_cols]

    grouped: Dict[str, List[Dict[str, object]]] = {}
    for r in rows:
        key = str(r.get("amostra", ""))
        grouped.setdefault(key, []).append(r)

    out: List[Dict[str, object]] = []
    for key, grp in [(k, grouped[k]) for k in sorted(grouped.keys())]:
        rec: Dict[str, object] = {"amostra": key}
        for c in numeric_cols:
            vals=[]
            for r in grp:
                v=r.get(c, None)
                if v is None:
                    continue
                try:
                    vals.append(float(v))
                except Exception:
                    pass
            rec[c] = float(np.mean(vals)) if vals else float("nan")
        for c in non_numeric_cols:
            rec[c] = grp[0].get(c, None)
        out.append(rec)
    return out



def process_repeticoes(rows: List[Dict[str, object]], malha_full, malha_coarse=None, temp_ref_df=None, temp_col=None) -> List[Dict[str, object]]:
    mean_rows = _build_mean_inputs(rows)
    return process_dataframe(mean_rows, malha_full, malha_coarse=malha_coarse, temp_ref_df=temp_ref_df, temp_col=temp_col)



def adicionar_estatistica_por_amostra(
    df_linhas: List[Dict[str, object]],
    df_repeticoes_processado: List[Dict[str, object]],
    malha_df,
    mc_n: int = MC_N_DEFAULT,
) -> List[Dict[str, object]]:
    """Calcula estatística por amostra e devolve lista de repetições com colunas extras (sem pandas)."""
    malha = malha_df if isinstance(malha_df, MalhaBusca) else MalhaBusca(malha_df)

    # stats por amostra a partir das linhas
    grp: Dict[str, List[float]] = {}
    extras: Dict[str, Dict[str, int]] = {}  # CORRECAO: declaracao de extras
    for r in df_linhas:
        key=str(r.get("amostra",""))
        grp.setdefault(key, []).append(float(r.get("mu_amostra_abs_corr")))
        ne_v = int(float(r.get("n_extra_video_sample", 0) or 0))
        ne_m = int(float(r.get("n_extra_manual_sample", 0) or 0))
        if key not in extras:
            extras[key] = {"video": ne_v, "manual": ne_m}
        else:
            extras[key]["video"] = max(extras[key]["video"], ne_v)
            extras[key]["manual"] = max(extras[key]["manual"], ne_m)
    stats_map: Dict[str, Dict[str, object]] = {}
    for k, vals in grp.items():
        arr=np.asarray(vals, dtype=float)
        n=int(arr.size)
        mean=float(np.mean(arr)) if n else float("nan")
        std=float(np.std(arr, ddof=1)) if n>1 else 0.0
        mu_corr_se = float(max(SE_MIN_ABS, (std / math.sqrt(n)))) if n>1 else float(SD_DEFAULT_N1)
        stats_map[k]={"n_reps": n, "mu_corr_mean": mean, "mu_corr_std": std, "mu_corr_se": mu_corr_se}

    out=[]
    for r in df_repeticoes_processado:
        rec=dict(r)
        key=str(rec.get("amostra",""))
        rec.update(stats_map.get(key, {"n_reps": 1, "mu_corr_mean": float(rec.get("mu_amostra_abs_corr", float('nan'))), "mu_corr_std": 0.0, "mu_corr_se": float(SD_DEFAULT_N1)}))

        # n efetivo para o teste de média: leva em conta tempos adicionais e extras informados.
        base_n = int(rec.get("n_reps", 1) or 1)
        rep_n = _count_rep_values(rec.get("t_amostra_rep", None))
        extras_k = extras.get(key, {"video": 0, "manual": 0})
        extra_v = int(extras_k.get("video", 0) or 0)
        extra_m = int(extras_k.get("manual", 0) or 0)
        n_eff = max(base_n, 1 + rep_n, 1 + extra_v + extra_m)
        rec["n_eff"] = int(n_eff)

        add=_avaliar_amostra(rec, df_linhas, malha, mc_n)
        rec.update(add)
        out.append(rec)
    return out




# ---------------------------------------------------------------------
# Utilidades para pós-processamento (classe_final textual, equivalentes, compatibilidade)
# ---------------------------------------------------------------------
def _safe_float(x) -> Optional[float]:
    try:
        if x is None or (isinstance(x, float) and np.isnan(x)):
            return None
        s = str(x).strip()
        if s == "" or s.lower() in {"nan", "none"}:
            return None
        return float(s)
    except Exception:
        return None


def _parse_melhores_condicoes(melhores_cond: object) -> Dict[str, Dict[str, float]]:
    """Parseia a string 'melhores_condicoes' e devolve um dict por tipo.
    Esperado formato aproximado:
        'ternario:w57.4 et34.0 met23.4 | bin_etoh:w98.0 et98.0 met0.0 | ...'
    Onde w = w_alcool(%), et/met = teores (%).
    """
    out: Dict[str, Dict[str, float]] = {}
    if melhores_cond is None or (isinstance(melhores_cond, float) and np.isnan(melhores_cond)):
        return out
    txt = str(melhores_cond).strip()
    if not txt:
        return out

    parts = [p.strip() for p in txt.split("|") if p.strip()]
    for p in parts:
        # tipo:...
        m = re.match(r"^([a-zA-Z_]+)\s*:\s*(.*)$", p)
        if not m:
            continue
        kind = m.group(1).strip()
        rest = m.group(2)

        mw = re.search(r"\bw\s*([0-9]+(?:\.[0-9]+)?)", rest)
        met = re.search(r"\bmet\s*([0-9]+(?:\.[0-9]+)?)", rest)
        et = re.search(r"\bet\s*([0-9]+(?:\.[0-9]+)?)", rest)

        w = float(mw.group(1)) if mw else None
        etv = float(et.group(1)) if et else 0.0
        metv = float(met.group(1)) if met else 0.0

        # Ajuste: valores residuais 0.1% contam como ausência (0.0)
        if abs(etv) <= 0.1:
            etv = 0.0
        if abs(metv) <= 0.1:
            metv = 0.0

        if w is None:
            w = etv + metv
        else:
            # recomputa w coerente se necessário
            w = etv + metv if (etv + metv) > 0 else w

        agua = max(0.0, 100.0 - w)

        out[kind] = {"agua": float(agua), "et": float(etv), "met": float(metv), "w": float(w)}
    return out


def _parse_teste_media(teste_media: object) -> Dict[str, int]:
    """Extrai 'sig' por tipo a partir de 'teste_media'.
    Ex: 'bin_etoh:p=0.766,sig=0 | bin_meoh:p=0.175,sig=1'
    """
    out: Dict[str, int] = {}
    if teste_media is None or (isinstance(teste_media, float) and np.isnan(teste_media)):
        return out
    txt = str(teste_media).strip()
    if not txt:
        return out
    parts = [p.strip() for p in txt.split("|") if p.strip()]
    for p in parts:
        m = re.match(r"^([a-zA-Z_]+)\s*:\s*.*?sig\s*=\s*([01])\b", p)
        if not m:
            continue
        out[m.group(1).strip()] = int(m.group(2))
    return out


def _format_composition_line(comp: Dict[str, float], pure_label: Optional[str] = None) -> str:
    if pure_label:
        return pure_label

    agua = comp.get("agua", 0.0)
    et = comp.get("et", 0.0)
    met = comp.get("met", 0.0)

    # Ajuste: quando um dos álcoois aparece apenas como traço (0.1%) em um resultado essencialmente binário,
    # remove o traço e incorpora esse 0.1% ao álcool majoritário para evitar listar um 'terceiro componente' artificial.
    trace_thr = 0.1000001  # em %
    if et > 0 and 0 < met <= trace_thr:
        et += met
        met = 0.0
    elif met > 0 and 0 < et <= trace_thr:
        met += et
        et = 0.0

    # Para evitar mostrar '0.0%' como constituinte presente (efeito de arredondamento),
    # zera valores muito pequenos (compatível com a saída em 1 casa decimal).
    eps = 0.05  # em % (meia unidade do arredondamento para 0.1%)
    if abs(et) < eps: et = 0.0
    if abs(met) < eps: met = 0.0

    def fmt(x: float) -> str:
        return f"{x:.1f}%"

    if et > 0 and met > 0:
        return f"Água {fmt(agua)}; etanol {fmt(et)}; e metanol {fmt(met)}."
    if et > 0:
        return f"Água {fmt(agua)}; etanol {fmt(et)}."
    if met > 0:
        return f"Água {fmt(agua)}; metanol {fmt(met)}."
    return f"Água {fmt(agua)}."


def _expected_present(agua_exp: Optional[float], et_exp: Optional[float], met_exp: Optional[float]) -> bool:
    return (agua_exp is not None) or (et_exp is not None) or (met_exp is not None)


def _normalize_expected_to_percent(agua_exp: Optional[float], et_exp: Optional[float], met_exp: Optional[float]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    """Normaliza valores esperados para percentuais.

    Aceita entradas em fração (0–1) ou em % (0–100). Heurística:
    - Se todos os valores informados estiverem <= 1.5, assume fração e multiplica por 100.
    - Caso contrário, assume que já estão em %.
    """
    vals = [v for v in [agua_exp, et_exp, met_exp] if v is not None]
    if not vals:
        return agua_exp, et_exp, met_exp
    if max(vals) <= 1.5:
        return (
            None if agua_exp is None else agua_exp * 100.0,
            None if et_exp is None else et_exp * 100.0,
            None if met_exp is None else met_exp * 100.0,
        )
    return agua_exp, et_exp, met_exp


def _distance_expected(comp: Dict[str, float], agua_exp, et_exp, met_exp) -> float:
    # Distância L1 (soma dos desvios absolutos) apenas nas dimensões informadas.
    d = 0.0
    if agua_exp is not None:
        d += abs(comp.get("agua", 0.0) - agua_exp)
    if et_exp is not None:
        d += abs(comp.get("et", 0.0) - et_exp)
    if met_exp is not None:
        d += abs(comp.get("met", 0.0) - met_exp)
    return float(d)


def _matches_expected(comp: Dict[str, float], agua_exp, et_exp, met_exp, tol: float = 2.5) -> bool:
    # coerência por tolerância absoluta (%)
    if agua_exp is not None and abs(comp.get("agua", 0.0) - agua_exp) > tol:
        return False
    if et_exp is not None and abs(comp.get("et", 0.0) - et_exp) > tol:
        return False
    if met_exp is not None and abs(comp.get("met", 0.0) - met_exp) > tol:
        return False
    return True


def _priority_no_expected(kind: str, pure: bool = False) -> int:
    if pure:
        return 0
    if kind == "bin_etoh":
        return 1
    if kind == "bin_meoh":
        return 2
    if kind == "ternario":
        return 2.5
    if kind == "trace":
        return 4
    return 5



def _infer_expected_kind(agua_exp: Optional[float], et_exp: Optional[float], met_exp: Optional[float], tol_zero: float = 2.5) -> str:
    if agua_exp is None and et_exp is None and met_exp is None:
        return ""
    a = 0.0 if agua_exp is None else float(agua_exp)
    e = 0.0 if et_exp is None else float(et_exp)
    m = 0.0 if met_exp is None else float(met_exp)

    if a >= 97.0:
        return "agua"
    if e >= 97.0:
        return "pure_etoh"
    if m >= 97.0:
        return "pure_meoh"

    if e <= tol_zero and m > tol_zero:
        return "bin_meoh"
    if m <= tol_zero and e > tol_zero:
        return "bin_etoh"

    if e > tol_zero and m > tol_zero:
        return "ternario"
    return ""


def _candidate_kind_tag(kind: str, pure_label: Optional[str]) -> str:
    if pure_label:
        low = pure_label.lower()
        if "etanol" in low:
            return "pure_etoh"
        if "metanol" in low:
            return "pure_meoh"
    return (kind or "").lower()
def _trace_label(main_alcohol: str) -> str:
    # main_alcohol: 'etanol' ou 'metanol'
    if main_alcohol == "etanol":
        return "ternário com presença de metanol em baixa concentração (≤ 5%)"
    return "ternário com presença de etanol em baixa concentração (≤ 5%)"


def _build_classe_final_text(
    classe_key: str,
    pT: float,
    pE: float,
    pM: float,
    pTrace: float,
    melhores_cond_map: Dict[str, Dict[str, float]],
) -> str:
    """
    Gera o texto de classe_final a partir de uma chave estruturada (sem depender do texto de 'conclusao').
    """
    ck = (classe_key or "").strip().lower()

    if ck == "agua":
        return "Compatible with water or dilute aqueous solution"

    if ck in {"bin_etoh", "bin_meoh"}:
        alc = "etanol" if ck == "bin_etoh" else "metanol"
        comp = melhores_cond_map.get(ck, {})
        w_frac = comp.get("w", None)
        if w_frac is None:
            etp = float(comp.get("et", 0.0))
            metp = float(comp.get("met", 0.0))
            w_frac = (etp + metp) / 100.0

        if float(w_frac) >= W_PURE_ALCOHOL:
            return f"Substância pura {alc} ou de teor elevado (> 98%)"
        return f"Binária água-{alc}"

    if ck == "ternario":
        return "Ternária água-etanol-metanol"

    if ck == "trace":
        main_alc = "etanol" if pE >= pM else "metanol"
        return _trace_label(main_alc)

    if ck == "inconclusivo":
        probs = {"ternario": pT, "bin_etoh": pE, "bin_meoh": pM, "trace": pTrace}
        top2 = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)[:2]
        a, b = top2[0][0], top2[1][0]

        main_alc = "etanol" if pE >= pM else "metanol"

        def map_kind(k: str) -> str:
            if k == "ternario":
                return "ternária água-etanol-metanol"
            if k == "bin_etoh":
                return "binária água-etanol"
            if k == "bin_meoh":
                return "binária água-metanol"
            if k == "trace":
                return _trace_label(main_alc)
            return k

        return f"Inconclusivo entre {map_kind(a)} e {map_kind(b)}"

    return "Inconclusivo"
def _avaliar_amostra(row: Dict[str, object], df_linhas: List[Dict[str, object]], malha: MalhaBusca, mc_n: int) -> Dict[str, object]:
    amostra = row["amostra"]

    # do melhor ponto (pela linha média)
    w_best = float(row["w_alcool_best"])
    z_best = float(row["z_met_best"])
    classe_best = str(row.get("classe_best", _classificar_por_z(z_best)))

    w_input = float(row["w_alcool"])
    et_est = float(row["et_est"])
    met_frac = float(row["met_est_frac"])
    agua_est = float(row["agua_est"])
    w_alcool_est = float(row["w_alcool_est"])

    # stats das repetições
    n = int(row.get("n_reps", 1))
    n_eff = int(row.get("n_eff", n) or n)
    n_eff = int(max(1, n_eff))
    mu_mean = float(row.get("mu_corr_mean", row.get("mu_amostra_abs_corr", np.nan)))
    mu_sd = float(row.get("mu_corr_std", 0.0))
    mu_se = float(row.get("mu_corr_se", SD_DEFAULT_N1))
    mu_se = max(SE_MIN_ABS, mu_se)

    # RNG determinístico por amostra/condição para evitar divergências entre
    # execuções (browser/desktop) e tornar resultados reprodutíveis.
    rng = np.random.RandomState(
        _stable_seed_32(
            "mc",
            amostra,
            mc_n,
            round(float(row.get("w_alcool", 0.0)), 9),
            round(float(row.get("w_alcool_best", 0.0)), 9),
            round(float(row.get("z_met_best", 0.0)), 9),
            round(float(mu_mean), 9),
            round(float(mu_se), 9),
            round(float(mu_sd), 9),
            int(row.get("n_reps", 1) or 1),
        )
    )
    # Valores esperados (podem vir vazios). Aceita fração (0-1) ou % (0-100).
    agua_exp = _safe_float(row.get("w_agua_est", None))
    et_exp = _safe_float(row.get("w_et_est", None))
    met_exp = _safe_float(row.get("w_met_est", None))

    # Regra especial (alinhada ao frontend otimizado):
    # Para "Other hydroalcoholic" quando o usuário informou o teor em "% m/m ou INPM",
    # a compatibilidade deve ser avaliada contra esse teor.
    # - Se o usuário informou etanol E metanol, divide o teor total proporcionalmente entre eles.
    # - Se informou apenas um álcool, assume o total como sendo daquele álcool (metanol esperado 0).
    bt = str(row.get("beverageType", "") or "").strip()
    mu_unit = str(row.get("measuredUnit", "") or "").lower()
    mv = _safe_float(row.get("measuredValue", None))
    if bt == "Other hydroalcoholic" and mv is not None and ("inpm" in mu_unit or "% m/m" in mu_unit):
        # teor total de álcool em % (pode vir em fração 0-1 ou % 0-100)
        total_pct = float(mv * 100.0) if mv <= 1.5 else float(mv)
        total_pct = float(np.clip(total_pct, 0.0, 100.0))

        et_in = _safe_float(row.get("labelEt", None))
        met_in = _safe_float(row.get("labelMet", None))
        et_in = 0.0 if et_in is None else float(et_in)
        met_in = 0.0 if met_in is None else float(met_in)
        denom = max(0.0, et_in) + max(0.0, met_in)

        if et_in > 0.0 and met_in > 0.0 and denom > 0.0:
            et_pct = float(total_pct * (et_in / denom))
            met_pct = float(total_pct * (met_in / denom))
        else:
            et_pct = float(total_pct)
            met_pct = 0.0

        agua_pct = float(np.clip(100.0 - (et_pct + met_pct), 0.0, 100.0))
        agua_exp, et_exp, met_exp = agua_pct, et_pct, met_pct

        row["w_agua_est"] = agua_pct / 100.0
        row["w_et_est"] = et_pct / 100.0
        row["w_met_est"] = met_pct / 100.0
    agua_exp, et_exp, met_exp = _normalize_expected_to_percent(agua_exp, et_exp, met_exp)
    has_expected = _expected_present(agua_exp, et_exp, met_exp)


    # ------------------------------------------------------------
    # Conclusões rápidas: água / puros
    # ------------------------------------------------------------
    if (w_alcool_est <= W_AQUOSO_DILUIDO) or (agua_est >= W_PURE_WATER):
        return {
            "classe_final": "Compatible with water or dilute aqueous solution",
            "equivalentes": "Água 100.0%.",
            "compativel": ("Compatible" if (has_expected and _matches_expected({"agua": 100.0, "et": 0.0, "met": 0.0}, agua_exp, et_exp, met_exp, tol=2.5)) else ("Incompatible" if has_expected else "")),
            "prob_ternario": 0.0,
            "prob_bin_etoh": 0.0,
            "prob_bin_meoh": 0.0,
            "prob_trace": 0.0,
            "conclusao": "Compatible with water or dilute aqueous solution",
            "seletividade": "muito baixa",
            "criterio_aplicado": "w_alcool_est <= 0.025 OU agua_est >= 0.97",
            "melhores_condicoes": "",
            "teste_media": "",
        }

    if et_est >= W_PURE_ALCOHOL:
        return {
            "classe_final": "Substância pura etanol ou de teor elevado (> 98%)",
            "equivalentes": "Etanol puro ou de teor elevado (> 98%).",
            "compativel": ("Compatible" if (has_expected and _matches_expected({"agua": 0.0, "et": 100.0, "met": 0.0}, agua_exp, et_exp, met_exp, tol=2.5)) else ("Incompatible" if has_expected else "")),
            "prob_ternario": 0.0,
            "prob_bin_etoh": 0.0,
            "prob_bin_meoh": 0.0,
            "prob_trace": 0.0,
            "conclusao": "Compatible with pure Ethanol or high content (> 98%)",
            "seletividade": "alta",
            "criterio_aplicado": "et_est >= 0.98",
            "melhores_condicoes": "",
            "teste_media": "",
        }

    if met_frac >= W_PURE_ALCOHOL:
        return {
            "classe_final": "Substância pura metanol ou de teor elevado (> 98%)",
            "equivalentes": "Metanol puro ou de teor elevado (> 98%).",
            "compativel": ("Compatible" if (has_expected and _matches_expected({"agua": 0.0, "et": 0.0, "met": 100.0}, agua_exp, et_exp, met_exp, tol=2.5)) else ("Incompatible" if has_expected else "")),
            "prob_ternario": 0.0,
            "prob_bin_etoh": 0.0,
            "prob_bin_meoh": 0.0,
            "prob_trace": 0.0,
            "conclusao": "Compatible with pure Methanol or high content (> 98%)",
            "seletividade": "alta",
            "criterio_aplicado": "met_est_frac >= 0.98",
            "melhores_condicoes": "",
            "teste_media": "",
        }

    # seletividade e cutoffs
    baixa = w_alcool_est <= W_LOW_SELECTIVITY
    p_cutoff = P_CUTOFF_LOW_SELECTIVITY if baixa else P_CUTOFF_HIGH_SELECTIVITY
    selet_txt = "baixa" if baixa else "alta"

    # Monte Carlo do valor observado
    mu_sims = rng.normal(loc=mu_mean, scale=mu_se, size=int(mc_n)).astype(float)

    sigma_total = float(math.sqrt(mu_se ** 2 + MALHA_SIGMA_DEFAULT ** 2))
    sigma_total = max(SE_MIN_ABS, sigma_total)

    # ------------------------------------------------------------
    # Monta hipóteses e salva "melhores por condição"
    # ------------------------------------------------------------
    hyp: Dict[str, np.ndarray] = {}
    best_mu: Dict[str, Tuple[Optional[float], Optional[float], Optional[float]]] = {}  # name -> (w,z,mu)
    testes = []
    testes_struct: List[Dict[str, object]] = []

    # helper para score
    def hyp_score(mu_cand: np.ndarray) -> np.ndarray:
        if mu_cand.size == 0:
            # penaliza
            return np.full(mu_sims.shape[0], 1e9, dtype=float)
        diff2 = (mu_sims[:, None] - mu_cand[None, :]) ** 2
        chi2 = diff2.min(axis=1) / (sigma_total ** 2)
        return chi2

    criterio = ""
    classe_final = classe_best

    # baixa seletividade: sempre calcula prob_trace (pedido)
    if baixa:
        # Candidatos principais T/E/M (dependendo do caso) + TRACE
        # TRACE: mistura com traço (0.01–0.05), testando traço em ambas direções
        minor_vals = [0.01, 0.02, 0.025, 0.04, 0.05]
        trace_etoh = malha.candidate_trace_minor(w_input, major="etoh", minor_values=minor_vals)
        trace_meoh = malha.candidate_trace_minor(w_input, major="meoh", minor_values=minor_vals)
        hyp["trace"] = np.concatenate([trace_etoh, trace_meoh]) if (trace_etoh.size or trace_meoh.size) else np.array([], dtype=float)

        # melhores "trace" (para relatório e teste de média): escolhe o melhor entre as duas direções
        wt1, zt1, mut1 = malha.best_trace_minor(mu_mean, w_input, major="etoh", minor_values=minor_vals)
        wt2, zt2, mut2 = malha.best_trace_minor(mu_mean, w_input, major="meoh", minor_values=minor_vals)
        # pega melhor diff
        trace_best = None
        if mut1 is not None:
            trace_best = (wt1, zt1, mut1, abs(mut1 - mu_mean))
        if mut2 is not None:
            cand = (wt2, zt2, mut2, abs(mut2 - mu_mean))
            if trace_best is None or cand[2.5] < trace_best[2.5]:
                trace_best = cand
        if trace_best is not None:
            best_mu["trace"] = (trace_best[0], trace_best[1], trace_best[2])

        # teste de média também para TRACE (para habilitar equivalência estatística do traço)
        if "trace" in best_mu and best_mu["trace"][2] is not None:
            t = _one_sample_test(mu_mean, best_mu["trace"][2], mu_sd, n_eff, alpha=ALPHA_MEDIA)
            testes.append(f"trace:p={t['p_value']:.5f},sig={int(t['significativo'])}")
            testes_struct.append({'kind': 'trace', 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})

        if classe_best == "ternario":
            criterio = "I-1 (w<=0.20, melhor=ternário): comparar T vs E vs M + TRACE"
            hyp["ternario"] = malha.candidate_patch_ternario(w_best, z_best, w_input, step=2)
            hyp["bin_etoh"] = malha.candidate_binario(w_input, "etoh")
            hyp["bin_meoh"] = malha.candidate_binario(w_input, "meoh")

            best_mu["ternario"] = malha.best_in_patch(mu_mean, w_best, z_best, w_input, step=2)
            best_mu["bin_etoh"] = malha.best_on_binario(mu_mean, w_input, "etoh")
            best_mu["bin_meoh"] = malha.best_on_binario(mu_mean, w_input, "meoh")

            # testes de média: comparar mu_mean contra mu dos binários
            for key in ["bin_etoh", "bin_meoh"]:
                if key in best_mu:
                    _, _, mu_ref = best_mu[key]
                    t = _one_sample_test(mu_mean, mu_ref, mu_sd, n_eff, alpha=ALPHA_MEDIA)
                    testes.append(f"{key}:p={t['p_value']:.5f},sig={int(t['significativo'])}")
                    testes_struct.append({'kind': key, 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})
        else:
            criterio = "I-2 (w<=0.20, melhor=binário): bin vencedor vs outro binário vs ternário (um passo dentro) + TRACE"
            hyp["bin_etoh"] = malha.candidate_binario(w_input, "etoh")
            hyp["bin_meoh"] = malha.candidate_binario(w_input, "meoh")

            best_mu["bin_etoh"] = malha.best_on_binario(mu_mean, w_input, "etoh")
            best_mu["bin_meoh"] = malha.best_on_binario(mu_mean, w_input, "meoh")

            # ternário "um passo dentro"
            z_inside = 0.01 if classe_best == "bin_etoh" else 0.99
            hyp["ternario"] = malha.candidate_patch_ternario(w_best, z_inside, w_input, step=2)
            best_mu["ternario"] = malha.best_in_patch(mu_mean, w_best, z_inside, w_input, step=2)

            # teste de média: comparar contra ternário interno e outro binário
            for key in ["ternario", "bin_etoh", "bin_meoh"]:
                if key in best_mu:
                    _, _, mu_ref = best_mu[key]
                    t = _one_sample_test(mu_mean, mu_ref, mu_sd, n_eff, alpha=ALPHA_MEDIA)
                    testes.append(f"{key}:p={t['p_value']:.5f},sig={int(t['significativo'])}")
                    testes_struct.append({'kind': key, 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})

    else:
        # Região alta seletividade
        # Gatilhos mantidos como você pediu:
        gatilho_31 = (classe_best == "ternario") and ((et_est <= 0.10) or (met_frac <= 0.10))
        gatilho_32 = (w_alcool_est > 0.20) and (
            (et_est > 0.15 and met_frac < 0.15) or (met_frac > 0.15 and et_est < 0.15)
        )

        if classe_best == "ternario" and (gatilho_31 or gatilho_32):
            criterio = "II-2.5 (w>0.20, ternário com minoritário baixo): comparar T vs binário dominante"
            hyp["ternario"] = malha.candidate_patch_ternario(w_best, z_best, w_input, step=2)
            best_mu["ternario"] = malha.best_in_patch(mu_mean, w_best, z_best, w_input, step=2)

            if et_est >= met_frac:
                hyp["bin_etoh"] = malha.candidate_binario(w_input, "etoh")
                best_mu["bin_etoh"] = malha.best_on_binario(mu_mean, w_input, "etoh")
                # teste de média contra binário dominante
                _, _, mu_ref = best_mu["bin_etoh"]
                t = _one_sample_test(mu_mean, mu_ref, mu_sd, n_eff, alpha=ALPHA_MEDIA)
                testes.append(f"bin_etoh:p={t['p_value']:.5f},sig={int(t['significativo'])}")
                testes_struct.append({'kind': 'bin_etoh', 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})
            else:
                hyp["bin_meoh"] = malha.candidate_binario(w_input, "meoh")
                best_mu["bin_meoh"] = malha.best_on_binario(mu_mean, w_input, "meoh")
                _, _, mu_ref = best_mu["bin_meoh"]
                t = _one_sample_test(mu_mean, mu_ref, mu_sd, n_eff, alpha=ALPHA_MEDIA)
                testes.append(f"bin_meoh:p={t['p_value']:.5f},sig={int(t['significativo'])}")
                testes_struct.append({'kind': 'bin_meoh', 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})

        elif classe_best != "ternario":
            criterio = "II-4 (w>0.20, melhor=binário): binário vs hipótese de traço (0.02–0.06)"
            hyp["bin_etoh"] = malha.candidate_binario(w_input, "etoh")
            hyp["bin_meoh"] = malha.candidate_binario(w_input, "meoh")
            best_mu["bin_etoh"] = malha.best_on_binario(mu_mean, w_input, "etoh")
            best_mu["bin_meoh"] = malha.best_on_binario(mu_mean, w_input, "meoh")

            minor_values = [0.02, 0.025, 0.04, 0.05, 0.06]
            if classe_best == "bin_etoh":
                hyp["trace"] = malha.candidate_trace_minor(w_input, major="etoh", minor_values=minor_values)
                best_mu["trace"] = malha.best_trace_minor(mu_mean, w_input, major="etoh", minor_values=minor_values)
                # comparação de média contra trace
                if best_mu["trace"][2] is not None:
                    t = _one_sample_test(mu_mean, best_mu["trace"][2], mu_sd, n_eff, alpha=ALPHA_MEDIA)
                    testes.append(f"trace:p={t['p_value']:.5f},sig={int(t['significativo'])}")
                    testes_struct.append({'kind': 'trace', 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})
            else:
                hyp["trace"] = malha.candidate_trace_minor(w_input, major="meoh", minor_values=minor_values)
                best_mu["trace"] = malha.best_trace_minor(mu_mean, w_input, major="meoh", minor_values=minor_values)
                if best_mu["trace"][2] is not None:
                    t = _one_sample_test(mu_mean, best_mu["trace"][2], mu_sd, n_eff, alpha=ALPHA_MEDIA)
                    testes.append(f"trace:p={t['p_value']:.5f},sig={int(t['significativo'])}")
                    testes_struct.append({'kind': 'trace', 'p_value': float(t['p_value']), 'sig': int(t['significativo'])})

        else:
            # ternário longe das bordas: sem necessidade de prob_trace (aqui o usuário não pediu)
            criterio = "II-2 (w>0.20, ternário longe das bordas): probabilidades gerais T/E/M"
            hyp["ternario"] = malha.candidate_patch_ternario(w_best, z_best, w_input, step=2)
            hyp["bin_etoh"] = malha.candidate_binario(w_input, "etoh")
            hyp["bin_meoh"] = malha.candidate_binario(w_input, "meoh")
            best_mu["ternario"] = malha.best_in_patch(mu_mean, w_best, z_best, w_input, step=2)
            best_mu["bin_etoh"] = malha.best_on_binario(mu_mean, w_input, "etoh")
            best_mu["bin_meoh"] = malha.best_on_binario(mu_mean, w_input, "meoh")

    # ------------------------------------------------------------
    # Monte Carlo: calcula probabilidades
    # ------------------------------------------------------------
    chi2_by = {}
    for name, cand in hyp.items():
        cand = np.asarray(cand, dtype=float)
        if MALHA_SIGMA_DEFAULT > 0 and cand.size:
            cand = cand + rng.normal(0.0, MALHA_SIGMA_DEFAULT, size=cand.shape)
        chi2_by[name] = hyp_score(cand)

    names = list(chi2_by.keys())
    if not names:
        return {
            "classe_final": classe_final,
            "prob_ternario": 0.0,
            "prob_bin_etoh": 0.0,
            "prob_bin_meoh": 0.0,
            "prob_trace": 0.0,
            "conclusao": "Inconclusivo",
            "seletividade": selet_txt,
            "criterio_aplicado": criterio,
            "melhores_condicoes": "",
            "teste_media": "",
        }

    mat = np.vstack([chi2_by[nm] for nm in names]).T
    winners = np.argmin(mat, axis=1)
    counts = np.bincount(winners, minlength=len(names)).astype(float)
    probs = counts / float(len(winners))
    prob_map = {names[i]: float(probs[i]) for i in range(len(names))}

    pT = float(prob_map.get("ternario", 0.0))
    pE = float(prob_map.get("bin_etoh", 0.0))
    pM = float(prob_map.get("bin_meoh", 0.0))
    pTrace = float(prob_map.get("trace", 0.0))

    # ------------------------------------------------------------
    # Conclusão textual (por probabilidades)
    # ------------------------------------------------------------
    conclusao = "Inconclusivo"
    if baixa:
        if pT >= p_cutoff:
            conclusao = "Provável mistura (etanol + metanol)"
            classe_final = "ternario"
        elif pE >= p_cutoff:
            conclusao = "Compatible with water-ethanol binary"
            classe_final = "bin_etoh"
        elif pM >= p_cutoff:
            conclusao = "Compatible with water-methanol binary"
            classe_final = "bin_meoh"
        elif pTrace >= p_cutoff:
            conclusao = "Possível traço (baixa seletividade)"
            classe_final = "trace"
        else:
            conclusao = "Inconclusivo (baixa seletividade em w_alcool <= 0.20)"
            classe_final = "inconclusivo"
    else:
        if "trace" in hyp:
            if pTrace >= p_cutoff:
                conclusao = "Possível traço do outro álcool (hipótese de traço vence)"
                classe_final = "trace"
            elif (classe_best == "bin_etoh" and pE >= p_cutoff) or (classe_best == "bin_meoh" and pM >= p_cutoff):
                conclusao = "Binário provável (resultado inicial confirmado)"
                classe_final = classe_best
            else:
                conclusao = "Inconclusivo (binário vs traço)"
                classe_final = "inconclusivo"
        else:
            if pT >= p_cutoff:
                conclusao = "Ternário provável"
                classe_final = "ternario"
            elif pE >= p_cutoff:
                conclusao = "Compatible with water-ethanol binary"
                classe_final = "bin_etoh"
            elif pM >= p_cutoff:
                conclusao = "Compatible with water-methanol binary"
                classe_final = "bin_meoh"
            else:
                conclusao = "Inconclusivo"
                classe_final = "inconclusivo"
    # ------------------------------------------------------------
    # Melhores resultados por condição (strings) + versão estruturada (sem parse de texto)
    # ------------------------------------------------------------
    parts = []
    melhores_struct: Dict[str, Dict[str, float]] = {}
    for key in ["ternario", "bin_etoh", "bin_meoh", "trace"]:
        if key in best_mu and best_mu[key][0] is not None:
            w, z, mu = best_mu[key]
            et = w * (1.0 - z)
            met = w * z
            melhores_struct[key] = {
                "agua": (1.0 - w) * 100.0,
                "et": et * 100.0,
                "met": met * 100.0,
                "w": float(w),
                "z": float(z),
            }
            parts.append(f"{key}:{_fmt_comp(w, et, met)}")
    melhores_cond = " | ".join(parts)

    # Resultado do teste de média (80%) – texto compacto
    teste_txt = " | ".join(testes)

    # -----------------------------------------------------------------
    # Complementações:
    #  - classe_final (textual)
    #  - equivalentes (composições estatisticamente equivalentes)
    #  - compativel (composição esperada vs equivalentes)
    #
    # Observação: usamos as versões estruturadas (melhores_struct / testes_struct),
    # evitando re-parse de texto ("melhores_condicoes"/"teste_media").
    # -----------------------------------------------------------------

    # fallback seguro: garante que a composição do vencedor exista
    if classe_final in {"ternario", "bin_etoh", "bin_meoh", "trace"} and classe_final not in melhores_struct:
        w_f = float(np.clip(w_best, 0.0, 1.0))
        z_f = float(np.clip(z_best, 0.0, 1.0))
        if classe_final == "bin_etoh":
            z_f = 0.0
        elif classe_final == "bin_meoh":
            z_f = 1.0
        et_f = w_f * (1.0 - z_f)
        met_f = w_f * z_f
        melhores_struct[classe_final] = {
            "agua": (1.0 - w_f) * 100.0,
            "et": et_f * 100.0,
            "met": met_f * 100.0,
            "w": w_f,
            "z": z_f,
        }

    classe_final_text = _build_classe_final_text(
        classe_key=classe_final,
        pT=pT,
        pE=pE,
        pM=pM,
        pTrace=pTrace,
        melhores_cond_map=melhores_struct,
    )

    
    # -----------------------------------------------------------
    # Pós-processamento (classe_final textual, equivalentes, compatibilidade)
    # -----------------------------------------------------------

    # Estrutura dos testes (derivada do texto, para evitar re-parsing em múltiplos pontos)
    # Mantém o texto original em "teste_media" inalterado.
    testes_struct = _parse_teste_media(teste_txt)

    # Kinds estatisticamente equivalentes (sig==0)
    equiv_kinds = {str(k) for k, sig in testes_struct.items() if int(sig) == 0}

    # SEMPRE inclui o vencedor (classe_final) se não for inconclusivo
    # Isso garante que a composição mais provável pelo Monte Carlo apareça nos equivalentes
    if classe_final in {"ternario", "bin_etoh", "bin_meoh", "trace"}:
        equiv_kinds.add(classe_final)

    # Garante que, em caso Inconclusivo, as duas hipóteses de maior probabilidade apareçam
    # em 'equivalentes' (independente dos sigs), além de quaisquer hipóteses estatisticamente equivalentes.
    probs = {"ternario": pT, "bin_etoh": pE, "bin_meoh": pM, "trace": pTrace}
    top2 = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)[:2]

    if classe_final == "inconclusivo":
        equiv_kinds.update([top2[0][0], top2[1][0]])

    # Se não sobrou nada (ex.: sem testes), usa o vencedor ou, por fim, o top2.
    if not equiv_kinds:
        if classe_final in {"ternario", "bin_etoh", "bin_meoh", "trace"}:
            equiv_kinds.add(classe_final)
        else:
            equiv_kinds.update([top2[0][0], top2[1][0]])

    # Constrói candidatos estruturados a partir das melhores condições já calculadas
    candidates = []
    
    # Fallback: garante que classe_final tenha entrada em melhores_struct
    if classe_final in {"ternario", "bin_etoh", "bin_meoh", "trace"} and classe_final not in melhores_struct:
        w_f = float(np.clip(w_best, 0.0, 1.0))
        z_f = float(np.clip(z_best, 0.0, 1.0))
        if classe_final == "bin_etoh":
            z_f = 0.0
        elif classe_final == "bin_meoh":
            z_f = 1.0
        et_f = w_f * (1.0 - z_f)
        met_f = w_f * z_f
        melhores_struct[classe_final] = {
            "agua": (1.0 - w_f) * 100.0,
            "et": et_f * 100.0,
            "met": met_f * 100.0,
            "w": w_f,
            "z": z_f,
        }
    # Se for inconclusivo e TRACE estiver entre as hipóteses, usa o mapeamento 95/5 descrito:
    # - Se o par é bin_etoh, o traço é de metanol (5%)
    # - Se o par é bin_meoh, o traço é de etanol (5%)
    # - Caso contrário, decide pelo "outro álcool" em relação ao binário dominante
    if classe_final == "inconclusivo" and "trace" in equiv_kinds:
        pair_kind = top2[0][0] if top2[0][0] != "trace" else top2[1][0]
        if pair_kind == "bin_etoh":
            melhores_struct["trace"] = {"agua": 95.0, "et": 0.0, "met": 5.0, "w": 0.05, "z": 1.0}
        elif pair_kind == "bin_meoh":
            melhores_struct["trace"] = {"agua": 95.0, "et": 5.0, "met": 0.0, "w": 0.05, "z": 0.0}
        else:
            other = "met" if pE >= pM else "et"
            if other == "met":
                melhores_struct["trace"] = {"agua": 95.0, "et": 0.0, "met": 5.0, "w": 0.05, "z": 1.0}
            else:
                melhores_struct["trace"] = {"agua": 95.0, "et": 5.0, "met": 0.0, "w": 0.05, "z": 0.0}
    for kind in sorted(equiv_kinds):
        comp = melhores_struct.get(kind)
        if not comp:
            continue

        # Normalizações: 0.1% -> 0.0% (ausente) e garantir água como complemento
        comp2 = {
            "agua": float(comp.get("agua", 0.0)),
            "et": float(comp.get("et", 0.0)),
            "met": float(comp.get("met", 0.0)),
            "w": float(comp.get("w", 0.0)),
            "z": float(comp.get("z", 0.0)),
        }
        if abs(comp2["et"] - 0.1) < 1e-9:
            comp2["et"] = 0.0
        if abs(comp2["met"] - 0.1) < 1e-9:
            comp2["met"] = 0.0
        # Recalcula água como complemento para coerência
        comp2["agua"] = max(0.0, 100.0 - comp2["et"] - comp2["met"])

        candidates.append((kind, {"agua": comp2["agua"], "et": comp2["et"], "met": comp2["met"]}, None))

        # Regra de "substância pura ou alto teor (>98%)" para binários
        if kind in {"bin_etoh", "bin_meoh"}:
            w_bin = float(comp.get("w", 0.0))
            if w_bin >= 0.977:
                if kind == "bin_etoh":
                    pure_label = "Etanol puro ou de teor elevado (> 98%)"
                    pure_comp = {"agua": 0.0, "et": 100.0, "met": 0.0}
                else:
                    pure_label = "Metanol puro ou de teor elevado (> 98%)"
                    pure_comp = {"agua": 0.0, "et": 0.0, "met": 100.0}
                candidates.append(("pure", pure_comp, pure_label))

    # Remove duplicatas por composição + label
    seen = set()
    uniq = []
    for kind, comp, pure_label in candidates:
        key = (round(comp.get("agua", 0.0), 1), round(comp.get("et", 0.0), 1), round(comp.get("met", 0.0), 1), pure_label or "")
        if key in seen:
            continue
        seen.add(key)
        uniq.append((kind, comp, pure_label))
    candidates = uniq

    # Ordenação
    if has_expected:
        # Ordena por:
        #  1) se esperado tem metanol ~0, prioriza menor metanol
        #  2) menor distância ao esperado
        #  2.5) prioridade por tipo
        met_exp_v = 0.0 if met_exp is None else float(met_exp)
        met_zero_like = met_exp_v <= 2.5

        def _sort_key(item):
            kind, comp, pure_label = item
            met_penalty = float(comp.get("met", 0.0)) if met_zero_like else 0.0
            dist = _distance_expected(comp, agua_exp, et_exp, met_exp)
            return (met_penalty, dist, _priority_no_expected(kind, pure=bool(pure_label)))

        candidates.sort(key=_sort_key)
    else:
        candidates.sort(key=lambda item: _priority_no_expected(item[0], pure=bool(item[2])))

    # Renderização final das composições equivalentes
    lines = []
    for kind, comp, pure_label in candidates:
        if pure_label:
            lines.append(pure_label + ".")
        else:
            lines.append(_format_composition_line(comp))
    equivalentes = "\n".join(lines).strip()

    # Compatibilidade com o esperado (tolerância ±2.5% já aplicado aqui)
    compativel = ""
    if has_expected:
        ok = any(_matches_expected(comp, agua_exp, et_exp, met_exp, tol=2.5) for _, comp, _ in candidates)
        compativel = "Compatible" if ok else "Incompatible"


    return {
        "classe_final": classe_final_text,
        "equivalentes": equivalentes,
        "compativel": compativel,
        "prob_ternario": pT,
        "prob_bin_etoh": pE,
        "prob_bin_meoh": pM,
        "prob_trace": pTrace,
        "conclusao": conclusao,
        "seletividade": selet_txt,
        "criterio_aplicado": criterio,
        "melhores_condicoes": melhores_cond,
        "teste_media": teste_txt,
    }
