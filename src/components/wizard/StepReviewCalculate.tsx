"use client"
import React, { useState } from "react"
import { ProfileData, WaterTempData, DensityData, TimesData } from "@/lib/schemas"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import { useT } from "@/lib/i18n"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyRevisaoI18n as MethodologyRevisao } from "@/lib/methodologyContent.i18n"

export type WizardData = {
  profile?: ProfileData;
  waterTemp?: WaterTempData;
  density?: DensityData;
  times?: TimesData;
};

export default function StepReviewCalculate({ data, onBack, onCalculate }: {
  data: WizardData;
  onBack: () => void;
  onCalculate: () => void;
}) {
  const t = useT()
  const [showMethodology, setShowMethodology] = useState(false)
  
  // Hook de swipe
  useSwipe({
    onSwipeLeft: onCalculate,
    onSwipeRight: onBack
  }, true)
  
  return (
    <>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#002060]">{t("Review before calculating")}</h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} />
        </div>
        
        {/* Camada 1: Texto mínimo */}
        <p className="text-sm text-neutral-700 text-justify">
          If necessary, go back to previous steps and correct the information and values.
        </p>
        
        <div className="space-y-3">
          {/* Perfil */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">{t("Sample Profile")}</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Type:</span> {data.profile?.beverageType}</p>
              {data.profile?.sampleName && <p><span className="text-gray-500">Name:</span> {data.profile?.sampleName}</p>}
              {data.profile?.beverageType !== "Other hydroalcoholic" ? (
                <>
                  {typeof data.profile?.labelAbv === 'number' && <p><span className="text-gray-500">Label content:</span> {data.profile.labelAbv} {data.profile?.labelUnit ?? ''}</p>}
                </>
              ) : (
                <>
                  {typeof data.profile?.ethanolMassPercent === 'number' && <p><span className="text-gray-500">Ethanol:</span> {data.profile.ethanolMassPercent}% m/m</p>}
                  {typeof data.profile?.methanolMassPercent === 'number' && <p><span className="text-gray-500">Methanol:</span> {data.profile.methanolMassPercent}% m/m</p>}
                  <p><span className="text-gray-500">Water:</span> {((100 - ((data.profile?.ethanolMassPercent ?? 0) + (data.profile?.methanolMassPercent ?? 0))).toFixed(1))}% m/m</p>
                </>
              )}
              {data.profile?.brand && <p><span className="text-gray-500">Manufacturer/Brand:</span> {data.profile.brand}</p>}
            </div>
          </div>
          
          {/* Water and Temperature */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">{t("Water and Temperature")}</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Water type:</span> {data.waterTemp?.waterType}</p>
              <p><span className="text-gray-500">T water:</span> {data.waterTemp?.waterTemperature ?? 'Not measured'} {data.waterTemp?.waterTemperature ? '°C' : ''}</p>
              <p><span className="text-gray-500">T sample:</span> {data.waterTemp?.sampleTemperature ?? 'Not measured'} {data.waterTemp?.sampleTemperature ? '°C' : ''}</p>
            </div>
          </div>
          
          {/* Densidade */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">{t("Mass / Density")}</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Method:</span> {data.density?.method ?? '-'}</p>
              {data.density?.method === 'Scale' && (
                <>
                  <p><span className="text-gray-500">Water mass:</span> {typeof data.density?.waterMass === 'number' ? `${parseFloat(data.density.waterMass.toFixed(3))} g` : '-'}</p>
                  <p><span className="text-gray-500">Sample mass:</span> {typeof data.density?.sampleMass === 'number' ? `${parseFloat(data.density.sampleMass.toFixed(3))} g` : '-'}</p>
                </>
              )}
              {data.density?.method === 'Hydrometer or alcoholmeter' && (
                <>
                  <p><span className="text-gray-500">Measured value:</span> {typeof data.density?.measuredValue === 'number' ? data.density?.measuredValue : '-'} {data.density?.measuredUnit ?? ''}</p>
                </>
              )}
            </div>
          </div>
          
          {/* Flows */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">{t("Flows")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Water</p>
                <Replicas kind="water" />
                <p className="mt-1 text-xs text-gray-600">
                  Manual: {data.times?.waterTimes && data.times.waterTimes.length ? data.times.waterTimes.map((t) => t.toFixed(2)).join(', ') + ' s' : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Sample</p>
                <Replicas kind="sample" />
                <p className="mt-1 text-xs text-gray-600">
                  Manual: {data.times?.sampleTimes && data.times.sampleTimes.length ? data.times.sampleTimes.map((t) => t.toFixed(2)).join(', ') + ' s' : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <NavigationButtons
          onBack={onBack}
          onNext={onCalculate}
          nextLabel={t("Calculate")}
        />
      </div>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="Methodology: Review"
      >
        <MethodologyRevisao />
      </MethodologyModal>
    </>
  );
}

function Replicas({ kind }: { kind: "water" | "sample" }) {
  let list: Array<{ previewUrl: string; fileName?: string; fileCreatedAt?: string; marks: Record<14|15|16|17|18, number|undefined> }> = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(kind === 'water' ? 'videoReplicasWater' : 'videoReplicasSample')
      if (raw) list = JSON.parse(raw)
    } catch {}
  }
  if (!list.length) return <p className="text-xs text-gray-600">No video</p>
  return (
    <div className="space-y-1">
      {list.map((r, idx) => (
        <div key={idx} className="text-xs text-gray-600">
          <span className="font-medium">Rep. {idx + 1}:</span> {([18,17,16,15,14] as Array<14|15|16|17|18>).filter((v) => r.marks[v] != null).length} pontos
        </div>
      ))}
    </div>
  )
}
