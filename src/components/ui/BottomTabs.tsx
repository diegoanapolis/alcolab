"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { Beaker, LineChart, BookOpen, Info, Home } from "lucide-react"

export default function BottomTabs() {
  const pathname = usePathname()
  const tabs = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/measure", label: "Medição", icon: Beaker },
    { href: "/app/results", label: "Resultados", icon: LineChart },
    { href: "/app/methodology", label: "Metodologia", icon: BookOpen },
    { href: "/app/about", label: "Sobre", icon: Info },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 md:max-w-md md:mx-auto">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = pathname === t.href
          const Icon = t.icon
          return (
            <li key={t.href} className="flex">
              <Link href={t.href} aria-label={t.label} className={clsx("flex-1 flex items-center justify-center h-12 outline-none transition-colors", active ? "text-brand" : "text-gray-400 hover:text-gray-500 focus-visible:ring-2 focus-visible:ring-brand")}>
                <Icon className={clsx("w-7 h-7", active ? "text-brand" : "text-gray-400", "transition-colors")} aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}