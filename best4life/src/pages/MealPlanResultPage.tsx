import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { buildShoppingListFromMealPlan } from '../utils/shopping'
import { ShoppingItem, WeeklyMealPlan } from '../types'

type Props = {
  weeklyMealPlan: WeeklyMealPlan
  onUpdateMealPlan: (plan: WeeklyMealPlan) => void
  onCreateShoppingList: (list: ShoppingItem[]) => void
}

export const MealPlanResultPage = ({ weeklyMealPlan, onUpdateMealPlan, onCreateShoppingList }: Props) => {
  const navigate = useNavigate()

  const removeMeal = (dayName: string, slot: 'breakfast' | 'lunch' | 'dinner') => {
    const updated = {
      days: weeklyMealPlan.days.map((day) =>
        day.day !== dayName ? day : { ...day, meals: day.meals.filter((m) => m.slot !== slot) },
      ),
    }
    onUpdateMealPlan(updated)
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-green-950">Weekly Meal Planner</h1>
        <p className="text-sm text-green-800">Swap, remove, and fine-tune meals for each day.</p>
        {weeklyMealPlan.recommendationNotice ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{weeklyMealPlan.recommendationNotice}</p>
        ) : null}
      </div>

      {weeklyMealPlan.days.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-base font-semibold text-green-950">No meals matched your current filters yet.</p>
          <p className="mt-1 text-sm text-green-800">
            Try relaxing allergy, cuisine, dietary, or budget filters, then generate your plan again.
          </p>
          <button onClick={() => navigate('/create-meal-plan')} className="mt-4 rounded-xl bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900">
            Edit preferences
          </button>
        </div>
      ) : null}

      {weeklyMealPlan.days.map((day, dayIndex) => (
        <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dayIndex * 0.04 }} className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-green-950">{day.day}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {day.meals.map((meal) => (
              <article key={`${day.day}-${meal.slot}`} className="rounded-2xl border border-emerald-100 p-3 transition hover:-translate-y-1 hover:shadow-sm">
                <img src={meal.recipe.image} alt={meal.recipe.title} className="h-28 w-full rounded-xl object-cover" />
                <p className="mt-2 text-xs uppercase tracking-wide text-green-700">{meal.slot}</p>
                <p className="text-sm font-semibold text-green-950">{meal.recipe.title}</p>
                <p className="text-xs text-green-700">{meal.recipe.calories} kcal • {meal.recipe.prepTime} • ${meal.recipe.estimatedCost.toFixed(2)}</p>
                <p className="text-[11px] text-green-700">P {meal.recipe.protein}g / C {meal.recipe.carbs}g / F {meal.recipe.fat}g</p>
                <p className="mt-1 text-[11px] text-emerald-700">{meal.recommendationReason ?? meal.recipe.recommendationReason ?? 'Recommended as a balanced weekly option.'}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button className="rounded-lg border border-emerald-200 px-2 py-1 text-xs text-green-900" onClick={() => navigate(`/recipe/${meal.recipe.id}`)}>View</button>
                  <button className="rounded-lg border border-emerald-200 px-2 py-1 text-xs text-green-900" onClick={() => navigate('/meal-library', { state: { day: day.day, slot: meal.slot } })}>Swap</button>
                  <button className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600" onClick={() => removeMeal(day.day, meal.slot)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      ))}

      <button
        className="rounded-xl bg-green-800 px-4 py-3 font-semibold text-white hover:bg-green-900"
        onClick={() => {
          const list = buildShoppingListFromMealPlan(weeklyMealPlan)
          onCreateShoppingList(list)
          navigate('/shopping-list')
        }}
      >
        Create Shopping List
      </button>
    </section>
  )
}
