# PWA Álcool – Frontend integrado ao Worker Pyodide (v9 no-pandas + warmup)

## O que já vem pronto
- `/public/worker/alcoolWorkerPyodide.js` (Worker Pyodide com warmup preservando RNG)
- `/public/py/**` (pipeline Python Fluxo 1 + Fluxo 2 sem pandas)
- `/public/data/**` (malhas/tabelas)
- Integração no frontend:
  - `src/lib/alcoolWorkerClient.ts` (cliente singleton do Worker)
  - `src/components/ui/WorkerPreload.tsx` (preload no layout)
  - `src/app/resultados/page.tsx` (executa worker lendo `localStorage.frontend_export_rows`)

## Como funciona o fluxo
1. Página **/medir** monta uma `row` e salva em `localStorage.frontend_export_rows`
2. Navega para **/resultados**
3. **/resultados** chama o Worker com `{ type: "run", rows }`
4. Salva saídas:
   - `localStorage.lastOutputs` (objeto completo do worker)
   - `localStorage.lastResult` (objeto resumido para UI)

## Rodar localmente
```bash
npm install
npm run dev
```

> Obs.: o Worker baixa o Pyodide do CDN (jsdelivr). Se você quiser empacotar offline, dá para ajustar `PYODIDE_BASE_URL` no arquivo do worker.
