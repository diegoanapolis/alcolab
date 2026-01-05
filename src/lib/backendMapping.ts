export const ALIASES: Record<string, string> = {
  sampleName: "amostra",
  amostra: "amostra",
  beverageType: "beverageType",
  labelUnit: "labelUnit",
  labelAbv: "labelAbv",
  ethanolMassPercent: "labelEt",
  methanolMassPercent: "labelMet",
  method: "method",
  waterMass: "waterMass",
  sampleMass: "sampleMass",
  sampleTemperature: "sampleTemperature",
  waterTemperature: "waterTemperature",
  measuredUnit: "measuredUnit",
  measuredValue: "measuredValue",
  deltaV: "delta_v",
  hm: "hm",
  waterTimes: "t_agua_rep",
  sampleTimes: "t_amostra_rep",
  t_agua: "t_agua",
  t_amostra: "t_amostra",
  agua: "agua",
  et: "et",
  met: "met",
}

const toNumberSafe = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const s = v.trim()
    if (!s) return null
    const n = Number(s.replace(/\./g, (s.includes(",") && s.includes(".")) ? "" : ".").replace(/,/g, "."))
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function normalizeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  
  // Map all fields using aliases
  for (const [k0, v0] of Object.entries(row)) {
    const k = String(k0).trim()
    const key = ALIASES[k] ?? k
    out[key] = v0
  }
  
  // Set defaults
  if (!out["beverageType"]) out["beverageType"] = "Outra hidroalcoólica"
  if (out["delta_v"] == null || out["delta_v"] === "") out["delta_v"] = 4
  if (out["hm"] == null || out["hm"] === "") out["hm"] = 7
  
  // Ensure numeric fields are numbers
  const numKeys = ["labelAbv","labelEt","labelMet","waterMass","sampleMass","measuredValue","delta_v","hm","sampleTemperature","waterTemperature","t_agua","t_amostra"]
  for (const nk of numKeys) {
    const v = toNumberSafe(out[nk])
    if (v != null) out[nk] = v
  }

  // Normalize measuredUnit
  if (typeof out["measuredUnit"] === "string") {
    const mu = String(out["measuredUnit"]).toLowerCase()
    if (mu.includes("g/ml")) out["measuredUnit"] = "g/ml"
    else if (mu.includes("g/cm3") || mu.includes("g/cm³")) out["measuredUnit"] = "g/cm³"
  }
  
  return out
}
