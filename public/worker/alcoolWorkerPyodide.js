/*
Pyodide Web Worker that runs the SAME validated Python pipeline (Fluxo 1 + Fluxo 2)
inside the browser.
*/

let pyodide = null;
let readyPromise = null;

const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/";

function formatError(e) {
  try {
    if (!e) return 'Unknown error';
    if (typeof e === 'string') return e;
    if (e.message) return `${e.message}\n${e.stack || ''}`;
    if (e.type === 'PythonError') return e.message || String(e);
    return JSON.stringify(e, Object.getOwnPropertyNames(e));
  } catch (err) {
    return 'Error formatting error: ' + String(e);
  }
}

async function ensurePyodide() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    importScripts(PYODIDE_BASE_URL + "pyodide.js");
    pyodide = await loadPyodide({ indexURL: PYODIDE_BASE_URL });
    await pyodide.loadPackage(["numpy", "scipy"]);

    pyodide.FS.mkdirTree("/app/py");
    pyodide.FS.mkdirTree("/app/py/fluxo1_w_alcool/src");
    pyodide.FS.mkdirTree("/app/py/fluxo2_analise_ternaria");
    pyodide.FS.mkdirTree("/app/data/fluxo1");
    pyodide.FS.mkdirTree("/app/data/fluxo2");

    async function putFile(url, dst, binary = false) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Failed fetching ${url} -> ${r.status}`);
      const buf = binary ? new Uint8Array(await r.arrayBuffer()) : new TextEncoder().encode(await r.text());
      pyodide.FS.writeFile(dst, buf);
    }

    // Python source files
    await putFile("/py/utils_nopandas.py", "/app/py/utils_nopandas.py");
    await putFile("/py/worker_entry.py", "/app/py/worker_entry.py");
    await putFile("/py/fluxo1_w_alcool/src/app_w_alcool_v2.py", "/app/py/fluxo1_w_alcool/src/app_w_alcool_v2.py");
    await putFile("/py/fluxo2_analise_ternaria/processamento.py", "/app/py/fluxo2_analise_ternaria/processamento.py");
    await putFile("/py/fluxo2_analise_ternaria/main.py", "/app/py/fluxo2_analise_ternaria/main.py");

    // Data files fluxo1
    const f1 = ["conversao_vv_para_wE_20C.csv", "DENS_R~1.CSV", "DENS_R~2.CSV", "densidade_alcool_gl20a30.csv", "dens_rel_bin_H2O_EtOH.csv"];
    for (const name of f1) {
      await putFile(`/data/fluxo1/${name}`, `/app/data/fluxo1/${name}`);
    }

    // Data files fluxo2
    const f2 = ["malha_viscosidade_ajuste_bordas_f32.npz", "malha_viscosidade_ajuste_bordas_coarse251_f32.npz", "temperatura_referencia_v2.csv", "viscosidades_medianas.txt"];
    for (const name of f2) {
      const isBin = name.endsWith(".npz") || name.endsWith(".bin");
      await putFile(`/data/fluxo2/${name}`, `/app/data/fluxo2/${name}`, isBin);
    }

    pyodide.runPython(`
import sys
sys.path.insert(0, '/app/py')
sys.path.insert(0, '/app/py/fluxo1_w_alcool/src')
sys.path.insert(0, '/app/py/fluxo2_analise_ternaria')
`);

    return true;
  })();
  return readyPromise;
}

let warmupDone = false;

async function ensureWarmup() {
  try {
    await ensurePyodide();
    if (warmupDone) return;
    warmupDone = true;

    self.postMessage({ ok: true, type: "status", result: { stage: "warmup_python" }, warnings: [] });

    await pyodide.runPythonAsync(`
import numpy as np
from pathlib import Path

_state = np.random.get_state()
try:
    from app_w_alcool_v2 import load_gl_density_table
    from processamento import carregar_malha_e_referencia

    base1 = Path('/app/data/fluxo1')
    base2 = Path('/app/data/fluxo2')

    load_gl_density_table(base1 / 'densidade_alcool_gl20a30.csv')
    carregar_malha_e_referencia(base2)
finally:
    np.random.set_state(_state)
`);
  } catch (e) {
    throw new Error('Warmup failed: ' + formatError(e));
  }
}

async function runPython(rows) {
  await ensurePyodide();
  
  // Convert JS objects to Python dicts properly
  const rowsJson = JSON.stringify(rows);
  pyodide.globals.set("__ROWS_JSON__", rowsJson);

  const code = `
import json
from worker_entry import run_full_from_rows
from pathlib import Path

rows_json = __ROWS_JSON__
rows = json.loads(rows_json)
run_full_from_rows(rows, Path('/app/data/fluxo1'), Path('/app/data/fluxo2'))
`;

  const result = await pyodide.runPythonAsync(code);
  return result.toJs({ dict_converter: Object.fromEntries });
}

(async () => {
  try {
    self.postMessage({ ok: true, type: "status", result: { stage: "warmup_start" }, warnings: [] });
    await ensureWarmup();
    self.postMessage({ ok: true, type: "status", result: { stage: "warmup_ready" }, warnings: [] });
  } catch (e) {
    self.postMessage({ ok: false, type: "status", error: formatError(e) });
  }
})();

self.onmessage = async (e) => {
  const msg = e.data || {};
  const type = msg.type;

  try {
    if (type === "init") {
      await ensureWarmup();
      self.postMessage({ ok: true, type: "init", result: { ready: true }, warnings: [] });
      return;
    }

    if (type === "run") {
      self.postMessage({ ok: true, type: "status", result: { stage: "calc_start" }, warnings: [] });
      const rows = msg.rows;
      self.postMessage({ ok: true, type: "status", result: { stage: "running_python" }, warnings: [] });
      const out = await runPython(rows);
      self.postMessage({ ok: true, type: "status", result: { stage: "calc_done" }, warnings: [] });
      self.postMessage({ ok: true, type: "run", result: out, warnings: [] });
      return;
    }

    throw new Error(`Unknown message type: ${type}`);
  } catch (err) {
    self.postMessage({ ok: false, type, error: formatError(err) });
  }
};
