"use client"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, ProfileData } from "@/lib/schemas"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import InfoTooltip, { InlineTooltip } from "@/components/ui/InfoTooltip"
import { useT } from "@/lib/i18n"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyDadosAmostraI18n as MethodologyDadosAmostra } from "@/lib/methodologyContent.i18n"

interface StepSampleDataProps {
  onNext: (data: ProfileData) => void
  onBack: () => void
  initialData?: ProfileData
  demoMode?: string | null
}

import DemoBanner from "@/components/ui/DemoBanner"
import { getDemoScenario } from "@/lib/demoScenarios"

export default function StepSampleData({ onNext, onBack, initialData, demoMode }: StepSampleDataProps) {
  const t = useT()
  const [showMethodology, setShowMethodology] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileData>({ 
    resolver: zodResolver(profileSchema), 
    defaultValues: initialData || {}
  })
  
  const parseFlexibleDecimal = (input: string): number => { 
    if (typeof input !== "string") input = String(input ?? "")
    const s = input.trim()
    if (!s) return NaN
    const hasComma = s.includes(',')
    const hasDot = s.includes('.')
    let normalized = s
    if (hasComma && hasDot) normalized = s.replace(/\./g, '').replace(',', '.')
    else if (hasComma) normalized = s.replace(',', '.')
    const n = Number(normalized)
    return isNaN(n) ? NaN : n
  }
  
  const beverageType = watch("beverageType")
  const ethanolMm = watch("ethanolMassPercent")
  const methanolMm = watch("methanolMassPercent")
  const labelAbv = watch("labelAbv")
  
  const waterMm = ((): string => { 
    const e = typeof ethanolMm === 'number' && !isNaN(ethanolMm) ? ethanolMm : 0
    const m = typeof methanolMm === 'number' && !isNaN(methanolMm) ? methanolMm : 0
    const w = 100 - (e + m)
    return `${w.toFixed(1)}` 
  })()

  // Validar se campos obrigatórios estão preenchidos
  const isNextDisabled = () => {
    if (beverageType !== "Other hydroalcoholic") {
      return !labelAbv || labelAbv <= 0 || labelAbv > 100
    } else {
      return (ethanolMm == null || ethanolMm < 0 || ethanolMm > 100) || 
             (methanolMm == null || methanolMm < 0 || methanolMm > 100)
    }
  }
  
  // Hook de swipe
  useSwipe({
    onSwipeLeft: !isNextDisabled() ? handleSubmit(onNext) : undefined,
    onSwipeRight: onBack
  }, true)
  
  return (
    <>
      <form className="space-y-4 p-4" onSubmit={handleSubmit(onNext)}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002060]">
            {t("Enter sample data")}
          </h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>

        {/* Banner demo */}
        {demoMode && (() => {
          const s = getDemoScenario(demoMode)
          return s ? <DemoBanner text={s.banners.sampleData} /> : null
        })()}

        {/* Camada 1: Texto auxiliar */}
        <p className="text-sm text-neutral-600">
          {t("This information helps with interpretation and organization of results.")}
        </p>

        {/* Campos obrigatórios por tipo */}
        {beverageType !== "Other hydroalcoholic" ? (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-[#002060] mb-2">
                <InfoTooltip text={t("Value declared by the manufacturer or expected content from preparation.")}>
                  <span>{t("Label content")}</span>
                </InfoTooltip>
                <span>{t("(0.0 to 100.0) *")}</span>
              </label>
              <input 
                type="text" 
                inputMode="decimal" 
                placeholder="Ex.: 40.0" 
                {...register("labelAbv", { 
                  setValueAs: (v) => { 
                    const s = String(v ?? "").trim()
                    if (!s) return undefined
                    const num = parseFlexibleDecimal(s)
                    return isNaN(num) ? undefined : num
                  } 
                })} 
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent" 
              />
              {errors.labelAbv && (
                <p className="text-red-600 text-xs mt-1">{errors.labelAbv.message}</p>
              )}
            </div>
            
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-[#002060] mb-2">
                <span>{t("Label content unit")}</span>
                <InfoTooltip text={t("% v/v - Beverages: official unit for distilled beverages in Brazil.")} />
              </label>
              <select 
                {...register("labelUnit", { 
                  setValueAs: (v) => { 
                    const s = String(v ?? "").trim()
                    return s === "" ? undefined : s 
                  } 
                })} 
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent"
              >
                <option value="">{t("Select...")}</option>
                <option value="% v/v - Beverages">{t("% v/v - Beverages")}</option>
                <option value="º GL - Gay-Lussac">{t("°GL - Gay-Lussac")}</option>
                <option value="INPM or % w/w">{t("INPM or % w/w")}</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#002060] mb-2">
                {t("Ethanol content % w/w *")}
              </label>
              <input 
                type="text" 
                inputMode="decimal" 
                placeholder="40.0" 
                {...register("ethanolMassPercent", { 
                  setValueAs: (v) => { 
                    const s = String(v ?? "").trim()
                    if (!s) return undefined
                    const num = parseFlexibleDecimal(s)
                    return isNaN(num) ? undefined : num
                  } 
                })} 
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent" 
              />
              {errors.ethanolMassPercent && (
                <p className="text-red-600 text-xs mt-1">{errors.ethanolMassPercent.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#002060] mb-2">
                {t("Methanol content % w/w *")}
              </label>
              <input 
                type="text" 
                inputMode="decimal" 
                placeholder="25.0" 
                {...register("methanolMassPercent", { 
                  setValueAs: (v) => { 
                    const s = String(v ?? "").trim()
                    if (!s) return undefined
                    const num = parseFlexibleDecimal(s)
                    return isNaN(num) ? undefined : num
                  } 
                })} 
                className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent" 
              />
              {errors.methanolMassPercent && (
                <p className="text-red-600 text-xs mt-1">{errors.methanolMassPercent.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#002060] mb-2">
                {t("Water content % w/w")}
              </label>
              <input 
                type="text" 
                readOnly 
                value={waterMm} 
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-neutral-100" 
              />
            </div>
          </div>
        )}

        {/* Campos opcionais */}
        <div>
          <label className="block text-sm font-medium text-[#002060] mb-2">
            {t("Sample name")}
          </label>
          <input 
            type="text" 
            maxLength={60} 
            placeholder={t("User-defined")} 
            {...register("sampleName")} 
            className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent" 
          />
        </div>
        
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-[#002060] mb-2">
            <InfoTooltip text={t("Optional field for traceability and to facilitate later retrieval of results.")}>
              <span>{t("Manufacturer and/or brand")}</span>
            </InfoTooltip>
          </label>
          <input 
            type="text" 
            maxLength={60} 
            placeholder={t("Optional")}
            {...register("brand")}
            className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent" 
          />
        </div>
        
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-[#002060] mb-2">
            <InfoTooltip text={t("Optional field for traceability and to facilitate later retrieval of results.")}>
              <span>{t("Batch")}</span>
            </InfoTooltip>
          </label>
          <input 
            type="text" 
            maxLength={60} 
            placeholder={t("Optional")}
            {...register("lot")}
            className="w-full border border-[#002060] rounded-lg p-2.5 focus:ring-2 focus:ring-[#002060] focus:border-transparent" 
          />
        </div>

        <NavigationButtons
          onBack={onBack}
          onNext={handleSubmit(onNext)}
          nextDisabled={isNextDisabled()}
        />
      </form>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title={t("Methodology: Sample Data")}
      >
        <MethodologyDadosAmostra />
      </MethodologyModal>
    </>
  )
}
