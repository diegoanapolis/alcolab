import { z } from "zod";
import { BEVERAGE_TYPES } from "@/lib/constants";

export const profileSchema = z.object({
  beverageType: z.enum(BEVERAGE_TYPES, { message: "Select the solution type" }),
  labelAbv: z.number().min(0, "Minimum 0.0").max(100, "Maximum 100.0").optional(),
  labelUnit: z.enum(["% v/v - Beverages", "º GL - Gay-Lussac", "INPM or % w/w"], { message: "Select the label unit" }).optional(),
  ethanolMassPercent: z.number().min(0, "Minimum 0.0").max(100, "Maximum 100.0").optional(),
  methanolMassPercent: z.number().min(0, "Minimum 0.0").max(100, "Maximum 100.0").optional(),
  brand: z.string().max(60).optional(),
  sampleName: z.string().max(60).optional(),
  lot: z.string().max(60).optional(),
}).refine((data) => { if (typeof data.labelAbv === 'number') { return !!data.labelUnit } return true }, { message: "Select the indicated label unit", path: ["labelUnit"] }).superRefine((data, ctx) => {
  if (data.beverageType === "Other hydroalcoholic") {
    const e = typeof data.ethanolMassPercent === 'number' && !isNaN(data.ethanolMassPercent) ? data.ethanolMassPercent : undefined
    const m = typeof data.methanolMassPercent === 'number' && !isNaN(data.methanolMassPercent) ? data.methanolMassPercent : undefined
    if (typeof e === 'number' && typeof m === 'number') {
      if (e + m > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ethanolMassPercent"], message: "Ethanol + methanol sum cannot exceed 100%" })
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["methanolMassPercent"], message: "Ethanol + methanol sum cannot exceed 100%" })
      }
    }
  }
});

export const waterTempSchema = z.object({
  waterType: z.enum(["Still mineral (recommended)", "Tap/potable", "Deionized/Distilled (when available)"], { message: "Select the water type" }),
  conductivity: z.number().optional(),
  estimatedConductivity: z.number().optional(),
  waterTemperature: z.number().min(20, "Minimum 20 °C").max(30, "Maximum 30 °C"),
  sampleTemperature: z.number().min(20, "Minimum 20 °C").max(30, "Maximum 30 °C"),
}).refine((data) => { return Math.abs((data.sampleTemperature ?? 0) - (data.waterTemperature ?? 0)) <= 2 }, { message: "⚠️ Sample and water must be equilibrated (max. difference 2°C).", path: ["sampleTemperature"] });

export const densitySchema = z.object({
  method: z.enum(["Scale", "Hydrometer or alcoholmeter"]).optional(),
  containerMass: z.number().optional(),
  waterMass: z.number().optional(),
  sampleMass: z.number().optional(),
  measuredValue: z.number().optional(),
  measuredUnit: z.enum(["g/mL or g/cm³", "% v/v or °GL", "% w/w or INPM", "% v/v - label"]).optional(),
}).refine((data) => { if (data.method === "Hydrometer or alcoholmeter") { return typeof data.measuredValue === "number" && !!data.measuredUnit } return typeof data.waterMass === "number" && typeof data.sampleMass === "number" }, { message: "Fill in the fields according to the selected method", path: ["method"] });

export const timesSchema = z.object({
  waterTimes: z.array(z.number()).default([]),
  sampleTimes: z.array(z.number()).default([]),
  deltaV: z.number().default(4),
  hm: z.number().default(7),
});

export type ProfileData = z.infer<typeof profileSchema>;
export type WaterTempData = z.infer<typeof waterTempSchema>;
export type DensityData = z.infer<typeof densitySchema>;
export type TimesData = z.infer<typeof timesSchema>;
