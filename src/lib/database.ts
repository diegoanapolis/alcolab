import Dexie, { Table } from 'dexie'

// Versões do sistema
export const APP_VERSION = "1.0.0"
export const CALIBRATION_VERSION = "1.0.0" 
export const SCHEMA_VERSION = "1.0.0"

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
  waterMass?: number
  sampleMass?: number
  measuredValue?: number
  measuredUnit?: string
  
  // Tempos de escoamento
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

// Interface para os resultados/outputs
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
  
  // Versões do sistema
  appVersion: string
  calibrationVersion: string
  schemaVersion: string
  
  // Dados principais
  inputs: RunInputs
  outputs: RunOutputs
  tags: RunTags
  
  // Metadados adicionais
  processingTime?: number
  deviceInfo?: string
}

// Classe do banco de dados
class ExperimentDatabase extends Dexie {
  experiments!: Table<ExperimentRun>
  
  constructor() {
    super('experimentos_alcolab_db')
    
    this.version(1).stores({
      experiments: '++id, createdAt, tags.sampleName, tags.brand, tags.lot, tags.year, tags.month, appVersion, calibrationVersion, schemaVersion'
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
  // Salvar um novo experimento
  static async saveExperiment(
    inputs: RunInputs,
    outputs: RunOutputs,
    tags: RunTags
  ): Promise<number> {
    const experiment: ExperimentRun = {
      createdAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      calibrationVersion: CALIBRATION_VERSION,
      schemaVersion: SCHEMA_VERSION,
      inputs,
      outputs,
      tags: {
        ...tags,
        fullDate: new Date().toISOString(),
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      },
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }
    
    return await db.experiments.add(experiment) as number
  }
  
  // Buscar todos os experimentos ordenados por data (mais recentes primeiro)
  static async getAllExperiments(): Promise<ExperimentRun[]> {
    return await db.experiments.orderBy('createdAt').reverse().toArray()
  }
  
  // Buscar experimento por ID
  static async getExperimentById(id: number): Promise<ExperimentRun | undefined> {
    return await db.experiments.get(id)
  }
  
  // Filtrar experimentos por período
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
  
  // Filtrar por tags
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
  
  // Exportar todos os dados para JSON
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
  
  // Importar dados de JSON
  static async importFromJSON(jsonData: string): Promise<{
    imported: number
    skipped: number
    errors: string[]
  }> {
    try {
      const data = JSON.parse(jsonData)
      const experiments = data.experiments || []
      
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
          
          // Remover o ID para forçar criação de novo
          const newExp = { ...exp }
          delete newExp.id
          
          await db.experiments.add(newExp)
          imported++
        } catch (err) {
          errors.push(`Erro ao importar experimento ${exp.id}: ${err}`)
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
