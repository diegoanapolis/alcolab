"use client"
import React, { useEffect, useState } from "react"
import StepProfile from "@/components/wizard/StepProfile"
import StepSampleData from "@/components/wizard/StepSampleData"
import StepWaterTemp from "@/components/wizard/StepWaterTemp"
import StepDensity from "@/components/wizard/StepDensity"
import StepTimes from "@/components/wizard/StepTimes"
import StepReviewCalculate, { WizardData } from "@/components/wizard/StepReviewCalculate"
import CalculatingOverlay from "@/components/ui/CalculatingOverlay"
import DemoModal from "@/components/ui/DemoModal"
import { getDemoScenario, getDemoId, clearDemoMode, DemoScenarioId } from "@/lib/demoScenarios"
import { FlaskConical } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function MedirPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({})
  const [calculating, setCalculating] = useState(false)
  const [demoMode, setDemoMode] = useState<string | null>(null)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const router = useRouter()

  // Inicialização no mount
  useEffect(() => {
    try {
      const demoId = getDemoId()
      if (demoId) {
        const scenario = getDemoScenario(demoId)
        if (scenario) {
          setDemoMode(demoId)
          const demoData: WizardData = {
            profile: scenario.profile as any,
            density: scenario.density as any,
            waterTemp: scenario.waterTemp as any,
          }
          setData(demoData)
          localStorage.setItem("wizardData", JSON.stringify(demoData))
          const waterReps = scenario.waterVideos.map(v => ({
            previewUrl: v.url,
            duration: v.duration,
            fileName: v.fileName,
            marks: v.marks,
            volumesMarked: v.volumesMarked,
          }))
          const sampleReps = scenario.sampleVideos.map(v => ({
            previewUrl: v.url,
            duration: v.duration,
            fileName: v.fileName,
            marks: v.marks,
            volumesMarked: v.volumesMarked,
          }))
          localStorage.setItem("videoReplicasWater", JSON.stringify(waterReps))
          localStorage.setItem("videoReplicasSample", JSON.stringify(sampleReps))
          setStep(2)
          localStorage.setItem("wizardStep", "2")
          return
        }
      }
      // Normal mode
      setDemoMode(null)
      const rawData = localStorage.getItem("wizardData")
      if (rawData) setData(JSON.parse(rawData))
      setStep(1)
      localStorage.setItem("wizardStep", "1")
    } catch {}
  }, [])

  // Detectar quando demoMode foi limpo externamente (ex: usuário foi pra Home que limpa demoScenario)
  // Checa via interval curto - cobre soft navigation via BottomTabs onde useEffect[] não re-roda
  useEffect(() => {
    if (!demoMode) return // Só monitorar quando estamos em modo demo
    const interval = setInterval(() => {
      const currentDemoId = getDemoId()
      if (!currentDemoId) {
        // Demo foi limpo externamente - resetar para step 1
        setDemoMode(null)
        setStep(1)
        localStorage.setItem("wizardStep", "1")
      }
    }, 500)
    return () => clearInterval(interval)
  }, [demoMode])

  useEffect(() => {
    try { localStorage.setItem("wizardData", JSON.stringify(data)) } catch {}
  }, [data])

  useEffect(() => {
    try { localStorage.setItem("wizardStep", String(step)) } catch {}
  }, [step])

  const next = () => setStep((s) => s + 1)
  const back = () => {
    if (step === 2 && demoMode) {
      // Exiting demo mode
      clearDemoMode()
      setDemoMode(null)
    }
    setStep((s) => Math.max(1, s - 1))
  }

  const handleDemoSelect = (id: DemoScenarioId) => {
    // Limpar estado anterior antes de iniciar novo demo
    try {
      localStorage.removeItem("wizardData")
      localStorage.removeItem("wizardStep")
      localStorage.removeItem("videoReplicasWater")
      localStorage.removeItem("videoReplicasSample")
      localStorage.removeItem("manualTimesWater")
      localStorage.removeItem("manualTimesSample")
    } catch {}
    localStorage.setItem("demoScenario", id)
    setShowDemoModal(false)
    // Hard reload para garantir re-mount limpo
    window.location.reload()
  }

  type ConvTable = Record<string, number[]>
  let convCache: ConvTable | null = null
  const loadConv = async (): Promise<ConvTable> => {
    if (convCache) return convCache
    const res = await fetch("/data/conversao_vv_para_wE_20C.json", { cache: "force-cache" })
    if (!res.ok) throw new Error("falha ao carregar tabela de conversão")
    convCache = await res.json()
    return convCache as ConvTable
  }
  const findBracket = (xs: number[], x: number): [number, number] => {
    let lo = 0, hi = xs.length - 1
    if (x <= xs[lo]) return [lo, lo]
    if (x >= xs[hi]) return [hi, hi]
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xs[mid] === x) return [mid, mid]
      if (xs[mid] < x) lo = mid; else hi = mid
    }
    return [lo, hi]
  }
  const convertVvToMmPercent = async (gl: number): Promise<number | null> => {
    try {
      const conv = await loadConv()
      const gls = (conv.gl || conv.GL || conv.vv || conv.vv_percent || []).map(Number)
      const mms = (conv.wE_percent || conv.mm || conv.mm_percent || conv.inpm || []).map(Number)
      if (!gls.length || !mms.length) return null
      const [i0, i1] = findBracket(gls, gl)
      if (i0 === i1) return mms[i0]
      const x0 = gls[i0], x1 = gls[i1], y0 = mms[i0], y1 = mms[i1]
      const t = (gl - x0) / (x1 - x0)
      return y0 + t * (y1 - y0)
    } catch { return null }
  }
  const computeExpectedValues = async (profile: WizardData["profile"], density: WizardData["density"]): Promise<{ et: number; met: number; agua: number } | null> => {
    const rhoE = 0.789
    const rhoW = 0.998
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
    if (!profile) return null
    if (profile.beverageType === "Metanol comercial") {
      if (profile.labelUnit === "INPM ou % m/m" && typeof profile.labelAbv === "number") {
        const met = profile.labelAbv/100
        return { et: 0, met: clamp01(met), agua: clamp01(1 - met) }
      }
      if (typeof profile.methanolMassPercent === "number") {
        const met = profile.methanolMassPercent/100
        return { et: 0, met: clamp01(met), agua: clamp01(1 - met) }
      }
      return null
    }
    if (profile.beverageType === "Outra hidroalcoólica") {
      const et = typeof profile.ethanolMassPercent === "number" ? profile.ethanolMassPercent/100 : 0
      const met = typeof profile.methanolMassPercent === "number" ? profile.methanolMassPercent/100 : 0
      return { et: clamp01(et), met: clamp01(met), agua: clamp01(1 - (et + met)) }
    }
    if (typeof profile.labelAbv === "number") {
      const v = profile.labelAbv/100
      if (profile.labelUnit === "INPM ou % m/m") {
        const et = v
        return { et: clamp01(et), met: 0, agua: clamp01(1 - et) }
      }
      const mm = await convertVvToMmPercent(profile.labelAbv)
      const et = typeof mm === "number" && isFinite(mm) ? mm/100 : (rhoE*v)/((rhoE*v) + (rhoW*(1-v)))
      return { et: clamp01(et), met: 0, agua: clamp01(1 - et) }
    }
    if (density && density.measuredUnit === "% v/v ou °GL" && typeof density.measuredValue === "number") {
      const mm = await convertVvToMmPercent(density.measuredValue)
      const et = typeof mm === "number" && isFinite(mm) ? mm/100 : (() => {
        const v = density.measuredValue/100
        return (rhoE*v)/((rhoE*v) + (rhoW*(1-v)))
      })()
      return { et: clamp01(et), met: 0, agua: clamp01(1 - et) }
    }
    if (density && density.measuredUnit === "% m/m ou INPM" && typeof density.measuredValue === "number") {
      const et = density.measuredValue/100
      return { et: clamp01(et), met: 0, agua: clamp01(1 - et) }
    }
    return null
  }

  const handleCalculate = async () => {
    setCalculating(true)
    clearDemoMode()
    setDemoMode(null)
    try {
      try { localStorage.removeItem("lastResult") } catch {}
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
        const t18 = slope*18 + intercept
        const t14 = slope*14 + intercept
        const dt = t14 - t18
        if (typeof dt !== "number" || isNaN(dt)) return null
        return dt
      }
      let videoWater: Array<{ marks: Record<13|14|15|16|17|18, number|undefined> }> = []
      let videoSample: Array<{ marks: Record<13|14|15|16|17|18, number|undefined> }> = []
      try {
        const wRaw = localStorage.getItem("videoReplicasWater")
        const sRaw = localStorage.getItem("videoReplicasSample")
        if (wRaw) videoWater = JSON.parse(wRaw)
        if (sRaw) videoSample = JSON.parse(sRaw)
      } catch {}
      const vidWaterTimes = videoWater.map(r => estimateDeltaTime(r.marks)).filter((v): v is number => typeof v === 'number' && !isNaN(v))
      const vidSampleTimes = videoSample.map(r => estimateDeltaTime(r.marks)).filter((v): v is number => typeof v === 'number' && !isNaN(v))
      const mergedTimes = {
        waterTimes: [...vidWaterTimes, ...((data.times?.waterTimes ?? []).filter((v): v is number => typeof v === 'number' && !isNaN(v)))],
        sampleTimes: [...vidSampleTimes, ...((data.times?.sampleTimes ?? []).filter((v): v is number => typeof v === 'number' && !isNaN(v)))],
      }
      try { if (data.waterTemp) localStorage.setItem("lastWaterTemp", JSON.stringify(data.waterTemp)) } catch {}

      // Fluxo principal: delega o cálculo ao worker Pyodide (mesmo usado pela página /resultados).
      // Isso evita depender de /workers/calcWorker_integrado.js (não presente neste bundle).
      const mean = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : NaN
      const waterMean = mean(mergedTimes.waterTimes)
      const sampleMean = mean(mergedTimes.sampleTimes)
      const joinTimes = (arr: number[]) => arr.map((v) => {
        const n = Number(v)
        if (!Number.isFinite(n)) return null
        return String(n)
      }).filter(Boolean).join(";")

      // Preparar dados de precisão da balança para salvar
      const densityData = data.density as any // Cast para acessar campos extras
      const balancaTemDecimal = densityData?.balancaTemDecimal
      const lowPrecisionCheckResult = densityData?.lowPrecisionCheckResult
      
      const exportRow: Record<string, unknown> = {
        sampleName: data.profile?.sampleName ?? "",
        beverageType: data.profile?.beverageType ?? "",
        labelAbv: data.profile?.labelAbv ?? null,
        labelUnit: data.profile?.labelUnit ?? "",
        ethanolMassPercent: data.profile?.ethanolMassPercent ?? null,
        methanolMassPercent: data.profile?.methanolMassPercent ?? null,
        brand: data.profile?.brand ?? "",

        waterTemperature: data.waterTemp?.waterTemperature ?? null,
        sampleTemperature: data.waterTemp?.sampleTemperature ?? null,
        waterType: data.waterTemp?.waterType ?? "",

        method: data.density?.method ?? "",
        containerMass: data.density?.containerMass ?? null,
        waterMass: data.density?.waterMass ?? null,
        sampleMass: data.density?.sampleMass ?? null,
        // Guardar massas brutas (com recipiente) para referência
        waterMassRaw: densityData?.waterMassRaw ?? null,
        sampleMassRaw: densityData?.sampleMassRaw ?? null,
        measuredUnit: data.density?.measuredUnit ?? "",
        measuredValue: data.density?.measuredValue ?? null,
        
        // Dados de precisão da balança
        balancaTemDecimal: balancaTemDecimal,
        lowPrecisionCheckResult: lowPrecisionCheckResult,

        t_agua: Number.isFinite(waterMean) ? waterMean : null,
        t_amostra: Number.isFinite(sampleMean) ? sampleMean : null,
        waterTimes: joinTimes(mergedTimes.waterTimes),
        sampleTimes: joinTimes(mergedTimes.sampleTimes),

        // Ajuda o backend a formar n_eff quando disponível
        n_extra_video_sample: Math.max(0, vidSampleTimes.length - 1),
        n_extra_manual_sample: Math.max(0, (data.times?.sampleTimes?.length ?? 0) - 1),
      }
      try { localStorage.setItem("frontend_export_rows", JSON.stringify([exportRow])) } catch {}
      try { localStorage.removeItem("wizardData"); localStorage.removeItem("wizardStep") } catch {}
      setTimeout(() => {
        router.push("/app/resultados")
      }, 1000)
      return

      const expected = await computeExpectedValues(data.profile, data.density)
      const t = new Worker("/workers/calcWorker_integrado.js")
      t.onmessage = (e2) => {
        const payload = e2.data
        try { localStorage.setItem("lastWorkerPayload", JSON.stringify(payload)) } catch {}
        const expectedNowPromise = computeExpectedValues(data.profile, data.density)
        const formatCompositionLine = (comp: { agua: number; et: number; met: number }) => {
          const a = Number((comp.agua*100).toFixed(1))
          const e = Number((comp.et*100).toFixed(1))
          const m = Number((comp.met*100).toFixed(1))
          const parts: string[] = []
          if (a > 0) parts.push(`Água ${a}%;`)
          if (e > 0) parts.push(`etanol ${e}%;`)
          if (m > 0) parts.push(`metanol ${m}%;`)
          if (parts.length === 2) return parts[0] + " " + parts[1].replace(";", ".")
          if (parts.length === 1) return parts[0].replace(";", ".")
          return `${parts[0]} ${parts[1]} e ${parts[2].replace(";", "")}.`
        }
        const mean = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN
        const stdev = (arr: number[]) => {
          if (arr.length < 2) return NaN
          const m = mean(arr)
          const v = arr.reduce((s,x)=>s+Math.pow(x-m,2),0)/(arr.length-1)
          return Math.sqrt(v)
        }
        const cvPct = (arr: number[]) => {
          const m = mean(arr)
          const s = stdev(arr)
          if (!isFinite(m) || !isFinite(s) || m === 0) return NaN
          return (s/m)*100
        }
        const rhoWater = (tC: number | undefined | null) => {
          const t = typeof tC === "number" ? tC : 20
          const rho = 999.842594 + 6.793952e-2*t - 9.09529e-3*t*t + 1.001685e-4*t**3 - 1.120083e-6*t**4 + 6.536332e-9*t**5
          return rho/1000.0
        }
        const computeMuAbs = (hm_cm: number, t_s: number, delta_v_uL: number, rho_g_per_ml: number) => {
          const r = 0.0002065
          const g = 9.81
          const L = 0.025
          let mu = 1000.0 * Math.PI * (r**4) * rho_g_per_ml * g * (hm_cm/100.0) * t_s
          mu /= (8.0 * L * (delta_v_uL*1e-6))
          return mu
        }
        const minimal: {
          conditions: {
            temperature: number | null
            sampleTemperature: number | null
            waterType: string | null
            beverageType: string | null
            labelAbv: number | null
            labelUnit: string | null
            brand: string | null
            sampleName: string | null
            ethanolMassPercent: number | null
            methanolMassPercent: number | null
          }
          expectedComposition: { agua: number; et: number; met: number } | null
          composition: { mm: { agua: number; et: number; met: number } | null; vv: null }
          rawTimes: { waterTimes: number[]; sampleTimes: number[] }
          createdAt: string
          viscosity: {
            waterMeanTime: number | null
            sampleMeanTime: number | null
            viscosityRel: number | null
            cvWaterTime: number | null
            cvSampleTime: number | null
            muAbsWater: number | null
            muAbsSample: number | null
          }
        } = {
          conditions: {
            temperature: data.waterTemp?.waterTemperature ?? null,
            sampleTemperature: data.waterTemp?.sampleTemperature ?? null,
            waterType: data.waterTemp?.waterType ?? null,
            beverageType: data.profile?.beverageType ?? null,
            labelAbv: data.profile?.labelAbv ?? null,
            labelUnit: data.profile?.labelUnit ?? null,
            brand: data.profile?.brand ?? null,
            sampleName: data.profile?.sampleName ?? null,
            ethanolMassPercent: data.profile?.beverageType === "Outra hidroalcoólica" && typeof data.profile?.ethanolMassPercent === 'number' ? data.profile.ethanolMassPercent : null,
            methanolMassPercent: data.profile?.beverageType === "Outra hidroalcoólica" && typeof data.profile?.methanolMassPercent === 'number' ? data.profile.methanolMassPercent : null,
          },
          expectedComposition: null,
          composition: { mm: null, vv: null },
          rawTimes: { waterTimes: mergedTimes.waterTimes, sampleTimes: mergedTimes.sampleTimes },
          createdAt: new Date().toISOString(),
          viscosity: (() => {
            const wT = mergedTimes.waterTimes.filter((x): x is number => typeof x === 'number' && !isNaN(x))
            const sT = mergedTimes.sampleTimes.filter((x): x is number => typeof x === 'number' && !isNaN(x))
            const waterMeanTime = isFinite(mean(wT)) ? mean(wT) : null
            const sampleMeanTime = isFinite(mean(sT)) ? mean(sT) : null
            const viscosityRel = (waterMeanTime != null && sampleMeanTime != null && waterMeanTime !== 0) ? (sampleMeanTime/waterMeanTime) : null
            const muAbsWater = (typeof waterMeanTime === 'number' && isFinite(waterMeanTime)) ? computeMuAbs(7, waterMeanTime, 4000, rhoWater(data.waterTemp?.waterTemperature ?? undefined)) : null
            const muAbsSample = (typeof sampleMeanTime === 'number' && isFinite(sampleMeanTime)) ? computeMuAbs(7, sampleMeanTime, 4000, rhoWater(data.waterTemp?.sampleTemperature ?? undefined)) : null
            const cvWaterTime = isFinite(cvPct(wT)) ? cvPct(wT) : null
            const cvSampleTime = isFinite(cvPct(sT)) ? cvPct(sT) : null
            return { waterMeanTime, sampleMeanTime, viscosityRel, cvWaterTime, cvSampleTime, muAbsWater, muAbsSample }
          })(),
        }
        expectedNowPromise.then((expectedNow) => {
          minimal.expectedComposition = expectedNow ?? null
          minimal.composition = { mm: expectedNow ?? null, vv: null }
          if (payload && payload.ok) {
            type WorkerResultObj = {
              ternaria?: { equivalentes?: string; classe_final?: string; compativel?: string }
              mostLikely?: number
              erroMuMalhaAbs?: number
              erroMuMalhaPct?: number
              w_alcool?: unknown
            }
            const resultObj: WorkerResultObj = (payload.result as WorkerResultObj) || ({ w_alcool: payload.w_alcool, ternaria: payload.ternaria } as WorkerResultObj)
            const resultAny: any = (payload && payload.result && typeof payload.result === 'object') ? payload.result : payload
            const approvals = resultAny?.approvals
            const flags = resultAny?.flags
            const expectedTextFromWorker = resultAny?.expectedText

            const ternaria = resultObj?.ternaria
            const merged = {
              ...minimal,
              equivalentes: (() => { const s = String(ternaria?.equivalentes ?? '').trim(); return s ? s : (expectedNow ? formatCompositionLine(expectedNow) : null) })(),
              compativel: ternaria?.compativel ?? undefined,
              classe_final: ternaria?.classe_final ?? undefined,
              ternaria,
              mostLikely: resultObj.mostLikely ?? undefined,
              erroMuMalhaAbs: resultObj.erroMuMalhaAbs ?? undefined,
              erroMuMalhaPct: resultObj.erroMuMalhaPct ?? undefined,
              approvals: approvals ?? undefined,
              flags: flags ?? undefined,
              expectedText: (typeof expectedTextFromWorker === 'string' && expectedTextFromWorker.trim()) ? expectedTextFromWorker : (expectedNow ? formatCompositionLine(expectedNow) : null),
            }
            try { localStorage.setItem("lastResult", JSON.stringify(merged)) } catch {}
            try { localStorage.removeItem("wizardData"); localStorage.removeItem("wizardStep") } catch {}
            router.push("/app/resultados")
          } else {
            try { localStorage.setItem("lastResult", JSON.stringify(minimal)) } catch {}
            router.push("/app/resultados")
          }
          t.terminate()
        })
      }
      t.onerror = () => {
        try { localStorage.setItem("lastWorkerError", "worker error onmessage") } catch {}
        const expected2Promise = computeExpectedValues(data.profile, data.density)
        const minimal: {
          conditions: {
            temperature: number | null
            sampleTemperature: number | null
            waterType: string | null
            beverageType: string | null
            labelAbv: number | null
            labelUnit: string | null
            brand: string | null
            sampleName: string | null
            ethanolMassPercent: number | null
            methanolMassPercent: number | null
          }
          expectedComposition: { agua: number; et: number; met: number } | null
          composition: { mm: { agua: number; et: number; met: number } | null; vv: null }
          equivalentes: string | null
          rawTimes: { waterTimes: number[]; sampleTimes: number[] }
          createdAt: string
        } = {
          conditions: {
            temperature: data.waterTemp?.waterTemperature ?? null,
            sampleTemperature: data.waterTemp?.sampleTemperature ?? null,
            waterType: data.waterTemp?.waterType ?? null,
            beverageType: data.profile?.beverageType ?? null,
            labelAbv: data.profile?.labelAbv ?? null,
            labelUnit: data.profile?.labelUnit ?? null,
            brand: data.profile?.brand ?? null,
            sampleName: data.profile?.sampleName ?? null,
            ethanolMassPercent: data.profile?.beverageType === "Outra hidroalcoólica" && typeof data.profile?.ethanolMassPercent === 'number' ? data.profile.ethanolMassPercent : null,
            methanolMassPercent: data.profile?.beverageType === "Outra hidroalcoólica" && typeof data.profile?.methanolMassPercent === 'number' ? data.profile.methanolMassPercent : null,
          },
          expectedComposition: null,
          composition: { mm: null, vv: null },
          equivalentes: null,
          rawTimes: { waterTimes: mergedTimes.waterTimes, sampleTimes: mergedTimes.sampleTimes },
          createdAt: new Date().toISOString(),
        }
        expected2Promise.then((expected2) => {
          minimal.expectedComposition = expected2 ?? null
          minimal.composition = { mm: expected2 ?? null, vv: null }
          const fmt = (comp: { agua: number; et: number; met: number }) => {
            const a = Number((comp.agua*100).toFixed(1))
            const e = Number((comp.et*100).toFixed(1))
            const m = Number((comp.met*100).toFixed(1))
            const parts: string[] = []
            if (a > 0) parts.push(`Água ${a}%;`)
            if (e > 0) parts.push(`etanol ${e}%;`)
            if (m > 0) parts.push(`metanol ${m}%;`)
            if (parts.length === 2) return parts[0] + " " + parts[1].replace(";", ".")
            if (parts.length === 1) return parts[0].replace(";", ".")
            return `${parts[0]} ${parts[1]} e ${parts[2].replace(";", "")}.`
          }
          minimal.equivalentes = expected2 ? fmt(expected2) : null
          try { localStorage.setItem("lastResult", JSON.stringify(minimal)) } catch {}
          router.push("/app/resultados")
          t.terminate()
        })
      }
      t.postMessage({ profile: data.profile, waterTemp: data.waterTemp, density: data.density, times: mergedTimes, expected, agua: expected?.agua, et: expected?.et, met: expected?.met })
    } catch {
      const expectedPromise = computeExpectedValues(data.profile, data.density)
      const minimal: {
        conditions: {
          temperature: number | null
          sampleTemperature: number | null
          waterType: string | null
          beverageType: string | null
          labelAbv: number | null
          labelUnit: string | null
          brand: string | null
          sampleName: string | null
          ethanolMassPercent: number | null
          methanolMassPercent: number | null
        }
        expectedComposition: { agua: number; et: number; met: number } | null
        composition: { mm: { agua: number; et: number; met: number } | null; vv: null }
        equivalentes: string | null
        rawTimes: { waterTimes: number[]; sampleTimes: number[] }
        createdAt: string
      } = {
        conditions: {
          temperature: data.waterTemp?.waterTemperature ?? null,
          sampleTemperature: data.waterTemp?.sampleTemperature ?? null,
          waterType: data.waterTemp?.waterType ?? null,
          beverageType: data.profile?.beverageType ?? null,
          labelAbv: data.profile?.labelAbv ?? null,
          labelUnit: data.profile?.labelUnit ?? null,
          brand: data.profile?.brand ?? null,
          sampleName: data.profile?.sampleName ?? null,
          ethanolMassPercent: data.profile?.beverageType === "Outra hidroalcoólica" && typeof data.profile?.ethanolMassPercent === 'number' ? data.profile.ethanolMassPercent : null,
          methanolMassPercent: data.profile?.beverageType === "Outra hidroalcoólica" && typeof data.profile?.methanolMassPercent === 'number' ? data.profile.methanolMassPercent : null,
        },
        expectedComposition: null,
        composition: { mm: null, vv: null },
        equivalentes: null,
        rawTimes: { waterTimes: (data.times?.waterTimes ?? []).filter((v): v is number => typeof v === 'number' && !isNaN(v)), sampleTimes: (data.times?.sampleTimes ?? []).filter((v): v is number => typeof v === 'number' && !isNaN(v)) },
        createdAt: new Date().toISOString(),
      }
      expectedPromise.then((expected) => {
        minimal.expectedComposition = expected ?? null
        minimal.composition = { mm: expected ?? null, vv: null }
        const fmt = (comp: { agua: number; et: number; met: number }) => {
          const a = Number((comp.agua*100).toFixed(1))
          const e = Number((comp.et*100).toFixed(1))
          const m = Number((comp.met*100).toFixed(1))
          const parts: string[] = []
          if (a > 0) parts.push(`Água ${a}%;`)
          if (e > 0) parts.push(`etanol ${e}%;`)
          if (m > 0) parts.push(`metanol ${m}%;`)
          if (parts.length === 2) return parts[0] + " " + parts[1].replace(";", ".")
          if (parts.length === 1) return parts[0].replace(";", ".")
          return `${parts[0]} ${parts[1]} e ${parts[2].replace(";", "")}.`
        }
        minimal.equivalentes = expected ? fmt(expected) : null
        try { localStorage.setItem("lastResult", JSON.stringify(minimal)) } catch {}
        router.push("/app/resultados")
      })
    }
  }

  return (
    <div className="md:max-w-md md:mx-auto">
      {step === 1 && (
        <>
          <StepProfile
            initialData={data.profile}
            onNext={(d) => { setData({ ...data, profile: d }); next(); }}
            renderAfterTitle={
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="text-xs text-[#002060] underline hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Teste com dados de exemplos reais
                </button>
              </div>
            }
          />
          <DemoModal
            isOpen={showDemoModal}
            onClose={() => setShowDemoModal(false)}
            onSelect={handleDemoSelect}
          />
        </>
      )}
      {step === 2 && (
        <StepSampleData initialData={data.profile} onBack={back} onNext={(d) => { setData({ ...data, profile: d }); next(); }} demoMode={demoMode} />
      )}
      {step === 3 && (
        <StepDensity initialData={data.density} onBack={back} onNext={(d) => { setData({ ...data, density: d }); next(); }} wizardData={{ profile: data.profile }} demoMode={demoMode} />
      )}
      {step === 4 && (
        <StepWaterTemp initialData={data.waterTemp} onBack={back} onNext={(d) => { setData({ ...data, waterTemp: d }); next(); }} demoMode={demoMode} />
      )}
      {step === 5 && (
        <StepTimes initialData={data.times} onBack={back} onNext={(d) => { setData({ ...data, times: d }); next(); }} demoMode={demoMode} />
      )}
      {step === 6 && (
        <StepReviewCalculate data={data} onBack={back} onCalculate={handleCalculate} />
      )}
      {calculating && <CalculatingOverlay />}
    </div>
  )
}