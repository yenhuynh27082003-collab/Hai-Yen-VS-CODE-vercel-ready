import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type SignupFormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  dateOfBirth: string
}

type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>

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

const INITIAL_VALUES: SignupFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  dateOfBirth: '',
}

type SignupPageProps = {
  onSignup: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; message?: string; requiresEmailConfirmation?: boolean }>
}

export const SignupPage = ({ onSignup }: SignupPageProps) => {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<SignupFormValues>(INITIAL_VALUES)
  const [touched, setTouched] = useState<Partial<Record<keyof SignupFormValues, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileStep, setProfileStep] = useState({
    allergies: [] as string[],
    cuisinePreferences: [] as string[],
    budget: '120',
    activityLevel: 'Moderate',
    fitnessGoal: 'Eat healthier',
    dietaryPreferences: [] as string[],
  })

  const validate = (values: SignupFormValues): SignupFormErrors => {
    const errors: SignupFormErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!values.firstName.trim()) errors.firstName = 'First name is required.'
    if (!values.lastName.trim()) errors.lastName = 'Last name is required.'

    if (!values.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!emailPattern.test(values.email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!values.password) {
      errors.password = 'Password is required.'
    } else if (values.password.length < 8) {
      errors.password = 'Please choose a stronger password.'
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match. Please check and try again.'
    }

    return errors
  }

  const errors = useMemo(() => validate(formValues), [formValues])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setSubmitSuccess('')
    setSubmitError('')
  }

  const handleBlur = (field: keyof SignupFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const allTouched: Partial<Record<keyof SignupFormValues, boolean>> = {
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      dateOfBirth: true,
      password: true,
      confirmPassword: true,
    }

    setTouched((prev) => ({ ...prev, ...allTouched }))

    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = {
      ...formValues,
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      email: formValues.email.trim(),
      createdAt: new Date().toISOString(),
    }

    setIsSubmitting(true)
    try {
      const result = await onSignup({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
      })

      if (!result.success) {
        setSubmitError(result.message ?? 'We couldn’t create your account. Please check your details and try again.')
        return
      }

      if (result.requiresEmailConfirmation) {
        setSubmitSuccess(
          result.message ?? 'Your Best4Life account has been created! Please check your email and verify your account before logging in.',
        )
        setProfileModalOpen(false)
        return
      }

      setSubmitError('')
      setSubmitSuccess('Welcome to Best4Life! Your account has been created successfully.')
      setProfileModalOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputClassName = (field: keyof SignupFormValues) => {
    const hasError = touched[field] && errors[field]
    return `w-full rounded-xl border bg-green-50/40 py-3 px-4 text-sm text-green-950 outline-none transition-all focus:ring-2 ${
      hasError
        ? ' border-red-300 focus:border-red-400 focus:ring-red-200'
        : ' border-green-100 focus:border-green-500 focus:ring-green-500'
    }`
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
                      Start planning better meals
                    </h1>
                    <p className="text-base leading-relaxed text-green-900/75 sm:text-lg">
                      Create your Best4Life account to organise weekly meals, reduce waste, and build healthier grocery
                      routines.
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
              <div className="mx-auto w-full max-w-md space-y-6">
                <div className="space-y-2">
                  <h2 className="font-['Poppins'] text-3xl font-semibold text-green-950">Create your account</h2>
                  <p className="text-sm text-green-900/70 sm:text-base">Create an account to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-green-900">
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formValues.firstName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstName')}
                        placeholder="Ava"
                        className={getInputClassName('firstName')}
                      />
                      {touched.firstName && errors.firstName ? (
                        <p className="text-xs font-medium text-red-500">{errors.firstName}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-green-900">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formValues.lastName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('lastName')}
                        placeholder="Nguyen"
                        className={getInputClassName('lastName')}
                      />
                      {touched.lastName && errors.lastName ? (
                        <p className="text-xs font-medium text-red-500">{errors.lastName}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-green-900">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@example.com"
                      className={getInputClassName('email')}
                    />
                    {touched.email && errors.email ? <p className="text-xs font-medium text-red-500">{errors.email}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-green-900">
                        Phone number <span className="text-green-700/60">(optional)</span>
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formValues.phoneNumber}
                        onChange={handleChange}
                        placeholder="+61 4XX XXX XXX"
                        className={getInputClassName('phoneNumber')}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dateOfBirth" className="text-sm font-medium text-green-900">
                        Date of birth <span className="text-green-700/60">(optional)</span>
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formValues.dateOfBirth}
                        onChange={handleChange}
                        className={getInputClassName('dateOfBirth')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-green-900">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formValues.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="At least 8 characters"
                        className={`${getInputClassName('password')} pr-12`}
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
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-green-900">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formValues.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="Re-enter password"
                        className={`${getInputClassName('confirmPassword')} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-green-700/80 transition hover:bg-green-100 hover:text-green-900"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword ? (
                      <p className="text-xs font-medium text-red-500">{errors.confirmPassword}</p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </button>

                  <div className="space-y-4 pt-1">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-green-100" />
                      </div>
                      <p className="relative mx-auto w-fit bg-white px-3 text-sm text-green-900/65">OR continue with</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => console.log('Google signup')}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                        aria-label="Sign up with Google"
                      >
                        <GoogleIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => console.log('Facebook signup')}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                        aria-label="Sign up with Facebook"
                      >
                        <FacebookIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => console.log('Apple signup')}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                        aria-label="Sign up with Apple"
                      >
                        <AppleIcon />
                      </button>
                    </div>
                  </div>

                  {submitSuccess ? <p className="text-sm font-medium text-green-700">{submitSuccess}</p> : null}
                  {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>

      {profileModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-green-900">Complete your profile setup</h3>
            <p className="mt-1 text-sm text-green-800">Personalise meals with quick preferences. You can skip for now.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select className="rounded-xl border p-3" value={profileStep.budget} onChange={(e) => setProfileStep((s) => ({ ...s, budget: e.target.value }))}>
                <option value="80">Budget: $80 / week</option>
                <option value="120">Budget: $120 / week</option>
                <option value="180">Budget: $180 / week</option>
                <option value="250">Budget: $250+ / week</option>
              </select>
              <select className="rounded-xl border p-3" value={profileStep.activityLevel} onChange={(e) => setProfileStep((s) => ({ ...s, activityLevel: e.target.value }))}>
                <option>Low</option><option>Moderate</option><option>Active</option><option>Very active</option>
              </select>
              <select className="rounded-xl border p-3" value={profileStep.fitnessGoal} onChange={(e) => setProfileStep((s) => ({ ...s, fitnessGoal: e.target.value }))}>
                <option>Eat healthier</option><option>Lose weight</option><option>Maintain weight</option><option>Gain muscle</option>
              </select>
              <select className="rounded-xl border p-3" value={profileStep.cuisinePreferences[0] ?? 'Any cuisine'} onChange={(e) => setProfileStep((s) => ({ ...s, cuisinePreferences: [e.target.value] }))}>
                <option>Any cuisine</option><option>Asian</option><option>Mediterranean</option><option>Indian</option><option>Modern Australian</option>
              </select>
              <div className="sm:col-span-2 rounded-xl border p-3">
                <p className="text-sm font-medium text-green-900">Dietary preferences</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'High protein', 'Low carb', 'Halal'].map((pref) => (
                    <button key={pref} type="button" onClick={() => setProfileStep((s) => ({ ...s, dietaryPreferences: s.dietaryPreferences.includes(pref) ? s.dietaryPreferences.filter((x) => x !== pref) : [...s.dietaryPreferences, pref] }))} className={`rounded-full px-3 py-1 text-xs ${profileStep.dietaryPreferences.includes(pref) ? 'bg-green-700 text-white' : 'bg-emerald-50 text-green-900'}`}>
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 rounded-xl border p-3">
                <p className="text-sm font-medium text-green-900">Allergies</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['None', 'Dairy', 'Gluten', 'Eggs', 'Peanuts', 'Seafood', 'Soy'].map((allergy) => (
                    <button key={allergy} type="button" onClick={() => setProfileStep((s) => ({ ...s, allergies: s.allergies.includes(allergy) ? s.allergies.filter((x) => x !== allergy) : [...s.allergies, allergy] }))} className={`rounded-full px-3 py-1 text-xs ${profileStep.allergies.includes(allergy) ? 'bg-green-700 text-white' : 'bg-emerald-50 text-green-900'}`}>
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => { setProfileModalOpen(false); navigate('/dashboard') }} className="rounded-xl border px-4 py-2 text-green-900">Skip for now</button>
              <button type="button" onClick={() => { setProfileModalOpen(false); navigate('/dashboard') }} className="rounded-xl bg-green-700 px-4 py-2 font-semibold text-white">Save & Continue</button>
            </div>
          </div>
        </div>
      ) : null}

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
