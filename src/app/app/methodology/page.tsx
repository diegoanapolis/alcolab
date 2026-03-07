"use client"
import React from "react"
import { MethodologyCompleteI18n as MethodologyComplete } from "@/lib/methodologyContent.i18n"

export default function MetodologiaPage() {
  return (
    <div className="p-4 md:px-8 lg:px-16 pb-8">
      <div className="max-w-3xl mx-auto">
        <MethodologyComplete />
      </div>
    </div>
  )
}
