/**
 * Lógica unificada do semáforo para AlcoLab
 * Usada tanto na lista de análises quanto na página de relatório
 */

export interface SemaphoreInput {
  beverageType?: string
  compativel?: string
  // Flags do processamento Python
  methanolAbove5InEquivalents?: boolean
  equivalentes?: string
  // Critérios de aprovação experimental
  sampleTimesCount: number
  waterTimesCount: number
  sampleCv?: number | null
  waterCv?: number | null
  // R² só se aplica quando há vídeos
  hasVideos: boolean
  r2SampleValues?: number[]
  r2WaterValues?: number[]
  // Viscosidade da água
  muAbsWater?: number | null
  waterViscosityRef?: number | null
  // Fonte dos dados (tempos manuais ou vídeo)
  isManualTimes: boolean
}

export interface SemaphoreResult {
  cor: 'green' | 'yellow' | 'red'
  texto: string
  experimentoAprovado: boolean
}

/**
 * Calcula o resultado do semáforo baseado nos critérios experimentais
 */
export function calculateSemaphore(input: SemaphoreInput): SemaphoreResult {
  const {
    beverageType,
    compativel,
    methanolAbove5InEquivalents,
    equivalentes,
    sampleTimesCount,
    waterTimesCount,
    sampleCv,
    waterCv,
    hasVideos,
    r2SampleValues = [],
    r2WaterValues = [],
    muAbsWater,
    waterViscosityRef,
    isManualTimes
  } = input

  // Verificar se há metanol alto nas equivalentes
  const eqHasMetanolAlto = (() => {
    if (typeof methanolAbove5InEquivalents === 'boolean') return methanolAbove5InEquivalents
    const ternEq = String(equivalentes ?? '').toLowerCase()
    const m = ternEq.match(/metanol\s+(\d+(?:[\.,]\d+)?)%/)
    if (!m) return false
    const v = Number(String(m[1]).replace(',', '.'))
    return isFinite(v) && v > 5
  })()

  // Critérios de aprovação experimental
  const repsOk = sampleTimesCount >= 2 && waterTimesCount >= 2
  const cvOk = (sampleCv == null || sampleCv <= 5) && (waterCv == null || waterCv <= 5)
  
  // R² só é avaliado quando há vídeos E NÃO há tempos manuais
  let r2Ok = true
  if (!isManualTimes && hasVideos) {
    r2Ok = r2SampleValues.every(v => v >= 0.99) && r2WaterValues.every(v => v >= 0.99)
  }
  
  // Viscosidade da água dentro de ±15% da referência
  let waterViscOk = true
  if (waterViscosityRef != null && muAbsWater != null && isFinite(muAbsWater)) {
    waterViscOk = muAbsWater >= waterViscosityRef * 0.85 && muAbsWater <= waterViscosityRef * 1.15
  }

  const experimentoAprovado = repsOk && cvOk && r2Ok && waterViscOk

  // Tipos de amostra
  const tipoMetanolComercial = beverageType === 'Metanol comercial'
  const tipoEtanolCombustivel = beverageType === 'Etanol combustível'
  const tipoBebida = beverageType && !tipoMetanolComercial && !tipoEtanolCombustivel

  // Lógica do semáforo
  if (tipoMetanolComercial || tipoEtanolCombustivel) {
    if (compativel === 'Compatível' && experimentoAprovado) {
      return {
        cor: 'green',
        texto: 'Compatibilidade entre rótulo e experimento',
        experimentoAprovado
      }
    }
    if (compativel === 'Incompatível' && experimentoAprovado) {
      return {
        cor: 'red',
        texto: 'Incompatível com o rótulo',
        experimentoAprovado
      }
    }
    return {
      cor: 'yellow',
      texto: 'Necessários mais dados experimentais',
      experimentoAprovado
    }
  }

  if (tipoBebida) {
    if (compativel === 'Incompatível' && eqHasMetanolAlto && experimentoAprovado) {
      return {
        cor: 'red',
        texto: 'Possível presença de metanol',
        experimentoAprovado
      }
    }
    if (compativel === 'Compatível' && experimentoAprovado) {
      return {
        cor: 'green',
        texto: 'Compatibilidade entre rótulo e experimento',
        experimentoAprovado
      }
    }
    return {
      cor: 'yellow',
      texto: 'Necessários mais dados experimentais',
      experimentoAprovado
    }
  }

  // Caso padrão
  return {
    cor: 'yellow',
    texto: 'Necessários mais dados experimentais',
    experimentoAprovado
  }
}

/**
 * Calcula o CV (coeficiente de variação) de uma lista de valores
 */
export function calculateCV(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number' && !isNaN(v))
  if (xs.length < 2) return null
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const variance = xs.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (xs.length - 1)
  const stdev = Math.sqrt(variance)
  if (!mean) return null
  return (stdev / mean) * 100
}
