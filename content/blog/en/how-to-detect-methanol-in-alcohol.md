---
title: "How to detect methanol in alcoholic beverages: a practical screening guide"
description: "Learn how to screen for methanol in drinks using just a syringe, a scale and a phone. Complete guide with the free AlcoLab app."
date: 2026-03-10
author: "Diego Mendes de Souza"
image: "/images/homepage/semaforo-vermelho-en.png"
imageAlt: "AlcoLab screen showing screening result with red traffic light indicating possible methanol presence in beverage"
tags:
  - methanol
  - adulterated beverage
  - screening
  - public health
  - how to detect methanol
locale: "en"
published: true
---

## What is methanol and why is it dangerous?

Methanol (methyl alcohol) is a highly toxic substance found in adulterated alcoholic beverages. Ingesting as little as 30 mL can be fatal, and smaller amounts can cause irreversible blindness. Unlike ethanol (the "safe" alcohol in beverages), methanol has no distinguishing taste or smell — making adulteration imperceptible to consumers.

In October 2025, the Pan American Health Organization (PAHO/WHO) reported methanol poisoning cases in at least five countries across the Americas, including an outbreak in Brazil with over 200 suspected cases. By late 2025, the UK Foreign Office had expanded its methanol poisoning travel advisory to 28 countries.

## The problem: accessible detection

Until recently, detecting methanol in beverages required expensive laboratory equipment — gas chromatographs costing tens of thousands of dollars, available only in specialized laboratories. This left field inspectors, health professionals and consumers with no practical verification tool.

## The solution: AlcoLab

AlcoLab is a free, open-source web application that enables methanol screening using only:

- **A commercial 20 mL syringe** (with 22G needle)
- **A kitchen scale** (0.1 g resolution)
- **A smartphone** (with camera and web browser)

## How does it work?

The method combines two physical properties to estimate the composition of the beverage:

### 1. Relative density
You weigh the same amount of water and sample using the syringe. The ratio between the masses reveals the total alcohol content.

### 2. Relative viscosity
You record the flow of water and sample through the same syringe. The flow time reveals the difference between ethanol and methanol — because although they have nearly identical densities, their viscosities differ significantly.

### 3. Statistical analysis
The app compares your measurements against a pre-computed reference mesh and uses Z-test and Monte Carlo simulation to identify the most likely compositions, including methanol presence.

## Immediate result

After processing, AlcoLab displays a traffic light indicator:

- 🟢 **Green** — Compatible with the label
- 🟡 **Yellow** — More experimental data needed
- 🔴 **Red** — Incompatible with the label and/or possible methanol presence

## Important limitations

AlcoLab is a **screening** tool, not a confirmatory test. It does not replace official laboratory analyses. The detection limit is approximately 5% methanol by mass. If contamination is suspected, **do not consume the beverage** and contact local health authorities.

## Try it now

AlcoLab is available for free at [alcolab.org](https://alcolab.org). The app works offline after initial load and does not transmit any data to external servers.

You can test immediately with the demonstration scenarios included in the app, which use real data from contaminated and legitimate samples.
