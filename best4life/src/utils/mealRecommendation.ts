import { MealPlanPreferences, MealSlot, MealSlotName, Recipe, UserProfile, WeeklyDay, WeeklyMealPlan } from '../types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SLOT_NAMES: MealSlotName[] = ['breakfast', 'lunch', 'dinner']

const normalize = (value: string) => value.trim().toLowerCase()

const allergenAlias: Record<string, string> = {
  seafood: 'fish',
}

const normalizeAllergen = (value: string) => allergenAlias[normalize(value)] ?? normalize(value)

const parseBudget = (budget?: string) => {
  if (!budget) return undefined
  const parsed = Number.parseFloat(budget.replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? parsed : undefined
}

export const filterByAllergies = (recipes: Recipe[], allergies: string[]): Recipe[] => {
  const blocked = allergies
    .map((item) => normalizeAllergen(item))
    .filter((item) => item && item !== 'n/a' && item !== 'none' && item !== 'no allergy')

  if (blocked.length === 0) return recipes
  return recipes.filter((recipe) => !recipe.allergies.some((allergy) => blocked.includes(normalizeAllergen(allergy))))
}

export const filterByDietaryPreferences = (recipes: Recipe[], dietaryPreferences: string[]): Recipe[] => {
  const wanted = dietaryPreferences
    .map((item) => normalize(item))
    .filter((item) => item && item !== 'no preference' && item !== 'n/a')

  if (wanted.length === 0) return recipes

  const matched = recipes.filter((recipe) => {
    const tags = (recipe.dietaryTags ?? []).map((tag) => normalize(tag))
    return wanted.some((wantedTag) => tags.includes(wantedTag))
  })

  return matched.length > 0 ? matched : recipes
}

export const scoreByHealthGoal = (recipe: Recipe, healthGoal?: string) => {
  const goal = normalize(healthGoal ?? '')

  if (goal.includes('lose') || goal.includes('weight loss')) {
    return Math.max(0, 40 - recipe.calories / 20) + Math.max(0, 18 - recipe.fat / 3)
  }

  if (goal.includes('muscle') || goal.includes('gain')) {
    return recipe.protein * 1.6 - recipe.calories / 60
  }

  if (goal.includes('healthy')) {
    const calorieBandBonus = recipe.calories >= 350 && recipe.calories <= 680 ? 18 : 4
    const macroBonus = Math.max(0, recipe.protein - 15) * 0.7 + Math.max(0, 25 - recipe.fat) * 0.35
    return calorieBandBonus + macroBonus
  }

  if (goal.includes('budget')) {
    return Math.max(0, 24 - recipe.estimatedCost * 2.3)
  }

  // Balanced lifestyle / maintain weight default.
  const calorieDistance = Math.abs(560 - recipe.calories)
  const macroBalance = Math.max(0, 28 - Math.abs(recipe.protein - 28))
  return Math.max(0, 20 - calorieDistance / 20) + macroBalance * 0.4
}

export const scoreByBudget = (recipe: Recipe, weeklyBudget?: string) => {
  const budget = parseBudget(weeklyBudget)
  if (!budget) return 0
  const estimatedMealBudget = budget / 21
  return estimatedMealBudget >= recipe.estimatedCost
    ? 14 + Math.max(0, (estimatedMealBudget - recipe.estimatedCost) * 2)
    : -Math.min(10, (recipe.estimatedCost - estimatedMealBudget) * 1.8)
}

export const scoreByCuisinePreference = (recipe: Recipe, cuisinePreference?: string) => {
  const cuisine = normalize(cuisinePreference ?? '')
  if (!cuisine || cuisine === 'no preference') return 0
  return normalize(recipe.cuisine).includes(cuisine) ? 16 : -2
}

export const avoidTooMuchRepetition = (recipe: Recipe, recipeCount: Map<string, number>, cuisineCount: Map<string, number>) => {
  const sameRecipeCount = recipeCount.get(recipe.id) ?? 0
  const sameCuisineCount = cuisineCount.get(recipe.cuisine) ?? 0
  return -(sameRecipeCount * 9 + sameCuisineCount * 1.8)
}

export const generateRecommendationReasons = (
  recipe: Recipe,
  options: {
    healthGoal?: string
    weeklyBudget?: string
    cuisinePreference?: string
    dietaryPreferences: string[]
    allergies: string[]
  },
) => {
  const reasons: string[] = []
  const tags = (recipe.dietaryTags ?? []).map((tag) => normalize(tag))

  const preferredDiet = options.dietaryPreferences
    .map((item) => normalize(item))
    .find((item) => item && item !== 'no preference' && item !== 'n/a' && tags.includes(item))
  if (preferredDiet) reasons.push(`Recommended because it matches your ${preferredDiet} preference.`)

  const goal = normalize(options.healthGoal ?? '')
  if (goal.includes('muscle') || goal.includes('gain')) reasons.push('Selected as a high-protein option for your muscle gain goal.')
  else if (goal.includes('lose') || goal.includes('weight loss')) reasons.push('Recommended as a lighter-calorie option for your weight loss goal.')
  else if (goal.includes('budget')) reasons.push('Budget-friendly meal selected for your weekly grocery budget.')
  else if (goal.includes('healthy')) reasons.push('Chosen for a balanced nutrition profile to support healthy eating.')

  if (options.cuisinePreference && normalize(options.cuisinePreference) !== 'no preference' && normalize(recipe.cuisine).includes(normalize(options.cuisinePreference))) {
    reasons.push(`Chosen to match your preferred ${options.cuisinePreference} cuisine.`)
  }

  const blocked = options.allergies.map((item) => normalizeAllergen(item)).filter((item) => item && item !== 'n/a')
  const safe = blocked.length === 0 || !recipe.allergies.some((allergy) => blocked.includes(normalizeAllergen(allergy)))
  if (safe && blocked.length > 0) reasons.push('This meal avoids your selected allergens.')

  if (reasons.length === 0) {
    reasons.push('Recommended as a balanced option to keep your weekly plan varied.')
  }

  return reasons
}

type RecommendationInput = {
  preferences: MealPlanPreferences
  profile: UserProfile
  recipes: Recipe[]
}

export const generateWeeklyMealPlan = ({ preferences, profile, recipes }: RecommendationInput): WeeklyMealPlan => {
  if (recipes.length === 0) {
    return {
      days: [],
      fallbackUsed: true,
      recommendationNotice: 'No recipes are available right now. Please add recipes and try again.',
    }
  }

  // MVP note: this is rule-based recommendation logic (not a real AI model yet).
  const effectiveAllergies = preferences.allergies.length > 0 ? preferences.allergies : profile.allergies
  const effectiveDietary = preferences.dietaryPreferences.length > 0 ? preferences.dietaryPreferences : profile.dietaryPreferences
  const effectiveCuisine = preferences.cuisine && preferences.cuisine !== 'No preference' ? preferences.cuisine : profile.cuisinePreferences?.[0]
  const effectiveHealthGoal = preferences.healthGoal ?? profile.healthGoal
  const effectiveBudget = preferences.budget ?? profile.budget

  const allergyFiltered = filterByAllergies(recipes, effectiveAllergies)
  if (allergyFiltered.length === 0) {
    return {
      days: [],
      fallbackUsed: true,
      recommendationNotice:
        'No meals match your allergy settings yet. Please relax allergy filters or add more allergy-safe recipes.',
    }
  }

  const sourceAfterAllergy = allergyFiltered.length > 0 ? allergyFiltered : recipes
  const dietaryFiltered = filterByDietaryPreferences(sourceAfterAllergy, effectiveDietary)
  const candidatePool = dietaryFiltered.length > 0 ? dietaryFiltered : sourceAfterAllergy

  const recipeCount = new Map<string, number>()
  const cuisineCount = new Map<string, number>()

  const days: WeeklyDay[] = DAYS.map((day) => {
    const meals: MealSlot[] = SLOT_NAMES.map((slot) => {
      const slotCandidates = candidatePool.filter((recipe) => !recipe.mealType || recipe.mealType === slot)
      const evaluated = (slotCandidates.length > 0 ? slotCandidates : candidatePool).map((recipe) => {
        const score =
          scoreByHealthGoal(recipe, effectiveHealthGoal) +
          scoreByBudget(recipe, effectiveBudget) +
          scoreByCuisinePreference(recipe, effectiveCuisine) +
          avoidTooMuchRepetition(recipe, recipeCount, cuisineCount)

        return { recipe, score }
      })

      evaluated.sort((a, b) => b.score - a.score)
      const selected = evaluated[0]?.recipe ?? candidatePool[0]

      recipeCount.set(selected.id, (recipeCount.get(selected.id) ?? 0) + 1)
      cuisineCount.set(selected.cuisine, (cuisineCount.get(selected.cuisine) ?? 0) + 1)

      const reasonText = generateRecommendationReasons(selected, {
        healthGoal: effectiveHealthGoal,
        weeklyBudget: effectiveBudget,
        cuisinePreference: effectiveCuisine,
        dietaryPreferences: effectiveDietary,
        allergies: effectiveAllergies,
      })

      const blocked = effectiveAllergies.map((item) => normalizeAllergen(item)).filter((item) => item && item !== 'n/a')
      const allergySafe = blocked.length === 0 || !selected.allergies.some((allergy) => blocked.includes(normalizeAllergen(allergy)))

      return {
        slot,
        recipe: {
          ...selected,
          recommendationReason: reasonText[0],
        },
        allergySafe,
        recommendationReason: reasonText[0],
        score: evaluated[0]?.score ?? 0,
        matchedTags: selected.dietaryTags,
      }
    })

    return { day, meals }
  })

  const strictFiltersNoDirectMatch = dietaryFiltered.length === 0

  return {
    days,
    fallbackUsed: strictFiltersNoDirectMatch,
    recommendationNotice: strictFiltersNoDirectMatch
      ? 'We used safe fallback picks because your filters were very strict. You can relax allergy, cuisine, dietary, or budget preferences for more options.'
      : undefined,
  }
}
