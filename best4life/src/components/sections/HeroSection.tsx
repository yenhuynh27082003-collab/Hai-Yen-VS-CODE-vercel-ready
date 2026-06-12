import { PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { HERO_SLIDES } from '../../constants/hero'
import { Button } from '../ui/Button'

export const HeroSection = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="relative h-[92vh] min-h-[680px] w-full overflow-hidden">
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className={`h-full w-full object-cover transition-transform duration-[6000ms] ${
                index === active ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/30" />

      <div className="container-shell relative flex h-full items-center pt-20">
        <div className="max-w-3xl text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-brand-100">
            AI-POWERED GROCERY & MEAL PLANNING
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">
            Smarter meals, lower grocery costs, and less food waste every week.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            Best4Life helps households plan healthier meals with AI, personalise recipes for allergies and
            goals, and optimise spending with structured grocery intelligence.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button>Start Planning Free</Button>
            <Button variant="ghost" className="gap-2">
              <PlayCircle size={16} /> View Demo
            </Button>
          </div>

          <div className="mt-10 flex gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setActive(index)}
                className={`h-1.5 transition-all ${index === active ? 'w-10 bg-white' : 'w-5 bg-white/45'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
