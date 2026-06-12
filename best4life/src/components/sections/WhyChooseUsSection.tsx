import { Brain, Leaf, PackageSearch } from 'lucide-react'
import { Reveal } from '../animation/Reveal'

const keyStats = [
  {
    value: '38%',
    label: 'Less food waste',
  },
  {
    value: '30%',
    label: 'Average grocery savings',
  },
]

const highlights = [
  {
    title: 'Smart Meal Planning',
    text: 'AI creates weekly meals based on budget, time, and preferences.',
    icon: Brain,
  },
  {
    title: 'Pantry-Aware Suggestions',
    text: 'Use ingredients you already have before buying more.',
    icon: PackageSearch,
  },
  {
    title: 'Health Personalisation',
    text: 'Adapt meals for allergies, goals, and lifestyle needs.',
    icon: Leaf,
  },
]

export const WhyChooseUsSection = () => {
  return (
    <section className="section-space bg-gradient-to-b from-green-50/70 via-white to-white py-24 lg:py-28">
      <div className="container-shell">
        <div className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">WHY CHOOSE US</p>
                <h2 className="mt-4 max-w-2xl font-heading text-4xl font-bold leading-[0.95] tracking-tight text-brand-900 md:text-6xl">
                  Why households choose Best4Life
                </h2>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-brand-700/90 md:text-lg">
                  Best4Life helps busy households plan healthier meals, reduce waste, and control grocery
                  spending with AI-powered weekly planning.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-8 md:max-w-lg">
                  {keyStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="font-heading text-4xl font-bold tracking-tight text-brand-900 md:text-5xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-sm font-medium text-brand-700">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal style={{ transitionDelay: '90ms' }}>
              <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-green-800/25 via-green-700/10 to-transparent" />
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80"
                  alt="Happy household preparing healthy meals together"
                  className="h-[440px] w-full rounded-[2rem] object-cover shadow-xl lg:h-[520px]"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>

          <Reveal style={{ transitionDelay: '180ms' }}>
            <div className="relative mt-10 grid gap-5 md:grid-cols-3 lg:-mt-16">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-green-100 bg-white/95 p-6 shadow-lg shadow-green-900/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Icon className="size-8 text-green-700" strokeWidth={1.8} />
                    <h3 className="mt-4 font-heading text-xl font-semibold text-brand-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-700/90">{item.text}</p>
                  </article>
                )
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
