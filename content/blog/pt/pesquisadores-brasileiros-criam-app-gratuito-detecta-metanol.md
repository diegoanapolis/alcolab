---
title: >-
  Alcolab - Pesquisadores brasileiros criam app gratuito que auxilia na detecção
  de metanol
description: >-
  App detecta metanol em bebidas: AlcoLab é solução gratuita criada por
  pesquisadores brasileiros para combater a crise de envenenamento por metanol
  globalmente.
date: '2026-04-08'
author: Diego Mendes de Souza
locale: pt-BR
published: false
status: rascunho
tags:
  - app detecta metanol
  - detecção de metanol
  - AlcoLab
  - segurança de bebidas
  - saúde pública
  - tecnologia para saúde
image: /images/blog/alcolab-app-triagem-metanol.png
imageAlt: >-
  Interface do aplicativo AlcoLab mostrando resultado de triagem de metanol em
  bebida alcoólica
focusKeyword: app detecta metanol
translationSlug: brazilian-researchers-create-free-app-detects-methanol
---
## Como dois Químicos e uma Administradora criaram uma ferramenta gratuita contra o metanol – sem pedir nada em troca

Em 2025, o Brasil enfrentou um surto grave de intoxicação por metanol em bebidas alcoólicas. Entre setembro e dezembro, dezenas de pessoas foram hospitalizadas e mais de 20 morreram — casos que se concentraram principalmente em São Paulo, mas não se restringiram a ele.

Foi nesse contexto que Pedro Augusto de Oliveira Morais, PhD em Quimiometria, fez duas perguntas simples ao seu colega Diego Mendes de Souza, também Químico e Perito Criminal: Os casos de intoxicação por metanol estavam chegando à perícia? Se ele visualizava alguma forma de detectar o contaminante sem depender de um laboratório equipado com instrumentos caros?

Diego não trabalhava diretamente com bebidas adulteradas — sua atuação na Polícia Civil se concentra na análise de drogas. Mas a pergunta ficou e surgiu a vontade em contribuir para evitar novas contaminações. E ele começou a pesquisar.

## A descoberta por dados da literatura

Primeiramente, Diego passou dias pesquisando na literatura científica sobre as propriedades físicas e químicas do etanol e do metanol. Os dois álcoois são muito parecidos — tão parecidos que a maioria dos métodos de análise simples não consegue distingui-los com segurança. A densidade, por exemplo, dá uma excelente noção do teor alcoólico total, mas não discrimina se esse teor vem do etanol, metanol ou mistura de ambos.

Nesse sentido, Diego identificou uma diferença relevante: **a viscosidade**. O metanol é menos viscoso que o etanol e que a água. Por isso, quando o metanol está presente, escoa mais rápido, por exemplo, por um viscosímetro. A propriedade parecia simples, mas poderia ser o que faltava para montar uma metodologia acessível. Portanto, teve a ideia de **adaptar esse escoamento para** um dispositivo simples e acessível, **uma seringa de farmácia**. Veja o que explicou o Diego em entrevista ao Olhar Digital:

> Densidade não discrimina o metanol do etanol. A gente mede a densidade na balança de cozinha e ela dá a noção inicial de quanto tem de álcool na mistura. A densidade dá uma direção — e a solução embarcada no Alcolab refina essa direção com a viscosidade obtida pelo escoamento. Como o metanol é menos viscoso, escoa mais rápido. A gente usa as duas variáveis de forma complementar para chegar à conclusão de composição hidroalcoólica mais provável.

Com dados da literatura em mãos, Diego começou a trabalhar informalmente em casa — testando parâmetros, cruzando dados, construindo base de dados para subsidiar o algoritmo e fluxograma metodológico. Em paralelo, Pedro Augusto conduziu testes experimentais por conta própria para validar se o que a metodologia indicava no papel se confirmava na prática. Não havia projeto formal. <u>Não havia financiamento. Havia duas pessoas usando o próprio tempo livre e gastando dinheiro do próprio bolso para ver se a ideia funcionava</u>.

## Da ideia à solução prática: entrada da Nayara e do Romério

Quando os testes começaram a mostrar potencial real, a equipe precisava de mais do que ciência - precisava de uma ferramenta que qualquer pessoa pudesse usar. Foi aí que Nayara Ferreira Santos, Administradora, entrou no projeto, contribuindo com a usabilidade da interface e a estrutura administrativa da iniciativa.

Ademais, mais um interessado em voluntariar apareceu. Romério Rodrigues dos Santos Silva, Pós Doutorando em Bioquímica, passou a contribuir pra usabilidade da ferramenta e também em mais ensaios experimentais de teste da ferramenta.

Os quatro trabalharam por meses sem nenhum incentivo externo. Os custos de hospedagem em servidor, os materiais para testes e as bebidas comerciais compradas para calibração saíram do bolso deles mesmos.

Quando a ferramenta estava praticamente pronta, a equipe se viu diante de uma escolha real: pedir uma patente — processo que leva de 2 a 7 anos — ou lançar imediatamente, de graça, para quem precisasse.

Escolheram lançar.

> A equipe optou por lançar imediatamente e de graça. Não havia garantia de retorno pelo meses de trabalho investido — mas havia a possibilidade concreta de que a ferramenta chegasse a tempo de ser útil para quem dela necessitar: consumidores, fiscais, distribuidores. Para nós, contribuir para conter um problema grave de saúde pública pesou mais do que qualquer outra consideração.

Então, o AlcoLab foi ao ar em 10 de março de 2026.

## Como funciona a triagem de metanol - Alcolab

O AlcoLab é um aplicativo web, acessível em [alcolab.org](http://alcolab.org), sem necessidade de download. O processo completo leva entre 15 e 25 minutos e exige apenas três itens:\
•	uma seringa de 20 mL com agulha 22G (a mais comum nas farmácias),\
•	uma balança de cozinha com resolução de 0,1g (importante, mas é possível examinar sem ela); e\
•	um smartphone com câmera.

<img src="/images/blog/1-1776179222960.png" alt="Seringa de 20 mL, balança com resolução 0.1g e smartphone para triagem de metanol pelo app Alcolab" style="max-width:75%;margin:0 auto;display:block" />

> Vale lembrar que trata-se de um metodologia de triagem e não confirmatória. Os resultados do Alcolab não substitui completamente exames confirmatórios, mas funciona como ferramenta auxiliar na triagem de presença de metanol. Em casos suspeitos, ainda que o resultado dê compatível com o rótulo, não é recomendável o consumo. Denuncie à Vigilância Sanitária, à Polícia e à Entidade de Proteção ao Consumidor.

## Passo a passo da metodologia

1. O usuário aspira e pesa 20 mL de água e depois 20 mL da bebida analisada — isso fornece a densidade relativa.
2. Em seguida, posiciona a seringa verticalmente e filma o escoamento do líquido entre as marcas de 18 e 14 mL — isso permite estimar a viscosidade relativa.
3. Com esses dados inseridos no aplicativo, junto com informações do rótulo, o fluxo do app estima o teor alcoólico com base em malhas da literatura. Em seguida, busca nessa faixa de teor, em uma malha experimental elaborada pelos autores, a composição ou composições compatíveis com o tempo de escoamento obtido.

## Relatório de resultados e estatística aplicada pelo Alcolab

- **Estatística**: O app avalia a incerteza experimental das medições, comparando a composição identificada na etapa anterior com composições de resultados próximos por meio de teste Z de comparação de médias e simulação probabilística de Monte Carlo. O objetivo é incluir composições próximas, estatisticamente equivalentes e/ou probabilisticamente prováveis.
- **Relatório de resultados**: As composições equivalentes e/ou mais prováveis são comparadas com o rótulo declarado. O app organiza medidas experimentais e resultados em um relatório e exibe um indicador imediato de segurança em formato de semáforo (verde / amarelo / vermelho). Por exemplo, quando há probabilidade considerável para presença de metanol e/ou incompatibilidade com o rótulo, o semáforo assume cor vermelha.

> Vale lembrar que a ferramenta funciona apenas com destilados puros — vodka, cachaça, whisky, rum, gin, tequila, aguardente. Não é compatível, por enquanto, com licores, cervejas, vinhos ou bebidas mistas, porque essas têm composição química mais diversificada que impacta nos parâmetros densidade e viscosidade.

## O primeiro mês de disponibilização

Em cerca de um mês, o site público [alcolab.org](http://alcolab.org) já contou com a visita de quase **2500 usuários e cerca de 34 mil requisições espalhados por todos continentes**. Com acessos em país como Brasil, Estados Unidos, China, França, Canadá, Singapura e Suíça. Ademais, o projeto aparece nos primeiros resultados do Google tanto em português ("app triagem de metanol") quanto em inglês ("methanol screening app").

A adesão internacional mostra algo que a equipe já suspeitava e os dados da OMS apontavam: a contaminação de bebidas por metanol não é um problema e preocupação exclusivamente do Brasil. É um problema global, especialmente em países com pouca fiscalização e infraestrutura laboratorial.

## O que vem pela frente para o Alcolab

Nesse sentido, o AlcoLab ainda é custeado pelos próprios pesquisadores. Projetos *open source* sem apoio institucional enfrentam riscos reais: manutenção acumulada, infraestrutura vulnerável, risco de abandono pelos autores. Portanto, a equipe que conhece esse histórico quer evitá-lo.

Por isso, busca parcerias em três frentes:

1. validação técnica,
2. sustentabilidade financeira e
3. aperfeiçoamento da ferramenta.

<img src="/images/blog/3-1776179455672.png" alt="Parcerias almejadas para o Alcolab: validação por laboratórios oficiais e sustentabilidade financeira" style="max-width:75%;margin:0 auto;display:block" />

Entre as instituições contatadas por e-mail estão os Médicos Sem Fronteiras (que mantém a Methanol Poisoning Initiative desde 2012), a OPAS/OMS, a Fiocruz, o MAPA, a ANP, e parlamentares locais. No campo do fomento, os autores estudam e planejam submissões dentro e fora do país.

Nenhuma parceria está confirmada ainda, mas algumas tratativas estão em andamento. Ademais, o projeto está há pouco tempo disponível ao público.

**O que está confirmado é o que já existe**: uma ferramenta funcional, gratuita, com código aberto e auditável, criada por três pessoas que decidiram que resolver o problema era mais urgente do que proteger a invenção.

> Se este projeto faz sentido para você, a forma mais simples de ajudar é compartilhar com quem possa se beneficiar — um consumidor, um produtor, um fiscal, alguém que trabalhe com segurança alimentar. E se você representa uma instituição que poderia apoiar o AlcoLab, ou conhece quem possa, entre em contato: [alcolabapp@gmail.com](mailto:alcolabapp@gmail.com)

**AlcoLab está disponível em [alcolab.org](http://alcolab.org)**.Código-fonte: [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab)Contato: [alcolabapp@gmail.com](mailto:alcolabapp@gmail.com)
