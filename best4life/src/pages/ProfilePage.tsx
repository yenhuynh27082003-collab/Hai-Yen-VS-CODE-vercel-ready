import { FormEvent, useMemo, useState } from 'react'
import { Camera, CheckCircle2 } from 'lucide-react'
import { UserHistory, UserProfile } from '../types'

type ProfilePageProps = {
  profile: UserProfile
  onSaveProfile: (profile: UserProfile) => void
  history?: UserHistory
  defaultTab?: 'personal' | 'health' | 'allergies' | 'preferences' | 'meal-history' | 'shopping-history'
}

const allergyOptions = ['N/A', 'Dairy', 'Gluten', 'Eggs', 'Peanuts', 'Seafood', 'Soy']
const cuisineOptions = ['Australian', 'Italian', 'Asian', 'Mediterranean', 'Mexican', 'Indian']

export const ProfilePage = ({ profile, onSaveProfile, history, defaultTab = 'personal' }: ProfilePageProps) => {
  const [form, setForm] = useState<UserProfile>(profile)
  const [tab, setTab] = useState(defaultTab)
  const [toast, setToast] = useState('')

  const completion = useMemo(() => {
    const required = [form.displayName, form.height, form.weight, form.healthGoal, form.dietaryPreferences[0], form.allergies.length > 0]
    return Math.round((required.filter(Boolean).length / required.length) * 100)
  }, [form])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSaveProfile(form)
    setToast('Saved successfully.')
    window.setTimeout(() => setToast(''), 2200)
  }

  const resetChanges = () => setForm(profile)

  return (
    <section className="min-h-[calc(100vh-7rem)] space-y-5 bg-gradient-to-b from-emerald-50/80 to-white p-2 md:p-4">
      <header className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-green-950">My Profile</h1>
        <p className="mt-1 text-green-800">Manage your personal information and meal preferences.</p>
      </header>

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="relative">
            <img src={form.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200'} alt="avatar" className="size-20 rounded-2xl object-cover" />
            <label className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-green-800 p-2 text-white"><Camera className="size-4" /><input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => setForm((s) => ({ ...s, avatarUrl: String(r.result) })); r.readAsDataURL(file) }} /></label>
          </div>
          <div>
            <p className="text-xl font-semibold text-green-950">{form.displayName || 'Best4Life Member'}</p>
            <p className="text-sm text-green-700">{form.phone || 'member@best4life.app'}</p>
            <p className="mt-2 text-sm text-green-900">Profile completion: <b>{completion}%</b></p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-green-900">Height: <b>{form.height || '—'}</b></div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-green-900">Weight: <b>{form.weight || '—'}</b></div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-green-900">Diet: <b>{form.dietaryPreferences[0] || '—'}</b></div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-green-900">Goal: <b>{form.healthGoal || '—'}</b></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['personal', 'Personal Information'],
          ['health', 'Health & Preferences'],
          ['allergies', 'Allergies'],
          ['preferences', 'Meal Preferences'],
          ['meal-history', 'Meal Plan History'],
          ['shopping-history', 'Shopping List History'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as typeof tab)} className={`rounded-full px-4 py-2 text-sm transition hover:-translate-y-0.5 ${tab === id ? 'bg-green-800 text-white' : 'bg-white text-green-900 border border-emerald-100'}`}>{label}</button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {tab === 'personal' ? (
          <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2">
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="First name" value={form.displayName?.split(' ')[0] ?? ''} onChange={(e) => setForm((s) => ({ ...s, displayName: `${e.target.value} ${s.displayName?.split(' ').slice(1).join(' ') ?? ''}`.trim() }))} />
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="Last name" value={form.displayName?.split(' ').slice(1).join(' ') ?? ''} onChange={(e) => setForm((s) => ({ ...s, displayName: `${s.displayName?.split(' ')[0] ?? ''} ${e.target.value}`.trim() }))} />
            <input className="rounded-xl border border-emerald-200 p-3 md:col-span-2" placeholder="Email" value={form.phone ?? ''} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="Height" value={form.height ?? ''} onChange={(e) => setForm((s) => ({ ...s, height: e.target.value }))} />
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="Weight" value={form.weight ?? ''} onChange={(e) => setForm((s) => ({ ...s, weight: e.target.value }))} />
            <select className="rounded-xl border border-emerald-200 p-3" value={form.age ?? ''} onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))}><option value="">Age range</option><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option></select>
            <select className="rounded-xl border border-emerald-200 p-3" value={form.gender ?? ''} onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}><option value="">Gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select>
          </div>
        ) : null}

        {tab === 'health' ? (
          <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2">
            <select className="rounded-xl border border-emerald-200 p-3" value={form.healthGoal ?? ''} onChange={(e) => setForm((s) => ({ ...s, healthGoal: e.target.value }))}><option value="">Health goal</option><option>Lose weight</option><option>Maintain weight</option><option>Gain muscle</option><option>Eat healthier</option></select>
            <select className="rounded-xl border border-emerald-200 p-3" value={form.activityLevel ?? ''} onChange={(e) => setForm((s) => ({ ...s, activityLevel: e.target.value }))}><option value="">Activity level</option><option>Low</option><option>Moderate</option><option>Active</option><option>Very active</option></select>
            <div className="md:col-span-2 flex flex-wrap gap-2">{['No preference', 'Vegetarian', 'Vegan', 'Halal', 'High protein', 'Low carb'].map((d) => <button key={d} type="button" onClick={() => setForm((s) => ({ ...s, dietaryPreferences: [d] }))} className={`rounded-full px-3 py-1.5 text-sm ${form.dietaryPreferences[0] === d ? 'bg-green-800 text-white' : 'bg-emerald-50 text-green-900'}`}>{d}</button>)}</div>
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="Cooking time preference" value={form.budget ?? ''} onChange={(e) => setForm((s) => ({ ...s, budget: e.target.value }))} />
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="Household size" value={form.cuisinePreferences?.[0] ?? ''} onChange={(e) => setForm((s) => ({ ...s, cuisinePreferences: [e.target.value] }))} />
          </div>
        ) : null}

        {tab === 'allergies' ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">{allergyOptions.map((a) => <button key={a} type="button" onClick={() => setForm((s) => ({ ...s, allergies: s.allergies.includes(a) ? s.allergies.filter((x) => x !== a) : [...s.allergies, a] }))} className={`rounded-full px-3 py-1.5 text-sm ${form.allergies.includes(a) ? 'bg-green-800 text-white' : 'bg-emerald-50 text-green-900'}`}>{a}</button>)}</div>
          </div>
        ) : null}

        {tab === 'preferences' ? (
          <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2">
            <div className="md:col-span-2 flex flex-wrap gap-2">{cuisineOptions.map((c) => <button key={c} type="button" onClick={() => setForm((s) => ({ ...s, cuisinePreferences: s.cuisinePreferences?.includes(c) ? (s.cuisinePreferences ?? []).filter((x) => x !== c) : [...(s.cuisinePreferences ?? []), c] }))} className={`rounded-full px-3 py-1.5 text-sm ${(form.cuisinePreferences ?? []).includes(c) ? 'bg-green-800 text-white' : 'bg-emerald-50 text-green-900'}`}>{c}</button>)}</div>
            <input className="rounded-xl border border-emerald-200 p-3" placeholder="Budget preference" value={form.budget ?? ''} onChange={(e) => setForm((s) => ({ ...s, budget: e.target.value }))} />
            <select className="rounded-xl border border-emerald-200 p-3" value={form.activityLevel ?? ''} onChange={(e) => setForm((s) => ({ ...s, activityLevel: e.target.value }))}><option value="">Meals per day</option><option>2</option><option>3</option><option>4</option></select>
          </div>
        ) : null}

        {tab === 'meal-history' ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            {history?.mealPlans.length ? history.mealPlans.map((h) => <p key={h.id} className="text-sm text-green-800">{new Date(h.createdAt).toLocaleString()} • {h.plan.days.length} days</p>) : <p className="text-sm text-green-700">No meal plan history yet.</p>}
          </div>
        ) : null}

        {tab === 'shopping-history' ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            {history?.shoppingLists.length ? history.shoppingLists.map((h) => <p key={h.id} className="text-sm text-green-800">{new Date(h.createdAt).toLocaleString()} • ${h.totalEstimatedCost.toFixed(2)}</p>) : <p className="text-sm text-green-700">No shopping list history yet.</p>}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl bg-green-800 px-4 py-2 font-semibold text-white">Save Profile</button>
          <button type="button" onClick={resetChanges} className="rounded-xl border border-emerald-200 px-4 py-2 font-semibold text-green-900">Reset Changes</button>
        </div>
      </form>

      {toast ? <div className="fixed bottom-6 right-6 rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-lg"><CheckCircle2 className="mr-2 inline size-4" />{toast}</div> : null}
    </section>
  )
}
