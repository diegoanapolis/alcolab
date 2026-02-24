"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { runAlcoolPipeline } from "@/lib/alcoolWorkerClient"
import { normalizeRow } from "@/lib/backendMapping"
import { DatabaseService, ExperimentRun } from "@/lib/database"
import AnalysisListPage from "@/components/AnalysisListPage"
import { Download, FileText } from "lucide-react"

type ResultShape = {
  conditions?: {
    waterType?: string
    temperature?: number
    sampleTemperature?: number
    beverageType?: string
    labelAbv?: number
    labelUnit?: string
    brand?: string
    sampleName?: string
    conductivityConsidered?: number
    ethanolMassPercent?: number
    methanolMassPercent?: number
  }
  density?: {
    method?: string
    waterMass?: number
    sampleMass?: number
    measuredValue?: number
    measuredUnit?: string
    densityRel?: number
    cvWaterMass?: number
    cvSampleMass?: number
  }
  viscosity?: {
    viscosityRel?: number
    cvWaterTime?: number
    cvSampleTime?: number
    muAbsWater?: number
    muAbsSample?: number
  }
  adherence?: {
    rMuPercent?: number
    zScore?: number
  }
  labelCompat?: {
    status?: string
    reason?: string
  }
  methanol?: {
    screening?: string
  }
  observations?: string[]
  expectedComposition?: { agua?: number; et?: number; met?: number }
  composition?: { mm?: { agua: number; et: number; met: number }; vv?: { agua: number; et: number; met: number } }
  rawTimes?: { waterTimes?: number[]; sampleTimes?: number[] }
  equivalentes?: unknown
  classe_final?: string
  compativel?: string
  mostLikely?: string
  conclusao?: string
  seletividade?: string
  erroMuMalhaAbs?: number | null
  erroMuMalhaPct?: number | null
  approvals?: { status?: string; observation?: string; metrics?: any }
  flags?: { methanolAbove5InEquivalents?: boolean; lowSelectivity?: boolean; pureSubstanceDetected?: boolean }
  expectedText?: string
}

type TernariaOut = {
  equivalentes?: string
  classe_final?: string
  compativel?: string
}

export default function ResultadosPage() {
  const [result, setResult] = useState<ResultShape | null>(null)
  const [activeTab, setActiveTab] = useState<"Resultados" | "Dados experimentais">("Resultados")
  const [waterReplicates, setWaterReplicates] = useState<Array<{ previewUrl: string; fileName?: string; fileCreatedAt?: string; marks: Record<13|14|15|16|17|18, number|undefined> }>>([])
  const [sampleReplicates, setSampleReplicates] = useState<Array<{ previewUrl: string; fileName?: string; fileCreatedAt?: string; marks: Record<13|14|15|16|17|18, number|undefined> }>>([])
  const [tempRef, setTempRef] = useState<{ temperatura: number[]; viscosidade: number[] } | null>(null)
  const router = useRouter()

  // Se o wizard (/medir) tiver exportado linhas, roda o pipeline Pyodide e preenche o relatório.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const pending = localStorage.getItem("frontend_export_rows")
        if (!pending) return
        const rowsRaw = JSON.parse(pending)
        if (!Array.isArray(rowsRaw) || rowsRaw.length === 0) return
        const rows = rowsRaw.map((r: any) => normalizeRow(r))
        const out = await runAlcoolPipeline(rows as Array<Record<string, any>>)
        if (!alive) return

        try { localStorage.setItem("lastOutputs", JSON.stringify(out)) } catch {}

        const first: any = out?.resultados?.[0] ?? null
        if (!first) return
        const rep: any = (() => {
          const am = String(first.amostra ?? first.sampleName ?? "")
          return (out.repeticoes || []).find((r: any) => String(r?.amostra ?? "") === am) ?? (out.repeticoes?.[0] ?? null)
        })()

        const safeNum = (v: any): number | undefined => (typeof v === "number" && isFinite(v)) ? v : undefined
        const safeNumOrNull = (v: any): number | null => (typeof v === "number" && isFinite(v)) ? v : null
        const loadNumArray = (key: string): number[] => {
          try {
            const raw = localStorage.getItem(key)
            if (!raw) return []
            const arr = JSON.parse(raw)
            if (!Array.isArray(arr)) return []
            return arr.map((x) => Number(x)).filter((x) => Number.isFinite(x))
          } catch {
            return []
          }
        }
        const manualTimesWater = loadNumArray("manualTimesWater")
        const manualTimesSample = loadNumArray("manualTimesSample")

        const mapped: ResultShape = {
          conditions: {
            sampleName: String(first.amostra ?? first.sampleName ?? ""),
            beverageType: first.beverageType,
            labelAbv: safeNum(first.labelAbv),
            labelUnit: first.labelUnit,
            brand: first.brand,
            waterType: first.waterType,
            temperature: safeNum(first.temp ?? first.waterTemperature),
            sampleTemperature: safeNum(first.sampleTemperature),
            ethanolMassPercent: safeNum(first.labelEt),
            methanolMassPercent: safeNum(first.labelMet),
          },
          density: {
            method: first.method,
            waterMass: safeNum(first.waterMass),
            sampleMass: safeNum(first.sampleMass),
            measuredValue: safeNum(first.measuredValue),
            measuredUnit: first.measuredUnit,
            densityRel: safeNum(first.dens_rel ?? first.densityRel),
            cvWaterMass: safeNum(first.cv_water_mass ?? first.cvWaterMass),
            cvSampleMass: safeNum(first.cv_sample_mass ?? first.cvSampleMass),
          },
          viscosity: {
            viscosityRel: safeNum(first.mu_ratio ?? first.viscosityRel),
            muAbsWater: safeNum(first.mu_agua_abs ?? first.muAbsWater),
            muAbsSample: safeNum(first.mu_amostra_abs_corr ?? first.mu_amostra_abs ?? first.muAbsSample),
          },
          expectedComposition: {
            agua: safeNum(rep?.w_agua_est ?? first.w_agua_est),
            et: safeNum(rep?.w_et_est ?? first.w_et_est),
            met: safeNum(rep?.w_met_est ?? first.w_met_est),
          },
          rawTimes: {
            waterTimes: manualTimesWater,
            sampleTimes: manualTimesSample,
          },
          equivalentes: rep?.equivalentes ?? undefined,
          classe_final: rep?.classe_final ?? undefined,
          compativel: rep?.compativel ?? undefined,
          mostLikely: rep?.most_likely_txt ?? rep?.classe_final ?? undefined,
          conclusao: rep?.conclusao ?? undefined,
          seletividade: rep?.seletividade ?? undefined,
          erroMuMalhaAbs: safeNumOrNull(first.erro_mu_malha ?? first.erroMuMalhaAbs),
          erroMuMalhaPct: safeNumOrNull(first.erro_mu_malha_pct ?? first.erroMuMalhaPct),
          approvals: rep?.approvals ?? undefined,
          flags: rep?.flags ?? undefined,
          expectedText: rep?.expectedText ?? undefined,
        }

        try { localStorage.setItem("lastResult", JSON.stringify(mapped)) } catch {}
        try { localStorage.removeItem("frontend_export_rows") } catch {}
        setResult(mapped)
      } catch {
        // se falhar, a tela continua exibindo lastResult (se existir)
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const loadResult = () => {
      try {
        const raw = localStorage.getItem("lastResult")
        if (raw) setResult(JSON.parse(raw) as ResultShape)
      } catch {}
    }
    
    loadResult()
    
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lastResult") loadResult()
    }
    
    window.addEventListener("storage", handleStorage)
    
    // Poll every 2 seconds as fallback
    const interval = setInterval(loadResult, 2000)
    
    return () => {
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const loadReplicates = () => {
      try {
        const wRaw = localStorage.getItem("videoReplicasWater")
        const sRaw = localStorage.getItem("videoReplicasSample")
        if (wRaw) setWaterReplicates(JSON.parse(wRaw))
        if (sRaw) setSampleReplicates(JSON.parse(sRaw))
      } catch {}
    }
    
    loadReplicates()
    
    const interval = setInterval(loadReplicates, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let alive = true
    fetch("/data/temperatura_referencia_v2.json").then((r) => r.ok ? r.json() : null).then((j) => {
      if (!alive || !j) return
      if (j && Array.isArray(j.temperatura) && Array.isArray(j.viscosidade)) {
        setTempRef({ temperatura: j.temperatura.map(Number), viscosidade: j.viscosidade.map(Number) })
      }
    }).catch(() => {})
    return () => { alive = false }
  }, [])

  const interpWaterViscRef = (t?: number | null) => {
    if (typeof t !== "number" || !isFinite(t) || !tempRef) return null
    const xs = tempRef.temperatura
    const ys = tempRef.viscosidade
    if (!xs.length || !ys.length || xs.length !== ys.length) return null
    const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
    const tt = clamp(t, xs[0], xs[xs.length - 1])
    let i1 = xs.findIndex((x) => x >= tt)
    if (i1 <= 0) i1 = 1
    const i0 = i1 - 1
    const x0 = xs[i0], x1 = xs[i1]
    const y0 = ys[i0], y1 = ys[i1]
    const tRel = (tt - x0) / (x1 - x0)
    return y0 + tRel * (y1 - y0)
  }


  const parseCompositionLine = (line: string): { agua: number; et: number; met: number } | null => {
    const s = String(line || "").toLowerCase()
    const grab = (name: "água" | "etanol" | "metanol") => {
      const re = new RegExp(name + "\\s+(\\d+(?:[\\.,]\\d+)?)%")
      const m = s.match(re)
      if (!m) return 0
      const v = Number(String(m[1]).replace(",", "."))
      return isFinite(v) ? v/100 : 0
    }
    const agua = grab("água")
    const et = grab("etanol")
    const met = grab("metanol")
    // se não achou nada, não é uma linha de composição
    if (agua === 0 && et === 0 && met === 0) return null
    return { agua, et, met }
  }

  const pickCompatibleLine = (equivalentes: string, expected?: { agua?: number; et?: number; met?: number } | null, tolPct = 3): string | null => {
    const exp = expected ? { agua: expected.agua ?? 0, et: expected.et ?? 0, met: expected.met ?? 0 } : null
    const lines = String(equivalentes || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (!lines.length || !exp) return null
    const tol = tolPct/100
    let best: { line: string; score: number } | null = null
    for (const line of lines) {
      const comp = parseCompositionLine(line)
      if (!comp) continue
      const ok = (Math.abs(comp.agua - exp.agua) <= tol) && (Math.abs(comp.et - exp.et) <= tol) && (Math.abs(comp.met - exp.met) <= tol)
      if (!ok) continue
      const score = Math.abs(comp.agua-exp.agua) + Math.abs(comp.et-exp.et) + Math.abs(comp.met-exp.met)
      if (!best || score < best.score) best = { line, score }
    }
    return best?.line ?? null
  }
  const computeR2 = (marks: Record<13|14|15|16|17|18, number|undefined>) => {
    const xs: number[] = []
    const ys: number[] = []
    ;([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).forEach((v) => {
      const t = marks[v]
      if (typeof t === "number" && !isNaN(t)) { xs.push(v); ys.push(t) }
    })
    if (xs.length < 2) return null
    const mean = (arr: number[]) => arr.reduce((a,b)=>a+b,0)/arr.length
    const xm = mean(xs)
    const ym = mean(ys)
    let num = 0
    let denx = 0
    let deny = 0
    for (let i=0;i<xs.length;i++) { const dx = xs[i]-xm; const dy = ys[i]-ym; num += dx*dy; denx += dx*dx; deny += dy*dy }
    const r = denx && deny ? num / Math.sqrt(denx*deny) : 0
    return r*r
  }

  const estimateDeltaTime = (marks: Record<13|14|15|16|17|18, number|undefined>) => {
    const xs: number[] = []
    const ys: number[] = []
    ;([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).forEach((v) => {
      const t = marks[v]
      if (typeof t === "number" && !isNaN(t)) { xs.push(v); ys.push(t) }
    })
    if (xs.length < 2) return null
    const mean = (arr: number[]) => arr.reduce((a,b)=>a+b,0)/arr.length
    const xm = mean(xs)
    const ym = mean(ys)
    let num = 0
    let den = 0
    for (let i=0;i<xs.length;i++) { const dx = xs[i]-xm; num += dx*(ys[i]-ym); den += dx*dx }
    const slope = den ? num/den : 0
    const intercept = ym - slope*xm
    const t10 = slope*10 + intercept
    const t15 = slope*15 + intercept
    const dt = t10 - t15
    if (typeof dt !== "number" || isNaN(dt)) return null
    return dt
  }

  const cvOf = (values: Array<number | null>) => {
    const xs = values.filter((v): v is number => typeof v === "number" && !isNaN(v))
    if (xs.length < 2) return null
    const mean = xs.reduce((a,b)=>a+b,0)/xs.length
    const variance = xs.reduce((s,x)=>s+Math.pow(x-mean,2),0)/(xs.length-1)
    const stdev = Math.sqrt(variance)
    if (!mean) return null
    return (stdev/mean)*100
  }

  const sampleDtList = useMemo(() => sampleReplicates.map(r => estimateDeltaTime(r.marks)), [sampleReplicates])
  const waterDtList = useMemo(() => waterReplicates.map(r => estimateDeltaTime(r.marks)), [waterReplicates])
  const sampleCvTimes = useMemo(() => cvOf(sampleDtList), [sampleDtList])
  const waterCvTimes = useMemo(() => cvOf(waterDtList), [waterDtList])

  const aprovacao = useMemo(() => {
    const fromWorker = (result as any)?.approvals?.status
    if (typeof fromWorker === "string" && fromWorker.trim()) return fromWorker.trim()

    const manualSampleTimes = result?.rawTimes?.sampleTimes as Array<number | null> | undefined
    const manualWaterTimes = result?.rawTimes?.waterTimes as Array<number | null> | undefined
    const sampleRepCount = manualSampleTimes?.length ?? sampleReplicates.length
    const waterRepCount = manualWaterTimes?.length ?? waterReplicates.length
    const sampleCv = manualSampleTimes && manualSampleTimes.length >= 2 ? cvOf(manualSampleTimes) : sampleCvTimes
    const waterCv = manualWaterTimes && manualWaterTimes.length >= 2 ? cvOf(manualWaterTimes) : waterCvTimes
    
    // R² só deve ser aplicado se EXISTEM vídeos
    const hasVideos = sampleReplicates.length > 0 || waterReplicates.length > 0
    const rsSample = sampleReplicates.map(r => computeR2(r.marks)).filter(v => v != null) as number[]
    const rsWater = waterReplicates.map(r => computeR2(r.marks)).filter(v => v != null) as number[]
    // Se NÃO há vídeos, R² não se aplica (sempre OK)
    const r2Ok = !hasVideos || (rsSample.every(v => v >= 0.99) && rsWater.every(v => v >= 0.99))
    
    const cvOk = (sampleCv == null ? true : sampleCv <= 5) && (waterCv == null ? true : waterCv <= 5)
    const repsOk = sampleRepCount >= 2 && waterRepCount >= 2
    const refMu = interpWaterViscRef(result?.conditions?.temperature ?? result?.conditions?.sampleTemperature ?? null)
    const muW = result?.viscosity?.muAbsWater
    const waterViscOk = (refMu == null || muW == null || !isFinite(muW)) ? true : (muW >= refMu * 0.85 && muW <= refMu * 1.15)
    if (repsOk && cvOk && r2Ok && waterViscOk) return "Aprovado"
    if (!repsOk) {
      const anyOtherFail = !cvOk || !r2Ok || !waterViscOk
      return anyOtherFail ? "Reprovado e insuficientes" : "Insuficientes"
    }
    return "Reprovado"
  }, [result, sampleReplicates, waterReplicates, sampleCvTimes, waterCvTimes, interpWaterViscRef])

  const compatStatus = useMemo(() => {
    const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
    const c = String((result?.compativel ?? ternaria?.compativel ?? "") || "").trim()
    if (c) return c
    const label = result?.labelCompat?.status
    if (!label) return "Indeterminado"
    return label === "Coerente" ? "Compatível" : (label === "Possível divergência" ? "Incompatível" : label)
  }, [result])

  const semaforo = useMemo(() => {
    const bt = result?.conditions?.beverageType
    const tipoMetanolComercial = bt === "Metanol comercial"
    const tipoBebida = bt && bt !== "Metanol comercial"
    const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
    const classeTxt = String((result?.classe_final ?? ternaria?.classe_final ?? "") || "")
    const eqHasMetanolAlto = (() => {
    const f = (result as any)?.flags
    if (typeof f?.methanolAbove5InEquivalents === "boolean") return f.methanolAbove5InEquivalents
    const ternEq = String((result as any)?.ternaria?.equivalentes ?? result?.equivalentes ?? "").toLowerCase()
    const m = ternEq.match(/metanol\s+(\d+(?:[\.,]\d+)?)%/)
    if (!m) return false
    const v = Number(String(m[1]).replace(",", "."))
    return isFinite(v) && v > 5
  })()
    if (tipoMetanolComercial) {
      if (compatStatus === "Compatível" && aprovacao === "Aprovado") return { cor: "green", texto: "Compatibilidade entre rótulo e experimento" }
      if (compatStatus === "Incompatível" && aprovacao === "Aprovado") return { cor: "red", texto: "Incompatível com o rótulo" }
      return { cor: "yellow", texto: "Necessários mais dados experimentais" }
    }
    if (tipoBebida) {
      if (compatStatus === "Incompatível" && eqHasMetanolAlto && aprovacao === "Aprovado") return { cor: "red", texto: "Possível presença de metanol" }
      if (compatStatus === "Compatível" && aprovacao === "Aprovado") return { cor: "green", texto: "Compatibilidade entre rótulo e experimento" }
      if (compatStatus === "Compatível" && (aprovacao === "Reprovado" || aprovacao === "Insuficientes" || aprovacao === "Reprovado e insuficientes")) return { cor: "yellow", texto: "Necessários mais dados experimentais" }
      return { cor: "yellow", texto: "Necessários mais dados experimentais" }
    }
    return { cor: "yellow", texto: "Necessários mais dados experimentais" }
  }, [result, compatStatus, aprovacao])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Relatório | Exame de Triagem</h1>
      <header className="p-3 border rounded-lg">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${semaforo.cor === "green" ? "bg-green-500" : semaforo.cor === "red" ? "bg-red-500" : "bg-yellow-500"}`} />
          <span className="text-sm font-bold">{semaforo.texto}</span>
        </div>
      </header>
      <section className="space-y-2 text-sm">
        <div className="flex items-center gap-2 border-b">
          <button 
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "Resultados" 
                ? "border-b-2 border-[#002060] text-[#002060]" 
                : "text-gray-600"
            }`} 
            onClick={() => setActiveTab("Resultados")}
          >
            Resultados
          </button>
          <button 
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "Dados experimentais" 
                ? "border-b-2 border-[#002060] text-[#002060]" 
                : "text-gray-600"
            }`} 
            onClick={() => setActiveTab("Dados experimentais")}
          >
            Dados experimentais
          </button>
        </div>
        {activeTab === "Resultados" && (
          <div className="space-y-2">
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Amostra</h2>
              {result ? (
                <ul className="mt-1 space-y-1">
                  <li>Nome da amostra: {String(result.conditions?.sampleName ?? "-")}</li>
                  <li>Perfil: {String(result.conditions?.beverageType ?? "-")}</li>
                  {result.conditions?.beverageType === "Outra hidroalcoólica" ? (
                    <>
                      <li>Teor de etanol: {result.conditions?.ethanolMassPercent != null ? `${result.conditions?.ethanolMassPercent}% m/m (informado)` : "-"}</li>
                      <li>Teor de metanol: {result.conditions?.methanolMassPercent != null ? `${result.conditions?.methanolMassPercent}% m/m (informado)` : "-"}</li>
                    </>
                  ) : (
                    <li>Teor de rótulo: {result.conditions?.labelAbv != null ? `${result.conditions?.labelAbv} ${result.conditions?.labelUnit ?? ""}` : "-"}</li>
                  )}
                  <li>Composição % m/m esperada: {result?.expectedComposition ? `${((result.expectedComposition.agua ?? 0)*100).toFixed(1)}% água; ${((result.expectedComposition.et ?? 0)*100).toFixed(1)}% etanol${(result.expectedComposition.met ?? 0) > 0 ? `; ${((result.expectedComposition.met ?? 0)*100).toFixed(1)}% metanol` : ""}.` : "-"}</li>
                </ul>
              ) : (
                <p>Perfil e teor de rótulo</p>
              )}
            </div>
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Composições estatisticamente equivalentes</h2>
              <div className="mt-1 text-sm whitespace-pre-line">{(() => {
                const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
                const eq = result?.equivalentes ?? ternaria?.equivalentes
                const s0 = typeof eq === 'string' ? eq : (eq != null ? String(eq) : "")
                const lines = String(s0).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
                const uniq = Array.from(new Set(lines))
                if (uniq.length) return uniq.join("\n")
                const expTxt = String((result as unknown as { expectedText?: string })?.expectedText ?? (result as any)?.expectedText ?? "").trim()
                if (expTxt) return expTxt
                const exp = result?.expectedComposition
                if (exp) {
                  const a = Number(((exp.agua ?? 0)*100).toFixed(1))
                  const e = Number(((exp.et ?? 0)*100).toFixed(1))
                  const m = Number(((exp.met ?? 0)*100).toFixed(1))
                  const parts: string[] = []
                  if (a > 0) parts.push(`Água ${a}%;`)
                  if (e > 0) parts.push(`etanol ${e}%;`)
                  if (m > 0) parts.push(`metanol ${m}%;`)
                  if (parts.length === 2) return parts[0] + " " + parts[1].replace(";", ".")
                  if (parts.length === 1) return parts[0].replace(";", ".")
                  return `${parts[0]} ${parts[1]} e ${parts[2].replace(";", "")}.`
                }
                return "-"
              })()}</div>
              <p className="mt-2 text-xs text-neutral-600 text-justify"><span className="not-italic">ℹ️</span> <span className="italic">Composições equivalentes correspondem a possibilidades que, considerando a variabilidade experimental dos ensaios e os testes estatísticos aplicados (teste Z e simulações probabilística de Monte Carlo), não podem ser distinguidas entre si. Em outras palavras, tratam-se de composições diferentes que poderiam conduzir aos resultados experimentais obtidos. Ressalta-se, ainda, que teores inferiores a 5% tendem a ter sua relevância reduzida na interpretação dos resultados, uma vez que esta metodologia não demonstrou sensibilidade adequada para a detecção de concentrações abaixo desse limite.</span></p>
            </div>
            <div className="border rounded-lg p-3">
          <h2 className="font-medium">Síntese analítica dos resultados</h2>
          <ul className="mt-1 space-y-1">
            <li>Rótulo e resultados (±3%): {result?.compativel ?? compatStatus}</li>
            <li>Composição equivalente compatível com rótulo: {compatStatus === "Compatível" ? (pickCompatibleLine(String((result as any)?.ternaria?.equivalentes ?? result?.equivalentes ?? ""), result?.expectedComposition ?? null) ?? "-") : "nenhuma localizada"}</li>
            <li>Composição mais provável (Teste Monte Carlo): {(() => {
              const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
              const mostLikely = result?.mostLikely ?? ternaria?.classe_final
              
              // Verificar se é inconclusivo
              const conclusao = (result as any)?.conclusao ?? ''
              const seletividade = (result as any)?.seletividade ?? ''
              const equivalentes = result?.equivalentes ?? ternaria?.equivalentes ?? ''
              
              if (mostLikely) {
                // Se tem classe_final, mostrar
                return mostLikely
              } else if (seletividade === 'baixa' || conclusao.includes('inconclusivo')) {
                // Monte Carlo inconclusivo - mostrar composições equivalentes
                const lines = String(equivalentes).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
                if (lines.length > 1) {
                  return `Inconclusivo entre: ${lines.join(' e ')}`
                }
              }
              
              return '-'
            })()}</li>
            <li>Viscosidade da amostra (20ºC): {(() => {
              const v = result?.viscosity?.muAbsSample
              return v != null ? Number(v).toFixed(4) : '-'
            })()}</li>
            {(() => {
              const muW = result?.viscosity?.muAbsWater
              if (muW != null) {
                return <li>Viscosidade da água (20ºC): {Number(muW).toFixed(4)}</li>
              }
              return null
            })()}
          </ul>
              <p className="mt-2 text-xs text-neutral-600 text-justify"><span className="not-italic">⚠️</span> <span className="italic">Lembre-se: este não é exame confirmatório, mas sim estimativo, e não substitui exames laboratoriais oficiais. Em casos suspeitos, NÃO CONSUMA a bebida, mesmo com resultados de triagem dentro do esperado.</span></p>
            </div>
            
          </div>
        )}
        {activeTab === "Dados experimentais" && (
          <div className="space-y-2">
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Amostra e água de referência</h2>
              {result ? (
                <ul className="mt-1 space-y-1">
                  <li>Nome da amostra: {String(result.conditions?.sampleName ?? "-")}</li>
                  <li>Perfil: {String(result.conditions?.beverageType ?? "-")}</li>
                  {result.conditions?.beverageType === "Outra hidroalcoólica" ? (
                    <>
                      <li>Teor de etanol: {result.conditions?.ethanolMassPercent != null ? `${result.conditions?.ethanolMassPercent}% m/m (informado)` : "-"}</li>
                      <li>Teor de metanol: {result.conditions?.methanolMassPercent != null ? `${result.conditions?.methanolMassPercent}% m/m (informado)` : "-"}</li>
                    </>
                  ) : (
                    <li>Rótulo: {result.conditions?.labelAbv != null ? `${result.conditions?.labelAbv} ${result.conditions?.labelUnit ?? ""}` : "-"}</li>
                  )}
                  <li>Fabricante e/ou marca: {result.conditions?.brand ?? "-"}</li>
                  <li>Temperatura da amostra (ºC): {result.conditions?.sampleTemperature ?? "-"}</li>
                  <li>Tipo de água: {String(result.conditions?.waterType ?? "-")}</li>
                  <li>Temperatura da água (ºC): {result.conditions?.temperature ?? "-"}</li>
                </ul>
              ) : (
                <p>Condições detalhadas do ensaio</p>
              )}
            </div>
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Dados de massa e densidade</h2>
              <ul className="mt-1 space-y-1">
                <li>Método: {result?.density?.method ?? "-"}</li>
                <li>Massa água (g): {result?.density?.waterMass != null ? result.density.waterMass : "-"}</li>
                <li>Massa amostra (g): {result?.density?.sampleMass != null ? result.density.sampleMass : "-"}</li>
                <li>Valor medido: {result?.density?.measuredValue != null ? result.density.measuredValue : "-"}</li>
                <li>Unidade: {result?.density?.measuredUnit ?? "-"}</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Composição esperada (m/m)</h2>
              <ul className="mt-1 space-y-1">
                <li>{result?.expectedComposition ? `${((result.expectedComposition.agua ?? 0)*100).toFixed(1)}% água; ${((result.expectedComposition.et ?? 0)*100).toFixed(1)}% etanol${(result.expectedComposition.met ?? 0) > 0 ? `; ${((result.expectedComposition.met ?? 0)*100).toFixed(1)}% metanol` : ""}.` : "-"}</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Escoamento - Amostra</h2>
              <ul className="mt-1 space-y-1">
                <li>Range de volume considerado (mL): 18–13</li>
                <li>Vídeo(s) amostra: {sampleReplicates.length ? sampleReplicates.map(r => r.fileName ?? "-").join("; ") : "-"}</li>
                <li>Instantes de escoamento: {sampleReplicates.length ? sampleReplicates.map(r => ([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")).join("; ") : "-"}</li>
                <li>Ajuste(s) linear do escoamento (R²): {sampleReplicates.length ? sampleReplicates.map(r => { const v = computeR2(r.marks); return v != null ? v.toFixed(3) : "-" }).join("; ") : "-"}</li>
                <li>Tempo estimado escoamento (s): {sampleReplicates.length ? sampleReplicates.map(r => { const v = estimateDeltaTime(r.marks); return v != null ? v.toFixed(2) : "-" }).join("; ") : "-"}</li>
                <li>Tempos inseridos manualmente (s): {result?.rawTimes?.sampleTimes && result.rawTimes.sampleTimes.length ? result.rawTimes.sampleTimes.map((t) => t?.toFixed?.(2)).join(", ") : "-"}</li>
                <li>Variação dos tempos (%): {(() => {
                  const manual = result?.rawTimes?.sampleTimes ?? []
                  const vids = sampleReplicates.map(r => estimateDeltaTime(r.marks)).filter((v): v is number => typeof v === 'number' && !isNaN(v))
                  const merged = [...vids, ...manual.filter((v): v is number => typeof v === 'number' && !isNaN(v))]
                  if (merged.length < 2) return '-'
                  const m = merged.reduce((a,b)=>a+b,0)/merged.length
                  const variance = merged.reduce((s,x)=>s+Math.pow(x-m,2),0)/(merged.length-1)
                  const stdev = Math.sqrt(variance)
                  if (!m) return '-'
                  return ((stdev/m)*100).toFixed(2)
                })()}</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Escoamento - Água</h2>
              <ul className="mt-1 space-y-1">
                <li>Range de volume considerado (mL): 18–13</li>
                <li>Vídeo(s) água: {waterReplicates.length ? waterReplicates.map(r => r.fileName ?? "-").join("; ") : "-"}</li>
                <li>Instantes de escoamento: {waterReplicates.length ? waterReplicates.map(r => ([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")).join("; ") : "-"}</li>
                <li>Ajuste(s) linear do escoamento (R²): {waterReplicates.length ? waterReplicates.map(r => { const v = computeR2(r.marks); return v != null ? v.toFixed(3) : "-" }).join("; ") : "-"}</li>
                <li>Tempo estimado escoamento (s): {waterReplicates.length ? waterReplicates.map(r => { const v = estimateDeltaTime(r.marks); return v != null ? v.toFixed(2) : "-" }).join("; ") : "-"}</li>
                <li>Tempos inseridos manualmente (s): {result?.rawTimes?.waterTimes && result.rawTimes.waterTimes.length ? result.rawTimes.waterTimes.map((t) => t?.toFixed?.(2)).join(", ") : "-"}</li>
                <li>Variação dos tempos (%): {(() => {
                  const manual = result?.rawTimes?.waterTimes ?? []
                  const vids = waterReplicates.map(r => estimateDeltaTime(r.marks)).filter((v): v is number => typeof v === 'number' && !isNaN(v))
                  const merged = [...vids, ...manual.filter((v): v is number => typeof v === 'number' && !isNaN(v))]
                  if (merged.length < 2) return '-'
                  const m = merged.reduce((a,b)=>a+b,0)/merged.length
                  const variance = merged.reduce((s,x)=>s+Math.pow(x-m,2),0)/(merged.length-1)
                  const stdev = Math.sqrt(variance)
                  if (!m) return '-'
                  return ((stdev/m)*100).toFixed(2)
                })()}</li>
              </ul>
            </div>
            
          </div>
        )}
      </section>
      <div className="flex gap-2">
        <button className="border rounded-lg py-3 px-4 flex-1">Exportar PDF</button>
        <button onClick={() => router.push("/medir")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 flex-1 disabled:bg-blue-300 disabled:cursor-not-allowed">Novo ensaio</button>
      </div>
    </div>
  )
}