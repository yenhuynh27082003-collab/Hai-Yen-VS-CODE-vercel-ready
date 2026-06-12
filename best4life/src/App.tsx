import { useEffect, useMemo, useState } from 'react'
import { AppRouter } from './routes/AppRouter'
import {
  BackendAppStatePayload,
  BackendMealPlanRecord,
  BackendProfilePayload,
  BackendShoppingListRecord,
  createMealPlan,
  createShoppingList,
  getAppState,
  login as loginApi,
  signup as signupApi,
  updateProfile,
} from './lib/backendApi'
import { clearSession, getCurrentUser as getSessionUser, saveSession } from './lib/sessionStorage'
import {
  AppStateSnapshot,
  CurrentUser,
  DailyMealLog,
  MealPlanPreferences,
  Recipe,
  SavedMealPlan,
  SavedShoppingList,
  ShoppingItem,
  UserHistory,
  UserProfile,
  WeeklyMealPlan,
} from './types'
import { calculateStoreTotals, findCheapestStore } from './utils/shopping'

const EMPTY_PROFILE: UserProfile = {
  allergies: [],
  dietaryPreferences: [],
}

const EMPTY_MEAL_PREFS: MealPlanPreferences = {
  useSavedProfile: true,
  allergies: [],
  dietaryPreferences: [],
}

const EMPTY_WEEKLY_PLAN: WeeklyMealPlan = { days: [] }
const EMPTY_HISTORY: UserHistory = { mealPlans: [], shoppingLists: [], savedRecipes: [], spending: [] }
const EMPTY_SAVED_RECIPES: Recipe[] = []
const EMPTY_DAILY_LOGS: DailyMealLog[] = []

const AUTH_REQUIRED_MESSAGE = 'Please log in again to continue.'
const LOCAL_ONLY_PLANS_AND_SHOPPING = true

const getUserStateKey = (email: string) => `best4life-state-${email.toLowerCase()}`

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d.\-]/g, '')
  if (!cleaned) return null
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const toIntegerOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value !== 'string') return null
  if (!/^\d+$/.test(value.trim())) return null
  return Number.parseInt(value, 10)
}

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

const mapSessionUserToCurrentUser = (sessionUser: {
  id?: string
  email?: string
  user_metadata?: { first_name?: string; last_name?: string; full_name?: string }
}): CurrentUser | null => {
  const email = sessionUser?.email?.trim()
  if (!email) return null

  const firstNameFromMetadata = sessionUser.user_metadata?.first_name?.trim()
  const lastNameFromMetadata = sessionUser.user_metadata?.last_name?.trim()
  const fullName = sessionUser.user_metadata?.full_name?.trim()

  const fullNameParts = fullName ? fullName.split(' ').filter(Boolean) : []
  const firstName = firstNameFromMetadata || fullNameParts[0] || 'Best4Life'
  const lastName = lastNameFromMetadata || fullNameParts.slice(1).join(' ') || 'User'

  return {
    id: sessionUser.id,
    email,
    firstName,
    lastName,
  }
}

const loadSnapshot = (email: string): AppStateSnapshot | null => {
  try {
    const raw = localStorage.getItem(getUserStateKey(email))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isObject(parsed)) return null

    const profileCandidate = isObject(parsed.profile) ? (parsed.profile as UserProfile) : EMPTY_PROFILE
    const mealPrefsCandidate = isObject(parsed.mealPlanPreferences) ? (parsed.mealPlanPreferences as MealPlanPreferences) : EMPTY_MEAL_PREFS
    const weeklyPlanCandidate = isObject(parsed.weeklyMealPlan) ? (parsed.weeklyMealPlan as WeeklyMealPlan) : EMPTY_WEEKLY_PLAN
    const historyCandidate = isObject(parsed.history) ? (parsed.history as UserHistory) : EMPTY_HISTORY
    const appPreferencesCandidate = isObject(parsed.appPreferences)
      ? (parsed.appPreferences as AppStateSnapshot['appPreferences'])
      : undefined

    return {
      profile: {
        ...EMPTY_PROFILE,
        ...profileCandidate,
        allergies: Array.isArray(profileCandidate.allergies) ? profileCandidate.allergies : [],
        dietaryPreferences: Array.isArray(profileCandidate.dietaryPreferences) ? profileCandidate.dietaryPreferences : [],
        cuisinePreferences: Array.isArray(profileCandidate.cuisinePreferences) ? profileCandidate.cuisinePreferences : [],
      },
      isProfileComplete: Boolean((parsed as { isProfileComplete?: unknown }).isProfileComplete),
      mealPlanPreferences: asMealPlanPreferences(mealPrefsCandidate),
      weeklyMealPlan: asWeeklyMealPlan(weeklyPlanCandidate),
      shoppingList: Array.isArray((parsed as { shoppingList?: unknown }).shoppingList)
        ? ((parsed as { shoppingList: ShoppingItem[] }).shoppingList as ShoppingItem[])
        : [],
      savedRecipes: Array.isArray((parsed as { savedRecipes?: unknown }).savedRecipes)
        ? ((parsed as { savedRecipes: Recipe[] }).savedRecipes as Recipe[])
        : [],
      history: {
        mealPlans: Array.isArray(historyCandidate.mealPlans) ? historyCandidate.mealPlans : [],
        shoppingLists: Array.isArray(historyCandidate.shoppingLists) ? historyCandidate.shoppingLists : [],
        savedRecipes: Array.isArray(historyCandidate.savedRecipes) ? historyCandidate.savedRecipes : [],
        spending: Array.isArray(historyCandidate.spending) ? historyCandidate.spending : [],
      },
      ui: isObject((parsed as { ui?: unknown }).ui)
        ? ((parsed as { ui: AppStateSnapshot['ui'] }).ui as AppStateSnapshot['ui'])
        : undefined,
      dailyMealLogs: Array.isArray((parsed as { dailyMealLogs?: unknown }).dailyMealLogs)
        ? ((parsed as { dailyMealLogs: DailyMealLog[] }).dailyMealLogs as DailyMealLog[])
        : [],
      appPreferences: {
        themeMode: appPreferencesCandidate?.themeMode ?? 'system',
        language: appPreferencesCandidate?.language ?? 'English',
        notifications: appPreferencesCandidate?.notifications ?? true,
        emailReminders: appPreferencesCandidate?.emailReminders ?? true,
      },
    }
  } catch {
    return null
  }
}

const calculateIsProfileComplete = (profile: UserProfile) =>
  Boolean(profile.height && profile.weight && profile.healthGoal && profile.allergies.length > 0)

const profileNames = (displayName?: string) => {
  const fullName = displayName?.trim() || ''
  const parts = fullName.split(' ').filter(Boolean)
  return {
    firstName: parts[0] ?? undefined,
    lastName: parts.slice(1).join(' ') || undefined,
    fullName: fullName || undefined,
  }
}

const mapFrontendProfileToBackend = (profile: UserProfile): BackendProfilePayload => {
  const names = profileNames(profile.displayName)
  return {
    first_name: names.firstName ?? null,
    last_name: names.lastName ?? null,
    full_name: names.fullName ?? null,
    height: toNumberOrNull(profile.height),
    weight: toNumberOrNull(profile.weight),
    age: toIntegerOrNull(profile.age),
    gender: profile.gender?.trim() || null,
    allergies: profile.allergies,
    dietary_preferences: profile.dietaryPreferences,
    cuisine_preferences: profile.cuisinePreferences ?? [],
    health_goal: profile.healthGoal?.trim() || null,
    activity_level: profile.activityLevel?.trim() || null,
    budget: toNumberOrNull(profile.budget),
    is_profile_complete: calculateIsProfileComplete(profile),
  }
}

const mapBackendProfileToFrontend = (payload: BackendProfilePayload | undefined, fallback: UserProfile): UserProfile => {
  if (!payload) return fallback

  const firstName = payload.first_name?.trim()
  const lastName = payload.last_name?.trim()
  const backendFullName = payload.full_name?.trim()
  const displayName = backendFullName || [firstName, lastName].filter(Boolean).join(' ').trim() || fallback.displayName

  return {
    ...fallback,
    displayName,
    height: asString(payload.height) ?? fallback.height,
    weight: asString(payload.weight) ?? fallback.weight,
    age: asString(payload.age) ?? fallback.age,
    gender: payload.gender ?? fallback.gender,
    allergies: payload.allergies ?? fallback.allergies,
    dietaryPreferences: payload.dietary_preferences ?? fallback.dietaryPreferences,
    cuisinePreferences: payload.cuisine_preferences ?? fallback.cuisinePreferences,
    healthGoal: payload.health_goal ?? fallback.healthGoal,
    activityLevel: payload.activity_level ?? fallback.activityLevel,
    budget: asString(payload.budget) ?? fallback.budget,
  }
}

const asMealPlanPreferences = (value: unknown): MealPlanPreferences => {
  if (!isObject(value)) return EMPTY_MEAL_PREFS
  return {
    ...EMPTY_MEAL_PREFS,
    ...(value as MealPlanPreferences),
    allergies: Array.isArray((value as MealPlanPreferences).allergies) ? (value as MealPlanPreferences).allergies : [],
    dietaryPreferences: Array.isArray((value as MealPlanPreferences).dietaryPreferences)
      ? (value as MealPlanPreferences).dietaryPreferences
      : [],
  }
}

const asWeeklyMealPlan = (value: unknown): WeeklyMealPlan => {
  if (!isObject(value)) return EMPTY_WEEKLY_PLAN
  const maybeDays = (value as { days?: unknown }).days
  return Array.isArray(maybeDays) ? ({ ...(value as WeeklyMealPlan), days: maybeDays as WeeklyMealPlan['days'] }) : EMPTY_WEEKLY_PLAN
}

const calculateMealPlanTotals = (plan: WeeklyMealPlan) => {
  return plan.days.reduce(
    (acc, day) => {
      day.meals.forEach((meal) => {
        acc.totalCalories += Number(meal.recipe.calories) || 0
        acc.totalProtein += Number(meal.recipe.protein) || 0
        acc.estimatedTotalCost += Number(meal.recipe.estimatedCost) || 0
      })
      return acc
    },
    { totalCalories: 0, totalProtein: 0, estimatedTotalCost: 0 },
  )
}

const mapMealPlanRecordToSaved = (record: BackendMealPlanRecord): SavedMealPlan => ({
  id: record.id ?? `meal-${record.created_at ?? new Date().toISOString()}`,
  createdAt: record.created_at ?? new Date().toISOString(),
  preferences: asMealPlanPreferences(record.preferences),
  plan: asWeeklyMealPlan(record.weekly_plan),
})

const mapShoppingListRecordToSaved = (record: BackendShoppingListRecord): SavedShoppingList => {
  const items = Array.isArray(record.items) ? (record.items as ShoppingItem[]) : []
  return {
    id: record.id ?? `shop-${record.created_at ?? new Date().toISOString()}`,
    createdAt: record.created_at ?? new Date().toISOString(),
    items,
    totalEstimatedCost:
      typeof record.estimated_total_cost === 'number'
        ? record.estimated_total_cost
        : items.reduce((sum, item) => sum + (Number(item.estimatedPrice) || 0), 0),
    selectedSupermarket: (record.selected_supermarket as SavedShoppingList['selectedSupermarket']) ?? 'Cheapest combination',
    selectedSuburb: record.selected_suburb ?? undefined,
    itemCount: items.reduce((sum, item) => sum + (Number.parseInt(String(item.quantity).replace(/\D/g, ''), 10) || 1), 0),
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE)
  const [mealPlanPreferences, setMealPlanPreferences] = useState<MealPlanPreferences>(EMPTY_MEAL_PREFS)
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>(EMPTY_WEEKLY_PLAN)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(EMPTY_SAVED_RECIPES)
  const [history, setHistory] = useState<UserHistory>(EMPTY_HISTORY)
  const [selectedSupermarket, setSelectedSupermarket] = useState<'Aldi' | 'Woolworths' | 'Coles' | 'Cheapest combination'>('Cheapest combination')
  const [cartTotal, setCartTotal] = useState(0)
  const [latestMealPlanId, setLatestMealPlanId] = useState<string | null>(null)
  const [appSettings, setAppSettings] = useState({ themeMode: 'system' as 'light' | 'dark' | 'system', language: 'English', notifications: true, emailReminders: true })
  const [, setDailyMealLogs] = useState<DailyMealLog[]>(EMPTY_DAILY_LOGS)

  const getDefaultSnapshot = (): AppStateSnapshot => ({
    profile: EMPTY_PROFILE,
    isProfileComplete: false,
    mealPlanPreferences: EMPTY_MEAL_PREFS,
    weeklyMealPlan: EMPTY_WEEKLY_PLAN,
    shoppingList: [],
    savedRecipes: EMPTY_SAVED_RECIPES,
    history: EMPTY_HISTORY,
    ui: {
      sidebarCollapsed: false,
      selectedCalendarDate: new Date().toISOString().slice(0, 10),
    },
    dailyMealLogs: EMPTY_DAILY_LOGS,
  })

  const persistUserState = (
    email: string,
    next: Partial<
      Pick<
        AppStateSnapshot,
        'profile' | 'isProfileComplete' | 'mealPlanPreferences' | 'weeklyMealPlan' | 'shoppingList' | 'savedRecipes' | 'history' | 'ui' | 'dailyMealLogs' | 'appPreferences'
      >
    >,
  ) => {
    const base = getDefaultSnapshot()
    const existing = loadSnapshot(email) ?? base

    const merged: AppStateSnapshot = {
      profile: next.profile ?? existing.profile,
      isProfileComplete: next.isProfileComplete ?? existing.isProfileComplete,
      mealPlanPreferences: next.mealPlanPreferences ?? existing.mealPlanPreferences,
      weeklyMealPlan: next.weeklyMealPlan ?? existing.weeklyMealPlan,
      shoppingList: next.shoppingList ?? existing.shoppingList,
      savedRecipes: next.savedRecipes ?? existing.savedRecipes,
      history: {
        mealPlans: next.history?.mealPlans ?? existing.history?.mealPlans ?? base.history.mealPlans,
        shoppingLists: next.history?.shoppingLists ?? existing.history?.shoppingLists ?? base.history.shoppingLists,
        savedRecipes: next.history?.savedRecipes ?? existing.history?.savedRecipes ?? base.history.savedRecipes,
        spending: next.history?.spending ?? existing.history?.spending ?? base.history.spending,
      },
      ui: {
        sidebarCollapsed: next.ui?.sidebarCollapsed ?? existing.ui?.sidebarCollapsed ?? base.ui?.sidebarCollapsed,
        selectedCalendarDate: next.ui?.selectedCalendarDate ?? existing.ui?.selectedCalendarDate ?? base.ui?.selectedCalendarDate,
      },
      dailyMealLogs: next.dailyMealLogs ?? existing.dailyMealLogs ?? base.dailyMealLogs,
      appPreferences: {
        themeMode: next.appPreferences?.themeMode ?? existing.appPreferences?.themeMode ?? 'system',
        language: next.appPreferences?.language ?? existing.appPreferences?.language ?? 'English',
        notifications: next.appPreferences?.notifications ?? existing.appPreferences?.notifications ?? true,
        emailReminders: next.appPreferences?.emailReminders ?? existing.appPreferences?.emailReminders ?? true,
      },
    }

    localStorage.setItem(getUserStateKey(email), JSON.stringify(merged))
  }

  const hydrateFromSnapshot = (email: string) => {
    const snapshot = loadSnapshot(email)
    const base = getDefaultSnapshot()
    setProfile(snapshot?.profile ?? EMPTY_PROFILE)
    setIsProfileComplete(Boolean(snapshot?.isProfileComplete))
    setMealPlanPreferences(snapshot?.mealPlanPreferences ?? EMPTY_MEAL_PREFS)
    setWeeklyMealPlan(snapshot?.weeklyMealPlan ?? EMPTY_WEEKLY_PLAN)
    setShoppingList(snapshot?.shoppingList ?? [])
    setSavedRecipes(snapshot?.savedRecipes ?? EMPTY_SAVED_RECIPES)
    setHistory({
      mealPlans: snapshot?.history?.mealPlans ?? base.history.mealPlans,
      shoppingLists: snapshot?.history?.shoppingLists ?? base.history.shoppingLists,
      savedRecipes: snapshot?.history?.savedRecipes ?? base.history.savedRecipes,
      spending: snapshot?.history?.spending ?? base.history.spending,
    })
    setAppSettings({
      themeMode: snapshot?.appPreferences?.themeMode ?? 'system',
      language: snapshot?.appPreferences?.language ?? 'English',
      notifications: snapshot?.appPreferences?.notifications ?? true,
      emailReminders: snapshot?.appPreferences?.emailReminders ?? true,
    })
    setDailyMealLogs(snapshot?.dailyMealLogs ?? base.dailyMealLogs ?? [])
  }

  const applyBackendState = (email: string, backendState: BackendAppStatePayload) => {
    const snapshot = loadSnapshot(email) ?? getDefaultSnapshot()
    const nextProfile = mapBackendProfileToFrontend(backendState.profile, snapshot.profile)
    const nextIsProfileComplete = Boolean(backendState.profile?.is_profile_complete ?? calculateIsProfileComplete(nextProfile))

    const mealPlanRecords = Array.isArray(backendState.meal_plans) ? backendState.meal_plans : []
    const savedMealPlans = mealPlanRecords.map(mapMealPlanRecordToSaved)
    const latestRecord = backendState.latest_meal_plan ?? mealPlanRecords[0]
    const latestSavedMeal = latestRecord ? mapMealPlanRecordToSaved(latestRecord) : undefined

    const shoppingListRecords = Array.isArray(backendState.shopping_lists) ? backendState.shopping_lists : []
    const savedShoppingLists = shoppingListRecords.map(mapShoppingListRecordToSaved)

    const nextPrefs = latestSavedMeal?.preferences ?? snapshot.mealPlanPreferences
    const nextWeekly = latestSavedMeal?.plan ?? snapshot.weeklyMealPlan
    const nextShoppingList = Array.isArray(savedShoppingLists[0]?.items) ? savedShoppingLists[0].items : snapshot.shoppingList
    const nextHistory: UserHistory = {
      mealPlans: savedMealPlans.length ? savedMealPlans : snapshot.history.mealPlans,
      shoppingLists: savedShoppingLists.length ? savedShoppingLists : snapshot.history.shoppingLists,
      savedRecipes: snapshot.history.savedRecipes ?? [],
      spending: snapshot.history.spending ?? [],
    }

    setProfile(nextProfile)
    setIsProfileComplete(nextIsProfileComplete)
    setMealPlanPreferences(nextPrefs)
    setWeeklyMealPlan(nextWeekly)
    setShoppingList(nextShoppingList)
    setHistory(nextHistory)
    setLatestMealPlanId(typeof latestRecord?.id === 'string' ? latestRecord.id : null)

    persistUserState(email, {
      profile: nextProfile,
      isProfileComplete: nextIsProfileComplete,
      mealPlanPreferences: nextPrefs,
      weeklyMealPlan: nextWeekly,
      shoppingList: nextShoppingList,
      history: nextHistory,
    })
  }

  const handleUnauthorized = () => {
    clearSession()
    setCurrentUser(null)
    setShowOnboardingModal(false)
  }

  const hydrateFromBackend = async (email: string) => {
    if (LOCAL_ONLY_PLANS_AND_SHOPPING) {
      hydrateFromSnapshot(email)
      return { success: true as const, message: 'Using local data mode.' }
    }

    try {
      const data = await getAppState()
      applyBackendState(email, data)
      return { success: true as const }
    } catch (error) {
      if (error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE) {
        handleUnauthorized()
        return { success: false as const, message: AUTH_REQUIRED_MESSAGE }
      }
      hydrateFromSnapshot(email)
      return { success: false as const, message: 'We couldn’t load your saved data. Please try again.' }
    }
  }

  useEffect(() => {
    const sessionUser = getSessionUser()
    if (!sessionUser) return

    const mappedUser = mapSessionUserToCurrentUser(sessionUser)
    if (!mappedUser) return

    setCurrentUser(mappedUser)
    void hydrateFromBackend(mappedUser.email)
  }, [])

  const onSignup = async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const result = await signupApi({
        email: payload.email,
        password: payload.password,
        first_name: payload.firstName,
        last_name: payload.lastName,
      })

      if (!result.session) {
        return {
          success: true as const,
          requiresEmailConfirmation: true as const,
          message: 'Your account was created. Please check your email, then sign in to continue.',
        }
      }

      const sessionUser = result.session.user ?? result.user
      if (!sessionUser) {
        return { success: false as const, message: 'We couldn’t create your account. Please check your details and try again.' }
      }

      const mappedUser = mapSessionUserToCurrentUser(sessionUser)

      if (!mappedUser) {
        return { success: false as const, message: 'We couldn’t create your account. Please check your details and try again.' }
      }

      saveSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        user: sessionUser,
      })

      setCurrentUser(mappedUser)
      setProfile(EMPTY_PROFILE)
      setIsProfileComplete(false)
      setShowOnboardingModal(true)
      setMealPlanPreferences(EMPTY_MEAL_PREFS)
      setWeeklyMealPlan(EMPTY_WEEKLY_PLAN)
      setShoppingList([])
      setSavedRecipes(EMPTY_SAVED_RECIPES)
      setHistory(EMPTY_HISTORY)
      setDailyMealLogs(EMPTY_DAILY_LOGS)
      persistUserState(mappedUser.email, {
        profile: EMPTY_PROFILE,
        isProfileComplete: false,
        mealPlanPreferences: EMPTY_MEAL_PREFS,
        weeklyMealPlan: EMPTY_WEEKLY_PLAN,
        shoppingList: [],
        savedRecipes: EMPTY_SAVED_RECIPES,
        history: EMPTY_HISTORY,
        dailyMealLogs: EMPTY_DAILY_LOGS,
      })

      return { success: true as const }
    } catch (error) {
      return {
        success: false as const,
        message: error instanceof Error ? error.message : 'We couldn’t create your account. Please check your details and try again.',
      }
    }
  }

  const onLogin = async (email: string, password: string) => {
    try {
      const result = await loginApi({ email, password })
      const mappedUser = mapSessionUserToCurrentUser(result.user)

      if (!mappedUser) {
        return { success: false as const, message: 'We couldn’t log you in. Please try again.' }
      }

      saveSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        user: result.user,
      })

      setCurrentUser(mappedUser)
      const hydrated = await hydrateFromBackend(mappedUser.email)

      if (!hydrated.success) {
        return {
          success: false as const,
          message: hydrated.message ?? 'Your session could not be restored. Please log in again.',
        }
      }

      return { success: true as const, message: 'Your saved data has been loaded.' }
    } catch (error) {
      return {
        success: false as const,
        message: error instanceof Error ? error.message : 'We couldn’t log you in. Please try again.',
      }
    }
  }

  const onSaveProfile = (nextProfile: UserProfile) => {
    const nextComplete = calculateIsProfileComplete(nextProfile)
    setProfile(nextProfile)
    setIsProfileComplete(nextComplete)
    if (currentUser)
      persistUserState(currentUser.email, {
        profile: nextProfile,
        isProfileComplete: nextComplete,
      })

    void (async () => {
      try {
        await updateProfile(mapFrontendProfileToBackend(nextProfile))
      } catch (error) {
        if (error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE) {
          handleUnauthorized()
        }
      }
    })()
  }

  const onSkipOnboarding = () => setShowOnboardingModal(false)
  const onCloseOnboarding = () => setShowOnboardingModal(false)
  const onLogout = () => {
    clearSession()
    setCurrentUser(null)
    setShowOnboardingModal(false)
  }

  const onCreateMealPlan = async (prefs: MealPlanPreferences, plan: WeeklyMealPlan) => {
    setMealPlanPreferences(prefs)
    setWeeklyMealPlan(plan)
    if (currentUser) persistUserState(currentUser.email, { mealPlanPreferences: prefs, weeklyMealPlan: plan })

    if (LOCAL_ONLY_PLANS_AND_SHOPPING) {
      return { success: true as const, message: 'Meal plan generated and saved locally.' }
    }

    try {
      const totals = calculateMealPlanTotals(plan)
      const created = await createMealPlan({
        title: `Weekly Meal Plan - ${new Date().toLocaleDateString()}`,
        preferences: prefs as unknown as Record<string, unknown>,
        weekly_plan: plan as unknown as Record<string, unknown>,
        estimated_total_cost: Number(totals.estimatedTotalCost.toFixed(2)),
        total_calories: Math.round(totals.totalCalories),
        total_protein: Number(totals.totalProtein.toFixed(2)),
        status: 'saved',
      })

      if (created.id) {
        setLatestMealPlanId(created.id)
      }

      return { success: true as const, message: 'Meal plan saved successfully.' }
    } catch (error) {
      if (error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE) {
        handleUnauthorized()
      }
      return {
        success: false as const,
        message: error instanceof Error ? error.message : 'We couldn’t save your meal plan. Please try again.',
      }
    }
  }

  const onUpdateMealPlan = (plan: WeeklyMealPlan) => {
    setWeeklyMealPlan(plan)
    if (currentUser) persistUserState(currentUser.email, { weeklyMealPlan: plan })
  }

  const onCreateShoppingList = (list: ShoppingItem[]) => {
    setShoppingList(list)
    if (currentUser) persistUserState(currentUser.email, { shoppingList: list })
  }

  const onUpdateShoppingList = (list: ShoppingItem[]) => {
    setShoppingList(list)
    if (currentUser) persistUserState(currentUser.email, { shoppingList: list })
  }

  const onSaveToHistory = async (mealPlan: SavedMealPlan, list: SavedShoppingList) => {
    const nextHistory = {
      mealPlans: [mealPlan, ...history.mealPlans],
      shoppingLists: [list, ...history.shoppingLists],
      savedRecipes: history.savedRecipes ?? [],
      spending: [{ date: list.createdAt, total: list.totalEstimatedCost, store: 'Aldi' as const }, ...(history.spending ?? [])],
    }
    setHistory(nextHistory)
    if (currentUser) persistUserState(currentUser.email, { history: nextHistory })

    if (LOCAL_ONLY_PLANS_AND_SHOPPING) {
      return { success: true as const, message: 'Shopping list saved locally.' }
    }

    try {
      let mealPlanId = latestMealPlanId
      if (!mealPlanId) {
        const totals = calculateMealPlanTotals(mealPlan.plan)
        const createdMealPlan = await createMealPlan({
          title: `Weekly Meal Plan - ${new Date(mealPlan.createdAt).toLocaleDateString()}`,
          preferences: mealPlan.preferences as unknown as Record<string, unknown>,
          weekly_plan: mealPlan.plan as unknown as Record<string, unknown>,
          estimated_total_cost: Number(totals.estimatedTotalCost.toFixed(2)),
          total_calories: Math.round(totals.totalCalories),
          total_protein: Number(totals.totalProtein.toFixed(2)),
          status: 'saved',
        })
        mealPlanId = createdMealPlan.id ?? null
        if (mealPlanId) setLatestMealPlanId(mealPlanId)
      }

      const totals = calculateStoreTotals(list.items)
      const [cheapestStore, cheapestTotal] = findCheapestStore(totals)
      const cheapestCombination = list.items.map((item) => {
        const options = [
          { store: 'Aldi', price: item.supermarkets.Aldi },
          { store: 'Woolworths', price: item.supermarkets.Woolworths },
          { store: 'Coles', price: item.supermarkets.Coles },
        ].sort((a, b) => a.price - b.price)

        return {
          item_id: item.id,
          item_name: item.name,
          store: options[0].store,
          price: Number(options[0].price.toFixed(2)),
        }
      })

      const selectedStore = list.selectedSupermarket ?? 'Cheapest combination'
      const estimatedTotalCost =
        selectedStore === 'Aldi'
          ? totals.Aldi
          : selectedStore === 'Woolworths'
            ? totals.Woolworths
            : selectedStore === 'Coles'
              ? totals.Coles
              : cheapestTotal

      await createShoppingList({
        meal_plan_id: mealPlanId,
        title: `Shopping List - ${new Date(list.createdAt).toLocaleDateString()}`,
        items: list.items as Array<Record<string, unknown>>,
        supermarket_totals: totals,
        cheapest_store: cheapestStore,
        cheapest_combination: cheapestCombination,
        estimated_total_cost: Number(estimatedTotalCost.toFixed(2)),
        selected_supermarket: selectedStore,
        selected_suburb: list.selectedSuburb ?? null,
      })

      return { success: true as const, message: 'Shopping list saved successfully.' }
    } catch (error) {
      if (error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE) {
        handleUnauthorized()
      }
      return {
        success: false as const,
        message:
          error instanceof Error
            ? `${error.message} Your shopping list is still available locally.`
            : 'We couldn’t save to the backend. Your shopping list is still available locally.',
      }
    }
  }

  const onSaveRecipe = (recipe: Recipe) => {
    const exists = savedRecipes.some((r) => r.id === recipe.id)
    if (exists) return
    const nextRecipes = [recipe, ...savedRecipes]
    setSavedRecipes(nextRecipes)
    const nextHistory = {
      ...history,
      savedRecipes: [
        { recipeId: recipe.id, title: recipe.title, image: recipe.image, savedAt: new Date().toISOString() },
        ...(history.savedRecipes ?? []),
      ],
    }
    setHistory(nextHistory)
    if (currentUser) persistUserState(currentUser.email, { savedRecipes: nextRecipes, history: nextHistory })
  }

  const onRemoveRecipe = (recipeId: string) => {
    const nextRecipes = savedRecipes.filter((r) => r.id !== recipeId)
    setSavedRecipes(nextRecipes)
    if (currentUser) persistUserState(currentUser.email, { savedRecipes: nextRecipes })
  }

  const completion = useMemo(() => {
    const required: (keyof UserProfile)[] = ['height', 'weight', 'healthGoal']
    const requiredDone = required.filter((k) => Boolean(profile[k]))
    const allergiesDone = profile.allergies.length > 0 ? 1 : 0
    return Math.round(((requiredDone.length + allergiesDone) / 4) * 100)
  }, [profile])

  const onSaveMealPrefs = (prefs: MealPlanPreferences) => {
    setMealPlanPreferences(prefs)
    if (currentUser) persistUserState(currentUser.email, { mealPlanPreferences: prefs })
  }

  const onSaveSettings = (next: typeof appSettings) => {
    setAppSettings(next)
    if (currentUser) persistUserState(currentUser.email, { appPreferences: next })
  }

  return (
    <AppRouter
      currentUser={currentUser}
      profile={profile}
      mealPlanPreferences={mealPlanPreferences}
      weeklyMealPlan={weeklyMealPlan}
      shoppingList={shoppingList}
      savedRecipes={savedRecipes}
      history={history}
      isProfileComplete={isProfileComplete}
      showOnboardingModal={showOnboardingModal}
      profileCompletion={completion}
      onSignup={onSignup}
      onLogin={onLogin}
      onLogout={onLogout}
      onSaveProfile={onSaveProfile}
      onSkipOnboarding={onSkipOnboarding}
      onCloseOnboarding={onCloseOnboarding}
      onCreateMealPlan={onCreateMealPlan}
      onUpdateMealPlan={onUpdateMealPlan}
      onCreateShoppingList={onCreateShoppingList}
      onUpdateShoppingList={onUpdateShoppingList}
      onSaveToHistory={onSaveToHistory}
      onSaveRecipe={onSaveRecipe}
      onRemoveRecipe={onRemoveRecipe}
      selectedSupermarket={selectedSupermarket}
      cartTotal={cartTotal}
      onSelectSupermarket={setSelectedSupermarket}
      onUpdateCartTotal={setCartTotal}
      appSettings={appSettings}
      onSaveMealPrefs={onSaveMealPrefs}
      onSaveSettings={onSaveSettings}
    />
  )
}

export default App