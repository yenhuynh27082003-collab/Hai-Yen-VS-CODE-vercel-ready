import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MOCK_RECIPES } from '../constants/mockRecipes'
import { Recipe, WeeklyMealPlan } from '../types'

type Props = {
  weeklyMealPlan: WeeklyMealPlan
  onUpdateMealPlan: (plan: WeeklyMealPlan) => void
  savedRecipes: Recipe[]
  onSaveRecipe: (recipe: Recipe) => void
  onRemoveRecipe: (recipeId: string) => void
}

export const RecipeDetailPage = ({ weeklyMealPlan, onUpdateMealPlan, savedRecipes, onSaveRecipe, onRemoveRecipe }: Props) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const recipe = useMemo(() => MOCK_RECIPES.find((r) => r.id === id), [id])
  if (!recipe) return <section className="pt-28 container-shell">Recipe not found.</section>
  const bookmarked = savedRecipes.some((r) => r.id === recipe.id)

  const addToPlan = () => {
    if (weeklyMealPlan.days.length === 0) return navigate('/create-meal-plan')
    const updated = {
      days: weeklyMealPlan.days.map((day, index) =>
        index === 0
          ? { ...day, meals: day.meals.map((meal) => (meal.slot === 'dinner' ? { ...meal, recipe } : meal)) }
          : day,
      ),
    }
    onUpdateMealPlan(updated)
    navigate('/meal-plan-result')
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <img src={recipe.image} alt={recipe.title} className="h-64 w-full rounded-xl object-cover" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-green-900">{recipe.title}</h1>
            <p className="text-sm text-green-800/80">{recipe.prepTime} • {recipe.calories} kcal • P{recipe.protein}/C{recipe.carbs}/F{recipe.fat}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => (bookmarked ? onRemoveRecipe(recipe.id) : onSaveRecipe(recipe))} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-green-900">
              {bookmarked ? 'Saved in Library' : 'Save to Library'}
            </button>
            <button onClick={addToPlan} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white">
              Add to Plan
            </button>
            <button onClick={() => navigate('/shopping-list')} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-green-900">
              Add Ingredients
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-green-900">Ingredients</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-green-900">
              {recipe.ingredients.map((i) => (
                <li key={i.name}>
                  {i.name} — {i.quantity}
                </li>
              ))}
            </ul>

            <h2 className="mt-5 font-semibold text-green-900">Cooking Instructions</h2>
            <ol className="mt-2 list-decimal pl-5 text-sm text-green-900">
              {recipe.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <aside className="space-y-3 rounded-xl bg-emerald-50 p-3 text-sm text-green-900">
            <div>
              <p className="text-xs text-green-700">Nutrition</p>
              <p>{recipe.calories} kcal</p>
              <p>Protein {recipe.protein}g</p>
              <p>Carbs {recipe.carbs}g</p>
              <p>Fat {recipe.fat}g</p>
            </div>
            <div>
              <p className="text-xs text-green-700">Allergy Info</p>
              <p>{recipe.allergies.length ? recipe.allergies.join(', ') : 'No listed allergens'}</p>
            </div>
            <div>
              <p className="text-xs text-green-700">Estimated Cost</p>
              <p>${recipe.estimatedCost.toFixed(2)}</p>
            </div>
          </aside>
        </div>

        <button className="mt-5 rounded-xl bg-green-700 px-4 py-2 text-white" onClick={() => navigate('/meal-plan-result')}>
          Back to weekly plan
        </button>
      </div>
    </section>
  )
}
