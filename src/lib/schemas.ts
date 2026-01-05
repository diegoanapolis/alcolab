import { z } from "zod";
import { BEVERAGE_TYPES } from "@/lib/constants";

export const profileSchema = z.object({
  beverageType: z.enum(BEVERAGE_TYPES, { message: "Selecione o tipo de solução" }),
  labelAbv: z.number().min(0, "Mínimo 0.0").max(100, "Máximo 100.0").optional(),
  labelUnit: z.enum(["% v/v - Bebidas", "º GL - Gay-Lussac", "INPM ou % m/m"], { message: "Selecione a unidade do teor" }).optional(),
  ethanolMassPercent: z.number().min(0, "Mínimo 0.0").max(100, "Máximo 100.0").optional(),
  methanolMassPercent: z.number().min(0, "Mínimo 0.0").max(100, "Máximo 100.0").optional(),
  brand: z.string().max(60).optional(),
  sampleName: z.string().max(60).optional(),
  lot: z.string().max(60).optional(),
}).refine((data) => { if (typeof data.labelAbv === 'number') { return !!data.labelUnit } return true }, { message: "Selecione a unidade do teor indicado", path: ["labelUnit"] }).superRefine((data, ctx) => {
  if (data.beverageType === "Outra hidroalcoólica") {
    const e = typeof data.ethanolMassPercent === 'number' && !isNaN(data.ethanolMassPercent) ? data.ethanolMassPercent : undefined
    const m = typeof data.methanolMassPercent === 'number' && !isNaN(data.methanolMassPercent) ? data.methanolMassPercent : undefined
    if (typeof e === 'number' && typeof m === 'number') {
      if (e + m > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ethanolMassPercent"], message: "Soma de etanol e metanol não pode superar 100%" })
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["methanolMassPercent"], message: "Soma de etanol e metanol não pode superar 100%" })
      }
    }
  }
});

export const waterTempSchema = z.object({
  waterType: z.enum(["Mineral sem gás (recomendável)", "Potável/torneira", "Deionizada/Destilada (quando disponível)"], { message: "Selecione o tipo de água" }),
  conductivity: z.number().optional(),
  estimatedConductivity: z.number().optional(),
  waterTemperature: z.number().min(20, "Mínimo 20 °C").max(30, "Máximo 30 °C"),
  sampleTemperature: z.number().min(20, "Mínimo 20 °C").max(30, "Máximo 30 °C"),
}).refine((data) => { return Math.abs((data.sampleTemperature ?? 0) - (data.waterTemperature ?? 0)) <= 2 }, { message: "⚠️ Amostra e água devem estar equilibradas (diferença máx. 2ºC).", path: ["sampleTemperature"] });

export const densitySchema = z.object({
  method: z.enum(["Balança", "Densímetro ou alcôometro"]).optional(),
  containerMass: z.number().optional(),
  waterMass: z.number().optional(),
  sampleMass: z.number().optional(),
  measuredValue: z.number().optional(),
  measuredUnit: z.enum(["g/mL ou g/cm³", "% v/v ou °GL", "% m/m ou INPM", "% v/v - rótulo"]).optional(),
}).refine((data) => { if (data.method === "Densímetro ou alcôometro") { return typeof data.measuredValue === "number" && !!data.measuredUnit } return typeof data.waterMass === "number" && typeof data.sampleMass === "number" }, { message: "Informe os campos conforme o método selecionado", path: ["method"] });

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
