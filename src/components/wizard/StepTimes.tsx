"use client"
import React, { useRef, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { timesSchema, TimesData } from "@/lib/schemas"
import Link from "next/link"
import * as Slider from "@radix-ui/react-slider"
import { Camera, Image as ImageIcon } from "lucide-react"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"

 

type Replicate = { previewUrl: string; duration: number; fileName?: string; fileCreatedAt?: string; marks: Record<13|14|15|16|17|18, number|undefined>; volumesMarked: Array<13|14|15|16|17|18>; derived?: { points: Array<{x:number;y:number}>; slope: number; intercept: number; r2: number; estimatedTime: number } }

export default function StepTimes({ onNext, onBack, initialData }: { onNext: (data: TimesData) => void; onBack: () => void; initialData?: TimesData }) {
  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<TimesData>({
    resolver: zodResolver(timesSchema),
    defaultValues: initialData ?? { waterTimes: [], sampleTimes: [] },
  });
  const waterTimes = watch("waterTimes") || []
  const sampleTimes = watch("sampleTimes") || []

  


  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoTarget, setVideoTarget] = useState<"water" | "sample" | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [coarseTime, setCoarseTime] = useState<number>(0)
  const [fineMin, setFineMin] = useState<number>(0)
  const [fineMax, setFineMax] = useState<number>(0.5)
  const [fineTime, setFineTime] = useState<number>(0)
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0)
  const [marks, setMarks] = useState<Record<13 | 14 | 15 | 16 | 17 | 18, number | undefined>>({ 18: undefined, 17: undefined, 16: undefined, 15: undefined, 14: undefined, 13: undefined })
  const [waterReplicates, setWaterReplicates] = useState<Array<Replicate>>([])
  const [sampleReplicates, setSampleReplicates] = useState<Array<Replicate>>([])
  const [editing, setEditing] = useState<{target:"water"|"sample"; index:number} | null>(null)
  const [currentFileName, setCurrentFileName] = useState<string | undefined>(undefined)
  const [currentFileCreatedAt, setCurrentFileCreatedAt] = useState<string | undefined>(undefined)
  const [offset, setOffset] = useState<{x:number;y:number}>({x:0,y:0})
  const [pointers, setPointers] = useState<Array<{id:number;x:number;y:number}>>([])
  const [initialGesture, setInitialGesture] = useState<{dist:number;zoom:number;offset:{x:number;y:number}} | null>(null)
  const [customError, setCustomError] = useState<string | null>(null)
  const [zoom, setZoom] = useState<number>(2)
  const [interactionMode, setInteractionMode] = useState<'video'|'scroll'|null>(null)
  const repeatRef = useRef<number | null>(null)
  const [manualWaterInput, setManualWaterInput] = useState<string>("")
  const [manualSampleInput, setManualSampleInput] = useState<string>("")
  const [showTimerModal, setShowTimerModal] = useState(false)
  const [timerTarget, setTimerTarget] = useState<"water"|"sample"|null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef<number | null>(null)
  const timerIntRef = useRef<number | null>(null)

  const parseFlexibleDecimal = (input: string): number => {
    const s = String(input ?? "").trim()
    if (!s) return NaN
    const hasComma = s.includes(',')
    const hasDot = s.includes('.')
    let normalized = s
    if (hasComma && hasDot) {
      normalized = s.replace(/\./g, '').replace(',', '.')
    } else if (hasComma) {
      normalized = s.replace(',', '.')
    }
    const n = Number(normalized)
    return isNaN(n) ? NaN : n
  }

  const openTimer = (target: "water"|"sample") => {
    setTimerTarget(target)
    setElapsedMs(0)
    setTimerRunning(false)
    setShowTimerModal(true)
  }
  const startTimer = () => {
    if (timerRunning) return
    setElapsedMs(0)
    startRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
    setTimerRunning(true)
    timerIntRef.current = window.setInterval(() => {
      if (startRef.current != null) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
        setElapsedMs(now - startRef.current)
      }
    }, 50)
  }
  const stopTimer = () => {
    if (!timerRunning) return
    setTimerRunning(false)
    if (timerIntRef.current != null) { clearInterval(timerIntRef.current); timerIntRef.current = null }
  }
  const saveTimer = () => {
    const val = Math.max(0, Math.round((elapsedMs/1000)*10)/10)
    if (!val || !timerTarget) return
    if (timerTarget === "water") {
      const next = [...waterTimes, val]
      setValue("waterTimes", next, { shouldValidate: true })
      try { localStorage.setItem("manualTimesWater", JSON.stringify(next)) } catch {}
    } else {
      const next = [...sampleTimes, val]
      setValue("sampleTimes", next, { shouldValidate: true })
      try { localStorage.setItem("manualTimesSample", JSON.stringify(next)) } catch {}
    }
    setShowTimerModal(false)
    setTimerTarget(null)
  }

  useEffect(() => {
    if (videoUrl) {
      setCoarseTime(0)
      setFineMin(0)
      setFineMax(0.5)
      setFineTime(0)
      setCurrentTimeSec(0)
      setMarks({ 18: undefined, 17: undefined, 16: undefined, 15: undefined, 14: undefined, 13: undefined })
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
  }, [videoUrl])

  useEffect(() => {
    try {
      const wRaw = localStorage.getItem("videoReplicasWater")
      const sRaw = localStorage.getItem("videoReplicasSample")
      if (wRaw) setWaterReplicates(JSON.parse(wRaw))
      if (sRaw) setSampleReplicates(JSON.parse(sRaw))
      const wmRaw = localStorage.getItem("manualTimesWater")
      const smRaw = localStorage.getItem("manualTimesSample")
      if (wmRaw) setValue("waterTimes", JSON.parse(wmRaw))
      if (smRaw) setValue("sampleTimes", JSON.parse(smRaw))
    } catch {}
  }, [setValue])
  useEffect(() => {
    if (showVideoModal) {
      try { document.body.style.overflow = "hidden" } catch {}
    } else {
      try { document.body.style.overflow = "" } catch {}
    }
    return () => { try { document.body.style.overflow = "" } catch {} }
  }, [showVideoModal])

  useEffect(() => {
    const handler = () => {
      setWaterReplicates([])
      setSampleReplicates([])
      try {
        localStorage.removeItem("videoReplicasWater")
        localStorage.removeItem("videoReplicasSample")
        localStorage.removeItem("manualTimesWater")
        localStorage.removeItem("manualTimesSample")
      } catch {}
    }
    window.addEventListener("clearReplicates", handler)
    return () => window.removeEventListener("clearReplicates", handler)
  }, [])

  const handleFilePicked = (file: File | null, target: "water" | "sample") => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setCurrentFileName(file.name)
    try { setCurrentFileCreatedAt(new Date(file.lastModified).toISOString()) } catch { setCurrentFileCreatedAt(undefined) }
    setVideoTarget(target)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setShowVideoModal(true)
  }
  
  const onLoadedMetadata = () => {
    const d = videoRef.current?.duration || 0
    setDuration(d)
    setCoarseTime(0)
    setFineMin(0)
    setFineMax(Math.min(0.5, d))
    setFineTime(0)
  }
  const seekTo = (t: number) => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = Math.max(0, Math.min(duration, t))
    setCurrentTimeSec(v.currentTime)
  }
  const onChangeCoarse = (value: number[]) => {
    const t = value[0]
    setCoarseTime(t)
    const min = Math.max(0, t - 0.5)
    const max = Math.min(duration, t + 0.5)
    setFineMin(min)
    setFineMax(max)
    const mid = (min + max) / 2
    setFineTime(mid)
    seekTo(mid)
  }
  const onChangeFine = (value: number[]) => {
    const t = value[0]
    setFineTime(t)
    setCoarseTime(t)
    seekTo(t)
    const span = fineMax - fineMin
    const thresh = span * 0.2
    if (t > fineMax - thresh) {
      const shift = Math.min(thresh, duration - fineMax)
      if (shift > 0) {
        setFineMin(fineMin + shift)
        setFineMax(fineMax + shift)
      }
    } else if (t < fineMin + thresh) {
      const shift = Math.min(thresh, fineMin)
      if (shift > 0) {
        setFineMin(fineMin - shift)
        setFineMax(fineMax - shift)
      }
    }
  }

  const nudgeFine = (delta: number) => {
    const t = Math.max(0, Math.min(duration, fineTime + delta))
    onChangeFine([t])
  }
  const startRepeat = (delta: number) => {
    if (repeatRef.current != null) return
    nudgeFine(delta)
    repeatRef.current = window.setInterval(() => nudgeFine(delta), 100)
  }
  const stopRepeat = () => {
    if (repeatRef.current != null) {
      clearInterval(repeatRef.current)
      repeatRef.current = null
    }
  }
  const assignMark = (vol: 13 | 14 | 15 | 16 | 17 | 18) => {
    const t = currentTimeSec
    setMarks((prev) => ({ ...prev, [vol]: t }))
  }
  const markedVolumes = ((): Array<13|14|15|16|17|18> => {
    const vols: Array<13|14|15|16|17|18> = []
    ;([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).forEach((v) => { if (marks[v] != null) vols.push(v) })
    return vols
  })()
  const allMarked = ([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).every((v) => marks[v] != null)
  const increasing = allMarked ? ((marks[18] as number) < (marks[17] as number) && (marks[17] as number) < (marks[16] as number) && (marks[16] as number) < (marks[15] as number) && (marks[15] as number) < (marks[14] as number) && (marks[14] as number) < (marks[13] as number)) : false
  const canFinalize = allMarked && increasing
  const persistReplicas = (target: "water" | "sample", list: Replicate[]) => {
    try {
      const key = target === "water" ? "videoReplicasWater" : "videoReplicasSample"
      localStorage.setItem(key, JSON.stringify(list))
    } catch {}
  }
  const finalizeReplicate = () => {
    if (!canFinalize || !videoTarget) return
    const replicateBase: Replicate = { previewUrl: videoUrl as string, duration, fileName: currentFileName, fileCreatedAt: currentFileCreatedAt, marks: { ...marks }, volumesMarked: markedVolumes }
    try {
      const worker = new Worker("/workers/calcWorker.js")
      worker.onmessage = (e) => {
        const payload = e.data
        let replicate: Replicate = { ...replicateBase }
        if (payload && payload.ok && payload.instantes) {
          replicate = { ...replicateBase, derived: payload.instantes }
        }
        if (editing && editing.target === "water") {
          setWaterReplicates(prev => { const next = prev.map((r, i) => (i === editing.index ? replicate : r)); persistReplicas("water", next); return next })
        } else if (editing && editing.target === "sample") {
          setSampleReplicates(prev => { const next = prev.map((r, i) => (i === editing.index ? replicate : r)); persistReplicas("sample", next); return next })
        } else if (videoTarget === "water") {
          setWaterReplicates(prev => { const next = [...prev, replicate]; persistReplicas("water", next); return next })
        } else if (videoTarget === "sample") {
          setSampleReplicates(prev => { const next = [...prev, replicate]; persistReplicas("sample", next); return next })
        }
        setShowVideoModal(false)
        setVideoTarget(null)
        setVideoUrl(null)
        setEditing(null)
        worker.terminate()
      }
      worker.onerror = () => {
        // Persist even if worker fails, without derived data
        const replicate = { ...replicateBase }
        if (editing && editing.target === "water") {
          setWaterReplicates(prev => { const next = prev.map((r, i) => (i === editing.index ? replicate : r)); persistReplicas("water", next); return next })
        } else if (editing && editing.target === "sample") {
          setSampleReplicates(prev => { const next = prev.map((r, i) => (i === editing.index ? replicate : r)); persistReplicas("sample", next); return next })
        } else if (videoTarget === "water") {
          setWaterReplicates(prev => { const next = [...prev, replicate]; persistReplicas("water", next); return next })
        } else if (videoTarget === "sample") {
          setSampleReplicates(prev => { const next = [...prev, replicate]; persistReplicas("sample", next); return next })
        }
        setShowVideoModal(false)
        setVideoTarget(null)
        setVideoUrl(null)
        setEditing(null)
        worker.terminate()
      }
      worker.postMessage({ type: "instantes", target: videoTarget, marks })
    } catch {
      const replicate = { ...replicateBase }
      if (editing && editing.target === "water") {
        setWaterReplicates(prev => { const next = prev.map((r, i) => (i === editing.index ? replicate : r)); persistReplicas("water", next); return next })
      } else if (editing && editing.target === "sample") {
        setSampleReplicates(prev => { const next = prev.map((r, i) => (i === editing.index ? replicate : r)); persistReplicas("sample", next); return next })
      } else if (videoTarget === "water") {
        setWaterReplicates(prev => { const next = [...prev, replicate]; persistReplicas("water", next); return next })
      } else if (videoTarget === "sample") {
        setSampleReplicates(prev => { const next = [...prev, replicate]; persistReplicas("sample", next); return next })
      }
      setShowVideoModal(false)
      setVideoTarget(null)
      setVideoUrl(null)
      setEditing(null)
    }
  }

  const deleteReplicate = (target: "water" | "sample", index: number) => {
    const ok = typeof window !== 'undefined' ? window.confirm("Deseja realmente excluir essa replicata?") : true
    if (!ok) return
    if (target === "water") {
      setWaterReplicates(prev => { const next = prev.filter((_, i) => i !== index); persistReplicas("water", next); return next })
    } else {
      setSampleReplicates(prev => { const next = prev.filter((_, i) => i !== index); persistReplicas("sample", next); return next })
    }
  }

  const addManualTime = (target: "water" | "sample") => {
    const raw = target === "water" ? manualWaterInput : manualSampleInput
    const val = parseFlexibleDecimal(raw)
    if (typeof val !== 'number' || isNaN(val) || val <= 0) return
    if (target === "water") {
      const next = [...waterTimes, val]
      setValue("waterTimes", next, { shouldValidate: true })
      try { localStorage.setItem("manualTimesWater", JSON.stringify(next)) } catch {}
      setManualWaterInput("")
    } else {
      const next = [...sampleTimes, val]
      setValue("sampleTimes", next, { shouldValidate: true })
      try { localStorage.setItem("manualTimesSample", JSON.stringify(next)) } catch {}
      setManualSampleInput("")
    }
  }
  const removeManualTime = (target: "water" | "sample", index: number) => {
    if (target === "water") {
      const next = waterTimes.filter((_, i) => i !== index)
      setValue("waterTimes", next, { shouldValidate: true })
      try { localStorage.setItem("manualTimesWater", JSON.stringify(next)) } catch {}
    } else {
      const next = sampleTimes.filter((_, i) => i !== index)
      setValue("sampleTimes", next, { shouldValidate: true })
      try { localStorage.setItem("manualTimesSample", JSON.stringify(next)) } catch {}
    }
  }

  const validateReplicasBeforeNext = (): boolean => {
    setCustomError(null)
    const hasWater = (waterReplicates.length > 0) || (waterTimes.length > 0)
    const hasSample = (sampleReplicates.length > 0) || (sampleTimes.length > 0)
    if (!hasWater || !hasSample) { setCustomError("Necessário pelo menos um ensaio para Água e um para Amostra."); return false }
    if (waterReplicates.length > 0 && sampleReplicates.length > 0) {
      const w = waterReplicates.reduce((a,b) => (b.volumesMarked.length > a.volumesMarked.length ? b : a))
      const s = sampleReplicates.reduce((a,b) => (b.volumesMarked.length > a.volumesMarked.length ? b : a))
      if (w.volumesMarked.length < 4 || s.volumesMarked.length < 4) { setCustomError("Cada vídeo deve ter pelo menos 4 de 6 frames marcados."); return false }
      const big = w.volumesMarked.length >= s.volumesMarked.length ? w : s
      const small = big === w ? s : w
      const ok = small.volumesMarked.every((v) => big.volumesMarked.includes(v))
      if (!ok) { setCustomError("O vídeo com mais frames deve conter todos os frames marcados no outro."); return false }
    }
    return true
  }

  const submitHandler = handleSubmit((formData) => {
    if (!validateReplicasBeforeNext()) return
    onNext(formData)
  })
  
  // Verificar se pode avançar
  const canProgress = () => {
    const hasWater = (waterReplicates.length > 0) || (waterTimes.length > 0)
    const hasSample = (sampleReplicates.length > 0) || (sampleTimes.length > 0)
    return hasWater && hasSample
  }
  
  // Hook de swipe - só quando não há modals abertos e quando pode avançar
  useSwipe({
    onSwipeLeft: canProgress() ? submitHandler : undefined,
    onSwipeRight: onBack
  }, !showVideoModal && !showTimerModal && canProgress())
  return (
    <form className="space-y-3 p-4" onSubmit={submitHandler}>
      <h1 className="text-xl font-bold text-[#002060]">Registre o escoamento</h1>
      <div className="text-xs leading-tight text-neutral-700 text-justify space-y-1">
        <p>
          <span className="font-bold">Etapa mais sensível da metodologia</span>. Não deixe de consultar a <Link href="/metodologia" className="underline">Metodologia</Link> em caso de dúvida.
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <span className="font-bold">Use seringa de 20 mL limpa e seca</span>, livre de detergente, ou a enxágue com o líquido analisado.
          </li>
          <li>
            Deixe o cronômetro em posição de disparar em sua mão, <span className="font-bold">preencha a seringa (sem êmbulo) com o líquido analisado</span>, por cima, até próximo à marcação de 20 mL e mantenha os seus olhos na altura do menisco (parte inferior da curva que define o nível do líquido).
          </li>
          <li>
            Quando o menisco <span className="font-bold">encostar na graduação 15 mL</span>, dispare o cronômetro imediatamente. Continue acompanhando o menisco e interrompa o menisco imediatamente quando o menisco <span className="font-bold">tocar a marcação de 10 mL</span>.
          </li>
        </ol>
        <p>
          <span className="font-bold">Faça pelo menos dois escoamento (replicata)</span>. Se o recipiente coletor estiver limpo e seco, você poderá reaproveitar o líquido.
        </p>
      </div>
      {/* Show validation messages when not enough replicas */}
      {(errors?.waterTimes || errors?.sampleTimes) && (
        <p className="text-red-600 text-sm">{errors?.waterTimes?.message || errors?.sampleTimes?.message as string}</p>
      )}
      {customError && (
        <p className="text-red-600 text-sm">{customError}</p>
      )}
      <p className="text-sm text-neutral-600">Use o mesmo bico/seringa; não bompeie o êmbolo. Observe o menisco à altura dos olhos. Se perder o acionamento, complete o volume e refaça.</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-medium" style={{ color: "var(--color-label)" }}>Água - vídeo(s)</div>
          <div className="flex flex-col gap-2">
            <label className="border rounded-lg px-3 py-3 text-sm inline-flex items-center gap-2">
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Gravar vídeo</span>
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => handleFilePicked(e.target.files?.[0] || null, "water")}
              />
            </label>
            <label className="border rounded-lg px-3 py-3 text-sm inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
              <span>Selecionar galeria</span>
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(e) => handleFilePicked(e.target.files?.[0] || null, "water")}
              />
            </label>
            {waterReplicates.length > 0 && <div className="mt-2 text-sm font-medium">Ensaios realizados</div>}
            {waterReplicates.map((r, idx) => (
              <div key={idx} className="space-y-2">
                <div className="px-3 py-2 border rounded-lg flex items-center justify-between">
                  <span className="text-xs">Replicata {idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <button type="button" className="text-xs underline" onClick={() => { setEditing({ target: "water", index: idx }); setVideoTarget("water"); setVideoUrl(r.previewUrl); setMarks(r.marks); setShowVideoModal(true) }}>Editar</button>
                    <button type="button" className="text-xs underline text-red-600" onClick={() => deleteReplicate("water", idx)}>Excluir</button>
                  </div>
                </div>
                <div className="text-xs text-neutral-600">Arquivo: {r.fileName ?? "-"} • Criado: {r.fileCreatedAt ? new Date(r.fileCreatedAt).toLocaleString() : "-"}</div>
                <div className="text-xs text-neutral-600">Instantes (mL:s): {([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")}</div>
                <div className="w-full max-w-sm overflow-hidden h-24 md:h-28">
                  <video src={r.previewUrl} className="w-full h-full object-cover" playsInline muted controls preload="metadata" />
                </div>
              </div>
            ))}
            <div className="mt-3">
              <div className="font-medium text-sm" style={{ color: "var(--color-label)" }}>Inserção manual de tempo (s)</div>
              <div className="mt-1">
                <input type="text" inputMode="decimal" placeholder="Tempo (s)" value={manualWaterInput} onChange={(e) => setManualWaterInput(e.target.value)} className="border rounded-lg p-2 w-full" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={() => addManualTime("water")} className="border rounded-lg px-3 py-2 text-sm">Adicionar</button>
                <button type="button" onClick={() => openTimer("water")} className="border rounded-lg px-3 py-2 text-sm">Cronômetro</button>
              </div>
              {waterTimes.length > 0 && (
                <div className="mt-2 space-y-2">
                  {waterTimes.map((t, i) => (
                    <div key={i} className="space-y-1">
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">Replicata {waterReplicates.length + i + 1}</span>
                          <span className="text-xs text-neutral-600">Tempo: {t.toFixed(2)} s</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeManualTime("water", i)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Excluir tempo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>

        <div>
          <div className="font-medium" style={{ color: "var(--color-label)" }}>Amostra - vídeo(s)</div>
          <div className="flex flex-col gap-2">
            <label className="border rounded-lg px-3 py-3 text-sm inline-flex items-center gap-2">
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Gravar vídeo</span>
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => handleFilePicked(e.target.files?.[0] || null, "sample")}
              />
            </label>
            <label className="border rounded-lg px-3 py-3 text-sm inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
              <span>Selecionar galeria</span>
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(e) => handleFilePicked(e.target.files?.[0] || null, "sample")}
              />
            </label>
            {sampleReplicates.length > 0 && <div className="mt-2 text-sm font-medium">Ensaios realizados</div>}
            {sampleReplicates.map((r, idx) => (
              <div key={idx} className="space-y-2">
                <div className="px-3 py-2 border rounded-lg flex items-center justify-between">
                  <span className="text-xs">Replicata {idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <button type="button" className="text-xs underline" onClick={() => { setEditing({ target: "sample", index: idx }); setVideoTarget("sample"); setVideoUrl(r.previewUrl); setMarks(r.marks); setShowVideoModal(true) }}>Editar</button>
                    <button type="button" className="text-xs underline text-red-600" onClick={() => deleteReplicate("sample", idx)}>Excluir</button>
                  </div>
                </div>
                <div className="text-xs text-neutral-600">Arquivo: {r.fileName ?? "-"} • Criado: {r.fileCreatedAt ? new Date(r.fileCreatedAt).toLocaleString() : "-"}</div>
                <div className="text-xs text-neutral-600">Instantes (mL:s): {([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")}</div>
                <div className="w-full max-w-sm overflow-hidden h-24 md:h-28">
                  <video src={r.previewUrl} className="w-full h-full object-cover" playsInline muted controls preload="metadata" />
                </div>
              </div>
            ))}
            <div className="mt-3">
              <div className="font-medium text-sm" style={{ color: "var(--color-label)" }}>Inserção manual de tempo (s)</div>
              <div className="mt-1">
                <input type="text" inputMode="decimal" placeholder="Tempo (s)" value={manualSampleInput} onChange={(e) => setManualSampleInput(e.target.value)} className="border rounded-lg p-2 w-full" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={() => addManualTime("sample")} className="border rounded-lg px-3 py-2 text-sm">Adicionar</button>
                <button type="button" onClick={() => openTimer("sample")} className="border rounded-lg px-3 py-2 text-sm">Cronômetro</button>
              </div>
              {sampleTimes.length > 0 && (
                <div className="mt-2 space-y-2">
                  {sampleTimes.map((t, i) => (
                    <div key={i} className="space-y-1">
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">Replicata {sampleReplicates.length + i + 1}</span>
                          <span className="text-xs text-neutral-600">Tempo: {t.toFixed(2)} s</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeManualTime("sample", i)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Excluir tempo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>



      {showVideoModal && (
        <div className="fixed inset-0 bg-white z-50 h-screen w-screen flex flex-col">
          <div className="p-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Instantes do escoamento</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowVideoModal(false)
                  setVideoTarget(null)
                  setVideoUrl(null)
                }}
                className="border rounded-lg py-1 px-2 text-xs inline-flex items-center gap-1"
              >
                <span aria-hidden="true">←</span> Voltar
              </button>
            </div>
          </div>
          {videoUrl && (
            <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
              <p className="text-xs leading-tight text-neutral-700 text-justify">Use zoom 🤏🔍 e centralização ✋👆 da região do menisco, em conjunto com <span className="font-bold">Linha do tempo</span> e botões de <span className="font-bold">Ajuste fino</span> para localizar os instantes que o <span className="font-bold">menisco (parte inferior da superfície do líquido)</span> toca cada um dos seguintes <span className="font-bold">pontos 18 mL a 13 mL</span>. Ao alcançar cada instante, clique no botão do respectivo volume, na parte inferior</p>
              <div ref={videoContainerRef} className="w-full max-w-3xl mx-auto bg-black overflow-hidden" style={{ touchAction: "pan-y", aspectRatio: "16 / 9.2" }} onTouchStart={(e) => {
                const pts = Array.from(e.touches).map(t => ({id: t.identifier, x: t.clientX, y: t.clientY}))
                const half = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
                if (pts.length === 2 || (pts.length === 1 && pts[0].y < half)) {
                  e.preventDefault()
                  setInteractionMode('video')
                  setPointers(pts)
                  if (pts.length === 2) {
                    const dx = pts[0].x - pts[1].x; const dy = pts[0].y - pts[1].y; const dist = Math.hypot(dx, dy)
                    setInitialGesture({ dist, zoom, offset })
                  }
                } else {
                  setInteractionMode('scroll')
                }
              }} onTouchMove={(e) => {
                const pts = Array.from(e.touches).map(t => ({id: t.identifier, x: t.clientX, y: t.clientY}))
                if (interactionMode === 'video') {
                  e.preventDefault()
                  if (pts.length === 2 && initialGesture) {
                    const dx = pts[0].x - pts[1].x; const dy = pts[0].y - pts[1].y; const dist = Math.hypot(dx, dy)
                    const factor = dist / initialGesture.dist
                    const nextZoom = Math.min(16, Math.max(1, initialGesture.zoom * factor))
                    setZoom(nextZoom)
                  } else if (pts.length === 1) {
                    const prev = pointers[0]
                    const cur = pts[0]
                    if (prev) {
                      const dx = cur.x - prev.x; const dy = cur.y - prev.y
                      setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
                    }
                  }
                  setPointers(pts)
                }
              }} onTouchEnd={() => { setPointers([]); setInitialGesture(null); setInteractionMode(null) }}>
                <video ref={videoRef} src={videoUrl} className="w-full h-full" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "center center" }} playsInline preload="metadata" controls={false} onLoadedMetadata={onLoadedMetadata} onTimeUpdate={() => setCurrentTimeSec(videoRef.current?.currentTime || 0)} />
              </div>
              <div className="space-y-2">
                <div className="font-medium text-xs" style={{ color: "var(--color-label)" }}>Zoom</div>
                <Slider.Root value={[zoom]} min={1} max={16} step={0.1} onValueChange={(v) => setZoom(v[0])} className="relative flex items-center select-none touch-none h-5">
                  <Slider.Track className="bg-neutral-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-brand h-1 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-brand rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="Zoom" />
                </Slider.Root>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-xs" style={{ color: "var(--color-label)" }}>Linha do tempo</div>
                <Slider.Root value={[coarseTime]} min={0} max={duration || 1} step={0.1} onValueChange={onChangeCoarse} className="relative flex items-center select-none touch-none h-5">
                  <Slider.Track className="bg-neutral-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-brand h-1 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-brand rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="Coarse" />
                </Slider.Root>
                <div className="font-medium text-xs" style={{ color: "var(--color-label)" }}>Ajuste fino</div>
                <div className="grid grid-cols-6 gap-1">
                  {[-1.0, -0.5, -0.1, 0.1, 0.5, 1.0].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onMouseDown={() => startRepeat(d)}
                      onMouseUp={stopRepeat}
                      onMouseLeave={stopRepeat}
                      onTouchStart={() => startRepeat(d)}
                      onTouchEnd={stopRepeat}
                      className="border rounded-lg py-2 px-2 text-xs"
                    >
                      {d > 0 ? `+${d.toFixed(1)}s` : `${d.toFixed(1)}s`}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-neutral-700">Tempo atual: {currentTimeSec.toFixed(2)} s</div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[18,17,16,15,14,13].map((v) => (
                  <button key={v} type="button" onClick={() => assignMark(v as 13|14|15|16|17|18)} className={`border rounded-lg py-2.5 px-2 leading-tight ${marks[v as 13|14|15|16|17|18] != null ? "bg-brand text-white" : ""}`}>{v} mL</button>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[18,17,16,15,14,13].map((v) => (
                  <div key={v} className="text-xs text-center">{marks[v as 13|14|15|16|17|18] != null ? `${(marks[v as 13|14|15|16|17|18] as number).toFixed(2)} s` : ""}</div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {!allMarked && <div className="text-xs text-red-600">Marque todos os pontos (18 mL a 13 mL)</div>}
                {allMarked && !increasing && <div className="text-xs text-red-600">Instantes de escoamento inconsistentes: os tempos devem ser crescentes de 18 até 13 mL</div>}
                <div className="flex gap-2">
                  <button type="button" disabled={!canFinalize} onClick={finalizeReplicate} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 disabled:bg-blue-300 disabled:cursor-not-allowed">Salvar pontos</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showTimerModal && (
        <div className="fixed inset-0 bg-white z-50 h-screen w-screen flex flex-col">
          <div className="p-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Cronômetro</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setShowTimerModal(false); setTimerTarget(null); stopTimer() }} className="border rounded-lg py-1 px-2 text-xs">Voltar</button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
            <div className="text-3xl font-bold">{(Math.round((elapsedMs/1000)*10)/10).toFixed(1)} s</div>
            <button type="button" onClick={() => { timerRunning ? stopTimer() : startTimer() }} className={`rounded-full w-52 h-52 text-xl font-bold ${timerRunning ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>{timerRunning ? "Parar" : "Disparar"}</button>
            {!timerRunning && elapsedMs > 0 && (
              <div className="flex gap-2">
                <button type="button" onClick={saveTimer} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4">Salvar tempo</button>
                <button type="button" onClick={() => { setElapsedMs(0) }} className="border rounded-lg py-3 px-4">Descartar</button>
              </div>
            )}
          </div>
        </div>
      )}

      <NavigationButtons
        onBack={onBack}
        onNext={submitHandler}
      />
    </form>
  );
}
