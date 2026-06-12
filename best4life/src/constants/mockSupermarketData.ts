export const SUPERMARKETS = ['Aldi', 'Woolworths', 'Coles'] as const

export type SupermarketName = (typeof SUPERMARKETS)[number]

export const STOCK_ALTERNATIVES: Record<string, string> = {
  'Greek yogurt': 'Coconut yogurt',
  'Salmon fillet': 'Barramundi fillet',
  Quinoa: 'Brown rice',
  Avocado: 'Hummus spread',
  'Firm tofu': 'Tempeh',
  'Chicken breast': 'Turkey breast',
  'Mixed berries': 'Seasonal fruit mix',
  'Lettuce mix': 'Baby spinach',
  'Wholemeal pasta': 'Brown rice pasta',
}

export const CATEGORY_BASE_PRICES: Record<string, number> = {
  Produce: 3.4,
  Pantry: 2.8,
  Grains: 3.0,
  Dairy: 4.1,
  Meat: 6.3,
  Seafood: 7.4,
  Bakery: 3.1,
  Fridge: 4.2,
}

export const STORE_MULTIPLIERS: Record<SupermarketName, number> = {
  Aldi: 0.95,
  Woolworths: 1.04,
  Coles: 1.01,
}

export const STORE_CATEGORY_ADJUSTMENTS: Record<string, Partial<Record<SupermarketName, number>>> = {
  Produce: { Aldi: 0.93, Woolworths: 1.03, Coles: 1.0 },
  Pantry: { Aldi: 0.94, Woolworths: 1.05, Coles: 1.01 },
  Meat: { Aldi: 0.96, Woolworths: 1.05, Coles: 1.02 },
  Seafood: { Aldi: 0.98, Woolworths: 1.06, Coles: 1.04 },
  Dairy: { Aldi: 0.95, Woolworths: 1.03, Coles: 1.01 },
}
