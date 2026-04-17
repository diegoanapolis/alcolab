---
title: 'Densidade e viscosidade: como AlcoLab detecta metanol'
authors:
  - Diego Mendes de Souza
  - Pedro Augusto de Oliveira Morais
  - Nayara Ferreira Santos keywords: null
  - metanol
  - adulteração de bebidas
  - viscosidade
  - densidade
  - triagem analítica
  - Monte Carlo
  - saúde pública
  - open source date: 2026-04-15T00:00:00.000Z
description: >-
  A ciência por trás do AlcoLab: densidade e viscosidade revelam metanol.
  Tecnologia científica que detecta contaminação com precisão próxima 100%.
date: '2026-04-08'
author: Diego Mendes de Souza
category: Tecnologia
locale: pt-BR
published: true
status: publicado
image: /images/blog/ciencia-alcolab-densidade-viscosidade.png
imageAlt: >-
  Diagrama científico mostrando como densidade e viscosidade relativas são
  usadas para detectar metanol em bebidas
tags:
  - densidade
  - viscosidade
  - metanol
  - detecção química
  - análise de bebidas
  - saúde pública
focusKeyword: densidade viscosidade metanol
translationSlug: science-behind-alcolab-density-viscosity-methanol-detection
---
AlcoLab: triagem gratuita de metanol em bebidas — blog técnico

Este post resume, em formato direto, a base científica e técnica do **AlcoLab**, uma ferramenta web gratuita e *open source* de triagem de metanol em bebidas alcoólicas. É dirigido a pesquisadores, fiscais, profissionais de saúde pública e potenciais parceiros institucionais.

---

## 1. Metanol como problema de saúde pública contemporâneo

O metanol (CH₃OH) é o álcool alifático mais simples e compartilha com o etanol (CH₃CH₂OH) propriedades macroscópicas muito próximas — miscibilidade total com água, pontos de ebulição próximos e, sobretudo, **densidades praticamente coincidentes a 20 °C** ($\\rho\_{\\text{MeOH}}/\\rho\_{\\text{H}*2\\text{O}} \\approx 0{,}791$ vs. $\\rho*{\\text{EtOH}}/\\rho\_{\\text{H}\_2\\text{O}} \\approx 0{,}789$). O consumidor não distingue uma bebida adulterada pelo gosto, pelo cheiro ou pela aparência — e essa similaridade é a raiz do problema de saúde pública. O diferencial, no entanto, é toxicológico: metabolizado pela álcool desidrogenase a formaldeído e depois a ácido fórmico, o metanol causa acidose metabólica e lesão irreversível do nervo óptico e dos núcleos putaminais \[1–3\].

**Principais dados:**

- **Dose potencialmente letal** em adulto: \~30 mL de metanol puro; \~10 mL já podem causar cegueira permanente \[4, 5\].
- **Concentrações sanguíneas letais**: 118–257 mg/dL; mortalidade de até 50 % em hospitais com diagnóstico limitado \[6, 7\].
- **Latência clínica** típica: 12–24 h, seguida de acidose, alterações visuais ("visão em nevada"), convulsões e coma.
- **Alerta OPAS/OMS (out. 2025)**: envenenamentos em pelo menos cinco países das Américas, com mais de 200 casos suspeitos no Brasil por bebidas destiladas adulteradas \[8\].
- **Tratamento**: inibidores competitivos da ADH — etanol terapêutico ou, preferencialmente, fomepizol (ataque 15 mg/kg; manutenção 10 mg/kg a cada 12 h) \[9–11\].
- **Agravantes na América Latina**: fomepizol é **caro e de baixa disponibilidade** \[11, 12\]; confirmação analítica por GC-FID / GC-MS é restrita a laboratórios oficiais, com tempos de resposta de horas a dias.

A conclusão prática é que o ganho clínico e epidemiológico mais alto não vem de tratar melhor quem já se intoxicou, e sim de **impedir que a bebida adulterada chegue ao consumidor**. Isso exige ferramentas de triagem rápidas, baratas e disponíveis em campo.

---

## 2. O estado atual de identificação e quantificação de metanol

As técnicas analíticas disponíveis podem ser agrupadas em três níveis de complexidade e custo (Tabela 1).

**Tabela 1. Ferramentas analíticas para quantificação e/ou identificação de metanol em bebidas.**

| Categoria | Método | LQ típico | Tempo | Custo unitário (USD) | Custo de investimento (USD) | Campo |
| --- | --- | --- | --- | --- | --- | --- |
| Confirmatório (quanti) | HS-GC-FID | 1–5 mg/L | 15–60 min | 20–60 | 30 000–80 000 | Laboratório oficial |
| Confirmatório (quali) | HS-GC-MS | 0,1–1 mg/L | 15–60 min | 30–80 | 100 000–250 000 | Laboratório oficial |
| Espectroscópico portátil | NIR / FTIR-ATR / Raman portátil | 0,5–5 % m/m | 1–5 min | 5–20 | 15 000–60 000 | Campo (limitado) |
| Instrumento portátil | Sensor quimiorresistivo + coluna | 10–1 000 ppm no ar exalado \[13\] | 2 min | 100 por teste + equipamento | 5 000–15 000 | Emergência clínica |
| Triagem de baixíssimo custo | Colorimetria com permanganato/ácido cromotrópico | 1–5 % m/m | 5–15 min | &lt; 1 | &lt; 50 (reagentes e vidraria) | Fiscalização |
| Triagem de baixíssimo custo | **AlcoLab (densidade + viscosidade em seringa)** | **\~5 % m/m** | **10–15 min** | **&lt; 0,50** | **&lt; 30 (seringa, balança, termômetro)** | **Fiscalização / usuário final** |

No primeiro extremo, a cromatografia é o padrão-ouro, com precisão e exatidão suficientes para subsidiar autuação administrativa e judicial. No extremo oposto, reações colorimétricas (oxidação do metanol a formaldeído e detecção por ácido cromotrópico ou reagente de Schiff) são baratas e simples, mas sofrem de interferências em matrizes complexas (cachaças envelhecidas em madeira, licores com pigmentos, destilados com congêneres naturais). Em posição intermediária, detectores portáteis de metanol no ar exalado — que já atingem $R^2 = 0{,}966$ contra espectrometria de massas — são excelentes para triar vítimas já expostas, mas **não detectam a contaminação na bebida antes do consumo** \[13\].

Há, portanto, uma lacuna clara: **uma ferramenta que o usuário final, o fiscal ou o profissional de saúde pública possa usar em campo, sem reagentes, usando apenas utensílios domésticos, para triar a amostra antes que ela seja ingerida**. É nessa lacuna que o AlcoLab se insere.

---

## 3. Densidade: forte para quantificar álcool, insuficiente para discriminar metanol

### 3.1 Por que a densidade funciona tão bem para soluções hidroalcoólicas

A densidade de uma mistura líquida depende do volume molar dos seus componentes e das interações moleculares entre eles. Para o sistema binário água-etanol, a dependência da densidade com o teor alcoólico é **monotônica e suave** entre 0 e 100 % de etanol e varia pouco com a temperatura na faixa usual de trabalho (20–30 °C). Essa robustez explica por que a densitometria é o método universal de quantificação de etanol em bebidas há mais de um século \[14–16\].

As compilações de referência seguem três linhagens: (i) metrológica europeia — tabelas de Osborne, McKelvy e Bearce (1913), adotadas pela OIML na recomendação OIML R 22 (*International Alcoholometric Tables*); (ii) compêndios AOAC International e farmacopeias nacionais (USP, Farm. Bras., EP), ajustados a ±0,01 °GL para fins regulatórios; (iii) modelos preditivos calibrados com densímetros de tubo em U oscilante (Anton Paar DMA 4500/5000/5001), em que desvios de 0,00002 g/cm³ propagam-se em ±0,01 %m/m de etanol \[17–19\].

Em equipamento de rotina, três instrumentos dominam o cenário:

- **Alcoômetros e picnômetros de vidro**: custo baixíssimo, mas exatidão limitada (±0,5 °GL em alcoômetros comerciais).
- **Densímetros portáteis de tubo em U oscilante**: exatidão ≈ 0,001 g/cm³, custo USD 3 000–15 000.
- **Densímetros de bancada Anton Paar**: padrão metrológico (±0,00005 g/cm³), inviáveis fora de laboratório.

Para o AlcoLab, a exigência não é exatidão metrológica absoluta, e sim uma **densidade relativa $\\rho/\\rho\_{\\text{H}\_2\\text{O}}$ bem estimada a partir de pesagem em balança doméstica** — no regime de \~0,001 g/cm³ de incerteza. É o suficiente para restringir a busca ternária, como se verá adiante.

### 3.2 Por que a densidade, sozinha, não basta para metanol — e consequência para a triagem

Considere as densidades absolutas puras a 20 °C: $\\rho(\\text{H}\_2\\text{O}) = 0{,}9982$ g/cm³; $\\rho(\\text{EtOH}) = 0{,}7893$ g/cm³; $\\rho(\\text{MeOH}) = 0{,}7914$ g/cm³. O contraste entre os dois álcoois é de **apenas 0,0021 g/cm³ (≈ 0,26 %)**, muito abaixo do limite de detecção de qualquer densímetro doméstico e mesmo abaixo da precisão típica de densímetros portáteis de ±0,001 g/cm³.

Formalmente, trata-se de um problema de **não-injetividade**: na região típica de destilados ($w\_{\\text{total}}$ entre 0,25 e 0,50), a densidade da mistura é praticamente independente da fração interna entre os dois álcoois. Há, portanto, infinitas composições $(w\_{\\text{EtOH}},, w\_{\\text{MeOH}})$ que produzem a mesma densidade. Uma mistura água-etanol de 40 % m/m é densimetricamente indistinguível de uma mistura água-metanol de 40 % m/m pela grande maioria das técnicas por densidade.

Estudos de referência \[17, 18\] reforçam esse limite: trabalhos sobre densidade e volumes molares de excesso em misturas ternárias água-metanol-etanol \[20\] mostram que a diferença entre os excessos água-etanol e água-metanol produz uma assinatura **tênue demais** para servir de vetor discriminatório em instrumento de baixo custo.

**Consequência prática:** a densitometria clássica, apesar de seu mérito inquestionável na quantificação de etanol, nunca foi adotada como ferramenta de triagem de metanol. A literatura de adulteração de bebidas reconhece há décadas essa lacuna e recomenda, para esse fim, métodos cromatográficos ou técnicas espectroscópicas (NIR, FTIR-ATR, Raman) \[17\], que, embora portáteis, têm custo de aquisição elevado e raramente estão disponíveis para fiscalização municipal. **Falta uma segunda grandeza física**, que o AlcoLab introduz na forma da viscosidade relativa medida em seringa com agulha 22G. A densidade, longe de ser abandonada, assume papel fundamental: **restringe drasticamente a região do espaço de composições** em que a amostra pode estar, direcionando a busca pela viscosidade.

---

## 4. Viscosidade: a grandeza que separa metanol de etanol

Diante da inviabilidade de usar apenas a densidade, os autores iniciaram uma investigação sistemática de **propriedades físicas simples, mensuráveis em campo, que discriminassem os dois álcoois**. A viscosidade emergiu como a candidata natural.

A viscosidade dinâmica μ é, em termos macroscópicos, a resistência ao escoamento sob tensão de cisalhamento; microscopicamente, é determinada pela frequência de saltos moleculares e pela eficiência do empacotamento. Os valores puros a 20 °C são:

- $\\mu(\\text{H}\_2\\text{O}) = 1{,}002$ mPa·s
- $\\mu(\\text{MeOH}) = 0{,}554$ mPa·s
- $\\mu(\\text{EtOH}) = 1{,}200$ mPa·s

O contraste entre os dois álcoois é **enorme**: $\\mu(\\text{EtOH})$ é mais de **duas vezes** $\\mu(\\text{MeOH})$. Essa diferença não é acidental — reflete a forte contribuição do grupo metila adicional do etanol à energia de ativação do escoamento (dominada por interações dispersivas C–H⋯H–C e por volume livre menor). A viscosidade oferece, portanto, um **fator de discriminação muito superior ao da densidade**.

### 4.1 O desvio da viscosidade em misturas aquosas

Quando os álcoois são misturados à água, a viscosidade **não se comporta de maneira simples**. Para os dois binários de interesse — água-metanol e água-etanol — a viscosidade **passa por um máximo acentuado em composição intermediária**: cerca de $w\_{\\text{EtOH}} \\approx 0{,}40\\text{–}0{,}50$ para água-etanol ($\\mu\_{\\max} \\approx 2{,}5\\text{–}2{,}9$ mPa·s) e $w\_{\\text{MeOH}} \\approx 0{,}40$ para água-metanol ($\\mu\_{\\max} \\approx 1{,}5\\text{–}1{,}7$ mPa·s). O desvio positivo em relação à média ponderada é manifestação direta da **reorganização da rede de pontes de hidrogênio**: a água se estrutura ao redor das cadeias alifáticas do álcool (*clusters* hidrofóbicos), criando arranjos metaestáveis que aumentam a fricção \[20–23\]. Acima de \~50 % m/m de álcool, a estrutura da água é progressivamente desmontada e a viscosidade decresce.

Apesar desse comportamento não ideal, **a grande diferença absoluta entre etanol e metanol puros mantém a discriminação em misturas**. Uma mistura água-etanol a 40 % m/m exibe viscosidade próxima de 2,5 mPa·s a 20 °C, enquanto uma mistura água-metanol na mesma proporção fica em torno de 1,5 mPa·s — **uma diferença de quase 70 %**. Isso se traduz em tempos de escoamento bem distintos no mesmo sistema capilar. O mesmo princípio se aplica a misturas ternárias: duas amostras com a mesma fração total de álcool, mas com predominância de etanol em uma e de metanol na outra, apresentarão tempos de escoamento marcadamente diferentes. **É essa separação que o AlcoLab explora.**

### 4.2 Modelos matemáticos de referência

A literatura do século XX acumulou uma coleção de modelos para viscosidade de misturas. Os mais relevantes para o AlcoLab:

- **Arrhenius-log** (regra ideal logarítmica): $\\ln \\mu\_{\\text{mix}} = x_1 \\ln \\mu_1 + x_2 \\ln \\mu_2$. Falha por 30–60 % no máximo da curva água-álcool.
- **Grunberg-Nissan \[22\]**: adiciona termo $x_1 x_2 , G\_{12}$ ao log-ideal. Simples, mas não captura bem a assimetria água-álcool.
- **Redlich-Kister \[23\]**: parametriza o excesso $\\Delta \\ln \\mu = x_1 x_2 \\sum A_k (x_1 - x_2)^k$. Três a quatro termos descrevem bem o sistema água-etanol (20–50 °C). Adotado em estudos de misturas alcoólicas \[24\] e é um dos blocos do AlcoLab.
- **Jouyban-Acree \[25\]**: acopla composição e temperatura em um mesmo ajuste, 5–7 parâmetros.
- **McAllister-3 \[26\]**: teoria de "saltos de três corpos"; popular em alcano-álcool.

Publicações recentes confirmam a onipresença dessa bateria: Wang et al. (2023) aplicam Jouyban-Acree, Grunberg-Nissan, Eyring-Margules, Heric, McAllister, Arrhenius e Redlich-Kister simultaneamente; Budeanu e Dumitrescu (2017) fazem o mesmo em n-heptano-álcool; Steltenpohl e Graczová (2022) atingem desvios de 1,17–2,15 % RRMSE em líquidos iônicos+água/álcool com Redlich-Kister (4ª ordem) + Jouyban-Acree \[27, 28\]. Guevara-Carrion et al. (2011), via simulação molecular, comparam SPC, SPC/E, TIP4P e TIP4P/2005 para água e suas misturas, com desvios de 5–15 % para água pura e 5–20 % para misturas \[21\]. Parez et al. (2013) medem a primeira difusão de Fick do binário metanol+etanol e predizem a difusão ternária por simulação \[29\].

Em resumo: arsenal matemático estabelecido, dados binários abundantes, extensão ternária viável — **desde que as viscosidades binárias sejam medidas no mesmo sistema instrumental em que o resultado vai ser usado**. Essa ressalva é o cerne da dificuldade que os autores enfrentaram.

### 4.3 A jornada dos autores: tentativa com dados de literatura

O desenvolvimento do AlcoLab começou pela hipótese mais econômica: **reaproveitar dados de viscosidade binária da literatura** (CRC Handbook, Khattab 2012, Kabir 2004, Song 2008, Mikhail 1961), aplicá-los aos modelos acima e evitar uma rotina experimental longa.

Ao longo dos primeiros meses, várias versões desse pipeline "literatura-only" foram implementadas. O resultado foi consistentemente **instável**:

- em certas temperaturas e composições, o ajuste era aceitável (desvios de 3–7 %);
- em outras — principalmente em teores baixos (w_total ≲ 0,20) ou temperaturas 28–30 °C — a previsão divergia em 15–30 %, com sinal **às vezes invertido** (o experimental escoava mais rápido; em outros dias, mais devagar).

Um fato elucidativo: os dois desenvolvedores trabalhavam em regiões com temperaturas ambiente significativamente diferentes (Centro-Oeste e Nordeste do Brasil), e a dependência térmica do erro aparecia de forma **oposta** nos dois conjuntos. Esse contraste expôs a raiz do problema: **a viscosidade medida em um viscosímetro capilar padronizado (Ubbelohde, tubo em U, cone-placa) não é idêntica à medida num escoamento gravitacional por seringa descartável com agulha curta**, especialmente com gradiente de cisalhamento distribuído, entrada cônica abrupta e desvio parcial do perfil de Poiseuille.

Hagen-Poiseuille é exata para escoamento laminar, permanente e perfil parabólico plenamente desenvolvido em tubo longo ($L/D \\gg 100$). Em seringa+agulha 22G (\~3,8 cm; 0,41 mm de diâmetro interno), $L/D \\approx 90$ — **limítrofe** —, a entrada é um cone pronunciado do cilindro (\~1,2 cm) à agulha, e efeitos inerciais em $Re \\approx 20\\text{–}200$ introduzem correções de entrada (correção de Couette) dependentes **do lote de agulhas, do preenchimento e da temperatura**. O que o usuário mede com a seringa **não é a viscosidade "de manual"**, mas uma viscosidade aparente específica ao sistema — com relação estável, porém não trivial, com o valor absoluto.

### 4.4 Decisão: malha experimental própria + modelagem em seringa

Com a inviabilidade demonstrada de usar dados da literatura como insumo direto, os autores decidiram **construir uma malha de viscosidade própria**, medida no mesmo sistema seringa+agulha 22G que o usuário final usaria.

**Configuração experimental de referência:**

- Seringa de 20 mL cristal descartável, volume útil 15 mL.
- Agulha 22G × 32 mm (Ø externo 0,7 mm; Ø interno nominal 0,41 mm).
- Escoamento livre sob gravidade, seringa vertical, êmbolo removido. O usuário cronometra o tempo entre o início do escoamento e o volume-alvo.
- Água destilada ou filtrada como referência, medida imediatamente antes e depois da amostra na mesma seringa.

**Temperatura de referência:** a malha é construída a **20 °C**. Essa escolha não é arbitrária: a 20 °C, os líquidos apresentam as **maiores viscosidades** dentro da faixa de operação (20–30 °C), o que corresponde aos maiores tempos de escoamento e, portanto, à condição em que os desvios da idealidade são mais pronunciados. Calibrar nessa temperatura garante representar o cenário mais exigente. **A faixa de operação validada do aplicativo é 20–30 °C**; fora dela, a análise de viscosidade é desabilitada.

Medidas feitas em outra temperatura (durante a construção da malha ou pelo usuário em campo) são corrigidas por um **pipeline de três etapas**:

**Etapa 1 - Viscosidade absoluta aparente (Hagen–Poiseuille):**

$$ \\mu\_{\\text{abs}} = \\frac{\\pi r^4 \\rho g h t}{8 L V} $$

onde r é o raio interno da agulha, ρ a densidade de referência (água, \~997 kg/m³, usada igualmente para água e amostra — a escolha é proposital, pois o erro se cancela na etapa 2), g a gravidade, h a altura hidrostática média, t o tempo de escoamento, L o comprimento da agulha e V o volume escoado. O resultado é uma **viscosidade aparente do sistema**, não absoluta rigorosa.

**Etapa 2 - Correção relativa à água (eliminação de erros sistemáticos):**

$$ \\mu\_{\\text{corr-setup}} = \\mu\_{\\text{amostra-abs}} \\times \\frac{\\mu\_{\\text{água-ref}}}{\\mu\_{\\text{água-abs}}} $$

μ\_água_ref é o valor NIST/IAPWS tabelado para a temperatura medida. É o princípio clássico da **viscosimetria relativa** (Ostwald, Ubbelohde): na razão μ\_amostra_abs / μ\_água_abs, todos os fatores geométricos e sistemáticos do setup (raio⁴, L efetivo, perdas de entrada, densidade fixa) se **cancelam matematicamente**. Resta apenas o tempo de escoamento e o erro aleatório da cronometragem.

**Etapa 3 - Normalização térmica para 20 °C (expansão linear local, Taylor de 1ª ordem):**

$$\
\\mu\_{20,°C} = \\mu\_{\\text{corr-setup}} + (T - 20) \\times \\beta(x)\
$$

com $\\beta(x) = a_4 x^4 + a_3 x^3 + a_2 x^2 + a_1 x + a_0$ ajustado aos dados experimentais dos autores. A aproximação linear é válida para $|T - 20| \\lesssim 10$ °C, cobrindo a faixa operacional. A escolha de uma correção linear sobre Arrhenius ou Vogel-Fulcher-Tammann se deu por eficiência computacional e suficiência da precisão no intervalo alvo.

**Pipeline consolidado:**

$$\
\\mu\_{20,°C} = \\underbrace{\\mu\_{\\text{abs}} \\times \\frac{\\mu\_{\\text{água-ref}}}{\\mu\_{\\text{água-abs}}}}*{\\text{correção de escala (setup)}} + \\underbrace{(T-20) \\times \\beta(x)}*{\\text{correção térmica}}\
$$

Aplicado tanto na **calibração da malha** (normalizando dados obtidos em temperaturas diversas e com seringas/agulhas de marcas diferentes) quanto no **uso em campo**. Dados de calibração heterogêneos (duas seringas, marcas diferentes, temperaturas variadas) atingiram, após correção, $R^2 &gt; 0{,}986$ para água-etanol e água-metanol — confirmando que a correção relativa absorve diferenças de hardware.

**Modelagem das bordas binárias:** o conjunto já corrigido é interpolado em $\\ln(\\mu)$ vs. fração molar de água $x_W$ usando **PCHIP** (*Piecewise Cubic Hermite Interpolating Polynomial*) com ancoragem nas extremidades $x_W = 0$ e $x_W = 1$. PCHIP preserva monotonicidade local e evita oscilações espúrias; trabalhar em $\\ln(\\mu)$ garante positividade, tem motivação física (Arrhenius-log) e é numericamente estável em float32. Alternativas polinomiais (3ª, 4ª, 5ª ordem) foram testadas como diagnóstico, mas o PCHIP venceu na validação cruzada. MAPE típico: **1,5–3,5 %** nos pontos deixados de fora.

**Extensão ternária:** não foi medida diretamente no interior do simplex (5151 pontos em passo de 1 % seriam impraticáveis à mão). A superfície é **derivada dos dois binários**:

$$ \\ln \\mu\_{\\text{tern}}(x_W, r) = (1-r) \\ln \\mu\_{\\text{MeOH}}(x_W) + r \\ln \\mu\_{\\text{EtOH}}(x_W) + r(1-r), \\Delta(x_W) $$

com $r = x\_{\\text{Et}} / (x\_{\\text{Et}} + x\_{\\text{Me}})$. O termo de excesso $\\Delta(x_W)$ é construído como **"RK-mid"** (inspirado no primeiro coeficiente Redlich-Kister aplicado a $r = 0{,}5$), com duas salvaguardas:

- $\\lambda = 0{,}20$ — escala a correção teórica a 20 % da magnitude nominal (decisão conservadora, para não introduzir viés ternário sem base experimental direta);
- $\\alpha = 0{,}30$ — cap: $|\\Delta(x_W)| \\leq \\alpha \\cdot |\\ln \\mu\_{\\text{EtOH}}(x_W) - \\ln \\mu\_{\\text{MeOH}}(x_W)|$, garantindo que a correção nunca exceda 30 % do contraste binário natural;
- $\\Delta(x_W)$ suavizado pelo mesmo PCHIP das bordas.

A malha final é uma grade sobre o simplex em %m/m inteiros — **5 151 nós** a 20 °C, arquivo `ternary_mesh_all_T20_50_lambda020_alpha030_step1pct.npz`. Para produção, é reparametrizada em (w_total, z_MeOH), com z_MeOH = w_MeOH / w_total, gerando duas versões embarcadas: `malha_viscosidade_ajuste_bordas_f32.npz` (1001 × 1001, \~3,3 MB) e `_coarse251_f32.npz` (fallback de 257 kB).

**Consulta em tempo de execução:** para uma $\\mu^*$ corrigida a 20 °C e uma faixa de $w\_{\\text{total}}$ vinda da densidade, o app busca nós $(w, z)$ que satisfazem $|\\mu\_{\\text{pred}}(w, z) - \\mu^*| \\leq \\text{tol%} \\cdot \\mu^\*$ (default ±2 %).

**Validação externa:** MAPE de 4–8 % contra Song 2008 (dados Ubbelohde) em $w\_{\\text{total}} \\in \[0;, 0{,}70\]$ e contra dados ternários próprios como *holdout* — coerente com a instrumentação específica do AlcoLab.

---

## 5. O AlcoLab: proposta, autores, princípio de funcionamento

O AlcoLab é uma ferramenta web **gratuita, open-source e offline-capable**, desenvolvida pelos autores **Diego Mendes de Souza, Pedro Augusto de Oliveira Morais e Nayara Ferreira Santos**. O aplicativo executa o pipeline analítico **inteiramente no navegador via Pyodide** (Python compilado para WebAssembly), sem envio de dados a servidores, e funciona em qualquer smartphone moderno.

**Insumos físicos necessários:**

- uma seringa comercial descartável de 20 mL com agulha 22G (mais baratas em farmácia);
- uma balança de cozinha com resolução ≥ 0,1 g;
- a amostra (10–20 mL) e um volume equivalente de água comum como referência;
- um cronômetro (o próprio smartphone).

**Princípio:** a análise combina duas grandezas físicas complementares.

- A **densidade relativa** — obtida pela pesagem de um volume calibrado da amostra contra água — fornece o **teor alcoólico total** (w, fração mássica de álcool) com precisão suficiente para restringir a região do espaço de composições em que a amostra se encontra.
- A **viscosidade relativa** — obtida pelo tempo de escoamento gravitacional pela seringa — fornece uma segunda grandeza que, diferentemente da densidade, **separa metanol de etanol com folga**.

A combinação das duas permite estimar a composição ternária água-etanol-metanol mais compatível com as medidas e, em consequência, identificar amostras com metanol acima de um limiar de segurança.

> **A densidade diz quanto álcool há ao todo; a viscosidade diz que álcool é.**

---

## 6. Passo a passo analítico do AlcoLab

### 6.1 Entrada e normalização

O fluxo começa com o perfil do usuário (leigo, técnico ou laboratório), que adapta a granularidade da interface, e com os metadados da amostra (tipo, teor de rótulo em °GL / %v/v / %m/m, marca, lote). A validação é feita por *schema* Zod que rejeita valores fora de ranges físicos plausíveis. Internamente, toda composição passa a ser expressa em **fração mássica** e toda temperatura em °C. A conversão %v/v → %m/m usa tabela interpolada a 20 °C (`conversao_vv_para_wE_20C.csv`); bebidas rotuladas em °GL a temperatura ≠ 20 °C passam primeiro por correção via `densidade_alcool_gl20a30.csv`.

### 6.2 Medição de densidade (Fluxo 1)

1. Tarar a balança com a seringa vazia (ou registrar e subtrair).
2. Aspirar exatamente 10,0 mL de água; pesar; registrar m\_água.
3. Aspirar exatamente 10,0 mL da amostra (após enxágue com a própria amostra); pesar; registrar m_amostra.

Densidade relativa: $\\rho\_{\\text{rel}} = m\_{\\text{amostra}} / m\_{\\text{água}}$. Com balança de 0,1 g, a incerteza típica é ±0,005 em ρ\_rel, equivalente a **±0,5–1 % em teor alcoólico em massa** — suficiente para o papel da densidade no método (direcionar a busca na malha de viscosidade, não quantificar álcool com precisão metrológica).

A conversão $\\rho\_{\\text{rel}} \\to w\_{\\text{álcool}}$ faz busca inversa **simultânea** nas malhas binárias EtOH–H₂O e MeOH–H₂O a 20 °C, retornando $(w\_{\\text{EtOH_equiv}},, w\_{\\text{MeOH_equiv}})$. A média é usada como estimativa pontual de w_total e o intervalo entre os dois valores fornece a faixa possível — abordagem deliberadamente conservadora dada a quase coincidência das duas curvas binárias.

### 6.3 Medição de temperatura

O usuário registra a temperatura da água e da amostra. 1 °C de diferença altera μ(água) em \~2,3 %, então a medida de T impacta diretamente a Etapa 3 do pipeline. O app aceita qualquer termômetro com resolução de 0,5 °C e opera na faixa **20–30 °C**; amostras fora dessa faixa disparam aviso.

### 6.4 Medição de viscosidade (Fluxo 2)

O usuário cronometra **três (ou mais)** tempos de escoamento de um volume fixo (padrão 10 mL) da água e da amostra na mesma seringa+agulha. O app calcula o CV entre repetições; se CV &gt; 5 %, alerta e recomenda repetir. Os tempos médios alimentam o pipeline de três etapas (6.1.1–6.1.3) resultando na **viscosidade da amostra corrigida e referenciada a 20 °C**, pronta para consulta na malha.

### 6.5 Densidade como "norte": por que é o ponto-chave

A malha ternária é uma superfície curva em $(w\_{\\text{total}},, z\_{\\text{MeOH}})$. Para uma viscosidade $\\mu^\*$ experimental, o conjunto de composições compatíveis **não é um ponto — é uma curva de nível**, com centenas de candidatas espalhadas da malha.

Por exemplo, para $\\mu^\* = 1{,}80$ mPa·s a 20 °C, a curva $C(\\mu^\*)$ cobre desde:

- **Bebidas de baixo teor com domínio de etanol** ($w\_{\\text{total}} \\approx 0{,}25\\text{–}0{,}35$; $z\_{\\text{MeOH}} \\approx 0\\text{–}0{,}2$);
- até **bebidas de alto teor com domínio de metanol** ($w\_{\\text{total}} \\approx 0{,}55\\text{–}0{,}70$; $z\_{\\text{MeOH}} \\approx 0{,}7\\text{–}1{,}0$).

São composições **quimicamente opostas** que produzem o mesmo tempo de escoamento. A densidade sozinha não discrimina; a viscosidade sozinha também não. A densidade entra como **filtro de região**: se a medida informa $w\_{\\text{total}} \\approx 0{,}40 \\pm 0{,}03$, a segunda região é eliminada automaticamente. Só então a viscosidade é consultada para escolher, dentro da faixa compatível, qual composição explica melhor $\\mu^\*$.

### 6.6 Cálculo e exibição

O Web Worker carrega o runtime Pyodide (5–10 s na primeira chamada) e executa: (i) `app_w_alcool_v2.py` → w_total a partir da densidade; (ii) `main.py` + `processamento.py` → pipeline de correção, consulta à malha, composição ternária mais compatível e análise estatística. O resultado é serializado para exibição em `results/page.tsx`.

---

## 7. A camada estatística do AlcoLab

### 7.1 Por que uma camada estatística específica é necessária

A saída bruta do pipeline é a "composição mais compatível" com (w_total, μ\_relativa). Não basta: o usuário final precisa saber se (i) essa composição é **estatisticamente melhor** que a hipótese "sem metanol" e (ii) **quão confiável** é essa decisão frente à incerteza das medidas em seringa e balança.

O AlcoLab responde à primeira pergunta com um **teste t-Student bilateral** e à segunda com uma **simulação de Monte Carlo com 3 000 replicatas**.

### 7.2 Métodos

**Teste t-Student / Welch \[30\].** Para $n \\geq 2$ repetições:

$$ t = \\frac{\\bar{\\mu}*{\\text{exp}} - \\mu*{\\text{ref}}}{s\_{\\mu} / \\sqrt{n}} $$

Decisão bilateral com $\\alpha = 0{,}05$; rejeita $H_0$ (mistura idêntica à referência) se $|t|$ excede $t\_{0{,}025,, n-1}$. Com $n = 1$, o app cai em aproximação normal (z-score) com SD default = 0,025 mPa·s relativo. Correção de Welch é invocada automaticamente quando há heterocedasticidade forte entre amostra e referência \[31, 32\].

**Monte Carlo para propagação de incerteza.** Formalizada em GUM S1 \[33–35\], é o padrão quando (a) a relação entrada/saída é fortemente não-linear ou (b) as distribuições não são gaussianas. Ambas as condições se aplicam: a malha é não-linear em (w, z) e a medida em seringa tem distribuição aproximadamente normal mas com caudas por falhas operacionais pontuais. Estudos comparando GUM analítico com MC \[34, 35\] mostram que em problemas multivariados não-lineares o MC captura **covariâncias e assimetrias** que o GUM linearizado subestima; aplicações em copulas \[36\] e forense \[37\] validam a abordagem. 3 000 replicatas rodam em &lt; 1 s em navegador moderno.

### 7.3 Implementação e hipóteses comparadas

Parâmetros fixados em código: `MC_N_DEFAULT = 3000`; `ALPHA_MEDIA = 0,05`; `P_CUTOFF_HIGH_SELECTIVITY = 0,70`; `P_CUTOFF_LOW_SELECTIVITY = 0,80`; `W_LOW_SELECTIVITY = 0,20`; `SD_DEFAULT_N1 = 0,025`; `MALHA_SIGMA_DEFAULT = 0,0` (reservado para um $\\sigma$ por célula futuro).

O núcleo de `_avaliar_amostra` gera $\\mu\_{\\text{sims}} = \\mathcal{N}(\\mu\_{\\text{mean}},, \\mu\_{\\text{se}},, \\text{size}=3000)$ e, para cada hipótese $H_k$, calcula $\\chi^2\_{i,k}$ contra a viscosidade prevista pela malha. A hipótese vencedora por replicata é contada; a probabilidade posterior é a fração de vitórias. A semeadura do RNG é feita por **CRC-32 do identificador da amostra**, garantindo reprodutibilidade cross-platform (importante para auditabilidade em perícia).

**Hipóteses comparadas em paralelo** (dentro da faixa de w_total direcionada pela densidade):

- $H\_{\\text{tern}}$: composição ternária mais compatível (permite todos os três componentes);
- $H\_{\\text{EtOH}}$: binário água-etanol ($z\_{\\text{MeOH}} = 0$);
- $H\_{\\text{MeOH}}$: binário água-metanol ($z\_{\\text{MeOH}} = 1$);
- $H\_{\\text{trace}}$: traços (1–5 % m/m) de um álcool no outro — para capturar adulteração leve.

**Decisão conservadora:**

- Se $P(H\_{\\text{EtOH}}) \\geq P\_{\\text{cutoff}}$ → "compatível com etanol apenas".
- Se $P(H\_{\\text{tern}}) \\geq P\_{\\text{cutoff}}$ **e** $z\_{\\text{MeOH}}$ na composição mais compatível &gt; 5 % m/m → "incompatível" (provável adulteração).
- Casos intermediários → amarelo, recomenda repetir.

### 7.4 Sensibilidade efetiva por faixa

Em $w\_{\\text{total}} \\leq 0{,}20$ as duas bordas binárias se aproximam (ambas tendem a $\\mu$ da água), e o teste fica naturalmente menos seletivo. O app eleva o *cut-off* de 0,70 para 0,80 e inclui hipóteses de traços 1–5 %. Resultado prático:

- $w\_{\\text{total}}$ **0,30–0,60** (destilados típicos — cachaça, vodka, gim, whisky): sensibilidade a $z\_{\\text{MeOH}} \\geq 5%$ com confiança ≥ 70 %.
- $w\_{\\text{total}}$ **0,15–0,30** (licores, cervejas fortes): sensibilidade a $z\_{\\text{MeOH}} \\geq 10%$ com confiança ≥ 80 %.
- $w\_{\\text{total}} &lt; 0{,}15$ (bebidas muito diluídas): "álcool detectado, discriminação inconclusiva"; recomenda análise complementar.

### 7.5 Semáforo final

Integra três blocos em `semaphoreLogic.ts`:

1. **Qualidade experimental** (`experimentApproved`): ≥ 2 repetições, CV ≤ 5 %, $R^2 \\geq 0{,}99$ se houver vídeo+IA, $\\mu$ da água de referência dentro de ±15 % do tabelado.
2. **Compatibilidade analítica** (`compativel`): Compatible / Incompatible / Inconclusive.
3. **Semântica por tipo de amostra** (bebida vs. álcool comercial vs. etanol combustível): para bebidas, vermelho exige **ambos** "Incompatible" E "metanol alto (&gt; 5 %)" E `experimentApproved`.

Por construção, é **conservadora**: vermelho só dispara quando a evidência experimental é boa, a decisão estatística é robusta e o contexto permite conclusão toxicologicamente relevante. Amostras borderline caem em amarelo.

---

## 8. Discussão e limitações

### 8.1 Desempenho atual

Em testes de validação com amostras preparadas em laboratório com concentrações conhecidas:

- **Quantificação de $w\_{\\text{total}}$**: erros típicos &lt; 5 % em $0{,}25 \\leq w\_{\\text{total}} \\leq 0{,}70$.
- **Identificação de metanol &gt; 5 % m/m em amostras com $w\_{\\text{total}} \\geq 0{,}30$**: taxa de acerto **100 %** nos conjuntos internos.
- **Falsos positivos em amostras legítimas**: próximos de zero, graças ao semáforo conservador.

### 8.2 Por que o limiar de 5 % é clinicamente adequado

Não é uma limitação acidental: as intoxicações graves relatadas envolvem tipicamente bebidas com **10–40 % m/m de metanol**, associadas a adulterações grosseiras para aumentar rendimento de destilados \[6, 7, 38, 39\]. Em quantidades pequenas (&lt; 1–2 %), o metanol **compete com o etanol pela ADH**: se o etanol está muito acima do metanol, o fígado processa preferencialmente o etanol e parte do metanol é eliminado inalterado antes da formação tóxica de formiato \[9, 40\]. Além disso, traços de 0,1–1 % m/m ocorrem **naturalmente** em destilados de frutas (aguardentes, bagaceiras, grappas) e são **legalmente permitidos** (Regulamento UE 2019/787). O AlcoLab é projetado para o **perfil de risco que importa** — fraudes com substituição significativa — e não para quantificar traços inofensivos.

### 8.3 Limitações remanescentes

- **Faixa de temperatura de operação (20–30 °C):** fora dela, análise de viscosidade desabilitada; recomenda-se aguardar equilíbrio térmico.
- **Poucos pontos experimentais no interior do simplex ternário:** MAPE 4–8 % na validação externa é aceitável para triagem, não para metrologia de alta exatidão. Expandir o conjunto é o caminho mais imediato de refinamento.
- **Regiões de baixa seletividade ($w\_{\\text{total}} &lt; 0{,}20$) e bordas extremas ($w\_{\\text{total}} &gt; 0{,}80$):** resolução discriminatória menor; tendência a "inconclusivo". Um acréscimo futuro pode ser confirmação colorimétrica rápida (ácido cromotrópico) nessas regiões específicas.

---

## 9. Como o AlcoLab foi disponibilizado: licença AGPL-3.0 e estratégia de abertura

Quando a metodologia já estava estruturada e os testes experimentais confirmavam o potencial da ferramenta, a equipe enfrentou uma decisão concreta: **pedir patente** — processo de 2 a 7 anos, com proteção da invenção e possível retorno — ou **lançar imediatamente, de graça, assumindo os custos do próprio bolso**, sem garantia alguma de retorno. Havia surto ativo de intoxicações no Brasil e em outros países, vidas em risco, e uma janela de tempo que a via patentária não conseguiria atender. A equipe escolheu lançar. O AlcoLab foi ao ar em **10 de março de 2026**.

### 9.1 A escolha por AGPL-3.0

O AlcoLab foi publicado sob licença **GNU AGPL-3.0** — uma das licenças de código aberto mais rigorosas disponíveis. A propriedade central da AGPL, relevante para uma ferramenta de saúde pública, é o chamado **"copyleft de rede"**: qualquer versão modificada do código — inclusive versões executadas como serviço web por terceiros — **precisa disponibilizar publicamente o código-fonte modificado**. Isso impede que um ator privado pegue o AlcoLab, faça melhorias e as transforme em produto proprietário pago, sem devolver à comunidade o que derivou do trabalho aberto.

Na prática, a AGPL-3.0 garante três coisas ao ecossistema de saúde pública:

- **A gratuidade é juridicamente sustentável.** Uma empresa pode usar o AlcoLab comercialmente, mas se o modificar para oferecer um serviço, deverá publicar a versão modificada sob a mesma licença.
- **A metodologia continua auditável.** Pesquisadores, peritos e agentes de fiscalização podem revisar o algoritmo, validar critérios estatísticos e propor melhorias — condição essencial quando se trata de decisão que afeta consumo de bebida.
- **A ferramenta pode ser adaptada** a outros contextos (outros tipos de amostra, outras línguas, outras interfaces) **desde que se mantenha o compromisso de abertura**.

### 9.2 Por que os autores optaram por essa abordagem

A equipe identificou três razões convergentes:

1. **Urgência de saúde pública.** Dezenas de casos no Brasil em 2025 e o alerta da OPAS/OMS em outubro de 2025 \[8\] tornavam a janela patentária inviável eticamente.
2. **Alinhamento com o público-alvo.** A ferramenta faz mais sentido exatamente em regiões com pouca infraestrutura laboratorial — onde um produto proprietário teria adoção muito menor.
3. **Auditabilidade como requisito técnico.** Para uma ferramenta cujo resultado pode orientar consumo, denúncia ou autuação, metodologia fechada é obstáculo científico, não vantagem competitiva.

### 9.3 Proteção da prioridade e publicação científica

Abertura não significa ausência de proteção da autoria. Antes da publicação pública, a equipe executou dois passos estratégicos:

- **Depósito junto ao INPI**, fixando a data de prioridade da invenção no Brasil.
- **Publicação no Zenodo**, repositório científico internacional com DOI permanente.

Esses registros **não visam exploração comercial** — visam justamente o contrário: impedir que um terceiro reivindique a ideia como própria depois que ela já foi tornada pública. É uma proteção orientada à abertura, não ao fechamento. O código completo está em [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab).

### 9.4 Primeiros resultados de adoção

Em cerca de um mês de site público, o AlcoLab registrou **quase 2 500 visitantes únicos e aproximadamente 34 000 requisições** ao servidor, com acessos em todos os continentes — Brasil, Estados Unidos, China, França, Canadá, Singapura e Suíça, entre outros. A adesão internacional confirma o que a equipe suspeitava: **a contaminação de bebidas por metanol não é um problema exclusivamente brasileiro**; é global, especialmente em países com fiscalização e infraestrutura laboratorial limitadas.

---

## 10. Parcerias necessárias e riscos ao projeto

### 10.1 O custo real da gratuidade

Software gratuito **não é software sem custo** — significa que alguém está arcando com ele. No caso do AlcoLab, essa conta foi — e continua sendo — paga pelos próprios criadores: hospedagem em servidor, registro de domínio, bebidas comerciais para testes, materiais de calibração, reagentes e muitas horas de pesquisa e desenvolvimento. Os custos estimados até a publicação deste texto estão na Tabela 2.

**Tabela 2. Custos estimados do projeto AlcoLab custeados pelos autores (até abril/2026).**

| Item | Detalhe | Custo estimado |
| --- | --- | --- |
| Bebidas para calibração | 10 rótulos (whisky e vodka) | R$ 1 000 |
| Reagentes químicos | Etanol e metanol P.A., 10 L cada | R$ 1 600 |
| Infraestrutura — Railway Pro | US$ 20/mês × 6 meses | R$ 700 |
| Ferramentas de desenvolvimento | GitHub Copilot + Claude Max, 6 meses | R$ 3 840 |
| Horas de P&D | 290 h (Diego 150h · Pedro 80h · Romério 30h · Nayara 30h) | R$ 29 000 |
| **Total investido estimado** |  | **R$ 36 140** |

### 10.2 Riscos reais de um projeto sem suporte institucional

Projetos *open source* sem apoio institucional têm um histórico conhecido: desenvolvedores voluntários se sobrecarregam, manutenção se acumula, atualizações deixam de ser feitas e a infraestrutura vai ficando vulnerável. O resultado é o que o meio chama de **abandonware** — software que existe, mas não tem mais ninguém por trás. Para uma ferramenta de saúde pública, esse desfecho é particularmente grave: a continuidade depende de manutenção ativa (atualização de dependências, correções de segurança, novos pontos de calibração, adaptação a novos tipos de bebida). **É esse cenário que a equipe quer evitar** — precisamente porque acredita no impacto positivo da ferramenta para a saúde pública.

### 10.3 Parcerias com laboratórios oficiais

A primeira frente de parcerias buscada é com **laboratórios oficiais de metrologia legal e institutos de pesquisa** — INMETRO no Brasil, CENAM no México, equivalentes em outros países, universidades públicas com infraestrutura reológica (cone-placa, Ubbelohde, rheomat). O objetivo é:

- **Aumentar o número de pontos de calibração** no interior do simplex ternário, substituindo parte da derivação RK-mid por medidas experimentais diretas e **refinando o termo de excesso** Δ(x_W).
- Conduzir **estudos de precisão interlaboratorial e entre analistas**, quantificando a reprodutibilidade real do método em condições de fiscalização.
- **Aumentar a robustez e a confiabilidade da malha experimental**, devolvendo ao usuário final resultados mais assertivos e estatisticamente qualificados.
- Padronizar um **lote de referência de seringas+agulhas** para triagem analítica, reduzindo a variabilidade absorvida hoje pela correção relativa à água.

### 10.4 Parcerias com instituições de fiscalização

A segunda frente é com **instituições relacionadas à fiscalização de bebidas e combustíveis** — Vigilância Sanitária, Polícia Civil, Procon, MAPA, ANP, Anvisa. O objetivo aqui é bidirecional: (i) disponibilizar a ferramenta validada a agentes de campo como triagem pré-laboratorial; (ii) **captar dos próprios usuários finais as demandas reais** — ajustes necessários, novas funcionalidades, tipos de amostra ainda não cobertos (licores, cervejas, vinhos, bebidas mistas), melhorias de usabilidade e integração com sistemas oficiais de notificação. O ciclo de feedback com quem usa é o caminho mais curto para que o AlcoLab deixe de ser uma prova de conceito bem-sucedida e se torne um instrumento operacional da fiscalização brasileira e latino-americana.

### 10.5 Outras frentes em tratativa

No âmbito internacional, foram contatados os **Médicos Sem Fronteiras** (que mantêm a *Methanol Poisoning Initiative* desde 2012), a **OPAS/OMS**, fundações como **Wellcome Trust** e **Gates Foundation**, e organismos como **BID Lab** e **STDF**. No âmbito nacional, a lista inclui **Fiocruz, MAPA, ANP, Vigilância Sanitária e parlamentares**. No campo do fomento à pesquisa, há submissões planejadas à **FAPEMA, FINEP e FAP-DF**, além de **FAPESP, CNPq e Finep** para estudos de validação em larga escala.

Nenhuma parceria está fechada ainda — o projeto é recente e as tratativas estão em curso. **O que existe de concreto é a ferramenta em si: funcional, gratuita, auditável, disponível agora**. A consolidação, universalização e disseminação dependem daqui em diante do ecossistema institucional que conseguir se formar em torno dela.

---

## Conclusão

O AlcoLab combina **densidade e viscosidade** — duas grandezas físicas simples, mensuráveis em campo com seringa, balança de cozinha e smartphone — em um pipeline analítico com camada estatística Monte Carlo, atingindo erros &lt; 5 % em teor alcoólico total e identificação consistente de metanol acima de 5 % m/m, faixa compatível com o perfil clínico das intoxicações reais. A malha de viscosidade foi construída experimentalmente pelos autores no mesmo sistema seringa+agulha 22G usado pelo usuário final, após a constatação de que dados da literatura — medidos em viscosímetros padronizados — não transferiam para o escoamento gravitacional em seringa descartável. A ferramenta é gratuita, *open source* sob AGPL-3.0, e seu código é auditável em [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab). A sustentabilidade e a universalização dependem agora de parcerias técnicas e institucionais que os autores não têm capacidade de financiar isoladamente.

**Para apoiar, colaborar ou demandar adaptação:** \[\[email protected\]\](mailto:\[email protected\]) — e **compartilhar** com quem possa se beneficiar (consumidores, produtores, fiscais, agentes de saúde) é, sempre, a forma mais simples de ajudar.

---

## Referências

 1. Pohanka M. Antidotes Against Methanol Poisoning: A Review. *Mini-Reviews in Medicinal Chemistry*. 2019;19(14):1126–1136.
 2. McMartin KE, Jacobsen D, Hovda KE. Antidotes for poisoning by alcohols that form toxic metabolites. *Br J Clin Pharmacol*. 2015;81(3):505–515.
 3. McMartin KE, Jacobsen D, Hovda KE. Antidotes for poisoning by alcohols that form toxic metabolites (updated review). *Br J Clin Pharmacol*. 2024;90(9):2077–2088.
 4. Rietjens SJ, de Lange DW, Meulenbelt J. Ethylene glycol or methanol intoxication: which antidote should be used, fomepizole or ethanol? *Neth J Med*. 2014;72(2):73–79.
 5. El-Bakary A, et al. Ranitidine as an alcohol dehydrogenase inhibitor in acute methanol toxicity in rats. *Hum Exp Toxicol*. 2010;29(2):93–101.
 6. Alnefaie SA, et al. Methanol intoxication in the central region of Saudi Arabia: Five case studies. *Saudi Pharm J*. 2024;32(3):102018.
 7. Alqurashi GI, et al. Case Reports Study on Methanol Poisoning in King Abdul Aziz Specialist Hospital. *J Clin Med*. 2023;12(13):4282.
 8. Organização Pan-Americana da Saúde (OPAS/OMS). Alerta Epidemiológico: Envenenamento por Metanol nas Américas. Washington, DC: PAHO; out. 2025.
 9. Mégarbane B. Treatment of patients with ethylene glycol or methanol poisoning: focus on fomepizole. *Open Access Emerg Med*. 2010;2:67–75.
10. Hantson P, et al. Methanol poisoning and organ transplantation. *Transplantation*. 1999;68(1):165–167.
11. European Association of Poisons Centres and Clinical Toxicologists. Position paper on the treatment of methanol poisoning. *Clin Toxicol*. 2023;61(1):1–13.
12. Zakharov S, et al. Intermittent hemodialysis is superior to CVVHD/HDF to eliminate methanol and formate. *Kidney Int*. 2014;86(1):199–207.
13. van den Broek J, et al. Screening Methanol Poisoning with a Portable Breath Detector. *Anal Chem*. 2021;93(2):1170–1178.
14. Osborne NS, McKelvy EC, Bearce HW. Density and Thermal Expansion of Ethyl Alcohol and of Its Mixtures with Water. *Bull Bureau Stand*. 1913;9:327–474.
15. OIML. *International Alcoholometric Tables*. OIML R 22-1. Paris: OIML; 1975 (atualizada).
16. AOAC International. *Official Methods of Analysis*. Method 942.06: Alcohol by Volume in Distilled Liquors. 22nd ed. 2023.
17. Lachenmeier DW, et al. Application of tailored reference materials and metrologically consistent methods for the analysis of alcoholic beverages. *J Consum Prot Food Saf*. 2021;16:215–228.
18. Lopes Jesus AJ, et al. Theoretical Prediction of Thermal Diffusion in Water–Methanol, Water–Ethanol, and Water–Isopropanol Mixtures. *J Phys Chem B*. 2006;110(46):23180–23188.
19. Osborne S. Determination of Density, Alcohol Content, and Extract in Alcoholic Beverages. *J AOAC*. 1987;70(6):1006–1009.
20. Dizechi M, Marschall E. Viscosity of Some Binary and Ternary Liquid Mixtures. *J Chem Eng Data*. 1982;27(3):358–363.
21. Guevara-Carrion G, Vrabec J, Hasse H. Prediction of self-diffusion coefficient and shear viscosity of water and its binary mixtures with methanol and ethanol by molecular simulation. *J Chem Phys*. 2011;134(7):074508.
22. Grunberg L, Nissan AH. Mixture Law for Viscosity. *Nature*. 1949;164(4175):799–800.
23. Redlich O, Kister AT. Algebraic Representation of Thermodynamic Properties and the Classification of Solutions. *Ind Eng Chem*. 1948;40(2):345–348.
24. Budeanu MM, Dumitrescu V. Densities and viscosities for binary mixtures of n-heptane with alcohols at different temperatures. *J Serb Chem Soc*. 2017;82(9):1005–1016.
25. Jouyban A, Fakhree MAA, Acree WE Jr. Modeling solubility of drugs in water–cosolvent mixtures at various temperatures. *J Drug Deliv Sci Technol*. 2012;22(6):495–504.
26. McAllister RA. The viscosity of liquid mixtures. *AIChE J*. 1960;6(3):427–431.
27. Steltenpohl P, Graczová E. Binary mixtures containing imidazolium ionic liquids: properties measurement. *Acta Chim Slovaca*. 2022;15(1):19–28.
28. Steltenpohl P, Holečková A, Graczová E. Modeling of transport properties of binary mixtures including ionic liquids. *Acta Chim Slovaca*. 2022;15(2):120–129.
29. Parez S, Guevara-Carrion G, Hasse H, Vrabec J. Mutual diffusion in the ternary mixture of water + methanol + ethanol. *Phys Chem Chem Phys*. 2013;15(11):3985–4001.
30. Wang X, et al. Excess Properties, Computational Chemistry, and Spectral Analysis of \[Diethanolamine + Alcohols\] Ion-Like Liquids. *J Chem Eng Data*. 2023;68(10):2510–2524.
31. Domańska U, Laskowska M. Temperature and Composition Dependence of the Density and Viscosity of Binary Mixtures of {1-Butyl-3-methylimidazolium Thiocyanate + 1-Alcohols}. *J Chem Eng Data*. 2009;54(9):2113–2119.
32. Haghbakhsh R, Duarte ARC, Raeissi S. Viscosity Investigations on the Binary Systems of (1 ChCl:2 Ethylene Glycol) DES and Methanol or Ethanol. *Molecules*. 2021;26(18):5513.
33. JCGM. *Evaluation of measurement data — Guide to the expression of uncertainty in measurement (GUM)*. JCGM 100:2008.
34. JCGM. *Supplement 1 to the GUM: Propagation of distributions using a Monte Carlo method*. JCGM 101:2008.
35. Cox MG, Siebert BRL. The use of a Monte Carlo method for evaluating uncertainty and expanded uncertainty. *Metrologia*. 2006;43(4):S178–S188.
36. Possolo A. Copulas for uncertainty analysis. *Metrologia*. 2010;47(3):262–271.
37. Liu F, Liu Y, Wu S. Evaluating methods of calculating measurement uncertainty. *Accred Qual Assur*. 2011;16(1):1–7.
38. Paasma R, et al. Risk factors related to poor outcome after methanol poisoning. *Clin Toxicol*. 2012;50(9):823–831.
39. Vale A. Methanol. *Medicine*. 2007;35(12):633–634.
40. Barceloux DG, et al. American Academy of Clinical Toxicology practice guidelines on the treatment of methanol poisoning. *J Toxicol Clin Toxicol*. 2002;40(4):415–446.

---

**AlcoLab está disponível em [alcolab.org](https://alcolab.org/).** **Código-fonte:** [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab) · AGPL-3.0 **Contato para parcerias:** \[\[email protected\]\](mailto:\[email protected\])
