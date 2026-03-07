"use client"
import React, { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import Link from "next/link"
import { useT } from "@/lib/i18n"

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const t = useT()
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
            <h1 className="text-lg font-semibold text-white">{t("Terms of Use and Liability")}</h1>
          </div>
          <div className="space-y-2 text-sm text-white text-justify">
            <p>
              This tool is intended exclusively for preventive screening purposes, supporting public health protection. It does not replace official laboratory analyses. Results are estimates and may vary depending on the precision of measurements performed by the user. The reliability of results depends entirely on the user’s care in following the methodology described in the application.
            </p>
            <p>
              The developers assume no responsibility for any misinterpretations, consumption decisions, or consequences arising from incorrect, incomplete, or improper use of the tool. If adulteration or methanol presence is suspected, do not consume the beverage and contact local health authorities and law enforcement.
            </p>
            <p>
              If methanol contamination is suspected, seek medical help immediately. In Brazil, call Disque-Intoxicação: 0800 722 6001.
            </p>
            <p>
              By clicking "I have read and agree", you declare that you have read, understood, and accepted the Terms of Use and Privacy Policy available in the application.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleAccept} 
              className="flex-1 bg-white hover:bg-gray-100 text-[#002060] font-semibold rounded-lg py-2"
            >
              I have read and agree
            </button>
            <button 
              onClick={() => alert("Using the application requires agreement with the Terms.")} 
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg py-2"
            >
              I do not agree
            </button>
          </div>
          <div className="text-xs text-white text-center">
            Read the <Link href="/app/methodology" className="underline text-blue-300">Methodology</Link> and 
            the information in <Link href="/app/about" className="underline text-blue-300">About</Link>.
          </div>
        </div>
      </div>
    </>
  )
}
