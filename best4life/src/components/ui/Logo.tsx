import { ShoppingCart } from 'lucide-react'

type Props = {
  dark?: boolean
}

export const Logo = ({ dark }: Props) => {
  return (
    <div className="inline-flex items-center gap-2" aria-label="Best4Life logo">
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${
          dark
            ? 'border-brand-700/20 bg-brand-50 text-brand-700'
            : 'border-white/30 bg-white/20 text-white backdrop-blur'
        }`}
      >
        <ShoppingCart size={18} strokeWidth={2.2} />
      </span>
      <span className="leading-tight">
        <span
          className={`block font-heading text-lg font-semibold tracking-wide ${
            dark ? 'text-brand-900' : 'text-white'
          }`}
        >
          Best4Life
        </span>
        <span className={`block text-[10px] uppercase tracking-[0.22em] ${dark ? 'text-brand-700' : 'text-brand-100'}`}>
          AI Meal Planning
        </span>
      </span>
    </div>
  )
}