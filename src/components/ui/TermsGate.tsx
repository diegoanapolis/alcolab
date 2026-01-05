"use client"
import React, { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import Link from "next/link"

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(false)
  const [ready, setReady] = useState(false)
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem("termsAccepted_v1")
      if (stored === "true") setAccepted(true)
    } catch {}
    setReady(true)
  }, [])
  
  const handleAccept = () => {
    try {
      localStorage.setItem("termsAccepted_v1", "true")
      localStorage.setItem("termsAcceptedAt_v1", new Date().toISOString())
    } catch {}
    setAccepted(true)
  }
  
  if (!ready) return <div className="fixed inset-0 z-50 bg-[#002060]" />
  if (accepted) return <>{children}</>
  
  return (
    <>
      {children}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002060] p-4">
        <div className="w-full max-w-md bg-[#002060] border border-gray-600 rounded-2xl shadow-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-white" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Termo de Uso e Responsabilidade</h1>
          </div>
          <div className="space-y-2 text-sm text-white text-justify">
            <p>
              Esta ferramenta possui finalidade exclusivamente preventiva e de triagem, auxiliando na proteção da saúde pública. Não substitui exames laboratoriais oficiais. Os resultados são estimativos e podem variar conforme a precisão das medições realizadas pelo próprio usuário. A confiabilidade dos resultados depende inteiramente do cuidado do usuário ao seguir a metodologia descrita no aplicativo.
            </p>
            <p>
              Os desenvolvedores não se responsabilizam por quaisquer interpretações equivocadas, decisões de consumo ou consequências decorrentes do uso incorreto, incompleto ou indevido da ferramenta. Em caso de suspeita de adulteração ou presença de metanol, recomenda-se não consumir a bebida e acionar Vigilância Sanitária local, Polícia Civil (197), PROCON e, quando couber, o MAPA.
            </p>
            <p>
              Em caso de suspeita de contaminação por metanol, busque serviço de saúde imediatamente e ligue para o Disque-Intoxicação 0800 722 6001.
            </p>
            <p>
              Ao clicar em "Li e concordo", você declara ter lido, entendido e aceitado os Termos de Uso e a Política de Privacidade disponíveis no aplicativo.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleAccept} 
              className="flex-1 bg-white hover:bg-gray-100 text-[#002060] font-semibold rounded-lg py-2"
            >
              Li e Concordo
            </button>
            <button 
              onClick={() => alert("O uso do aplicativo requer concordância com os Termos.")} 
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg py-2"
            >
              Não Concordo
            </button>
          </div>
          <div className="text-xs text-white text-center">
            Leia a <Link href="/metodologia" className="underline text-blue-300">Metodologia</Link> e as 
            informações em <Link href="/sobre" className="underline text-blue-300">Sobre</Link>.
          </div>
        </div>
      </div>
    </>
  )
}
