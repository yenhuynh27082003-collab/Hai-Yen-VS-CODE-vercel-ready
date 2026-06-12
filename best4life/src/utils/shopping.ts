import {
  CATEGORY_BASE_PRICES,
  STOCK_ALTERNATIVES,
  STORE_CATEGORY_ADJUSTMENTS,
  STORE_MULTIPLIERS,
  SUPERMARKETS,
  SupermarketName,
} from '../constants/mockSupermarketData'
import { ShoppingItem, WeeklyMealPlan } from '../types'

const asMoney = (value: number) => Number(value.toFixed(2))

const pickBestStore = (prices: { Aldi: number; Woolworths: number; Coles: number }): SupermarketName => {
  const ranked = SUPERMARKETS.map((store) => [store, prices[store]] as const).sort((a, b) => a[1] - b[1])
  return ranked[0][0]
}

const buildSmartNote = ({
  usedInMealsCount,
  bestPriceStore,
  inStock,
}: {
  usedInMealsCount: number
  bestPriceStore: SupermarketName
  inStock: boolean
}) => {
  if (!inStock) return 'Alternative available if out of stock'
  if (usedInMealsCount >= 3) return `Used in ${usedInMealsCount} meals this week`
  if (bestPriceStore === 'Aldi') return 'Best price at Aldi'
  return 'Budget-friendly ingredient'
}

const getCategoryBase = (category: string) => CATEGORY_BASE_PRICES[category] ?? 3.2

const getIngredientBasePrice = (ingredientName: string, category: string, recipeCost: number) => {
  const categoryBase = getCategoryBase(category)
  const ingredientComplexity = (ingredientName.length % 7) * 0.18
  return asMoney(categoryBase + ingredientComplexity + recipeCost * 0.085)
}

const buildStorePrices = (basePrice: number, category: string) => {
  const categoryAdjustments = STORE_CATEGORY_ADJUSTMENTS[category]
  const prices: { Aldi: number; Woolworths: number; Coles: number } = {
    Aldi: 0,
    Woolworths: 0,
    Coles: 0,
  }

  SUPERMARKETS.forEach((store) => {
    const withStoreMultiplier = basePrice * STORE_MULTIPLIERS[store]
    const withCategoryAdjustment = withStoreMultiplier * (categoryAdjustments?.[store] ?? 1)
    prices[store] = asMoney(withCategoryAdjustment)
  })

  return prices
}

export const buildShoppingListFromMealPlan = (plan: WeeklyMealPlan): ShoppingItem[] => {
  const ingredientMap = new Map<string, ShoppingItem>()
  const usageCount = new Map<string, number>()

  plan.days.forEach((day) => {
    day.meals.forEach((slot) => {
      slot.recipe.ingredients.forEach((ingredient) => {
        const key = ingredient.name.toLowerCase()
        const basePrice = getIngredientBasePrice(ingredient.name, ingredient.category, slot.recipe.estimatedCost)
        usageCount.set(key, (usageCount.get(key) ?? 0) + 1)

        if (!ingredientMap.has(key)) {
          const prices = buildStorePrices(basePrice, ingredient.category)
          const inStock = ingredient.name.length % 5 !== 0
          const bestPriceStore = pickBestStore(prices)
          const usedInMealsCount = usageCount.get(key) ?? 1

          ingredientMap.set(key, {
            id: `item-${key.replace(/\s+/g, '-')}`,
            name: ingredient.name,
            quantity: ingredient.quantity,
            category: ingredient.category,
            estimatedPrice: asMoney(basePrice),
            supermarkets: prices,
            inStock,
            alternative: inStock ? undefined : STOCK_ALTERNATIVES[ingredient.name] ?? 'Seasonal substitute',
            usedInMealsCount,
            bestPriceStore,
            smartNote: buildSmartNote({ usedInMealsCount, bestPriceStore, inStock }),
          })
          return
        }

        const existing = ingredientMap.get(key)
        if (!existing) return

        const increment = asMoney(basePrice * 0.5)
        const incrementedPrices = buildStorePrices(increment, ingredient.category)

        existing.estimatedPrice = asMoney(existing.estimatedPrice + increment)
        existing.supermarkets = {
          Aldi: asMoney(existing.supermarkets.Aldi + incrementedPrices.Aldi),
          Woolworths: asMoney(existing.supermarkets.Woolworths + incrementedPrices.Woolworths),
          Coles: asMoney(existing.supermarkets.Coles + incrementedPrices.Coles),
        }
        existing.usedInMealsCount = usageCount.get(key) ?? existing.usedInMealsCount
        existing.bestPriceStore = pickBestStore(existing.supermarkets)
        existing.smartNote = buildSmartNote({
          usedInMealsCount: existing.usedInMealsCount ?? 1,
          bestPriceStore: existing.bestPriceStore,
          inStock: existing.inStock,
        })
      })
    })
  })

  return Array.from(ingredientMap.values())
}

export const calculateStoreTotals = (items: ShoppingItem[]) => {
  const totals = items.reduce(
    (acc, item) => {
      acc.Aldi += Number(item?.supermarkets?.Aldi ?? 0)
      acc.Woolworths += Number(item?.supermarkets?.Woolworths ?? 0)
      acc.Coles += Number(item?.supermarkets?.Coles ?? 0)
      return acc
    },
    { Aldi: 0, Woolworths: 0, Coles: 0 },
  )

  return {
    Aldi: asMoney(totals.Aldi),
    Woolworths: asMoney(totals.Woolworths),
    Coles: asMoney(totals.Coles),
  }
}

export const findCheapestStore = (totals: { Aldi: number; Woolworths: number; Coles: number }) => {
  const entries = Object.entries(totals) as [keyof typeof totals, number][]
  return entries.sort((a, b) => a[1] - b[1])[0]
}

export const calculateTotalEstimatedPrice = (items: ShoppingItem[]) =>
  asMoney(items.reduce((sum, item) => sum + item.estimatedPrice, 0))
