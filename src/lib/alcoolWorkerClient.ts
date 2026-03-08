// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

"use client";

export type WorkerStatusStage =
  | "warmup_start"
  | "warmup_python"
  | "warmup_ready"
  | "calc_start"
  | "running_python"
  | "calc_done"
  | string;

export type WorkerStatusMessage = {
  ok: true;
  type: "status";
  result: { stage: WorkerStatusStage; detail?: any };
  warnings?: any[];
};

export type WorkerInitMessage = {
  ok: true;
  type: "init";
  result: { ready: true };
  warnings?: any[];
};

export type WorkerRunMessage = {
  ok: true;
  type: "run";
  result: {
    results: Record<string, any>[];
    repeticoes: Record<string, any>[];
    columns_results?: string[];
    columns_repeticoes?: string[];
  };
  warnings?: any[];
};

export type WorkerErrorMessage = {
  ok: false;
  type: string;
  error: string;
};

export type WorkerMessage =
  | WorkerStatusMessage
  | WorkerInitMessage
  | WorkerRunMessage
  | WorkerErrorMessage;

type StatusListener = (stage: WorkerStatusStage, msg: WorkerStatusMessage) => void;

let _worker: Worker | null = null;
let _initPromise: Promise<void> | null = null;
let _statusListeners: Set<StatusListener> = new Set();

function getWorker(): Worker {
  if (_worker) return _worker;
  // The worker script lives in /public/worker
  _worker = new Worker("/worker/alcoolWorkerPyodide.js");
  _worker.onmessage = (ev: MessageEvent<WorkerMessage>) => {
    const msg = ev.data;
    if (msg && (msg as any).ok === true && (msg as any).type === "status") {
      const sm = msg as WorkerStatusMessage;
      for (const fn of _statusListeners) {
        try {
          fn(sm.result.stage, sm);
        } catch {}
      }
    }
  };
  return _worker;
}

export function onWorkerStatus(listener: StatusListener) {
  _statusListeners.add(listener);
  return () => _statusListeners.delete(listener);
}

export async function initAlcoolWorker(): Promise<void> {
  if (_initPromise) return _initPromise;
  const w = getWorker();
  _initPromise = new Promise<void>((resolve, reject) => {
    const handler = (ev: MessageEvent<WorkerMessage>) => {
      const msg = ev.data;
      if (!msg) return;
      if ((msg as any).ok === true && (msg as any).type === "init") {
        w.removeEventListener("message", handler as any);
        resolve();
      }
      if ((msg as any).ok === false) {
        // If init fails, allow retry
        w.removeEventListener("message", handler as any);
        _initPromise = null;
        reject(new Error((msg as WorkerErrorMessage).error));
      }
    };
    w.addEventListener("message", handler as any);
    w.postMessage({ type: "init" });
  });
  return _initPromise;
}

export async function runAlcoolPipeline(rows: Record<string, any>[]): Promise<WorkerRunMessage["result"]> {
  await initAlcoolWorker();
  const w = getWorker();
  return new Promise((resolve, reject) => {
    const handler = (ev: MessageEvent<WorkerMessage>) => {
      const msg = ev.data;
      if (!msg) return;
      if ((msg as any).ok === true && (msg as any).type === "run") {
        w.removeEventListener("message", handler as any);
        resolve((msg as WorkerRunMessage).result);
      }
      if ((msg as any).ok === false) {
        w.removeEventListener("message", handler as any);
        reject(new Error((msg as WorkerErrorMessage).error));
      }
    };
    w.addEventListener("message", handler as any);
    w.postMessage({ type: "run", rows });
  });
}
