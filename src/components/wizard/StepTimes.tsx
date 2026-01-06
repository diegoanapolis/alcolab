"use client"
import React, { useRef, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { timesSchema, TimesData } from "@/lib/schemas"
import * as Slider from "@radix-ui/react-slider"
import { Camera, Image as ImageIcon } from "lucide-react"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import InfoTooltip, { InlineTooltip } from "@/components/ui/InfoTooltip"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyEscoamento } from "@/lib/methodologyContent"

type Replicate = { previewUrl: string; duration: number; fileName?: string; fileCreatedAt?: string; marks: Record<14|15|16|17|18, number|undefined>; volumesMarked: Array<14|15|16|17|18>; derived?: { points: Array<{x:number;y:number}>; slope: number; intercept: number; r2: number; estimatedTime: number } }

export default function StepTimes({ onNext, onBack, initialData }: { onNext: (data: TimesData) => void; onBack: () => void; initialData?: TimesData }) {
  const [showMethodology, setShowMethodology] = useState(false)
  
  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<TimesData>({
    resolver: zodResolver(timesSchema),
    defaultValues: initialData ?? { waterTimes: [], sampleTimes: [] },
  });
  const waterTimes = watch("waterTimes") || []
  const sampleTimes = watch("sampleTimes") || []

  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoTarget, setVideoTarget] = useState<"water" | "sample" | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [coarseTime, setCoarseTime] = useState<number>(0)
  const [fineMin, setFineMin] = useState<number>(0)
  const [fineMax, setFineMax] = useState<number>(0.5)
  const [fineTime, setFineTime] = useState<number>(0)
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0)
  const [marks, setMarks] = useState<Record<14 | 15 | 16 | 17 | 18, number | undefined>>({ 18: undefined, 17: undefined, 16: undefined, 15: undefined, 14: undefined })
  const [pendingAction, setPendingAction] = useState<"gallery"|"camera"|null>(null)
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
      setMarks({ 18: undefined, 17: undefined, 16: undefined, 15: undefined, 14: undefined })
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

  useEffect(() => {
    if (showVideoModal && pendingAction === "camera") {
      cameraInputRef.current?.click()
      setPendingAction(null)
    } else if (showVideoModal && pendingAction === "gallery") {
      galleryInputRef.current?.click()
      setPendingAction(null)
    }
  }, [showVideoModal, pendingAction])

  const handleFilePicked = (file: File | null) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setCurrentFileName(file.name)
    try { setCurrentFileCreatedAt(new Date(file.lastModified).toISOString()) } catch { setCurrentFileCreatedAt(undefined) }
    setZoom(1)
    setOffset({ x: 0, y: 0 })
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
  const assignMark = (vol: 14 | 15 | 16 | 17 | 18) => {
    const t = currentTimeSec
    setMarks((prev) => ({ ...prev, [vol]: t }))
  }
  const markedVolumes = ((): Array<14|15|16|17|18> => {
    const vols: Array<14|15|16|17|18> = []
    ;([18,17,16,15,14] as Array<14|15|16|17|18>).forEach((v) => { if (marks[v] != null) vols.push(v) })
    return vols
  })()
  const minMarked = markedVolumes.length >= 3
  const increasing = minMarked ? markedVolumes.slice().sort((a,b) => b-a).every((v, i, arr) => {
    if (i === 0) return true
    const prevVol = arr[i-1]
    return (marks[prevVol] as number) < (marks[v] as number)
  }) : false
  const canFinalize = minMarked && increasing
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
      if (w.volumesMarked.length < 3 || s.volumesMarked.length < 3) { setCustomError("Cada vídeo deve ter pelo menos 3 de 5 frames marcados."); return false }
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
    <>
      <form className="space-y-4 p-4" onSubmit={submitHandler}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002060]">Registre o{" "}
            <InlineTooltip 
              term="escoamento" 
              tooltip="Tempo para atravessar um intervalo fixo de volume."
            />
          </h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>
        
        {/* Camada 1: Instruções mínimas */}
        <div className="text-sm text-neutral-700 text-justify space-y-2">
          <p>
            <span className="font-bold">Etapa mais sensível da metodologia.</span> A estimativa do tempo de escoamento 
            (sempre de 18 mL a 14 mL, usando{" "}
            <InlineTooltip 
              term="menisco" 
              tooltip="Parte inferior da superfície curva do líquido."
            />{" "}
            como referência) por vídeo é mais{" "}
            <InlineTooltip 
              term="robusta" 
              tooltip="Capacidade de fornecer resultados confiáveis mesmo com pequenas variações nas condições do ensaio."
            />{" "}
            e recomendada.
          </p>
          <p>
            Recomenda-se pelo menos duas{" "}
            <InlineTooltip 
              term="repetições" 
              tooltip="Aumentam a confiabilidade da análise."
            />{" "}
            para cada (água e amostra).
          </p>
          <p>
            É possível mesclar replicatas em vídeo e por inserção manual do tempo. 
            Se optar por cronometrar o tempo total de escoamento, dê preferência ao cronômetro desta janela.
          </p>
        </div>

        {/* Validation messages */}
        {(errors?.waterTimes || errors?.sampleTimes) && (
          <p className="text-red-600 text-sm">{errors?.waterTimes?.message || errors?.sampleTimes?.message as string}</p>
        )}
        {customError && (
          <p className="text-red-600 text-sm">{customError}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* ÁGUA */}
          <div>
            <div className="font-medium text-sm text-[#002060] mb-2">Água - vídeo(s)</div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => { setVideoTarget("water"); setShowVideoModal(true); setPendingAction("camera") }} className="border border-[#002060] rounded-lg px-3 py-2.5 text-sm inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                <Camera className="w-4 h-4 text-[#002060]" aria-hidden="true" />
                <span className="text-[#002060]">Gravar vídeo</span>
              </button>
              <button type="button" onClick={() => { setVideoTarget("water"); setShowVideoModal(true); setPendingAction("gallery") }} className="border border-[#002060] rounded-lg px-3 py-2.5 text-sm inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                <ImageIcon className="w-4 h-4 text-[#002060]" aria-hidden="true" />
                <span className="text-[#002060]">Selecionar galeria</span>
              </button>
              {waterReplicates.length > 0 && <div className="mt-2 text-sm font-medium text-[#002060]">Ensaios realizados</div>}
              {waterReplicates.map((r, idx) => (
                <div key={idx} className="space-y-2 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Replicata {idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <button type="button" className="text-xs underline text-[#002060]" onClick={() => { setEditing({ target: "water", index: idx }); setVideoTarget("water"); setVideoUrl(r.previewUrl); setMarks(r.marks); setShowVideoModal(true) }}>Editar</button>
                      <button type="button" className="text-xs underline text-red-600" onClick={() => deleteReplicate("water", idx)}>Excluir</button>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600">Instantes: {([18,17,16,15,14] as Array<14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")}</div>
                  <div className="w-full overflow-hidden h-20 rounded">
                    <video src={r.previewUrl} className="w-full h-full object-cover" playsInline muted controls preload="metadata" />
                  </div>
                </div>
              ))}
              
              {/* Inserção manual */}
              <div className="mt-3 pt-3 border-t">
                <div className="font-medium text-xs text-[#002060] mb-2">Inserção manual de tempo (s)</div>
                <div className="flex gap-1">
                  <input type="text" inputMode="decimal" placeholder="99.1" value={manualWaterInput} onChange={(e) => setManualWaterInput(e.target.value)} className="border rounded-lg p-2 min-w-0 flex-1 text-sm text-center" />
                  <button type="button" onClick={() => addManualTime("water")} className="border border-[#002060] rounded-lg w-10 flex-shrink-0 text-sm text-[#002060] font-medium">+</button>
                </div>
                <button type="button" onClick={() => openTimer("water")} className="border border-[#002060] rounded-lg px-3 py-2 text-xs text-[#002060] mt-2 w-full">⏱️ Cronômetro</button>
                {waterTimes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {waterTimes.map((t, i) => (
                      <div key={i} className="px-2 py-1.5 bg-gray-50 rounded flex items-center justify-between text-xs">
                        <span>Tempo {waterReplicates.length + i + 1}: {t.toFixed(2)} s</span>
                        <button type="button" onClick={() => removeManualTime("water", i)} className="text-red-600 hover:text-red-800">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AMOSTRA */}
          <div>
            <div className="font-medium text-sm text-[#002060] mb-2">Amostra - vídeo(s)</div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => { setVideoTarget("sample"); setShowVideoModal(true); setPendingAction("camera") }} className="border border-[#002060] rounded-lg px-3 py-2.5 text-sm inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                <Camera className="w-4 h-4 text-[#002060]" aria-hidden="true" />
                <span className="text-[#002060]">Gravar vídeo</span>
              </button>
              <button type="button" onClick={() => { setVideoTarget("sample"); setShowVideoModal(true); setPendingAction("gallery") }} className="border border-[#002060] rounded-lg px-3 py-2.5 text-sm inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                <ImageIcon className="w-4 h-4 text-[#002060]" aria-hidden="true" />
                <span className="text-[#002060]">Selecionar galeria</span>
              </button>
              {sampleReplicates.length > 0 && <div className="mt-2 text-sm font-medium text-[#002060]">Ensaios realizados</div>}
              {sampleReplicates.map((r, idx) => (
                <div key={idx} className="space-y-2 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Replicata {idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <button type="button" className="text-xs underline text-[#002060]" onClick={() => { setEditing({ target: "sample", index: idx }); setVideoTarget("sample"); setVideoUrl(r.previewUrl); setMarks(r.marks); setShowVideoModal(true) }}>Editar</button>
                      <button type="button" className="text-xs underline text-red-600" onClick={() => deleteReplicate("sample", idx)}>Excluir</button>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600">Instantes: {([18,17,16,15,14] as Array<14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")}</div>
                  <div className="w-full overflow-hidden h-20 rounded">
                    <video src={r.previewUrl} className="w-full h-full object-cover" playsInline muted controls preload="metadata" />
                  </div>
                </div>
              ))}
              
              {/* Inserção manual */}
              <div className="mt-3 pt-3 border-t">
                <div className="font-medium text-xs text-[#002060] mb-2">Inserção manual de tempo (s)</div>
                <div className="flex gap-1">
                  <input type="text" inputMode="decimal" placeholder="253.5" value={manualSampleInput} onChange={(e) => setManualSampleInput(e.target.value)} className="border rounded-lg p-2 min-w-0 flex-1 text-sm text-center" />
                  <button type="button" onClick={() => addManualTime("sample")} className="border border-[#002060] rounded-lg w-10 flex-shrink-0 text-sm text-[#002060] font-medium">+</button>
                </div>
                <button type="button" onClick={() => openTimer("sample")} className="border border-[#002060] rounded-lg px-3 py-2 text-xs text-[#002060] mt-2 w-full">⏱️ Cronômetro</button>
                {sampleTimes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {sampleTimes.map((t, i) => (
                      <div key={i} className="px-2 py-1.5 bg-gray-50 rounded flex items-center justify-between text-xs">
                        <span>Tempo {sampleReplicates.length + i + 1}: {t.toFixed(2)} s</span>
                        <button type="button" onClick={() => removeManualTime("sample", i)} className="text-red-600 hover:text-red-800">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <NavigationButtons
          onBack={onBack}
          onNext={submitHandler}
        />
      </form>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="Metodologia: Escoamento"
      >
        <MethodologyEscoamento />
      </MethodologyModal>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-white z-50 h-screen w-screen flex flex-col">
          <div className="p-3 flex items-center justify-between border-b">
            <h2 className="text-base font-semibold text-[#002060]">Instantes do escoamento</h2>
            <div className="flex items-center gap-2">
              <input ref={galleryInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFilePicked(e.target.files?.[0] || null)} />
              <input ref={cameraInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => handleFilePicked(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => { setShowVideoModal(false); setVideoTarget(null); setVideoUrl(null) }} className="border rounded-lg py-1 px-3 text-sm">← Voltar</button>
            </div>
          </div>
          {videoUrl && (
            <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
              <p className="text-xs leading-tight text-neutral-700 text-justify">
                Use zoom 🤏🔍 e centralização ✋👆 da região do <span className="font-bold">menisco</span>, em conjunto com <span className="font-bold">Linha do tempo</span> e botões de <span className="font-bold">Ajuste fino</span> para localizar os instantes que o menisco toca cada um dos pontos <span className="font-bold">18 mL a 14 mL</span>.
              </p>
              <div ref={videoContainerRef} className="w-full max-w-3xl mx-auto bg-black overflow-hidden rounded-lg" style={{ touchAction: "pan-y", aspectRatio: "16 / 9.2" }} onTouchStart={(e) => {
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
                <div className="font-medium text-xs text-[#002060]">Zoom</div>
                <Slider.Root value={[zoom]} min={1} max={16} step={0.1} onValueChange={(v) => setZoom(v[0])} className="relative flex items-center select-none touch-none h-5">
                  <Slider.Track className="bg-neutral-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-[#002060] h-1 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-[#002060] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002060]" aria-label="Zoom" />
                </Slider.Root>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-xs text-[#002060]">Linha do tempo</div>
                <Slider.Root value={[coarseTime]} min={0} max={duration || 1} step={0.1} onValueChange={onChangeCoarse} className="relative flex items-center select-none touch-none h-5">
                  <Slider.Track className="bg-neutral-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-[#002060] h-1 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-[#002060] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002060]" aria-label="Coarse" />
                </Slider.Root>
                <div className="font-medium text-xs text-[#002060]">Ajuste fino</div>
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
                      className="border rounded-lg py-2 px-2 text-xs hover:bg-gray-100"
                    >
                      {d > 0 ? `+${d.toFixed(1)}s` : `${d.toFixed(1)}s`}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-neutral-700">Tempo atual: <span className="font-semibold">{currentTimeSec.toFixed(2)} s</span></div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[18,17,16,15,14].map((v) => (
                  <button key={v} type="button" onClick={() => assignMark(v as 14|15|16|17|18)} className={`border rounded-lg py-2.5 px-2 leading-tight text-sm font-medium ${marks[v as 14|15|16|17|18] != null ? "bg-[#002060] text-white" : "hover:bg-gray-100"}`}>{v} mL</button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[18,17,16,15,14].map((v) => (
                  <div key={v} className="text-xs text-center font-medium">{marks[v as 14|15|16|17|18] != null ? `${(marks[v as 14|15|16|17|18] as number).toFixed(2)} s` : ""}</div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {!minMarked && <div className="text-xs text-red-600">Recomenda-se marcar todos os pontos (mín. 3)</div>}
                {minMarked && !increasing && <div className="text-xs text-red-600">Instantes inconsistentes: os tempos devem ser crescentes de 18 até 14 mL</div>}
                <button type="button" disabled={!canFinalize} onClick={finalizeReplicate} className="bg-[#002060] hover:bg-[#001040] text-white rounded-lg py-3 px-4 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium">Salvar pontos</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-white z-50 h-screen w-screen flex flex-col">
          <div className="p-3 flex items-center justify-between border-b">
            <h2 className="text-base font-semibold text-[#002060]">Cronômetro</h2>
            <button type="button" onClick={() => { setShowTimerModal(false); setTimerTarget(null); stopTimer() }} className="border rounded-lg py-1 px-3 text-sm">Voltar</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
            <div className="text-5xl font-bold text-[#002060]">{(Math.round((elapsedMs/1000)*10)/10).toFixed(1)} s</div>
            <button type="button" onClick={() => { timerRunning ? stopTimer() : startTimer() }} className={`rounded-full w-48 h-48 text-xl font-bold transition-colors ${timerRunning ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>{timerRunning ? "Parar" : "Disparar"}</button>
            {!timerRunning && elapsedMs > 0 && (
              <div className="flex gap-3">
                <button type="button" onClick={saveTimer} className="bg-[#002060] hover:bg-[#001040] text-white rounded-lg py-3 px-6 font-medium">Salvar tempo</button>
                <button type="button" onClick={() => { setElapsedMs(0) }} className="border border-gray-300 rounded-lg py-3 px-6">Descartar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
