"use client"
import React, { useEffect, useState } from 'react'
import { DatabaseService, ExperimentRun } from '@/lib/database'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, Upload, Filter, Calendar, Search, FileDown, AlertCircle, Info, RefreshCw, CheckSquare, Square } from 'lucide-react'
import { BEVERAGE_TYPES } from '@/lib/constants'
import MultiSelectDropdown from './MultiSelectDropdown'

interface AnalysisListPageProps {
  onSelectExperiment?: (exp: ExperimentRun) => void
}

export default function AnalysisListPage({ onSelectExperiment }: AnalysisListPageProps) {
  const [experiments, setExperiments] = useState<ExperimentRun[]>([])
  const [filteredExperiments, setFilteredExperiments] = useState<ExperimentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showEducationalAlert, setShowEducationalAlert] = useState(false)
  const [showReprocessing, setShowReprocessing] = useState(false)
  const [selectedForReprocessing, setSelectedForReprocessing] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState({
    sampleName: '',
    brand: '',
    beverageTypes: [] as string[],
    startDate: '',
    endDate: ''
  })
  const router = useRouter()

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
      // Verificar se é "Outra hidroalcoólica" com metanol informado > 0%
      const isOutraHidroComMetanol = beverageType === "Outra hidroalcoólica" && 
        (exp.inputs.methanolMassPercent != null && exp.inputs.methanolMassPercent > 0)
      
      // Se é "Outra hidroalcoólica" com metanol informado, não alertar sobre metanol
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
    
    // Caso padrão
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
    
    const confirmMsg = `Deseja reprocessar ${selectedForReprocessing.size} análise(s) com a versão atual do aplicativo?`
    if (confirm(confirmMsg)) {
      // TODO: Implementar lógica de reprocessamento
      alert('Funcionalidade de reprocessamento em desenvolvimento')
      setShowReprocessing(false)
      setSelectedForReprocessing(new Set())
    }
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
    // Se temos callback do pai, usar diretamente (sem recarregar)
    if (onSelectExperiment) {
      onSelectExperiment(exp)
      return
    }
    // Fallback: salvar no localStorage e recarregar
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
    
    // Reset input
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
        >
          <RefreshCw className="w-4 h-4" />
          Reprocessar
        </button>
        
        <button
          onClick={exportToJSON}
          className="flex items-center gap-2 px-3 py-2 bg-[#002060] text-white rounded-lg text-sm"
        >
          <Download className="w-4 h-4" />
          Backup
        </button>
        
        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer">
          <Upload className="w-4 h-4" />
          Restaurar
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
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
      {showReprocessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Selecionar análises para reprocessar ({selectedForReprocessing.size} selecionadas)
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAllForReprocessing}
                className="text-xs text-blue-600 underline"
              >
                Selecionar todas filtradas
              </button>
              <button
                onClick={clearReprocessingSelection}
                className="text-xs text-blue-600 underline"
              >
                Limpar seleção
              </button>
            </div>
          </div>
          
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

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
          <div className="space-y-3">
            {/* Tipo de amostra - dropdown multi-select com tags */}
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
            
            return (
              <div
                key={exp.id}
                className={`border rounded-lg p-4 bg-white transition-colors ${
                  showReprocessing ? 'cursor-pointer' : 'cursor-pointer hover:bg-gray-50'
                } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
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
                    
                    {/* Mostrar composições estatisticamente equivalentes */}
                    <div className="text-xs">
                      <span className="font-medium">Composições estatisticamente equivalentes:</span>
                      <div className="mt-1 text-gray-700 text-xs leading-relaxed">
                        {(() => {
                          const eq = exp.outputs.equivalentes
                          if (!eq || eq.trim() === '') {
                            // Tentar gerar a partir dos dados disponíveis
                            const labelAbv = exp.inputs.labelAbv
                            const labelUnit = exp.inputs.labelUnit || '% v/v'
                            if (labelAbv && labelAbv > 0) {
                              // Calcular composição esperada
                              let etanolMass = labelAbv * 0.8 // Conversão v/v -> m/m
                              if (labelUnit.includes('m/m') || labelUnit.includes('INPM')) {
                                etanolMass = labelAbv
                              }
                              const aguaMass = 100 - etanolMass
                              return `Água ${aguaMass.toFixed(1)}%; etanol ${etanolMass.toFixed(1)}%.`
                            }
                            return 'Dados insuficientes'
                          }
                          // Formatar equivalentes existentes com quebra de linha
                          const lines = eq.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
                          const uniqueLines = Array.from(new Set(lines))
                          // Mostrar cada composição em uma linha separada
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
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">v{exp.appVersion}</span>
                    
                    {/* Indicador do semáforo com cor e texto */}
                    <div className="flex items-center gap-2">
                      {/* Bolinha colorida do semáforo */}
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        semaforoStyle.backgroundColor.includes('green') ? 'bg-green-500' :
                        semaforoStyle.backgroundColor.includes('red') ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      {/* Texto resumido do resultado */}
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
