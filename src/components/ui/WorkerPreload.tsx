"use client";

import React from "react";
import { initAlcoolWorker } from "@/lib/alcoolWorkerClient";

/**
 * Preloads the Pyodide worker as early as possible to reduce first-run latency.
 * No UI on purpose.
 */
export default function WorkerPreload() {
  React.useEffect(() => {
    // Fire-and-forget; errors will be surfaced when running the pipeline.
    initAlcoolWorker().catch(() => {});
  }, []);
  return null;
}
