export type FeatureItem = {
  id: string
  title: string
  shortLabel: string
  description: string
  icon: string
}

export type MealItem = {
  id: string
  title: string
  description: string
  image: string
  calories: string
  price: string
  protein: string
  prepTime: string
  healthScore: number
  healthBars: [number, number, number, number]
}

export type BlogArticle = {
  id: string
  title: string
  category: string
  publishDate: string
  summary: string
  content: string[]
  image: string
}

export type ReviewItem = {
  id: string
  name: string
  role: string
  rating: number
  quote: string
  image: string
}

export type CurrentUser = {
  id?: string
  firstName: string
  lastName: string
  email: string
}

export type UserProfile = {
  avatarUrl?: string
  displayName?: string
  phone?: string
  height?: string
  weight?: string
  age?: string
  gender?: string
  allergies: string[]
  dietaryPreferences: string[]
  cuisinePreferences?: string[]
  budget?: string
  healthGoal?: string
  activityLevel?: string
}

export type MealPlanPreferences = {
  budget?: string
  cuisine?: string
  activityLevel?: string
  useSavedProfile: boolean
  mealsPerDay?: string
  cookingTimePreference?: string
  householdSize?: string
  allergies: string[]
  dietaryPreferences: string[]
  healthGoal?: string
}

export type Recipe = {
  id: string
  title: string
  image: string
  description?: string
  cuisine: string
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  dietaryTags?: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  prepTime: string
  ingredients: { name: string; quantity: string; category: string }[]
  steps: string[]
  allergies: string[]
  estimatedCost: number
  difficulty?: 'easy' | 'medium' | 'hard'
  recommendationReason?: string
  wasteReductionTip?: string
}

export type MealSlotName = 'breakfast' | 'lunch' | 'dinner'

export type MealSlot = {
  slot: MealSlotName
  recipe: Recipe
  allergySafe: boolean
  recommendationReason?: string
  score?: number
  matchedTags?: string[]
}

export type WeeklyDay = {
  day: string
  meals: MealSlot[]
}

export type WeeklyMealPlan = {
  days: WeeklyDay[]
  fallbackUsed?: boolean
  recommendationNotice?: string
}

export type ShoppingItem = {
  id: string
  name: string
  quantity: string
  category: string
  estimatedPrice: number
  supermarkets: { Aldi: number; Woolworths: number; Coles: number }
  inStock: boolean
  alternative?: string
  usedInMealsCount?: number
  smartNote?: string
  bestPriceStore?: 'Aldi' | 'Woolworths' | 'Coles'
}

export type SavedMealPlan = {
  id: string
  createdAt: string
  preferences: MealPlanPreferences
  plan: WeeklyMealPlan
}

export type SavedShoppingList = {
  id: string
  createdAt: string
  items: ShoppingItem[]
  totalEstimatedCost: number
  selectedSupermarket?: 'Aldi' | 'Woolworths' | 'Coles' | 'Cheapest combination'
  selectedSuburb?: string
  itemCount?: number
}

export type UserHistory = {
  mealPlans: SavedMealPlan[]
  shoppingLists: SavedShoppingList[]
  savedRecipes?: {
    recipeId: string
    title: string
    image: string
    savedAt: string
  }[]
  spending?: {
    date: string
    total: number
    store: 'Aldi' | 'Woolworths' | 'Coles'
  }[]
}

export type DailyMealLog = {
  date: string
  breakfast?: Recipe
  lunch?: Recipe
  dinner?: Recipe
  snack?: Recipe
}

export type AppStateSnapshot = {
  profile: UserProfile
  isProfileComplete?: boolean
  mealPlanPreferences: MealPlanPreferences
  weeklyMealPlan: WeeklyMealPlan
  shoppingList: ShoppingItem[]
  savedRecipes: Recipe[]
  history: UserHistory
  ui?: {
    sidebarCollapsed?: boolean
    selectedCalendarDate?: string
  }
  dailyMealLogs?: DailyMealLog[]
  appPreferences?: {
    themeMode?: 'light' | 'dark' | 'system'
    language?: string
    notifications?: boolean
    emailReminders?: boolean
  }
}