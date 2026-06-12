import type { BackendAuthUser } from './backendApi'

type StoredSession = {
  access_token: string
  refresh_token: string
  user: BackendAuthUser
}

const SESSION_KEY = 'best4life-auth-session'

export const saveSession = (session: StoredSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

const getStoredSession = (): StoredSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export const getAccessToken = (): string | null => {
  return getStoredSession()?.access_token ?? null
}

export const getCurrentUser = (): BackendAuthUser | null => {
  return getStoredSession()?.user ?? null
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}
