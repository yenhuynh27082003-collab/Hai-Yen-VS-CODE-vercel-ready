import { BLOG_ARTICLES } from '../constants/blog'
import { ArticleCard } from '../components/blog/ArticleCard'
import { SectionHeader } from '../components/ui/SectionHeader'

export const BlogPage = () => {
  return (
    <section className="section-space pt-32">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Best4Life Journal"
          title="Meal planning and healthy grocery insights"
          description="Explore practical guides, nutrition ideas, and strategic tips to simplify your weekly food decisions."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {BLOG_ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
