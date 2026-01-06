"use client"
import React, { useState } from "react"
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

export default function StepDensity({ onNext, onBack, initialData }: { onNext: (data: DensityData) => void; onBack: () => void; initialData?: DensityData }) {
  const [showMethodology, setShowMethodology] = useState(false)
  
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
  
  // Função de submissão que calcula massas líquidas
  const onSubmit = (data: DensityData) => {
    // Se método é Balança e há massa do conjunto, calcular massas líquidas
    if (data.method === "Balança" && data.containerMass && data.containerMass > 0) {
      const adjustedData = {
        ...data,
        waterMass: data.waterMass ? data.waterMass - data.containerMass : undefined,
        sampleMass: data.sampleMass ? data.sampleMass - data.containerMass : undefined,
      }
      onNext(adjustedData)
    } else {
      onNext(data)
    }
  }

  // Hook de swipe
  useSwipe({
    onSwipeLeft: handleSubmit(onSubmit),
    onSwipeRight: onBack
  }, true)

  return (
    <>
      <form className="space-y-4 p-4" onSubmit={handleSubmit(onNext)}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002060]">Meça massa ou{" "}
            <InlineTooltip 
              term="densidade" 
              tooltip="Relação entre massa e volume do líquido."
            />
          </h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>

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
                da densidade.
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
          onNext={handleSubmit(onSubmit)}
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
