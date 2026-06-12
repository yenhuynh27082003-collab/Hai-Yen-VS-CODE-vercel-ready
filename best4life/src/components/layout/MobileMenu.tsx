import { ChevronDown } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FEATURE_NAV_ITEMS, NAV_LINKS } from '../../constants/navigation'
import { scrollToSection } from '../../utils/scrollToSection'
import { Button } from '../ui/Button'

type Props = {
  open: boolean
  onClose: () => void
}

export const MobileMenu = ({ open, onClose }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const goToFeature = (id: string) => {
    onClose()
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
      return
    }
    scrollToSection(id)
  }

  return (
    <div
      className={`lg:hidden overflow-hidden transition-all duration-300 ${
        open ? 'max-h-[540px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="mt-3 space-y-3 border border-brand-100 bg-white p-4 shadow-soft">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.label}
            to={item.href.startsWith('#') ? '/' : item.href}
            className="block text-sm font-medium text-brand-800"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
        <div>
          <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Features <ChevronDown size={14} />
          </p>
          <div className="space-y-2">
            {FEATURE_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goToFeature(item.id)}
                className="block w-full text-left text-sm text-brand-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <input
          type="search"
          placeholder="Search meals"
          className="w-full border border-brand-200 px-3 py-2 text-sm outline-none transition focus:border-brand-400"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button to="/login" variant="secondary" className="w-full">
            Login
          </Button>
          <Button to="/signup" className="w-full">
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}