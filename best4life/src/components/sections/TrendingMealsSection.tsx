import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRENDING_MEALS } from '../../constants/meals'
import { Reveal } from '../animation/Reveal'
import { Button } from '../ui/Button'
import { SectionHeader } from '../ui/SectionHeader'

export const TrendingMealsSection = () => {
  const navigate = useNavigate()
  const railRef = useRef<HTMLDivElement | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const loopMeals = useMemo(() => [...TRENDING_MEALS, ...TRENDING_MEALS], [])

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!railRef.current) return
    const amount = railRef.current.clientWidth * 0.92
    railRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const tick = () => {
      if (isPaused) return

      const halfWidth = rail.scrollWidth / 2
      if (rail.scrollLeft >= halfWidth) {
        rail.scrollLeft = rail.scrollLeft - halfWidth
      }

      rail.scrollBy({ left: rail.clientWidth * 0.26, behavior: 'smooth' })
    }

    const id = window.setInterval(tick, 2800)
    return () => window.clearInterval(id)
  }, [isPaused])

  return (
    <section className="bg-brand-50/40 py-16" id="trending-meals">
      <div className="container-shell">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Trending Meals"
            title="Chef-inspired meals ready for your weekly plan"
            description="Discover nutrition-balanced dishes selected for taste, affordability, and practical home preparation."
          />

          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={() => scrollByAmount('left')}
              className="inline-flex h-10 w-10 items-center justify-center border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-100"
              aria-label="Scroll meals left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollByAmount('right')}
              className="inline-flex h-10 w-10 items-center justify-center border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-100"
              aria-label="Scroll meals right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {loopMeals.map((meal, index) => (
            <Reveal
              key={`${meal.id}-${index}`}
              className="h-full min-w-[280px] max-w-[280px] snap-start sm:min-w-[280px] sm:max-w-[280px] lg:min-w-[280px] lg:max-w-[280px]"
              style={{ transitionDelay: `${(index % TRENDING_MEALS.length) * 80}ms` }}
            >
              <article className="group flex h-[500px] w-[280px] flex-col overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-b from-white to-brand-50/20 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.title}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-heading text-lg font-semibold leading-snug text-brand-900 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                      {meal.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-700/90 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                      {meal.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[meal.calories.split('·')[0].trim(), meal.price, meal.protein, meal.prepTime].map((badge) => (
                        <span key={badge} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-brand-700">
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 rounded-xl border border-green-100 bg-green-50/70 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-700">Health Score</p>
                        <p className="text-sm font-semibold text-green-800">{meal.healthScore.toFixed(1)}/10</p>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        {meal.healthBars.map((value, i) => (
                          <span key={i} className="h-1.5 rounded-full bg-green-100">
                            <span
                              className="block h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                              style={{ width: `${value}%` }}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="mt-auto w-full rounded-xl bg-green-600 text-white hover:bg-green-700" onClick={() => navigate('/login')}>
                    Add to Plan
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
