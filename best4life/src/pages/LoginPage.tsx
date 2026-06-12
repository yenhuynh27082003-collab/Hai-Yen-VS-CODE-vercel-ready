import { FormEvent, useMemo, useState } from 'react'
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
    <path
      d="M21.35 12.24c0-.76-.07-1.49-.2-2.18H12v4.13h5.24a4.48 4.48 0 0 1-1.95 2.94v2.43h3.15c1.85-1.7 2.91-4.2 2.91-7.32Z"
      fill="#4285F4"
    />
    <path
      d="M12 21.75c2.63 0 4.83-.87 6.44-2.37l-3.15-2.43c-.87.58-1.99.93-3.29.93-2.53 0-4.67-1.7-5.44-3.98H3.31v2.51A9.75 9.75 0 0 0 12 21.75Z"
      fill="#34A853"
    />
    <path
      d="M6.56 13.9a5.84 5.84 0 0 1 0-3.8V7.6H3.31a9.75 9.75 0 0 0 0 8.8l3.25-2.5Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.2 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.31 7.6l3.25 2.51C7.33 7.83 9.47 6.13 12 6.13Z"
      fill="#EA4335"
    />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
    <path
      fill="#1877F2"
      d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.67 4.52-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12Z"
    />
  </svg>
)

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
    <path
      fill="#111111"
      d="M16.36 12.75c.03 3.01 2.64 4.01 2.67 4.03-.02.07-.41 1.42-1.35 2.81-.81 1.2-1.65 2.39-2.97 2.41-1.3.03-1.72-.77-3.2-.77s-1.95.74-3.15.79c-1.27.05-2.24-1.28-3.06-2.47-1.66-2.4-2.92-6.78-1.22-9.73.84-1.47 2.34-2.4 3.96-2.42 1.24-.03 2.41.84 3.2.84.78 0 2.24-1.03 3.77-.88.64.03 2.42.26 3.57 1.95-.09.05-2.13 1.24-2.11 3.44Zm-2.41-7.34c.68-.82 1.14-1.96 1.01-3.09-.98.04-2.16.65-2.86 1.47-.63.73-1.18 1.89-1.03 3.01 1.1.08 2.21-.56 2.88-1.39Z"
    />
  </svg>
)

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [touched, setTouched] = useState({ email: false, password: false })

  const errors = useMemo(() => {
    const nextErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    return nextErrors
  }, [email, password])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({ email: true, password: true })

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onLogin(email.trim(), password)
      if (!result.success) {
        setAuthError(result.message ?? 'We couldn’t log you in. Please try again.')
        return
      }

      setAuthError('')
      navigate('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section-space bg-gradient-to-b from-white to-green-50/40 pt-32">
      <div className="container-shell">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 animate-[fadeIn_.6s_ease-out]">
          <div className="grid lg:grid-cols-2">
            <aside className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 p-8 sm:p-10 lg:p-12">
              <div className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
              <div className="absolute -bottom-10 -left-12 h-44 w-44 rounded-full bg-emerald-200/45 blur-2xl" />
              <div className="absolute right-14 top-32 hidden h-16 w-16 animate-[float_4s_ease-in-out_infinite] rounded-2xl bg-white/55 shadow-sm lg:block" />

              <div className="relative z-10 flex h-full flex-col justify-between gap-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-200/60 bg-white/80 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm backdrop-blur">
                    <Leaf className="h-4 w-4" />
                    Best4Life
                  </div>

                  <div className="max-w-md space-y-4">
                    <h1 className="font-['Poppins'] text-3xl font-bold leading-tight text-green-900 sm:text-4xl">
                      Plan smarter meals for everyday life
                    </h1>
                    <p className="text-base leading-relaxed text-green-900/75 sm:text-lg">
                      Reduce grocery waste, save money, and build healthier weekly routines with intelligent meal
                      planning.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-green-700/70">Savings</p>
                    <p className="mt-2 text-2xl font-bold text-green-900">35%</p>
                    <p className="mt-1 text-sm text-green-800/70">Lower weekly food waste</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-green-700/70">Routines</p>
                    <p className="mt-2 text-2xl font-bold text-green-900">5x</p>
                    <p className="mt-1 text-sm text-green-800/70">Faster weekly meal prep</p>
                  </div>
                </div>
              </div>
            </aside>

            <div className="bg-white p-7 sm:p-10 lg:p-12">
              <div className="mx-auto w-full max-w-md space-y-7">
                <div className="space-y-2">
                  <h2 className="font-['Poppins'] text-3xl font-semibold text-green-950">Welcome back</h2>
                  <p className="text-sm text-green-900/70 sm:text-base">Sign in to continue planning smarter meals.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-green-900">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-700/60" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border bg-green-50/40 py-3 pl-11 pr-4 text-sm text-green-950 outline-none transition-all focus:ring-2 ${
                          touched.email && errors.email
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                            : 'border-green-100 focus:border-green-500 focus:ring-green-500'
                        }`}
                      />
                    </div>
                    {touched.email && errors.email ? <p className="text-xs font-medium text-red-500">{errors.email}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-green-900">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-700/60" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                        placeholder="Enter your password"
                        className={`w-full rounded-xl border bg-green-50/40 py-3 pl-11 pr-12 text-sm text-green-950 outline-none transition-all focus:ring-2 ${
                          touched.password && errors.password
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                            : 'border-green-100 focus:border-green-500 focus:ring-green-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-green-700/80 transition hover:bg-green-100 hover:text-green-900"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password ? (
                      <p className="text-xs font-medium text-red-500">{errors.password}</p>
                    ) : null}
                    <div className="text-right">
                      <button type="button" className="text-sm text-green-700 transition hover:text-green-800">
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                  {authError ? <p className="text-xs font-medium text-red-500">{authError}</p> : null}
                </form>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-green-100" />
                    </div>
                    <p className="relative mx-auto w-fit bg-white px-3 text-sm text-green-900/65">Or sign in with</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => console.log('Google login')}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                      aria-label="Sign in with Google"
                    >
                      <GoogleIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => console.log('Facebook login')}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                      aria-label="Sign in with Facebook"
                    >
                      <FacebookIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => console.log('Apple login')}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                      aria-label="Sign in with Apple"
                    >
                      <AppleIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  )
}
