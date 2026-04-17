---
title: >-
  App open source na triagem de metanol em bebidas e combustíveis: entenda a
  metodologia do AlcoLab
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
O delegado-geral da Polícia de São Paulo, Artur Dian, disse no final de outubro de 2025:

> Todas as bebidas adulteradas com metanol no estado saíam de uma fábrica clandestina gerenciada por uma família em São Bernardo do Campo. O etanol adulterado com metanol era adquirido em dois postos de combustíveis da região pertencentes à facção criminosa PCC \\cite{gazetadopovo2025}.

**São Paulo foi disparado o estado mais afetado pelas intoxicações por metanol**. Pelo balanço final consolidado pelo Ministério da Saúde, das 890 notificações registradas entre 26 de setembro e 5 de dezembro, São Paulo concentrou 578 delas e 50 dos 73 casos confirmados nacionalmente, além de 10 dos 22 óbitos confirmados \\cite{brasil2025}.

Embora em muitos casos não tenha sido determinada a rota do metanol presente nas garrafas de destilados, o maior caso de adulteração elucidado em São Paulo sugere <u>interconexão entre adulteração de combustível, adulteração de bebidas e casos de intoxicação por metanol</u>.

<img src="/images/blog/not-cia-1776447070981.png" alt="notícia do G1 sobre a localização de postos de combustível que adulteravam etanol com metanol e que foi utilizado na falsificação de bebidas" style="max-width:60%;margin:0 auto;display:block" />

## Da matriz energética brasileira à adulteração do etanol combustível com metanol

- **Etanol hidratado combustível (EHC) um dos pilares da matriz energética brasileira**, com produção anual superior a 30 bilhões de litros para mais de 40 milhões de veículos \\cite{unica2026};
- **Comercializado em mais de 42 mil postos**, com qualidade monitorada pela Agência Nacional do Petróleo, Gás Natural e Biocombustíveis (ANP), por meio do Programa de Monitoramento da Qualidade dos Combustíveis (PMQC) e de fiscalizações diretas \\cite{anp2026};
- Historicamente, as fraudes mais comuns envolviam a adição excessiva de água ao EHC e a mistura de solventes mais baratos à gasolina;
- **A adulteração de combustíveis com metanol é motivada por um diferencial de preço significativo**. Em 2024–2025 o preço médio do metanol industrial importado ficou bem abaixo do custo do etanol hidratado das usinas \\cite{argusmedia2025,novacana2025b};
- **Essa diferença de \~50% gera margens ilícitas expressivas**, amplificadas pela sonegação fiscal que frequentemente acompanha o esquema \\cite{argusmedia2025,novacana2025b};
- **Operação Carbono Oculto da Polícia Federal em conjunto com o Ministério Público**, agosto de 2025, revelou esquema bilionário envolvendo importação irregular de metanol pelo Porto de Paranaguá e distribuição a postos de combustíveis controlados por organização criminosa \\cite{datamarnews2025,visaoagro2025};
- **Combustível adulterado continha até 90% de metanol**, 180 vezes mais que o limite 0,5% v/v permitido pela ANP \\cite{visaoagro2025}.

---

## Intoxicação por metanol pela adulteração de bebidas com metanol

O consumidor não distingue uma bebida adulterada pelo gosto, pelo cheiro ou pela aparência — e essa similaridade é a raiz do problema de saúde pública. O diferencial, no entanto, é toxicológico: metabolizado pela álcool desidrogenase a formaldeído e depois a ácido fórmico, o metanol causa acidose metabólica e lesão irreversível do nervo óptico e dos núcleos putaminais \\cite{pohanka2019,mcmartin2015,mcmartin2024}.

- **Dose potencialmente letal** em adulto: \~30 mL de metanol puro; \~10 mL já podem causar cegueira permanente \\cite{rietjens2014,elbakary2010}.
- **Concentrações sanguíneas letais**: 118–257 mg/dL; mortalidade de até 50 % em hospitais com diagnóstico limitado \\cite{alnefaie2024,alqurashi2023}.
- **Latência clínica** típica: 12–24 h, seguida de acidose, alterações visuais ("visão em nevada"), convulsões e coma.
- **Crise no Brasil**: entre setembro e novembro de 2025, o Brasil registrou 890 notificações de intoxicação por metanol em bebidas alcoólicas, das quais 73 casos foram confirmados em sete estados, resultando em 22 óbitos — com São Paulo concentrando cerca de 68% dos casos confirmados (50) e 10 das mortes.
- **Alerta OPAS/OMS (out. 2025)**: envenenamentos em pelo menos cinco países das Américas, com mais de 200 casos suspeitos no Brasil por bebidas destiladas adulteradas \\cite{opas2025}.
- **Tratamento**: inibidores competitivos da ADH — etanol terapêutico ou, preferencialmente, fomepizol (ataque 15 mg/kg; manutenção 10 mg/kg a cada 12 h) \\cite{megarbane2010,hantson1999,eapcct2023}.
- **Agravantes na América Latina**: fomepizol é **caro e de baixa disponibilidade** \\cite{eapcct2023,zakharov2014}; confirmação analítica por GC-FID / GC-MS é restrita a laboratórios oficiais, com tempos de resposta de horas a dias.
- **2026 balanço até 3 de fevereiro**: continuidade da crise. 7 casos confirmados e 13 em apuração. Dois óbitos, um na Bahia e outro em São Paulo.

A conclusão prática é que o ganho clínico e epidemiológico mais alto não vem de tratar melhor quem já se intoxicou, e sim de **impedir que a bebida adulterada chegue ao consumidor**. Isso exige ferramentas de triagem rápidas, baratas e disponíveis em campo.

---

## O estado atual da identificação e quantificação de metanol em bebidas e combustíveis

As técnicas analíticas disponíveis para identificação e quantificação de metanol em bebidas e combustíveis são, no essencial, as mesmas — mudam a norma que as regula (AOAC e farmacopeias nacionais para bebidas; ABNT NBR 16041 e Res. ANP 907/2022 para combustíveis) e os laboratórios ou agentes que as executam. A Tabela 1 abaixo organiza essas ferramentas pelo eixo que importa para saúde pública e fiscalização em campo: disponibilidade, investimento e custo por análise.

**Tabela 1.** Ferramentas analíticas para quantificação e/ou identificação de metanol em bebidas e combustíveis e a proposta do Alcolab.

| Método | Comentário | Disponibilidade e limitações | Investimento | Custo/análise |
| --- | --- | --- | --- | --- |
| **Cromatografias instrumentais (GC-FID e GC-MS)** | Padrão-ouro confirmatório para bebidas (AOAC \\cite{aoac2023}) e combustíveis (ABNT NBR 16041 / Res. ANP 907/2022 \\cite{anp2022,abnt2012}). | Muito baixa. Disponível apenas em laboratórios estruturados e grandes centros. Resposta: horas a dias. | Alto (&gt; US$ 50 mil) | Intermediário (US$ 100–300) |
| **Sensor quimiorresistivo portátil em ar exalado** | Triagem da vítima **já exposta**, com boa correlação contra GC-MS (R² = 0,966) \\cite{vandenbroek2021}. Não analisa a bebida nem o combustível em si. | Baixa (emergência clínica). Não aplicável à análise da amostra antes do consumo ou da entrega. Resposta: 2 min. | Intermediário (US$ 5 mil–15 mil) | Alto (US$ 100/teste) |
| **Densímetro (termodensímetro, picnômetro, tubo em U oscilante)** | Método clássico de alcoolometria em bebidas (OIML R 22 / AOAC \\cite{oiml1975,osborne1913,aoac2023}) e instrumento obrigatório da fiscalização da ANP em postos revendedores de etanol combustível \\cite{anp2022,adnormas2018}. | Média. Resposta: minutos. Limitação fundamental: ρ(MeOH) ≈ ρ(EtOH) — metanol é praticamente invisível ao densímetro até \~40 % de substituição. | Baixo a intermediário (&lt; US$ 50 para termodensímetro de vidro; alguns milhares de dólares para densímetro de tubo em U oscilante) | Muito baixo (&lt; US$ 1) |
| **Técnicas espectroscópicas (NIR, FTIR-ATR, Raman)** | LOD típico de 2,5–6 % m/m; existem versões portáteis comerciais, **vantagem prática para fiscalização em campo** \\cite{lachenmeier2021,carneiro2008,silva2012}. | Baixa (operação especializada). Pode exigir calibração multivariada e matrizes bem comportadas. Resposta: 1–15 min. | Intermediário a alto (US$ 15 mil–US$ 150 mil) | Baixo (US$ 3–15) |
| **Colorimetria (permanganato / ácido cromotrópico / ISO 1388-8)** | Triagem qualitativa de baixíssimo custo (ISO 1388-8 \\cite{anp2022} para combustíveis; ácido cromotrópico / permanganato para bebidas). | Alta. Sujeita a interferências de matriz: congêneres naturais e pigmentos em destilados envelhecidos, licores e bebidas coloridas geram falsos positivos; amostras muito diluídas geram falsos negativos. Resposta: 5–15 min. | Muito baixo (&lt; US$ 50, reagentes e vidraria) | Muito baixo (&lt; US$ 1) |
| **AlcoLab (densidade + viscosidade em seringa e balança)** | Triagem **qualitativa e semiquantitativa**: detecta metanol acima de \~5 % m/m (LOD pode ser reduzido com recalibração) e estima a composição ternária água–etanol–metanol; gratuito, *open source* (AGPL-3.0), executa no navegador e funciona offline. Aplicável tanto a bebidas quanto a etanol combustível. | Alta (usuário final, fiscal, profissional de saúde pública). Resposta: 10–20 min. | Muito baixo (&lt; US$ 30, seringa, balança, termômetro) | Baixíssimo (\~US$ 0,00; não utiliza reagentes químicos e o padrão de calibração é a água) |

Em um extremo, a cromatografia é o padrão-ouro — precisa, exata, regulatoriamente aceita para autuação administrativa e judicial — mas restrita a laboratórios oficiais, com tempo de resposta em horas a dias que não serve à decisão rápida em campo. No extremo oposto, a colorimetria é barata e imediata, mas sofre interferências de matriz que comprometem seu uso em destilados envelhecidos, licores, bebidas coloridas e amostras muito diluídas. Entre os dois, as técnicas espectroscópicas portáteis (NIR, FTIR, Raman) oferecem um compromisso interessante, mas ainda operam em faixa de dezenas a centenas de milhares de dólares e podem exigir calibração multivariada específica para cada matriz.

No lado clássico da fiscalização, o densímetro — instrumento obrigatório da ANP em postos revendedores e método centenário de alcoolometria em bebidas — tem uma limitação fundamental: é incapaz de detectar metanol enquanto a substituição se mantém abaixo de \~40%, porque ρ(MeOH) ≈ ρ(EtOH). O sensor quimiorresistivo em ar exalado, por sua vez, triage a vítima já exposta, não a amostra antes do consumo ou da entrega.

A lacuna é evidente e simétrica nos dois domínios: falta uma ferramenta que o usuário final, o fiscal ou o profissional de saúde pública possa usar em campo, sem reagentes, com custo na casa de algumas dezenas de reais, para triar bebida ou combustível **antes** que a amostra chegue ao consumidor ou ao tanque. **É nessa lacuna que o AlcoLab se insere — com o mesmo método físico (densidade + viscosidade) aplicável aos dois contextos.**

---

## Densidade: forte para quantificar álcool, insuficiente para discriminar metanol

### Por que a densidade funciona tão bem para soluções hidroalcoólicas

A densidade de uma mistura líquida depende do volume molar dos seus componentes e das interações moleculares entre eles. Para o sistema binário água-etanol, a dependência da **densidade com o teor alcoólico é monotônica e suave** entre 0 e 100 % de etanol. Essa robustez explica por que a densitometria é o método universal de quantificação de etanol em bebidas há mais de um século \\cite{osborne1913,oiml1975,aoac2023}, e é também o motivo pelo qual a ANP, na Resolução nº 907/2022, adota a massa específica a 20 °C como um dos importantes parâmetros físico-químicos de qualidade do etanol hidratado combustível (EHC), com faixa especificada de 807,6 a 811,0 kg/m³ \\cite{anp2022,adnormas2018}.

As compilações de referência seguem três linhagens: (i) metrológica europeia — tabelas de Osborne, McKelvy e Bearce (1913), adotadas pela OIML na recomendação OIML R 22 (*International Alcoholometric Tables*); (ii) compêndios AOAC International e farmacopeias nacionais (USP, Farm. Bras., EP), ajustados a ±0,01 °GL para fins regulatórios; (iii) modelos preditivos calibrados com densímetros de tubo em U oscilante (Anton Paar DMA 4500/5000/5001), em que desvios de 0,00002 g/cm³ propagam-se em ±0,01 %m/m de etanol \\cite{lachenmeier2021,lopesjesus2006,osborne1987}.

Em equipamento de rotina, três instrumentos dominam o cenário:

- **Alcoômetros e picnômetros de vidro**: custo baixíssimo, mas exatidão limitada (±0,5 °GL em alcoômetros comerciais).
- **Densímetros portáteis de tubo em U oscilante**: exatidão ≈ 0,001 g/cm³, custo USD 3000–15000.
- **Densímetros de bancada Anton Paar**: padrão metrológico (±0,00005 g/cm³), inviáveis fora de laboratório.

![Instrumentos utilizados na determinação alcoólica de etanol: picnômetro, alcôometro, densímetro portátil, densímetro de alta resolução](/images/blog/densimetro-picnometro-alcoometro-1776448066389.png)

Para o AlcoLab, a exigência não é exatidão metrológica absoluta, e sim uma **densidade relativa ρ/ρ\_H₂O bem estimada a partir de um densímetro comum ou de pesagem simples em balança com resolução 0.1g** (podendo ser até de uso doméstico). É o suficiente para restringir a busca ternária por viscosidade, como se verá adiante.

### Por que a densidade, sozinha, não basta para metanol — e consequência para a triagem

Considere as densidades absolutas puras a 20 °C: $\rho(\text{H}_2\text{O}) = 0{,}9982$ g/cm³; $\rho(\text{EtOH}) = 0{,}7893$ g/cm³; $\rho(\text{MeOH}) = 0{,}7914$ g/cm³. O contraste entre os dois álcoois é de **apenas $0{,}0021$ g/cm³ ($\approx 0{,}26$ %)**, muito abaixo do limite de detecção de qualquer densímetro doméstico e mesmo abaixo da precisão típica de densímetros portáteis de ±0,001 g/cm³.

Formalmente, trata-se de um problema de **não-injetividade**: seja na região típica de destilados ($w_{\text{total}}$ entre 0,25 e 0,50), seja no regime do EHC ($w_{\text{total}}$ ≈ 0,93), a densidade da mistura é praticamente independente da fração interna entre os dois álcoois. Há, portanto, infinitas composições ($w_{\text{EtOH}}$, $w_{\text{MeOH}}$) que produzem a mesma densidade. Uma mistura água-etanol de 40 % m/m é densimetricamente indistinguível de uma mistura água-metanol de 40 % m/m pela grande maioria das técnicas por densidade; no EHC, cenários de adulteração com até \~20 % de substituição por metanol produzem variação de densidade inferior à resolução de um termodensímetro de campo e da própria tolerância especificada pela ANP \\cite{anp2022}.

Estudos de referência \\cite{lachenmeier2021,lopesjesus2006} reforçam esse limite: trabalhos sobre densidade e volumes molares de excesso em misturas ternárias água-metanol-etanol \\cite{dizechi1982} mostram que a diferença entre os excessos água-etanol e água-metanol produz uma assinatura **tênue demais** para servir de vetor discriminatório em instrumento de baixo custo.

&lt;div class="destaque"&gt; 

**Consequência prática:** a densitometria clássica, apesar de seu mérito inquestionável na quantificação de etanol, **nunca foi adotada como ferramenta de triagem de metanol** — <u>seja em bebidas, seja em combustíveis</u>. A literatura de adulteração reconhece há décadas essa lacuna e recomenda, para esse fim, métodos cromatográficos confirmatórios ou como mais acessíveis e portáveis as técnicas espectroscópicas (NIR, FTIR-ATR, Raman) \\cite{lachenmeier2021,carneiro2008,silva2012}, que, embora portáteis, têm custo de aquisição elevado e raramente estão disponíveis para fiscalização municipal ou para inspeção rotineira em postos revendedores. **Faltava a combinação de uma segunda grandeza física**, que a metodologia aqui proposta \[e embarcada no AlcoLab\] introduz na forma da viscosidade relativa medida em seringa com agulha 22G. A densidade, longe de ser abandonada, assume papel fundamental: **restringe drasticamente a região do espaço de composições** em que a amostra pode estar, direcionando a busca pela viscosidade.

&lt;/div&gt;

---

## Viscosidade: a grandeza que separa metanol de etanol

Diante da inviabilidade de usar apenas a densidade, os autores iniciaram uma investigação sistemática de **propriedades físicas simples, mensuráveis em campo, que discriminassem os dois álcoois**. A viscosidade emergiu como a candidata natural.

A viscosidade dinâmica μ é, em termos macroscópicos, a resistência ao escoamento sob tensão de cisalhamento; microscopicamente, é determinada pela frequência de saltos moleculares e pela eficiência do empacotamento. Os valores puros a 20 °C são:

- $\mu(\text{H}_2\text{O}) = 1{,}002$ mPa·s
- $\mu(\text{MeOH}) = 0{,}554$ mPa·s
- $\mu(\text{EtOH}) = 1{,}200$ mPa·s

O contraste entre os dois álcoois é **enorme**: $\mu(\text{EtOH})$ é mais de **duas vezes** $\mu(\text{MeOH})$. Essa diferença não é acidental — reflete a forte contribuição do grupo metila adicional do etanol à energia de ativação do escoamento (dominada por interações dispersivas C–H⋯H–C e por volume livre menor). A viscosidade oferece, portanto, um **fator de discriminação muito superior ao da densidade**, tanto no regime dos destilados quanto no regime do etanol combustível.

### O desvio da viscosidade em misturas aquosas

Quando os álcoois são misturados à água, a viscosidade **não se comporta de maneira simples**. Para os dois binários de interesse — água-metanol e água-etanol — a viscosidade **passa por um máximo acentuado em composição intermediária**: cerca de $x_{\text{EtOH}}$ ≈ 0,65–0,75 para água-etanol ($\mu_{\text{max}}$ ≈ 2,5–2,9 mPa·s) e $w_{\text{MeOH}}$ ≈ 0,70 para água-metanol ($\mu_{\text{max}}$ ≈ 1,5–1,7 mPa·s), como se observa no gráfico abaixo. O desvio positivo em relação à média ponderada é manifestação direta da **reorganização da rede de pontes de hidrogênio**: a água se estrutura ao redor das cadeias alifáticas do álcool (*clusters* hidrofóbicos), criando arranjos metaestáveis que aumentam a fricção \\cite{dizechi1982,guevaracarrion2011,grunberg1949,redlich1948}. Acima de \~50 % m/m de álcool, a estrutura da água é progressivamente desmontada e a viscosidade decresce.

<img src="/images/blog/desvio_viscosidade_agua_alcool_jpg-1776449789711.jpg" alt="Desvio da viscosidade em relação à média em sistemas binários água-álcool (etanol, metanol e propanol)" style="max-width:75%;margin:0 auto;display:block" />

Apesar desse comportamento não ideal, **a grande diferença absoluta entre etanol e metanol puros mantém a discriminação em misturas**. Uma mistura água-etanol a 40 % m/m exibe viscosidade próxima de 2,5 mPa·s a 20 °C, enquanto uma mistura água-metanol na mesma proporção fica em torno de 1,5 mPa·s — **uma diferença de quase 70 %**. Isso se traduz em tempos de escoamento bem distintos no mesmo sistema capilar. O mesmo princípio se aplica a misturas ternárias: duas amostras com a mesma fração total de álcool, mas com predominância de etanol em uma e de metanol na outra, apresentarão tempos de escoamento marcadamente diferentes — seja no regime de bebidas destiladas (0,25 ≲ $w_{\text{total}}$ ≲ 0,50), seja no regime do EHC ($w_{\text{total}}$ ≈ 0,93). **É essa separação que o AlcoLab explora.**

---

## O AlcoLab: proposta, autores, princípio de funcionamento

O AlcoLab é uma ferramenta web **gratuita, *open-source* e offline-capable**, desenvolvida pelos autores **Diego Mendes de Souza, Pedro Augusto de Oliveira Morais e Nayara Ferreira Santos**. O aplicativo executa o pipeline analítico **inteiramente no navegador via Pyodide** (Python compilado para WebAssembly), sem envio de dados a servidores, e funciona em qualquer smartphone atual.

**Insumos físicos necessários:**

- **uma seringa comercial** descartável de 20 mL com agulha 22G (o tipo mais comum em farmácias);
- **uma balança** com resolução mínima de 0,1 g (pode ser substituído por um densímetro);
- **um smartphone**;
- um termômetro, seu uso pode ser dispensado pela estabilização da temperatura da amostra e da água.

![Instrumentos para análise no Alcolab: seringa com agulha, balança 0.1g, smartphone](/images/blog/instrumentos-alcolab-1776450466709.png)

**Princípio:** a análise combina duas grandezas físicas complementares.

- A **densidade relativa** — obtida diretamente por densímetro ou pela pesagem de um volume calibrado da amostra contra água — fornece o **teor alcoólico total** (w, fração mássica de álcool) com precisão suficiente para restringir a região do espaço de composições em que a amostra se encontra.
- A **viscosidade aparente relativa** — obtida pelo tempo de escoamento gravitacional pela seringa — fornece uma segunda grandeza que, diferentemente da densidade, **discrimina metanol e etanol**.

A combinação das duas permite estimar a composição ternária água-etanol-metanol mais compatível com as medidas e, em consequência, identificar amostras com metanol acima de um limiar de segurança. O mesmo princípio se aplica tanto à triagem de bebidas destiladas quanto à triagem de etanol combustível.

> #### **A densidade diz quanto álcool há ao todo; a viscosidade diz que álcool é ou a contribuição de cada um.**

---

## Passo a passo analítico do AlcoLab

### Entrada e normalização

O fluxo começa com o perfil do usuário (leigo, técnico ou laboratório), que adapta a granularidade da interface, e com os metadados da amostra (tipo, teor de rótulo em °GL / %v/v / %m/m, marca, lote). A validação é feita por *schema* Zod que rejeita valores fora de ranges físicos plausíveis. Internamente, toda composição passa a ser expressa em **fração mássica** e toda temperatura em °C. A conversão %v/v → %m/m usa tabela interpolada a 20 °C (`conversao_vv_para_wE_20C.csv`); bebidas ou amostras de EHC rotuladas em °GL / °INPM a temperatura ≠ 20 °C passam primeiro por correção via `densidade_alcool_gl20a30.csv`.

### Medição de densidade (Fluxo 1)

1. Tarar a balança com a seringa vazia (ou registrar e subtrair).
2. Aspirar exatamente 10,0 mL de água; pesar; registrar $m_{\text{água}}$.
3. Aspirar exatamente 10,0 mL da amostra (após enxágue com a própria amostra); pesar; registrar $m_{\text{amostra}}$.

Densidade relativa: $`ρ_rel = m_{\text{amostra}} / m_água` $. Com balança de 0,1 g, a incerteza típica é ±0,005 em $\rho_{\text{rel}}$, equivalente a **±0,5–1 % em teor alcoólico em massa** — suficiente para o papel da densidade no método (direcionar a busca na malha de viscosidade, não quantificar álcool com precisão metrológica).

A conversão $\rho_{\text{rel}}$ → w\_álcool faz busca inversa **simultânea** nas malhas binárias EtOH–H₂O e MeOH–H₂O a 20 °C, retornando (w_EtOH_equiv, w_MeOH_equiv). A média é usada como estimativa pontual de $w_{\text{total}}$ e o intervalo entre os dois valores fornece a faixa possível — abordagem deliberadamente conservadora dada a quase coincidência das duas curvas binárias.

### Medição de temperatura

O usuário registra a temperatura da água e da amostra, podendo distinguir em até 3ºC (app faz correção da viscosidade em função da temperatura entre 20 e 30ºC). Pode optar por não registrar desde que garanta equalização de temperatura entre água e amostra. Neste caso, o software orienta o usuário ao tempo mínimo para se atingir a estabilidade térmica.

### Medição de viscosidade (Fluxo 2)

O usuário cronometra **dois (ou mais)** tempos de escoamento de um volume fixo (padrão 10 mL) da água e da amostra na mesma seringa+agulha. O app calcula o CV entre repetições; se $CV &gt; 5$ %, alerta e recomenda repetir. Os tempos médios alimentam um pipeline de três etapas (viscosidade absoluta aparente por Hagen–Poiseuille → correção relativa à água → normalização térmica para 20 °C) que resulta na **viscosidade da amostra corrigida e referenciada a 20 °C**, pronta para consulta na malha.

### Densidade como "norte" para viscosidade: por que é o ponto-chave

### Densidade como "norte": por que é o ponto-chave

A malha ternária do AlcoLab é uma superfície curva em ($w_{\text{total}}$, $z_{\text{MeOH}}$). A **Figura 1** mostra um corte dessa malha a 20 °C, com a viscosidade no eixo vertical e a fração mássica total de álcool no eixo horizontal.

![Figura 1. Malha de viscosidade a 20 °C: cortes entre os binários água-metanol e água-etanol, com regiões de aplicação destacadas e duas amostras hipotéticas de mesma viscosidade experimental separadas pela densidade.](/images/blog/malha-viscosidade-alcolab-e-exemplos-1776452778248.jpg)

**Como ler a figura.** As curvas representam, de cima para baixo:

- A curva no topo ($z_{\text{MeOH}} = 0$) é o **binário água-etanol**: vai do ponto "Água" na origem (à esquerda, onde μ ≈ 1,0 mPa·s) até o ponto "Etanol" no canto direito superior.
- A curva na base ($z_{\text{MeOH}} = 1$) é o **binário água-metanol**: parte do mesmo ponto "Água" e termina no ponto "Metanol" no canto direito inferior, com viscosidade sensivelmente menor que o etanol puro.
- Entre as duas, nove curvas intermediárias ($z_{\text{MeOH}} = 0{,}1$ a $0{,}9$) descrevem **misturas ternárias água–etanol–metanol** com proporção crescente de metanol no álcool total. Todas partem do mesmo ponto (água pura) e vão se separando à medida que o teor alcoólico aumenta, refletindo a diferença de viscosidade entre os dois álcoois puros discutida na seção anterior.

**Três regiões em destaque na figura.**

- **Região de menor poder discriminatório** (elipse à esquerda, $w_{\text{total}}$ ≲ 0,10): as curvas estão praticamente superpostas — há pouca diferença prática e numérica entre as curvas binárias água-etanol, água-metanol e todas as possibilidades ternárias. Na prática, fica estatisticamente difícil distinguir se apenas um álcool presente ou qual proporção de cada um. Por isso, em amostras muito diluídas é comum os resultados demonstrarem diferentes composições em termos de participantes (água e um dos álcoois, e uma composição ternária) são possíveis e estatisticamente equivalentes.
- **Região de maior aplicação a bebidas destiladas** (elipse central, $w_{\text{total}}$ ≈ 0,25–0,50): destilados típicos (cachaça, vodka, gim, whisky) ficam nessa faixa, em que a separação vertical entre as curvas é muito satisfatória (maior poder discriminante).
- **Região de maior aplicação a etanol combustível** (elipse à direita, $w_{\text{total}}$ ≈ 0,90–0,95): concentra o EHC, onde a separação entre as curvas também é muito satisfatória e, portanto, suficiente para discriminar adulterações ≳ 5 % de metanol.

**O problema da ambiguidade da viscosidade - e como a medida de densidade o resolve.** Imagine uma medida experimental de viscosidade $\mu^ \approx 1{,}2$ mPa·s (linha horizontal tracejada na figura). Se apenas a viscosidade fosse consultada, a malha ofereceria **duas soluções plausíveis completamente opostas**, marcadas com X:

- **Amostra 1**, à esquerda: $w_{\text{total}}$ ≈ 0,25, sobre a curva marrom ($z_{\text{MeOH}}$ intermediário) — caracterizaria uma **bebida destilada de teor médio que sofreu adulteração e apresenta metade do alcool total como etanol e outra metade metanol**.
- **Amostra 2**, à direita: $w_{\text{total}}$ ≈ 0,92, sobre uma curva alta ($z_{\text{MeOH}}$ alto) — caracterizaria um **etanol combustível não adulterado**.

São composições **quimicamente opostas**, em domínios analíticos opostos, mas produzem o mesmo tempo de escoamento pela seringa por apresentarem mesma viscosidade. A viscosidade sozinha não resolveria; a densidade sozinha também não — como visto na seção sobre densidade, o contraste de 0,26 % entre os dois álcoois puros está abaixo da resolução de qualquer balança doméstica.

É justamente da combinação das duas que nasce uma decisão mais discriminatória na identificação da composição hidroalcoólica. A densidade atua como **filtro de região**: a pesagem simultânea do volume calibrado informa $w_{\text{total}}$ a priori, com incerteza típica de ±1–3 %. O AlcoLab, por construção, **restringe a busca na malha a uma janela de ±3 % em torno do $w_{\text{total}}$ estimado pela densidade**. As duas hipóteses acima, portanto, **não se confundem**: se a densidade aponta para a vizinhança da Amostra 1, toda a região da Amostra 2 é descartada de imediato (e vice-versa). Só depois desse filtro a viscosidade é consultada, para escolher — dentro da janela compatível — qual composição explica melhor $\mu^\*$.

No caso específico do EHC, $w_{\text{total}}$ é conhecido a priori por especificação regulatória (cerca de 0,93) e o filtro de densidade atua com ainda mais força: a busca fica restrita à faixa direita do gráfico, e a viscosidade fica exclusivamente encarregada de estimar a fração de metanol no álcool total.

A malha ternária é uma superfície curva em ($w_{\text{total}}$, $z_{\text{MeOH}}$). Para uma viscosidade $\mu^*$* experimental, o conjunto de composições compatíveis **não é um ponto — é uma curva de nível**, com centenas de candidatas espalhadas na malha.

Por exemplo, para $\mu^*$ = 1,80 mPa·s a 20 °C, a curva C($\mu^*$) cobre desde:

- **Bebidas de baixo teor com domínio de etanol** ($w_{\text{total}}$ ≈ 0,25–0,35; $z_{\text{MeOH}}$ ≈ 0–0,2);
- até **bebidas de alto teor com domínio de metanol** ($w_{\text{total}}$ ≈ 0,55–0,70; $z_{\text{MeOH}}$ ≈ 0,7–1,0).

São composições **quimicamente opostas** que produzem o mesmo tempo de escoamento. A densidade sozinha não discrimina; a viscosidade sozinha também não. A densidade entra como **filtro de região**: se a medida informa $w_{\text{total}}$ ≈ 0,40 ± 0,03, a segunda região é eliminada automaticamente. Só então a viscosidade é consultada para escolher, dentro da faixa compatível, qual composição explica melhor $\mu^\*$. No caso do EHC, onde $w_{\text{total}}$ é conhecido a priori e está tipicamente próximo de 0,93, o filtro de densidade atua com ainda mais força, e a viscosidade fica encarregada de estimar a fração de metanol na mistura alcoólica.

### Cálculo e exibição

O Web Worker carrega o runtime Pyodide (5–10 s na primeira chamada) e executa: (i) `app_w_alcool_v2.py` → $w_{\text{total}}$ a partir da densidade; (ii) `main.py` + `processamento.py` → pipeline de correção, consulta à malha, composição ternária mais compatível e análise estatística. O resultado é serializado para exibição em `results/page.tsx`.

---

## A camada estatística do AlcoLab

### Por que uma camada estatística específica é necessária

A saída bruta do pipeline é a "composição mais compatível" com ($w_{\text{total}}$, μ\_relativa). Não basta: o usuário final precisa saber se (i) essa composição é **estatisticamente melhor** que a hipótese "sem metanol" e (ii) **quão confiável** é essa decisão frente à incerteza das medidas em seringa e balança.

O AlcoLab responde à primeira pergunta com um **teste t-Student bilateral** e à segunda com uma **simulação de Monte Carlo com 3 000 replicatas**.

### Métodos

**Teste t-Student / Welch \\cite{wang2023}.** Para n ≥ 2 repetições:

$$
t = \frac{\bar{\mu}*{\text{exp}} - \mu*{\text{ref}}}{s_{\mu} / \sqrt{n}}
$$

Decisão bilateral com α = 0,05; rejeita $H_0$ (mistura idêntica à referência) se |t| excede $t_{0{,}025,, n-1}$. Com n = 1, o app cai em aproximação normal (z-score) com SD default = 0,025 mPa·s relativo. Correção de Welch é invocada automaticamente quando há heterocedasticidade forte entre amostra e referência \\cite{domanska2009,haghbakhsh2021}.

**Monte Carlo para propagação de incerteza.** Formalizada em GUM S1 \\cite{jcgm2008gum,jcgm2008mc,cox2006}, é o padrão quando (a) a relação entrada/saída é fortemente não-linear ou (b) as distribuições não são gaussianas. Ambas as condições se aplicam: a malha é não-linear em (w, z) e a medida em seringa tem distribuição aproximadamente normal mas com caudas por falhas operacionais pontuais. Estudos comparando GUM analítico com MC \\cite{jcgm2008mc,cox2006} mostram que em problemas multivariados não-lineares o MC captura **covariâncias e assimetrias** que o GUM linearizado subestima; aplicações em copulas \\cite{possolo2010} e forense \\cite{liu2011} validam a abordagem. 3 000 replicatas rodam em &lt; 1 s em navegador moderno.

### Implementação e hipóteses comparadas

Parâmetros fixados em código: `MC_N_DEFAULT = 3000`; `ALPHA_MEDIA = 0,05`; `P_CUTOFF_HIGH_SELECTIVITY = 0,70`; `P_CUTOFF_LOW_SELECTIVITY = 0,80`; `W_LOW_SELECTIVITY = 0,20`; `SD_DEFAULT_N1 = 0,025`; `MALHA_SIGMA_DEFAULT = 0,0` (reservado para um σ por célula futuro).

O núcleo de `_avaliar_amostra` gera `mu_sims = N(μ_mean, μ_se, size=3000)` e, para cada hipótese H_k, calcula $\chi^2_{i,k}$ contra a viscosidade prevista pela malha. A hipótese vencedora por replicata é contada; a probabilidade posterior é a fração de vitórias. A semeadura do RNG é feita por **CRC32 do identificador da amostra**, garantindo reprodutibilidade cross-platform (importante para auditabilidade em perícia).

**Hipóteses comparadas em paralelo** (dentro da faixa de $w_{\text{total}}$ direcionada pela densidade):

- **$H_{\text{tern}}$:** composição ternária mais compatível (permite todos os três componentes);
- **$H_{\text{EtOH}}$:** binário água-etanol ($z_{\text{MeOH}}$ = 0);
- **$H_{\text{MeOH}}$:** binário água-metanol ($z_{\text{MeOH}}$ = 1);
- **$H_{\text{trace}}$:** traços (1–5 % m/m) de um álcool no outro — para capturar adulteração leve.

**Decisão conservadora:**

- Se $P(H_{\text{EtOH}})$ ≥ $P_{\text{cutoff}}$ → "compatível com etanol apenas".
- Se $P(H_{\text{tern}})$ ≥ $P_{\text{cutoff}}$ **e** $z_{\text{MeOH}}$ na composição mais compatível &gt; 5 % m/m → "incompatível" (provável adulteração).
- Casos intermediários → amarelo, recomenda repetir.

### Sensibilidade efetiva por faixa

Em **$w_{\text{total}}$ ≤ 0,20** as duas bordas binárias se aproximam (ambas tendem a μ da água), e o teste fica naturalmente menos seletivo. O app eleva o *cut-off* de 0,70 para 0,80 e inclui hipóteses de traços 1–5 %. Resultado prático:

- **$w_{\text{total}}$ 0,30–0,60** (destilados típicos — cachaça, vodka, gim, whisky): sensibilidade a $z_{\text{MeOH}}$ ≥ 5 % com confiança ≥ 70 %.
- **$w_{\text{total}}$ 0,15–0,30** (licores, cervejas fortes): sensibilidade a $z_{\text{MeOH}}$ ≥ 10 % com confiança ≥ 80 %.
- **$w_{\text{total}}$ &lt; 0,15** (bebidas muito diluídas): "álcool detectado, discriminação inconclusiva"; recomenda análise complementar.
- **$w_{\text{total}}$ ≈ 0,93** (etanol hidratado combustível): regime de alto teor, com as duas bordas binárias ainda suficientemente separadas em viscosidade — sensibilidade compatível com a detecção de $z_{\text{MeOH}}$ ≥ 5–10 %, faixa que abrange todos os cenários documentados na Operação Carbono Oculto (20–90 % de metanol).

### Semáforo final

Integra três blocos em `semaphoreLogic.ts`:

1. **Qualidade experimental** (`experimentApproved`): ≥ 2 repetições, CV ≤ 5 %, $R^2 \geq 0{,}99$ se houver vídeo+IA, μ da água de referência dentro de ±15 % do tabelado.
2. **Compatibilidade analítica** (`compativel`): Compatible / Incompatible / Inconclusive.
3. **Semântica por tipo de amostra** (bebida vs. álcool comercial vs. etanol combustível): para bebidas, vermelho exige **ambos** "Incompatible" E "metanol alto (&gt; 5 %)" E `experimentApproved`; para EHC, a mesma lógica se aplica usando o limite regulatório da ANP (0,5 % v/v) como gatilho de vermelho quando a medida estatisticamente excede esse valor.

Por construção, é **conservadora**: vermelho só dispara quando a evidência experimental é boa, a decisão estatística é robusta e o contexto permite conclusão toxicologicamente ou regulatoriamente relevante. Amostras borderline caem em amarelo.

---

## Discussão e limitações

### Desempenho atual

Em testes de validação com amostras preparadas em laboratório com concentrações conhecidas:

- **Quantificação de $w_{\text{total}}$**: erros típicos &lt; 5 % em 0,25 ≤ $w_{\text{total}}$ ≤ 0,70.
- **Identificação de metanol &gt; 5 % m/m em amostras com $w_{\text{total}}$ ≥ 0,30**: taxa de acerto **100 %** nos conjuntos internos.
- **Falsos positivos em amostras legítimas**: próximos de zero, graças ao semáforo conservador.
- **Aplicabilidade a etanol combustível**: o princípio físico é o mesmo — validação formal em amostras reais de EHC, em conjunto com a ANP e laboratórios credenciados, é um dos próximos passos do projeto.

### Por que o limiar de 5 % é clinicamente adequado em bebidas

Não é uma limitação acidental: as intoxicações graves relatadas envolvem tipicamente bebidas com **10–40 % m/m de metanol**, associadas a adulterações grosseiras para aumentar rendimento de destilados \\cite{alnefaie2024,alqurashi2023,paasma2012,vale2007}. Em quantidades pequenas (&lt; 1–2 %), o metanol **compete com o etanol pela ADH**: se o etanol está muito acima do metanol, o fígado processa preferencialmente o etanol e parte do metanol é eliminado inalterado antes da formação tóxica de formiato \\cite{megarbane2010,barceloux2002}. Além disso, traços de 0,1–1 % m/m ocorrem **naturalmente** em destilados de frutas (aguardentes, bagaceiras, grappas) e são **legalmente permitidos** (Regulamento UE 2019/787). O AlcoLab é projetado para o **perfil de risco que importa** — fraudes com substituição significativa — e não para quantificar traços inofensivos.

No caso do etanol combustível, o limite regulatório é ainda mais estreito (0,5 % v/v pela Res. ANP 907/2022 \\cite{anp2022}). O AlcoLab não pretende competir com a GC-FID na verificação desse limite regulatório nominal, mas sim fornecer triagem rápida de campo em cenários de adulteração grosseira — como os 20–90 % documentados na Operação Carbono Oculto \\cite{visaoagro2025,datamarnews2025} — que são, de longe, os de maior impacto sanitário e econômico.

### Limitações remanescentes

- **Faixa de temperatura de operação (20–30 °C):** fora dela, análise de viscosidade desabilitada; recomenda-se aguardar equilíbrio térmico.
- **Poucos pontos experimentais no interior do simplex ternário:** MAPE 4–8 % na validação externa é aceitável para triagem, não para metrologia de alta exatidão. Expandir o conjunto é o caminho mais imediato de refinamento.
- **Regiões de baixa seletividade ($w_{\text{total}}$ &lt; 0,20) e bordas extremas ($w_{\text{total}}$ &gt; 0,80):** resolução discriminatória menor; tendência a "inconclusivo". Um acréscimo futuro pode ser confirmação colorimétrica rápida (ácido cromotrópico) nessas regiões específicas.
- **Validação formal em EHC:** conduzida em parte pelos autores mas ainda pendente de estudo interlaboratorial com amostras reais de postos revendedores, em parceria com a ANP.

---

## Como o AlcoLab foi disponibilizado: licença AGPL-3.0 e estratégia de abertura

Quando a metodologia já estava estruturada e os testes experimentais confirmavam o potencial da ferramenta, a equipe enfrentou uma decisão concreta: **pedir patente** — processo de 2 a 7 anos, com proteção da invenção e possível retorno — ou **lançar imediatamente, de graça, assumindo os custos do próprio bolso**, sem garantia alguma de retorno. Havia surto ativo de intoxicações no Brasil e em outros países, vidas em risco, e uma janela de tempo que a via patentária não conseguiria atender. A equipe escolheu lançar. O AlcoLab foi ao ar em **10 de março de 2026**.

### A escolha por AGPL-3.0

O AlcoLab foi publicado sob licença **GNU AGPL-3.0** — uma das licenças de código aberto mais rigorosas disponíveis. A propriedade central da AGPL, relevante para uma ferramenta de saúde pública e de apoio à fiscalização de combustíveis, é o chamado **"copyleft de rede"**: qualquer versão modificada do código — inclusive versões executadas como serviço web por terceiros — **precisa disponibilizar publicamente o código-fonte modificado**. Isso impede que um ator privado pegue o AlcoLab, faça melhorias e as transforme em produto proprietário pago, sem devolver à comunidade o que derivou do trabalho aberto.

Na prática, a AGPL-3.0 garante três coisas ao ecossistema de saúde pública e de fiscalização:

- **A gratuidade é juridicamente sustentável.** Uma empresa pode usar o AlcoLab comercialmente, mas se o modificar para oferecer um serviço, deverá publicar a versão modificada sob a mesma licença.
- **A metodologia continua auditável.** Pesquisadores, peritos, fiscais e agentes de saúde pública podem revisar o algoritmo, validar critérios estatísticos e propor melhorias — condição essencial quando se trata de decisão que afeta consumo de bebida ou comercialização de combustível.
- **A ferramenta pode ser adaptada** a outros contextos (outros tipos de amostra, outras línguas, outras interfaces) **desde que se mantenha o compromisso de abertura**.

### Por que os autores optaram por essa abordagem

A equipe identificou três razões convergentes:

1. **Urgência de saúde pública.** Dezenas de casos no Brasil em 2025 e o alerta da OPAS/OMS em outubro de 2025 \\cite{opas2025} tornavam a janela patentária inviável eticamente.
2. **Alinhamento com o público-alvo.** A ferramenta faz mais sentido exatamente em regiões com pouca infraestrutura laboratorial — onde um produto proprietário teria adoção muito menor.
3. **Auditabilidade como requisito técnico.** Para uma ferramenta cujo resultado pode orientar consumo, denúncia, autuação ou apreensão de combustível, metodologia fechada é obstáculo científico, não vantagem competitiva.

### Proteção da prioridade e publicação científica

Abertura não significa ausência de proteção da autoria. Antes da publicação pública, a equipe executou dois passos estratégicos:

- **Depósito junto ao INPI**, fixando a data de prioridade da invenção no Brasil.
- **Publicação no Zenodo**, repositório científico internacional com DOI permanente.

Esses registros **não visam exploração comercial** — visam justamente o contrário: impedir que um terceiro reivindique a ideia como própria depois que ela já foi tornada pública. É uma proteção orientada à abertura, não ao fechamento. O código completo está em [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab).

### Primeiros resultados de adoção

Em cerca de um mês de site público, o AlcoLab registrou **quase 2 500 visitantes únicos e aproximadamente 34 000 requisições** ao servidor, com acessos em todos os continentes — Brasil, Estados Unidos, China, França, Canadá, Singapura e Suíça, entre outros. A adesão internacional confirma o que a equipe suspeitava: **a contaminação por metanol não é um problema exclusivamente brasileiro**; é global, especialmente em países com fiscalização e infraestrutura laboratorial limitadas, e atinge tanto bebidas quanto combustíveis.

---

## Parcerias necessárias e riscos ao projeto

### O custo real da gratuidade

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

### Riscos reais de um projeto sem suporte institucional

Projetos *open source* sem apoio institucional têm um histórico conhecido: desenvolvedores voluntários se sobrecarregam, manutenção se acumula, atualizações deixam de ser feitas e a infraestrutura vai ficando vulnerável. O resultado é o que o meio chama de **abandonware** — software que existe, mas não tem mais ninguém por trás. Para uma ferramenta de saúde pública e de apoio à fiscalização de combustíveis, esse desfecho é particularmente grave: a continuidade depende de manutenção ativa (atualização de dependências, correções de segurança, novos pontos de calibração, adaptação a novos tipos de bebida ou de combustível). **É esse cenário que a equipe quer evitar** — precisamente porque acredita no impacto positivo da ferramenta.

### Parcerias com laboratórios oficiais

A primeira frente de parcerias buscada é com **laboratórios oficiais de metrologia legal e institutos de pesquisa** — INMETRO no Brasil, CENAM no México, equivalentes em outros países, universidades públicas com infraestrutura reológica (cone-placa, Ubbelohde, rheomat). O objetivo é:

- **Aumentar o número de pontos de calibração** no interior do simplex ternário, substituindo parte da derivação RK-mid por medidas experimentais diretas e **refinando o termo de excesso** em toda a faixa de $w_{\text{total}}$, inclusive na região do EHC.
- Conduzir **estudos de precisão interlaboratorial e entre analistas**, quantificando a reprodutibilidade real do método em condições de fiscalização.
- **Aumentar a robustez e a confiabilidade da malha experimental**, devolvendo ao usuário final resultados mais assertivos e estatisticamente qualificados.
- Padronizar um **lote de referência de seringas+agulhas** para triagem analítica, reduzindo a variabilidade absorvida hoje pela correção relativa à água.

### Parcerias com instituições de fiscalização

A segunda frente é com **instituições relacionadas à fiscalização de bebidas e combustíveis** — Vigilância Sanitária, Polícia Civil, Procon, MAPA, **ANP**, Anvisa. O objetivo aqui é bidirecional: (i) disponibilizar a ferramenta validada a agentes de campo como triagem pré-laboratorial, tanto em bebidas quanto em postos revendedores de etanol combustível; (ii) **captar dos próprios usuários finais as demandas reais** — ajustes necessários, novas funcionalidades, tipos de amostra ainda não cobertos (licores, cervejas, vinhos, bebidas mistas, gasolinas), melhorias de usabilidade e integração com sistemas oficiais de notificação e com o PMQC. O ciclo de feedback com quem usa é o caminho mais curto para que o AlcoLab deixe de ser uma prova de conceito bem-sucedida e se torne um instrumento operacional da fiscalização brasileira e latino-americana.

### Outras frentes em tratativa

No âmbito internacional, foram contatados os **Médicos Sem Fronteiras** (que mantêm a *Methanol Poisoning Initiative* desde 2012), a **OPAS/OMS**, fundações como **Wellcome Trust** e **Gates Foundation**, e organismos como **BID Lab** e **STDF**. No âmbito nacional, a lista inclui **Fiocruz, MAPA, ANP, Vigilância Sanitária e parlamentares**. No campo do fomento à pesquisa, há submissões planejadas à **FAPEMA, FINEP e FAP-DF**, além de **FAPESP, CNPq e Finep** para estudos de validação em larga escala.

Nenhuma parceria está fechada ainda — o projeto é recente e as tratativas estão em curso. **O que existe de concreto é a ferramenta em si: funcional, gratuita, auditável, disponível agora**. A consolidação, universalização e disseminação dependem daqui em diante do ecossistema institucional que conseguir se formar em torno dela.

---

## Conclusão

O AlcoLab combina **densidade e viscosidade** — duas grandezas físicas simples, mensuráveis em campo com seringa, balança de cozinha e smartphone — em um pipeline analítico com camada estatística Monte Carlo, atingindo erros &lt; 5 % em teor alcoólico total e identificação consistente de metanol acima de 5 % m/m, faixa compatível com o perfil clínico das intoxicações reais e também com os cenários de adulteração grosseira documentados em etanol combustível. A malha de viscosidade foi construída experimentalmente pelos autores no mesmo sistema seringa+agulha 22G usado pelo usuário final, após a constatação de que dados da literatura — medidos em viscosímetros padronizados — não transferiam para o escoamento gravitacional em seringa descartável. A ferramenta é gratuita, *open source* sob AGPL-3.0, e seu código é auditável em [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab). A sustentabilidade e a universalização — tanto na triagem de bebidas quanto na triagem de combustíveis — dependem agora de parcerias técnicas e institucionais que os autores não têm capacidade de financiar isoladamente.

**Para apoiar, colaborar ou demandar adaptação:** \[\[email protected\]\](mailto:\[email protected\]) — e **compartilhar** com quem possa se beneficiar (consumidores, produtores, fiscais, agentes de saúde, reguladores de combustível) é, sempre, a forma mais simples de ajudar.

**AlcoLab está disponível em [alcolab.org](https://alcolab.org).Código-fonte:** [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab) · AGPL-3.0\
**Contato para parcerias:** \[\[email protected\]\](mailto:\[email protected\])

---

```bibtex
@misc{gazetadopovo2025,
  title={Falsifica{\c{c}}{\~a}o: metanol, bebidas e combust{\'\i}veis convergem com rastro de mortes, feridos e milh{\~o}es em preju{\'\i}zo},
  author={{Gazeta do Povo}},
  year={2025},
  url={https://www.gazetadopovo.com.br/brasil/falsificacao-metanol-bebidas-combustiveis-convergem-com-rastro-de-mortes-feridos-milhoes-prejuizo/},
  note={Acesso em: abr. 2026}
}

@misc{brasil2025,
  title={Com a redu{\c{c}}{\~a}o de novos casos, Governo do Brasil encerra Sala de Situa{\c{c}}{\~a}o sobre intoxica{\c{c}}{\~a}o por metanol},
  author={{Minist{\'e}rio da Sa{\'u}de}},
  year={2025},
  url={https://www.gov.br/saude/pt-br/assuntos/noticias/2025/dezembro/com-a-reducao-de-novos-casos-governo-do-brasil-encerra-sala-de-situacao-sobre-intoxicacao-por-metanol},
  note={Dez. 2025}
}

@misc{unica2026,
  title={Dados de produ{\c{c}}{\~a}o de etanol no Brasil, safra 2024/2025},
  author={{UNICA}},
  year={2026},
  url={https://unicadata.com.br/},
  note={Acesso em: abr. 2026}
}

@misc{anp2026,
  title={Programa de Monitoramento da Qualidade dos Combust{\'\i}veis --- PMQC},
  author={{ANP}},
  year={2026},
  url={https://www.gov.br/anp/pt-br/assuntos/qualidade-de-produtos/programas-monitoramento/programa-de-monitoramento-da-qualidade-dos-combustiveis},
  note={Acesso em: abr. 2026}
}

@misc{argusmedia2025,
  title={Viewpoint: Brazil methanol market adapts to spot price},
  author={{Argus Media}},
  year={2025},
  url={https://www.argusmedia.com/en/news-and-insights/latest-market-news/2771339-viewpoint-brazil-methanol-market-adapts-to-spot-price}
}

@misc{novacana2025b,
  title={MP identificou importa{\c{c}}{\~a}o irregular de metanol pelo PCC para adulterar combust{\'\i}veis},
  author={{NovaCana}},
  year={2025},
  url={https://www.novacana.com/noticias/mp-identificou-importacao-irregular-metanol-pcc-adulterar-combustiveis-280825},
  note={28 ago. 2025}
}

@misc{datamarnews2025,
  title={Brazil Cracks Down on Fuel Fraud Scheme Linked to PCC, Illegal Methanol Imports Through Paranagu{\'a} Port},
  author={{DatamarNews}},
  year={2025},
  url={https://datamarnews.com/noticias/brazil-cracks-down-on-fuel-fraud-scheme-linked-to-pcc-illegal-methanol-imports-through-paranagua-port/}
}

@misc{visaoagro2025,
  title={Combust{\'\i}vel do PCC tinha at{\'e} 90\% de metanol; ANP permite s{\'o} 0,5\%},
  author={{Vis{\~a}o Agro}},
  year={2025},
  url={https://visaoagro.com.br/combustivel-do-pcc-tinha-ate-90-de-metanol-anp-permite-so-05/}
}

@article{pohanka2019,
  title={Antidotes Against Methanol Poisoning: A Review},
  author={Pohanka, Miroslav},
  journal={Mini-Reviews in Medicinal Chemistry},
  volume={19},
  number={14},
  pages={1126--1136},
  year={2019}
}

@article{mcmartin2015,
  title={Antidotes for poisoning by alcohols that form toxic metabolites},
  author={McMartin, Kenneth E and Jacobsen, Dag and Hovda, Knut Erik},
  journal={British Journal of Clinical Pharmacology},
  volume={81},
  number={3},
  pages={505--515},
  year={2015}
}

@article{mcmartin2024,
  title={Antidotes for poisoning by alcohols that form toxic metabolites (updated review)},
  author={McMartin, Kenneth E and Jacobsen, Dag and Hovda, Knut Erik},
  journal={British Journal of Clinical Pharmacology},
  volume={90},
  number={9},
  pages={2077--2088},
  year={2024}
}

@article{rietjens2014,
  title={Ethylene glycol or methanol intoxication: which antidote should be used, fomepizole or ethanol?},
  author={Rietjens, Saskia J and de Lange, Dylan W and Meulenbelt, Jan},
  journal={Netherlands Journal of Medicine},
  volume={72},
  number={2},
  pages={73--79},
  year={2014}
}

@article{elbakary2010,
  title={Ranitidine as an alcohol dehydrogenase inhibitor in acute methanol toxicity in rats},
  author={El-Bakary, Abla and others},
  journal={Human and Experimental Toxicology},
  volume={29},
  number={2},
  pages={93--101},
  year={2010}
}

@article{alnefaie2024,
  title={Methanol intoxication in the central region of Saudi Arabia: Five case studies},
  author={Alnefaie, Sulaiman A and others},
  journal={Saudi Pharmaceutical Journal},
  volume={32},
  number={3},
  pages={102018},
  year={2024}
}

@article{alqurashi2023,
  title={Case Reports Study on Methanol Poisoning in King Abdul Aziz Specialist Hospital},
  author={Alqurashi, Ghadah I and others},
  journal={Journal of Clinical Medicine},
  volume={12},
  number={13},
  pages={4282},
  year={2023}
}

@misc{opas2025,
  title={Alerta Epidemiol{\'o}gico: Envenenamento por Metanol nas Am{\'e}ricas},
  author={{Organiza{\c{c}}{\~a}o Pan-Americana da Sa{\'u}de (OPAS/OMS)}},
  year={2025},
  note={Washington, DC: PAHO; out. 2025}
}

@article{megarbane2010,
  title={Treatment of patients with ethylene glycol or methanol poisoning: focus on fomepizole},
  author={M{\'e}garbane, Bruno},
  journal={Open Access Emergency Medicine},
  volume={2},
  pages={67--75},
  year={2010}
}

@article{hantson1999,
  title={Methanol poisoning and organ transplantation},
  author={Hantson, Philippe and others},
  journal={Transplantation},
  volume={68},
  number={1},
  pages={165--167},
  year={1999}
}

@article{eapcct2023,
  title={Position paper on the treatment of methanol poisoning},
  author={{European Association of Poisons Centres and Clinical Toxicologists}},
  journal={Clinical Toxicology},
  volume={61},
  number={1},
  pages={1--13},
  year={2023}
}

@article{zakharov2014,
  title={Intermittent hemodialysis is superior to CVVHD/HDF to eliminate methanol and formate},
  author={Zakharov, Sergey and others},
  journal={Kidney International},
  volume={86},
  number={1},
  pages={199--207},
  year={2014}
}

@book{aoac2023,
  title={Official Methods of Analysis, Method 942.06: Alcohol by Volume in Distilled Liquors},
  author={{AOAC International}},
  publisher={AOAC International},
  year={2023},
  note={22nd ed.}
}

@misc{anp2022,
  title={Resolu{\c{c}}{\~a}o ANP n{\textordmasculine} 907, de 18 de novembro de 2022. Disp{\~o}e sobre as especifica{\c{c}}{\~o}es do etanol combust{\'\i}vel e suas regras de comercializa{\c{c}}{\~a}o em todo o territ{\'o}rio nacional},
  author={{ANP}},
  year={2022},
  note={Di{\'a}rio Oficial da Uni{\~a}o, 22 nov. 2022}
}

@misc{abnt2012,
  title={NBR 16041:2012 --- Etanol combust{\'\i}vel --- Determina{\c{c}}{\~a}o de metanol e etanol por cromatografia gasosa},
  author={{ABNT}},
  year={2012},
  publisher={Associa{\c{c}}{\~a}o Brasileira de Normas T{\'e}cnicas},
  note={Rio de Janeiro}
}

@book{oiml1975,
  title={International Alcoholometric Tables},
  author={{OIML}},
  publisher={OIML R 22-1. Paris: OIML},
  year={1975},
  note={atualizada}
}

@article{osborne1913,
  title={Density and Thermal Expansion of Ethyl Alcohol and of Its Mixtures with Water},
  author={Osborne, Nathan S and McKelvy, Edward C and Bearce, Howard W},
  journal={Bulletin of the Bureau of Standards},
  volume={9},
  pages={327--474},
  year={1913}
}

@misc{adnormas2018,
  title={A determina{\c{c}}{\~a}o da massa espec{\'\i}fica no etanol combust{\'\i}vel},
  author={{Revista AdNormas}},
  year={2018},
  url={https://revistaadnormas.com.br/2018/11/06/a-determinacao-da-massa-especifica-no-etanol-combustivel},
  note={Nov. 2018}
}

@article{lachenmeier2021,
  title={Application of tailored reference materials and metrologically consistent methods for the analysis of alcoholic beverages},
  author={Lachenmeier, Dirk W and others},
  journal={Journal of Consumer Protection and Food Safety},
  volume={16},
  pages={215--228},
  year={2021}
}

@article{carneiro2008,
  title={Determination of Ethanol Fuel Adulteration by Methanol Using Partial Least-Squares Models Based on Fourier Transform Techniques},
  author={Carneiro, Helena S. P. and Medeiros, Alex R. and Oliveira, Flavia C. C. and Aguiar, Gustavo M. and Rubim, Joel C. and Suarez, Paulo A. Z.},
  journal={Energy \& Fuels},
  volume={22},
  number={4},
  pages={2767--2770},
  year={2008},
  doi={10.1021/ef8000218}
}

@article{silva2012,
  title={Detection of adulteration in hydrated ethyl alcohol fuel using infrared spectroscopy and supervised pattern recognition methods},
  author={Silva, Adenilton C. and Pontes, Liliana F. B. L. and Pimentel, Maria F. and Pontes, M{\'a}rcio J. C.},
  journal={Talanta},
  volume={93},
  pages={129--134},
  year={2012},
  doi={10.1016/j.talanta.2012.01.060}
}

@article{vandenbroek2021,
  title={Screening Methanol Poisoning with a Portable Breath Detector},
  author={van den Broek, Jan and others},
  journal={Analytical Chemistry},
  volume={93},
  number={2},
  pages={1170--1178},
  year={2021}
}

@article{lopesjesus2006,
  title={Theoretical Prediction of Thermal Diffusion in Water--Methanol, Water--Ethanol, and Water--Isopropanol Mixtures},
  author={Lopes Jesus, Ant{\'o}nio J and others},
  journal={Journal of Physical Chemistry B},
  volume={110},
  number={46},
  pages={23180--23188},
  year={2006}
}

@article{osborne1987,
  title={Determination of Density, Alcohol Content, and Extract in Alcoholic Beverages},
  author={Osborne, Stanley},
  journal={Journal of AOAC},
  volume={70},
  number={6},
  pages={1006--1009},
  year={1987}
}

@article{dizechi1982,
  title={Viscosity of Some Binary and Ternary Liquid Mixtures},
  author={Dizechi, Mitra and Marschall, Ernst},
  journal={Journal of Chemical and Engineering Data},
  volume={27},
  number={3},
  pages={358--363},
  year={1982}
}

@article{guevaracarrion2011,
  title={Prediction of self-diffusion coefficient and shear viscosity of water and its binary mixtures with methanol and ethanol by molecular simulation},
  author={Guevara-Carrion, Gabriela and Vrabec, Jadran and Hasse, Hans},
  journal={Journal of Chemical Physics},
  volume={134},
  number={7},
  pages={074508},
  year={2011}
}

@article{grunberg1949,
  title={Mixture Law for Viscosity},
  author={Grunberg, L and Nissan, A H},
  journal={Nature},
  volume={164},
  number={4175},
  pages={799--800},
  year={1949}
}

@article{redlich1948,
  title={Algebraic Representation of Thermodynamic Properties and the Classification of Solutions},
  author={Redlich, Otto and Kister, Andrew T},
  journal={Industrial and Engineering Chemistry},
  volume={40},
  number={2},
  pages={345--348},
  year={1948}
}

@article{wang2023,
  title={Excess Properties, Computational Chemistry, and Spectral Analysis of [Diethanolamine + Alcohols] Ion-Like Liquids},
  author={Wang, Xin and others},
  journal={Journal of Chemical and Engineering Data},
  volume={68},
  number={10},
  pages={2510--2524},
  year={2023}
}

@article{domanska2009,
  title={Temperature and Composition Dependence of the Density and Viscosity of Binary Mixtures of \{1-Butyl-3-methylimidazolium Thiocyanate + 1-Alcohols\}},
  author={Doma{\'n}ska, Urszula and Laskowska, Marta},
  journal={Journal of Chemical and Engineering Data},
  volume={54},
  number={9},
  pages={2113--2119},
  year={2009}
}

@article{haghbakhsh2021,
  title={Viscosity Investigations on the Binary Systems of (1 ChCl:2 Ethylene Glycol) DES and Methanol or Ethanol},
  author={Haghbakhsh, Reza and Duarte, Ana Rita C and Raeissi, Sona},
  journal={Molecules},
  volume={26},
  number={18},
  pages={5513},
  year={2021}
}

@book{jcgm2008gum,
  title={Evaluation of measurement data --- Guide to the expression of uncertainty in measurement (GUM)},
  author={{JCGM}},
  publisher={JCGM 100:2008},
  year={2008}
}

@book{jcgm2008mc,
  title={Supplement 1 to the GUM: Propagation of distributions using a Monte Carlo method},
  author={{JCGM}},
  publisher={JCGM 101:2008},
  year={2008}
}

@article{cox2006,
  title={The use of a Monte Carlo method for evaluating uncertainty and expanded uncertainty},
  author={Cox, Maurice G and Siebert, Bernd R L},
  journal={Metrologia},
  volume={43},
  number={4},
  pages={S178--S188},
  year={2006}
}

@article{possolo2010,
  title={Copulas for uncertainty analysis},
  author={Possolo, Antonio},
  journal={Metrologia},
  volume={47},
  number={3},
  pages={262--271},
  year={2010}
}

@article{liu2011,
  title={Evaluating methods of calculating measurement uncertainty},
  author={Liu, Feng and Liu, Yuan and Wu, Shengli},
  journal={Accreditation and Quality Assurance},
  volume={16},
  number={1},
  pages={1--7},
  year={2011}
}

@article{paasma2012,
  title={Risk factors related to poor outcome after methanol poisoning},
  author={Paasma, Rain and others},
  journal={Clinical Toxicology},
  volume={50},
  number={9},
  pages={823--831},
  year={2012}
}

@article{vale2007,
  title={Methanol},
  author={Vale, Allister},
  journal={Medicine},
  volume={35},
  number={12},
  pages={633--634},
  year={2007}
}

@article{barceloux2002,
  title={American Academy of Clinical Toxicology practice guidelines on the treatment of methanol poisoning},
  author={Barceloux, Donald G and others},
  journal={Journal of Toxicology: Clinical Toxicology},
  volume={40},
  number={4},
  pages={415--446},
  year={2002}
}
```
