
from __future__ import annotations
import csv
from pathlib import Path
from typing import Dict, List, Tuple, Any
import numpy as np

def _to_float(x: Any) -> float:
    if x is None:
        return float("nan")
    if isinstance(x, (int, float, np.number)):
        return float(x)
    s = str(x).strip()
    if s == "" or s.lower() in {"nan", "none", "null"}:
        return float("nan")
    s = s.replace(",", ".")
    try:
        return float(s)
    except Exception:
        return float("nan")

def read_csv_table(path: Path) -> Tuple[List[str], Dict[str, np.ndarray]]:
    """Read a CSV with header into column arrays of float (non-numeric -> nan)."""
    with open(path, "r", encoding="utf-8", newline="") as f:
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=[",",";","\t"])
        except Exception:
            dialect = csv.get_dialect("excel")
        reader = csv.reader(f, dialect)
        rows = list(reader)

    if not rows:
        raise ValueError(f"Empty CSV: {path}")

    header = [str(h).strip() for h in rows[0]]
    cols: Dict[str, List[float]] = {h: [] for h in header}

    for r in rows[1:]:
        if not r or all(str(v).strip()=="" for v in r):
            continue
        if len(r) < len(header):
            r = list(r) + [""]*(len(header)-len(r))
        for h, v in zip(header, r[:len(header)]):
            cols[h].append(_to_float(v))

    out = {h: np.asarray(vals, dtype=float) for h, vals in cols.items()}
    return header, out

def write_xlsx_two_sheets(path: Path, sheet1_name: str, rows1: List[Dict[str, Any]],
                          sheet2_name: str, rows2: List[Dict[str, Any]]):
    """Lightweight XLSX writer using openpyxl (no pandas)."""
    from openpyxl import Workbook
    wb = Workbook()
    ws1 = wb.active
    ws1.title = sheet1_name

    def write_sheet(ws, rows):
        if not rows:
            return
        cols = list(rows[0].keys())
        ws.append(cols)
        for r in rows:
            ws.append([r.get(c, None) for c in cols])

    write_sheet(ws1, rows1)
    ws2 = wb.create_sheet(sheet2_name)
    write_sheet(ws2, rows2)
    wb.save(path)
