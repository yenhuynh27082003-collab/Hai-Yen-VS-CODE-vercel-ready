import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Clock3, DollarSign, Home, ShieldAlert, SlidersHorizontal, Sparkles } from 'lucide-react'
import { MealPlanPreferences, UserProfile, WeeklyMealPlan } from '../types'
import { generateMockWeeklyMealPlan } from '../utils/mealPlan'

type Props = {
  profile: UserProfile
  mealPlanPreferences: MealPlanPreferences
  onCreateMealPlan: (prefs: MealPlanPreferences, plan: WeeklyMealPlan) => Promise<{ success: boolean; message?: string }>
}

const ALLERGIES = ['N/A', 'Dairy', 'Gluten', 'Eggs', 'Peanuts', 'Seafood', 'Soy']
const CUISINES = ['No preference', 'Vietnamese', 'Asian', 'Mediterranean', 'Western', 'Italian', 'Japanese', 'Korean', 'Vegetarian', 'High Protein', 'Budget Friendly']

export const CreateMealPlanPage = ({ profile, mealPlanPreferences, onCreateMealPlan }: Props) => {
  const navigate = useNavigate()
  const [useProfile, setUseProfile] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [form, setForm] = useState<MealPlanPreferences>({
    ...mealPlanPreferences,
    useSavedProfile: true,
    allergies: mealPlanPreferences.allergies.length ? mealPlanPreferences.allergies : profile.allergies,
    dietaryPreferences: mealPlanPreferences.dietaryPreferences.length ? mealPlanPreferences.dietaryPreferences : profile.dietaryPreferences,
    healthGoal: mealPlanPreferences.healthGoal ?? profile.healthGoal ?? '',
    activityLevel: mealPlanPreferences.activityLevel ?? profile.activityLevel ?? '',
    householdSize: mealPlanPreferences.householdSize ?? '2',
    cuisine: mealPlanPreferences.cuisine ?? 'No preference',
    mealsPerDay: mealPlanPreferences.mealsPerDay ?? '3',
    cookingTimePreference: mealPlanPreferences.cookingTimePreference ?? '30 mins',
  })

  const effective = useMemo(() => {
    if (!useProfile) return form
    return {
      ...form,
      allergies: profile.allergies.length ? profile.allergies : form.allergies,
      dietaryPreferences: profile.dietaryPreferences.length ? profile.dietaryPreferences : form.dietaryPreferences,
      healthGoal: profile.healthGoal ?? form.healthGoal,
      activityLevel: profile.activityLevel ?? form.activityLevel,
    }
  }, [form, profile, useProfile])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const generated = generateMockWeeklyMealPlan(effective, profile)
      void (async () => {
        const result = await onCreateMealPlan({ ...effective, useSavedProfile: useProfile }, generated)
        setLoading(false)
        if (!result.success) {
          setSaveMessage(result.message ?? 'Meal plan was generated but could not be saved to backend.')
          return
        }
        setSaveMessage('')
        navigate('/meal-plan-result', { state: { generated: true, saveMessage: result.message } })
      })()
    }, 700)
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-green-950">Create Meal Plan</h1>
        <p className="text-sm text-green-800">Build your weekly plan with profile-aware smart preferences.</p>
      </div>

      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {saveMessage ? (
          <div className="xl:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {saveMessage}
          </div>
        ) : null}
        <div className="space-y-5">
          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-green-900"><Sparkles className="size-4" /> Profile Mode</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setUseProfile(true)} className={`rounded-xl border px-3 py-2 text-sm ${useProfile ? 'border-green-700 bg-emerald-50 text-green-900' : 'border-emerald-200 text-green-800'}`}>Use my saved profile preferences</button>
              <button type="button" onClick={() => setUseProfile(false)} className={`rounded-xl border px-3 py-2 text-sm ${!useProfile ? 'border-green-700 bg-emerald-50 text-green-900' : 'border-emerald-200 text-green-800'}`}>Edit preferences for this plan</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Weekly budget', key: 'budget', icon: DollarSign, placeholder: '$220' },
              { label: 'Cuisine', key: 'cuisine', icon: ChefHat, select: CUISINES },
              { label: 'Household size', key: 'householdSize', icon: Home, select: ['1', '2', '3', '4', '5+'] },
              { label: 'Meals per day', key: 'mealsPerDay', icon: SlidersHorizontal, select: ['2', '3', '4'] },
              { label: 'Cooking time', key: 'cookingTimePreference', icon: Clock3, select: ['15 mins', '30 mins', '45 mins', '60 mins'] },
              { label: 'Dietary preference', key: 'dietaryPreferences', icon: ChefHat, select: ['No preference', 'Vegetarian', 'Vegan', 'High protein', 'Low carb'] },
            ].map((field) => {
              const Icon = field.icon
              return (
                <div key={field.label} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-green-900"><Icon className="size-4" /> {field.label}</label>
                  {field.select ? (
                    <select
                      className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm"
                      value={Array.isArray((form as any)[field.key]) ? ((form as any)[field.key][0] ?? 'No preference') : ((form as any)[field.key] ?? '')}
                      onChange={(e) => setForm((s) => ({ ...s, [field.key]: field.key === 'dietaryPreferences' ? [e.target.value] : e.target.value }))}
                    >
                      {field.select.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm" placeholder={field.placeholder} value={(form as any)[field.key] ?? ''} onChange={(e) => setForm((s) => ({ ...s, [field.key]: e.target.value }))} />
                  )}
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-green-900"><ShieldAlert className="size-4" /> Allergies</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map((a) => {
                const active = effective.allergies.includes(a)
                return (
                  <button key={a} type="button" onClick={() => setForm((s) => ({ ...s, allergies: active ? s.allergies.filter((x) => x !== a) : [...s.allergies, a] }))} className={`rounded-full px-3 py-1.5 text-xs ${active ? 'bg-green-800 text-white' : 'bg-emerald-50 text-green-900'}`}>{a}</button>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:h-fit">
          <h2 className="text-lg font-semibold text-green-950">Plan Actions</h2>
          <p className="mt-1 text-sm text-green-800">Generated plans can be replaced with recipes from your library.</p>
          <div className="mt-4 space-y-2">
            <button type="button" onClick={() => navigate('/meal-library')} className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-left text-sm text-green-900 hover:bg-emerald-50">Browse Recipe Library</button>
            <button type="button" onClick={() => navigate('/meal-library')} className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-left text-sm text-green-900 hover:bg-emerald-50">Replace Meal</button>
            <button type="button" onClick={() => navigate('/meal-library')} className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-left text-sm text-green-900 hover:bg-emerald-50">Add Custom Recipe</button>
          </div>
          <button disabled={loading} className="mt-5 w-full rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-60">{loading ? 'Generating Plan…' : 'Generate Meal Plan'}</button>
        </aside>
      </form>
    </section>
  )
}
