"use client"
import React, { useState } from "react"
import { BEVERAGE_TYPES } from "@/lib/constants"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, ProfileData } from "@/lib/schemas"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import InfoTooltip, { InlineTooltip } from "@/components/ui/InfoTooltip"
import { useT } from "@/lib/i18n"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyTipoSolucaoI18n as MethodologyTipoSolucao } from "@/lib/methodologyContent.i18n"

// Lista de casos não aplicáveis
const NOT_APPLICABLE = [
  "Liqueurs and sweetened beverages",
  "Alcoholic creams",
  "Fermented beverages (wine, beer, cider, mead)",
  "Flavored spirits",
  "Mixed and ready-to-drink beverages (e.g., pre-made cocktails)",
  "Turbid beverages with pulps, emulsions, oils or dense colorants",
  "Non-homogeneous homemade mixtures (cocktails)"
]

export default function StepProfile({ onNext, initialData, renderAfterTitle }: { onNext: (data: ProfileData) => void; initialData?: ProfileData; renderAfterTitle?: React.ReactNode }) {
  const t = useT()
  const [showMethodology, setShowMethodology] = useState(false)
  const [showNaoAplica, setShowNaoAplica] = useState(false)
  
  const lastProfile = React.useMemo<Partial<ProfileData> | undefined>(() => {
    if (initialData) return undefined
    try { 
      const raw = localStorage.getItem("profileDraft"); 
      if (!raw) return undefined; 
      const parsed = JSON.parse(raw); 
      if (parsed && typeof parsed === 'object') return parsed as Partial<ProfileData> 
    } catch {}
    return undefined
  }, [initialData])
  
  const { handleSubmit, watch, reset, setValue } = useForm<ProfileData>({ 
    resolver: zodResolver(profileSchema), 
    defaultValues: (initialData || lastProfile || {}) as Partial<ProfileData> 
  })
  
  React.useEffect(() => { 
    const sub = watch((vals) => { 
      try { localStorage.setItem("profileDraft", JSON.stringify(vals)) } catch {} 
    })
    return () => sub.unsubscribe() 
  }, [watch])
  
  const beverageType = watch("beverageType")
  
  // Hook de swipe - só próximo (não tem voltar no primeiro step)
  useSwipe({
    onSwipeLeft: beverageType ? handleSubmit(onNext) : undefined
  }, !!beverageType)

  const handleClearAll = () => {
    const keysToRemove = [
      "wizardData",
      "wizardStep", 
      "profileDraft",
      "videoReplicasWater",
      "videoReplicasSample",
      "manualTimesWater",
      "manualTimesSample",
      "lastWaterTemp",
      "lastResult",
      "lastOutputs",
      "frontend_export_rows",
      "deltaV",
      "hm"
    ]
    
    try {
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch {}
    
    reset({
      beverageType: undefined,
      labelAbv: undefined,
      labelUnit: undefined,
      ethanolMassPercent: undefined,
      methanolMassPercent: undefined,
      brand: undefined,
      sampleName: undefined
    })
    
    try {
      window.dispatchEvent(new Event("clearReplicates"))
    } catch {}
    
    setTimeout(() => {
      window.location.href = "/medir"
    }, 100)
  }

  const handleTypeSelect = (type: string) => {
    setValue("beverageType", type as any)
  }
  
  return (
    <>
      <form className="space-y-4 p-4" onSubmit={handleSubmit(onNext)}>
        {/* Título */}
        <h1 className="text-xl font-bold text-[#002060]">
          {t("Select")}{" "}
          <InlineTooltip 
            term={t("hydroalcoholic solution")} 
            tooltip={t("Mixture composed predominantly of water, ethanol and/or methanol.")}
          />
        </h1>

        {renderAfterTitle}

        {/* Ações superiores: Limpar, Não se aplica, Metodologia */}
        <div className="flex items-center justify-between">
          <InfoTooltip text="Clears only the analytical data from the measurement flow to start a new analysis. If reusing flow data, you can proceed without clearing and replace only the new experimental values.">
            <button 
              type="button" 
              className="text-xs underline text-[#002060]" 
              onClick={handleClearAll}
            >
              {t("Clear - New analysis")}
            </button>
          </InfoTooltip>
          
          <button 
            type="button" 
            className="text-xs underline text-red-600" 
            onClick={() => setShowNaoAplica(true)}
          >
            {t("Not applicable?")}
          </button>
          
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>

        {/* Grid de tipos de bebida */}
        <div className="grid grid-cols-2 gap-3">
          {BEVERAGE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeSelect(type)}
              className={`p-3 text-sm rounded-lg border-2 transition-all ${
                beverageType === type
                  ? "bg-[#002060] text-white font-bold border-[#002060]"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#002060]"
              }`}
            >
              <span className={type === "Commercial ethanol*" ? "font-bold" : undefined}>
                {t(type)}
              </span>
            </button>
          ))}
        </div>

        {/* Camada 1: Texto sobre etanol comercial - fonte reduzida */}
        <p className="text-xs text-neutral-600 text-justify">
          *{" "}
          <InfoTooltip text="Look for well-known and quality-recognized brands for better reference results.">
            <span className="font-medium">{t("Commercial ethanol")}</span>
          </InfoTooltip>{" "}
          {t("sealed can be used as a check to verify if the results obtained with your instruments are consistent.")}
        </p>

        {/* Botões de navegação */}
        <NavigationButtons
          onNext={beverageType ? handleSubmit(onNext) : undefined}
          nextDisabled={!beverageType}
          showBack={false}
        />
      </form>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title={t("Methodology: Solution Type")}
      >
        <MethodologyTipoSolucao />
      </MethodologyModal>

      {/* Modal "Não se aplica" */}
      {showNaoAplica && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b bg-red-50">
              <h3 className="font-bold text-red-700">🚫 {t("This methodology does NOT apply to:")}</h3>
            </div>
            <div className="p-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-red-700">
                {NOT_APPLICABLE.map((item, idx) => (
                  <li key={idx}>{t(item)}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowNaoAplica(false)}
                className="bg-[#002060] text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {t("Understood")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
