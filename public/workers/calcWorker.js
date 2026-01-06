/**
 * Worker para calcular regressão linear dos instantes de escoamento
 * e estimar o tempo total de escoamento de 18 mL a 14 mL (4 mL)
 */

function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }
  
  const denom = (n * sumX2 - sumX * sumX);
  if (Math.abs(denom) < 1e-10) return null;
  
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  
  // Calcular R²
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const p of points) {
    const yPred = slope * p.x + intercept;
    ssRes += (p.y - yPred) ** 2;
    ssTot += (p.y - yMean) ** 2;
  }
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 1;
  
  return { slope, intercept, r2 };
}

self.onmessage = function(e) {
  const { type, marks } = e.data;
  
  if (type !== "instantes") {
    self.postMessage({ ok: false, error: "Unknown type" });
    return;
  }
  
  try {
    // Converter marks (volume -> tempo) em pontos (x=volume, y=tempo)
    const points = [];
    const volumes = [18, 17, 16, 15, 14];
    
    for (const vol of volumes) {
      if (marks[vol] != null && typeof marks[vol] === 'number') {
        points.push({ x: vol, y: marks[vol] });
      }
    }
    
    if (points.length < 3) {
      self.postMessage({ ok: false, error: "Precisa de pelo menos 3 pontos" });
      return;
    }
    
    // Ordenar por volume (decrescente, 18 -> 14)
    points.sort((a, b) => b.x - a.x);
    
    // Regressão linear: tempo = slope * volume + intercept
    const reg = linearRegression(points);
    if (!reg) {
      self.postMessage({ ok: false, error: "Falha na regressão" });
      return;
    }
    
    // Estimar tempo de escoamento de 18 mL a 14 mL
    // tempo(18) = slope * 18 + intercept
    // tempo(14) = slope * 14 + intercept
    // delta = tempo(14) - tempo(18) = slope * (14 - 18) = slope * (-4)
    // Como o tempo aumenta quando o volume diminui, slope deve ser negativo
    const t18 = reg.slope * 18 + reg.intercept;
    const t14 = reg.slope * 14 + reg.intercept;
    const estimatedTime = t14 - t18;
    
    self.postMessage({
      ok: true,
      instantes: {
        points,
        slope: reg.slope,
        intercept: reg.intercept,
        r2: reg.r2,
        estimatedTime: Math.abs(estimatedTime)
      }
    });
  } catch (err) {
    self.postMessage({ ok: false, error: err.message || String(err) });
  }
};
