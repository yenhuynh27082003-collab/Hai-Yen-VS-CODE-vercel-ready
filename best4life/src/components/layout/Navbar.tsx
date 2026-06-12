import {
  Brain,
  ChevronDown,
  HeartPulse,
  Menu,
  PackageSearch,
  PiggyBank,
  Search,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FEATURE_NAV_ITEMS } from '../../constants/navigation'
import { cn } from '../../utils/cn'
import { scrollToSection } from '../../utils/scrollToSection'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { MobileMenu } from './MobileMenu'

const iconMap = {
  Brain,
  PiggyBank,
  PackageSearch,
  HeartPulse,
}

export const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [featureOpen, setFeatureOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setFeatureOpen(false)
  }, [location.pathname])

  const navSolid = useMemo(() => !isHome || scrolled, [isHome, scrolled])

  const goHome = () => {
    if (location.pathname !== '/') {
      navigate('/')
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToFeature = (id: string) => {
    setFeatureOpen(false)
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
      return
    }
    scrollToSection(id)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        navSolid ? 'bg-white/95 shadow-sm backdrop-blur' : 'bg-transparent',
      )}
    >
      <div className="container-shell">
        <div className="flex h-20 items-center justify-between gap-3">
          <button onClick={goHome} className="text-left">
            <Logo dark={navSolid} />
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            <button
              onClick={goHome}
              className={cn(
                'text-sm font-medium transition hover:text-brand-500',
                navSolid ? 'text-brand-900' : 'text-white',
              )}
            >
              Home
            </button>

            <div className="relative">
              <button
                onClick={() => setFeatureOpen((current) => !current)}
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-medium transition hover:text-brand-500',
                  navSolid ? 'text-brand-900' : 'text-white',
                )}
              >
                Features <ChevronDown size={16} />
              </button>
              <div
                className={cn(
                  'absolute left-0 top-10 w-72 border border-brand-100 bg-white p-2 shadow-soft transition-all duration-200',
                  featureOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                )}
              >
                {FEATURE_NAV_ITEMS.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Brain
                  return (
                    <button
                      key={item.id}
                      onClick={() => goToFeature(item.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-800 transition hover:bg-brand-50"
                    >
                      <Icon size={16} className="text-brand-600" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Link
              to="/blog"
              className={cn('text-sm font-medium transition hover:text-brand-500', navSolid ? 'text-brand-900' : 'text-white')}
            >
              Blog
            </Link>
            <Link
              to="/pricing"
              className={cn('text-sm font-medium transition hover:text-brand-500', navSolid ? 'text-brand-900' : 'text-white')}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className={cn('text-sm font-medium transition hover:text-brand-500', navSolid ? 'text-brand-900' : 'text-white')}
            >
              About Us
            </Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <label className={cn('flex items-center gap-2 border px-3 py-2 text-sm', navSolid ? 'border-brand-200 bg-white text-brand-700' : 'border-white/40 bg-white/15 text-white')}>
              <Search size={15} />
              <input
                type="search"
                placeholder="Search"
                className="w-28 bg-transparent text-sm placeholder:opacity-80 focus:outline-none"
              />
            </label>
            <Button to="/login" variant={navSolid ? 'secondary' : 'ghost'}>
              Login
            </Button>
            <Button to="/signup">Sign Up</Button>
          </div>

          <button
            onClick={() => setMenuOpen((current) => !current)}
            className={cn('inline-flex h-10 w-10 items-center justify-center border lg:hidden', navSolid ? 'border-brand-200 bg-white text-brand-800' : 'border-white/40 bg-white/15 text-white')}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </header>
  )
}