# CONTEXTUALIZAÇÃO DO PROJETO - PWA Análise de Álcool via Viscosidade

## 📋 VISÃO GERAL

### O que é a aplicação?
Uma **Progressive Web App (PWA)** que analisa a composição de bebidas alcoólicas destiladas através de medidas de viscosidade. A aplicação estima a composição em **água, etanol e metanol**, auxiliando na triagem de bebidas potencialmente adulteradas.

### Propósito
- **Ferramenta preventiva de triagem** para proteção da saúde pública
- Detectar possível presença de metanol em bebidas destiladas
- **NÃO é exame confirmatório** - não substitui análises laboratoriais oficiais

### Tecnologias Principais
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Processamento Python**: Pyodide (Python rodando no navegador via WebAssembly)
- **Análise estatística**: NumPy, SciPy (Monte Carlo, testes estatísticos)

---

## 📁 LOCALIZAÇÃO DO PROJETO

```
C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated
```

---

## 🗂️ ESTRUTURA DE DIRETÓRIOS

```
pwa_integrated/
├── src/
│   ├── app/                          # Páginas da aplicação (App Router do Next.js)
│   │   ├── page.tsx                  # Página inicial (Home)
│   │   ├── layout.tsx                # Layout global
│   │   ├── globals.css               # Estilos globais
│   │   ├── medir/
│   │   │   └── page.tsx              # Página de medição (wizard)
│   │   ├── resultados/
│   │   │   └── page.tsx              # Página de exibição de resultados
│   │   ├── metodologia/
│   │   │   └── page.tsx              # Explicação da metodologia científica
│   │   └── sobre/
│   │       └── page.tsx              # Informações sobre a aplicação
│   │
│   ├── components/                   # Componentes React reutilizáveis
│   │   ├── AnalysisListPage.tsx      # Lista de análises salvas
│   │   ├── MultiSelectDropdown.tsx   # Dropdown de seleção múltipla
│   │   ├── ui/                       # Componentes de UI base (shadcn/ui)
│   │   └── wizard/                   # Componentes do wizard de medição
│   │
│   ├── hooks/                        # React hooks customizados
│   │
│   └── lib/
│       └── alcoolWorkerClient.ts     # Cliente que comunica com o Pyodide Worker
│
├── public/
│   └── py/                           # Código Python executado pelo Pyodide
│       ├── worker_entry.py           # Entry point do Python (importa módulos)
│       ├── utils_nopandas.py         # Utilitários sem dependência do Pandas
│       ├── fluxo1_w_alcool/          # Fluxo 1: Estimativa inicial de teor alcoólico
│       │   └── src/
│       └── fluxo2_analise_ternaria/  # Fluxo 2: Análise completa de composição
│           ├── processamento.py      # ⭐ ARQUIVO PRINCIPAL (~1574 linhas)
│           ├── main.py
│           └── processamento_v8_original.py  # Backup da versão original
│
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🖥️ TELAS DA APLICAÇÃO

### 1. **Home** (`/`)
- Apresentação da ferramenta
- Avisos importantes sobre uso (não é exame confirmatório)
- Menu de navegação com 4 opções: Medir, Resultados, Metodologia, Sobre

### 2. **Medir** (`/medir`)
- **Wizard de medição em etapas**:
  1. Seleção do tipo de bebida (Whisky, Vodka, Cachaça, etc.)
  2. Informação do teor alcoólico declarado no rótulo
  3. Instruções para medição de viscosidade
  4. Entrada dos valores medidos (tempo de escoamento)
  5. Processamento e cálculo

- **Fluxo de dados**:
  - Usuário informa: tipo de bebida + teor declarado + medidas de viscosidade
  - Sistema processa via Pyodide (Python no navegador)
  - Resultados são salvos no localStorage e redirecionados para `/resultados`

### 3. **Resultados** (`/resultados`)
- **Exibe análise completa**:
  - Classificação da composição (binária água-etanol ou ternária água-etanol-metanol)
  - Composição estimada com intervalos de confiança
  - Probabilidades de cada hipótese (Monte Carlo)
  - **Composição compatível**: verifica se resultado é compatível com rótulo declarado
  - Alertas visuais (vermelho para suspeita de metanol, verde para normal)

- **Lista de análises anteriores** (salvas no localStorage)

### 4. **Metodologia** (`/metodologia`)
- Explicação científica do método
- Princípios da análise por viscosidade
- Limitações e considerações

### 5. **Sobre** (`/sobre`)
- Informações sobre a aplicação
- Créditos e versão

---

## ⚙️ FLUXO DE PROCESSAMENTO

### Fluxo 1: Estimativa Inicial (w_alcool)
- Entrada: medidas de viscosidade + temperatura
- Saída: estimativa inicial do teor alcoólico total

### Fluxo 2: Análise Ternária Completa
- **Entrada**: 
  - `mu_mean`: viscosidade média medida
  - `mu_sd`: desvio padrão das medidas
  - `w_input`: teor alcoólico declarado no rótulo
  - `temperature`: temperatura da medição

- **Processamento** (`processamento.py`):
  1. Carrega malha de viscosidade pré-calculada
  2. Encontra melhor composição na malha (w_best, z_best)
  3. Classifica: binário (água-etanol) ou ternário (água-etanol-metanol)
  4. Executa Monte Carlo para calcular probabilidades
  5. Aplica testes estatísticos
  6. Define range de busca: ±2.5% absoluto centrado em w_best

- **Saída** (JSON):
  ```json
  {
    "classe_final": "ternario" | "bin_etoh" | "bin_meoh",
    "melhor": {
      "w_alcool": 0.40,
      "z_etoh": 0.85,
      "comp_agua": 0.60,
      "comp_etoh": 0.34,
      "comp_meoh": 0.06
    },
    "melhores": [...],  // Lista de composições compatíveis no range
    "prob_ternario": 0.75,
    "prob_etoh": 0.20,
    "prob_meoh": 0.05,
    ...
  }
  ```

---

## 🔧 ARQUIVOS-CHAVE PARA MODIFICAÇÕES

### Frontend (Layout/UX)
| Arquivo | Descrição |
|---------|-----------|
| `src/app/page.tsx` | Página inicial |
| `src/app/medir/page.tsx` | Wizard de medição |
| `src/app/resultados/page.tsx` | Exibição de resultados |
| `src/app/globals.css` | Estilos globais |
| `src/components/wizard/` | Componentes do wizard |

### Backend (Processamento Python)
| Arquivo | Descrição |
|---------|-----------|
| `public/py/fluxo2_analise_ternaria/processamento.py` | Lógica principal de análise |
| `public/py/worker_entry.py` | Entry point que importa os módulos |
| `src/lib/alcoolWorkerClient.ts` | Cliente TypeScript que comunica com Pyodide |

---

## 🚀 COMO EXECUTAR

```bash
# Navegar até o diretório do projeto
cd C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated

# Instalar dependências (se necessário)
npm install

# Executar em modo desenvolvimento
npm run dev

# Acessar no navegador
http://localhost:3000
```

---

## 🛠️ CORREÇÕES RECENTES APLICADAS

### Sessão Atual - Bugs de Sintaxe Python

**Bug 1: Variáveis com nomes inválidos**
- **Problema**: Substituição global corrompeu `gatilho_31` → `gatilho_2.51`
- **Correção**: Restaurado para `gatilho_31`, `gatilho_32`
- **Arquivo**: `public/py/fluxo2_analise_ternaria/processamento.py` linhas 1212-1217

**Bug 2: Formato de número inválido**
- **Problema**: `:.2.5f` (formato Python inválido)
- **Correção**: Alterado para `:.5f`
- **Arquivo**: `processamento.py` múltiplas linhas

### Sessão Atual - Lógica do Semáforo (Frontend)

**Bug 3: Composição compatível não sendo detectada**
- **Problema**: Função `parseCompositionLine` não parseava todos os formatos de composição
- **Correção**: Adicionados múltiplos padrões de regex para aceitar formatos variados
- **Arquivo**: `src/app/resultados/page.tsx` função `parseCompositionLine`

**Bug 4: Split de composições equivalentes não funcionando**
- **Problema**: Função `pickCompatibleLine` não separava corretamente composições separadas por ". "
- **Correção**: Implementado split mais robusto usando normalização de string
- **Arquivo**: `src/app/resultados/page.tsx` função `pickCompatibleLine`

**Bug 5: Inconsistência entre valor do Python e cálculo do frontend**
- **Problema**: Exibição usava `result?.compativel ?? compatStatus`, dando prioridade ao Python
- **Correção**: Alterado para usar sempre `compatStatus` calculado pelo frontend
- **Arquivo**: `src/app/resultados/page.tsx` linha de "Rótulo e resultados (±3%)"

### Regras do Semáforo Já Implementadas

1. **Metanol comercial**: Tratado separadamente, sem alerta de "Possível presença de metanol"
2. **Outra hidroalcoólica com metanol > 0**: Quando o usuário informa metanol esperado, não mostra alerta
3. **Bebidas normais**: 
   - Verde se `compatStatus === "Compatível"` e experimento aprovado
   - Vermelho "Possível presença de metanol" se incomp. + metanol alto + aprovado
   - Vermelho "Incompatível com rótulo" se incomp. + aprovado (sem metanol alto)
   - Amarelo se experimento não aprovado

---

## 🎨 SUGESTÕES PARA AJUSTES DE LAYOUT/UX

1. **Página de Resultados**: 
   - Cards de composição podem ser mais visuais
   - Gráficos de barras para composição
   - Indicadores de alerta mais proeminentes

2. **Wizard de Medição**:
   - Progress bar visual
   - Animações de transição entre etapas
   - Validação em tempo real

3. **Responsividade**:
   - Verificar comportamento em diferentes tamanhos de tela
   - PWA: testar instalação no mobile

4. **Acessibilidade**:
   - Verificar contraste de cores
   - Labels em inputs
   - Navegação por teclado

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

```json
{
  "next": "14.2.x",
  "react": "18.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "lucide-react": "ícones",
  "pyodide": "0.29.0 (via CDN)"
}
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Cache do Pyodide**: O Pyodide faz cache agressivo dos arquivos Python no IndexedDB. Se modificar arquivos `.py`, pode ser necessário:
   - Limpar IndexedDB do navegador
   - Deletar pasta `.next` e reiniciar servidor
   - Usar modo anônimo para testar

2. **Arquivos Python**: Estão em `public/py/` e são servidos estaticamente pelo Next.js

3. **LocalStorage**: Análises são salvas no localStorage do navegador com a chave de armazenamento específica

4. **PWA**: A aplicação é instalável como PWA - verificar service worker e manifest

---

*Documentação gerada em 05/01/2026*
