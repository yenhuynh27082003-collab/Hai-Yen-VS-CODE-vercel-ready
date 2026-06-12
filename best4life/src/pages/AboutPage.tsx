import { SectionHeader } from '../components/ui/SectionHeader'

export const AboutPage = () => {
  return (
    <section className="section-space pt-32">
      <div className="container-shell max-w-4xl">
        <SectionHeader
          eyebrow="About Best4Life"
          title="We’re building the future of intelligent home meal planning"
          description="Best4Life combines practical nutrition science with AI-guided decision support so modern households can eat healthier with less waste and less stress."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="border border-brand-100 bg-brand-50/40 p-6">
            <h3 className="font-heading text-xl font-semibold text-brand-900">Our Mission</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-700/90">
              Help families and individuals confidently plan meals, reduce food waste, and make financially
              smarter grocery choices through accessible AI.
            </p>
          </article>

          <article className="border border-brand-100 bg-white p-6">
            <h3 className="font-heading text-xl font-semibold text-brand-900">Our Approach</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-700/90">
              We focus on practical workflows: weekly planning, pantry visibility, dietary constraints, and
              flexible recipes designed for real life.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
