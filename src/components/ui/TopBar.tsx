"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { Menu, Beaker, LineChart, BookOpen, Info, Home } from "lucide-react"

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [drawerSlideIn, setDrawerSlideIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => { if (open) setDrawerSlideIn(true) }, [open])
  const closeMenu = () => { setDrawerSlideIn(false); setTimeout(() => setOpen(false), 200) }
  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/medir", label: "Medição", icon: Beaker },
    { href: "/resultados", label: "Resultados", icon: LineChart },
    { href: "/metodologia", label: "Metodologia", icon: BookOpen },
    { href: "/sobre", label: "Sobre", icon: Info },
  ]
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-brand border-b border-neutral-200 md:max-w-md md:mx-auto z-40">
        <div className="flex items-center justify-between h-12 px-4 text-white">
          <button aria-label="Abrir menu" onClick={() => setOpen(true)} className="p-2 -ml-2"><Menu className="w-6 h-6" aria-hidden="true" /></button>
          <div className="font-bold text-[1.15rem]">AlcoLab</div>
          <div className="w-8" />
        </div>
      </nav>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className={clsx("absolute left-0 right-0 top-12 bottom-0 bg-black/40 transition-opacity duration-200", drawerSlideIn ? "opacity-100" : "opacity-0")} onClick={closeMenu} />
          <div className={clsx("absolute left-0 top-12 bottom-0 w-56 bg-white shadow-lg transition-transform duration-200 ease-out", drawerSlideIn ? "translate-x-0" : "-translate-x-full")}> 
            <ul className="py-2">
              {tabs.map((t) => {
                const active = pathname === t.href
                const Icon = t.icon
                return (
                  <li key={t.href}>
                    <Link href={t.href} onClick={closeMenu} className={clsx("block px-4 py-3 font-medium flex items-center", active ? "text-black" : "text-neutral-600")}> 
                      <Icon className={clsx("w-5 h-5 mr-2", active ? "text-brand" : "text-gray-600")} aria-hidden="true" />{t.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}