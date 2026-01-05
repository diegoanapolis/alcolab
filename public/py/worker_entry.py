
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np

from utils_nopandas import read_csv_table
from fluxo1_w_alcool.src.app_w_alcool_v2 import (
    process_row,
    load_gl_density_table,
)
from fluxo2_analise_ternaria.processamento import (
    carregar_malha_e_referencia,
    process_dataframe,
    process_repeticoes,
    adicionar_estatistica_por_amostra,
)

def _load_density_mesh(path: Path) -> dict:
    header, cols = read_csv_table(path)
    return {"header": header, "cols": cols}

def run_fluxo1(rows: List[Dict[str, Any]], data_dir: Path) -> List[Dict[str, Any]]:
    data_dir = Path(data_dir)
    _, conv_cols = read_csv_table(data_dir / "conversao_vv_para_wE_20C.csv")
    dens_et = _load_density_mesh(data_dir / "DENS_R~1.CSV")
    dens_met = _load_density_mesh(data_dir / "DENS_R~2.CSV")
    dens_gl = load_gl_density_table(data_dir / "densidade_alcool_gl20a30.csv")
    dens_rel_bin_et = _load_density_mesh(data_dir / "dens_rel_bin_H2O_EtOH.csv")

    out_rows=[]
    for r in rows:
        out_rows.append({**r, **process_row(r, conv_cols, dens_et, dens_met, dens_gl, dens_rel_bin_et)})
    return out_rows

def run_fluxo2(rows_fluxo1: List[Dict[str, Any]], base_dir_fluxo2: Path) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    malha_full, malha_coarse, temp_ref_df, temp_col = carregar_malha_e_referencia(base_dir_fluxo2)
    rows_resultados = process_dataframe(rows_fluxo1, malha_full, malha_coarse=malha_coarse, temp_ref_df=temp_ref_df, temp_col=temp_col)
    rows_repeticoes = process_repeticoes(rows_resultados, malha_full, malha_coarse=malha_coarse, temp_ref_df=temp_ref_df, temp_col=temp_col)
    rows_repeticoes = adicionar_estatistica_por_amostra(
        df_linhas=rows_resultados,
        df_repeticoes_processado=rows_repeticoes,
        malha_df=malha_full,
    )
    return rows_resultados, rows_repeticoes

def run_full_from_rows(rows: List[Dict[str, Any]], data_fluxo1: Path, base_dir_fluxo2: Path) -> Dict[str, Any]:
    rows_f1 = run_fluxo1(rows, data_fluxo1)
    rows_res, rows_rep = run_fluxo2(rows_f1, base_dir_fluxo2)
    cols_res = list(rows_res[0].keys()) if rows_res else []
    cols_rep = list(rows_rep[0].keys()) if rows_rep else []
    return {
        "resultados": rows_res,
        "repeticoes": rows_rep,
        "columns_resultados": cols_res,
        "columns_repeticoes": cols_rep,
    }
