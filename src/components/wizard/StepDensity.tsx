"use client"
import React, { useState, useEffect, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { densitySchema, DensityData } from "@/lib/schemas"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import InfoTooltip, { InlineTooltip } from "@/components/ui/InfoTooltip"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyMassaDensidade } from "@/lib/methodologyContent"

const parseFlexibleDecimal = (input: string): number => {
  if (typeof input !== "string") input = String(input ?? "")
  const s = input.trim()
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

// Verifica se valor é "inteiro" (sem casa decimal significativa)
const isEffectivelyInteger = (val: number | undefined): boolean => {
  if (val === undefined || isNaN(val)) return false
  // Considera inteiro se não tem parte decimal ou se a parte decimal é .0
  const decimalPart = val % 1
  return Math.abs(decimalPart) < 0.001
}

// Conta quantas massas são efetivamente inteiros
const countIntegerMasses = (containerMass: number | undefined, waterMass: number | undefined, sampleMass: number | undefined): number => {
  let count = 0
  if (isEffectivelyInteger(containerMass)) count++
  if (isEffectivelyInteger(waterMass)) count++
  if (isEffectivelyInteger(sampleMass)) count++
  return count
}

interface LowPrecisionCheckResult {
  status: 'ok' | 'warning' | 'error'
  message: string
  teor_inicial_pct?: number
  teor_min_pct?: number
  teor_max_pct?: number
  useLabelAsInitial?: boolean // Flag para indicar que deve usar teor de rótulo como inicial
}

interface StepDensityProps {
  onNext: (data: DensityData) => void
  onBack: () => void
  initialData?: DensityData
  demoMode?: string | null
  wizardData?: {
    profile?: {
      beverageType?: string
      labelAbv?: number
      labelUnit?: string
      ethanolMassPercent?: number
      methanolMassPercent?: number
    }
  }
}

import DemoBanner from "@/components/ui/DemoBanner"
import { getDemoScenario } from "@/lib/demoScenarios"

export default function StepDensity({ onNext, onBack, initialData, wizardData, demoMode }: StepDensityProps) {
  const [showMethodology, setShowMethodology] = useState(false)
  const [balancaTemDecimal, setBalancaTemDecimal] = useState<boolean | null>(null)
  const [checkingPrecision, setCheckingPrecision] = useState(false)
  const [precisionCheckResult, setPrecisionCheckResult] = useState<LowPrecisionCheckResult | null>(null)
  
  // Ref para rastrear valores anteriores das massas
  const prevMassesRef = useRef<{container: number, water: number, sample: number} | null>(null)
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<DensityData>({
    resolver: zodResolver(densitySchema),
    defaultValues: (initialData ?? { method: "Balança" }) as DensityData,
  })
  
  const method = watch("method") ?? "Balança"
  const measuredUnit = watch("measuredUnit")
  const containerMass = watch("containerMass") ?? 0
  const rawWaterMass = watch("waterMass") ?? 0
  const rawSampleMass = watch("sampleMass") ?? 0
  
  // Calcular massas líquidas
  const liquidWaterMass = rawWaterMass - containerMass
  const liquidSampleMass = rawSampleMass - containerMass
  
  // Verificar se deve mostrar pergunta sobre casa decimal
  const shouldAskDecimalQuestion = useMemo(() => {
    if (method !== "Balança") return false
    if (!rawWaterMass || !rawSampleMass) return false
    
    // Contar massas que são inteiros
    const intCount = countIntegerMasses(containerMass, rawWaterMass, rawSampleMass)
    
    // Se pelo menos 2 das 3 massas são inteiros, perguntar
    return intCount >= 2
  }, [method, containerMass, rawWaterMass, rawSampleMass])
  
  // Detectar mudanças nas massas e resetar o estado da pergunta
  useEffect(() => {
    const currentMasses = {
      container: containerMass,
      water: rawWaterMass,
      sample: rawSampleMass
    }
    
    // Se as massas mudaram desde a última verificação
    if (prevMassesRef.current !== null) {
      const prev = prevMassesRef.current
      const changed = prev.container !== currentMasses.container ||
                     prev.water !== currentMasses.water ||
                     prev.sample !== currentMasses.sample
      
      if (changed) {
        // Resetar estado da pergunta e resultado
        setBalancaTemDecimal(null)
        setPrecisionCheckResult(null)
        setCheckingPrecision(false)
      }
    }
    
    // Atualizar ref
    prevMassesRef.current = currentMasses
  }, [containerMass, rawWaterMass, rawSampleMass])
  
  // Reset do estado quando não precisa mais perguntar (método mudou, etc)
  useEffect(() => {
    if (!shouldAskDecimalQuestion) {
      setBalancaTemDecimal(null)
      setPrecisionCheckResult(null)
      setCheckingPrecision(false)
    }
  }, [shouldAskDecimalQuestion])
  
  // Função para calcular intervalo de erro e verificar compatibilidade
  const checkLowPrecisionBalance = async () => {
    setCheckingPrecision(true)
    setPrecisionCheckResult(null)
    
    // Simular delay para UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      // Calcular massas líquidas
      const m_w = rawWaterMass - containerMass // massa líquida da água
      const m_s = rawSampleMass - containerMass // massa líquida da amostra
      
      if (m_w <= 0 || m_s <= 0) {
        setPrecisionCheckResult({
          status: 'error',
          message: 'Massas líquidas devem ser positivas. Verifique os valores informados.'
        })
        setCheckingPrecision(false)
        return
      }
      
      // Calcular densidade relativa central
      const rho_central = m_s / m_w
      
      // Calcular intervalo de erro (pior caso com ±0.5g)
      const rho_min = (m_s - 0.5) / (m_w + 0.5)
      const rho_max = (m_s + 0.5) / (m_w - 0.5)
      
      // Carregar tabela de conversão
      const convResponse = await fetch("/data/conversao_vv_para_wE_20C.json")
      if (!convResponse.ok) throw new Error("Falha ao carregar tabela de conversão")
      const convTable = await convResponse.json()
      
      const rhoArray = convTable.rho_mix_g_per_mL_20C as number[]
      const wEArray = convTable.wE_percent as number[]
      
      // Função para interpolar teor a partir de densidade relativa
      const densityToAlcoholContent = (rho: number): number | null => {
        // A tabela está ordenada de forma que densidade diminui conforme teor aumenta
        // Então precisamos encontrar o intervalo correto
        
        // Limitar ao range da tabela
        if (rho >= rhoArray[0]) return 0 // densidade >= 1.0 → teor = 0
        if (rho <= rhoArray[rhoArray.length - 1]) return 100 // densidade muito baixa → teor = 100
        
        // Encontrar índices para interpolação
        for (let i = 0; i < rhoArray.length - 1; i++) {
          if (rho <= rhoArray[i] && rho >= rhoArray[i + 1]) {
            // Interpolação linear
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
      
      // Calcular teores
      const teor_central = densityToAlcoholContent(rho_central)
      const teor_min = densityToAlcoholContent(rho_max) // rho_max → teor_min (relação inversa)
      const teor_max = densityToAlcoholContent(rho_min) // rho_min → teor_max
      
      if (teor_central === null || teor_min === null || teor_max === null) {
        setPrecisionCheckResult({
          status: 'error',
          message: 'Não foi possível calcular o teor alcoólico. Valores fora do range esperado.'
        })
        setCheckingPrecision(false)
        return
      }
      
      // Obter teor de rótulo do perfil
      let labelTeorMM: number | null = null
      
      if (wizardData?.profile) {
        const profile = wizardData.profile
        
        if (profile.beverageType === "Outra hidroalcoólica") {
          // Para mistura ternária, usar média ponderada
          const etMM = profile.ethanolMassPercent ?? 0
          const metMM = profile.methanolMassPercent ?? 0
          labelTeorMM = etMM + metMM // soma dos teores alcoólicos em % m/m
        } else if (profile.labelAbv !== undefined && profile.labelAbv !== null) {
          // Converter teor de rótulo para % m/m se necessário
          if (profile.labelUnit === "INPM ou % m/m") {
            labelTeorMM = profile.labelAbv
          } else {
            // % v/v ou °GL - converter para % m/m usando tabela
            const glArray = convTable.gl as number[]
            const glIndex = glArray.findIndex(v => v >= profile.labelAbv!)
            if (glIndex >= 0 && glIndex < wEArray.length) {
              // Interpolação
              if (glIndex === 0 || glArray[glIndex] === profile.labelAbv) {
                labelTeorMM = wEArray[glIndex]
              } else {
                const g0 = glArray[glIndex - 1]
                const g1 = glArray[glIndex]
                const w0 = wEArray[glIndex - 1]
                const w1 = wEArray[glIndex]
                const t = (profile.labelAbv! - g0) / (g1 - g0)
                labelTeorMM = w0 + t * (w1 - w0)
              }
            }
          }
        }
      }
      
      // Verificar se teor de rótulo está no intervalo
      if (labelTeorMM !== null) {
        const rotuloNoIntervalo = labelTeorMM >= teor_min && labelTeorMM <= teor_max
        
        if (rotuloNoIntervalo) {
          setPrecisionCheckResult({
            status: 'warning',
            message: `As massas informadas sugerem inicialmente um **teor alcoólico de cerca de ${teor_central.toFixed(1)}%** (% m/m).

Considerando a incerteza típica de balanças desse tipo (± 0,5 g), o teor alcoólico da amostra pode estar entre ${teor_min.toFixed(1)}% e ${teor_max.toFixed(1)}% (% m/m).

Como o teor de rótulo está dentro desse intervalo, ainda que muito largo, a análise pode prosseguir, **porém com menor seletividade**. Nesse caso, considera-se um intervalo contido no anterior e mais estreito em torno do teor do rótulo.

Para maior confiabilidade, recomenda-se repetir esta etapa com uma **balança com pelo menos uma casa decimal** ou **com um densímetro**.`,
            teor_inicial_pct: teor_central,
            teor_min_pct: teor_min,
            teor_max_pct: teor_max,
            useLabelAsInitial: true // Indica que deve usar teor de rótulo como inicial
          })
        } else {
          setPrecisionCheckResult({
            status: 'error',
            message: `**Inconsistência entre densidade e teor de rótulo** que, em conjunto com a baixa sensibilidade da balança, **impede a análise de avançar**.

Considerando as massas informadas e variações máximas em cada pesagem (± 0,5 g), obtivemos teor alcoólico inicial de ${teor_central.toFixed(1)}% e um intervalo possível entre ${teor_min.toFixed(1)}% e ${teor_max.toFixed(1)}% (% m/m).

Como o teor de rótulo não se encontra dentro desse intervalo e a sensibilidade das pesagens é insuficiente para restringir a faixa estimada, recomenda-se **repetir as pesagens com uma balança com pelo menos uma casa decimal** ou **utilizar um densímetro**.`,
            teor_inicial_pct: teor_central,
            teor_min_pct: teor_min,
            teor_max_pct: teor_max
          })
        }
      } else {
        // Sem teor de rótulo para comparar
        setPrecisionCheckResult({
          status: 'warning',
          message: `As massas informadas indicam um teor alcoólico inicial de cerca de ${teor_central.toFixed(1)}% (% m/m).

Considerando a incerteza típica de balanças sem casa decimal (± 0,5 g), o teor alcoólico pode estar entre ${teor_min.toFixed(1)}% e ${teor_max.toFixed(1)}%.

Para maior confiabilidade, recomenda-se usar uma balança com pelo menos uma casa decimal.`,
          teor_inicial_pct: teor_central,
          teor_min_pct: teor_min,
          teor_max_pct: teor_max
        })
      }
      
    } catch (error) {
      console.error("Erro ao verificar precisão:", error)
      setPrecisionCheckResult({
        status: 'error',
        message: 'Erro ao verificar compatibilidade. Tente novamente.'
      })
    }
    
    setCheckingPrecision(false)
  }
  
  // Executar verificação quando usuário responde "Não" à pergunta
  useEffect(() => {
    if (balancaTemDecimal === false && shouldAskDecimalQuestion) {
      checkLowPrecisionBalance()
    }
  }, [balancaTemDecimal, shouldAskDecimalQuestion])
  
  // Verificar se pode avançar
  const canProceed = useMemo(() => {
    // Se não precisa perguntar sobre decimal, pode avançar normalmente
    if (!shouldAskDecimalQuestion) return true
    
    // Se ainda não respondeu a pergunta, não pode avançar
    if (balancaTemDecimal === null) return false
    
    // Se respondeu "Sim", pode avançar
    if (balancaTemDecimal === true) return true
    
    // Se respondeu "Não", verificar resultado da checagem
    if (balancaTemDecimal === false) {
      // Se ainda está verificando, não pode avançar
      if (checkingPrecision) return false
      
      // Se teve erro de incompatibilidade, não pode avançar
      if (precisionCheckResult?.status === 'error') return false
      
      // Se passou (warning ou ok), pode avançar
      return precisionCheckResult?.status === 'warning' || precisionCheckResult?.status === 'ok'
    }
    
    return false
  }, [shouldAskDecimalQuestion, balancaTemDecimal, checkingPrecision, precisionCheckResult])
  
  // Função para renderizar mensagem com negrito
  const renderMessageWithBold = (message: string) => {
    // Substitui **texto** por <strong>texto</strong>
    const parts = message.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }
  
  // Função de submissão que calcula massas líquidas
  const onSubmit = (data: DensityData) => {
    // Verificar se pode prosseguir
    if (!canProceed) return
    
    // Preparar dados extras para incluir no resultado
    const extraData = {
      balancaTemDecimal: balancaTemDecimal,
      lowPrecisionCheckResult: precisionCheckResult,
      // Guardar massas brutas para referência
      waterMassRaw: data.waterMass,
      sampleMassRaw: data.sampleMass,
    }
    
    // Se foi permitido avançar com warning (useLabelAsInitial), 
    // mudar para usar teor de rótulo como inicial (equivalente a % v/v - rótulo)
    if (precisionCheckResult?.useLabelAsInitial && balancaTemDecimal === false) {
      // Converter para usar teor de rótulo em vez da densidade medida
      // Isso é feito passando o measuredValue como teor de rótulo e measuredUnit como "% v/v - rótulo"
      const labelAbv = wizardData?.profile?.labelAbv
      const labelUnit = wizardData?.profile?.labelUnit
      
      if (labelAbv !== undefined && labelAbv !== null) {
        // Determinar a unidade correta para passar ao fluxo
        let measuredUnitToUse: string
        if (labelUnit === "INPM ou % m/m") {
          measuredUnitToUse = "% m/m ou INPM"
        } else {
          measuredUnitToUse = "% v/v - rótulo"
        }
        
        const adjustedData = {
          ...data,
          ...extraData,
          method: "Densímetro ou alcôometro", // Muda o método para usar o fluxo de teor direto
          measuredValue: labelAbv,
          measuredUnit: measuredUnitToUse as any,
          // Manter as massas líquidas para referência no relatório
          waterMass: data.waterMass ? data.waterMass - (data.containerMass ?? 0) : undefined,
          sampleMass: data.sampleMass ? data.sampleMass - (data.containerMass ?? 0) : undefined,
        } as DensityData
        onNext(adjustedData)
        return
      }
    }
    
    // Fluxo normal: Se método é Balança e há massa do conjunto, calcular massas líquidas
    if (data.method === "Balança" && data.containerMass && data.containerMass > 0) {
      const adjustedData = {
        ...data,
        ...extraData,
        waterMass: data.waterMass ? data.waterMass - data.containerMass : undefined,
        sampleMass: data.sampleMass ? data.sampleMass - data.containerMass : undefined,
      } as DensityData
      onNext(adjustedData)
    } else {
      onNext({ ...data, ...extraData } as DensityData)
    }
  }

  // Hook de swipe
  useSwipe({
    onSwipeLeft: canProceed ? handleSubmit(onSubmit) : undefined,
    onSwipeRight: onBack
  }, true)

  return (
    <>
      <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002060]">Meça massa ou{" "}
            <InlineTooltip 
              term="densidade" 
              tooltip="Relação entre massa e volume do líquido."
            />
          </h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>

        {/* Banner demo */}
        {demoMode && (() => {
          const s = getDemoScenario(demoMode)
          return s ? <DemoBanner text={s.banners.density} /> : null
        })()}

        {/* Camada 1: Instruções concisas */}
        <p className="text-sm text-neutral-700 text-justify">
          Se for estimar a{" "}
          <InlineTooltip 
            term="densidade" 
            tooltip="Relação entre massa e volume do líquido."
          />{" "}
          por massa, selecione <span className="font-medium">Balança</span>. Caso contrário, a aba{" "}
          <span className="font-medium">Densímetro, alcoômetro ou rótulo</span>.
        </p>

        {/* Abas estilo moderno */}
        <div className="flex items-center gap-2 border-b">
          <button 
            type="button" 
            onClick={() => setValue("method", "Balança", { shouldValidate: true })} 
            className={`py-2 px-4 font-medium text-sm ${
              method === "Balança" 
                ? "border-b-2 border-[#002060] text-[#002060]" 
                : "text-gray-600"
            }`}
          >
            Balança
          </button>
          <button 
            type="button" 
            onClick={() => setValue("method", "Densímetro ou alcôometro", { shouldValidate: true })} 
            className={`py-2 px-4 font-medium text-sm ${
              method === "Densímetro ou alcôometro" 
                ? "border-b-2 border-[#002060] text-[#002060]" 
                : "text-gray-600"
            }`}
          >
            Densímetro, alcôometro ou rótulo
          </button>
        </div>

        {method === "Balança" && (
          <div className="space-y-4">
            {/* Camada 1: Instruções da aba Balança */}
            <div className="text-sm text-neutral-700 text-justify space-y-2">
              <p>
                Para as pesagens, aspire 20 mL de água e, separadamente, 20 mL da amostra, 
                utilizando a mesma seringa e posicionando o êmbolo na mesma marcação em ambos os casos.
              </p>
              <p>
                Uma pesagem para cada é suficiente para{" "}
                <InlineTooltip 
                  term="estimativa inicial" 
                  tooltip="Utilizada apenas para localizarmos a faixa aproximada de teor alcoólico da amostra."
                />{" "}
                da densidade. Recomenda-se uso de balança com pelo menos 1 casa decimal.
              </p>
              <p>
                Recomenda-se medir também a massa do conjunto seringa com êmbolo e agulha.
              </p>
            </div>
            
            {/* Campo massa do conjunto */}
            <div>
              <div className="font-medium text-sm text-[#002060] mb-2">Massa do conjunto (seringa, êmbolo, agulha) (g)</div>
              <input
                type="text"
                inputMode="decimal"
                placeholder="10.2"
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent"
                {...register("containerMass", { setValueAs: (v) => {
                  const s = String(v ?? "").trim()
                  const num = parseFlexibleDecimal(s)
                  return isNaN(num) ? 0 : num
                } })}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Aplicar 0.0 se for inserir massa líquida nos campos abaixo
              </p>
            </div>
          
            {/* Campos de massa */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-sm text-[#002060] mb-2">Massa água (g)</div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="30.1"
                  className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent"
                  {...register("waterMass", { setValueAs: (v) => {
                    const s = String(v ?? "").trim()
                    const num = parseFlexibleDecimal(s)
                    return isNaN(num) ? undefined : num
                  } })}
                />
                {errors.waterMass && <p className="text-red-600 text-xs mt-1">{String(errors.waterMass.message)}</p>}
              </div>
              <div>
                <div className="font-medium text-sm text-[#002060] mb-2">Massa amostra (g)</div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="27.5"
                  className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent"
                  {...register("sampleMass", { setValueAs: (v) => {
                    const s = String(v ?? "").trim()
                    const num = parseFlexibleDecimal(s)
                    return isNaN(num) ? undefined : num
                  } })}
                />
                {errors.sampleMass && <p className="text-red-600 text-xs mt-1">{String(errors.sampleMass.message)}</p>}
              </div>
            </div>
            
            {/* Mostrar massas líquidas calculadas se houver massa do conjunto */}
            {containerMass > 0 && (rawWaterMass > 0 || rawSampleMass > 0) && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-[#002060] mb-2">Massas líquidas calculadas:</div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    Água: {liquidWaterMass > 0 ? `${liquidWaterMass.toFixed(2)} g` : "-"}
                  </div>
                  <div>
                    Amostra: {liquidSampleMass > 0 ? `${liquidSampleMass.toFixed(2)} g` : "-"}
                  </div>
                </div>
              </div>
            )}
            
            {/* Pergunta sobre casa decimal da balança */}
            {shouldAskDecimalQuestion && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-amber-800">
                  Balança possui pelo menos uma casa decimal?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBalancaTemDecimal(true)
                      setPrecisionCheckResult(null)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      balancaTemDecimal === true
                        ? "bg-[#002060] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-[#002060]"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalancaTemDecimal(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      balancaTemDecimal === false
                        ? "bg-[#002060] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-[#002060]"
                    }`}
                  >
                    Não
                  </button>
                </div>
                
                {/* Indicador de carregamento */}
                {checkingPrecision && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <span>Aguarde enquanto checo uns valores</span>
                    <span className="inline-flex">
                      <span className="animate-[pulse_1s_ease-in-out_infinite]">.</span>
                      <span className="animate-[pulse_1s_ease-in-out_0.2s_infinite]">.</span>
                      <span className="animate-[pulse_1s_ease-in-out_0.4s_infinite]">.</span>
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Resultado da verificação - em quadro separado, abaixo da pergunta */}
            {precisionCheckResult && !checkingPrecision && (
              <div className={`p-3 rounded-lg whitespace-pre-line border ${
                precisionCheckResult.status === 'error' 
                  ? 'bg-red-100 text-red-800 border-red-300' 
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`} style={{ fontSize: '0.8125rem', textAlign: 'justify' }}>
                {renderMessageWithBold(precisionCheckResult.message)}
              </div>
            )}
          </div>
        )}

        {method === "Densímetro ou alcôometro" && (
          <div className="space-y-4">
            {/* Camada 1: Instruções da aba Densímetro */}
            <div className="text-sm text-neutral-700 text-justify space-y-2">
              <p>
                Utilize recipiente cilíndrico, permitindo que o instrumento flutue sem tocar as paredes e o fundo.
              </p>
              <p>
                Aguarde estabilização do instrumento antes da leitura.
              </p>
            </div>
            
            <div>
              <div className="font-medium text-sm text-[#002060] mb-2">
                Densidade ou teor alcoólico
              </div>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 0.95"
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent"
                {...register("measuredValue", { setValueAs: (v) => {
                  const s = String(v ?? "").trim()
                  const num = parseFlexibleDecimal(s)
                  return isNaN(num) ? undefined : num
                } })}
              />
              {errors.measuredValue && <p className="text-red-600 text-xs mt-1">{String(errors.measuredValue.message)}</p>}
            </div>
            
            <div>
              <div className="font-medium text-sm text-[#002060] mb-2">
                Unidade
              </div>
              <select 
                {...register("measuredUnit", { setValueAs: (v) => {
                  const s = String(v ?? "").trim()
                  return s === "" ? undefined : s
                } })} 
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="g/mL ou g/cm³">g/mL ou g/cm³</option>
                <option value="% v/v ou °GL">% v/v ou °GL</option>
                <option value="% m/m ou INPM">% m/m ou INPM</option>
                <option value="% v/v - rótulo">% v/v - rótulo</option>
              </select>
              {errors.measuredUnit && <p className="text-red-600 text-xs mt-1">{String(errors.measuredUnit.message)}</p>}
            </div>
            
            {measuredUnit === "% v/v - rótulo" && (
              <p className="text-xs text-red-600 text-justify bg-red-50 p-3 rounded-lg">
                <span className="font-bold">⚠️ Atenção:</span> O uso do teor de rótulo reduz a seletividade da análise. 
                Passa a funcionar como checagem de compatibilidade entre o teor declarado e o escoamento experimental 
                (viscosidade). Em muitos casos, não exclui a possibilidade de outras composições hidroalcoólicas.
              </p>
            )}
          </div>
        )}

        <NavigationButtons
          onBack={onBack}
          onNext={canProceed ? handleSubmit(onSubmit) : undefined}
          nextDisabled={!canProceed}
        />
      </form>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="Metodologia: Massa ou Densidade"
      >
        <MethodologyMassaDensidade />
      </MethodologyModal>
    </>
  )
}
