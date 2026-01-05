"use client"
import React, { useState } from "react"
import { ProfileData, WaterTempData, DensityData, TimesData } from "@/lib/schemas"
import NavigationButtons from "./NavigationButtons"
import useSwipe from "@/hooks/useSwipe"
import MethodologyModal, { MethodologyButton } from "@/components/ui/MethodologyModal"
import { MethodologyRevisao } from "@/lib/methodologyContent"

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
  const [showMethodology, setShowMethodology] = useState(false)
  
  // Hook de swipe
  useSwipe({
    onSwipeLeft: onCalculate,
    onSwipeRight: onBack
  }, true)
  
  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002060]">Revise os dados antes do cálculo</h1>
          <MethodologyButton onClick={() => setShowMethodology(true)} compact />
        </div>
        
        {/* Camada 1: Texto mínimo */}
        <p className="text-sm text-neutral-700 text-justify">
          Se necessário, volte às janelas anteriores e corrija as informações e os valores.
        </p>
        
        <div className="space-y-3">
          {/* Perfil */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">Perfil da Amostra</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Tipo:</span> {data.profile?.beverageType}</p>
              {data.profile?.sampleName && <p><span className="text-gray-500">Nome:</span> {data.profile?.sampleName}</p>}
              {data.profile?.beverageType !== "Outra hidroalcoólica" ? (
                <>
                  {typeof data.profile?.labelAbv === 'number' && <p><span className="text-gray-500">Teor de rótulo:</span> {data.profile.labelAbv} {data.profile?.labelUnit ?? ''}</p>}
                </>
              ) : (
                <>
                  {typeof data.profile?.ethanolMassPercent === 'number' && <p><span className="text-gray-500">Etanol:</span> {data.profile.ethanolMassPercent}% m/m</p>}
                  {typeof data.profile?.methanolMassPercent === 'number' && <p><span className="text-gray-500">Metanol:</span> {data.profile.methanolMassPercent}% m/m</p>}
                  <p><span className="text-gray-500">Água:</span> {((100 - ((data.profile?.ethanolMassPercent ?? 0) + (data.profile?.methanolMassPercent ?? 0))).toFixed(1))}% m/m</p>
                </>
              )}
              {data.profile?.brand && <p><span className="text-gray-500">Fabricante/Marca:</span> {data.profile.brand}</p>}
            </div>
          </div>
          
          {/* Água e Temperatura */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">Água e Temperatura</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Tipo de água:</span> {data.waterTemp?.waterType}</p>
              <p><span className="text-gray-500">T água:</span> {data.waterTemp?.waterTemperature ?? 'Não medida'} {data.waterTemp?.waterTemperature ? '°C' : ''}</p>
              <p><span className="text-gray-500">T amostra:</span> {data.waterTemp?.sampleTemperature ?? 'Não medida'} {data.waterTemp?.sampleTemperature ? '°C' : ''}</p>
            </div>
          </div>
          
          {/* Densidade */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">Massa / Densidade</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="text-gray-500">Método:</span> {data.density?.method ?? '-'}</p>
              {data.density?.method === 'Balança' && (
                <>
                  <p><span className="text-gray-500">Massa água:</span> {typeof data.density?.waterMass === 'number' ? `${data.density?.waterMass} g` : '-'}</p>
                  <p><span className="text-gray-500">Massa amostra:</span> {typeof data.density?.sampleMass === 'number' ? `${data.density?.sampleMass} g` : '-'}</p>
                </>
              )}
              {data.density?.method === 'Densímetro ou alcôometro' && (
                <>
                  <p><span className="text-gray-500">Valor medido:</span> {typeof data.density?.measuredValue === 'number' ? data.density?.measuredValue : '-'} {data.density?.measuredUnit ?? ''}</p>
                </>
              )}
            </div>
          </div>
          
          {/* Escoamentos */}
          <div className="border rounded-lg p-3">
            <h2 className="font-bold text-[#002060] text-sm mb-2">Escoamentos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Água</p>
                <Replicas kind="water" />
                <p className="mt-1 text-xs text-gray-600">
                  Manual: {data.times?.waterTimes && data.times.waterTimes.length ? data.times.waterTimes.map((t) => t.toFixed(2)).join(', ') + ' s' : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Amostra</p>
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
          nextLabel="Calcular"
        />
      </div>

      {/* Modal de Metodologia da Etapa (Camada 3) */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="Metodologia: Revisão"
      >
        <MethodologyRevisao />
      </MethodologyModal>
    </>
  );
}

function Replicas({ kind }: { kind: "water" | "sample" }) {
  let list: Array<{ previewUrl: string; fileName?: string; fileCreatedAt?: string; marks: Record<13|14|15|16|17|18, number|undefined> }> = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(kind === 'water' ? 'videoReplicasWater' : 'videoReplicasSample')
      if (raw) list = JSON.parse(raw)
    } catch {}
  }
  if (!list.length) return <p className="text-xs text-gray-600">Nenhum vídeo</p>
  return (
    <div className="space-y-1">
      {list.map((r, idx) => (
        <div key={idx} className="text-xs text-gray-600">
          <span className="font-medium">Rep. {idx + 1}:</span> {([18,17,16,15,14,13] as Array<13|14|15|16|17|18>).filter((v) => r.marks[v] != null).length} pontos
        </div>
      ))}
    </div>
  )
}
