---
title: >-
  Methanol Screening App: Why AlcoLab's Creators Gave Up Patent Rights to Launch
  Immediately
description: >-
  A free, open-source methanol screening app, self-funded. The story of those
  who decided public health contribution mattered more than any return.
date: '2026-04-08'
author: Diego Mendes de Souza
category: Impacto Social
locale: en
published: false
status: em_revisao
image: /images/blog/6-1776179720938.jpg
imageAlt: Open source symbol representing AlcoLab's decision to be open source and free
tags:
  - open source
  - AlcoLab
  - public health
  - patent
  - innovation
  - methanol screening
focusKeyword: methanol screening app
translationSlug: alcolab-open-source-escolha-salvar-vidas-agora
---
## The crossroads

When the methodology was already structured and experimental tests confirmed the tool's potential, the team — Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos, and Romério Rodrigues dos Santos Silva — **had to decide what to do with what they had built (methanol screening app)**.

The first option would be to propose the instruments used as a minimum physical device and initiate a patent application. It would be the safest path to protect the invention and eventually obtain a return on the invention, study, and work invested.

The problem was that there was an active outbreak, in Brazil and beyond. **People were being poisoned and some were losing their lives**. And the window between "ready idea" and "granted patent" could last years.

The second option was to launch immediately, for free, bearing the costs out of pocket — online server, domain, test materials, beverages for calibration — with no guarantee of return whatsoever. They chose the latter.

## What "open source" means in practice

AlcoLab (methanol screening app) was published under the **AGPL-3.0** license — one of the most rigorous open-source licenses available. It ensures that **any derived version of the tool must also be open**, preventing third parties from transforming the code into a proprietary product without making modifications available.

Before public release, the team took two strategic steps:

1. Filing with **INPI** — which establishes the priority date of the invention in Brazil; and
2. Publication on **Zenodo**, an international scientific repository.

These registrations are not aimed at commercial exploitation, but rather precisely the opposite. In this sense, they aim to prevent another person or company from claiming the idea as their own after it has already been made public. It is, therefore, a protection oriented toward openness, not closure.

The complete code is available at [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab). Anyone can review the methodology, audit the algorithm, suggest improvements, or adapt the tool for other contexts — as long as they maintain the same commitment to openness.

## The real cost of being free

On the other hand, free software (methanol screening app) does not mean software without cost. It means someone is bearing it.

> In AlcoLab's case, that bill was — and still is — paid by us creators. Server hosting, domain registration, commercial beverages purchased for experimental tests, calibration materials, and many hours of research and work. Everything came out of the team's pocket, who worked for months without any external support.

In this sense, the costs estimated so far are listed in the table below.

| Item | Detail | Estimated cost |
| --- | --- | --- |
| Beverages for calibration | 10 labels (whisky and vodka) | R$ 1,000 |
| Chemical reagents | Ethanol and methanol PA, 10 L each | R$ 1,600 |
| Infrastructure — Railway Pro | US$ 20/month × 6 months | R$ 700 |
| Development tools | GitHub Copilot + Claude Max, 6 months | R$ 3,840 |
| R&D hours | 290 h (Diego 150h · Pedro 80h · Romério 30h · Nayara 30h) | R$ 29,000 |
| **Total estimated investment** |  | **R$ 36,140** |

This is possible while stamina lasts. And the team is honest about the risks: *open source* projects without institutional support have a well-known history of burnout. Volunteer developers become overloaded, maintenance accumulates, updates stop being made, and infrastructure becomes vulnerable. The result is what the field calls *abandonware* — software that exists but has no one behind it anymore.

This is exactly what the team wants to avoid precisely because they believe in the tool's positive impact on public health.

## Why openness matters for a public health tool

The reference method for detecting methanol in beverages is **Gas Chromatography (GC)** — a high-precision, accuracy, and discrimination technique that separates and identifies the components of a mixture with reliability. GC equipment, depending on configuration, **costs between R$ 200,000 and R$ 600,000.** In this sense, most Brazilian municipalities do not have this type of equipment available — and most countries affected by beverage contamination do not either.

When analysis depends on equipment that only exists in capitals or large research and forensic centers, screening capacity during a crisis is geographically restricted. This is the gap that AlcoLab tries to address: a tool that uses a pharmacy syringe; a kitchen scale with minimum resolution of 0.1g; and a phone with a camera; accessible to most people.

|  | Gas chromatography (GC-MS/FID) | AlcoLab |
| --- | --- | --- |
| Equipment cost | &gt; R$ 200,000 | \~ R$ 0 |
| Materials per test | Specialized reagents and standards | Syringe + scale |
| Cost per analysis (3 rep. + blank) | R$ 600 – R$ 1,400 | \~ R$ 0 |
| Time to result | Hours to days | 15 – 25 min |
| Access | Specialized laboratories | Anyone |
| Confirmatory | Yes | No (screening) |

In this sense, making it open was not just a statement of values — it was also a consistent and practical decision. Reliable code and methodology need to be auditable, especially when it comes to health. Transparent methodology can be verified by other researchers and technicians in the field, as we desire. And a free tool reaches exactly those who need it most: inspection agents in regions with limited infrastructure, **small producers, distributors, and even consumers**.

## Early results

In about a month of public website, AlcoLab (methanol screening app in distilled beverages) registered nearly 2,500 unique visitors and approximately 34,000 server requests, with access from all continents — Brazil, United States, China, France, Canada, Singapore, and Switzerland, among others.

These numbers confirm what the team already suspected: the problem is not Brazilian. Methanol contamination of beverages therefore affects dozens of countries, especially where inspection and laboratory infrastructure are limited. An open solution has, by definition, a reach that a proprietary solution would hardly have.

## What the team is seeking now

The project's sustainability depends on partnerships. The team is seeking support on three fronts: (1) technical validation, (2) financial maintenance, and (3) continuous improvement of the tool.

At the international level, Médecins Sans Frontières — which has maintained the *Methanol Poisoning Initiative* since 2012 —, PAHO/WHO, foundations like Wellcome Trust and Gates Foundation, and organizations like BID Lab and STDF have been contacted. At the national level, the list includes Fiocruz, MAPA, ANP, health surveillance agencies, and parliamentarians. Moreover, in the field of research funding, there are planned submissions to FAPEMA, FINEP, and FAP-DF.

In this sense, no partnership is closed yet. The project is recent and negotiations are ongoing. On the other hand, what exists concretely is the tool itself: functional, free, auditable, available now.

## A final note

**The choice to open the code and launch for free was not painless.** It means giving up any direct return for the work done. It means continuing to bear the costs without knowing for how long. It means, therefore, **betting that the collective impact is worth more than individual protection of the invention**.

For the AlcoLab team, the possibility that the tool would arrive in time — to consumers, inspectors, distributors, health agents — weighed more than the security of a business model that would still take years to materialize.

This is not a manifesto. It is simply what happened.

**AlcoLab is available at [alcolab.org](http://alcolab.org)**. Source code: [github.com/diegoanapolis/alcolab](https://github.com/diegoanapolis/alcolab)

> If this project makes sense to you, the most direct way to help is to share it with those who might benefit — a consumer, a producer, an inspector, someone working in food safety. And if you represent an institution that could support AlcoLab, or know someone who might, get in touch: [**alcolabapp@gmail.com**](mailto:alcolabapp@gmail.com)
