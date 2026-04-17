---
title: 'Density and Viscosity: How AlcoLab Detects Methanol'
description: >-
  The science behind AlcoLab: density and viscosity reveal methanol. Scientific
  technology that detects contamination with near 100% precision.
date: '2026-04-08'
author: Diego Mendes de Souza
category: Technology
locale: en
published: false
status: em_revisao
image: /images/blog/6-1776179720938.jpg
imageAlt: >-
  Diagrama científico mostrando como densidade e viscosidade relativas são
  usadas para detectar metanol em bebidas
tags:
  - density
  - viscosity
  - methanol
  - chemical detection
  - beverage analysis
  - public health
focusKeyword: density viscosity methanol
translationSlug: ciencia-por-tras-alcolab-densidade-viscosidade-metanol
---

## Density and Viscosity: The Science of AlcoLab

Detecting **methanol in beverages** is a complex scientific challenge, but fundamental to protect lives. In this article, discover how [AlcoLab](https://alcolab.org) uses physics and chemistry to identify contaminations with near 100% precision.

Do you know the story of someone poisoned by adulterated beverage? Methanol is a silent problem affecting thousands annually. But how can an app detect it? The answer lies in density and viscosity — physical properties that reveal the truth about beverages.

## The Challenge: Two Almost Identical Molecules

Everything starts with crucial observation: **legitimate distilled beverages are essentially a mixture of two components** — water and ethyl alcohol. Other substances represent less than 1% of volume.

However, when **methanol appears in composition**, the system transforms from binary to ternary: water + ethanol + methanol. This change has profound physical implications. In this sense, density and viscosity reveal this fundamental change.

### The Problem: Density Alone Fails

Here's the fundamental problem: **density alone can't make the distinction**. The values are incredibly close:

- **Pure ethanol**: 0.789 g/mL at 20°C
- **Pure methanol**: 0.791 g/mL at 20°C

Minimal difference of only **0.002 g/mL** makes it virtually impossible to use density alone. Any measurement error would completely eliminate test reliability.

Consider a solution with 30% alcohol and 70% water. If it were 100% ethanol, density would be 0.789 g/mL. If 100% methanol, it would be 0.791 g/mL. Mixed solution would have density between these values. But which mixture? All ethanol? All methanol? A combination?

**Measuring only density, is there any way to know?** No. None.

Furthermore, commercial hydrometers have ±0.5% volume accuracy (±0.005 g/mL) — **greater than the difference between pure ethanol and methanol**. Therefore, instrumental uncertainty exceeds the signature we're trying to measure. Any conclusion would be speculation, not science.

Real contaminations involve complex mixtures. Ethyl alcohol, methanol, and water coexist. Resulting density reflects only combined effect. Therefore, unraveling which alcohol contributes how much is impossible with density alone.

## The Game-Changer: Viscosity

AlcoLab's brilliant solution emerges here — **viscosity fundamentally differentiates these molecules**. While density fails, viscosity shines with enormous differences:

- **Pure water**: 1.002 mPa·s
- **Pure ethanol**: 1.200 mPa·s
- **Pure methanol**: 0.544 mPa·s

### Viscosity: The Revealing Asymmetry

Observe the disparity: **methanol has viscosity approximately 2 times lower than water**. Colossal difference allows reliable identification — without ambiguity. Ethanol is slightly more viscous than water. Methanol is drastically less viscous.

This asymmetry occurs because molecular structure affects flow. Methanol interacts weakly with other molecules during flow, resulting in exceptional fluidity. Ethanol shows moderate interactions, staying close to water's viscosity.

Therefore, density and viscosity together solve the puzzle. One measurement alone fails. Two different measurements solve it completely. In sum, that's AlcoLab's genius.

**AlcoLab's Dual Strategy:**

1. **Relative density (ρ_rel)** = sample mass ÷ water mass
   - Quantifies total alcohol content
   
2. **Relative viscosity (η_rel)** = sample flow time ÷ water flow time
   - Distinguishes ethanol from methanol

These two parameters create an identification system impossible to work around. You can't have high density (lots of alcohol) with very low viscosity (lots of methanol) if sample were legitimate.

This combination is the signature of contamination. After all, no legitimate beverage would have this pattern.

## Reference Grid: Three-Dimensional Mapping

To implement this powerful approach, scientists behind [AlcoLab](https://alcolab.org) built a **pre-calculated reference grid** with thousands of (density, viscosity) pairs for all possible compositions of water + ethanol + methanol at 20°C.

### How the Ternary Grid Works

This grid represents complete three-dimensional space:
- One dimension: water content (0-100%)
- Another: ethanol (0-100%)
- Third: methanol (0-100%)
- Restriction: always sum to 100%

For each water-ethanol-methanol combination, scientists pre-calculated:
- **Expected density** using thermodynamic equations
- **Expected viscosity** using fluid models

This process generated a database with **thousands of chemical signatures**. Each one: unique correspondence between (measured density, measured viscosity) and (water composition, ethanol, methanol).

### Practical Implementation

The functioning is straightforward:

| Stage | What Happens |
|------|---|
| **Input** | You measure density and viscosity |
| **Processing** | AlcoLab searches grid for matches |
| **Output** | Range of probable compositions |

Imagine a three-dimensional map where each point represents possible chemical combination. AlcoLab locates exactly where your beverage falls on this map. The location in three-dimensional space immediately reveals how much of each substance is present. Therefore, density and viscosity function as molecular GPS.

## Statistical Analysis: Confidence in Results

Measuring isn't enough — **we must quantify uncertainty**. AlcoLab uses rigorous scientific methodology to ensure reliability.

### Z-Test for Comparing Means

With significance level α=0.05, system calculates if measured parameters differ significantly from expected for legitimate beverage. Test answers: "Are measurements consistent with pure beverage or show significant deviation?"

Null hypothesis assumes legitimate composition (water + ethanol). If measurements violate this hypothesis with 95% confidence, there's robust evidence of contamination.

### Monte Carlo Simulation: Quantifying Uncertainty

The crucial innovation: algorithm runs **3,000 numerical simulations** generating random variations around measured experimental values.

For each simulation:
1. **Perturb**: add random noise to measurements
2. **Search**: locate which composition matches perturbed values
3. **Record**: store estimates for water, ethanol, methanol

After 3,000 iterations, **complete probability distribution emerges** for each component. This allows calculating realistic confidence intervals.

**Example:** If 2,950 of 3,000 simulations indicate methanol >10%, you have 98.3% confidence methanol is present. If only 1,200 indicate, there's greater uncertainty. Therefore, simulations quantify result reliability.

### Interpreting Resulting Scenarios

Final results show three scenarios:

| Scenario | Meaning |
|----------|---|
| **Compatible with label** | Composition within expected range for legitimate beverage |
| **Uncertainty detected** | Concentrations in borderline zone, more data would help |
| **Incompatible with label** | Strong statistical evidence of methanol above critical threshold |

Therefore, each scenario offers clear and actionable interpretation.

## Traffic Light System: Immediate Interpretation

For anyone — regardless of scientific knowledge — to quickly understand results, [AlcoLab](https://alcolab.org) displays conclusions through an **intuitive traffic light system**:

### Green: Beverage Compatible with Label

**Meaning:** Measured composition perfectly matches legitimate beverage. Density and viscosity align perfectly with water + ethanol only.

**Interpretation:** Beverage passed rigorous scientific testing. **However:** If there are other adulteration signs (very low price, bad label, suspicious origin), we don't recommend consumption.

### Yellow: Caution Needed

**Meaning:** Data shows uncertainty or borderline zone. Perhaps methanol is present in low concentration (5-10%).

**Interpretation:** Caution recommended. More measurements would help. Avoid consumption until clarification.

### Red: Dangerous Beverage

**Meaning:** Statistical analysis detects methanol with high confidence. Measurements diverge significantly from expected for legitimate beverage.

**Interpretation:** Don't consume. Beverage is contaminated. Report to health authorities.

This visual approach democratizes complex chemical analysis. Transforms scientific equations into clear and actionable decision. In sum, science becomes accessible.

## Proven Effectiveness: Near 100% Detection

The essential question: **does it really work?** Scientific data confirms convincingly.

### Detection Rate for Methanol >10%

For concentrations of **methanol above 10%** — which represents practically **all documented serious poisoning cases** — **detection reaches confidence close to 100%**.

This isn't coincidence. Real deaths involve **methanol above 20%**. In these scenarios, signature in measurements is unequivocal. AlcoLab captures exactly the dangerous cases that matter.

The difference between 20% methanol and 0% methanol (legitimate beverage) is huge in parameters. Monte Carlo simulation with 3,000 iterations converges to clear conclusion: methanol present, beverage dangerous.

### Known Limitations and Real Context

There's a known limitation: **below 5% methanol**, reliability is reduced. Here, distinction in density and viscosity is marginal. Experimental uncertainties begin competing with signal.

However — and this is crucial — **this isn't the scenario saving lives**. Real poisonings occur at much higher concentrations. An adult needs approximately 100-200mL of 20% methanol for serious poisoning.

Concentrations of 5% or less are biologically less dangerous. Don't represent the risk that motivated AlcoLab development. Therefore, technology was optimized for real dangerous regime. After all, detecting irrelevant traces doesn't save lives.

## Local Processing: Privacy Guaranteed

A crucial detail about **privacy and security**: all processing occurs **locally on user's device**. AlcoLab uses **Python through Pyodide (WebAssembly)** to run analysis within the browser.

**No data leaves the browser session.** Density and viscosity numbers remain private. No remote server collects information about which beverages you tested. Reference grid, Monte Carlo simulations, entire statistical analysis — all happens locally.

This means AlcoLab offers dual benefit: **cutting-edge scientific analysis + total privacy**. You get instant answer without data transmission. Therefore, security is fundamental in design. After all, privacy is a right.

## Scientific Validation and Radical Transparency

The method was published in the **Zenodo repository**, international platform for scientific deposit. This means **entire work is available for permanent public review**.

Researchers at any university can:
- **Access** complete methodology details
- **Validate** calculations and simulations
- **Reproduce** results independently
- **Cite** research in their own work

This radical transparency is hallmark of open science. [AlcoLab](https://alcolab.org) fully embraces this philosophy. No proprietary secrets, no "black box". Science is verifiable because it's open to the world. Therefore, reliability is guaranteed by transparency, not marketing.

## Conclusion: Technology Serving Life

Density and viscosity are simple physical properties. But when combined intelligently with rigorous statistics and accessible design, they transform into a **powerful tool that saves lives**.

**AlcoLab** isn't just an app — it's **science democratized**. Used freely at [https://alcolab.org](https://alcolab.org), available in any browser, for anyone needing to test beverage safety.

**Next readings:**
- [How AlcoLab is free and open source](/blog/en/alcolab-open-source-choosing-to-save-lives-now) — equally important decision
- [How to use AlcoLab step by step](/blog/en/how-to-use-alcolab-step-by-step-methanol-screening) — practical guide

Next time you measure density and viscosity in AlcoLab, remember: you're using cutting-edge science, validated and transparent. To protect your health. And those you love. After all, that's why AlcoLab exists.
