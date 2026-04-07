---
title: "Como identificar metanol em bebida alcoólica: guia prático de triagem"
description: "Aprenda a realizar triagem de metanol em bebidas usando apenas uma seringa, uma balança e um celular. Guia completo com o aplicativo gratuito AlcoLab."
date: 2026-03-10
author: "Diego Mendes de Souza"
image: "/images/homepage/semaforo-vermelho.png"
imageAlt: "Tela do AlcoLab mostrando resultado de triagem com semáforo vermelho indicando possível presença de metanol em bebida"
tags:
  - metanol
  - bebida adulterada
  - triagem
  - saúde pública
  - como identificar metanol
locale: "pt-BR"
published: true
---

## O que é metanol e por que é perigoso?

O metanol (álcool metílico) é uma substância altamente tóxica encontrada em bebidas alcoólicas adulteradas. A ingestão de apenas 30 mL pode ser fatal, e quantidades menores podem causar cegueira irreversível. Diferentemente do etanol (o álcool "seguro" das bebidas), o metanol não tem sabor nem cheiro que o diferencie — tornando a adulteração imperceptível ao consumidor.

Em outubro de 2025, a Organização Pan-Americana da Saúde (OPAS/OMS) reportou casos de envenenamento por metanol em pelo menos cinco países das Américas, incluindo um surto no Brasil com mais de 200 casos suspeitos.

&lt;div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1rem 0"&gt;&lt;iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:0.5rem" src="https://www.youtube.com/embed/I1H3HA8-mqM" allowfullscreen=""&gt;&lt;/iframe&gt;&lt;/div&gt;

## O problema: detecção acessível

Até recentemente, detectar metanol em bebidas exigia equipamentos laboratoriais caros — cromatógrafos gasosos que custam dezenas de milhares de reais e estão disponíveis apenas em laboratórios especializados. Isso deixava fiscais de campo, profissionais de saúde e consumidores sem nenhuma ferramenta prática de verificação.

## A solução: AlcoLab

O AlcoLab é um aplicativo web gratuito e de código aberto que permite realizar triagem de metanol usando apenas:

- **Uma seringa comercial de 20 mL** (com agulha 22G)
- **Uma balança de cozinha** (com resolução de 0,1 g)
- **Um smartphone** (com câmera e navegador web)

## Como funciona?

O método combina duas propriedades físicas para estimar a composição da bebida:

### 1. Densidade relativa

Você pesa a mesma quantidade de água e da amostra usando a seringa. A razão entre as massas revela o teor alcoólico total.

### 2. Viscosidade relativa

Você filma o escoamento da água e da amostra pela mesma seringa. O tempo de escoamento revela a diferença entre etanol e metanol — pois embora tenham densidades quase idênticas, suas viscosidades são significativamente diferentes.

### 3. Análise estatística

O aplicativo compara suas medições com uma malha de referência pré-calculada e usa teste Z e simulação de Monte Carlo para identificar as composições mais prováveis, incluindo a presença de metanol.

## Resultado imediato

Após o processamento, o AlcoLab exibe um semáforo:

- 🟢 **Verde** — Compatível com o rótulo
- 🟡 **Amarelo** — Necessários mais dados experimentais
- 🔴 **Vermelho** — Incompatível com o rótulo e/ou possível presença de metanol

## Limitações importantes

O AlcoLab é uma ferramenta de **triagem**, não de confirmação. Ele não substitui análises laboratoriais oficiais. O limite de detecção é de aproximadamente 5% em massa de metanol. Em caso de suspeita de contaminação, **não consuma a bebida** e procure as autoridades sanitárias.

## Experimente agora

O AlcoLab está disponível gratuitamente em [alcolab.org](https://alcolab.org). O aplicativo funciona offline após o primeiro carregamento e não transmite nenhum dado a servidores externos.

Você pode testar imediatamente com os cenários de demonstração incluídos no app, que utilizam dados reais de amostras contaminadas e legítimas.