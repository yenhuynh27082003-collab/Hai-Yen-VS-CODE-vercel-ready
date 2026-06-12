import {
  Bell,
  BookMarked,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { CurrentUser } from '../../types'

type DashboardAppLayoutProps = {
  currentUser: CurrentUser | null
  onLogout: () => void
}

type NavItem = {
  label: string
  icon: typeof LayoutDashboard
  to?: string
  action?: () => void
  matchPaths?: string[]
  accent?: 'default' | 'logout'
}

export const DashboardAppLayout = ({ currentUser, onLogout }: DashboardAppLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [dashboardSearch, setDashboardSearch] = useState('')

  const firstName = currentUser?.firstName ?? 'Hai Yen'
  const email = currentUser?.email ?? 'hello@best4life.app'
  const initials = useMemo(
    () => `${currentUser?.firstName?.[0] ?? 'H'}${currentUser?.lastName?.[0] ?? 'Y'}`.toUpperCase(),
    [currentUser],
  )

  const logoutAndLeave = () => {
    onLogout()
    setMobileOpen(false)
    navigate('/')
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', matchPaths: ['/dashboard'] },
    { label: 'Meal Plan', icon: NotebookPen, to: '/meal-plan-result', matchPaths: ['/meal-plan-result', '/create-meal-plan'] },
    { label: 'Saved Recipes', icon: BookMarked, to: '/meal-library', matchPaths: ['/meal-library', '/recipe'] },
    { label: 'Grocery List', icon: ShoppingBasket, to: '/shopping-list', matchPaths: ['/shopping-list'] },
    { label: 'Profile', icon: UserRound, to: '/profile', matchPaths: ['/profile'] },
    { label: 'History', icon: Clock3, to: '/history', matchPaths: ['/history', '/profile/history', '/profile/shopping-history'] },
    { label: 'Settings', icon: Settings, to: '/profile/settings', matchPaths: ['/profile/settings'] },
    { label: 'Logout', icon: LogOut, action: logoutAndLeave, accent: 'logout' },
  ]

  const isActive = (item: NavItem) => {
    if (!item.to && !item.matchPaths) return false
    const candidates = item.matchPaths ?? (item.to ? [item.to] : [])
    return candidates.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
  }

  return (
    <div className="min-h-screen bg-white text-green-950">
      {mobileOpen ? <button className="fixed inset-0 z-40 bg-green-950/25 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex border-r border-emerald-100 bg-white transition-all duration-300 ${
          collapsed ? 'w-[92px]' : 'w-[290px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-full w-full flex-col p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">{collapsed ? <div className="grid h-11 w-11 place-items-center rounded-2xl bg-green-800 text-sm font-bold text-white">B4</div> : <Logo dark />}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileOpen(false)} className="rounded-xl border border-emerald-200 p-2 text-green-900 lg:hidden" aria-label="Close menu">
                <X className="size-4" />
              </button>
              <button
                onClick={() => setCollapsed((value) => !value)}
                className="hidden rounded-xl border border-emerald-200 p-2 text-green-900 hover:bg-emerald-50 lg:block"
                aria-label="Collapse sidebar"
              >
                {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/create-meal-plan')
              setMobileOpen(false)
            }}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900"
          >
            <Sparkles className="size-4" />
            {!collapsed ? 'Create New Plan' : null}
          </button>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              const className = `flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                item.accent === 'logout'
                  ? 'text-red-600 hover:bg-red-50'
                  : active
                    ? 'bg-emerald-100 text-green-900 shadow-sm ring-1 ring-emerald-200'
                    : 'text-green-800 hover:bg-emerald-50 hover:text-green-950'
              }`

              if (item.action) {
                return (
                  <button key={item.label} onClick={item.action} className={`${className} ${collapsed ? 'justify-center' : ''}`} title={item.label}>
                    <Icon className="size-4 shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </button>
                )
              }

              return (
                <Link
                  key={item.label}
                  to={item.to!}
                  onClick={() => setMobileOpen(false)}
                  className={`${className} ${collapsed ? 'justify-center' : ''}`}
                  title={item.label}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-green-900 via-green-800 to-emerald-600 p-4 text-white shadow-sm">
            <div className={`${collapsed ? 'hidden' : 'block'}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 font-semibold text-white">🥗</div>
                <div>
                  <p className="text-sm font-semibold">Plan smart</p>
                  <p className="text-xs text-emerald-100">Save recipes and build your next week faster.</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-emerald-50">Healthy ideas, flexible planning, cleaner shopping.</p>
              </div>
            </div>
            {collapsed ? <div className="grid h-12 place-items-center rounded-2xl bg-white/10 text-xl">🥬</div> : null}
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[92px]' : 'lg:pl-[290px]'}`}>
        <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
            <button className="rounded-xl border border-emerald-200 p-2 text-green-900 lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>

            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-green-700" />
              <input
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                placeholder="What would you like to cook?"
                className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/60 py-3 pl-11 pr-4 text-sm text-green-900 outline-none placeholder:text-green-700/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Link
                to="/shopping-list"
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith('/shopping-list') ? 'bg-green-800 text-white' : 'bg-emerald-50 text-green-900 hover:bg-emerald-100'
                }`}
              >
                Grocery List
              </Link>
              <Link
                to="/meal-library"
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith('/meal-library')
                    ? 'bg-emerald-100 text-green-900 ring-1 ring-emerald-200'
                    : 'bg-emerald-50 text-green-900 hover:bg-emerald-100'
                }`}
              >
                Recipe Box
              </Link>
              <button className="rounded-2xl border border-emerald-200 p-2.5 text-green-800 transition hover:bg-emerald-50" aria-label="Notifications">
                <Bell className="size-4" />
              </button>
              <button onClick={() => navigate('/profile/settings')} className="rounded-2xl border border-emerald-200 p-2.5 text-green-800 transition hover:bg-emerald-50" aria-label="Settings">
                <Settings className="size-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setAvatarOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-2.5 py-2 text-left shadow-sm transition hover:bg-emerald-50"
                  aria-label="Open avatar menu"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-green-800 text-xs font-bold text-white">{initials}</span>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-green-900">{firstName}</p>
                    <p className="text-[11px] text-green-700">Best4Life member</p>
                  </div>
                  <ChevronDown className="size-4 text-green-700" />
                </button>

                <div
                  className={`absolute right-0 z-40 mt-2 w-64 origin-top-right rounded-3xl border border-emerald-100 bg-white p-2 shadow-xl transition-all duration-200 ${
                    avatarOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
                  }`}
                >
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-semibold text-green-900">{firstName}</p>
                    <p className="truncate text-xs text-green-700">{email}</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link to="/profile" onClick={() => setAvatarOpen(false)} className="block rounded-2xl px-4 py-2.5 text-sm text-green-900 hover:bg-emerald-50">
                      Profile
                    </Link>
                    <Link to="/history" onClick={() => setAvatarOpen(false)} className="block rounded-2xl px-4 py-2.5 text-sm text-green-900 hover:bg-emerald-50">
                      Recently Viewed
                    </Link>
                    <Link to="/profile/settings" onClick={() => setAvatarOpen(false)} className="block rounded-2xl px-4 py-2.5 text-sm text-green-900 hover:bg-emerald-50">
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setAvatarOpen(false)
                        logoutAndLeave()
                      }}
                      className="block w-full rounded-2xl px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Outlet context={{ dashboardSearch, setDashboardSearch }} />
        </main>
      </div>
    </div>
  )
}
