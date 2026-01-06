"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { runAlcoolPipeline } from "@/lib/alcoolWorkerClient"
import { normalizeRow } from "@/lib/backendMapping"
import { DatabaseService, ExperimentRun, RunInputs, RunOutputs, RunTags } from "@/lib/database"
import AnalysisListPage from "@/components/AnalysisListPage"
import { Download, FileText, ArrowLeft, Info } from "lucide-react"
import InfoTooltip from "@/components/ui/InfoTooltip"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyRelatorio, TooltipComposicoesEquivalentes, TooltipMonteCarlo } from "@/lib/methodologyContent"

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
  rawTimes?: { waterTimes?: number[]; sampleTimes?: number[] }
  equivalentes?: unknown
  classe_final?: string
  compativel?: string
  mostLikely?: string
  conclusao?: string
  seletividade?: string
  erroMuMalhaAbs?: number | null
  erroMuMalhaPct?: number | null
  wAlcoolInicial?: number
  wAlcoolBest?: number
  approvals?: { status?: string; observation?: string; metrics?: any }
  flags?: { methanolAbove5InEquivalents?: boolean; lowSelectivity?: boolean; pureSubstanceDetected?: boolean }
  expectedComposition?: { agua: number; et: number; met: number } | null
}

type TernariaOut = {
  equivalentes?: string
  classe_final?: string
  compativel?: string
}

export default function ResultadosPage() {
  const [result, setResult] = useState<ResultShape | null>(null)
  const [activeTab, setActiveTab] = useState<"Resultados" | "Dados experimentais">("Resultados")
  const [waterReplicates, setWaterReplicates] = useState<Array<{ previewUrl: string; fileName?: string; fileCreatedAt?: string; marks: Record<14|15|16|17|18, number|undefined> }>>([])
  const [sampleReplicates, setSampleReplicates] = useState<Array<{ previewUrl: string; fileName?: string; fileCreatedAt?: string; marks: Record<14|15|16|17|18, number|undefined> }>>([])
  const [tempRef, setTempRef] = useState<{ temperatura: number[]; viscosidade: number[] } | null>(null)
  const [showAnalysisList, setShowAnalysisList] = useState<boolean | null>(null)
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentRun | null>(null)
  const [showingFromDatabase, setShowingFromDatabase] = useState(false)
  const [showMethodology, setShowMethodology] = useState(false)
  const router = useRouter()

  // Função para converter experimento do banco em formato de resultado
  const convertExperimentToResult = (experiment: ExperimentRun) => {
    const inputs = experiment.inputs
    const outputs = experiment.outputs
    
    // Composição esperada já vem calculada nos outputs do banco (pelo Python)
    // Não recalcular aqui para evitar inconsistências
    
    const converted: ResultShape = {
      conditions: {
        sampleName: inputs.sampleName,
        beverageType: inputs.beverageType,
        labelAbv: inputs.labelAbv,
        labelUnit: inputs.labelUnit,
        brand: inputs.brand,
        waterType: inputs.waterType,
        temperature: inputs.waterTemperature,
        sampleTemperature: inputs.sampleTemperature,
        ethanolMassPercent: inputs.ethanolMassPercent,
        methanolMassPercent: inputs.methanolMassPercent,
      },
      density: {
        method: inputs.method,
        waterMass: inputs.waterMass,
        sampleMass: inputs.sampleMass,
        measuredValue: inputs.measuredValue,
        measuredUnit: inputs.measuredUnit,
      },
      viscosity: {
        viscosityRel: outputs.viscosityRel,
        muAbsWater: outputs.muAbsWater,
        muAbsSample: outputs.muAbsSample,
        cvWaterTime: outputs.cvWaterTime,
        cvSampleTime: outputs.cvSampleTime,
      },
      rawTimes: {
        waterTimes: inputs.waterTimes,
        sampleTimes: inputs.sampleTimes,
      },
      expectedComposition: {
        agua: outputs.expectedComposition?.agua ?? outputs.w_agua_est ?? 0,
        et: outputs.expectedComposition?.et ?? outputs.w_et_est ?? 0,
        met: outputs.expectedComposition?.met ?? outputs.w_met_est ?? 0,
      },
      equivalentes: outputs.equivalentes,
      classe_final: outputs.classe_final,
      compativel: outputs.compativel,
      mostLikely: outputs.mostLikely,
      conclusao: outputs.conclusao,
      seletividade: outputs.seletividade,
      erroMuMalhaAbs: outputs.erroMuMalhaAbs,
      erroMuMalhaPct: outputs.erroMuMalhaPct,
      wAlcoolInicial: outputs.wAlcoolInicial,
      wAlcoolBest: outputs.wAlcoolBest,
      approvals: outputs.approvals as any,
      flags: outputs.flags as any,
    }

    setResult(converted)
    
    // Configurar replicates de vídeo se existirem
    if (inputs.videoReplicatesWater) setWaterReplicates(inputs.videoReplicatesWater)
    if (inputs.videoReplicatesSample) setSampleReplicates(inputs.videoReplicatesSample)
  }

  // Função auxiliar para calcular volumesMarked a partir dos marks
  const getVolumesMarked = (marks: Record<14|15|16|17|18, number|undefined>): Array<14|15|16|17|18> => {
    return ([18, 17, 16, 15, 14] as Array<14|15|16|17|18>).filter(v => marks[v] != null)
  }

  // Função para salvar no banco de dados
  const saveToDatabase = async (resultData: ResultShape) => {
    if (!resultData.conditions || typeof window === 'undefined') return

    try {
      const inputs: RunInputs = {
        beverageType: resultData.conditions.beverageType || '',
        sampleName: resultData.conditions.sampleName,
        brand: resultData.conditions.brand,
        labelAbv: resultData.conditions.labelAbv,
        labelUnit: resultData.conditions.labelUnit,
        ethanolMassPercent: resultData.conditions.ethanolMassPercent,
        methanolMassPercent: resultData.conditions.methanolMassPercent,
        waterType: resultData.conditions.waterType,
        waterTemperature: resultData.conditions.temperature,
        sampleTemperature: resultData.conditions.sampleTemperature,
        method: resultData.density?.method,
        waterMass: resultData.density?.waterMass,
        sampleMass: resultData.density?.sampleMass,
        measuredValue: resultData.density?.measuredValue,
        measuredUnit: resultData.density?.measuredUnit,
        waterTimes: resultData.rawTimes?.waterTimes || [],
        sampleTimes: resultData.rawTimes?.sampleTimes || [],
        videoReplicatesWater: waterReplicates.map(r => ({
          ...r,
          volumesMarked: getVolumesMarked(r.marks)
        })),
        videoReplicatesSample: sampleReplicates.map(r => ({
          ...r,
          volumesMarked: getVolumesMarked(r.marks)
        })),
      }

      const outputs: RunOutputs = {
        waterMeanTime: resultData.rawTimes?.waterTimes?.length ? 
          resultData.rawTimes.waterTimes.reduce((a,b) => a+b, 0) / resultData.rawTimes.waterTimes.length : undefined,
        sampleMeanTime: resultData.rawTimes?.sampleTimes?.length ?
          resultData.rawTimes.sampleTimes.reduce((a,b) => a+b, 0) / resultData.rawTimes.sampleTimes.length : undefined,
        viscosityRel: resultData.viscosity?.viscosityRel,
        muAbsWater: resultData.viscosity?.muAbsWater,
        muAbsSample: resultData.viscosity?.muAbsSample,
        cvWaterTime: resultData.viscosity?.cvWaterTime,
        cvSampleTime: resultData.viscosity?.cvSampleTime,
        classe_final: resultData.classe_final,
        equivalentes: typeof resultData.equivalentes === 'string' ? resultData.equivalentes : String(resultData.equivalentes || ''),
        mostLikely: resultData.mostLikely,
        compativel: resultData.compativel,
        seletividade: resultData.seletividade,
        conclusao: resultData.conclusao,
        approvals: resultData.approvals,
        flags: resultData.flags,
        erroMuMalhaAbs: resultData.erroMuMalhaAbs ?? undefined,
        erroMuMalhaPct: resultData.erroMuMalhaPct ?? undefined,
        wAlcoolInicial: resultData.wAlcoolInicial,
        wAlcoolBest: resultData.wAlcoolBest,
        // Composição esperada
        w_agua_est: resultData.expectedComposition?.agua,
        w_et_est: resultData.expectedComposition?.et,
        w_met_est: resultData.expectedComposition?.met,
        expectedComposition: resultData.expectedComposition ?? undefined,
      }

      const tags: RunTags = {
        sampleName: resultData.conditions.sampleName,
        brand: resultData.conditions.brand,
      }

      await DatabaseService.saveExperiment(inputs, outputs, tags)
      
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error)
    }
  }

  // Verificar se deve mostrar lista de análises ou ir direto para relatório
  useEffect(() => {
    const checkNavigationMode = async () => {
      try {
        console.log('📊 Verificando modo de navegação...')
        
        // 1. Verificar se há experimento selecionado (usuário clicou em um item da lista)
        const selectedExpStr = localStorage.getItem('selectedExperiment')
        if (selectedExpStr) {
          console.log('📊 Carregando experimento selecionado do banco')
          const selectedExp = JSON.parse(selectedExpStr) as ExperimentRun
          setSelectedExperiment(selectedExp)
          setShowAnalysisList(false)
          setShowingFromDatabase(true)
          
          // Converter experimento para formato de resultado
          convertExperimentToResult(selectedExp)
          // Limpar a seleção após carregar
          localStorage.removeItem('selectedExperiment')
          return
        }

        // 2. Verificar se há dados do wizard recém-calculados (acabou de fazer análise)
        const pendingExport = localStorage.getItem("frontend_export_rows")
        if (pendingExport) {
          console.log('📊 Dados pendentes do wizard encontrados, processando...')
          // Limpar cache de resultados antigos antes de processar novo
          localStorage.removeItem('lastResult')
          localStorage.removeItem('lastOutputs')
          setShowAnalysisList(false)
          // Não retornar - deixar o segundo useEffect processar
          return
        }

        // 3. FLUXO PADRÃO: Clicar em "Resultados" na tela inicial
        // SEMPRE ir para lista de análises, nunca para relatório direto
        console.log('📊 Nenhum dado pendente, mostrando lista de análises')
        
        // Limpar qualquer resultado anterior em cache
        localStorage.removeItem('lastResult')
        localStorage.removeItem('lastOutputs')
        localStorage.removeItem('selectedExperiment')
        
        // Sempre mostrar a lista (mesmo vazia)
        setShowAnalysisList(true)
        setResult(null) // Limpar qualquer resultado anterior
        
      } catch (error) {
        console.error('Erro ao verificar modo de navegação:', error)
        setShowAnalysisList(true) // Em caso de erro, mostrar lista
      }
    }

    checkNavigationMode()
  }, [])

  // Processar novo resultado do wizard
  useEffect(() => {
    if (showingFromDatabase) return
    if (showAnalysisList === true) return // Não processar se estamos mostrando a lista
    
    let alive = true
    ;(async () => {
      try {
        const pending = localStorage.getItem("frontend_export_rows")
        if (!pending) {
          console.log('📊 Nenhum dado pendente para processar')
          return
        }
        
        console.log('📊 Iniciando processamento dos dados do wizard...')
        const rowsRaw = JSON.parse(pending)
        console.log('📊 Dados brutos:', rowsRaw)
        
        if (!Array.isArray(rowsRaw) || rowsRaw.length === 0) {
          console.error('❌ Dados inválidos ou vazios')
          return
        }
        
        const rows = rowsRaw.map((r: any) => normalizeRow(r))
        console.log('📊 Dados normalizados:', rows)
        
        console.log('📊 Chamando runAlcoolPipeline...')
        
        let out: any = null
        let processingError: string | null = null
        
        try {
          // Timeout de 60 segundos para o processamento Python
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: processamento demorou mais de 60s')), 60000)
          )
          out = await Promise.race([runAlcoolPipeline(rows as Array<Record<string, any>>), timeoutPromise])
          console.log('📊 Resultado do Python:', out)
        } catch (pythonError) {
          console.error('❌ Erro no processamento Python:', pythonError)
          processingError = String(pythonError)
        }
        
        if (!alive) return

        try { localStorage.setItem("lastOutputs", JSON.stringify(out)) } catch {}

        // Se o Python falhou ou não retornou dados, criar resultado minimal a partir dos dados de entrada
        const first: any = out?.resultados?.[0] ?? null
        if (!first) {
          console.log('📊 Python não retornou resultados, criando resultado minimal...')
          // Criar resultado minimal a partir dos dados do wizard
          const inputRow = rows[0] as Record<string, any>
          const minimalResult: ResultShape = {
            conditions: {
              sampleName: String(inputRow.sampleName ?? ""),
              beverageType: String(inputRow.beverageType ?? ""),
              labelAbv: typeof inputRow.labelAbv === 'number' ? inputRow.labelAbv : undefined,
              labelUnit: typeof inputRow.labelUnit === 'string' ? inputRow.labelUnit : undefined,
              brand: typeof inputRow.brand === 'string' ? inputRow.brand : undefined,
              waterType: typeof inputRow.waterType === 'string' ? inputRow.waterType : undefined,
              temperature: typeof inputRow.waterTemperature === 'number' ? inputRow.waterTemperature : undefined,
              sampleTemperature: typeof inputRow.sampleTemperature === 'number' ? inputRow.sampleTemperature : undefined,
              ethanolMassPercent: typeof inputRow.ethanolMassPercent === 'number' ? inputRow.ethanolMassPercent : undefined,
              methanolMassPercent: typeof inputRow.methanolMassPercent === 'number' ? inputRow.methanolMassPercent : undefined,
            },
            density: {
              method: typeof inputRow.method === 'string' ? inputRow.method : undefined,
              waterMass: typeof inputRow.waterMass === 'number' ? inputRow.waterMass : undefined,
              sampleMass: typeof inputRow.sampleMass === 'number' ? inputRow.sampleMass : undefined,
              measuredValue: typeof inputRow.measuredValue === 'number' ? inputRow.measuredValue : undefined,
              measuredUnit: typeof inputRow.measuredUnit === 'string' ? inputRow.measuredUnit : undefined,
            },
            rawTimes: {
              waterTimes: typeof inputRow.waterTimes === 'string' ? inputRow.waterTimes.split(';').map(Number).filter((n: number) => !isNaN(n)) : [],
              sampleTimes: typeof inputRow.sampleTimes === 'string' ? inputRow.sampleTimes.split(';').map(Number).filter((n: number) => !isNaN(n)) : [],
            },
            expectedComposition: null, // Python não retornou, sem composição esperada
            conclusao: processingError ? `Erro no processamento: ${processingError}` : 'Processamento incompleto',
          }
          
          try { localStorage.setItem("lastResult", JSON.stringify(minimalResult)) } catch {}
          try { localStorage.removeItem("frontend_export_rows") } catch {}
          
          setResult(minimalResult)
          console.log('⚠️ Resultado minimal criado:', minimalResult)
          return
        }
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
            agua: safeNum(rep?.w_agua_est ?? first.w_agua_est) ?? 0,
            et: safeNum(rep?.w_et_est ?? first.w_et_est) ?? 0,
            met: safeNum(rep?.w_met_est ?? first.w_met_est) ?? 0,
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
          wAlcoolInicial: safeNum(first.w_alcool),
          wAlcoolBest: safeNum(first.w_alcool_best ?? rep?.w_alcool_best),
          approvals: rep?.approvals ?? undefined,
          flags: rep?.flags ?? undefined,
        }

        try { localStorage.setItem("lastResult", JSON.stringify(mapped)) } catch {}
        try { localStorage.removeItem("frontend_export_rows") } catch {}
        
        // Debug: log do resultado do Python
        console.log("🔍 Resultado mapeado:", mapped)
        
        // Salvar no banco de dados automaticamente
        await saveToDatabase(mapped)
        
        setResult(mapped)
        console.log('✅ Resultado processado e exibido com sucesso')
        
      } catch (error) {
        console.error('❌ Erro ao processar dados do wizard:', error)
        // Tentar carregar lastResult como fallback
        try {
          const lastResult = localStorage.getItem('lastResult')
          if (lastResult) {
            setResult(JSON.parse(lastResult))
            console.log('📊 Usando lastResult como fallback')
          }
        } catch {}
      }
    })()
    return () => { alive = false }
  }, [showingFromDatabase, showAnalysisList])

  // Carregar resultado existente se não veio do wizard
  // NOTA: Este useEffect só deve rodar quando não estamos mostrando a lista
  useEffect(() => {
    if (showingFromDatabase) return
    if (showAnalysisList === true) return // Não carregar se estamos na lista
    if (showAnalysisList === null) return // Ainda verificando, não carregar
    
    // Só carregar se temos dados pendentes ou estamos em modo de relatório
    const pending = localStorage.getItem("frontend_export_rows")
    if (!pending && !result) {
      // Se não tem dados pendentes e não tem result, não fazer nada
      return
    }
    
    // Não usar intervalo para evitar recarregar dados antigos
    // O segundo useEffect já cuida de carregar os dados do wizard
  }, [showingFromDatabase, showAnalysisList, result])

  useEffect(() => {
    if (showingFromDatabase) return
    if (showAnalysisList === true) return // Não carregar se estamos na lista
    
    const loadReplicates = () => {
      try {
        const wRaw = localStorage.getItem("videoReplicasWater")
        const sRaw = localStorage.getItem("videoReplicasSample")
        if (wRaw) setWaterReplicates(JSON.parse(wRaw))
        if (sRaw) setSampleReplicates(JSON.parse(sRaw))
      } catch {}
    }
    
    loadReplicates()
    // Removido o interval para evitar carregar dados antigos repetidamente
  }, [showingFromDatabase, showAnalysisList])

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

  // Função para voltar à lista de análises
  const goBackToList = () => {
    localStorage.removeItem('selectedExperiment')
    setShowAnalysisList(true)
    setShowingFromDatabase(false)
    setSelectedExperiment(null)
  }

  // Função para exportar PDF
  const exportToPDF = () => {
    alert('Exportação PDF em desenvolvimento!')
  }

  // Função para exportar CSV
  const exportToCSV = () => {
    if (!result) return
    
    const csvData = {
      headers: [
        'data_analise', 'nome_amostra', 'tipo_bebida', 'fabricante', 'lote',
        'teor_rotulo', 'unidade_rotulo', 'tipo_agua', 'temp_agua', 'temp_amostra',
        'metodo_densidade', 'massa_agua', 'massa_amostra', 'valor_medido', 'unidade_medida',
        'tempos_agua', 'tempos_amostra', 'viscosidade_rel', 'visc_abs_agua', 'visc_abs_amostra',
        'composicoes_equivalentes', 'classe_final', 'compativel', 'mais_provavel'
      ],
      data: [
        new Date().toISOString().split('T')[0],
        result.conditions?.sampleName || '',
        result.conditions?.beverageType || '',
        result.conditions?.brand || '',
        '',
        result.conditions?.labelAbv || '',
        result.conditions?.labelUnit || '',
        result.conditions?.waterType || '',
        result.conditions?.temperature || '',
        result.conditions?.sampleTemperature || '',
        result.density?.method || '',
        result.density?.waterMass || '',
        result.density?.sampleMass || '',
        result.density?.measuredValue || '',
        result.density?.measuredUnit || '',
        result.rawTimes?.waterTimes?.join(';') || '',
        result.rawTimes?.sampleTimes?.join(';') || '',
        result.viscosity?.viscosityRel || '',
        result.viscosity?.muAbsWater || '',
        result.viscosity?.muAbsSample || '',
        typeof result.equivalentes === 'string' ? result.equivalentes.replace(/\n/g, ' | ') : '',
        result.classe_final || '',
        result.compativel || '',
        result.mostLikely || ''
      ]
    }
    
    const csvContent = [
      csvData.headers.join(','),
      csvData.data.map(field => `"${field}"`).join(',')
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `alcolab_analise_${result.conditions?.sampleName || 'amostra'}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

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

  // Calcula composição esperada baseado nos dados do perfil quando não vem do Python
  const computeExpectedFromProfile = (conditions: ResultShape['conditions'] | undefined): { agua: number; et: number; met: number } | null => {
    if (!conditions) return null
    const bt = conditions.beverageType
    const labelAbv = conditions.labelAbv
    const labelUnit = conditions.labelUnit
    const etMassPct = conditions.ethanolMassPercent
    const metMassPct = conditions.methanolMassPercent
    
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
    
    // Metanol comercial
    if (bt === "Metanol comercial") {
      if (labelUnit === "INPM ou % m/m" && typeof labelAbv === "number") {
        const met = labelAbv / 100
        return { et: 0, met: clamp01(met), agua: clamp01(1 - met) }
      }
      if (typeof metMassPct === "number") {
        const met = metMassPct / 100
        return { et: 0, met: clamp01(met), agua: clamp01(1 - met) }
      }
      return null
    }
    
    // Outra hidroalcoólica
    if (bt === "Outra hidroalcoólica") {
      const et = typeof etMassPct === "number" ? etMassPct / 100 : 0
      const met = typeof metMassPct === "number" ? metMassPct / 100 : 0
      return { et: clamp01(et), met: clamp01(met), agua: clamp01(1 - (et + met)) }
    }
    
    // Outros tipos (bebidas normais, etanol comercial, etc)
    if (typeof labelAbv === "number") {
      if (labelUnit === "INPM ou % m/m") {
        // % m/m: labelAbv já é a fração mássica de etanol
        const et = labelAbv / 100
        return { et: clamp01(et), met: 0, agua: clamp01(1 - et) }
      } else {
        // % v/v ou °GL: converter para % m/m usando fórmula aproximada
        const rhoE = 0.789
        const rhoW = 0.998
        const v = labelAbv / 100
        const et = (rhoE * v) / ((rhoE * v) + (rhoW * (1 - v)))
        return { et: clamp01(et), met: 0, agua: clamp01(1 - et) }
      }
    }
    
    return null
  }

  const parseCompositionLine = (line: string): { agua: number; et: number; met: number } | null => {
    const s = String(line || "").toLowerCase()
    
    // Função robusta para extrair valores - aceita múltiplos formatos
    const grab = (name: "água" | "etanol" | "metanol") => {
      // Tentar vários padrões de regex
      const patterns = [
        new RegExp(name + "\\s+(\\d+(?:[\\.,]\\d+)?)\\s*%"),  // "água 27.5%"
        new RegExp(name + "\\s*:\\s*(\\d+(?:[\\.,]\\d+)?)\\s*%"),  // "água: 27.5%"
        new RegExp(name + "\\s*=\\s*(\\d+(?:[\\.,]\\d+)?)\\s*%"),  // "água = 27.5%"
        new RegExp("(\\d+(?:[\\.,]\\d+)?)\\s*%\\s*" + name),  // "27.5% água"
      ]
      
      for (const re of patterns) {
        const m = s.match(re)
        if (m) {
          const v = Number(String(m[1]).replace(",", "."))
          return isFinite(v) ? v/100 : 0
        }
      }
      return 0
    }
    const agua = grab("água")
    const et = grab("etanol")
    const met = grab("metanol")
    if (agua === 0 && et === 0 && met === 0) return null
    return { agua, et, met }
  }

  const pickCompatibleLine = (equivalentes: string, expected?: { agua?: number; et?: number; met?: number } | null, tolPct = 3): string | null => {
    const exp = expected ? { agua: expected.agua ?? 0, et: expected.et ?? 0, met: expected.met ?? 0 } : null
    
    // Split robusto: por newline, ". " seguido de maiúscula, ou " e " quando indica nova composição
    // Primeiro normalizar a string
    const normalized = String(equivalentes || "")
      .replace(/\.\s+(?=[ÁÀÂÃÉÊÍÓÔÕÚÜA-Z])/g, "\n")  // ". A" vira newline
      .replace(/;\s*e\s+(?=met)/gi, "; ")  // "; e metanol" vira "; metanol"
    
    const rawLines = normalized.split(/\r?\n/)
      .map(l => l.trim().replace(/\.$/, ""))
      .filter(Boolean)
    
    // Remover duplicatas mantendo ordem
    const lines = [...new Set(rawLines)]
    if (!lines.length || !exp) return null
    const tol = tolPct/100
    
    // Determinar quais constituintes são esperados (>0.5%)
    const expectedHasEt = exp.et > 0.005
    const expectedHasMet = exp.met > 0.005
    
    // 1ª passagem: buscar composições com EXATAMENTE os mesmos constituintes
    let best: { line: string; score: number } | null = null
    for (const line of lines) {
      const comp = parseCompositionLine(line)
      if (!comp) continue
      
      // Verificar se tem constituintes extras
      const compHasEt = comp.et > 0.005
      const compHasMet = comp.met > 0.005
      
      // Se esperado não tem metanol, mas composição tem -> pular na 1ª passagem
      if (!expectedHasMet && compHasMet) continue
      // Se esperado não tem etanol, mas composição tem -> pular na 1ª passagem
      if (!expectedHasEt && compHasEt) continue
      
      // Verificar tolerância nos constituintes esperados
      const ok = (Math.abs(comp.agua - exp.agua) <= tol) && (Math.abs(comp.et - exp.et) <= tol) && (Math.abs(comp.met - exp.met) <= tol)
      if (!ok) continue
      
      const score = Math.abs(comp.agua-exp.agua) + Math.abs(comp.et-exp.et) + Math.abs(comp.met-exp.met)
      if (!best || score < best.score) best = { line, score }
    }
    
    // Se encontrou composição com mesmos constituintes, retornar
    if (best) return best.line
    
    // 2ª passagem: aceitar composições com constituintes extras (fallback)
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

  const computeR2 = (marks: Record<14|15|16|17|18, number|undefined>) => {
    const xs: number[] = []
    const ys: number[] = []
    ;([18,17,16,15,14] as Array<14|15|16|17|18>).forEach((v) => {
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

  const estimateDeltaTime = (marks: Record<14|15|16|17|18, number|undefined>) => {
    const xs: number[] = []
    const ys: number[] = []
    ;([18,17,16,15,14] as Array<14|15|16|17|18>).forEach((v) => {
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
    const sampleRepCount = (manualSampleTimes?.filter(t => t != null).length) ?? sampleReplicates.length
    const waterRepCount = (manualWaterTimes?.filter(t => t != null).length) ?? waterReplicates.length
    
    // Critério básico: ≥2 repetições
    const repsOk = sampleRepCount >= 2 && waterRepCount >= 2
    
    // CV só se tiver ≥2 valores
    const sampleCv = manualSampleTimes && manualSampleTimes.length >= 2 ? cvOf(manualSampleTimes) : sampleCvTimes
    const waterCv = manualWaterTimes && manualWaterTimes.length >= 2 ? cvOf(manualWaterTimes) : waterCvTimes
    const cvOk = (sampleCv == null || sampleCv <= 5) && (waterCv == null || waterCv <= 5)
    
    // R² só se tiver vídeos E NÃO tiver tempos manuais
    const isManual = (manualSampleTimes && manualSampleTimes.length > 0) || (manualWaterTimes && manualWaterTimes.length > 0)
    const hasVideos = sampleReplicates.length > 0 || waterReplicates.length > 0
    let r2Ok = true
    if (!isManual && hasVideos) {
      const rsSample = sampleReplicates.map(r => computeR2(r.marks)).filter(v => v != null) as number[]
      const rsWater = waterReplicates.map(r => computeR2(r.marks)).filter(v => v != null) as number[]
      r2Ok = rsSample.every(v => v >= 0.99) && rsWater.every(v => v >= 0.99)
    }
    
    // Aprovado se: ≥2 reps + CV ≤5% + R² OK
    if (repsOk && cvOk && r2Ok) return "Aprovado"
    if (!repsOk) {
      const anyOtherFail = !cvOk || !r2Ok
      return anyOtherFail ? "Reprovado e insuficientes" : "Insuficientes"
    }
    return "Reprovado"
  }, [result, sampleReplicates, waterReplicates, sampleCvTimes, waterCvTimes])

  const compatStatus = useMemo(() => {
    const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
    
    // Primeiro verificar se há alguma composição equivalente compatível com o rótulo
    const equivalentes = String((result as any)?.ternaria?.equivalentes ?? result?.equivalentes ?? "")
    
    // Usar expectedComposition do Python, ou calcular baseado no perfil se não disponível
    let expectedComp = result?.expectedComposition ?? null
    if (!expectedComp || (expectedComp.agua === undefined && expectedComp.et === undefined && expectedComp.met === undefined)) {
      expectedComp = computeExpectedFromProfile(result?.conditions)
    }
    
    if (equivalentes && expectedComp) {
      const compatLine = pickCompatibleLine(equivalentes, expectedComp, 3)
      if (compatLine) {
        return "Compatível"
      }
    }
    
    // Se não encontrou composição compatível, usar valor do backend ou "Incompatível"
    const c = String((result?.compativel ?? ternaria?.compativel ?? "") || "").trim()
    if (c) return c
    
    // Se não há valor do backend mas há equivalentes, é incompatível
    if (equivalentes) return "Incompatível"
    
    return "Indeterminado"
  }, [result])

  const semaforo = useMemo(() => {
    const bt = result?.conditions?.beverageType
    const tipoMetanolComercial = bt === "Metanol comercial"
    const tipoEtanolCombustivel = bt === "Etanol combustível"
    const tipoBebida = bt && !tipoMetanolComercial && !tipoEtanolCombustivel
    
    // Verificar se há metanol alto nas equivalentes
    const eqHasMetanolAlto = (() => {
      const f = (result as any)?.flags
      if (typeof f?.methanolAbove5InEquivalents === "boolean") return f.methanolAbove5InEquivalents
      const ternEq = String((result as any)?.ternaria?.equivalentes ?? result?.equivalentes ?? "").toLowerCase()
      const m = ternEq.match(/metanol\s+(\d+(?:[\.,]\d+)?)%/)
      if (!m) return false
      const v = Number(String(m[1]).replace(",", "."))
      return isFinite(v) && v > 5
    })()
    
    // Critérios para aprovação experimental - SIMPLIFICADO
    // Para ser consistente com a lista de análises
    const manualSampleTimes = result?.rawTimes?.sampleTimes as Array<number | null> | undefined
    const manualWaterTimes = result?.rawTimes?.waterTimes as Array<number | null> | undefined
    const sampleRepCount = (manualSampleTimes?.filter(t => t != null).length) ?? sampleReplicates.length
    const waterRepCount = (manualWaterTimes?.filter(t => t != null).length) ?? waterReplicates.length
    
    // Aprovação básica: ≥2 repetições
    const repsOk = sampleRepCount >= 2 && waterRepCount >= 2
    
    // CV só se tiver ≥2 valores
    const sampleCv = manualSampleTimes && manualSampleTimes.length >= 2 ? cvOf(manualSampleTimes) : sampleCvTimes
    const waterCv = manualWaterTimes && manualWaterTimes.length >= 2 ? cvOf(manualWaterTimes) : waterCvTimes
    const cvOk = (sampleCv == null || sampleCv <= 5) && (waterCv == null || waterCv <= 5)
    
    // R² só se tiver vídeos e NÃO tiver tempos manuais
    const isManual = (manualSampleTimes && manualSampleTimes.length > 0) || (manualWaterTimes && manualWaterTimes.length > 0)
    const hasVideos = sampleReplicates.length > 0 || waterReplicates.length > 0
    let r2Ok = true
    if (!isManual && hasVideos) {
      const rsSample = sampleReplicates.map(r => computeR2(r.marks)).filter(v => v != null) as number[]
      const rsWater = waterReplicates.map(r => computeR2(r.marks)).filter(v => v != null) as number[]
      r2Ok = rsSample.every(v => v >= 0.99) && rsWater.every(v => v >= 0.99)
    }
    
    // Experimento aprovado: reps + CV + R² (sem verificar viscosidade da água)
    const experimentoAprovado = repsOk && cvOk && r2Ok
    
    // Lógica do semáforo otimizada
    if (tipoMetanolComercial || tipoEtanolCombustivel) {
      // Para metanol comercial e etanol combustível
      if (compatStatus === "Compatível" && experimentoAprovado) {
        return { cor: "green", texto: "Compatibilidade entre rótulo e experimento" }
      }
      if (compatStatus === "Incompatível" && experimentoAprovado) {
        return { cor: "red", texto: "Incompatível com o rótulo" }
      }
      return { cor: "yellow", texto: "Necessários mais dados experimentais" }
    }
    
    if (tipoBebida) {
      // Para bebidas alcoólicas
      // Verificar se é "Outra hidroalcoólica" com metanol informado > 0%
      const isOutraHidroComMetanol = bt === "Outra hidroalcoólica" && 
        (result?.conditions?.methanolMassPercent != null && result.conditions.methanolMassPercent > 0)
      
      // Se é "Outra hidroalcoólica" com metanol informado, não alertar sobre metanol
      // (usuário já sabe que tem metanol)
      if (!isOutraHidroComMetanol && compatStatus === "Incompatível" && eqHasMetanolAlto && experimentoAprovado) {
        return { cor: "red", texto: "Possível presença de metanol" }
      }
      if (compatStatus === "Compatível" && experimentoAprovado) {
        return { cor: "green", texto: "Compatibilidade entre rótulo e experimento" }
      }
      if (compatStatus === "Incompatível" && experimentoAprovado) {
        return { cor: "red", texto: "Incompatível com o rótulo" }
      }
      return { cor: "yellow", texto: "Necessários mais dados experimentais" }
    }
    
    // Caso padrão
    return { cor: "yellow", texto: "Necessários mais dados experimentais" }
  }, [result, compatStatus, sampleReplicates, waterReplicates, sampleCvTimes, waterCvTimes, interpWaterViscRef, cvOf])

  // Função para selecionar experimento da lista
  const handleSelectExperiment = (exp: ExperimentRun) => {
    setSelectedExperiment(exp)
    setShowAnalysisList(false)
    setShowingFromDatabase(true)
    convertExperimentToResult(exp)
  }

  // Se ainda está verificando, mostrar loading
  if (showAnalysisList === null) {
    return (
      <div className="md:max-w-md md:mx-auto p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se deve mostrar lista de análises, renderizar AnalysisListPage
  if (showAnalysisList) {
    return <AnalysisListPage onSelectExperiment={handleSelectExperiment} />
  }

  return (
    <div className="md:max-w-md md:mx-auto p-4 space-y-4">
      {/* Header com botão voltar se veio do banco de dados */}
      <div className="flex items-center gap-3">
        {showingFromDatabase && (
          <button
            onClick={goBackToList}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Voltar para lista"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-xl font-bold text-[#002060] flex-1">Relatório | Exame de Triagem</h1>
      </div>

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
                  <li>Composição % m/m esperada: {(() => {
                    const exp = result?.expectedComposition
                    if (!exp || (exp.agua === 0 && exp.et === 0 && exp.met === 0)) return "-"
                    const parts: string[] = []
                    if (exp.agua > 0) parts.push(`${(exp.agua * 100).toFixed(1)}% água`)
                    if (exp.et > 0) parts.push(`${(exp.et * 100).toFixed(1)}% etanol`)
                    if (exp.met > 0) parts.push(`${(exp.met * 100).toFixed(1)}% metanol`)
                    return parts.length > 0 ? parts.join("; ") + "." : "-"
                  })()}</li>
                </ul>
              ) : (
                <p>Perfil e teor de rótulo</p>
              )}
            </div>

            <div className="border rounded-lg p-3">
              <h2 className="font-medium flex items-center gap-1">
                Composições estatisticamente equivalentes
                <InfoTooltip text={TooltipComposicoesEquivalentes} />
              </h2>
              <div className="mt-1 text-sm whitespace-pre-line">{(() => {
                const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
                const eq = result?.equivalentes ?? ternaria?.equivalentes
                const s0 = typeof eq === 'string' ? eq : (eq != null ? String(eq) : "")
                const lines = String(s0).split(/\r?\n/).map(l => l.trim()).filter(Boolean)
                const uniq = Array.from(new Set(lines))
                if (uniq.length) return uniq.join("\n")
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
              <p className="mt-2 text-xs text-neutral-500 italic">Teores inferiores a 5% têm relevância reduzida (limite de detecção da metodologia).</p>
            </div>

            <div className="border rounded-lg p-3">
              <h2 className="font-medium">Síntese analítica dos resultados</h2>
              <ul className="mt-1 space-y-1">
                <li>Rótulo e resultados (±3%): {compatStatus}</li>
                <li>Composição equivalente compatível com rótulo: {(() => {
                  if (compatStatus !== "Compatível") return "nenhuma localizada"
                  const eq = String((result as any)?.ternaria?.equivalentes ?? result?.equivalentes ?? "")
                  let exp = result?.expectedComposition ?? null
                  if (!exp || (exp.agua === undefined && exp.et === undefined && exp.met === undefined)) {
                    exp = computeExpectedFromProfile(result?.conditions)
                  }
                  return pickCompatibleLine(eq, exp) ?? "-"
                })()}</li>
                <li className="flex items-center gap-1 flex-wrap">Composição mais provável <InfoTooltip text={TooltipMonteCarlo} />: {(() => {
                  const ternaria: TernariaOut | undefined = result ? ((result as unknown as { ternaria?: TernariaOut }).ternaria) : undefined
                  const mostLikely = result?.mostLikely ?? ternaria?.classe_final
                  
                  const conclusao = (result as any)?.conclusao ?? ''
                  const seletividade = (result as any)?.seletividade ?? ''
                  const equivalentes = result?.equivalentes ?? ternaria?.equivalentes ?? ''
                  
                  if (mostLikely) {
                    return mostLikely
                  } else if (seletividade === 'baixa' || conclusao.includes('inconclusivo')) {
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
                <li>Teor inicial (Fluxo 1): {(() => {
                  const w = result?.wAlcoolInicial
                  return w != null ? `${(w * 100).toFixed(2)}%` : '-'
                })()}</li>
                <li>Range de busca (±0.025): {(() => {
                  const w = result?.wAlcoolInicial
                  if (w == null) return '-'
                  const min = Math.max(0, w - 0.025)
                  const max = Math.min(1, w + 0.025)
                  return `${(min * 100).toFixed(2)}% – ${(max * 100).toFixed(2)}%`
                })()}</li>
                <li>Erro de viscosidade (malha): {(() => {
                  const err = result?.erroMuMalhaAbs
                  return err != null ? `${err.toFixed(4)} mPa·s` : '-'
                })()}</li>
              </ul>
              <p className="mt-2 text-xs text-neutral-500 italic">Este é um exame de triagem estimativo; não substitui análises laboratoriais oficiais.</p>
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
                <li>Instantes de escoamento: {sampleReplicates.length ? sampleReplicates.map(r => ([18,17,16,15,14] as Array<14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")).join("; ") : "-"}</li>
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
                <li>Instantes de escoamento: {waterReplicates.length ? waterReplicates.map(r => ([18,17,16,15,14] as Array<14|15|16|17|18>).map((v) => r.marks[v] != null ? `${v}:${(r.marks[v] as number).toFixed(2)}` : null).filter(Boolean).join(" | ")).join("; ") : "-"}</li>
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

      {/* Botões de ação atualizados */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button 
          onClick={exportToPDF}
          className="flex items-center justify-center gap-1 border-2 border-[#002060] text-[#002060] rounded-lg py-2 text-sm font-medium hover:bg-blue-50"
        >
          <FileText className="w-4 h-4" />
          PDF
        </button>
        
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center gap-1 border-2 border-[#002060] text-[#002060] rounded-lg py-2 text-sm font-medium hover:bg-blue-50"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => setShowMethodology(true)}
          className="flex items-center justify-center gap-1 border-2 border-[#002060] text-[#002060] rounded-lg py-2 text-sm font-medium hover:bg-blue-50"
        >
          <Info className="w-4 h-4" />
          Metodologia
        </button>
        
        <button 
          onClick={() => router.push("/medir")} 
          className="bg-[#002060] text-white rounded-lg py-2 text-sm font-medium border-2 border-[#002060] hover:bg-[#001040]"
        >
          Nova análise
        </button>
      </div>
      
      {/* Modal de Metodologia */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="Interpretação do Relatório"
      >
        <MethodologyRelatorio />
      </MethodologyModal>
    </div>
  )
}

