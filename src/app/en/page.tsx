// AlcoLab — Homepage / Landing Page (English)
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only

import Link from "next/link";
import Image from "next/image";
import {
  Beaker,
  Timer,
  ShieldCheck,
  Shield,
  Stethoscope,
  Search,
  Truck,
  Users,
  Heart,
  Lightbulb,
  Coffee,
  ExternalLink,
  Building2,
  Handshake,
  Building,
  Mail,
  Github,
  BookOpen,
  Info,
  ChevronDown,
  FlaskConical,
} from "lucide-react";

/* ─── Constants ─── */
const GITHUB_REPO = "https://github.com/diegoanapolis/alcolab";
const BUYME_COFFEE_URL = "https://buymeacoffee.com/alcolab";
const FORM_SUGESTAO_URL = "mailto:alcolabapp@gmail.com?subject=AlcoLab%20Suggestion";
const PIX_KEY = "alcolabapp@gmail.com";

/* ─── Date ─── */
const team = [
  {
    initials: "DM",
    name: "Diego Mendes de Souza",
    role: "Development, experiments & statistics",
    credentials:
      "PhD in Chemometrics · Industrial Chemist · Official Forensic Expert · Chemistry Professor",
  },
  {
    initials: "PA",
    name: "Pedro Augusto de Oliveira Morais",
    role: "Scientific review, experiments & statistics",
    credentials:
      "PhD in Chemometrics · Industrial Chemist · Chemistry Professor — UFMA",
  },
  {
    initials: "NF",
    name: "Nayara Ferreira Santos",
    role: "UX audit, co-holder & administrative management",
    credentials: "Business Administrator · Co-founder of Científica Concursos",
  },
  {
    initials: "RR",
    name: "Romério Rodrigues dos Santos Silva",
    role: "Collaborator · UX Reviewer · Experiments",
    credentials: "PhD in Biochemistry · Biologist",
  },
];

/* ─── Component: Phone Mockup ─── */
function PhoneMockup({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative bg-neutral-900 rounded-[2rem] p-2 shadow-2xl ${className}`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-neutral-900 rounded-b-2xl z-10" />
      <div className="rounded-[1.5rem] overflow-hidden bg-white">
        <Image
          src={src}
          alt={alt}
          width={1170}
          height={2652}
          quality={100}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ENGLISH HOMEPAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function HomePageEN() {
  return (
    <main className="min-h-dvh">
      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative bg-white px-6 pt-16 pb-12 lg:px-16 lg:pt-24 lg:pb-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#002060] leading-tight">
              AlcoLab
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#002060]/70">
              Accessible methanol screening for everyone
            </p>
            <p className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0">
              Free, open-source tool that estimates methanol contamination in
              alcoholic beverages and hydroalcoholic solutions — no lab required.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#002060] text-white font-semibold hover:bg-[#001040] transition-colors text-sm"
              >
                <Beaker className="w-4 h-4" />
                Start screening
              </Link>
              <Link
                href="/app?demo=1"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#002060] text-[#002060] font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                <FlaskConical className="w-4 h-4" />
                Try with real data
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#002060] text-[#002060] font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                How it works
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-neutral-400 italic">
              Screening tool — does not replace confirmatory laboratory analysis.
            </p>
          </div>

          {/* Mockup */}
          <div className="flex-shrink-0 w-48 sm:w-56 lg:w-64">
            <PhoneMockup
              src="/images/homepage/semaforo-vermelho-en.png"
              alt="AlcoLab screen showing result with red traffic light — contaminated sample detected"
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            How it works
          </h2>

          <div className="space-y-10">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                    1
                  </span>
                  <h3 className="text-lg font-semibold text-[#002060]">
                    Experiment
                  </h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  The app guides the user through two measurements for both the
                  sample and water (reference standard):
                </p>
                <ul className="text-sm text-neutral-700 space-y-2 pl-6 list-disc marker:text-[#002060]">
                  <li>
                    <span className="font-medium">Relative density</span> —
                    ratio of the sample mass to the water mass (same volume, same
                    temperature), obtained by differential weighing with a
                    syringe.
                  </li>
                  <li>
                    <span className="font-medium">Relative viscosity</span> —
                    ratio of the flow times of the sample and water in the same
                    syringe (range 18 to 14 mL).
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center sm:flex-row gap-3 justify-center md:justify-end shrink-0 w-full md:w-auto">
                <div className="w-48 sm:w-56 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/step-pesagem-en.png"
                    alt="AlcoLab weighing screen"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
                <div className="w-48 sm:w-56 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/step-video-menisco-en.png"
                    alt="AlcoLab video meniscus marking screen"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                  2
                </span>
                <h3 className="text-lg font-semibold text-[#002060]">
                  Alcohol content estimation
                </h3>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                From the relative density and reference tables (Gay-Lussac,
                OIML), the app estimates the total alcohol mass fraction —
                regardless of whether it is ethanol and/or methanol, since both
                have very similar densities. Unit conversions (% v/v, °GL, INPM,
                % w/w) are performed automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                  3
                </span>
                <h3 className="text-lg font-semibold text-[#002060]">
                  Ternary composition screening
                </h3>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Combines relative density and relative viscosity (corrected to
                20 °C) in a pre-computed 3D reference mesh, locating the
                compositions (pure substance, binary and/or ternary) whose
                density and viscosity most closely match the user&apos;s measured
                values.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                  4
                </span>
                <h3 className="text-lg font-semibold text-[#002060]">
                  Statistical evaluation
                </h3>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                The app evaluates the experimental uncertainty of the
                measurements, comparing the composition identified in the
                previous step with nearby compositions through a Z-test for mean
                comparison and Monte Carlo probabilistic simulation. The goal is
                to include nearby, statistically equivalent and/or probabilistically
                likely compositions.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                    5
                  </span>
                  <h3 className="text-lg font-semibold text-[#002060]">
                    Results report
                  </h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Equivalent and/or most likely compositions are compared with the
                  declared label. The app organizes experimental measurements and
                  results into a report and displays an immediate safety
                  indicator in traffic light format (green / yellow / red).
                  For example, when there is considerable probability of methanol presence and incompatibility with the label, the traffic light
                  turns red.
                </p>
              </div>
              <div className="w-48 sm:w-56 shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                <Image
                  src="/images/homepage/semaforo-vermelho-en.png"
                  alt="Result with red traffic light"
                  width={1170}
                  height={2652}
                  quality={100}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/app/methodology"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#002060] hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              Read the full methodology →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: WHY IT MATTERS ─── */}
      <section className="bg-[#002060] text-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white">
            Why AlcoLab exists
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center space-y-2 p-6 rounded-xl bg-white/10">
              <p className="text-4xl sm:text-5xl font-extrabold">200+</p>
              <p className="text-sm text-blue-100 leading-snug">
                suspected methanol poisoning cases in Brazil in a single
                outbreak (PAHO/WHO, 2025)
              </p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-xl bg-white/10">
              <p className="text-4xl sm:text-5xl font-extrabold">28</p>
              <p className="text-sm text-blue-100 leading-snug">
                countries with active methanol risk alerts for beverages (UK
                Foreign Office, 2025)
              </p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-xl bg-white/10">
              <p className="text-4xl sm:text-5xl font-extrabold">$0</p>
              <p className="text-sm text-blue-100 leading-snug">
                Cost per analysis with AlcoLab — versus $10,000+ for a gas
                chromatograph and hundreds of dollars per lab test
              </p>
            </div>
          </div>

          <p className="text-sm text-blue-100 text-center max-w-3xl mx-auto leading-relaxed">
            Despite the magnitude of the problem, practical detection remains
            largely restricted to laboratory settings. Selective techniques such
            as gas chromatography (GC-FID, GC-MS) require expensive
            instrumentation, unavailable to most field agents. Portable
            alternatives like Raman spectroscopy cost tens or hundreds of
            thousands of dollars. AlcoLab offers a radically accessible
            approach.
          </p>
        </div>
      </section>

      {/* ─── SECTION 4: WHO IS IT FOR ─── */}
      <section className="bg-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Who is it for
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                Icon: Shield,
                profile: "Health inspectors",
                desc: "Rapid field screening during inspections and seizures, supporting more targeted referral of samples to official laboratories with limited analytical capacity",
              },
              {
                Icon: Stethoscope,
                profile: "Healthcare professionals",
                desc: "Preliminary screening of suspected beverages when attending patients with symptoms compatible with methanol poisoning, supporting timely clinical decisions while confirmatory results are unavailable",
              },
              {
                Icon: Search,
                profile: "Investigators & forensic experts",
                desc: "Preliminary evidence in seizures and investigations",
              },
              {
                Icon: Truck,
                profile: "Distributors & retailers",
                desc: "Screening verification of suspicious batches or units",
              },
              {
                Icon: Users,
                profile: "Consumers",
                desc: "Anyone, in any country, with access to the basic materials, provided they strictly follow the methodology indicated in the app",
              },
            ].map(({ Icon, profile, desc }) => (
              <div
                key={profile}
                className="border border-neutral-200 rounded-xl p-5 space-y-2 hover:border-[#002060]/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-[#002060] shrink-0" />
                  <h3 className="text-sm font-semibold text-[#002060]">
                    {profile}
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: TRY IT NOW ─── */}
      <section className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-[#002060]/20 rounded-2xl p-8 sm:p-10 bg-white space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#002060] text-center">
              Try it before you use it
            </h2>
            <p className="text-sm text-neutral-700 text-center max-w-2xl mx-auto leading-relaxed">
              The authors have provided three demonstration scenarios with real
              date — including contaminated and legitimate samples — so you can
              explore the full analytical workflow before performing your own
              screening.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-52 sm:w-60 mx-auto rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/semaforo-verde-en.png"
                    alt="Result with green traffic light — legitimate sample"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-xs text-green-700 font-medium">
                  ✅ Legitimate sample
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-52 sm:w-60 mx-auto rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/semaforo-vermelho-en.png"
                    alt="Result with red traffic light — contaminated sample"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-xs text-red-700 font-medium">
                  🚨 Contamination detected
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/app?demo=1"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#002060] text-white font-semibold hover:bg-[#001040] transition-colors text-sm"
              >
                <FlaskConical className="w-4 h-4" />
                Try with real data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: SCIENTIFIC BASIS ─── */}
      <section className="bg-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Scientific basis
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed text-justify">
            AlcoLab combines two physical properties — relative density and
            relative viscosity — to estimate the ternary composition of
            water/ethanol/methanol solutions. Measurements are compared against a
            pre-computed reference mesh to obtain the most accurate composition
            from the experimental data. This composition is then tested against
            nearby compositions to evaluate equivalences and occurrence
            probabilities (Z-test and Monte Carlo simulation), considering the
            experimental uncertainty. This approach ensures that no other
            equivalent, possible and likely ternary composition
            (water-ethanol-methanol) is left out of the reported results, when
            one exists for the obtained data, beyond the most accurate one found
            in the mesh search.
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed text-justify">
            All scientific processing occurs locally in the browser, using Python
            (NumPy, SciPy) executed via Pyodide (WebAssembly). No data is sent
            to external servers. Future versions will only do so with explicit
            user consent, to enable features such as epidemiological risk mapping
            and integration with health surveillance systems.
          </p>
          <div className="text-center">
            <Link
              href="/app/methodology"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#002060] hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              View full methodology →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: TEAM ─── */}
      <section className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {team.map((m) => (
              <div
                key={m.name}
                className="flex items-start gap-4 bg-white rounded-xl p-5 border border-neutral-200"
              >
                <div className="w-12 h-12 rounded-full bg-[#002060] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {m.initials}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-800">
                    {m.name}
                  </p>
                  <p className="text-xs text-neutral-600">{m.role}</p>
                  <p className="text-xs text-neutral-400">{m.credentials}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: SUPPORT THE PROJECT ─── */}
      <section className="bg-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center flex items-center justify-center gap-2">
            <Heart className="w-6 h-6" />
            Support the project
          </h2>

          <p className="text-sm text-neutral-700 text-center max-w-2xl mx-auto leading-relaxed">
            AlcoLab is maintained on a voluntary, nonprofit basis. To ensure its
            continuity and evolution — including recalibrations, external
            validations, building a collaborative database for adulteration
            mapping, and infrastructure maintenance — the project is open to
            support of different kinds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                Icon: Building2,
                title: "Public funding",
                desc: "Innovation, public health, and open science grants",
              },
              {
                Icon: Handshake,
                title: "Institutional partnerships",
                desc: "Health organizations, universities, and reference laboratories",
              },
              {
                Icon: Building,
                title: "Corporate sponsorship",
                desc: "Companies in the beverage, food safety, and health sectors",
              },
              {
                Icon: Heart,
                title: "Individual donations",
                desc: "Contributions of any amount",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 border border-neutral-200 rounded-xl p-5"
              >
                <Icon className="w-5 h-5 text-[#002060] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#002060]">
                    {title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-2">
              <p className="text-sm font-medium text-neutral-700">
                🇧🇷 Brazil — Pix
              </p>
              <code className="block text-sm bg-white border border-neutral-200 rounded px-3 py-2 text-neutral-700">
                {PIX_KEY}
              </code>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-2">
              <p className="text-sm font-medium text-neutral-700">
                🌍 Other countries
              </p>
              <a
                href={BUYME_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-[#FFDD00] text-neutral-800 hover:bg-[#FFE94D] transition-colors"
              >
                <Coffee className="w-4 h-4" />
                Buy Me a Coffee
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 space-y-3">
            <h3 className="text-base font-semibold text-[#002060] flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Support with ideas
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Suggestions for improvements, new features, or adjustments are
              always welcome. All proposals are evaluated by the team and
              publicly tracked regarding their feasibility and implementation.
            </p>
            <a
              href={FORM_SUGESTAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 border-[#002060] text-[#002060] hover:bg-blue-50 transition-colors"
            >
              Submit a suggestion
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          <p className="text-sm text-neutral-600 text-center">
            For partnership or funding proposals, please contact us at{" "}
            <a
              href={`mailto:${PIX_KEY}`}
              className="text-[#002060] font-medium underline"
            >
              alcolabapp@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* ─── SECTION 9: CONTACT ─── */}
      <section className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] flex items-center justify-center gap-2">
            <Mail className="w-6 h-6" />
            Contact & partnerships
          </h2>
          <a
            href={`mailto:${PIX_KEY}`}
            className="text-lg font-semibold text-[#002060] underline"
          >
            alcolabapp@gmail.com
          </a>
          <p className="text-sm text-neutral-700 max-w-xl mx-auto leading-relaxed">
            Institutions, organizations, and companies interested in supporting,
            partnering, or integrating AlcoLab into their programs are welcome to
            get in touch.
          </p>
        </div>
      </section>

      {/* ─── SECTION 10: FOOTER ─── */}
      <footer className="bg-[#002060] text-white px-6 py-10 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <Link
              href="/blog/en"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/app/methodology"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="/app/about"
              className="text-blue-200 hover:text-white transition-colors"
            >
              About
            </Link>
            <a
              href={`mailto:${PIX_KEY}`}
              className="text-blue-200 hover:text-white transition-colors"
            >
              Contact
            </a>
            <Link
              href="/pt"
              className="text-blue-200 hover:text-white transition-colors"
            >
              🇧🇷 Português
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-blue-200">
            <span>Open Source</span>
            <span>·</span>
            <span>AGPL-3.0</span>
            <span>·</span>
            <span>Made in Brazil 🇧🇷</span>
          </div>

          <div className="text-center text-xs text-blue-300 space-y-1">
            <p>
              © 2024–2026 Diego Mendes de Souza, Pedro Augusto de Oliveira
              Morais, Nayara Ferreira Santos
            </p>
            <p className="italic">
              Screening tool — does not replace confirmatory laboratory analysis.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
