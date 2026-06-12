import { motion } from 'framer-motion'
import { Flame, Leaf, PiggyBank, ShoppingCart } from 'lucide-react'
import { CurrentUser, ShoppingItem, WeeklyMealPlan } from '../types'
import { calculateStoreTotals, findCheapestStore } from '../utils/shopping'

type DashboardPageProps = {
  currentUser: CurrentUser | null
  weeklyMealPlan: WeeklyMealPlan
  shoppingList: ShoppingItem[]
}

const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const spend = [28.2, 24.8, 31.4, 29.6, 34.2, 27.5, 31.1]
const budget = [35, 35, 35, 35, 35, 35, 35]
const cals = [1380, 1520, 1460, 1610, 1490, 1550, 1510]

export const DashboardPage = ({ currentUser, weeklyMealPlan, shoppingList }: DashboardPageProps) => {
  const firstName = currentUser?.firstName ?? 'Hai Yen'
  const totals = calculateStoreTotals(shoppingList)
  const [cheapestStore, cheapestTotal] = findCheapestStore(totals)
  const safeDays = Array.isArray(weeklyMealPlan?.days) ? weeklyMealPlan.days : []

  const plannedMeals = safeDays.reduce((sum, day) => sum + (Array.isArray(day?.meals) ? day.meals.length : 0), 0)
  const allergySafeMeals = safeDays.reduce(
    (sum, day) => sum + (Array.isArray(day?.meals) ? day.meals.filter((meal) => meal?.allergySafe).length : 0),
    0,
  )
  const budgetFriendlyMeals = safeDays.reduce(
    (sum, day) => sum + (Array.isArray(day?.meals) ? day.meals.filter((meal) => Number(meal?.recipe?.estimatedCost ?? 0) <= 8.5).length : 0),
    0,
  )
  const estimatedWeeklyCost = shoppingList.length > 0 ? cheapestTotal : 0
  const estimatedSavings = Math.max(0, totals.Woolworths - cheapestTotal)
  const wasteTip =
    safeDays
      .flatMap((day) => (Array.isArray(day?.meals) ? day.meals : []).map((meal) => meal?.recipe?.wasteReductionTip).filter(Boolean))
      .slice(0, 1)[0] ?? 'Plan repeat ingredients to reduce food waste.'

  const kpi = [
    {
      title: 'Money Saved',
      value: `$${estimatedSavings.toFixed(2)}`,
      sub: `Cheapest store: ${cheapestStore}`,
      icon: PiggyBank,
      data: [28, 34, 31, 36, 42, 40, 45],
    },
    {
      title: 'Grocery Spend',
      value: `$${estimatedWeeklyCost.toFixed(2)}`,
      sub: shoppingList.length > 0 ? 'Estimated weekly total' : 'Create a shopping list to estimate',
      icon: ShoppingCart,
      data: [40, 39, 36, 38, 34, 33, 32],
    },
    {
      title: 'Meals Planned',
      value: String(plannedMeals),
      sub: `${allergySafeMeals} allergy-safe meals selected`,
      icon: Flame,
      data: [9, 11, 13, 15, 17, 19, 21],
    },
    {
      title: 'Waste Reduced',
      value: `${Math.min(95, 15 + budgetFriendlyMeals * 2)}%`,
      sub: `${budgetFriendlyMeals} budget-friendly meals this week`,
      icon: Leaf,
      data: [20, 22, 25, 29, 33, 36, 38],
    },
  ]

  const maxSpend = Math.max(...spend)
  const maxCal = Math.max(...cals)
  const ringPercent = 78
  const donut = { p: 34, c: 48, f: 18 }

  const todayMeals = (Array.isArray(safeDays[0]?.meals) ? safeDays[0].meals : []).filter(
    (meal) => meal && meal.recipe,
  )

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
          <h1 className="text-2xl font-bold text-green-950">Welcome back, {firstName}</h1>
          <p className="text-sm text-green-800">Your weekly meal planning overview</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpi.map((item, idx) => {
            const Icon = item.icon
            const max = Math.max(...item.data)
            return (
              <motion.article key={item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 hover:-translate-y-1 transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-700">{item.title}</p>
                  <Icon className="size-4 text-green-700" />
                </div>
                <p className="mt-1 text-2xl font-bold text-green-950">{item.value}</p>
                <p className="text-xs text-emerald-700">{item.sub}</p>
                <div className="mt-3 flex h-7 items-end gap-1">
                  {item.data.map((v, i) => <div key={i} className="w-1.5 rounded-full bg-emerald-300" style={{ height: `${(v / max) * 100}%` }} />)}
                </div>
              </motion.article>
            )
          })}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
          <h2 className="text-lg font-semibold text-green-950">Weekly grocery spending</h2>
          <div className="mt-5 grid grid-cols-7 items-end gap-3">
            {week.map((d, i) => (
              <div key={d} className="text-center">
                <div className="relative mx-auto h-36 w-8 rounded-full bg-emerald-100">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(spend[i] / maxSpend) * 100}%` }} className="absolute bottom-0 w-8 rounded-full bg-green-700" />
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400" style={{ bottom: `${(budget[i] / maxSpend) * 100}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-green-800">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-green-900">
            <p className="font-semibold">Friday</p>
            <p>$34.20 spend</p>
            <p className="text-amber-700">$6.80 saved</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <h2 className="text-lg font-semibold text-green-950">Nutrition overview</h2>
            <div className="mt-4 grid grid-cols-7 items-end gap-2">
              {cals.map((v, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto h-20 w-5 rounded-full bg-emerald-100"><motion.div initial={{ height: 0 }} animate={{ height: `${(v / maxCal) * 100}%` }} className="w-5 rounded-full bg-green-700" /></div>
                  <p className="mt-1 text-[10px] text-green-800">{week[i]}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-emerald-50 p-2">Calories <b>10,220 kcal</b></div>
              <div className="rounded-xl bg-emerald-50 p-2">Protein <b>620g</b></div>
              <div className="rounded-xl bg-emerald-50 p-2">Carbs <b>880g</b></div>
              <div className="rounded-xl bg-emerald-50 p-2">Fat <b>310g</b></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <h2 className="text-lg font-semibold text-green-950">Macro split</h2>
            <div className="mt-4 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full" style={{ background: `conic-gradient(#166534 0 ${donut.p}%, #f59e0b ${donut.p}% ${donut.p + donut.c}%, #6ee7b7 ${donut.p + donut.c}% 100%)` }}>
                <div className="m-6 grid h-28 place-items-center rounded-full bg-white text-sm font-semibold text-green-900">P/C/F</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 text-center text-xs">
              <p className="text-green-800">Protein {donut.p}%</p>
              <p className="text-amber-700">Carbs {donut.c}%</p>
              <p className="text-emerald-600">Fat {donut.f}%</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <h2 className="text-lg font-semibold text-green-950">Weekly planning progress</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(#166534 ${ringPercent * 3.6}deg,#dcfce7 0deg)` }}>
                <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-sm font-semibold text-green-900">{ringPercent}%</div>
              </div>
              <p className="text-sm text-green-800">7 day plan completion</p>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ['Breakfast', 74],
                ['Lunch', 82],
                ['Dinner', 91],
                ['Snack', 63],
              ].map(([label, v]) => (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-xs text-green-900"><span>{String(label)}</span><span>{String(v)}%</span></div>
                  <div className="h-2 rounded-full bg-emerald-100"><div className="h-2 rounded-full bg-green-700" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <h2 className="text-lg font-semibold text-green-950">Supermarket comparison</h2>
            <div className="mt-4 space-y-3">
              {[
                ['Aldi', totals.Aldi || 193.4],
                ['Woolworths', totals.Woolworths || 205.8],
                ['Coles', totals.Coles || 201.1],
              ].map(([name, value]) => {
                const max = Math.max(totals.Aldi || 193.4, totals.Woolworths || 205.8, totals.Coles || 201.1)
                return (
                  <div key={String(name)}>
                    <div className="mb-1 flex justify-between text-sm"><span className={name === cheapestStore ? 'font-semibold text-green-950' : 'text-green-800'}>{String(name)}</span><span>${Number(value).toFixed(2)}</span></div>
                    <div className="h-2 rounded-full bg-emerald-100"><div className={`h-2 rounded-full ${name === cheapestStore ? 'bg-green-700' : 'bg-emerald-400'}`} style={{ width: `${(Number(value) / max) * 100}%` }} /></div>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Best value: {cheapestStore || 'Aldi'} • Save ${estimatedSavings.toFixed(2)} this week</p>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100 xl:sticky xl:top-24 xl:h-fit">
        <h2 className="text-lg font-semibold text-green-950">Today’s Menu</h2>
        <div className="mt-4 space-y-3">
          {todayMeals.map((meal, index) => (
            <article key={meal.slot ?? `meal-${index}`} className="rounded-2xl border border-emerald-100 p-3">
              <div className="flex gap-3">
                <img src={meal.recipe.image ?? ''} alt={meal.recipe.title ?? 'Meal'} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-green-700">{meal.slot ?? 'Meal'}</p>
                  <p className="truncate text-sm font-semibold text-green-950">{meal.recipe.title ?? 'Untitled recipe'}</p>
                  <p className="text-xs text-green-700">{meal.recipe.calories ?? 0} kcal • {meal.recipe.prepTime ?? 'N/A'}</p>
                  <p className="text-[11px] text-green-700">P {meal.recipe.protein ?? 0}g / C {meal.recipe.carbs ?? 0}g / F {meal.recipe.fat ?? 0}g</p>
                </div>
              </div>
            </article>
          ))}
          {todayMeals.length === 0 ? (
            <article className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-green-800">No meals set for today yet.</article>
          ) : null}
        </div>
        <button className="mt-4 w-full rounded-xl bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900">Update Today Plan</button>
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-green-900">Food waste tip: {wasteTip}</p>
      </aside>
    </section>
  )
}
