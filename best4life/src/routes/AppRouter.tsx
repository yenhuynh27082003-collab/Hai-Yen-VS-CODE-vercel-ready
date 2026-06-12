import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardAppLayout } from '../components/layout/DashboardAppLayout'
import {
  CurrentUser,
  MealPlanPreferences,
  Recipe,
  SavedMealPlan,
  SavedShoppingList,
  ShoppingItem,
  UserHistory,
  UserProfile,
  WeeklyMealPlan,
} from '../types'
import { AboutPage } from '../pages/AboutPage'
import { BlogArticlePage } from '../pages/BlogArticlePage'
import { BlogPage } from '../pages/BlogPage'
import { CreateMealPlanPage } from '../pages/CreateMealPlanPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HistoryPage } from '../pages/HistoryPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { MealLibraryPage } from '../pages/MealLibraryPage'
import { MealPlanResultPage } from '../pages/MealPlanResultPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PricingPage } from '../pages/PricingPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RecipeDetailPage } from '../pages/RecipeDetailPage'
import { ShoppingListPage } from '../pages/ShoppingListPage'
import { SignupPage } from '../pages/SignupPage'
import { SettingsPage } from '../pages/SettingsPage'

type AppRouterProps = {
  currentUser: CurrentUser | null
  profile: UserProfile
  mealPlanPreferences: MealPlanPreferences
  weeklyMealPlan: WeeklyMealPlan
  shoppingList: ShoppingItem[]
  savedRecipes: Recipe[]
  history: UserHistory
  isProfileComplete: boolean
  showOnboardingModal: boolean
  profileCompletion: number
  onSignup: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; message?: string; requiresEmailConfirmation?: boolean }>
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  onLogout: () => void
  onSaveProfile: (profile: UserProfile) => void
  onSkipOnboarding: () => void
  onCloseOnboarding: () => void
  onCreateMealPlan: (prefs: MealPlanPreferences, plan: WeeklyMealPlan) => Promise<{ success: boolean; message?: string }>
  onUpdateMealPlan: (plan: WeeklyMealPlan) => void
  onCreateShoppingList: (list: ShoppingItem[]) => void
  onUpdateShoppingList: (list: ShoppingItem[]) => void
  onSaveToHistory: (mealPlan: SavedMealPlan, list: SavedShoppingList) => Promise<{ success: boolean; message?: string }>
  onSaveRecipe: (recipe: Recipe) => void
  onRemoveRecipe: (recipeId: string) => void
  selectedSupermarket: 'Aldi' | 'Woolworths' | 'Coles' | 'Cheapest combination'
  cartTotal: number
  onSelectSupermarket: (store: 'Aldi' | 'Woolworths' | 'Coles' | 'Cheapest combination') => void
  onUpdateCartTotal: (total: number) => void
  appSettings: { themeMode: 'light' | 'dark' | 'system'; language: string; notifications: boolean; emailReminders: boolean }
  onSaveMealPrefs: (prefs: MealPlanPreferences) => void
  onSaveSettings: (settings: { themeMode: 'light' | 'dark' | 'system'; language: string; notifications: boolean; emailReminders: boolean }) => void
}

export const AppRouter = ({
  currentUser,
  profile,
  mealPlanPreferences,
  weeklyMealPlan,
  shoppingList,
  savedRecipes,
  history,
  isProfileComplete: _isProfileComplete,
  showOnboardingModal: _showOnboardingModal,
  profileCompletion: _profileCompletion,
  onSignup,
  onLogin,
  onLogout,
  onSaveProfile,
  onSkipOnboarding: _onSkipOnboarding,
  onCloseOnboarding: _onCloseOnboarding,
  onCreateMealPlan,
  onUpdateMealPlan,
  onCreateShoppingList,
  onUpdateShoppingList,
  onSaveToHistory,
  onSaveRecipe,
  onRemoveRecipe,
  selectedSupermarket,
  cartTotal,
  onSelectSupermarket,
  onUpdateCartTotal,
  appSettings,
  onSaveMealPrefs,
  onSaveSettings,
}: AppRouterProps) => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogArticlePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/signup" element={<SignupPage onSignup={onSignup} />} />
      </Route>

      <Route element={<DashboardAppLayout currentUser={currentUser} onLogout={onLogout} />}>
        <Route
          path="/dashboard"
          element={<DashboardPage currentUser={currentUser} weeklyMealPlan={weeklyMealPlan} shoppingList={shoppingList} />}
        />
        <Route path="/profile" element={<ProfilePage profile={profile} onSaveProfile={onSaveProfile} />} />
        <Route path="/profile/history" element={<HistoryPage history={history} />} />
        <Route path="/profile/shopping-history" element={<HistoryPage history={history} />} />
        <Route path="/profile/settings" element={<SettingsPage currentUserName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Best4Life User'} currentUserEmail={currentUser?.email ?? 'user@best4life.app'} profile={profile} mealPlanPreferences={mealPlanPreferences} settings={appSettings} onSaveProfile={onSaveProfile} onSaveMealPrefs={onSaveMealPrefs} onSaveSettings={onSaveSettings} />} />
        <Route
          path="/create-meal-plan"
          element={<CreateMealPlanPage profile={profile} mealPlanPreferences={mealPlanPreferences} onCreateMealPlan={onCreateMealPlan} />}
        />
        <Route
          path="/meal-plan-result"
          element={<MealPlanResultPage weeklyMealPlan={weeklyMealPlan} onUpdateMealPlan={onUpdateMealPlan} onCreateShoppingList={onCreateShoppingList} />}
        />
        <Route path="/recipe/:id" element={<RecipeDetailPage weeklyMealPlan={weeklyMealPlan} onUpdateMealPlan={onUpdateMealPlan} savedRecipes={savedRecipes} onSaveRecipe={onSaveRecipe} onRemoveRecipe={onRemoveRecipe} />} />
        <Route path="/meal-library" element={<MealLibraryPage onUpdateMealPlan={onUpdateMealPlan} weeklyMealPlan={weeklyMealPlan} savedRecipes={savedRecipes} onSaveRecipe={onSaveRecipe} onRemoveRecipe={onRemoveRecipe} />} />
        <Route
          path="/shopping-list"
          element={<ShoppingListPage shoppingList={shoppingList} weeklyMealPlan={weeklyMealPlan} onUpdateShoppingList={onUpdateShoppingList} onSaveToHistory={onSaveToHistory} mealPlanPreferences={mealPlanPreferences} selectedSupermarket={selectedSupermarket} cartTotal={cartTotal} onSelectSupermarket={onSelectSupermarket} onUpdateCartTotal={onUpdateCartTotal} history={history} />}
        />
        <Route path="/history" element={<HistoryPage history={history} />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}