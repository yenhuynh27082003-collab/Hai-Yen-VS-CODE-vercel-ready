import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { BLOG_ARTICLES } from '../constants/blog'

export const BlogArticlePage = () => {
  const { id } = useParams()
  const article = BLOG_ARTICLES.find((item) => item.id === id)

  if (!article) {
    return (
      <section className="section-space pt-32">
        <div className="container-shell">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Article Not Found</p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-brand-900">This article does not exist.</h1>
          <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </section>
    )
  }

  return (
    <article className="section-space pt-32">
      <div className="container-shell max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
          {article.category} · {article.publishDate}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-brand-900 md:text-5xl">
          {article.title}
        </h1>

        <img src={article.image} alt={article.title} className="mt-8 h-[420px] w-full object-cover" />

        <div className="prose prose-lg mt-8 max-w-none text-brand-800 prose-headings:font-heading">
          {article.content.map((paragraph) => (
            <p key={paragraph} className="mb-5 text-base leading-relaxed text-brand-700/95">
              {paragraph}
            </p>
          ))}
        </div>

        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
          <ArrowLeft size={16} /> Back to All Articles
        </Link>
      </div>
    </article>
  )
}
