import type { BlogArticle } from '../types'

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'weekly-meal-planning-guide',
    title: 'How to Plan a Week of Healthy Meals in 20 Minutes',
    category: 'Meal Planning',
    publishDate: 'May 2026',
    summary:
      'A practical framework to build balanced weekly meals quickly while reducing unnecessary grocery spend.',
    image:
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Planning one week ahead is one of the highest-impact habits for healthier eating and lower stress. Start by choosing a fixed planning window and reviewing what is already in your pantry before adding new items.',
      'Use a simple meal matrix: two quick meals, two comfort meals, two high-protein options, and one flexible day. This makes variety easier without overwhelming decisions every night.',
      'Group ingredients across recipes to reduce waste. If two meals use spinach, tomatoes, or herbs, buy once and reuse across dishes to optimise both cost and freshness.',
    ],
  },
  {
    id: 'reduce-food-waste-at-home',
    title: '7 Smart Ways to Reduce Food Waste at Home',
    category: 'Sustainability',
    publishDate: 'April 2026',
    summary:
      'From pantry-first planning to smart leftovers, discover realistic habits for wasting less and saving more.',
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Food waste usually starts with overbuying and poor visibility. Keep a short rotating list of perishable items and build two recipes around them each week.',
      'Store ingredients by urgency, not category. Place high-priority produce at eye level in the fridge so it is used first.',
      'Transform leftovers with intention. Roasted vegetables become wraps, grains become bowls, and proteins become soups or sandwiches.',
    ],
  },
  {
    id: 'allergy-friendly-meal-personalisation',
    title: 'Designing Allergy-Friendly Weekly Menus with AI',
    category: 'Personalisation',
    publishDate: 'March 2026',
    summary:
      'A safer and smarter way to tailor weekly recipes around allergies, nutrition goals, and dietary needs.',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Allergy-aware planning should never feel like compromise. AI-assisted filtering helps remove unsafe ingredients while preserving variety and flavour profiles.',
      'Set non-negotiables first, then optimise around them: allergens, preferred cuisines, calorie targets, and weekly prep time.',
      'A strong plan includes backup swaps. For each key ingredient, maintain one nutritional and one flavour-forward substitute.',
    ],
  },
  {
    id: 'grocery-budget-optimisation',
    title: 'Budget-Friendly Grocery Strategy for Busy Households',
    category: 'Grocery Optimisation',
    publishDate: 'February 2026',
    summary:
      'Learn how to structure your list and meal priorities to reduce bill shock without sacrificing quality.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Budget optimisation starts with category caps and meal priority tiers. Split shopping into essentials, flexible add-ons, and optional convenience items.',
      'Use one anchor protein and one anchor vegetable across multiple recipes to improve cost efficiency without repetitive meals.',
      'Track spending by week, not by trip. Weekly visibility gives clearer feedback loops for better planning decisions.',
    ],
  },
]