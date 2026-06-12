import NumberFlow from '@number-flow/react'
import { CheckCheck, HeartPulse, Leaf, PiggyBank } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from './card'
import { TimelineContent } from './timeline-animation'
import { VerticalCutReveal } from './vertical-cut-reveal'
import { cn } from '../../utils/cn'

const plans = [
  {
    name: 'Free',
    description: 'For users who want to try basic AI meal planning.',
    price: 0,
    yearlyPrice: 0,
    buttonText: 'Get Started',
    features: [
      { text: 'Basic weekly meal ideas', icon: <HeartPulse size={18} /> },
      { text: 'Limited recipe suggestions', icon: <Leaf size={18} /> },
      { text: 'Manual shopping list', icon: <PiggyBank size={18} /> },
      { text: 'Basic pantry notes', icon: <Leaf size={18} /> },
    ],
    includes: [
      'Free includes:',
      'Beginner-friendly onboarding',
      'Basic health preference setup',
      'Simple weekly planning flow',
      'Web + mobile access',
    ],
  },
  {
    name: 'Plus',
    description: 'For individuals or couples who want smarter weekly planning.',
    price: 9,
    yearlyPrice: 90,
    buttonText: 'Choose Plus',
    features: [
      { text: 'Personalised AI meal plans', icon: <HeartPulse size={18} /> },
      { text: 'Smart grocery list', icon: <Leaf size={18} /> },
      { text: 'Basic price optimisation', icon: <PiggyBank size={18} /> },
      { text: 'Allergy and preference filters', icon: <HeartPulse size={18} /> },
      { text: 'Pantry tracking', icon: <Leaf size={18} /> },
    ],
    includes: [
      'Everything in Free, plus:',
      'Richer AI suggestions',
      'Smarter ingredient matching',
      'Budget planning improvements',
      'Priority feature updates',
    ],
  },
  {
    name: 'Pro',
    description: 'For households who want full meal planning, grocery savings, and pantry automation.',
    price: 19,
    yearlyPrice: 190,
    buttonText: 'Choose Pro',
    popular: true,
    features: [
      { text: 'Advanced AI meal planning', icon: <HeartPulse size={18} /> },
      { text: 'Grocery cost optimisation', icon: <PiggyBank size={18} /> },
      { text: 'Multi-store price comparison', icon: <PiggyBank size={18} /> },
      { text: 'Smart pantry inventory tracking', icon: <Leaf size={18} /> },
      { text: 'Health and allergy personalisation', icon: <HeartPulse size={18} /> },
      { text: 'Family profile support', icon: <Leaf size={18} /> },
    ],
    includes: [
      'Everything in Plus, plus:',
      'Automation-first planning workflow',
      'Premium household-level controls',
      'Enhanced savings intelligence',
      'Priority support',
    ],
  },
]

const PricingSwitch = ({ onSwitch, className }: { onSwitch: (value: string) => void; className?: string }) => {
  const [selected, setSelected] = useState('0')

  const handleSwitch = (value: string) => {
    setSelected(value)
    onSwitch(value)
  }

  return (
    <div className={cn('flex justify-center', className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl border border-brand-200 bg-brand-50/60 p-1">
        <button
          onClick={() => handleSwitch('0')}
          className={cn(
            'relative z-10 h-11 w-fit cursor-pointer rounded-xl px-4 py-1 text-sm font-medium transition-colors sm:px-6 sm:text-base',
            selected === '0' ? 'text-white' : 'text-brand-700 hover:text-brand-900',
          )}
        >
          {selected === '0' && (
            <span className="absolute left-0 top-0 h-11 w-full rounded-xl border border-brand-500 bg-gradient-to-t from-brand-600 via-brand-500 to-brand-400 shadow-sm shadow-brand-500" />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          onClick={() => handleSwitch('1')}
          className={cn(
            'relative z-10 h-11 w-fit cursor-pointer rounded-xl px-4 py-1 text-sm font-medium transition-colors sm:px-6 sm:text-base',
            selected === '1' ? 'text-white' : 'text-brand-700 hover:text-brand-900',
          )}
        >
          {selected === '1' && (
            <span className="absolute left-0 top-0 h-11 w-full rounded-xl border border-brand-500 bg-gradient-to-t from-brand-600 via-brand-500 to-brand-400 shadow-sm shadow-brand-500" />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Save 20%</span>
          </span>
        </button>
      </div>
    </div>
  )
}

export default function PricingSectionBest4Life() {
  const navigate = useNavigate()
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { delay: i * 0.2, duration: 0.45 },
    }),
    hidden: {
      filter: 'blur(8px)',
      y: -12,
      opacity: 0,
    },
  }

  return (
    <section className="section-space bg-brand-50/35 pt-32">
      <div className="container-shell">
        <div className="mx-auto max-w-6xl px-2" ref={pricingRef}>
          <article className="mb-6 max-w-6xl space-y-4 text-left">
            <h2 className="mb-4 max-w-5xl text-4xl font-semibold capitalize leading-tight tracking-tight text-brand-900 md:text-6xl">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.12}
                staggerFrom="first"
                reverse
                containerClassName="justify-start"
                transition={{ type: 'spring', stiffness: 220, damping: 32, delay: 0 }}
              >
                Flexible Best4Life plans for smarter meals and lower grocery bills.
              </VerticalCutReveal>
            </h2>

            <TimelineContent
              as="p"
              animationNum={0}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="max-w-3xl text-sm text-brand-700 md:text-base"
            >
              Pick a monthly or yearly plan built for your household size, wellness goals, and budget optimisation level.
            </TimelineContent>

            <TimelineContent as="div" animationNum={1} timelineRef={pricingRef} customVariants={revealVariants}>
              <PricingSwitch onSwitch={(value) => setIsYearly(Number.parseInt(value) === 1)} className="w-fit" />
            </TimelineContent>
          </article>

          <div className="grid gap-4 py-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <TimelineContent
                key={plan.name}
                as="div"
                animationNum={2 + index}
                timelineRef={pricingRef}
                customVariants={revealVariants}
              >
                <Card
                  className={cn(
                    'relative border border-brand-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
                    plan.popular && 'ring-2 ring-green-500 bg-gradient-to-b from-green-50 to-white',
                  )}
                >
                  <CardHeader className="text-left">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-3xl font-semibold text-brand-900 md:text-2xl xl:text-3xl">{plan.name}</h3>
                      {plan.popular && (
                        <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">Most Popular</span>
                      )}
                    </div>

                    <p className="mb-4 text-sm text-brand-600 md:text-xs xl:text-sm">{plan.description}</p>

                    <div className="flex items-baseline">
                      <span className="text-4xl font-semibold text-brand-900">
                        $
                        <NumberFlow value={isYearly ? plan.yearlyPrice : plan.price} className="text-4xl font-semibold" />
                      </span>
                      <span className="ml-1 text-brand-600">/{isYearly ? 'year' : 'month'}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <button
                      onClick={() => navigate('/signup')}
                      className={cn(
                        'mb-4 w-full rounded-xl border p-4 text-lg font-semibold text-white',
                        'transition-all duration-300 hover:scale-[1.01]',
                        plan.popular
                          ? 'border-green-700 bg-gradient-to-t from-green-700 to-green-600 shadow-lg shadow-green-300/60 hover:from-green-800 hover:to-green-700'
                          : 'border-green-600 bg-gradient-to-t from-green-600 to-green-500 shadow-lg shadow-green-300/50 hover:from-green-700 hover:to-green-600',
                      )}
                    >
                      {plan.buttonText}
                    </button>

                    {plan.name === 'Pro' && <p className="mb-6 text-center text-sm font-medium text-green-700">Try 7 days free-trial</p>}

                    <div className="space-y-3 border-t border-brand-100 pt-4">
                      <h2 className="mb-1 text-lg font-semibold uppercase tracking-wide text-brand-900">Core Features</h2>
                      <div className="space-y-2">
                        {plan.features.map((feature) => (
                          <div key={feature.text} className="flex items-center gap-2 text-sm font-medium text-brand-700">
                            <span className="rounded-md bg-brand-100 p-1.5 text-brand-600">{feature.icon}</span>
                            {feature.text}
                          </div>
                        ))}
                      </div>

                      <h4 className="pt-2 text-sm font-semibold text-brand-900">{plan.includes[0]}</h4>
                      <ul className="space-y-2">
                        {plan.includes.slice(1).map((feature) => (
                          <li key={feature} className="flex items-start text-sm text-brand-700">
                            <span className="mr-3 mt-0.5 grid h-5 w-5 place-content-center rounded-full border border-green-400 bg-white">
                              <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TimelineContent>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-brand-600">
            All plans include secure cloud sync, weekly AI updates, and premium support onboarding.
          </p>
        </div>
      </div>
    </section>
  )
}
