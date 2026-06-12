import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { BlogArticle } from '../../types'

type Props = {
  article: BlogArticle
}

export const ArticleCard = ({ article }: Props) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-brand-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <img
        src={article.image}
        alt={article.title}
        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          {article.category} · {article.publishDate}
        </p>
        <h3 className="mt-3 font-heading text-xl font-semibold text-brand-900">{article.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-700/90">{article.summary}</p>
        <Link
          to={`/blog/${article.id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-500"
        >
          Read More <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
}