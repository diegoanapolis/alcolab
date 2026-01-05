# 📱 PWA AlcoLab - Triagem de Soluções Hidroalcoólicas

## 📋 Descrição da Aplicação

**PWA AlcoLab** é uma Progressive Web App (PWA) desenvolvida para triagem de composição de soluções hidroalcoólicas. A aplicação estima a composição de **água**, **etanol** e **metanol** (quando presentes acima de 5% m/m) através de medidas de **viscosidade** e **densidade**.

### Principais Funcionalidades:
- Análise de bebidas destiladas puras ("secas")
- Análise de etanol combustível e comercial
- Análise de metanol reagente
- Análise de soluções hidroalcoólicas customizadas
- Captura de vídeo para estimativa precisa de tempos de escoamento
- Cronômetro integrado para inserção manual
- Histórico de análises com banco de dados local (IndexedDB)
- Exportação de resultados em PDF e CSV
- Interface responsiva otimizada para mobile

### Stack Tecnológica:
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Processamento**: Pyodide (Python no navegador via WebAssembly)
- **Banco de dados**: Dexie.js (IndexedDB)
- **Formulários**: React Hook Form + Zod
- **UI Components**: Radix UI, Lucide Icons

---

## 📁 Estrutura de Pastas

```
C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\
│
├── pwa_integrated\                    # 🔵 VERSÃO DE DESENVOLVIMENTO (com node_modules)
│   ├── src\
│   │   ├── app\                       # Páginas Next.js (App Router)
│   │   │   ├── page.tsx               # Home
│   │   │   ├── medir\page.tsx         # Wizard de medição
│   │   │   ├── resultados\page.tsx    # Página de resultados
│   │   │   ├── metodologia\page.tsx   # Metodologia completa
│   │   │   └── sobre\page.tsx         # Sobre o app
│   │   ├── components\
│   │   │   ├── wizard\                # Steps do wizard (6 etapas)
│   │   │   └── ui\                    # Componentes reutilizáveis
│   │   ├── lib\                       # Utilitários, schemas, banco de dados
│   │   └── hooks\                     # Custom hooks
│   ├── public\
│   │   ├── py\                        # Scripts Python (Pyodide)
│   │   ├── workers\                   # Web Workers
│   │   └── data\                      # Dados de referência (malha ternária)
│   ├── package.json
│   └── next.config.js
│
├── pwa_integrated_backup_20260105_final\   # 🟢 BACKUP COMPLETO (com node_modules)
│   └── (cópia completa do pwa_integrated)
│
└── pwa_deploy_railway\                # 🚀 VERSÃO PARA DEPLOY (sem node_modules)
    ├── src\                           # Código fonte
    ├── public\                        # Assets públicos
    ├── package.json                   # Dependências
    ├── .gitignore                     # Arquivos ignorados pelo Git
    └── (outros arquivos de config)
```

---

## 🚀 Instruções para Deploy no GitHub + Railway

### 1. Preparar Repositório GitHub

```bash
# Navegue até a pasta de deploy
cd "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_deploy_railway"

# Inicialize o repositório Git (se ainda não existir)
git init

# Adicione todos os arquivos
git add .

# Faça o commit inicial
git commit -m "Initial commit - PWA AlcoLab v1.0"

# Adicione o repositório remoto (substitua pelo seu)
git remote add origin https://github.com/SEU_USUARIO/pwa-alcolab.git

# Envie para o GitHub
git push -u origin main
```

### 2. Configurar Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o acesso e selecione o repositório `pwa-alcolab`
5. Railway detectará automaticamente que é um projeto Next.js
6. O deploy será iniciado automaticamente

### 3. Variáveis de Ambiente (Railway)

Não são necessárias variáveis de ambiente obrigatórias. O app funciona completamente no cliente.

### 4. Configurações Opcionais no Railway

- **Build Command**: `npm run build` (detectado automaticamente)
- **Start Command**: `npm run start` (detectado automaticamente)
- **Port**: Railway configura automaticamente

---

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
cd "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated"
npm run dev
# Acesse http://localhost:3000
```

### Build de Produção Local
```bash
npm run build
npm run start
```

### Verificar TypeScript
```bash
npx tsc --noEmit
```

---

## 📱 Fluxo da Aplicação

1. **Home** → Visão geral e acesso às funcionalidades
2. **Medir** → Wizard de 6 etapas:
   - Etapa 1: Selecione solução hidroalcoólica
   - Etapa 2: Informe dados da amostra
   - Etapa 3: Meça massa ou densidade
   - Etapa 4: Meça a temperatura
   - Etapa 5: Registre o escoamento
   - Etapa 6: Revise e calcule
3. **Resultados** → Relatório com composições equivalentes e síntese analítica
4. **Metodologia** → Documentação técnica completa
5. **Sobre** → Informações do aplicativo

---

## ⚠️ Observações Importantes

- A pasta `pwa_deploy_railway` **NÃO contém** `node_modules` - Railway instalará as dependências automaticamente
- O arquivo `.gitignore` já está configurado para excluir arquivos desnecessários
- O processamento Python (Pyodide) é executado no navegador, não no servidor
- A aplicação funciona offline após o primeiro carregamento (PWA)

---

## 📞 Suporte

Em caso de dúvidas sobre o deploy, consulte:
- [Documentação Railway](https://docs.railway.app)
- [Documentação Next.js](https://nextjs.org/docs)

---

**Versão**: 1.0.0  
**Data**: 05/01/2026  
**Status**: Pronto para deploy ✅
