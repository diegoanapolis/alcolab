import { useEffect, useRef, useState } from "react";

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const loop = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      setElapsed(t - startRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  const start = () => { setElapsed(0); startRef.current = null; setRunning(true); };
  const stop = () => setRunning(false);
  const reset = () => { setRunning(false); setElapsed(0); startRef.current = null; };

  return { elapsed, running, start, stop, reset };
}

export function formatElapsed(ms: number) {
  const deciseconds = Math.floor(ms / 100);
  const secondsOneDecimal = (deciseconds / 10).toFixed(1);
  return secondsOneDecimal;
}
