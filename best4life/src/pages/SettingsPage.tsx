import { UserProfile, MealPlanPreferences } from '../types'

type SettingsPrefs = {
  themeMode: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  emailReminders: boolean
}

type Props = {
  currentUserName: string
  currentUserEmail: string
  profile: UserProfile
  mealPlanPreferences: MealPlanPreferences
  settings: SettingsPrefs
  onSaveProfile: (profile: UserProfile) => void
  onSaveMealPrefs: (prefs: MealPlanPreferences) => void
  onSaveSettings: (settings: SettingsPrefs) => void
}

export const SettingsPage = ({ currentUserName, currentUserEmail, profile, mealPlanPreferences, settings, onSaveProfile, onSaveMealPrefs, onSaveSettings }: Props) => {
  return (
    <section className="min-h-[calc(100vh-8rem)] space-y-5 rounded-3xl bg-gradient-to-b from-emerald-50/80 to-white p-1">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-green-950">Settings</h1>
        <p className="mt-1 text-sm text-green-800">Manage your Best4Life account, meal planning preferences, and website experience.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-green-950">Account Preferences</h2>
          <p className="mt-2 text-sm text-green-800">{currentUserName}</p>
          <p className="text-sm text-green-700">{currentUserEmail}</p>
          <button className="mt-3 rounded-xl border border-emerald-200 px-3 py-2 text-sm text-green-900">Change password</button>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-green-950">Meal Planning Preferences</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <input className="rounded-xl border border-emerald-200 p-2" value={mealPlanPreferences.budget ?? ''} placeholder="Default budget" onChange={(e) => onSaveMealPrefs({ ...mealPlanPreferences, budget: e.target.value })} />
            <input className="rounded-xl border border-emerald-200 p-2" value={mealPlanPreferences.cuisine ?? ''} placeholder="Default cuisine" onChange={(e) => onSaveMealPrefs({ ...mealPlanPreferences, cuisine: e.target.value })} />
            <input className="rounded-xl border border-emerald-200 p-2" value={mealPlanPreferences.householdSize ?? ''} placeholder="Default household size" onChange={(e) => onSaveMealPrefs({ ...mealPlanPreferences, householdSize: e.target.value })} />
            <input className="rounded-xl border border-emerald-200 p-2" value={mealPlanPreferences.mealsPerDay ?? ''} placeholder="Default meals per day" onChange={(e) => onSaveMealPrefs({ ...mealPlanPreferences, mealsPerDay: e.target.value })} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-green-950">Dietary Preferences</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <input className="rounded-xl border border-emerald-200 p-2" value={profile.allergies.join(', ')} placeholder="Allergies" onChange={(e) => onSaveProfile({ ...profile, allergies: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
            <input className="rounded-xl border border-emerald-200 p-2" value={profile.dietaryPreferences.join(', ')} placeholder="Diet type" onChange={(e) => onSaveProfile({ ...profile, dietaryPreferences: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
            <input className="rounded-xl border border-emerald-200 p-2" value={profile.healthGoal ?? ''} placeholder="Health goal" onChange={(e) => onSaveProfile({ ...profile, healthGoal: e.target.value })} />
            <input className="rounded-xl border border-emerald-200 p-2" value={profile.activityLevel ?? ''} placeholder="Activity level" onChange={(e) => onSaveProfile({ ...profile, activityLevel: e.target.value })} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-green-950">Website Preferences</h2>
          <div className="mt-3 space-y-2 text-sm text-green-900">
            <select className="w-full rounded-xl border border-emerald-200 p-2" value={settings.themeMode} onChange={(e) => onSaveSettings({ ...settings, themeMode: e.target.value as SettingsPrefs['themeMode'] })}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select>
            <input className="w-full rounded-xl border border-emerald-200 p-2" value={settings.language} onChange={(e) => onSaveSettings({ ...settings, language: e.target.value })} placeholder="Language" />
            <label className="flex items-center justify-between rounded-xl border border-emerald-200 p-2"><span>Notification preferences</span><input type="checkbox" checked={settings.notifications} onChange={(e) => onSaveSettings({ ...settings, notifications: e.target.checked })} /></label>
            <label className="flex items-center justify-between rounded-xl border border-emerald-200 p-2"><span>Email reminders</span><input type="checkbox" checked={settings.emailReminders} onChange={(e) => onSaveSettings({ ...settings, emailReminders: e.target.checked })} /></label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-green-950">Privacy & Data</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-xl border border-emerald-200 px-3 py-2 text-sm text-green-900">Export data</button>
          <button className="rounded-xl border border-amber-200 px-3 py-2 text-sm text-amber-700">Clear local data</button>
          <button className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600">Delete account (mock)</button>
        </div>
      </div>
    </section>
  )
}
