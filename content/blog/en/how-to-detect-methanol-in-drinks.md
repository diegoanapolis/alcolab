---
title: "How to detect methanol in drinks: practical guide with AlcoLab"
description: "Learn how to detect methanol in alcoholic beverage with quick screening using syringe, scale, and smartphone. Complete AlcoLab guide."
date: 2026-03-10
author: "Diego Mendes de Souza"
image: "/images/blog/default.jpg"
imageAlt: "Três garrafas de vidro com uma central rotulada METANOL e pictogramas GHS de periculosidade, ilustrando o risco da adulteração de bebidas"
locale: "en"
published: false
status: "em_revisao"
translationSlug: "como-identificar-metanol-em-bebida"
tags:
  - how to detect methanol
  - methanol in beverage
  - screening
  - adulterated beverage
  - public health
  - AlcoLab
focusKeyword: "how to detect methanol in drinks"
---

## Why knowing how to detect methanol in drinks is urgent

Knowing **how to detect methanol in alcoholic beverages** has become a public health issue in Brazil and the world. Methanol (methyl alcohol, CH₃OH) is a highly toxic substance. It's colorless. It has a taste practically identical to ethanol—which makes adulteration imperceptible to the average consumer.

Ingesting just 10 mL of pure methanol can cause irreversible blindness. Doses between 20 and 30 mL can be fatal. In October 2025, the Pan American Health Organization (PAHO/WHO) issued an epidemiological alert about methanol poisoning in at least five countries in the Americas, including Brazil.

First and foremost, understand: you cannot identify methanol by the senses. You cannot do it by sight. You cannot do it by smell. You cannot do it by taste. You need appropriate technical method.

## The methanol crisis in Brazil in 2025

Between September and December 2025, Brazil faced one of the worst methanol poisoning crises in its history. **97 confirmed cases and 62 deaths** were recorded, concentrated mainly in the state of São Paulo.

The term "methanol" was the **second most searched topic on Google Brazil in 2025**, surpassed only by Trump tariffs. Thus, the Brazilian population became desperate seeking answers.

Furthermore, rumors about methanol in Coca-Cola, coffee, and water went viral on social media—although all confirmed cases involved exclusively **adulterated distilled beverages**.

**In this sense, knowledge is power.** The ability to know **how to detect methanol in drinks** can protect you and your entire community.

Faced with this crisis, the question millions of Brazilians asked Google was precisely: **How to detect methanol in drinks?** Until then, the answer was discouraging.

## The problem: detecting methanol without a laboratory was impossible

Before [AlcoLab](https://alcolab.org), **how to detect methanol in drinks** required expensive and inaccessible laboratory equipment. Most people were completely helpless.

The reference method is **gas chromatography** (GC-FID or GC-MS). It's a high-precision technique. Its equipment costs starting at R$ 30,000. Only specialized laboratories possess this infrastructure:

- Fiocruz
- Unicamp
- Some high-cost private laboratories

Other technical alternatives include:

- **Raman Spectroscopy** — cost R$ 180,000+
- **Near-infrared Spectroscopy (NIR)** — cost R$ 300,000+
- **Liquid Chromatography (HPLC)** — cost R$ 100,000+

For sanitary surveillance in small municipalities—which often don't even have their own vehicles—these amounts are prohibitive. Absolutely impossible.

Thus, field inspectors were completely without practical tools. Health professionals were unarmed. Unsuspecting consumers were completely vulnerable—until now.

**Being so, there was a dangerous gap in detection capacity.**

## The revolutionary solution: AlcoLab

[AlcoLab](https://alcolab.org) is a free and open-source web application created by Brazilian researchers. It allows anyone to perform methanol screening in distilled beverages. It works as a true weapon against adulteration.

All processing happens locally on the user's phone—no data is transmitted to external servers. Your privacy is completely protected.

To perform complete screening and know **how to detect methanol in drinks**, you need only three items:

- **20 mL syringe with 22G needle** — the most common sold in pharmacies (~R$ 5)
- **Kitchen scale** with 0.1 g resolution (any simple domestic scale)
- **Smartphone** with camera and web browser (practically any modern phone)

The total cost of materials is less than R$ 10. The process takes between 15 and 25 minutes. Very quick to protect your life.

## How the detection method works

AlcoLab uses the combination of two physical properties to estimate sample composition. Thus, it identifies methanol in alcoholic beverages reliably without need for a laboratory.

### Property 1: Relative density—how much alcohol

You weigh 20 mL of distilled water using the syringe on the scale. Then you weigh 20 mL of the sample using the same syringe. The ratio between the masses provides the **relative density**.

**This measurement indicates:**
- Total alcohol content—how much alcohol is in the beverage
- Whether it's ethanol, methanol, or a mixture of both
- General alcohol concentration

However, density alone is not sufficient. Ethanol has density of 0.789 g/mL and methanol 0.791 g/mL at 20°C—values so close that any commercial hydrometer would confuse the two.

**In this sense, we need a second measurement.**

### Property 2: Relative viscosity—how much is ethanol vs. methanol

Here is AlcoLab's innovation. The viscosity of the components is significantly different:

| Substance | Viscosity (mPa·s at 20°C) |
|---|---|
| **Water** | 1.002 |
| **Ethanol** | 1.200 |
| **Methanol** | **0.544** |

Methanol is almost **twice less viscous** than water. Much less viscous than ethanol. This difference is measurable with a common syringe.

**The liquid with methanol flows faster.**

You film water flowing through the syringe with needle. Then you film the sample flowing. The app automatically analyzes the times through video processing.

**Thus, the combination of density (total alcohol amount) with viscosity (how much is ethanol vs. methanol) allows identification of adulterations with precision.**

### Advanced statistical analysis

The application compares your measurements with a **three-dimensional reference mesh** pre-calculated with thousands of possible compositions. It includes combinations of:
- Water
- Ethanol
- Methanol

Subsequently, it applies two sophisticated statistical tests:

**Z Test** — Verifies if the measured composition is statistically different from neighboring compositions. Increases confidence in the result.

**Monte Carlo Simulation (N=3,000)** — Generates random variations around the measured values. Identifies the most statistically probable compositions.

Thus, even small variations in measurements are captured and analyzed appropriately.

## Immediate result: intuitive traffic light system

After processing, which takes just seconds, AlcoLab displays an absolutely intuitive visual result:

**Green—Safe**
- Sample compatible with the label
- No signs of adulteration
- Safe to consume

**Yellow—Inconclusive**
- Insufficient data or result in lower sensitivity range
- Recommends repeating the measurement
- Not conclusive enough

**Red—Dangerous**
- Sample incompatible with the label
- Possible methanol presence detected
- **Do not consume the beverage**
- Contact sanitary authorities

The confidence of the result is especially high when methanol content is above 10% of total volume.

In all documented intoxication cases in Brazil and worldwide, methanol contents in adulterated beverages were on the order of 20% or greater. **At this range, AlcoLab presents assertiveness close to 100%.**

## Important limitations: what AlcoLab doesn't do

It's fundamental to understand that AlcoLab is a **screening tool, not a confirmatory exam.** It doesn't replace gas chromatography. It doesn't replace other official laboratory methods.

**Practical detection limit:**
- Approximately **5% by mass of methanol**
- Concentrations below 5% are harder to detect
- However, concentrations below 5% would rarely cause severe intoxication

Furthermore, the app works only with **pure distilled beverages:**
- Vodka
- White cachaça
- Whiskey
- White rum
- Dry gin
- Tequila
- Spirits

**Not compatible with:**
- Fermented beverages (beer, wine)
- Liqueurs with added dyes
- Beverages with sugars
- Beverages with artificial flavorings

**In this sense, AlcoLab is specialized and precise in its scope of application.**

## Step by step: how to detect methanol in drinks

To learn **how to detect methanol in drinks**, follow this procedure methodically:

### Step 1: Prepare the material

- Obtain a 20 mL syringe with 22G needle
- Completely clean the syringe (distilled water)
- Completely dry the syringe
- Prepare the kitchen scale
- Ensure the scale is zeroing correctly
- Prepare the smartphone with camera

### Step 2: Measure relative density

- Weigh 20 mL of distilled water with the syringe
- Record the mass of water
- Weigh 20 mL of the sample with the same syringe
- Record the sample mass
- Calculate: Relative density = Sample mass / Water mass

### Step 3: Measure relative viscosity

- Place the syringe (with needle) in vertical position
- Film water flowing through the needle (until empty)
- Record the flow time
- Repeat with the sample
- Calculate: Relative viscosity = Sample time / Water time

### Step 4: Enter in AlcoLab

- Access [AlcoLab](https://alcolab.org)
- Enter the measured values
- Upload the flow video (optional, but recommended)
- Press "Analyze"

### Step 5: Interpret the result

- Green = Safe (consume with confidence)
- Yellow = Repeat the measurement
- Red = Do not consume (possible adulteration)

## Who can use AlcoLab and for what

AlcoLab was designed to be useful in various practical situations:

**Individual consumers** can perform screening before consuming a beverage of questionable origin. Just follow the methodology indicated in the app itself. Low-cost personal protection.

**Sanitary surveillance inspectors** can perform field screening. They prioritize which samples really need to be sent to the laboratory. They optimize limited time and resources. It revolutionizes municipal capacity.

**Small producers and artisanal distilleries** can use the tool as quality control. They verify if the distillation process properly separated the heads fraction (where methanol concentrates). They ensure safe product.

**Beverage distributors** can verify the quality of received batches before passing them to commerce. They avoid distributing adulterated product. They protect their reputation.

**Community associations** can train people to protect entire communities. It democratizes protection.

## About the creators

AlcoLab was developed by:

- **Diego Mendes de Souza** — PhD in Chemometrics and Criminal Forensic Expert. Dedicated researcher.
- **Pedro Augusto de Oliveira Morais** — PhD in Chemometrics and Chemistry professor at UFMA. Theoretical expertise.
- **Nayara Ferreira Santos** — Administrator. Project management.

The project is **100% open source** under AGPL-3.0 license. It was published on the scientific platform Zenodo. The source code is available on [GitHub](https://github.com/diegoanapolis/alcolab). INPI registration is in progress.

**Furthermore, the researchers chose to make the tool available free of charge.** They fund the infrastructure out of pocket. They could have pursued a patent—a process taking 1.5 to 7 years.

As they state: *"Lives cannot wait."*

**In this sense, they put lives above profit.**

## Recommended use table

As demonstrated below, AlcoLab is recommended in multiple situations:

| Situation | Use AlcoLab? | Urgency |
|---|---|---|
| **Beverage from well-known brand, formalized establishment** | Not necessary | Low |
| **Beverage from unknown origin** | Highly recommended | High |
| **Very cheap beverage (suspicious)** | Recommended | High |
| **Beverage without original seal** | Recommended | High |
| **Beverage at informal event/street** | Recommended | Critical |
| **After consuming, with warning symptoms** | Too late (go to hospital) | Emergency |

## Practical experience: demonstration scenarios

[AlcoLab](https://alcolab.org) includes **three demonstration scenarios** with real data. You can experiment without using your own sample:

1. **Legitimate sample** — Pure ethanol or safe beverage
2. **Lightly contaminated sample** — Small amount of methanol
3. **Heavily contaminated sample** — Significant amount of methanol

These scenarios allow you to fully understand the operation before conducting your own test. It increases your confidence in use.

## Conclusion: protection within reach

Knowing **how to detect methanol in drinks** is no longer a privilege of expensive laboratories. It has become accessible to anyone with a syringe, a scale, and a smartphone.

AlcoLab represents a revolution in individual protection against adulterated beverages. It puts power in the hands of the consumer. It puts power in the hands of sanitary surveillance.

**Furthermore, it's free. Furthermore, it's scientific. Furthermore, it's effective.**

For a detailed step-by-step guide of the complete methodology, check our [complete AlcoLab usage guide](/blog/en/how-to-use-alcolab-step-by-step-methanol-screening).

And if you want to understand more about methanol risks, read:
- [What is methanol and why is it so dangerous](/blog/en/what-is-methanol-why-dangerous-in-drinks)
- [Methanol poisoning symptoms](/blog/en/methanol-poisoning-symptoms-warning-signs)
- [How much methanol can kill](/blog/en/how-much-methanol-can-kill-lethal-doses)

> ⚠️ **IMPORTANT:** In case of suspected methanol contamination, **do not consume the beverage** and immediately contact sanitary authorities or emergency services (192 in Brazil).

**Remember: now you know how to detect methanol in drinks. Use this power to protect yourself and your community. Lives depend on it.**
