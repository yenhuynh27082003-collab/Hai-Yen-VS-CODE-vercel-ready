import { getAccessToken } from './sessionStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export type BackendAuthUser = {
  id?: string
  email?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    full_name?: string
  }
}

export type LoginRequestPayload = {
  email: string
  password: string
}

export type SignupRequestPayload = {
  email: string
  password: string
  first_name: string
  last_name: string
}

export type LoginResponsePayload = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: BackendAuthUser
}

export type SignupResponsePayload = {
  user?: BackendAuthUser
  session?: {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
    user?: BackendAuthUser
  } | null
  message?: string
}

export type BackendProfilePayload = {
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  height?: number | null
  weight?: number | null
  age?: number | null
  gender?: string | null
  allergies?: string[] | null
  dietary_preferences?: string[] | null
  cuisine_preferences?: string[] | null
  health_goal?: string | null
  activity_level?: string | null
  budget?: number | null
  is_profile_complete?: boolean | null
}

export type BackendMealPlanPayload = {
  title: string
  preferences: Record<string, unknown>
  weekly_plan: Record<string, unknown>
  estimated_total_cost?: number | null
  total_calories?: number | null
  total_protein?: number | null
  status?: string
}

export type BackendMealPlanRecord = BackendMealPlanPayload & {
  id?: string
  created_at?: string
  user_id?: string
}

export type BackendShoppingListPayload = {
  meal_plan_id?: string | null
  title: string
  items: Array<Record<string, unknown>>
  supermarket_totals: Record<string, unknown>
  cheapest_store?: string | null
  cheapest_combination: Array<Record<string, unknown>>
  estimated_total_cost?: number | null
  selected_supermarket?: string | null
  selected_suburb?: string | null
}

export type BackendShoppingListRecord = BackendShoppingListPayload & {
  id?: string
  created_at?: string
  user_id?: string
}

export type BackendAppStatePayload = {
  profile?: BackendProfilePayload
  meal_plans?: BackendMealPlanRecord[]
  latest_meal_plan?: BackendMealPlanRecord
  shopping_lists?: BackendShoppingListRecord[]
}

const NETWORK_ERROR_MESSAGE =
  'We couldn’t connect to Best4Life right now. Please check your internet connection and try again.'
const AUTH_REQUIRED_MESSAGE = 'Please log in again to continue.'
const SAVE_FALLBACK_ERROR_MESSAGE = 'We couldn’t save your changes. Please try again.'
const LOAD_FALLBACK_ERROR_MESSAGE = 'We couldn’t load your saved data. Please try again.'

const SIGNUP_FALLBACK_ERROR_MESSAGE = 'We couldn’t create your account. Please check your details and try again.'
const LOGIN_FALLBACK_ERROR_MESSAGE = 'We couldn’t log you in. Please try again.'

const parseRawErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json()
    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.message === 'string') return data.message
    return ''
  } catch {
    return ''
  }
}

const mapSignupErrorMessage = (rawMessage: string): string => {
  const message = rawMessage.toLowerCase()

  if (message.includes('already') && message.includes('exist')) {
    return 'This email is already registered. Please log in instead.'
  }

  if (message.includes('weak password') || message.includes('password') && message.includes('least')) {
    return 'Please choose a stronger password.'
  }

  if (message.includes('rate limit') || message.includes('too many') || message.includes('over_email_send_rate_limit')) {
    return 'Too many signup attempts. Please wait a few minutes before trying again.'
  }

  return SIGNUP_FALLBACK_ERROR_MESSAGE
}

const mapLoginErrorMessage = (rawMessage: string): string => {
  const message = rawMessage.toLowerCase()

  if (
    message.includes('invalid login') ||
    message.includes('invalid credentials') ||
    message.includes('incorrect email or password') ||
    (message.includes('email') && message.includes('password') && message.includes('invalid'))
  ) {
    return 'Incorrect email or password. Please try again.'
  }

  return LOGIN_FALLBACK_ERROR_MESSAGE
}

const isAuthStatus = (status: number) => status === 401 || status === 403

const withAuthHeaders = (accessToken: string | null): HeadersInit => {
  if (!accessToken) {
    throw new Error(AUTH_REQUIRED_MESSAGE)
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }
}

const parseBackendErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json()
    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.message === 'string') return data.message
    if (typeof data?.error === 'string') return data.error
    return ''
  } catch {
    return ''
  }
}

const requestProtected = async <T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; fallbackMessage: string; debugLabel?: string },
): Promise<T> => {
  let response: Response
  const accessToken = getAccessToken()
  const requestUrl = `${API_BASE_URL}${path}`

  if (options.debugLabel) {
    console.info(options.debugLabel)
  }
  console.info('[Best4Life API] request URL:', requestUrl)
  console.info('[Best4Life API] access token exists:', Boolean(accessToken))

  try {
    response = await fetch(requestUrl, {
      method: options.method ?? 'GET',
      headers: withAuthHeaders(accessToken),
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    console.info('[Best4Life API] response status: network_error')
    if (error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE) {
      throw error
    }
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  console.info('[Best4Life API] response status:', response.status)

  if (!response.ok) {
    if (isAuthStatus(response.status)) {
      throw new Error(AUTH_REQUIRED_MESSAGE)
    }

    await parseBackendErrorMessage(response)
    throw new Error(options.fallbackMessage)
  }

  return (await response.json()) as T
}

export const login = async (payload: LoginRequestPayload): Promise<LoginResponsePayload> => {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (!response.ok) {
    const rawMessage = await parseRawErrorMessage(response)
    throw new Error(mapLoginErrorMessage(rawMessage))
  }

  return (await response.json()) as LoginResponsePayload
}

export const signup = async (payload: SignupRequestPayload): Promise<SignupResponsePayload> => {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (!response.ok) {
    const rawMessage = await parseRawErrorMessage(response)
    throw new Error(mapSignupErrorMessage(rawMessage))
  }

  return (await response.json()) as SignupResponsePayload
}

export const getProfile = async (): Promise<BackendProfilePayload> => {
  return requestProtected<BackendProfilePayload>('/profile', {
    method: 'GET',
    fallbackMessage: LOAD_FALLBACK_ERROR_MESSAGE,
  })
}

export const updateProfile = async (payload: BackendProfilePayload): Promise<BackendProfilePayload> => {
  return requestProtected<BackendProfilePayload>('/profile', {
    method: 'PUT',
    body: payload,
    fallbackMessage: SAVE_FALLBACK_ERROR_MESSAGE,
  })
}

export const getMealPlans = async (): Promise<BackendMealPlanRecord[]> => {
  return requestProtected<BackendMealPlanRecord[]>('/meal-plans', {
    method: 'GET',
    fallbackMessage: LOAD_FALLBACK_ERROR_MESSAGE,
  })
}

export const createMealPlan = async (payload: BackendMealPlanPayload): Promise<BackendMealPlanRecord> => {
  return requestProtected<BackendMealPlanRecord>('/meal-plans', {
    method: 'POST',
    body: payload,
    fallbackMessage: SAVE_FALLBACK_ERROR_MESSAGE,
  })
}

export const getLatestMealPlan = async (): Promise<BackendMealPlanRecord> => {
  return requestProtected<BackendMealPlanRecord>('/meal-plans/latest', {
    method: 'GET',
    fallbackMessage: LOAD_FALLBACK_ERROR_MESSAGE,
  })
}

export const getShoppingLists = async (): Promise<BackendShoppingListRecord[]> => {
  return requestProtected<BackendShoppingListRecord[]>('/shopping-lists', {
    method: 'GET',
    fallbackMessage: LOAD_FALLBACK_ERROR_MESSAGE,
  })
}

export const createShoppingList = async (payload: BackendShoppingListPayload): Promise<BackendShoppingListRecord> => {
  return requestProtected<BackendShoppingListRecord>('/shopping-lists', {
    method: 'POST',
    body: payload,
    fallbackMessage: SAVE_FALLBACK_ERROR_MESSAGE,
    debugLabel: 'Saving shopping list...',
  })
}

export const getAppState = async (): Promise<BackendAppStatePayload> => {
  return requestProtected<BackendAppStatePayload>('/app/state', {
    method: 'GET',
    fallbackMessage: LOAD_FALLBACK_ERROR_MESSAGE,
  })
}
