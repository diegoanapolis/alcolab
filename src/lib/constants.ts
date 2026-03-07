export const BEVERAGE_TYPES = [
  "Vodka",
  "Cachaça branca",
  "Whisky",
  "Aguardente",
  "White rum",
  "Dry gin",
  "Tequila blanca",
  "Pisco",
  "Tiquira",
  "Commercial ethanol*",
  "Fuel ethanol",
  "Commercial methanol",
  "Other hydroalcoholic",
] as const;

export type BeverageType = typeof BEVERAGE_TYPES[number];