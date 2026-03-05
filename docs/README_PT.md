# AlcoLab

**PWA open-source para triagem acessível de metanol em soluções hidroalcoólicas utilizando medições de densidade e viscosidade com uma seringa comercial.**

Bebidas alcoólicas contaminadas por metanol matam centenas de pessoas todos os anos ao redor do mundo. Além disso, a detecção prática permanece quase totalmente restrita a equipamentos laboratoriais caros, pouco disponíveis.

O AlcoLab é um Progressive Web App gratuito e open-source desenvolvido para ajudar a reduzir essa lacuna e contribuir para a saúde pública — estimando a composição ternária (água / etanol / metanol) de amostras hidroalcoólicas a partir de medições simples de massa e tempo de escoamento, utilizando apenas uma seringa, uma balança doméstica (precisão de 0,1 g) e um smartphone — sendo aplicável também à triagem de adulteração de etanol combustível.

O aplicativo funciona totalmente offline após o carregamento inicial. Nenhum dado é transmitido a servidores externos — e versões futuras só o farão mediante consentimento explícito do usuário, para viabilizar funcionalidades como mapeamento de risco epidemiológico e integração com sistemas de vigilância em saúde.

---

## Contexto

O envenenamento por metanol decorrente de bebidas alcoólicas adulteradas é uma emergência de saúde pública global persistente e frequentemente negligenciada. Diferentemente do etanol, o metanol é altamente tóxico: a ingestão de apenas 30 mL pode ser fatal, enquanto quantidades menores podem causar cegueira irreversível.

Alertas epidemiológicos recentes reforçam a urgência de ferramentas acessíveis de triagem. Em outubro de 2025, a Organização Pan-Americana da Saúde (OPAS/OMS) relatou que ao menos cinco países das Américas registraram casos e mortes por envenenamento por metanol nos últimos cinco anos, incluindo um surto relevante no Brasil com mais de 200 casos suspeitos e pelo menos 16 óbitos confirmados. Até o final de 2025, o UK Foreign Office ampliou seu alerta de viagem para envenenamento por metanol para 28 países, incluindo destinos turísticos populares no Sudeste Asiático, América Latina e África.

Apesar da magnitude do problema, a detecção prática permanece majoritariamente restrita ao ambiente laboratorial. Técnicas analíticas seletivas — principalmente variações da cromatografia gasosa (GC-FID, GC-MS) — exigem instrumentação dispendiosa, indisponível para a maioria dos agentes de fiscalização de campo e inexistente em muitas regiões de risco. Alternativas portáteis como a espectroscopia Raman apresentam potencial, mas permanecem financeiramente proibitivas, frequentemente custando dezenas ou centenas de milhares de dólares. Outras soluções propostas dependem do uso de reagentes tóxicos, substâncias de difícil obtenção ou dispositivos laboratoriais que exigem treinamento especializado.

O AlcoLab preenche essa lacuna por meio de uma abordagem radicalmente acessível: viabiliza um exame semiquantitativo da composição hidroalcoólica ternária (água / etanol / metanol) utilizando apenas:

- uma seringa comercial
- uma balança doméstica (precisão de 0,1 g)
- um smartphone executando o PWA AlcoLab

Ao transformar medições físicas simples em informações analíticas, o AlcoLab expande a triagem de metanol para além dos laboratórios, atendendo agentes de vigilância sanitária, profissionais de saúde, investigadores forenses, distribuidores e até consumidores finais — contribuindo tanto para a fiscalização quanto para a proteção da saúde pública mundial.

O AlcoLab é uma iniciativa open-source e sem fins lucrativos, mantida como contribuição voluntária de seus autores à saúde pública global.

---

## Como funciona

1. **Experimento** — O app instrui o usuário a realizar duas medições para a amostra e para água (padrão de referência):
   - *Densidade relativa* — razão entre a massa da amostra e a massa da água (mesmo volume, mesma temperatura), obtida por pesagem diferencial com seringa.
   - *Viscosidade relativa* — razão entre os tempos de escoamento da amostra e da água na mesma seringa (faixa de 18 a 14 mL).

2. **Estimativa do teor alcoólico** — A partir da densidade relativa e de tabelas de referência (Gay-Lussac, OIML), o app estima o teor em massa de álcool total — independentemente de ser etanol e/ou metanol, já que ambos possuem densidades muito próximas. Conversões entre unidades (% v/v, °GL, INPM, % m/m) são realizadas automaticamente.

3. **Triagem da composição ternária** — Combina densidade relativa e viscosidade relativa (corrigida para 20 °C) em uma malha 3D de referência pré-calculada, localizando as composições (substância pura, binárias e/ou ternárias) cuja densidade e viscosidade mais se aproximam dos valores obtidos pelo usuário.

4. **Avaliação estatística** — O app avalia a incerteza experimental das medições, comparando a composição identificada no passo anterior com composições de resultados próximos por meio de teste Z de comparação de médias e simulação probabilística de Monte Carlo. O objetivo é incluir composições estatisticamente equivalentes e/ou probabilisticamente prováveis.

5. **Relatório de resultados** — As composições equivalentes e prováveis são comparadas com o rótulo declarado. O app organiza medidas experimentais e resultados em um relatório e exibe um indicador imediato de segurança em formato de semáforo (verde / amarelo / vermelho). Quando há probabilidade de presença de metanol, o semáforo assume cor vermelha.

---

## Modo demonstração

Para facilitar a compreensão do fluxo analítico antes do uso real, os autores disponibilizaram três cenários de demonstração integrados ao próprio app, com valores reais de massa e vídeos de escoamento:

| Cenário | Composição real |
|---|---|
| Vodka 40% v/v contaminada | 16,6% etanol + 16,6% metanol |
| Whisky 40% v/v contaminado | 16,6% etanol + 16,6% metanol |
| Whisky 40% v/v não contaminado | ~33% etanol (legítimo) |

Para utilizar, basta acessar "Teste com dados de exemplos reais" na tela inicial e seguir o fluxo analítico indicado — o mesmo percurso que o usuário percorrerá em uma análise real.

---

## Principais funcionalidades

- Estimativa da composição ternária (água / etanol / metanol)
- Indicador de segurança em semáforo (verde / amarelo / vermelho)
- Cronometragem de escoamento por vídeo com marcação quadro a quadro e regressão linear
- Gerenciamento de replicatas com métricas de qualidade (CV e R²)
- Banco de dados local (IndexedDB) com histórico de análises e exportação JSON
- Modo demonstração com 3 cenários reais (amostras contaminadas e legítima)
- Funciona offline (PWA)
- Suporte a modo escuro
- Custo zero — requer apenas seringa, balança doméstica e celular

---

## Usuários-alvo

- **Agentes e fiscais de vigilância sanitária** — triagem rápida em campo durante fiscalizações e apreensões, auxiliando no encaminhamento mais assertivo de amostras aos laboratórios oficiais, cuja capacidade analítica é limitada
- **Profissionais de saúde** — triagem preliminar da bebida suspeita em contextos de atendimento a pacientes com sintomas compatíveis com intoxicação por metanol, quando houver acesso à amostra, subsidiando decisões clínicas tempestivas enquanto resultados confirmatórios não estão disponíveis
- **Investigadores e peritos** — evidência preliminar em apreensões e investigações
- **Distribuidores e varejistas** — verificação de triagem em lotes ou unidades suspeitas
- **Consumidores** — qualquer pessoa, em qualquer país, com acesso aos materiais básicos, desde que siga rigorosamente a metodologia indicada no próprio app

---

## Stack tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, TypeScript, Tailwind CSS |
| Validação | Zod + React Hook Form |
| Armazenamento local | Dexie (IndexedDB) |
| Processamento científico | Python via Pyodide (WebAssembly) |
| Bibliotecas Python | NumPy, SciPy |
| Deploy | Railway |

---

## Execução local

```bash
git clone https://github.com/diegoanapolis/alcolab.git
cd alcolab
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O runtime Pyodide é baixado via CDN no primeiro carregamento.

---

## Amostras aplicáveis

Destilados puros (vodka, cachaça, whisky, rum, gin, tequila, pisco, tiquira), etanol comercial, etanol combustível, metanol comercial e outras soluções hidroalcoólicas compostas por água, etanol e metanol.

**Não aplicável:** licores, bebidas cremosas, fermentadas, saborizadas, turvas ou com polpa.

---

## Limitações

- Ferramenta de triagem — não substitui análise laboratorial oficial
- Limite de detecção de metanol: ≥ 5% em massa
- Precisão dependente da qualidade da balança e da técnica de escoamento
- Interface atualmente disponível apenas em português

---

## Contribuições

Contribuições são bem-vindas. Por favor, abra uma issue para discutir alterações propostas antes de enviar um pull request.

---

## Licença

Este projeto é licenciado sob a [GNU Affero General Public License v3.0](LICENSE).

Você pode usar, modificar e distribuir este software nos termos da AGPL-3.0. Se modificar e disponibilizar como serviço em rede, deve disponibilizar o código-fonte modificado.

Para consultas sobre licenciamento comercial, entre em contato pelo e-mail alcolabapp@gmail.com.

---

## Apoie o projeto

O AlcoLab é mantido de forma voluntária e sem fins lucrativos. Para garantir sua continuidade e evolução — incluindo recalibrações, validações externas, construção de base de dados colaborativa para mapeamento de adulterações, e manutenção de infraestrutura — o projeto está aberto a:

- **Financiamento público** — editais de inovação, saúde pública e ciência aberta
- **Parcerias institucionais** — organizações de saúde, universidades e laboratórios de referência
- **Patrocínio corporativo** — empresas do setor de bebidas, segurança alimentar e saúde
- **Doações individuais** — contribuições de qualquer valor via Pix: `alcolabapp@gmail.com`

Para propostas de parceria ou financiamento, entre em contato pelo e-mail alcolabapp@gmail.com.

---

## Autores

- **Diego Mendes de Souza** — Desenvolvimento, experimentos e estatística
- **Pedro Augusto de Oliveira Morais** — Revisão científica, experimentos e estatística
- **Nayara Ferreira Santos** — Auditoria UX, cotitular e gestão administrativa do projeto
