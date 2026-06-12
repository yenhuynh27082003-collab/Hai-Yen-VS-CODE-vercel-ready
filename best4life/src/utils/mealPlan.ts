import { MOCK_RECIPES } from '../constants/mockRecipes'
import { MealPlanPreferences, UserProfile, WeeklyMealPlan } from '../types'
import { generateWeeklyMealPlan } from './mealRecommendation'

export const generateMockWeeklyMealPlan = (
  preferences: MealPlanPreferences,
  profile: UserProfile,
): WeeklyMealPlan => {
  return generateWeeklyMealPlan({
    preferences,
    profile,
    recipes: MOCK_RECIPES,
  })
}
