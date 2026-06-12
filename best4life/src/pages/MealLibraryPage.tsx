import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Cookie, Filter, Leaf, Soup, Sparkles, Sun, Sunrise, Utensils } from 'lucide-react'
import { MOCK_RECIPES } from '../constants/mockRecipes'
import { Recipe, WeeklyMealPlan } from '../types'

type Props = {
  weeklyMealPlan: WeeklyMealPlan
  onUpdateMealPlan: (plan: WeeklyMealPlan) => void
  savedRecipes: Recipe[]
  onSaveRecipe: (recipe: Recipe) => void
  onRemoveRecipe: (recipeId: string) => void
}

type DashboardOutletContext = {
  dashboardSearch: string
  setDashboardSearch: (value: string) => void
}

const CATEGORIES = [
  { label: 'All Recipes', icon: Sparkles },
  { label: 'Breakfasts', icon: Sunrise },
  { label: 'Lunches', icon: Sun },
  { label: 'Desserts', icon: Cookie },
  { label: 'Dinner', icon: Utensils },
  { label: 'Sides', icon: Leaf },
  { label: 'Snacks', icon: Cookie },
  { label: 'Soups', icon: Soup },
  { label: 'Vegan', icon: Leaf },
] as const

export const MealLibraryPage = ({ weeklyMealPlan, onUpdateMealPlan, savedRecipes, onSaveRecipe, onRemoveRecipe }: Props) => {
  const navigate = useNavigate()
  const { dashboardSearch, setDashboardSearch } = useOutletContext<DashboardOutletContext>()
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]['label']>('All Recipes')
  const [sortBy, setSortBy] = useState<'popular' | 'time'>('popular')

  const recipes = useMemo(() => {
    const search = dashboardSearch.trim().toLowerCase()
    const bySearch = MOCK_RECIPES.filter((recipe) => {
      if (!search) return true
      return recipe.title.toLowerCase().includes(search) || recipe.cuisine.toLowerCase().includes(search)
    })

    const byCategory = bySearch.filter((recipe) => {
      if (activeCategory === 'All Recipes') return true
      if (activeCategory === 'Breakfasts') return /oats|breakfast/i.test(recipe.title)
      if (activeCategory === 'Lunches') return recipe.calories >= 430 && recipe.calories <= 520
      if (activeCategory === 'Desserts') return /cookie|choco|dessert|sweet/i.test(recipe.title)
      if (activeCategory === 'Dinner') return recipe.calories > 500
      if (activeCategory === 'Sides') return /salad|broccoli|quinoa/i.test(recipe.title)
      if (activeCategory === 'Snacks') return recipe.calories < 470
      if (activeCategory === 'Soups') return recipe.title.toLowerCase().includes('soup')
      if (activeCategory === 'Vegan') return /tofu|chickpea|veggie|pumpkin/i.test(recipe.title)
      return true
    })

    return [...byCategory].sort((a, b) => (sortBy === 'time' ? a.prepTime.localeCompare(b.prepTime) : b.protein - a.protein))
  }, [activeCategory, dashboardSearch, sortBy])

  const addToPlan = (recipe: Recipe) => {
    if (weeklyMealPlan.days.length === 0) {
      navigate('/create-meal-plan')
      return
    }
    const updated = {
      days: weeklyMealPlan.days.map((day, dayIndex) => {
        if (dayIndex !== 0) return day
        const dinnerIndex = day.meals.findIndex((meal) => meal.slot === 'dinner')
        if (dinnerIndex === -1) return day
        return {
          ...day,
          meals: day.meals.map((meal, index) => (index === dinnerIndex ? { ...meal, recipe } : meal)),
        }
      }),
    }
    onUpdateMealPlan(updated)
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-950">Saved Recipes</h1>
            <p className="mt-1 text-sm text-green-800">{recipes.length} recipes in your recipe box</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-green-900 hover:bg-emerald-50"><Filter className="size-4" /> Filters</button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'popular' | 'time')} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm text-green-900">
              <option value="popular">Sort</option>
              <option value="time">Cook Time</option>
            </select>
            <button className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-green-900 hover:bg-emerald-50">Share</button>
          </div>
        </div>

        <div className="mt-3 md:max-w-sm">
          <input value={dashboardSearch} onChange={(e) => setDashboardSearch(e.target.value)} placeholder="Search recipes..." className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
                activeCategory === label ? 'bg-green-800 text-white' : 'bg-emerald-50 text-green-900 hover:bg-emerald-100'
              }`}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {recipes.map((recipe) => {
          const bookmarked = savedRecipes.some((r) => r.id === recipe.id)
          return (
            <article key={recipe.id} className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-md">
              <div className="relative">
                <img src={recipe.image} alt={recipe.title} className="h-44 w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-green-900">{recipe.prepTime}</span>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="line-clamp-2 text-base font-semibold text-green-950">{recipe.title}</h3>
                    <p className="text-xs text-green-700">{recipe.cuisine}</p>
                  </div>
                  <button onClick={() => (bookmarked ? onRemoveRecipe(recipe.id) : onSaveRecipe(recipe))} className="rounded-lg p-1 text-green-700 hover:bg-emerald-50" aria-label="Toggle bookmark">
                    {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => navigate(`/recipe/${recipe.id}`)} className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-green-900 hover:bg-emerald-50">View</button>
                  <button onClick={() => addToPlan(recipe)} className="rounded-xl bg-green-800 px-3 py-2 text-xs font-semibold text-white hover:bg-green-900">Add to Plan</button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
