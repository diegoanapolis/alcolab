"use client"
import React, { useEffect, useState } from 'react'
import { DatabaseService, ExperimentRun, RunOutputs, APP_VERSION } from '@/lib/database'
import { runAlcoolPipeline } from '@/lib/alcoolWorkerClient'
import { normalizeRow } from '@/lib/backendMapping'
import Link from 'next/link'
import { Download, Upload, Filter, Search, AlertCircle, Info, RefreshCw, CheckSquare, Square, Loader2 } from 'lucide-react'
import { BEVERAGE_TYPES } from '@/lib/constants'
import MultiSelectDropdown from './MultiSelectDropdown'

interface AnalysisListPageProps {
  onSelectExperiment?: (exp: ExperimentRun) => void
}

// Função para verificar se balança tem baixa precisão e checar inconsistência
const checkLowPrecisionConsistency = async (exp: ExperimentRun): Promise<{
  canProcess: boolean
  blockedReason?: string
  message?: string
}> => {
  const inputs = exp.inputs
  
  // Se não tem informação de precisão da balança, pode processar normalmente
  if (inputs.balancaTemDecimal === undefined || inputs.balancaTemDecimal === true) {
    return { canProcess: true }
  }
  
  // Balança sem casa decimal - verificar se há dados de lowPrecisionCheckResult
  const checkResult = inputs.lowPrecisionCheckResult
  
  // Se o checkResult indicou erro (inconsistência), bloquear reprocessamento
  if (checkResult?.status === 'error') {
    return {
      canProcess: false,
      blockedReason: 'inconsistencia_precisao',
      message: checkResult.message || 'Inconsistência entre densidade e teor de rótulo que, em conjunto com a baixa sensibilidade da balança, impede a análise de avançar.'
    }
  }
  
  // Se passou com warning ou não tem checkResult, precisa refazer a verificação
  // (para casos de dados importados ou versões antigas)
  if (!checkResult && inputs.method === 'Balança') {
    // Tentar refazer a verificação de precisão
    const waterMass = inputs.waterMassRaw ?? inputs.waterMass
    const sampleMass = inputs.sampleMassRaw ?? inputs.sampleMass
    const containerMass = inputs.containerMass ?? 0
    
    if (waterMass && sampleMass) {
      const m_w = waterMass - containerMass
      const m_s = sampleMass - containerMass
      
      if (m_w > 0 && m_s > 0) {
        // Calcular intervalo de erro
        const rho_min = (m_s - 0.5) / (m_w + 0.5)
        const rho_max = (m_s + 0.5) / (m_w - 0.5)
        
        // Carregar tabela de conversão
        try {
          const convResponse = await fetch("/data/conversao_vv_para_wE_20C.json")
          if (convResponse.ok) {
            const convTable = await convResponse.json()
            const rhoArray = convTable.rho_mix_g_per_mL_20C as number[]
            const wEArray = convTable.wE_percent as number[]
            
            // Função para interpolar teor a partir de densidade relativa
            const densityToAlcoholContent = (rho: number): number | null => {
              if (rho >= rhoArray[0]) return 0
              if (rho <= rhoArray[rhoArray.length - 1]) return 100
              
              for (let i = 0; i < rhoArray.length - 1; i++) {
                if (rho <= rhoArray[i] && rho >= rhoArray[i + 1]) {
                  const rho0 = rhoArray[i]
                  const rho1 = rhoArray[i + 1]
                  const w0 = wEArray[i]
                  const w1 = wEArray[i + 1]
                  const t = (rho - rho0) / (rho1 - rho0)
                  return w0 + t * (w1 - w0)
                }
              }
              return null
            }
            
            const teor_min = densityToAlcoholContent(rho_max)
            const teor_max = densityToAlcoholContent(rho_min)
            
            if (teor_min !== null && teor_max !== null) {
              // Obter teor de rótulo
              let labelTeorMM: number | null = null
              
              if (inputs.beverageType === "Outra hidroalcoólica") {
                const etMM = inputs.ethanolMassPercent ?? 0
                const metMM = inputs.methanolMassPercent ?? 0
                labelTeorMM = etMM + metMM
              } else if (inputs.labelAbv !== undefined && inputs.labelAbv !== null) {
                if (inputs.labelUnit === "INPM ou % m/m") {
                  labelTeorMM = inputs.labelAbv
                } else {
                  // Converter v/v para m/m
                  const glArray = convTable.gl as number[]
                  const glIndex = glArray.findIndex(v => v >= inputs.labelAbv!)
                  if (glIndex >= 0 && glIndex < wEArray.length) {
                    if (glIndex === 0 || glArray[glIndex] === inputs.labelAbv) {
                      labelTeorMM = wEArray[glIndex]
                    } else {
                      const g0 = glArray[glIndex - 1]
                      const g1 = glArray[glIndex]
                      const w0 = wEArray[glIndex - 1]
                      const w1 = wEArray[glIndex]
                      const t = (inputs.labelAbv! - g0) / (g1 - g0)
                      labelTeorMM = w0 + t * (w1 - w0)
                    }
                  }
                }
              }
              
              // Verificar se rótulo está no intervalo
              if (labelTeorMM !== null) {
                const rotuloNoIntervalo = labelTeorMM >= teor_min && labelTeorMM <= teor_max
                
                if (!rotuloNoIntervalo) {
                  const rho_central = m_s / m_w
                  const teor_central = densityToAlcoholContent(rho_central)
                  
                  return {
                    canProcess: false,
                    blockedReason: 'inconsistencia_precisao',
                    message: `Inconsistência entre densidade e teor de rótulo que, em conjunto com a baixa sensibilidade da balança, impede a análise de avançar.\n\nConsiderando as massas informadas e variações máximas em cada pesagem (± 0,5 g), obtivemos teor alcoólico inicial de ${teor_central?.toFixed(1) ?? '?'}% e um intervalo possível entre ${teor_min.toFixed(1)}% e ${teor_max.toFixed(1)}% (% m/m).\n\nComo o teor de rótulo não se encontra dentro desse intervalo e a sensibilidade das pesagens é insuficiente para restringir a faixa estimada, recomenda-se repetir as pesagens com uma balança com pelo menos uma casa decimal ou utilizar um densímetro.`
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('Erro ao verificar precisão:', e)
        }
      }
    }
  }
  
  return { canProcess: true }
}

// Função para reprocessar um experimento
const reprocessExperiment = async (
  exp: ExperimentRun,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; error?: string; blocked?: boolean; blockMessage?: string }> => {
  try {
    onProgress?.(`Verificando ${exp.tags.sampleName || 'amostra'}...`)
    
    // Verificar se pode processar (baixa precisão de balança)
    const precisionCheck = await checkLowPrecisionConsistency(exp)
    if (!precisionCheck.canProcess) {
      // Atualizar o experimento com status bloqueado
      const blockedOutputs: Partial<RunOutputs> = {
        processamentoStatus: 'bloqueado_precisao',
        processamentoMensagem: precisionCheck.message,
        // Limpar resultados anteriores que seriam inválidos
        equivalentes: undefined,
        classe_final: undefined,
        compativel: undefined,
        mostLikely: undefined,
        conclusao: precisionCheck.message,
      }
      
      await DatabaseService.updateExperiment(
        exp.id!,
        { outputs: blockedOutputs as RunOutputs },
        { fromVersion: exp.appVersion, changesApplied: ['bloqueado_por_precisao'] }
      )
      
      return { 
        success: false, 
        blocked: true, 
        blockMessage: precisionCheck.message 
      }
    }
    
    onProgress?.(`Processando ${exp.tags.sampleName || 'amostra'}...`)
    
    const inputs = exp.inputs
    
    // Calcular média dos tempos
    const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN
    const waterMean = mean(inputs.waterTimes)
    const sampleMean = mean(inputs.sampleTimes)
    
    // Montar objeto de exportação
    const exportRow: Record<string, unknown> = {
      sampleName: inputs.sampleName ?? "",
      beverageType: inputs.beverageType ?? "",
      labelAbv: inputs.labelAbv ?? null,
      labelUnit: inputs.labelUnit ?? "",
      ethanolMassPercent: inputs.ethanolMassPercent ?? null,
      methanolMassPercent: inputs.methanolMassPercent ?? null,
      brand: inputs.brand ?? "",
      
      waterTemperature: inputs.waterTemperature ?? null,
      sampleTemperature: inputs.sampleTemperature ?? null,
      waterType: inputs.waterType ?? "",
      
      method: inputs.method ?? "",
      containerMass: inputs.containerMass ?? null,
      waterMass: inputs.waterMass ?? null,
      sampleMass: inputs.sampleMass ?? null,
      measuredUnit: inputs.measuredUnit ?? "",
      measuredValue: inputs.measuredValue ?? null,
      
      t_agua: Number.isFinite(waterMean) ? waterMean : null,
      t_amostra: Number.isFinite(sampleMean) ? sampleMean : null,
      waterTimes: inputs.waterTimes.join(';'),
      sampleTimes: inputs.sampleTimes.join(';'),
      
      n_extra_video_sample: Math.max(0, (inputs.videoReplicatesSample?.length ?? 0) - 1),
      n_extra_manual_sample: Math.max(0, inputs.sampleTimes.length - 1),
    }
    
    // Normalizar e processar
    const normalizedRow = normalizeRow(exportRow)
    
    // Chamar o pipeline
    const result = await runAlcoolPipeline([normalizedRow])
    
    if (!result || !result.resultados || result.resultados.length === 0) {
      throw new Error('Pipeline não retornou resultados')
    }
    
    const first = result.resultados[0]
    const rep = result.repeticoes?.[0] ?? null
    
    // Montar novos outputs
    const safeNum = (v: any): number | undefined => 
      (typeof v === "number" && isFinite(v)) ? v : undefined
    
    const newOutputs: RunOutputs = {
      waterMeanTime: safeNum(waterMean),
      sampleMeanTime: safeNum(sampleMean),
      viscosityRel: safeNum(first.mu_ratio ?? first.viscosityRel),
      muAbsWater: safeNum(first.mu_agua_abs ?? first.muAbsWater),
      muAbsSample: safeNum(first.mu_amostra_abs_corr ?? first.mu_amostra_abs ?? first.muAbsSample),
      cvWaterTime: safeNum(first.cv_water_time ?? first.cvWaterTime),
      cvSampleTime: safeNum(first.cv_sample_time ?? first.cvSampleTime),
      
      classe_final: rep?.classe_final ?? undefined,
      equivalentes: rep?.equivalentes ?? undefined,
      mostLikely: rep?.most_likely_txt ?? rep?.classe_final ?? undefined,
      compativel: rep?.compativel ?? undefined,
      seletividade: rep?.seletividade ?? undefined,
      conclusao: rep?.conclusao ?? undefined,
      
      approvals: rep?.approvals ?? undefined,
      flags: rep?.flags ?? undefined,
      
      erroMuMalhaAbs: safeNum(first.erro_mu_malha ?? first.erroMuMalhaAbs),
      erroMuMalhaPct: safeNum(first.erro_mu_malha_pct ?? first.erroMuMalhaPct),
      wAlcoolInicial: safeNum(first.w_alcool),
      wAlcoolBest: safeNum(first.w_alcool_best ?? rep?.w_alcool_best),
      
      w_agua_est: safeNum(rep?.w_agua_est ?? first.w_agua_est),
      w_et_est: safeNum(rep?.w_et_est ?? first.w_et_est),
      w_met_est: safeNum(rep?.w_met_est ?? first.w_met_est),
      expectedComposition: {
        agua: safeNum(rep?.w_agua_est ?? first.w_agua_est) ?? 0,
        et: safeNum(rep?.w_et_est ?? first.w_et_est) ?? 0,
        met: safeNum(rep?.w_met_est ?? first.w_met_est) ?? 0,
      },
      
      processamentoStatus: 'sucesso',
      processamentoMensagem: undefined,
    }
    
    // Atualizar no banco
    await DatabaseService.updateExperiment(
      exp.id!,
      { outputs: newOutputs },
      { fromVersion: exp.appVersion, changesApplied: ['reprocessamento_completo'] }
    )
    
    return { success: true }
    
  } catch (error) {
    console.error('Erro ao reprocessar:', error)
    
    // Atualizar com status de erro
    try {
      await DatabaseService.updateExperiment(
        exp.id!,
        { 
          outputs: {
            ...exp.outputs,
            processamentoStatus: 'erro',
            processamentoMensagem: String(error),
          }
        },
        { fromVersion: exp.appVersion, changesApplied: ['erro_reprocessamento'] }
      )
    } catch {}
    
    return { success: false, error: String(error) }
  }
}

export default function AnalysisListPage({ onSelectExperiment }: AnalysisListPageProps) {
  const [experiments, setExperiments] = useState<ExperimentRun[]>([])
  const [filteredExperiments, setFilteredExperiments] = useState<ExperimentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showEducationalAlert, setShowEducationalAlert] = useState(false)
  const [showReprocessing, setShowReprocessing] = useState(false)
  const [selectedForReprocessing, setSelectedForReprocessing] = useState<Set<number>>(new Set())
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [reprocessingProgress, setReprocessingProgress] = useState<{
    current: number
    total: number
    currentName: string
    results: Array<{ id: number; name: string; success: boolean; blocked?: boolean; message?: string }>
  } | null>(null)
  const [filters, setFilters] = useState({
    sampleName: '',
    brand: '',
    beverageTypes: [] as string[],
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadExperiments()
    checkFirstTime()
  }, [])

  const checkFirstTime = () => {
    const hasSeenAlert = localStorage.getItem('alcolab_backup_alert_shown')
    if (!hasSeenAlert) {
      setShowEducationalAlert(true)
      localStorage.setItem('alcolab_backup_alert_shown', 'true')
    }
  }

  const loadExperiments = async () => {
    if (typeof window === 'undefined') return
    
    try {
      setLoading(true)
      const data = await DatabaseService.getAllExperiments()
      setExperiments(data)
      setFilteredExperiments(data)
    } catch (error) {
      console.error('Erro ao carregar experimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    if (typeof window === 'undefined') return
    
    try {
      setLoading(true)
      const filtered = await DatabaseService.searchExperiments(filters)
      setFilteredExperiments(filtered)
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error)
      setFilteredExperiments(experiments)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      sampleName: '',
      brand: '',
      beverageTypes: [],
      startDate: '',
      endDate: ''
    })
    setFilteredExperiments(experiments)
  }

  const getSemaforoColor = (exp: ExperimentRun): { backgroundColor: string; textColor: string; text: string; status: string } => {
    // Verificar se foi bloqueado por precisão
    if (exp.outputs.processamentoStatus === 'bloqueado_precisao') {
      return {
        backgroundColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        text: 'Bloqueado: inconsistência balança',
        status: 'Bloqueado'
      }
    }
    
    const compativel = exp.outputs.compativel || 'Indeterminado'
    const beverageType = exp.inputs.beverageType
    const approvals = exp.outputs.approvals as any
    const flags = exp.outputs.flags as any
    
    // Verificar se há metanol alto nas equivalentes
    const eqHasMetanolAlto = (() => {
      if (typeof flags?.methanolAbove5InEquivalents === "boolean") return flags.methanolAbove5InEquivalents
      const ternEq = String(exp.outputs.equivalentes ?? "").toLowerCase()
      const m = ternEq.match(/metanol\s+(\d+(?:[\.,]\d+)?)%/)
      if (!m) return false
      const v = Number(String(m[1]).replace(",", "."))
      return isFinite(v) && v > 5
    })()
    
    // Verificar aprovação do experimento
    const experimentoAprovado = approvals?.status === 'Aprovado' || 
      (exp.inputs.waterTimes.length >= 2 && exp.inputs.sampleTimes.length >= 2)
    
    const tipoMetanolComercial = beverageType === "Metanol comercial"
    const tipoEtanolCombustivel = beverageType === "Etanol combustível"
    const tipoBebida = beverageType && !tipoMetanolComercial && !tipoEtanolCombustivel
    
    // Lógica do semáforo
    if (tipoMetanolComercial || tipoEtanolCombustivel) {
      if (compativel === 'Compatível' && experimentoAprovado) {
        return { 
          backgroundColor: 'bg-green-100', 
          textColor: 'text-green-800',
          text: 'Compatibilidade entre rótulo e experimento',
          status: compativel
        }
      }
      if (compativel === 'Incompatível' && experimentoAprovado) {
        return { 
          backgroundColor: 'bg-red-100', 
          textColor: 'text-red-800',
          text: 'Incompatível com o rótulo',
          status: compativel
        }
      }
      return { 
        backgroundColor: 'bg-yellow-100', 
        textColor: 'text-yellow-800',
        text: 'Necessários mais dados experimentais',
        status: 'Indeterminado'
      }
    }
    
    if (tipoBebida) {
      const isOutraHidroComMetanol = beverageType === "Outra hidroalcoólica" && 
        (exp.inputs.methanolMassPercent != null && exp.inputs.methanolMassPercent > 0)
      
      if (!isOutraHidroComMetanol && compativel === 'Incompatível' && eqHasMetanolAlto && experimentoAprovado) {
        return { 
          backgroundColor: 'bg-red-100', 
          textColor: 'text-red-800',
          text: 'Possível presença de metanol',
          status: compativel
        }
      }
      if (compativel === 'Compatível' && experimentoAprovado) {
        return { 
          backgroundColor: 'bg-green-100', 
          textColor: 'text-green-800',
          text: 'Compatibilidade entre rótulo e experimento',
          status: compativel
        }
      }
      if (compativel === 'Incompatível' && experimentoAprovado) {
        return { 
          backgroundColor: 'bg-red-100', 
          textColor: 'text-red-800',
          text: 'Incompatível com o rótulo',
          status: compativel
        }
      }
      return { 
        backgroundColor: 'bg-yellow-100', 
        textColor: 'text-yellow-800',
        text: 'Necessários mais dados experimentais',
        status: 'Indeterminado'
      }
    }
    
    return { 
      backgroundColor: 'bg-yellow-100', 
      textColor: 'text-yellow-800',
      text: 'Necessários mais dados experimentais',
      status: 'Indeterminado'
    }
  }

  const toggleReprocessingSelection = (expId: number) => {
    const newSelection = new Set(selectedForReprocessing)
    if (newSelection.has(expId)) {
      newSelection.delete(expId)
    } else {
      newSelection.add(expId)
    }
    setSelectedForReprocessing(newSelection)
  }

  const selectAllForReprocessing = () => {
    const allIds = new Set(filteredExperiments.map(exp => exp.id!).filter(id => id !== undefined))
    setSelectedForReprocessing(allIds)
  }

  const clearReprocessingSelection = () => {
    setSelectedForReprocessing(new Set())
  }

  const handleReprocessSelected = async () => {
    if (selectedForReprocessing.size === 0) {
      alert('Selecione ao menos uma análise para reprocessar')
      return
    }
    
    const confirmMsg = `Deseja reprocessar ${selectedForReprocessing.size} análise(s) com a versão atual do aplicativo (v${APP_VERSION})?\n\nIsso irá recalcular os resultados usando o fluxograma atualizado.`
    if (!confirm(confirmMsg)) return
    
    setIsReprocessing(true)
    const toProcess = filteredExperiments.filter(exp => selectedForReprocessing.has(exp.id!))
    const results: Array<{ id: number; name: string; success: boolean; blocked?: boolean; message?: string }> = []
    
    setReprocessingProgress({
      current: 0,
      total: toProcess.length,
      currentName: '',
      results: []
    })
    
    for (let i = 0; i < toProcess.length; i++) {
      const exp = toProcess[i]
      const name = exp.tags.sampleName || exp.inputs.beverageType || `Análise ${exp.id}`
      
      setReprocessingProgress({
        current: i + 1,
        total: toProcess.length,
        currentName: name,
        results: [...results]
      })
      
      const result = await reprocessExperiment(exp, (msg) => {
        setReprocessingProgress(prev => prev ? { ...prev, currentName: msg } : null)
      })
      
      results.push({
        id: exp.id!,
        name,
        success: result.success,
        blocked: result.blocked,
        message: result.blocked ? result.blockMessage : result.error
      })
    }
    
    setReprocessingProgress({
      current: toProcess.length,
      total: toProcess.length,
      currentName: 'Concluído',
      results
    })
    
    // Recarregar experimentos
    await loadExperiments()
    
    setIsReprocessing(false)
    setShowReprocessing(false)
    setSelectedForReprocessing(new Set())
    
    // Mostrar resumo
    const successCount = results.filter(r => r.success).length
    const blockedCount = results.filter(r => r.blocked).length
    const errorCount = results.filter(r => !r.success && !r.blocked).length
    
    let summaryMsg = `Reprocessamento concluído!\n\n✅ Sucesso: ${successCount}`
    if (blockedCount > 0) {
      summaryMsg += `\n⚠️ Bloqueados (baixa precisão balança): ${blockedCount}`
    }
    if (errorCount > 0) {
      summaryMsg += `\n❌ Erros: ${errorCount}`
    }
    
    alert(summaryMsg)
    setReprocessingProgress(null)
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDisplayName = (exp: ExperimentRun) => {
    const parts = []
    
    if (exp.tags.sampleName) {
      parts.push(exp.tags.sampleName)
    }
    
    if (exp.tags.brand) {
      parts.push(exp.tags.brand)
    }
    
    if (parts.length === 0) {
      parts.push(exp.inputs.beverageType || 'Análise')
    }
    
    return parts.join(' - ')
  }

  const selectExperiment = (exp: ExperimentRun) => {
    if (onSelectExperiment) {
      onSelectExperiment(exp)
      return
    }
    localStorage.setItem('selectedExperiment', JSON.stringify(exp))
    window.location.reload()
  }

  const exportToJSON = async () => {
    if (typeof window === 'undefined') return
    
    try {
      const jsonData = await DatabaseService.exportToJSON()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `alcolab_backup_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erro ao exportar dados: ' + error)
    }
  }

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string
        const result = await DatabaseService.importFromJSON(jsonData)
        
        alert(`Importação concluída!\nImportados: ${result.imported}\nIgnorados: ${result.skipped}${result.errors.length > 0 ? `\nErros: ${result.errors.length}` : ''}`)
        
        await loadExperiments()
      } catch (error) {
        alert('Erro ao importar dados: ' + error)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  if (loading && experiments.length === 0) {
    return (
      <div className="md:max-w-md md:mx-auto p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="md:max-w-md md:mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#002060]">Análises já realizadas</h1>
        <span className="text-sm text-gray-600">{filteredExperiments.length} itens</span>
      </div>

      {/* Aviso educativo */}
      {showEducationalAlert && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Aviso importante:</span> Seus dados ficam armazenados no dispositivo, mas podem ser perdidos em limpezas de cache futuras. Para maior segurança, exporte um backup periodicamente.
              </p>
              <button 
                onClick={() => setShowEducationalAlert(false)}
                className="text-sm text-blue-600 underline"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white"
          disabled={isReprocessing}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        
        <button
          onClick={() => {
            setShowReprocessing(!showReprocessing)
            if (showReprocessing) {
              setSelectedForReprocessing(new Set())
            }
          }}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white"
          disabled={isReprocessing}
        >
          <RefreshCw className="w-4 h-4" />
          Reprocessar
        </button>
        
        <button
          onClick={exportToJSON}
          className="flex items-center gap-2 px-3 py-2 bg-[#002060] text-white rounded-lg text-sm"
          disabled={isReprocessing}
        >
          <Download className="w-4 h-4" />
          Backup
        </button>
        
        <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer ${isReprocessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload className="w-4 h-4" />
          Restaurar
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
            disabled={isReprocessing}
          />
        </label>
        
        <button
          onClick={() => alert('Os backups permitem:\n• Preservar seus dados permanentemente\n• Transferir entre dispositivos\n• Recuperar análises antigas\n• Compartilhar dados com colegas\n\nRecomendamos fazer backup mensalmente!')}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Painel de reprocessamento */}
      {showReprocessing && !isReprocessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-blue-800">
              Selecionar análises para reprocessar ({selectedForReprocessing.size} selecionadas)
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAllForReprocessing}
                className="text-xs text-blue-600 underline"
              >
                Selecionar todas
              </button>
              <button
                onClick={clearReprocessingSelection}
                className="text-xs text-blue-600 underline"
              >
                Limpar seleção
              </button>
            </div>
          </div>
          
          <p className="text-xs text-blue-700">
            O reprocessamento aplica o fluxograma atualizado (v{APP_VERSION}) aos dados brutos salvos.
            Análises com balança sem casa decimal e inconsistência de densidade serão bloqueadas.
          </p>
          
          {selectedForReprocessing.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleReprocessSelected}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Reprocessar {selectedForReprocessing.size} selecionadas
              </button>
              <button
                onClick={() => {
                  setShowReprocessing(false)
                  setSelectedForReprocessing(new Set())
                }}
                className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Progresso do reprocessamento */}
      {isReprocessing && reprocessingProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-800">
              Reprocessando... ({reprocessingProgress.current}/{reprocessingProgress.total})
            </span>
          </div>
          <p className="text-xs text-blue-700">{reprocessingProgress.currentName}</p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(reprocessingProgress.current / reprocessingProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
          <div className="space-y-3">
            <MultiSelectDropdown
              label="Tipo de amostra"
              options={BEVERAGE_TYPES}
              selected={filters.beverageTypes}
              onChange={(newTypes) => setFilters({...filters, beverageTypes: newTypes})}
              placeholder="Selecione os tipos..."
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome da amostra
                </label>
                <input
                  type="text"
                  value={filters.sampleName}
                  onChange={(e) => setFilters({...filters, sampleName: e.target.value})}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="Buscar..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Marca/Fabricante
                </label>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) => setFilters({...filters, brand: e.target.value})}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="Buscar..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate ? filters.startDate.split('T')[0] : ''}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : ''})}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data final
                </label>
                <input
                  type="date"
                  value={filters.endDate ? filters.endDate.split('T')[0] : ''}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value ? `${e.target.value}T23:59:59.999Z` : ''})}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-[#002060] text-white rounded-lg py-2 text-sm"
            >
              Aplicar filtros
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 border rounded-lg py-2 text-sm"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Lista de experimentos */}
      <div className="space-y-3">
        {filteredExperiments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>{experiments.length === 0 ? 'Nenhuma análise realizada ainda' : 'Nenhuma análise encontrada com esses filtros'}</p>
            {experiments.length === 0 && (
              <Link href="/medir" className="text-[#002060] underline text-sm mt-2 inline-block">
                Fazer primeira análise
              </Link>
            )}
          </div>
        ) : (
          filteredExperiments.map((exp) => {
            const semaforoStyle = getSemaforoColor(exp)
            const isSelected = selectedForReprocessing.has(exp.id!)
            const isBlocked = exp.outputs.processamentoStatus === 'bloqueado_precisao'
            
            return (
              <div
                key={exp.id}
                className={`border rounded-lg p-4 bg-white transition-colors ${
                  showReprocessing ? 'cursor-pointer' : 'cursor-pointer hover:bg-gray-50'
                } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${isBlocked ? 'border-gray-300 bg-gray-50' : ''}`}
                onClick={() => {
                  if (showReprocessing) {
                    toggleReprocessingSelection(exp.id!)
                  } else {
                    selectExperiment(exp)
                  }
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    {showReprocessing && (
                      <div className="flex items-center mr-3 mt-1">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {getDisplayName(exp)}
                      </h3>
                    </div>
                    
                    <div className="text-right text-xs text-gray-500 ml-2 flex-shrink-0">
                      <div>{formatDate(exp.createdAt)}</div>
                      <div>{formatTime(exp.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-4">
                      <span>Tipo: {exp.inputs.beverageType}</span>
                    </div>
                    
                    {/* Mostrar mensagem de bloqueio se aplicável */}
                    {isBlocked ? (
                      <div className="text-xs bg-gray-100 p-2 rounded border border-gray-200">
                        <span className="font-medium text-gray-700">⚠️ Análise bloqueada:</span>
                        <p className="mt-1 text-gray-600">
                          {exp.outputs.processamentoMensagem?.substring(0, 150) || 'Inconsistência entre densidade e teor de rótulo com balança de baixa precisão.'}
                          {(exp.outputs.processamentoMensagem?.length ?? 0) > 150 && '...'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <span className="font-medium">Composições estatisticamente equivalentes:</span>
                        <div className="mt-1 text-gray-700 text-xs leading-relaxed">
                          {(() => {
                            const eq = exp.outputs.equivalentes
                            if (!eq || eq.trim() === '') {
                              const labelAbv = exp.inputs.labelAbv
                              const labelUnit = exp.inputs.labelUnit || '% v/v'
                              if (labelAbv && labelAbv > 0) {
                                let etanolMass = labelAbv * 0.8
                                if (labelUnit.includes('m/m') || labelUnit.includes('INPM')) {
                                  etanolMass = labelAbv
                                }
                                const aguaMass = 100 - etanolMass
                                return `Água ${aguaMass.toFixed(1)}%; etanol ${etanolMass.toFixed(1)}%.`
                              }
                              return 'Dados insuficientes'
                            }
                            const lines = eq.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
                            const uniqueLines = Array.from(new Set(lines))
                            return (
                              <>
                                {uniqueLines.map((line, idx) => (
                                  <div key={idx}>{line}</div>
                                ))}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      v{exp.appVersion}
                      {exp.lastProcessedVersion && exp.lastProcessedVersion !== exp.appVersion && (
                        <span className="ml-1 text-blue-500">→ v{exp.lastProcessedVersion}</span>
                      )}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isBlocked ? 'bg-gray-400' :
                        semaforoStyle.backgroundColor.includes('green') ? 'bg-green-500' :
                        semaforoStyle.backgroundColor.includes('red') ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        semaforoStyle.backgroundColor} ${semaforoStyle.textColor}
                      `}>
                        {semaforoStyle.text.length > 35 
                          ? `${semaforoStyle.text.substring(0, 35)}...` 
                          : semaforoStyle.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Botão de nova análise */}
      {filteredExperiments.length > 0 && (
        <div className="pt-4">
          <Link
            href="/medir"
            className="block w-full bg-[#002060] text-white text-center py-3 rounded-lg font-medium"
          >
            Nova Análise
          </Link>
        </div>
      )}
    </div>
  )
}
