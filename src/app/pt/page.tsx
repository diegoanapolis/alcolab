// AlcoLab — Homepage / Landing Page
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

/* ─── Constantes ─── */
const GITHUB_REPO = "https://github.com/diegoanapolis/alcolab";
const BUYME_COFFEE_URL = "https://buymeacoffee.com/alcolab";
const FORM_SUGESTAO_URL = "mailto:alcolabapp@gmail.com?subject=Sugest%C3%A3o%20AlcoLab";
const PIX_KEY = "alcolabapp@gmail.com";

/* ─── Dados ─── */
const equipe = [
  {
    iniciais: "DM",
    nome: "Diego Mendes de Souza",
    papel: "Desenvolvimento, experimentos e estatística",
    credenciais:
      "Dr. em Quimiometria · Químico Industrial · Perito Criminal Oficial · Professor de Química",
  },
  {
    iniciais: "PA",
    nome: "Pedro Augusto de Oliveira Morais",
    papel: "Revisão científica, experimentos e estatística",
    credenciais:
      "PhD em Quimiometria · Químico Industrial · Professor de Química — UFMA",
  },
  {
    iniciais: "NF",
    nome: "Nayara Ferreira Santos",
    papel: "Auditoria UX, cotitular e gestão administrativa",
    credenciais: "Administradora · Sócio-fundadora da Científica Concursos",
  },
  {
    iniciais: "RR",
    nome: "Romério Rodrigues dos Santos Silva",
    papel: "Colaborador · Revisor UX · Experimentos",
    credenciais: "Dr. em Bioquímica · Biólogo",
  },
];

/* ─── Componente: Moldura de celular ─── */
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
      {/* Notch */}
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
   HOMEPAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* ─── SEÇÃO 1: HERO ─── */}
      <section className="relative bg-white px-6 pt-16 pb-12 lg:px-16 lg:pt-24 lg:pb-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Texto */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#002060] leading-tight">
              AlcoLab
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#002060]/70">
              Triagem de metanol acessível a todos
            </p>
            <p className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0">
              Ferramenta gratuita e open-source que estima contaminação por
              metanol em bebidas e soluções — sem laboratório.
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#002060] text-white font-semibold hover:bg-[#001040] transition-colors text-sm"
              >
                <Beaker className="w-4 h-4" />
                Iniciar triagem
              </Link>
              <Link
                href="/app?demo=1"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#002060] text-[#002060] font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                <FlaskConical className="w-4 h-4" />
                Teste com dados reais
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#002060] text-[#002060] font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                Como funciona?
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-neutral-400 italic">
              Screening tool — não substitui análise laboratorial
              confirmatória.
            </p>
          </div>

          {/* Mockup */}
          <div className="flex-shrink-0 w-48 sm:w-56 lg:w-64">
            <PhoneMockup
              src="/images/homepage/semaforo-vermelho.png"
              alt="Tela do AlcoLab mostrando resultado com semáforo vermelho — amostra contaminada detectada"
            />
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 2: COMO FUNCIONA ─── */}
      <section id="como-funciona" className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Como funciona
          </h2>

          {/* Etapas */}
          <div className="space-y-10">
            {/* Etapa 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                    1
                  </span>
                  <h3 className="text-lg font-semibold text-[#002060]">
                    Experimento
                  </h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  O app instrui o usuário a realizar duas medições para a amostra
                  e para água (padrão de referência):
                </p>
                <ul className="text-sm text-neutral-700 space-y-2 pl-6 list-disc marker:text-[#002060]">
                  <li>
                    <span className="font-medium">Densidade relativa</span> —
                    razão entre a massa da amostra e a massa da água (mesmo
                    volume, mesma temperatura), obtida por pesagem diferencial com
                    seringa.
                  </li>
                  <li>
                    <span className="font-medium">Viscosidade relativa</span> —
                    razão entre os tempos de escoamento da amostra e da água na
                    mesma seringa (faixa de 18 a 14 mL).
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center sm:flex-row gap-3 justify-center md:justify-end shrink-0">
                <div className="w-48 sm:w-56 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/step-pesagem.png"
                    alt="Tela de pesagem do AlcoLab"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
                <div className="w-48 sm:w-56 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/step-video-menisco.png"
                    alt="Tela de marcação dos meniscos por vídeo no AlcoLab"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Etapa 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                  2
                </span>
                <h3 className="text-lg font-semibold text-[#002060]">
                  Estimativa do teor alcoólico
                </h3>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                A partir da relative density e de tabelas de referência
                (Gay-Lussac, OIML), o app estima o teor em massa de álcool total
                — independentemente de ser etanol e/ou metanol, já que ambos
                possuem densidades muito próximas. Conversões entre unidades (%
                v/v, °GL, INPM, % m/m) são realizadas automaticamente.
              </p>
            </div>

            {/* Etapa 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                  3
                </span>
                <h3 className="text-lg font-semibold text-[#002060]">
                  Triagem da composição ternária
                </h3>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Combina relative density e relative viscosity (corrigida para
                20 °C) em uma malha 3D de referência pré-calculada, localizando
                as composições (substância pura, binárias e/ou ternárias) cuja
                densidade e viscosidade mais se aproximam dos valores obtidos pelo
                usuário.
              </p>
            </div>

            {/* Etapa 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                  4
                </span>
                <h3 className="text-lg font-semibold text-[#002060]">
                  Avaliação estatística
                </h3>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                O app avalia a incerteza experimental das medições, comparando a
                composição identificada na etapa anterior com composições de
                resultados próximos por meio de teste Z de comparação de médias e
                simulação probabilística de Monte Carlo. O objetivo é incluir
                composições próximas, estatisticamente equivalentes e/ou
                probabilisticamente prováveis.
              </p>
            </div>

            {/* Etapa 5 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002060] text-white text-sm font-bold shrink-0">
                    5
                  </span>
                  <h3 className="text-lg font-semibold text-[#002060]">
                    Relatório de resultados
                  </h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  As composições equivalentes e/ou mais prováveis são comparadas com o
                  rótulo declarado. O app organiza medidas experimentais e
                  resultados em um relatório e exibe um indicador imediato de
                  segurança em formato de semáforo (verde / amarelo / vermelho).
                  Por exemplo, quando há probabilidade considerável para presença de metanol e incompatibilidade com o rótulo, o semáforo
                  assume cor vermelha.
                </p>
              </div>
              <div className="w-48 sm:w-56 shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                <Image
                  src="/images/homepage/semaforo-vermelho.png"
                  alt="Resultado com semáforo vermelho"
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
              Leia a metodologia completa →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 3: POR QUE IMPORTA ─── */}
      <section className="bg-[#002060] text-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white">
            Por que o AlcoLab existe
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div className="text-center space-y-2 p-6 rounded-xl bg-white/10">
              <p className="text-4xl sm:text-5xl font-extrabold">200+</p>
              <p className="text-sm text-blue-100 leading-snug">
                casos suspeitos de envenenamento por metanol no Brasil em um
                único surto (OPAS/OMS, 2025)
              </p>
            </div>
            {/* Stat 2 */}
            <div className="text-center space-y-2 p-6 rounded-xl bg-white/10">
              <p className="text-4xl sm:text-5xl font-extrabold">28</p>
              <p className="text-sm text-blue-100 leading-snug">
                países com alerta ativo de risco de metanol em bebidas (UK
                Foreign Office, 2025)
              </p>
            </div>
            {/* Stat 3 */}
            <div className="text-center space-y-2 p-6 rounded-xl bg-white/10">
              <p className="text-4xl sm:text-5xl font-extrabold">R$ 0</p>
              <p className="text-sm text-blue-100 leading-snug">
                Custo por análise no AlcoLab — contra R$ 50.000+ de um cromatógrafo
                gasoso e centenas de reais por análise
              </p>
            </div>
          </div>

          <p className="text-sm text-blue-100 text-center max-w-3xl mx-auto leading-relaxed">
            Apesar da magnitude do problema, a detecção prática permanece
            restrita ao ambiente laboratorial. Técnicas seletivas como
            cromatografia gasosa (GC-FID, GC-MS) exigem instrumentação
            dispendiosa, indisponível para a maioria dos agentes de campo.
            Alternativas portáteis como espectroscopia Raman custam dezenas ou
            centenas de milhares de dólares. O AlcoLab oferece uma abordagem
            radicalmente acessível.
          </p>
        </div>
      </section>

      {/* ─── SEÇÃO 4: PARA QUEM ─── */}
      <section className="bg-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Para quem
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                Icon: Shield,
                perfil: "Vigilância sanitária",
                desc: "Triagem rápida em campo durante fiscalizações e apreensões, auxiliando no encaminhamento mais assertivo de amostras aos laboratórios oficiais, cuja capacidade analítica é limitada",
              },
              {
                Icon: Stethoscope,
                perfil: "Profissionais de saúde",
                desc: "Triagem preliminar da bebida suspeita em contextos de atendimento a pacientes com sintomas compatíveis com intoxicação por metanol, quando houver acesso à amostra, subsidiando decisões clínicas tempestivas enquanto resultados confirmatórios não estão disponíveis",
              },
              {
                Icon: Search,
                perfil: "Investigadores e peritos",
                desc: "Evidência preliminar em apreensões e investigações",
              },
              {
                Icon: Truck,
                perfil: "Distribuidores e varejistas",
                desc: "Verificação de triagem em lotes ou unidades suspeitas",
              },
              {
                Icon: Users,
                perfil: "Consumidores",
                desc: "Qualquer pessoa, em qualquer país, com acesso aos materiais básicos, desde que siga rigorosamente a metodologia indicada no próprio app",
              },
            ].map(({ Icon, perfil, desc }) => (
              <div
                key={perfil}
                className="border border-neutral-200 rounded-xl p-5 space-y-2 hover:border-[#002060]/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-[#002060] shrink-0" />
                  <h3 className="text-sm font-semibold text-[#002060]">
                    {perfil}
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

      {/* ─── SEÇÃO 5: EXPERIMENTE AGORA ─── */}
      <section className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-[#002060]/20 rounded-2xl p-8 sm:p-10 bg-white space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#002060] text-center">
              Experimente antes de usar
            </h2>
            <p className="text-sm text-neutral-700 text-center max-w-2xl mx-auto leading-relaxed">
              Os autores disponibilizaram três cenários de demonstração com dados
              reais — incluindo amostras contaminadas e legítimas — para que você
              conheça o fluxo analítico completo antes de realizar sua própria
              triagem.
            </p>

            {/* Screenshots lado a lado */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-52 sm:w-60 mx-auto rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/semaforo-verde.png"
                    alt="Resultado com semáforo verde — amostra legítima"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-xs text-green-700 font-medium">
                  ✅ Amostra legítima
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-52 sm:w-60 mx-auto rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                  <Image
                    src="/images/homepage/semaforo-vermelho.png"
                    alt="Resultado com semáforo vermelho — amostra contaminada"
                    width={1170}
                    height={2652}
                    quality={100}
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-xs text-red-700 font-medium">
                  🚨 Contaminação detectada
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#002060] text-white font-semibold hover:bg-[#001040] transition-colors text-sm"
              >
                <FlaskConical className="w-4 h-4" />
                Testar com dados reais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 6: BASE CIENTÍFICA ─── */}
      <section className="bg-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Base científica
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed text-justify">
            O AlcoLab combina duas propriedades físicas — densidade relativa e
            viscosidade relativa — para estimar a composição ternária de soluções
            de água, etanol e metanol. As medições são comparadas com uma malha
            de referência pré-calculada para obter a composição mais exata com os
            dados experimentais. Essa composição é confrontada com outras
            composições próximas para testar equivalências e probabilidades de
            ocorrência (teste Z e simulação de Monte Carlo), considerando a
            incerteza do experimento. Essa sistemática garante que não fique de
            fora dos resultados reportados, quando existente para os dados
            obtidos, outra composição ternária (água-etanol-metanol) equivalente,
            possível e provável, além da mais exata obtida pela busca na malha.
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed text-justify">
            Todo o processamento científico ocorre localmente no navegador,
            utilizando Python (NumPy, SciPy) executado via Pyodide
            (WebAssembly). Nenhum dado é enviado a servidores externos. Versões
            futuras só o farão mediante consentimento explícito do usuário, para
            viabilizar funcionalidades como mapeamento de risco epidemiológico e
            integração com sistemas de vigilância em saúde.
          </p>
          <div className="text-center">
            <Link
              href="/app/methodology"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#002060] hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              Ver metodologia completa →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 7: EQUIPE ─── */}
      <section className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center">
            Equipe
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {equipe.map((m) => (
              <div
                key={m.nome}
                className="flex items-start gap-4 bg-white rounded-xl p-5 border border-neutral-200"
              >
                {/* Iniciais */}
                <div className="w-12 h-12 rounded-full bg-[#002060] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {m.iniciais}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-800">
                    {m.nome}
                  </p>
                  <p className="text-xs text-neutral-600">{m.papel}</p>
                  <p className="text-xs text-neutral-400">{m.credenciais}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO 8: APOIE O PROJETO ─── */}
      <section className="bg-white px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] text-center flex items-center justify-center gap-2">
            <Heart className="w-6 h-6" />
            Apoie o projeto
          </h2>

          <p className="text-sm text-neutral-700 text-center max-w-2xl mx-auto leading-relaxed">
            O AlcoLab é mantido de forma voluntária e sem fins lucrativos. Para
            garantir sua continuidade e evolução — incluindo recalibrações,
            validações externas, construção de base de dados colaborativa para
            mapeamento de adulterações e manutenção de infraestrutura — o
            projeto está aberto a apoios de diferentes naturezas.
          </p>

          {/* 4 cards de tipo de apoio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                Icon: Building2,
                titulo: "Financiamento público",
                desc: "Editais de inovação, saúde pública e ciência aberta",
              },
              {
                Icon: Handshake,
                titulo: "Parcerias institucionais",
                desc: "Organizações de saúde, universidades e laboratórios de referência",
              },
              {
                Icon: Building,
                titulo: "Patrocínio corporativo",
                desc: "Empresas do setor de bebidas, segurança alimentar e saúde",
              },
              {
                Icon: Heart,
                titulo: "Doações individuais",
                desc: "Contribuições de qualquer valor",
              },
            ].map(({ Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="flex items-start gap-3 border border-neutral-200 rounded-xl p-5"
              >
                <Icon className="w-5 h-5 text-[#002060] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#002060]">
                    {titulo}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Canais de doação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pix */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-2">
              <p className="text-sm font-medium text-neutral-700">
                🇧🇷 Brasil — Pix
              </p>
              <code className="block text-sm bg-white border border-neutral-200 rounded px-3 py-2 text-neutral-700">
                {PIX_KEY}
              </code>
            </div>
            {/* Internacional */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-2">
              <p className="text-sm font-medium text-neutral-700">
                🌍 Outros países
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

          {/* Apoie com ideias */}
          <div className="border border-neutral-200 rounded-xl p-6 space-y-3">
            <h3 className="text-base font-semibold text-[#002060] flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Apoie também com ideias
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Sugestões de melhorias, novas funcionalidades ou ajustes são sempre
              bem-vindas. Todas as propostas são avaliadas pela equipe e
              acompanhadas publicamente quanto à sua viabilidade e implementação.
            </p>
            <a
              href={FORM_SUGESTAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 border-[#002060] text-[#002060] hover:bg-blue-50 transition-colors"
            >
              Enviar sugestão
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          <p className="text-sm text-neutral-600 text-center">
            Para propostas de parceria ou financiamento, entre em contato pelo
            e-mail{" "}
            <a
              href={`mailto:${PIX_KEY}`}
              className="text-[#002060] font-medium underline"
            >
              alcolabapp@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* ─── SEÇÃO 9: CONTATO ─── */}
      <section className="bg-neutral-100 px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002060] flex items-center justify-center gap-2">
            <Mail className="w-6 h-6" />
            Contato e parcerias
          </h2>
          <a
            href={`mailto:${PIX_KEY}`}
            className="text-lg font-semibold text-[#002060] underline"
          >
            alcolabapp@gmail.com
          </a>
          <p className="text-sm text-neutral-700 max-w-xl mx-auto leading-relaxed">
            Instituições, organizações e empresas interessadas em apoio, parceria
            ou integração do AlcoLab em seus programas são bem-vindas a entrar em
            contato.
          </p>
        </div>
      </section>

      {/* ─── SEÇÃO 10: FOOTER ─── */}
      <footer className="bg-[#002060] text-white px-6 py-10 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Links */}
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
              href="/app/methodology"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Metodologia
            </Link>
            <Link
              href="/app/about"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Sobre
            </Link>
            <a
              href={`mailto:${PIX_KEY}`}
              className="text-blue-200 hover:text-white transition-colors"
            >
              Contato
            </a>
            <Link
              href="/en"
              className="text-blue-200 hover:text-white transition-colors"
            >
              🇬🇧 English
            </Link>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-blue-200">
            <span>Open Source</span>
            <span>·</span>
            <span>AGPL-3.0</span>
            <span>·</span>
            <span>Made in Brazil 🇧🇷</span>
          </div>

          {/* Legal */}
          <div className="text-center text-xs text-blue-300 space-y-1">
            <p>
              © 2024–2026 Diego Mendes de Souza, Pedro Augusto de Oliveira
              Morais, Nayara Ferreira Santos
            </p>
            <p className="italic">
              Screening tool — não substitui análise laboratorial
              confirmatória.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
