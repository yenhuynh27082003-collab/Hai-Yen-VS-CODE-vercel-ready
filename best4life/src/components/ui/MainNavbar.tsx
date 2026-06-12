import { Brain, HeartPulse, Menu, PiggyBank, Search, PackageSearch, UserCircle2, LogOut, Settings, History } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CurrentUser } from '../../types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Button } from './Button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet'

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: JSX.Element
  items?: MenuItem[]
}

interface MainNavbarProps {
  currentUser?: CurrentUser | null
  onLogout?: () => void
  logo?: {
    url: string
    title: string
  }
  menu?: MenuItem[]
  auth?: {
    login: {
      text: string
      url: string
    }
    signup: {
      text: string
      url: string
    }
  }
}

const BrandMark = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="best4life-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#24a148" />
        <stop offset="100%" stopColor="#0f6b2f" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#best4life-logo-gradient)" />
    <path d="M14 28c0-6 3.6-10 10.4-10H34v3.8h-9.2c-4 0-6.4 2.2-6.4 6.2 0 3.7 2.5 6.2 6.3 6.2H34V38h-9.3C17.8 38 14 34.1 14 28Z" fill="white" />
    <circle cx="32.6" cy="15.2" r="2.4" fill="#f8fffb" />
  </svg>
)

const defaultMenu: MenuItem[] = [
  { title: 'Home', url: '/' },
  {
    title: 'Features',
    url: '#',
    items: [
      {
        title: 'Smart Meal Planning',
        description: 'Intelligent weekly meal plans customised to your home routine and preferences.',
        icon: <Brain className="size-4 shrink-0" />,
        url: '#feature-smart-planning',
      },
      {
        title: 'Grocery Cost Optimisation',
        description: 'Reduce bill shock by generating efficient shopping lists and grouped ingredients.',
        icon: <PiggyBank className="size-4 shrink-0" />,
        url: '#feature-cost-optimisation',
      },
      {
        title: 'Pantry Inventory Tracking',
        description: 'Track pantry items and consume ingredients before expiry to cut waste.',
        icon: <PackageSearch className="size-4 shrink-0" />,
        url: '#feature-pantry-tracking',
      },
      {
        title: 'Health & Allergy Personalisation',
        description: 'Tailor meal suggestions around allergies, goals, and dietary preferences.',
        icon: <HeartPulse className="size-4 shrink-0" />,
        url: '#feature-health-personalisation',
      },
    ],
  },
  { title: 'Blog', url: '/blog' },
  { title: 'Pricing', url: '/pricing' },
  { title: 'About Us', url: '/about' },
]

const MainNavbar = ({
  currentUser = null,
  onLogout,
  logo = {
    url: '/',
    title: 'Best4Life',
  },
  menu = defaultMenu,
  auth = {
    login: { text: 'Log in', url: '/login' },
    signup: { text: 'Sign up', url: '/signup' },
  },
}: MainNavbarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const featuresRef = useRef<HTMLDivElement | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const SCROLL_THRESHOLD = 80

  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [SCROLL_THRESHOLD])

  const navSolid = useMemo(() => !isHome || scrolled, [isHome, scrolled])
  const toneClass = navSolid ? 'text-brand-900' : 'text-white'
  const toneSubtleClass = navSolid ? 'text-brand-700' : 'text-white/80'

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!featuresRef.current?.contains(event.target as Node)) {
        setFeaturesOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-user-menu]')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    setFeaturesOpen(false)
  }, [location.pathname])

  const navigateOrScroll = (url: string) => {
    if (url.startsWith('#')) {
      const id = url.replace('#', '')
      if (!isHome) {
        navigate('/', { state: { scrollTo: id } })
        return
      }
      const target = document.getElementById(id)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (url === '/') {
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        navigate('/')
      }
      return
    }

    navigate(url)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-in-out ${
        navSolid
          ? 'border-gray-200 bg-white/95 shadow-sm backdrop-blur-md'
          : 'border-transparent bg-transparent shadow-none backdrop-blur-0'
      }`}
    >
      <div className="container-shell py-3.5">
        <nav className="relative z-[60] hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-10">
            <button onClick={() => navigateOrScroll(logo.url)} className="group flex items-center gap-3" aria-label="Best4Life Home">
              <BrandMark className="h-10 w-10" />

              <span className="leading-none text-left">
                <span className={`block text-xl font-semibold tracking-[0.01em] transition-colors duration-300 ease-in-out ${toneClass}`}>
                  {logo.title}
                </span>
                <span className={`mt-1 block text-[10px] font-medium uppercase tracking-[0.24em] ${toneSubtleClass}`}>
                  Meal Intelligence
                </span>
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              {menu.map((item) =>
                renderMenuItem({
                  item,
                  navigateOrScroll,
                  navSolid,
                  featuresOpen,
                  setFeaturesOpen,
                  featuresRef,
                }),
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              className={`hidden min-w-44 items-center gap-2 rounded-full border px-3.5 py-2 md:flex ${
                navSolid
                  ? 'border-gray-200 bg-gray-100 text-green-950'
                  : 'border-white/30 bg-white/10 text-white backdrop-blur-md'
              }`}
            >
              <Search className="size-4 opacity-90" />
              <input
                type="search"
                placeholder="Search"
                className={`w-28 bg-transparent text-sm focus:outline-none ${
                  navSolid ? 'placeholder:text-gray-500' : 'placeholder:text-white/70'
                }`}
              />
            </label>

            {currentUser ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 shadow-sm hover:bg-green-50"
                >
                  <UserCircle2 className="size-5" />
                  {currentUser.firstName}
                </button>
                <div className={`absolute right-0 mt-2 w-56 rounded-xl border bg-white p-2 shadow-xl ${userMenuOpen ? 'block' : 'hidden'}`}>
                  {[
                    ['Dashboard', '/dashboard', <UserCircle2 className="size-4" key="d" />],
                    ['My Profile', '/profile', <UserCircle2 className="size-4" key="p" />],
                    ['Meal Plan History', '/profile/history', <History className="size-4" key="mh" />],
                    ['Shopping List History', '/profile/shopping-history', <History className="size-4" key="sh" />],
                    ['Settings', '/profile/settings', <Settings className="size-4" key="s" />],
                  ].map(([label, url, icon]) => (
                    <button key={String(url)} onClick={() => { setUserMenuOpen(false); navigate(String(url)) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-green-900 hover:bg-green-50">
                      {icon}
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onLogout?.()
                      setUserMenuOpen(false)
                      navigate('/')
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => navigateOrScroll(auth.login.url)}
                  variant="ghost"
                  size="sm"
                  className={`rounded-full px-4 text-sm font-medium transition-all duration-300 ${
                    navSolid
                      ? 'border border-gray-300 text-green-950 hover:bg-gray-100 hover:text-green-950'
                      : 'border border-white/40 text-white hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {auth.login.text}
                </Button>

                <Button
                  onClick={() => navigateOrScroll(auth.signup.url)}
                  size="sm"
                  className={`rounded-full px-5 transition-all duration-300 ${
                    navSolid
                      ? 'bg-green-700 text-white hover:bg-green-800'
                      : 'bg-green-500 text-white hover:bg-green-400'
                  }`}
                >
                  {auth.signup.text}
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <button onClick={() => navigateOrScroll(logo.url)} className="flex items-center gap-2.5" aria-label="Best4Life Home">
              <BrandMark className="h-9 w-9" />
              <span className={`text-base font-semibold tracking-wide ${toneClass}`}>{logo.title}</span>
            </button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg border transition-all duration-300 ${
                    navSolid
                      ? 'border-gray-300 bg-white text-green-950 hover:bg-gray-100'
                      : 'border-white/35 bg-white/15 text-white hover:bg-white/20'
                  }`}
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto border-brand-100 bg-white/95 backdrop-blur-xl">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center gap-2 text-brand-900">
                      <BrandMark className="h-8 w-8" />
                      <span className="text-lg font-semibold">{logo.title}</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    {menu.map((item) => renderMobileMenuItem(item, navigateOrScroll))}
                  </Accordion>

                  <label className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/50 px-3 text-brand-800">
                    <Search className="size-4" />
                    <input
                      type="search"
                      placeholder="Search"
                      className="w-full bg-transparent py-2.5 text-sm placeholder:text-brand-500/70 focus:outline-none"
                    />
                  </label>

                  <div className="flex flex-col gap-3">
                    <Button variant="outline" onClick={() => navigateOrScroll(auth.login.url)} className="rounded-full">
                      {auth.login.text}
                    </Button>
                    <Button onClick={() => navigateOrScroll(auth.signup.url)} className="rounded-full bg-brand-600 hover:bg-brand-700">
                      {auth.signup.text}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

type RenderMenuItemParams = {
  item: MenuItem
  navigateOrScroll: (url: string) => void
  navSolid: boolean
  featuresOpen: boolean
  setFeaturesOpen: (open: boolean) => void
  featuresRef: React.RefObject<HTMLDivElement>
}

const renderMenuItem = ({
  item,
  navigateOrScroll,
  navSolid,
  featuresOpen,
  setFeaturesOpen,
  featuresRef,
}: RenderMenuItemParams) => {
  if (item.title === 'Features' && item.items) {
    return (
      <div
        key={item.title}
        ref={featuresRef}
        className="relative z-[80]"
        onMouseEnter={() => setFeaturesOpen(true)}
        onMouseLeave={() => setFeaturesOpen(false)}
      >
        <button
          className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out ${
            navSolid
              ? 'text-green-950 hover:bg-green-50 hover:text-green-700'
              : 'text-white hover:bg-white/12 hover:text-green-200'
          }`}
          onClick={() => setFeaturesOpen(!featuresOpen)}
        >
          Features
        </button>

        <div
          aria-hidden="true"
          className={`absolute left-0 top-full h-3 w-[340px] ${featuresOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        />

        <div
          className={`absolute left-0 top-full mt-3 z-[999] w-[340px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl transition-all duration-200 ease-out ${
            featuresOpen
              ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
          }`}
        >
          <ul className="space-y-0.5">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <button
                  className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 hover:bg-gray-50"
                  onClick={() => {
                    setFeaturesOpen(false)
                    navigateOrScroll(subItem.url)
                  }}
                >
                  <span className="mt-0.5 rounded-lg bg-green-50 p-1.5 text-green-700">
                    {subItem.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{subItem.title}</span>
                    {subItem.description && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">{subItem.description}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <button
      key={item.title}
      className={`inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
        navSolid ? 'text-brand-800 hover:bg-brand-100 hover:text-brand-900' : 'text-white hover:bg-white/12 hover:text-white'
      }`}
      onClick={() => navigateOrScroll(item.url)}
    >
      {item.title}
    </button>
  )
}

const renderMobileMenuItem = (item: MenuItem, navigateOrScroll: (url: string) => void) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="rounded-lg border border-brand-100 px-3 py-2">
        <AccordionTrigger className="py-1 text-sm font-semibold text-brand-900 hover:no-underline">{item.title}</AccordionTrigger>
        <AccordionContent className="mt-1">
          {item.items.map((subItem) => (
            <button
              key={subItem.title}
              className="flex w-full select-none gap-3 rounded-lg p-2.5 text-left leading-none outline-none transition-colors hover:bg-brand-50"
              onClick={() => navigateOrScroll(subItem.url)}
            >
              <span className="rounded-md bg-brand-100 p-1.5 text-brand-700">{subItem.icon}</span>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-brand-900">{subItem.title}</div>
                {subItem.description && <p className="text-xs leading-snug text-brand-600">{subItem.description}</p>}
              </div>
            </button>
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <button
      key={item.title}
      onClick={() => navigateOrScroll(item.url)}
      className="rounded-lg px-1 py-1.5 text-left text-sm font-semibold text-brand-900"
    >
      {item.title}
    </button>
  )
}

export { MainNavbar }
