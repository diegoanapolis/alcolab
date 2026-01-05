"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { waterTempSchema, WaterTempData } from "@/lib/schemas"
import * as Slider from "@radix-ui/react-slider"
import { ChevronLeft, ChevronRight } from "lucide-react"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import InfoTooltip, { InlineTooltip } from "@/components/ui/InfoTooltip"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyTemperatura } from "@/lib/methodologyContent"

export default function StepWaterTemp({ onNext, onBack, initialData }: { onNext: (data: WaterTempData) => void; onBack: () => void; initialData?: WaterTempData }) {
  const [thermometerMode, setThermometerMode] = useState<"with" | "without">("with")
  const [sameTemperature, setSameTemperature] = useState<boolean | null>(null)
  const [showMethodology, setShowMethodology] = useState(false)

  const lastWaterTemp = useMemo<WaterTempData | undefined>(() => {
    if (initialData) return undefined
    try {
      const raw = localStorage.getItem("lastWaterTemp")
      if (!raw) return undefined
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && ('waterType' in parsed) && ('temperature' in parsed)) {
        return parsed as WaterTempData
      }
    } catch {}
    return undefined
  }, [initialData])

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<WaterTempData>({
    resolver: zodResolver(waterTempSchema),
    defaultValues: initialData ?? lastWaterTemp ?? { 
      waterTemperature: 25, 
      sampleTemperature: 25, 
      waterType: "Mineral sem gás (recomendável)" 
    },
  })

  const waterT = watch("waterTemperature")
  const sampleT = watch("sampleTemperature")
  const selectedType = watch("waterType")

  useEffect(() => {
    if (selectedType !== "Mineral sem gás (recomendável)") {
      setValue("conductivity", undefined, { shouldValidate: false })
    }
    if (selectedType === "Mineral sem gás (recomendável)") {
      setValue("estimatedConductivity", 114, { shouldValidate: false })
    } else if (selectedType === "Potável/torneira") {
      setValue("estimatedConductivity", 150, { shouldValidate: false })
    } else {
      setValue("estimatedConductivity", 0, { shouldValidate: false })
    }
  }, [selectedType, setValue])

  // Validação de se pode prosseguir
  const canProceed = () => {
    if (thermometerMode === "with") return true
    if (thermometerMode === "without" && sameTemperature === true) return true
    return false
  }

  const handleFormSubmit = (data: WaterTempData) => {
    if (thermometerMode === "without" && sameTemperature === true) {
      // Sem termômetro: usa temperatura padrão de 25°C (equilíbrio térmico assumido)
      onNext({
        ...data,
        waterTemperature: 25,
        sampleTemperature: 25
      })
    } else {
      onNext(data)
    }
  }
  
  // Hook de swipe
  useSwipe({
    onSwipeLeft: canProceed() ? handleSubmit(handleFormSubmit) : undefined,
    onSwipeRight: onBack
  }, canProceed())

  return (
    <>
      <form className="space-y-4 p-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002060]">Meça a temperatura — água e amostra</h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>

        {/* Tipo de água */}
        <div>
          <label className="block text-sm font-medium text-[#002060] mb-2">Tipo de água</label>
          <div className="grid grid-cols-1 gap-2">
            {["Mineral sem gás (recomendável)", "Potável/torneira", "Deionizada/Destilada (quando disponível)"].map((w) => (
              <label key={w} className="border rounded-lg p-3 text-sm cursor-pointer hover:border-[#002060] transition-colors">
                <input type="radio" value={w} {...register("waterType")} className="mr-2" />
                {w}
              </label>
            ))}
          </div>
          {errors.waterType && <p className="text-red-600 text-xs mt-1">{errors.waterType.message}</p>}
        </div>

        {/* Abas para termômetro */}
        <div className="flex items-center gap-2 border-b">
          <button 
            type="button" 
            onClick={() => {
              setThermometerMode("with")
              setSameTemperature(null)
            }}
            className={`py-2 px-4 font-medium text-sm ${
              thermometerMode === "with" 
                ? "border-b-2 border-[#002060] text-[#002060]" 
                : "text-gray-600"
            }`}
          >
            Possuo termômetro
          </button>
          <button 
            type="button" 
            onClick={() => {
              setThermometerMode("without")
              setSameTemperature(null)
            }}
            className={`py-2 px-4 font-medium text-sm ${
              thermometerMode === "without" 
                ? "border-b-2 border-[#002060] text-[#002060]" 
                : "text-gray-600"
            }`}
          >
            Não possuo termômetro
          </button>
        </div>

        {thermometerMode === "with" ? (
          <>
            {/* Camada 1: Instruções com termômetro */}
            <p className="text-sm text-neutral-700 text-justify">
              Com termômetro, meça a temperatura imediatamente antes ou após o escoamento. 
              Diferenças de até 3 °C entre água e amostra são aceitáveis; o aplicativo realiza{" "}
              <InlineTooltip 
                term="correção de viscosidade" 
                tooltip="Ajuste da viscosidade da água conforme a temperatura."
              />.
            </p>

            <div className="space-y-2">
              <div className="font-medium text-center text-[#002060]">Temperatura (°C)</div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-center text-[#002060]">Água</label>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button type="button" aria-label="Diminuir temperatura" className="border rounded-full p-2 hover:bg-gray-100" onClick={() => setValue("waterTemperature", Math.max(20, (waterT ?? 20) - 1))}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-center font-semibold text-[2rem] w-24">{waterT}°C</span>
                  <button type="button" aria-label="Aumentar temperatura" className="border rounded-full p-2 hover:bg-gray-100" onClick={() => setValue("waterTemperature", Math.min(30, (waterT ?? 20) + 1))}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <Slider.Root value={[waterT ?? 20]} min={20} max={30} step={1} onValueChange={(v) => setValue("waterTemperature", v[0])} className="mt-3 relative flex items-center select-none touch-none h-5">
                  <Slider.Track className="bg-neutral-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-[#002060] h-1 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-[#002060] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002060]" aria-label="Temperatura" />
                </Slider.Root>
                {errors.waterTemperature && <p className="text-red-600 text-xs mt-1">{String(errors.waterTemperature.message)}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-center text-[#002060]">Amostra</label>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button type="button" aria-label="Diminuir temperatura" className="border rounded-full p-2 hover:bg-gray-100" onClick={() => setValue("sampleTemperature", Math.max(20, (sampleT ?? 20) - 1))}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-center font-semibold text-[2rem] w-24">{sampleT}°C</span>
                  <button type="button" aria-label="Aumentar temperatura" className="border rounded-full p-2 hover:bg-gray-100" onClick={() => setValue("sampleTemperature", Math.min(30, (sampleT ?? 20) + 1))}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <Slider.Root value={[sampleT ?? 20]} min={20} max={30} step={1} onValueChange={(v) => setValue("sampleTemperature", v[0])} className="mt-3 relative flex items-center select-none touch-none h-5">
                  <Slider.Track className="bg-neutral-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-[#002060] h-1 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-[#002060] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002060]" aria-label="Temperatura" />
                </Slider.Root>
              </div>
            </div>
            {errors.sampleTemperature && typeof errors.sampleTemperature.message === 'string' && (
              <p className="text-red-600 text-xs mt-2">{errors.sampleTemperature.message}</p>
            )}
          </>
        ) : (
          <>
            {/* Camada 1: Sem termômetro */}
            <p className="text-sm text-neutral-700 text-justify">
              Água, amostra e ambiente devem estar em{" "}
              <InlineTooltip 
                term="equilíbrio térmico" 
                tooltip="Água, amostra e ambiente na mesma temperatura."
              />. 
              Deixe os líquidos por pelo menos 1 hora no ambiente do ensaio e assegure que ele esteja entre 20 e 30°C.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#002060] mb-3">
                  Dois líquidos com temperaturas iguais (entre 20 e 28ºC)?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:border-[#002060] transition-colors">
                    <input 
                      type="radio" 
                      name="sameTemp" 
                      value="yes"
                      onChange={() => setSameTemperature(true)}
                      checked={sameTemperature === true}
                      className="text-[#002060]" 
                    />
                    <span className="text-sm">Sim</span>
                  </label>
                  <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:border-[#002060] transition-colors">
                    <input 
                      type="radio" 
                      name="sameTemp" 
                      value="no"
                      onChange={() => setSameTemperature(false)}
                      checked={sameTemperature === false}
                      className="text-[#002060]" 
                    />
                    <span className="text-sm">Não</span>
                  </label>
                </div>
              </div>

              {sameTemperature === false && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Aguarde a estabilização!</span><br />
                    É recomendado aguardar pelo menos 1 hora com os recipientes em contato, 
                    em um ambiente que sabidamente está entre 20 e 28ºC.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <NavigationButtons
          onBack={onBack}
          onNext={handleSubmit(handleFormSubmit)}
          nextDisabled={!canProceed()}
        />
      </form>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="Metodologia: Temperatura"
      >
        <MethodologyTemperatura />
      </MethodologyModal>
    </>
  )
}
