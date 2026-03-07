# Etapa 2 — Tradução PT → EN (exceto metodologia) — STATUS: ✅ CONCLUÍDA

## Resumo
Todos os textos visíveis ao usuário foram traduzidos de PT para EN em todas as páginas do app,
com exceção da metodologia (methodologyContent.tsx e methodology/page.tsx).

## Arquivos traduzidos

### Pages do App
- [x] `src/app/app/page.tsx` — Home do app (título, descrição, botões, alerta metanol)
- [x] `src/app/app/about/page.tsx` — Página Sobre (equipe, apoio, contato, licença)
- [x] `src/app/app/measure/page.tsx` — Wizard de medição (composições, demo mode, cálculos)
- [x] `src/app/app/results/page.tsx` — Resultados (semáforo, síntese, dados exp., CSV export)
- [x] `src/app/app/layout.tsx` — Metadata da seção app
- [x] `src/app/layout.tsx` — Root layout metadata (título, descrição, OpenGraph)

### UI Components
- [x] `src/components/ui/BottomTabs.tsx` — Labels: Measure, Results, Methodology, About
- [x] `src/components/ui/TopBar.tsx` — Menu lateral labels + aria-label
- [x] `src/components/ui/CalculatingOverlay.tsx` — "Calculating your results..."
- [x] `src/components/ui/DemoModal.tsx` — "Select an example", description, Cancel
- [x] `src/components/ui/DemoBanner.tsx` — "Demo mode"
- [x] `src/components/ui/TermsGate.tsx` — Terms of Use completo
- [x] `src/components/ui/InfoTooltip.tsx` — aria-label "Information"
- [x] `src/components/ui/MethodologyModal.tsx` — Botão "Methodology", "Back"
- [x] `src/components/ui/SplashScreen.tsx` — Sem texto PT (apenas "AlcoLab")
- [x] `src/components/ui/ClientLayout.tsx` — Sem texto PT
- [x] `src/components/ui/WorkerPreload.tsx` — Sem texto PT

### Wizard Steps
- [x] `src/components/wizard/StepProfile.tsx` — Tipo de solução, NOT_APPLICABLE
- [x] `src/components/wizard/StepSampleData.tsx` — Dados amostra, labels formulário
- [x] `src/components/wizard/StepDensity.tsx` — Massa/densidade, verificação balança
- [x] `src/components/wizard/StepWaterTemp.tsx` — Temperatura, termômetro tabs
- [x] `src/components/wizard/StepTimes.tsx` — Cronômetro, vídeo, inserção manual
- [x] `src/components/wizard/StepReviewCalculate.tsx` — Revisão, labels
- [x] `src/components/wizard/NavigationButtons.tsx` — aria-labels Back/Next

### Lib
- [x] `src/lib/constants.ts` — Tipos de bebida traduzidos
- [x] `src/lib/demoScenarios.ts` — Labels, descrições, banners
- [x] `src/lib/schemas.ts` — Mensagens validação Zod, unidades
- [x] `src/lib/semaphoreLogic.ts` — Textos do semáforo
- [x] `src/lib/backendMapping.ts` — Default "Other hydroalcoholic"
- [x] `src/lib/database.ts` — Error messages, class names
- [x] `src/lib/alcoolWorkerClient.ts` — "results"

### Outros
- [x] `src/components/AnalysisListPage.tsx` — Lista análises, semáforo, import/export
- [x] `src/components/MultiSelectDropdown.tsx` — "Clear selection"
- [x] `public/workers/calcWorker.js` — Error messages
- [x] `public/py/*.py` — Tipos de bebida nos scripts Python

## Correções de Integridade Realizadas
- ✅ Corrupção data→date (variáveis do wizard) — corrigida em todos os arquivos
- ✅ Corrupção /data/ → /date/ (paths de fetch) — corrigida em 3 arquivos
- ✅ Corrupção Database → Datebase — corrigida em imports e classes
- ✅ Unidades atualizadas consistentemente (g/mL or g/cm³, % v/v or °GL, etc.)

## EXCLUÍDOS (NÃO TRADUZIDOS — conforme planejado)
- `src/app/app/methodology/page.tsx` — Será traduzido na Etapa 4
- `src/lib/methodologyContent.tsx` — Será traduzido na Etapa 4

## Notas
- Nomes próprios mantidos (Cachaça, Aguardente, Tiquira, Pisco — termos regionais)
- Comentários em PT: maioria mantida (não afeta UX), alguns traduzidos
- Caracteres especiais (·, —, °, ±, ³, ²) preservados corretamente
