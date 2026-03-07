# Etapa 3 — Seletor de Idioma PT/EN — STATUS: ✅ CONCLUÍDA

## Arquitetura implementada

### Sistema i18n
- **`src/lib/i18n.tsx`** — React Context + Provider + hooks
  - `LanguageProvider` — wrapper com detecção de idioma do navegador
  - `useI18n()` — retorna `{ lang, setLang, t }`
  - `useT()` — retorna só a função `t()` (atalho)
  - `useLang()` — retorna só o idioma atual
  - Persistência em `localStorage` (`alcolab_lang`)
  - Default: detecta idioma do navegador (pt → PT, outros → EN)

- **`src/lib/translations.ts`** — Dicionário EN→PT com ~320 strings
  - Organizado por seção: Navigation, Home, Terms, Wizard Steps, Results, About, etc.
  - Chave = string em inglês (usada no código)
  - Valor = tradução em português

### Toggle de idioma
- **TopBar**: Botão com ícone Globe + sigla (PT/EN) no canto direito
  - Clique alterna entre PT↔EN
  - Também disponível no drawer/menu lateral com bandeira

### Componentes atualizados com `useT()`
- [x] `ClientLayout.tsx` — envolvido com `<LanguageProvider>`
- [x] `TopBar.tsx` — toggle + labels traduzidos
- [x] `BottomTabs.tsx` — labels traduzidos
- [x] `CalculatingOverlay.tsx` — texto de loading
- [x] `DemoBanner.tsx` — prefixo + texto do banner
- [x] `DemoModal.tsx` — título, descrição, cenários, botão
- [x] `NavigationButtons.tsx` — aria-labels
- [x] `TermsGate.tsx` — título e botões
- [x] `MethodologyModal.tsx` — botões Methodology/Back
- [x] `app/page.tsx` — Home: título, subtítulo, botões, alerta
- [x] `about/page.tsx` — título, seções, botões
- [x] `StepProfile.tsx` — título, botões, modal não se aplica
- [x] `StepSampleData.tsx` — título, labels formulário
- [x] `StepDensity.tsx` — título, abas, campos, botões Sim/Não
- [x] `StepWaterTemp.tsx` — título, abas termômetro, labels
- [x] `StepTimes.tsx` — título, cronômetro, botões
- [x] `StepReviewCalculate.tsx` — título, seções revisão, botão Calcular
- [x] `results/page.tsx` — abas, labels, botão Nova análise
- [x] `AnalysisListPage.tsx` — título, botões export/import/delete

## Como funciona
1. Usuário abre o app → detecta idioma do navegador
2. Se PT → interface em português; se outro → inglês
3. Botão Globe no TopBar permite alternar a qualquer momento
4. Preferência salva em localStorage para próxima visita
5. Strings passam por `t("English text")` → retorna PT se lang=pt, EN se lang=en
