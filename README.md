# AlcoLab

**Open-source PWA for accessible methanol screening in hydroalcoholic solutions using density and viscosity measurements with a commercial syringe.**

Methanol-contaminated alcoholic beverages kill hundreds of people every year worldwide, yet practical detection remains almost entirely restricted to expensive laboratory equipment with limited availability.

AlcoLab is a free, open-source Progressive Web App designed to help close this gap and contribute to public health — estimating the ternary composition (water / ethanol / methanol) of hydroalcoholic samples from simple measurements of mass and flow time, using only a syringe, a kitchen scale (0.1 g precision), and a smartphone — also applicable to screening fuel ethanol adulteration.

The app works fully offline after initial load. No data is transmitted to external servers — and future versions will only do so with explicit user consent, to enable features such as epidemiological risk mapping and health surveillance integration.

---

## Background

Methanol poisoning from adulterated alcoholic beverages is a persistent and often neglected global public health emergency. Unlike ethanol, methanol is highly toxic: ingestion of as little as 30 mL can be fatal, while smaller amounts may cause irreversible blindness.

Recent epidemiological alerts reinforce the urgency of accessible screening tools. In October 2025, the Pan American Health Organization (PAHO/WHO) reported that at least five countries in the Americas documented cases and deaths from methanol poisoning over the past five years, including a major outbreak in Brazil with over 200 suspected cases and at least 16 confirmed deaths. By late 2025, the UK Foreign Office had expanded its methanol poisoning travel advisory to 28 countries, including popular tourist destinations across Southeast Asia, Latin America, and Africa.

Despite the scale of the problem, practical detection remains largely restricted to laboratory settings. Selective analytical techniques — primarily gas chromatography variants (GC-FID, GC-MS) — require expensive instrumentation unavailable to most frontline inspectors and entirely absent in many high-risk regions. Portable alternatives such as Raman spectroscopy show promise but remain financially prohibitive, frequently costing tens to hundreds of thousands of dollars. Other proposed solutions rely on toxic reagents, limited-availability chemicals, or laboratory-grade devices requiring specialized training.

AlcoLab addresses this gap with a radically accessible approach: semi-quantitative estimation of the ternary hydroalcoholic composition (water / ethanol / methanol) using only:

- a commercial syringe
- a kitchen scale (0.1 g precision)
- a smartphone running the AlcoLab PWA

By transforming simple physical measurements into analytical insights, AlcoLab expands methanol screening beyond laboratories to health surveillance agents, health professionals, forensic investigators, distributors, and even end consumers — supporting both regulatory enforcement and public health protection worldwide.

AlcoLab is an open-source, non-profit initiative maintained as a voluntary contribution by its authors to global public health.

---

## How It Works

1. **Experiment** — The app guides the user through two measurements for the sample and for water (reference standard):
   - *Relative density* — ratio between the mass of the sample and the mass of water (same volume, same temperature), obtained by differential weighing with a syringe.
   - *Relative viscosity* — ratio between the flow times of the sample and water through the same syringe (18 to 14 mL range).

2. **Alcohol content estimation** — From the relative density and reference tables (Gay-Lussac, OIML), the app estimates the total alcohol content by mass — regardless of whether it is ethanol and/or methanol, since both have very similar densities. Unit conversions (% v/v, °GL, INPM, % w/w) are performed automatically.

3. **Ternary composition screening** — Combines relative density and relative viscosity (corrected to 20 °C) in a pre-computed 3D reference mesh, locating the compositions (pure substance, binary, and/or ternary) whose density and viscosity most closely match the values obtained by the user.

4. **Statistical evaluation** — The app assesses the experimental uncertainty of the measurements, comparing the composition identified in the previous step with nearby compositions using a Z-test for mean comparison and Monte Carlo probabilistic simulation. The goal is to include statistically equivalent and/or probabilistically likely compositions.

5. **Results report** — Equivalent and probable compositions are compared against the declared label. The app organizes experimental measurements and results into a report and displays an immediate safety indicator as a traffic light (green / yellow / red). When methanol presence is probable, the indicator turns red.

---

## Demo Mode

To help users understand the analytical workflow before actual use, the authors have included three demonstration scenarios within the app itself, with real mass values and flow videos:

| Scenario | Actual composition |
|---|---|
| Vodka 40% v/v contaminated | 16.6% ethanol + 16.6% methanol |
| Whisky 40% v/v contaminated | 16.6% ethanol + 16.6% methanol |
| Whisky 40% v/v uncontaminated | ~33% ethanol (legitimate) |

To use, simply access "Teste com dados de exemplos reais" (Test with real example data) on the home screen and follow the indicated analytical workflow — the same path a user will follow in an actual analysis.

---

## Key Features

- Ternary composition estimation (water / ethanol / methanol)
- Traffic-light safety indicator (green / yellow / red)
- Video-based flow timing with frame-by-frame marking and linear regression
- Replicate management with quality metrics (CV and R²)
- Local database (IndexedDB) with analysis history and JSON export
- Demo mode with 3 real-world scenarios (contaminated and legitimate samples)
- Works offline (PWA)
- Dark mode support
- Zero cost — requires only a syringe, a kitchen scale, and a phone

---

## Target Users

- **Health surveillance agents and inspectors** — rapid field screening during inspections and seizures, supporting more targeted referral of samples to official laboratories, whose analytical capacity is limited
- **Health professionals** — preliminary screening of the suspected beverage in care settings for patients presenting symptoms consistent with methanol poisoning, when the sample is accessible, supporting timely clinical decisions while confirmatory results are unavailable
- **Investigators and forensic experts** — preliminary evidence in seizures and investigations
- **Distributors and retailers** — screening verification of suspicious batches or units
- **Consumers** — anyone, in any country, with access to basic materials, provided they strictly follow the methodology indicated within the app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, TypeScript, Tailwind CSS |
| Validation | Zod + React Hook Form |
| Local storage | Dexie (IndexedDB) |
| Scientific processing | Python via Pyodide (WebAssembly) |
| Python libraries | NumPy, SciPy |
| Deployment | Railway |

---

## Running Locally

```bash
git clone https://github.com/diegoanapolis/alcolab.git
cd alcolab
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Pyodide runtime is fetched from CDN on first load.

---

## Applicable Samples

Neat distilled spirits (vodka, cachaça, whisky, rum, gin, tequila, pisco, tiquira), commercial ethanol, fuel ethanol, commercial methanol, and other hydroalcoholic solutions composed of water, ethanol, and methanol.

**Not applicable:** liqueurs, cream-based spirits, fermented beverages, flavored spirits, turbid or pulp-containing beverages.

---

## Limitations

- Screening tool only — does not replace official laboratory analysis
- Methanol detection limit: ≥ 5% by mass
- Accuracy depends on scale precision and flow technique
- Interface currently available in Portuguese only

---

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

---

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

You are free to use, modify, and distribute this software under the terms of the AGPL-3.0. If you modify and deploy it as a network service, you must make your modified source code available.

For commercial licensing inquiries, contact alcolabapp@gmail.com.

---

## Support the Project

AlcoLab is maintained on a voluntary, non-profit basis. To ensure its continuity and evolution — including recalibrations, external validations, building a collaborative database for adulteration mapping, and infrastructure maintenance — the project is open to:

- **Public funding** — grants for innovation, public health, and open science
- **Institutional partnerships** — health organizations, universities, and reference laboratories
- **Corporate sponsorship** — companies in the beverage, food safety, and health sectors
- **Individual donations** — contributions of any amount via Pix: `alcolabapp@gmail.com`

For partnership or funding proposals, contact alcolabapp@gmail.com.

---

## Authors

- **Diego Mendes de Souza** — Development, experiments, and statistics
- **Pedro Augusto de Oliveira Morais** — Scientific review, experiments, and statistics
- **Nayara Ferreira Santos** — UX audit, co-owner, and project management
