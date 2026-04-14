---
title: >-
  App de triagem de metanol: por que os criadores do AlcoLab abriram mão da
  patente para lançar a ferramenta de imediato
description: >-
  Um app de triagem de metanol gratuito e open source, criado do próprio bolso.
  A história de quem decidiu que contribuir para a saúde pública pesava mais do
  que qualquer retorno.
date: '2026-04-08'
author: Diego Mendes de Souza
category: Impacto Social
locale: pt-BR
published: false
status: aprovado
image: /images/blog/6-1776179720938.jpg
imageAlt: >-
  Símbolo de código aberto representando a decisão do AlcoLab de ser open source
  e gratuito
tags:
  - open source
  - AlcoLab
  - código aberto
  - saúde pública
  - patente
  - inovação
focusKeyword: app de triagem de metanol
translationSlug: alcolab-open-source-choosing-to-save-lives-now
---
## A encruzilhada

Quando a metodologia já estava estruturada e os testes experimentais confirmavam o potencial da ferramenta, a equipe — Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos e Romério Rodrigues dos Santos Silva — **precisou decidir o que fazer com o que havia construído (App de triagem de metanol)**.

A primeira opção seria propor os instrumentos utilizados como um dispositivo físico mínimo e iniciar um pedido de patente. Seria o caminho mais seguro para proteger a invenção e eventualmente obter retorno pela invenção, estudo e trabalho investidos.

O problema é que havia há surto ativo, no Brasil e fora dele. **Pessoas estavam sendo intoxicadas e algumas perdendo suas vidas**. E a janela entre "ideia pronta" e "patente concedida" poderia durar anos.

A segunda opção era lançar imediatamente, de graça, assumindo os custos do próprio bolso — servidor online, domínio, materiais de teste, bebidas para calibração — sem garantia alguma de retorno. Escolheram esta segunda.

## O que "open source" significa na prática

O AlcoLab (App de triagem de metanol) foi publicado sob licença **AGPL-3.0** — uma das licenças de código aberto mais rigorosas disponíveis. Ela garante que **qualquer versão derivada da ferramenta também precise ser aberta**, impedindo que terceiros transformem o código em produto proprietário sem disponibilizar as modificações.

Antes da publicação pública, a equipe realizou dois passos estratégicos:

1. Depósito junto ao **INPI** — que fixa a data de prioridade da invenção no Brasil; e
2. Publicação no **Zenodo**, repositório científico internacional.

Esses registros não visam exploração comercial, mas sim justamente o contrário. Nesse sentido, visam impedir que outra pessoa ou empresa reivindique a ideia como própria depois que ela já foi tornada pública. É, portanto, uma proteção orientada à abertura, não ao fechamento.

O código completo está disponível em [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab). Qualquer pessoa pode revisar a metodologia, auditar o algoritmo, sugerir melhorias ou adaptar a ferramenta para outros contextos — desde que mantenha o mesmo compromisso de abertura.

## O custo real da gratuidade

Por outro lado, software gratuito (App de triagem de metanol) não significa software sem custo. Significa que alguém está arcando com ele.

> No caso do AlcoLab, essa conta foi — e ainda é — paga por nós criadores. Hospedagem em servidor, registro de domínio, bebidas comerciais compradas para testes experimentais, materiais para calibração e muitas horas de pesquisa e de trabalho. Tudo saiu do bolso da equipe, que trabalhou por meses sem nenhum incentivo externo.

Nesse sentido, os custos estimados até aqui estão listados na tabela abaixo.

| Item | Detalhe | Custo estimado |
| --- | --- | --- |
| Bebidas para calibração | 10 rótulos (whisky e vodka) | R$ 1.000 |
| Reagentes químicos | Etanol e metanol PA, 10 L cada | R$ 1.600 |
| Infraestrutura — Railway Pro | US$ 20/mês × 6 meses | R$ 700 |
| Ferramentas de desenvolvimento | GitHub Copilot + Claude Max, 6 meses | R$ 3.840 |
| Horas de P&D | 290 h (Diego 150h · Pedro 80h · Romério 30h · Nayara 30h) | R$ 29.000 |
| **Total investido** |  | **R$ 36.140** |

Isso é possível enquanto dura o fôlego. E a equipe é honesta sobre os riscos: projetos *open source* sem apoio institucional têm um histórico conhecido de esgotamento. Desenvolvedores voluntários se sobrecarregam, manutenção se acumula, atualizações deixam de ser feitas e a infraestrutura vai ficando vulnerável. O resultado é o que o meio chama de *abandonware* — software que existe, mas não tem mais ninguém por trás.

É exatamente isso que a equipe quer evitar justamente por acreditar no impacto positivo da ferramenta para saúde pública.

## Por que a abertura importa para uma ferramenta de saúde pública

O método de referência para detectar metanol em bebidas é a **Cromatografia Gasosa (CG)** — técnica de alta precisão, exatidão e discriminação que separa e identifica os componentes de uma mistura com confiabilidade. Equipamentos CG, a depender da configuração, **custam entre R$ 200 mil e R$ 600 mil.** Nesse sentido, a maioria dos municípios brasileiros, não possuem esse tipo de equipamento disponível — e a maioria dos países afetados por contaminação de bebidas também não.

Quando a análise depende de equipamentos que só existem em capitais ou grandes centros de pesquisa e ou de perícia, a capacidade de triagem durante uma crise fica geograficamente restrita. É esse gap que o AlcoLab tenta endereçar: uma ferramenta que usa uma seringa de farmácia; balança de cozinha com resolução minima de 0.1g; e um celular com câmera; acessíveis a grande parte das pessoas.

|  | Cromatografia gasosa (GC-MS/FID) | AlcoLab |
| --- | --- | --- |
| Custo do equipamento | &gt; R$ 200 mil | \~ R$ 0 |
| Materiais por teste | Reagentes e padrões especializados | Seringa + balança |
| Custo por análise (3 rep. + branco) | R$ 600 – R$ 1.400 | \~ R$ 0 |
| Tempo de resultado | Horas a dias | 15 – 25 min |
| Acesso | Laboratórios especializados | Qualquer pessoa |
| Confirmatório | Sim | Não (triagem) |

Nesse sentido, torná-la aberta não foi só uma declaração de valores — foi também uma decisão consistente e prática. Código e metodologia confiáveis precisam ser auditáveis, sobretudo quando se fala em saúde. Metodologia transparente pode ser verificada por outros pesquisadores e técnicos da área, como desejamos. E uma ferramenta gratuita alcança exatamente quem mais precisa dela: agentes de fiscalização em regiões com pouca estrutura, **pequenos produtores, distribuidores e até consumidores**.

## Os primeiros resultados

Em cerca de um mês de site público, o AlcoLab (App de triagem de metanol em bebidas destiladas) registrou quase 2.500 visitantes únicos e aproximadamente 34 mil requisições ao servidor, com acessos de todos os continentes — Brasil, Estados Unidos, China, França, Canadá, Singapura e Suíça, entre outros.

Esses números confirmam o que a equipe já suspeitava: o problema não é brasileiro. A contaminação de bebidas por metanol afeta, portanto, dezenas de países, especialmente onde fiscalização e infraestrutura laboratorial são limitadas. Uma solução aberta tem, por definição, alcance que uma solução proprietária dificilmente teria.

## O que a equipe busca agora

A sustentabilidade do projeto depende de parcerias. A equipe busca apoio em três frentes: (1) validação técnica, (2) manutenção financeira e (3) aperfeiçoamento contínuo da ferramenta.

No âmbito internacional, foram contatados os Médicos Sem Fronteiras — que mantém a *Methanol Poisoning Initiative* desde 2012 —, a OPAS/OMS, fundações como Wellcome Trust e Gates Foundation, e organismos como BID Lab e STDF. No âmbito nacional, a lista inclui Fiocruz, MAPA, ANP, vigilância sanitária e parlamentares. Ademais, no campo do fomento à pesquisa, há submissões planejadas à FAPEMA, FINEP e FAP-DF.

Nesse sentido, nenhuma parceria está fechada ainda. O projeto é recente e as tratativas estão em curso. Por outra lado, o que existe de concreto é a ferramenta em si: funcional, gratuita, auditável, disponível agora.

## Uma nota final

**A escolha por abrir o código e lançar de graça não foi indolor.** Significa abrir mão de qualquer retorno direto pelo trabalho feito. Significa continuar bancando os custos sem saber por quanto tempo. Significa, portanto, **apostar que o impacto coletivo vale mais do que a proteção individual da invenção**.

Para a equipe do AlcoLab, pesou mais a possibilidade de que a ferramenta chegasse a tempo — a consumidores, fiscais, distribuidores, agentes de saúde — do que a segurança de um modelo de negócio que ainda demoraria anos para se concretizar.

Isso não é manifesto. É apenas o que aconteceu.

**AlcoLab está disponível em [alcolab.org](http://alcolab.org)**.Código-fonte: [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab)

> Se este projeto faz sentido para você, a forma mais direta de ajudar é compartilhar com quem possa se beneficiar — um consumidor, um produtor, um fiscal, alguém que trabalhe com segurança alimentar. E se você representa uma instituição que poderia apoiar o AlcoLab, ou conhece quem possa, entre em contato: [**alcolabapp@gmail.com**](mailto:alcolabapp@gmail.com)
