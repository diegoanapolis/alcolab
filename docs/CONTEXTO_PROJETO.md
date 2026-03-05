# AlcoLab — Contexto Completo do Projeto

## 1. O que é o AlcoLab

AlcoLab é uma **Progressive Web App (PWA)** de triagem analítica de soluções hidroalcoólicas. A partir de medidas simples de **massa** (balança) e **tempo de escoamento** (seringa + celular), o app estima a composição ternária **água / etanol / metanol** de uma amostra, comparando-a com o rótulo declarado.

É uma ferramenta de **triagem** — não substitui análises laboratoriais oficiais, mas é capaz de sinalizar contaminação por metanol e incompatibilidades graves usando apenas materiais acessíveis.

---

## 2. Público-alvo e diferenciais

### Quem usa
- **Agentes de fiscalização sanitária** (Vigilância Sanitária, MAPA) — triagem rápida em campo
- **Peritos e policiais** — evidência preliminar em apreensões
- **Vendedores e distribuidores** — verificação de autenticidade de lotes
- **Consumidor final** — qualquer pessoa com acesso a uma seringa e uma balança

### Diferenciais
| Característica | Detalhe |
|---|---|
| **Acessibilidade total** | Requer apenas seringa com agulha, balança (até de cozinha) e celular |
| **Zero infraestrutura** | PWA funciona offline após primeiro acesso; processamento 100% no navegador |
| **Alternativa analítica única** | Não existe outra ferramenta acessível que estime composição ternária água-etanol-metanol fora de laboratório |
| **Processamento Python no browser** | Pipeline científico validado roda via Pyodide (WebAssembly), sem servidor |
| **Análise por vídeo** | Usuário grava escoamento na seringa e marca volumes frame a frame; o app calcula regressão linear |
| **Semáforo de segurança** | Verde/amarelo/vermelho com alertas de metanol e compatibilidade com rótulo |
| **Modo demonstração** | 3 cenários reais (vodka contaminada, whisky contaminado, whisky legítimo) com vídeos hospedados em Cloudflare R2 |
| **Banco local** | IndexedDB (Dexie) armazena histórico de análises no dispositivo, com export/import JSON |
| **Dark mode** | Respeita `prefers-color-scheme` do sistema |

---

## 3. Conceito analítico (resumo)

### Grandezas medidas
1. **Densidade relativa** — razão entre massa da amostra e massa da água (mesmo volume, mesma temperatura), medida por pesagem diferencial com seringa
2. **Viscosidade relativa** — razão entre tempos de escoamento da amostra e da água na mesma seringa (faixa 18 → 14 mL)

### Pipeline de cálculo

**Fluxo 1 — Teor alcoólico inicial (binário água-etanol)**
- A partir da densidade relativa e tabelas de referência (Gay-Lussac, OIML), estima o teor em massa de etanol assumindo mistura binária água-etanol.
- Converte entre unidades: % v/v, °GL, INPM, % m/m.

**Fluxo 2 — Composição ternária (água-etanol-metanol)**
- Combina densidade relativa + viscosidade relativa (corrigida para 20°C) em uma malha 3D pré-calculada que mapeia (densidade, viscosidade) → composições ternárias equivalentes.
- Usa interpolação na malha (`malha_viscosidade_ajuste_bordas_f32.npz`) para encontrar todas as composições que satisfazem simultaneamente a densidade e a viscosidade medidas.
- Compara com a composição esperada pelo rótulo e classifica: compatível, incompatível, ou possível presença de metanol.

### Qualidade do resultado
- CV (coeficiente de variação) das replicatas de tempo
- R² da regressão linear (marcação por vídeo)
- Tolerância de ±3% para compatibilidade com rótulo
- Semáforo integrado (verde/amarelo/vermelho)

---

## 4. Fluxo do usuário (wizard de 6 etapas)

```
[Home] → "Medir" → Wizard 6 steps → [Resultados]
```

### Step 1 — Selecione solução hidroalcoólica (`StepProfile`)
- Escolha do tipo de bebida/solução (vodka, cachaça, whisky, etanol combustível, metanol comercial, outra hidroalcoólica, etc.)
- Botão "Teste com dados de exemplos reais" para modo demonstração
- Botão "Limpar - Nova análise" e "Não se aplica" (lista de categorias excluídas)

### Step 2 — Informe dados da amostra (`StepSampleData`)
- Teor de rótulo (% v/v, °GL, ou INPM)
- Nome da amostra, marca, lote (opcionais)
- Para "Outra hidroalcoólica": campos de % m/m etanol e metanol

### Step 3 — Meça massa ou densidade (`StepDensity`)
- Método "Balança" (preferencial): massa do conjunto vazio (seringa+agulha), com água, com amostra
  - Calcula massas líquidas (bruta − container) e densidade relativa
  - Verificação de precisão da balança (decimal ou inteiro)
  - Alertas de massa negativa, líquido insuficiente, etc.
- Método "Densímetro ou alcôometro": entrada direta de valor e unidade

### Step 4 — Temperatura (`StepWaterTemp`)
- Tipo de água (mineral sem gás, potável, deionizada)
- Temperatura da água e da amostra (20–30°C, diferença máx. 2°C)

### Step 5 — Registre o escoamento (`StepTimes`)
- **Via vídeo**: upload de vídeo do escoamento → player com timeline, zoom, marcação de volumes (18, 17, 16, 15, 14 mL) frame a frame → regressão linear → Δt estimado
- **Via inserção manual**: digitação direta do tempo de escoamento (18→14 mL)
- Replicatas: mínimo 2 para água e 2 para amostra (duplicata)
- Cards de replicata com R², Δt, CV entre replicatas

### Step 6 — Revise e calcule (`StepReviewCalculate`)
- Resumo de todos os dados inseridos
- Botão "Calcular" dispara o pipeline Python via Web Worker

### Tela de resultados (`/resultados`)
- Semáforo (verde/amarelo/vermelho) com texto conclusivo
- Aba "Resultados": composição equivalente, síntese analítica (viscosidades, teores, erro da malha)
- Aba "Dados experimentais": massas, tempos, CV, R², dados de referência
- Histórico de análises (lista de experimentos salvos em IndexedDB)
- Export JSON do banco de dados

---

## 5. Modo demonstração

3 cenários com dados reais pré-preenchidos + vídeos hospedados no Cloudflare R2:

| # | Cenário | Composição real | Massa água bruta | Massa amostra bruta | Δt amostra (vídeos) |
|---|---|---|---|---|---|
| 1 | Vodka 40% v/v contaminada | 16.6% etanol + 16.6% metanol | 30.3 g | 29.3 g | ~214.8 / ~219.2 s |
| 2 | Whisky 40% v/v contaminado | 16.6% etanol + 16.6% metanol | 30.5 g | 29.5 g | ~216.8 / ~223.5 s |
| 3 | Whisky 40% v/v não contaminado | ~33% etanol (legítimo) | 30.4 g | 29.4 g | ~264.5 / ~263.6 s |

Água (comum a todos): Δt ~103.9 / ~104.9 s

Vídeos no R2: `https://pub-ebe8be4f7ca3479c8147d4d9117bcc6f.r2.dev/` (8 vídeos, ~480 MB total)

Massa do container (seringa+agulha): 10.6 g para todos.

---

## 6. Stack tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript + Tailwind CSS |
| Validação | Zod + React Hook Form |
| Ícones | Lucide React |
| Banco local | Dexie (IndexedDB) |
| PDF | jsPDF |
| Processamento científico | Python (Pyodide 0.26.2 via WebAssembly) |
| Bibliotecas Python | NumPy, SciPy |
| Hospedagem de vídeos | Cloudflare R2 (free tier) |
| Deploy | Railway (ou qualquer host Node.js estático) |
| Dark mode | CSS `prefers-color-scheme` nativo |

---

## 7. Estrutura de código

### Raiz do projeto
```
pwa_integrated/
├── public/                          # Arquivos estáticos
│   ├── data/                        # Dados de referência
│   │   ├── fluxo1/                  # Tabelas Fluxo 1 (densidades, conversão °GL)
│   │   ├── fluxo2/                  # Malhas Fluxo 2 (.npz) + referência temperatura
│   │   ├── conversao_vv_para_wE_20C.json
│   │   └── temperatura_referencia_v2.json
│   ├── py/                          # Pipeline Python (roda via Pyodide)
│   │   ├── worker_entry.py          # Ponto de entrada: orquestra Fluxo 1 + Fluxo 2
│   │   ├── utils_nopandas.py        # Leitura de CSV sem pandas
│   │   ├── fluxo1_w_alcool/src/
│   │   │   └── app_w_alcool_v2.py   # Fluxo 1: densidade → teor alcoólico (567 linhas)
│   │   └── fluxo2_analise_ternaria/
│   │       ├── processamento.py     # Fluxo 2: viscosidade + malha → ternária (1573 linhas)
│   │       └── main.py              # CLI alternativo do Fluxo 2 (168 linhas)
│   └── worker/
│       └── alcoolWorkerPyodide.js   # Web Worker: carrega Pyodide, injeta scripts, executa pipeline (163 linhas)
├── src/
│   ├── app/                         # Páginas Next.js (App Router)
│   │   ├── page.tsx                 # Home — apresentação, botões nav, botão demo (150 linhas)
│   │   ├── layout.tsx               # Layout raiz (providers, TopBar, BottomTabs, TermsGate)
│   │   ├── globals.css              # Estilos globais + dark mode overrides
│   │   ├── medir/page.tsx           # Orquestrador do wizard de 6 steps (609 linhas)
│   │   ├── resultados/page.tsx      # Exibição de resultados + semáforo + histórico (1306 linhas)
│   │   ├── metodologia/page.tsx     # Página de metodologia
│   │   └── sobre/page.tsx           # Página sobre
│   ├── components/
│   │   ├── wizard/                  # Steps do wizard de medição
│   │   │   ├── StepProfile.tsx      # Step 1: tipo de bebida (212 linhas)
│   │   │   ├── StepSampleData.tsx   # Step 2: dados da amostra/rótulo (265 linhas)
│   │   │   ├── StepDensity.tsx      # Step 3: massas ou densímetro (708 linhas)
│   │   │   ├── StepWaterTemp.tsx    # Step 4: tipo de água + temperaturas (278 linhas)
│   │   │   ├── StepTimes.tsx        # Step 5: vídeos/tempos de escoamento (732 linhas)
│   │   │   ├── StepReviewCalculate.tsx # Step 6: revisão + botão calcular (152 linhas)
│   │   │   └── NavigationButtons.tsx   # Botões Voltar/Avançar reutilizáveis
│   │   ├── ui/                      # Componentes de interface
│   │   │   ├── BottomTabs.tsx       # Navegação inferior (tabs)
│   │   │   ├── TopBar.tsx           # Barra superior (título)
│   │   │   ├── ClientLayout.tsx     # Layout client-side (SplashScreen, TermsGate)
│   │   │   ├── SplashScreen.tsx     # Splash de loading inicial
│   │   │   ├── TermsGate.tsx        # Aceite de termos de uso
│   │   │   ├── CalculatingOverlay.tsx # Overlay "Calculando..." durante processamento
│   │   │   ├── InfoTooltip.tsx      # Tooltips inline e com ícone (?)
│   │   │   ├── MethodologyModal.tsx # Modal de metodologia contextual por step
│   │   │   ├── DemoModal.tsx        # Modal de seleção de cenário demo
│   │   │   ├── DemoBanner.tsx       # Banner azul "Modo demonstração" nos steps
│   │   │   └── WorkerPreload.tsx    # Pré-carregamento do Web Worker Pyodide
│   │   ├── AnalysisListPage.tsx     # Lista de análises anteriores (IndexedDB)
│   │   └── MultiSelectDropdown.tsx  # Dropdown multi-select reutilizável
│   ├── hooks/
│   │   ├── useSwipe.ts              # Hook de swipe left/right para navegação
│   │   └── useStopwatch.ts          # Hook de cronômetro (não usado atualmente)
│   └── lib/                         # Lógica de negócio e utilitários
│       ├── alcoolWorkerClient.ts    # Cliente TypeScript do Web Worker (init, run, status) (122 linhas)
│       ├── backendMapping.ts        # Normalização de campos wizard → pipeline Python (68 linhas)
│       ├── constants.ts             # Lista de tipos de bebida (17 linhas)
│       ├── database.ts             # Dexie/IndexedDB: schema, CRUD, export/import JSON (445 linhas)
│       ├── demoScenarios.ts         # 3 cenários demo com dados + URLs R2 (259 linhas)
│       ├── methodologyContent.tsx   # Conteúdo textual dos modais de metodologia
│       ├── schemas.ts               # Schemas Zod para validação dos steps (53 linhas)
│       └── semaphoreLogic.ts        # Lógica do semáforo (pode estar inline em resultados)
├── package.json                     # Dependências (next, react, dexie, jspdf, pyodide via CDN)
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 8. Fluxo de dados detalhado

```
[Wizard Steps 1-5]
    │
    ▼ (localStorage: wizardData, videoReplicas*, manualTimes*)
[StepReviewCalculate] → monta frontend_export_rows (JSON com todos os campos)
    │
    ▼ localStorage.setItem("frontend_export_rows", ...)
[/resultados/page.tsx]
    │
    ▼ lê frontend_export_rows, chama normalizeRow() (backendMapping.ts)
    │
    ▼ runAlcoolPipeline(rows) → alcoolWorkerClient.ts
    │
    ▼ Web Worker (alcoolWorkerPyodide.js)
    │   ├── Carrega Pyodide + NumPy + SciPy (CDN)
    │   ├── Injeta scripts Python no FS virtual
    │   ├── Carrega dados (.csv, .npz) no FS virtual
    │   └── Executa worker_entry.py → run_full_from_rows()
    │       ├── Fluxo 1: density → teor alcoólico (app_w_alcool_v2.py)
    │       └── Fluxo 2: viscosity + malha → composição ternária (processamento.py)
    │
    ▼ Resultado: { resultados: [...], repeticoes: [...] }
    │
    ▼ Mapeamento → ResultShape (condições, densidade, viscosidade, composição, etc.)
    │
    ▼ Salva no IndexedDB (database.ts) + exibe na tela
    │
    ▼ Semáforo: repsOk + cvOk + r2Ok + compatStatus → verde/amarelo/vermelho
```

---

## 9. Arquivos críticos para manutenção

| Prioridade | Arquivo | Responsabilidade |
|---|---|---|
| ★★★ | `resultados/page.tsx` | Toda a lógica de resultado, semáforo, compatStatus, display — arquivo mais complexo (1306 linhas) |
| ★★★ | `processamento.py` | Pipeline Fluxo 2 completo — malha ternária, interpolação, classificação (1573 linhas) |
| ★★★ | `medir/page.tsx` | Orquestrador do wizard — estado, demo mode, cálculo, navegação (609 linhas) |
| ★★☆ | `StepTimes.tsx` | Player de vídeo, marcação frame a frame, regressão, replicatas (732 linhas) |
| ★★☆ | `StepDensity.tsx` | Lógica de massas, precisão de balança, método alternativo (708 linhas) |
| ★★☆ | `app_w_alcool_v2.py` | Pipeline Fluxo 1 — conversões, densidade, teor alcoólico (567 linhas) |
| ★★☆ | `database.ts` | Schema IndexedDB, save/load/export/import (445 linhas) |
| ★☆☆ | `demoScenarios.ts` | Dados dos 3 cenários de demonstração (259 linhas) |
| ★☆☆ | `alcoolWorkerClient.ts` | Interface TypeScript para o Web Worker (122 linhas) |
| ★☆☆ | `alcoolWorkerPyodide.js` | Web Worker: bootstrap Pyodide + execução Python (163 linhas) |

---

## 10. Deploy e repositórios

| Item | Localização |
|---|---|
| **Código local (desenvolvimento)** | `./` |
| **Código para deploy (GitHub/Railway)** | `./\` |
| **Vídeos demo** | Cloudflare R2 bucket `alcolabdemo` (público) |
| **Servidor** | `npm run dev` (local) ou Railway (produção) |

Sincronização: copiar tudo de `pwa_integrated/` para `pwa_deploy_railway/` exceto `.git`, `node_modules`, `.next`. O `.git` do deploy é preservado.

---

## 11. Estado atual e o que já foi feito

### Funcionalidades completas
- ✅ Wizard completo de 6 etapas com validação Zod
- ✅ Player de vídeo com marcação frame a frame e regressão linear
- ✅ Pipeline Python (Fluxo 1 + Fluxo 2) via Pyodide no browser
- ✅ Semáforo de compatibilidade (verde/amarelo/vermelho)
- ✅ Detecção de metanol em bebidas
- ✅ Banco local IndexedDB com histórico e export/import JSON
- ✅ Modo demonstração com 3 cenários reais + vídeos R2
- ✅ Dark mode completo (prefers-color-scheme)
- ✅ Tooltips contextuais e modais de metodologia por step
- ✅ Verificação de precisão de balança
- ✅ Suporte a múltiplos métodos de entrada (balança vs densímetro)
- ✅ Cálculo de CV entre replicatas e R² de regressão
- ✅ Swipe navigation entre steps
- ✅ TermsGate (aceite de termos antes de usar)
- ✅ Splash screen com pré-carregamento do Worker

### Tipos de solução suportados
Vodka, Cachaça branca, Whisky, Aguardente, Rum branco, Gin seco, Tequila blanca, Pisco, Tiquira, Etanol comercial, Etanol combustível, Metanol comercial, Outra hidroalcoólica.

### Limitações declaradas
- Não substitui análise laboratorial oficial
- Limite de detecção de metanol: ≥ 5% m/m
- Bebidas não aplicáveis: licores, cremes, fermentadas, saborizadas, turvas, com polpa
- Precisão dependente da qualidade da balança e da técnica de escoamento
