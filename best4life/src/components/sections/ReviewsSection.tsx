import { Star } from 'lucide-react'
import { REVIEWS } from '../../constants/reviews'
import { Reveal } from '../animation/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

export const ReviewsSection = () => {
  return (
    <section className="section-space bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Customer Reviews"
          title="Loved by people who want healthier routines without complexity"
          description="Best4Life users trust our planning workflow to save time, money, and food every week."
          center
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {REVIEWS.map((review, index) => (
            <Reveal key={review.id} style={{ transitionDelay: `${index * 70}ms` }}>
              <article className="h-full border border-brand-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                <div className="flex items-center gap-3">
                  <img src={review.image} alt={review.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-brand-900">{review.name}</h3>
                    <p className="text-xs text-brand-600">{review.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 text-accent-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-700/90">“{review.quote}”</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
