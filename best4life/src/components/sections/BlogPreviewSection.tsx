import { BLOG_ARTICLES } from '../../constants/blog'
import { Reveal } from '../animation/Reveal'
import { ArticleCard } from '../blog/ArticleCard'
import { Button } from '../ui/Button'
import { SectionHeader } from '../ui/SectionHeader'

export const BlogPreviewSection = () => {
  return (
    <section className="section-space bg-brand-50/35">
      <div className="container-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="From The Blog"
            title="Insights on nutrition, meal prep, and smart grocery planning"
            description="Editorial-style resources designed to help you build healthier, more efficient food habits."
          />
          <Button to="/blog" variant="secondary">
            View All Articles
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {BLOG_ARTICLES.slice(0, 3).map((article, index) => (
            <Reveal key={article.id} style={{ transitionDelay: `${index * 70}ms` }}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
