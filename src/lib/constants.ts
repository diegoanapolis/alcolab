export const BEVERAGE_TYPES = [
  "Vodka",
  "Cachaça branca",
  "Whisky",
  "Aguardente",
  "Rum branco",
  "Gin seco",
  "Tequila blanca",
  "Pisco",
  "Tiquira",
  "Etanol comercial*",
  "Etanol combustível",
  "Metanol comercial",
  "Outra hidroalcoólica",
] as const;

export type BeverageType = typeof BEVERAGE_TYPES[number];