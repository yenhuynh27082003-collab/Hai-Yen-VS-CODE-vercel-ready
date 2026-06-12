import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export const NotFoundPage = () => {
  return (
    <section className="section-space pt-32">
      <div className="container-shell text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">404</p>
        <h1 className="mt-3 font-heading text-5xl font-bold text-brand-900">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-brand-700/90">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-7 flex justify-center">
          <Button to="/">Back to Home</Button>
        </div>
        <Link to="/blog" className="mt-4 inline-block text-sm font-semibold text-brand-700">
          Visit Blog Instead
        </Link>
      </div>
    </section>
  )
}
