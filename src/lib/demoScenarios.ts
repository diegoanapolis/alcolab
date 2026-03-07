// Demo scenarios for AlcoLab demonstration mode
// Each scenario includes pre-filled date for all wizard steps + video replicates

const R2_BASE = "https://pub-ebe8be4f7ca3479c8147d4d9117bcc6f.r2.dev"

export type DemoScenarioId = "1" | "2" | "3"

export interface DemoScenario {
  id: DemoScenarioId
  label: string
  description: string
  beverageType: string
  sampleName: string
  profile: {
    beverageType: string
    labelAbv: number
    labelUnit: string
    sampleName: string
    brand: string
    lot: string
  }
  density: {
    method: string
    containerMass: number
    waterMass: number    // raw (container + liquid)
    sampleMass: number   // raw (container + liquid)
  }
  waterTemp: {
    waterType: string
    waterTemperature: number
    sampleTemperature: number
  }
  waterVideos: Array<{
    url: string
    fileName: string
    duration: number
    marks: Record<14 | 15 | 16 | 17 | 18, number | undefined>
    volumesMarked: Array<14 | 15 | 16 | 17 | 18>
  }>
  sampleVideos: Array<{
    url: string
    fileName: string
    duration: number
    marks: Record<14 | 15 | 16 | 17 | 18, number | undefined>
    volumesMarked: Array<14 | 15 | 16 | 17 | 18>
  }>
  manualTimesText: string
  banners: {
    sampleData: string
    density: string
    waterTemp: string
    times: string
  }
}

// Helper: compute linear marks for given delta time (18→14 mL)
function computeMarks(dt: number, t18: number): Record<14 | 15 | 16 | 17 | 18, number> {
  const rate = dt / 4
  return {
    18: Math.round(t18 * 100) / 100,
    17: Math.round((t18 + rate) * 100) / 100,
    16: Math.round((t18 + 2 * rate) * 100) / 100,
    15: Math.round((t18 + 3 * rate) * 100) / 100,
    14: Math.round((t18 + 4 * rate) * 100) / 100,
  }
}

const COMMON_BANNER_SAMPLE = 'Label indicated 40% v/v alcohol content, with manufacturer and batch markings illegible. Pre-filled date below.'
const bannerDensity = (waterMass: number, sampleMass: number) => `The following masses were measured: syringe+needle 10.6 g; syringe+needle+water ${waterMass} g; syringe+needle+sample ${sampleMass} g. Pre-filled date below.`
const COMMON_BANNER_TEMP = 'Experiment conducted at 25 °C, using still mineral water as reference.'
const COMMON_BANNER_TIMES_HEADER = 'Flow videos provided and pre-selected below. For a better understanding of the time marking (critical step), we recommend clicking "Edit" on each video and using visual cues to perform the markings. For a quicker test, simply advance or remove the 4 videos via "Delete" and manually enter the flow times (18 to 14 mL) provided below. After typing each time, click "+".'

// Water videos are the same for all scenarios
const waterVideo1 = {
  url: `${R2_BASE}/padrao_agua_1.mp4`,
  fileName: "padrao_agua_1.mp4",
  duration: 120,
  marks: computeMarks(103.9, 5.00),
  volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
}
const waterVideo2 = {
  url: `${R2_BASE}/padrao_agua_2.mp4`,
  fileName: "padrao_agua_2.mp4",
  duration: 120,
  marks: computeMarks(104.9, 4.80),
  volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "1",
    label: "Vodka 40% v/v contaminated",
    description: "16.6% ethanol + 16.6% methanol",
    beverageType: "Vodka",
    sampleName: "Suspected beverage 1",
    profile: {
      beverageType: "Vodka",
      labelAbv: 40,
      labelUnit: "% v/v - Beverages",
      sampleName: "Suspected beverage 1",
      brand: "Not provided",
      lot: "Not provided",
    },
    density: {
      method: "Scale",
      containerMass: 10.6,
      waterMass: 30.3,
      sampleMass: 29.3,
    },
    waterTemp: {
      waterType: "Still mineral (recommended)",
      waterTemperature: 25,
      sampleTemperature: 25,
    },
    waterVideos: [waterVideo1, waterVideo2],
    sampleVideos: [
      {
        url: `${R2_BASE}/vodka_contaminada_1.mp4`,
        fileName: "vodka_contaminada_1.mp4",
        duration: 240,
        marks: computeMarks(214.8, 7.00),
        volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
      },
      {
        url: `${R2_BASE}/vodka_contaminada_2.mp4`,
        fileName: "vodka_contaminada_2.mp4",
        duration: 240,
        marks: computeMarks(219.2, 6.50),
        volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
      },
    ],
    manualTimesText: "Water: 103.9 and 104.9 seconds\nSample: 214.8 and 219.2 seconds",
    banners: {
      sampleData: COMMON_BANNER_SAMPLE,
      density: bannerDensity(30.3, 29.3),
      waterTemp: COMMON_BANNER_TEMP,
      times: `${COMMON_BANNER_TIMES_HEADER}\nWater: 103.9 and 104.9 seconds\nSample: 214.8 and 219.2 seconds`,
    },
  },
  {
    id: "2",
    label: "Whisky 40% v/v contaminated",
    description: "16.6% ethanol + 16.6% methanol",
    beverageType: "Whisky",
    sampleName: "Suspected beverage 2",
    profile: {
      beverageType: "Whisky",
      labelAbv: 40,
      labelUnit: "% v/v - Beverages",
      sampleName: "Suspected beverage 2",
      brand: "Not provided",
      lot: "Not provided",
    },
    density: {
      method: "Scale",
      containerMass: 10.6,
      waterMass: 30.5,
      sampleMass: 29.5,
    },
    waterTemp: {
      waterType: "Still mineral (recommended)",
      waterTemperature: 25,
      sampleTemperature: 25,
    },
    waterVideos: [waterVideo1, waterVideo2],
    sampleVideos: [
      {
        url: `${R2_BASE}/whisky_contaminada_1.mp4`,
        fileName: "whisky_contaminada_1.mp4",
        duration: 240,
        marks: computeMarks(216.8, 7.00),
        volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
      },
      {
        url: `${R2_BASE}/whisky_contaminada_2.mp4`,
        fileName: "whisky_contaminada_2.mp4",
        duration: 240,
        marks: computeMarks(223.5, 6.50),
        volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
      },
    ],
    manualTimesText: "Water: 103.9 and 104.9 seconds\nSample: 216.8 and 223.5 seconds",
    banners: {
      sampleData: COMMON_BANNER_SAMPLE,
      density: bannerDensity(30.5, 29.5),
      waterTemp: COMMON_BANNER_TEMP,
      times: `${COMMON_BANNER_TIMES_HEADER}\nWater: 103.9 and 104.9 seconds\nSample: 216.8 and 223.5 seconds`,
    },
  },
  {
    id: "3",
    label: "Whisky 40% v/v uncontaminated",
    description: "Uncontaminated sample",
    beverageType: "Whisky",
    sampleName: "Suspected beverage 3",
    profile: {
      beverageType: "Whisky",
      labelAbv: 40,
      labelUnit: "% v/v - Beverages",
      sampleName: "Suspected beverage 3",
      brand: "Not provided",
      lot: "Not provided",
    },
    density: {
      method: "Scale",
      containerMass: 10.6,
      waterMass: 30.4,
      sampleMass: 29.4,
    },
    waterTemp: {
      waterType: "Still mineral (recommended)",
      waterTemperature: 25,
      sampleTemperature: 25,
    },
    waterVideos: [waterVideo1, waterVideo2],
    sampleVideos: [
      {
        url: `${R2_BASE}/whisky_1.mp4`,
        fileName: "whisky_1.mp4",
        duration: 290,
        marks: computeMarks(264.5, 7.00),
        volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
      },
      {
        url: `${R2_BASE}/whisky_2.mp4`,
        fileName: "whisky_2.mp4",
        duration: 290,
        marks: computeMarks(263.6, 6.50),
        volumesMarked: [18, 17, 16, 15, 14] as Array<14 | 15 | 16 | 17 | 18>,
      },
    ],
    manualTimesText: "Water: 103.9 and 104.9 seconds\nSample: 264.5 and 263.6 seconds",
    banners: {
      sampleData: COMMON_BANNER_SAMPLE,
      density: bannerDensity(30.4, 29.4),
      waterTemp: COMMON_BANNER_TEMP,
      times: `${COMMON_BANNER_TIMES_HEADER}\nWater: 103.9 and 104.9 seconds\nSample: 264.5 and 263.6 seconds`,
    },
  },
]

export function getDemoScenario(id: string): DemoScenario | null {
  return DEMO_SCENARIOS.find((s) => s.id === id) ?? null
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("demoScenario")
}

export function getDemoId(): DemoScenarioId | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("demoScenario") as DemoScenarioId | null
}

export function clearDemoMode(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("demoScenario")
}
