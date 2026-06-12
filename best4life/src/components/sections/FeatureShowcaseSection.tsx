import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Reveal } from '../animation/Reveal'

const featureBlocks = [
  {
    id: 'smart-meal-planning',
    label: 'Smart Meal Planning',
    title: 'Plan delicious weekly meals in minutes, not hours.',
    description:
      'Best4Life learns your preferences and builds practical weekly meal plans that your household will actually cook and enjoy.',
    bullets: ['Auto-balanced breakfast, lunch, and dinner ideas', 'Flexible swaps for busy weekdays', 'Family-friendly variety without food waste'],
    cta: 'Build my weekly plan',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200',
  },
  {
    id: 'grocery-cost-optimisation',
    label: 'Grocery Cost Optimisation',
    title: 'Compare supermarkets and reduce your weekly grocery spend.',
    description:
      'Instantly compare Aldi, Woolworths, and Coles pricing so you can shop smarter and keep your budget under control.',
    bullets: ['Live multi-store price comparison', 'Best-value suggestions by ingredient', 'Transparent savings summary before checkout'],
    cta: 'Optimise my grocery list',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
  },
  {
    id: 'pantry-inventory-tracking',
    label: 'Pantry Inventory Tracking',
    title: 'Know what is in your pantry before you buy again.',
    description:
      'Track staples, avoid duplicates, and plan meals around what you already have at home to minimise waste.',
    bullets: ['Simple pantry and fridge visibility', 'Use-what-you-have recipe matching', 'Expiry-aware planning for fresher meals'],
    cta: 'Track my pantry',
    image:
      'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=1200',
  },
  {
    id: 'health-allergy-personalisation',
    label: 'Health & Allergy Personalisation',
    title: 'Meals personalised to your goals, allergies, and lifestyle.',
    description:
      'From high-protein goals to allergy-safe substitutions, every plan adapts to your needs while keeping flavour first.',
    bullets: ['Allergy-aware ingredient substitutions', 'Goal-based nutrition guidance', 'Custom dietary profiles for each household member'],
    cta: 'Personalise my meals',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
  },
]

export const FeatureShowcaseSection = () => {
  return (
    <section className="bg-gradient-to-b from-[#f8f6ef] via-[#f2fbf5] to-white py-14 md:py-20">
      <div className="container-shell space-y-10 md:space-y-14">
        {featureBlocks.map((feature, index) => {
          const reverse = index % 2 !== 0
          return (
            <Reveal key={feature.id}>
              <article
                id={feature.id}
                className="grid gap-6 rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(16,85,52,0.08)] md:grid-cols-2 md:items-center md:gap-10 md:p-8"
              >
                <div className={`space-y-4 ${reverse ? 'md:order-2' : ''}`}>
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {feature.label}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold leading-tight text-green-950 md:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="max-w-xl text-base leading-relaxed text-green-800/90">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-green-900">
                        <CheckCircle2 className="mt-0.5 size-4 text-green-700" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-green-900">
                    {feature.cta}
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <div className={`${reverse ? 'md:order-1' : ''}`}>
                  <div className="overflow-hidden rounded-3xl shadow-[0_10px_30px_rgba(15,73,46,0.18)]">
                    <img
                      src={feature.image}
                      alt={feature.label}
                      className="h-64 w-full object-cover md:h-[340px]"
                      loading="lazy"
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
