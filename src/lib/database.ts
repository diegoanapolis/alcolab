// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

import Dexie, { Table } from 'dexie'

// Versões do sistema
export const APP_VERSION = "1.1.0"
export const CALIBRATION_VERSION = "1.0.0" 
export const SCHEMA_VERSION = "1.1.0"

// Interface para os dados de entrada do usuário
export interface RunInputs {
  // Perfil da amostra
  beverageType: string
  sampleName?: string
  brand?: string
  lot?: string
  labelAbv?: number
  labelUnit?: string
  ethanolMassPercent?: number
  methanolMassPercent?: number
  
  // Temperatura
  waterType?: string
  waterTemperature?: number
  sampleTemperature?: number
  conductivity?: number
  estimatedConductivity?: number
  
  // Densidade
  method?: string
  containerMass?: number // Massa do conjunto (seringa, êmbolo, agulha) - NOVO
  waterMass?: number // Massa líquida da água
  sampleMass?: number // Massa líquida da amostra
  waterMassRaw?: number // Massa bruta da água (com recipiente) - NOVO
  sampleMassRaw?: number // Massa bruta da amostra (com recipiente) - NOVO
  measuredValue?: number
  measuredUnit?: string
  
  // Informação de precisão da balança - NOVO
  balancaTemDecimal?: boolean // true = tem casa decimal, false = não tem, undefined = não perguntado
  lowPrecisionCheckResult?: {
    status: 'ok' | 'warning' | 'error'
    message: string
    teor_inicial_pct?: number
    teor_min_pct?: number
    teor_max_pct?: number
    useLabelAsInitial?: boolean
  }
  
  // Flow times
  waterTimes: number[]
  sampleTimes: number[]
  
  // Dados de vídeo (URLs dos blobs ou file paths)
  videoReplicatesWater?: Array<{
    previewUrl: string
    fileName?: string
    fileCreatedAt?: string
    marks: Record<14|15|16|17|18, number|undefined>
    volumesMarked: Array<14|15|16|17|18>
  }>
  videoReplicatesSample?: Array<{
    previewUrl: string
    fileName?: string
    fileCreatedAt?: string
    marks: Record<14|15|16|17|18, number|undefined>
    volumesMarked: Array<14|15|16|17|18>
  }>
}

// Interface para os results/outputs
export interface RunOutputs {
  // Viscosidades
  waterMeanTime?: number
  sampleMeanTime?: number
  viscosityRel?: number
  muAbsWater?: number
  muAbsSample?: number
  cvWaterTime?: number
  cvSampleTime?: number
  
  // Classificação
  classe_final?: string
  equivalentes?: string
  mostLikely?: string
  compativel?: string
  seletividade?: string
  conclusao?: string
  
  // Métricas e validações
  approvals?: Record<string, unknown>
  flags?: Record<string, unknown>
  
  // Erros e logs
  erroMuMalhaAbs?: number
  erroMuMalhaPct?: number
  wAlcoolInicial?: number
  wAlcoolBest?: number
  logs?: string[]
  
  // Composição esperada (calculada pelo Python)
  w_agua_est?: number
  w_et_est?: number
  w_met_est?: number
  expectedComposition?: { agua?: number; et?: number; met?: number }
  
  // Status de processamento - NOVO
  processamentoStatus?: 'sucesso' | 'bloqueado_precisao' | 'erro'
  processamentoMensagem?: string // Mensagem explicativa quando bloqueado
}

// Interface para tags/metadados
export interface RunTags {
  sampleName?: string
  brand?: string
  lot?: string
  observations?: string
  year?: number
  month?: number
  fullDate?: string // formato ISO para facilitar ordenação
}

// Interface principal do experimento
export interface ExperimentRun {
  id?: number // Auto-incrementado pelo Dexie
  createdAt: string // ISO string
  updatedAt?: string // ISO string - NOVO (para reprocessamentos)
  
  // Versões do sistema
  appVersion: string
  calibrationVersion: string
  schemaVersion: string
  
  // Versão do processamento (atualizada em reprocessamentos) - NOVO
  lastProcessedVersion?: string
  
  // Dados principais
  inputs: RunInputs
  outputs: RunOutputs
  tags: RunTags
  
  // Metadados adicionais
  processingTime?: number
  deviceInfo?: string
  
  // Histórico de reprocessamentos - NOVO
  reprocessingHistory?: Array<{
    date: string
    fromVersion: string
    toVersion: string
    changesApplied?: string[]
  }>
}

// Classe do banco de dados
class ExperimentDatabase extends Dexie {
  experiments!: Table<ExperimentRun>
  
  constructor() {
    super('experimentos_alcolab_db')
    
    // Versão 1: Schema original
    this.version(1).stores({
      experiments: '++id, createdAt, tags.sampleName, tags.brand, tags.lot, tags.year, tags.month, appVersion, calibrationVersion, schemaVersion'
    })
    
    // Versão 2: Adiciona updatedAt e lastProcessedVersion como índices
    this.version(2).stores({
      experiments: '++id, createdAt, updatedAt, tags.sampleName, tags.brand, tags.lot, tags.year, tags.month, appVersion, calibrationVersion, schemaVersion, lastProcessedVersion'
    }).upgrade(tx => {
      // Migração: adicionar campos news aos registros existentes
      return tx.table('experiments').toCollection().modify(exp => {
        if (!exp.lastProcessedVersion) {
          exp.lastProcessedVersion = exp.appVersion
        }
        if (!exp.updatedAt) {
          exp.updatedAt = exp.createdAt
        }
      })
    })
  }
}

// Instância única do banco (apenas no cliente)
let dbInstance: ExperimentDatabase | null = null

const getDB = () => {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be accessed on the client side')
  }
  
  if (!dbInstance) {
    dbInstance = new ExperimentDatabase()
  }
  
  return dbInstance
}

export const db = {
  get experiments() {
    return getDB().experiments
  }
}

// Funções utilitárias para o banco de dados
export class DatabaseService {
  // Salvar um new experimento
  static async saveExperiment(
    inputs: RunInputs,
    outputs: RunOutputs,
    tags: RunTags
  ): Promise<number> {
    const now = new Date().toISOString()
    const experiment: ExperimentRun = {
      createdAt: now,
      updatedAt: now,
      appVersion: APP_VERSION,
      calibrationVersion: CALIBRATION_VERSION,
      schemaVersion: SCHEMA_VERSION,
      lastProcessedVersion: APP_VERSION,
      inputs,
      outputs,
      tags: {
        ...tags,
        fullDate: now,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      },
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }
    
    return await db.experiments.add(experiment) as number
  }
  
  // Atualizar um experimento existente (para reprocessamento) - NOVO
  static async updateExperiment(
    id: number,
    updates: {
      outputs?: RunOutputs
      inputs?: Partial<RunInputs>
      tags?: Partial<RunTags>
    },
    reprocessingInfo?: { fromVersion: string; changesApplied?: string[] }
  ): Promise<void> {
    const existing = await db.experiments.get(id)
    if (!existing) {
      throw new Error(`Experiment ${id} not found`)
    }
    
    const now = new Date().toISOString()
    const updateDate: Partial<ExperimentRun> = {
      updatedAt: now,
      lastProcessedVersion: APP_VERSION
    }
    
    if (updates.outputs) {
      updateDate.outputs = { ...existing.outputs, ...updates.outputs }
    }
    
    if (updates.inputs) {
      updateDate.inputs = { ...existing.inputs, ...updates.inputs }
    }
    
    if (updates.tags) {
      updateDate.tags = { ...existing.tags, ...updates.tags }
    }
    
    // Adicionar ao histórico de reprocessamento
    if (reprocessingInfo) {
      const history = existing.reprocessingHistory || []
      history.push({
        date: now,
        fromVersion: reprocessingInfo.fromVersion,
        toVersion: APP_VERSION,
        changesApplied: reprocessingInfo.changesApplied
      })
      updateDate.reprocessingHistory = history
    }
    
    await db.experiments.update(id, updateDate)
  }
  
  // Buscar todos os experimentos ordenados por date (mais recentes primeiro)
  static async getAllExperiments(): Promise<ExperimentRun[]> {
    return await db.experiments.orderBy('createdAt').reverse().toArray()
  }
  
  // Buscar experimento por ID
  static async getExperimentById(id: number): Promise<ExperimentRun | undefined> {
    return await db.experiments.get(id)
  }
  
  // Filter experimentos por período
  static async getExperimentsByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<ExperimentRun[]> {
    return await db.experiments
      .where('createdAt')
      .between(startDate, endDate, true, true)
      .reverse()
      .toArray()
  }
  
  // Filter por tags
  static async getExperimentsByTag(
    tagName: 'sampleName' | 'brand' | 'lot',
    tagValue: string
  ): Promise<ExperimentRun[]> {
    const fieldName = `tags.${tagName}`
    return await db.experiments
      .where(fieldName)
      .equals(tagValue)
      .reverse()
      .toArray()
  }
  
  // Buscar experimentos que precisam de reprocessamento (versão antiga) - NOVO
  static async getExperimentsNeedingReprocessing(): Promise<ExperimentRun[]> {
    const all = await this.getAllExperiments()
    return all.filter(exp => exp.lastProcessedVersion !== APP_VERSION)
  }
  
  // Busca combinada com filtros
  static async searchExperiments(filters: {
    sampleName?: string
    brand?: string
    lot?: string
    beverageTypes?: string[]
    startDate?: string
    endDate?: string
  }): Promise<ExperimentRun[]> {
    let collection = db.experiments.orderBy('createdAt').reverse()
    
    if (filters.startDate || filters.endDate) {
      const start = filters.startDate || '1970-01-01'
      const end = filters.endDate || new Date().toISOString()
      collection = db.experiments.where('createdAt').between(start, end, true, true).reverse()
    }
    
    const results = await collection.toArray()
    
    // Filtros adicionais em memória
    return results.filter(exp => {
      // Filtro por nome da amostra (busca parcial, case-insensitive)
      if (filters.sampleName) {
        const searchTerm = filters.sampleName.toLowerCase()
        const sampleName = exp.tags.sampleName?.toLowerCase() || ''
        if (!sampleName.includes(searchTerm)) return false
      }
      
      // Filtro por marca (busca parcial, case-insensitive)
      if (filters.brand) {
        const searchTerm = filters.brand.toLowerCase()
        const brand = exp.tags.brand?.toLowerCase() || ''
        if (!brand.includes(searchTerm)) return false
      }
      
      // Filtro por lote (busca parcial)
      if (filters.lot && !exp.tags.lot?.includes(filters.lot)) return false
      
      // Filtro por tipos de bebida (múltipla seleção)
      if (filters.beverageTypes && filters.beverageTypes.length > 0) {
        if (!filters.beverageTypes.includes(exp.inputs.beverageType)) return false
      }
      
      return true
    })
  }
  
  // Export todos os dados para JSON
  static async exportToJSON(): Promise<string> {
    const experiments = await this.getAllExperiments()
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      appVersion: APP_VERSION,
      calibrationVersion: CALIBRATION_VERSION,
      schemaVersion: SCHEMA_VERSION,
      totalExperiments: experiments.length,
      experiments
    }, null, 2)
  }
  
  // Import dados de JSON
  static async importFromJSON(jsonDate: string): Promise<{
    imported: number
    skipped: number
    errors: string[]
  }> {
    try {
      const date = JSON.parse(jsonDate)
      const experiments = date.experiments || []
      
      let imported = 0
      let skipped = 0
      const errors: string[] = []
      
      for (const exp of experiments) {
        try {
          // Verificar se já existe (por createdAt e dados similares)
          const existing = await db.experiments
            .where('createdAt')
            .equals(exp.createdAt)
            .first()
          
          if (existing) {
            skipped++
            continue
          }
          
          // Remover o ID para forçar criação de new
          const newExp = { ...exp }
          delete newExp.id
          
          // Garantir campos news
          if (!newExp.updatedAt) newExp.updatedAt = newExp.createdAt
          if (!newExp.lastProcessedVersion) newExp.lastProcessedVersion = newExp.appVersion
          
          await db.experiments.add(newExp)
          imported++
        } catch (err) {
          errors.push(`Error importing experiment ${exp.id}: ${err}`)
        }
      }
      
      return { imported, skipped, errors }
    } catch (err) {
      throw new Error(`Erro ao processar JSON: ${err}`)
    }
  }
  
  // Deletar experimento
  static async deleteExperiment(id: number): Promise<void> {
    await db.experiments.delete(id)
  }
  
  // Contar total de experimentos
  static async getTotalExperiments(): Promise<number> {
    return await db.experiments.count()
  }
  
  // Verificar se há dados no banco
  static async hasExperiments(): Promise<boolean> {
    const count = await this.getTotalExperiments()
    return count > 0
  }
}
