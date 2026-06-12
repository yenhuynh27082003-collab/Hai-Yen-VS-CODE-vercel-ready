import type { FeatureItem } from '../types'

export const FEATURES: FeatureItem[] = [
  {
    id: 'feature-smart-planning',
    title: 'Smart Meal Planning',
    shortLabel: 'AI Smart Planner',
    description:
      'Get an intelligent weekly meal plan built around your time, preferences, and household habits.',
    icon: 'Brain',
  },
  {
    id: 'feature-cost-optimisation',
    title: 'Grocery Cost Optimisation',
    shortLabel: 'Spend Less, Eat Better',
    description:
      'Best4Life compares meal combinations and list grouping so you can shop efficiently without overspending.',
    icon: 'PiggyBank',
  },
  {
    id: 'feature-pantry-tracking',
    title: 'Pantry Inventory Tracking',
    shortLabel: 'Waste Less Food',
    description:
      'Track what is in your pantry and consume ingredients in time with proactive meal suggestions.',
    icon: 'PackageSearch',
  },
  {
    id: 'feature-health-personalisation',
    title: 'Health & Allergy Personalisation',
    shortLabel: 'Built for Your Health Goals',
    description:
      'Filter recipes by allergies, nutrition goals, and lifestyle preferences with adaptive recommendations.',
    icon: 'HeartPulse',
  },
]