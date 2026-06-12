import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BlogPreviewSection } from '../components/sections/BlogPreviewSection'
import { FeatureShowcaseSection } from '../components/sections/FeatureShowcaseSection'
import { HeroSection } from '../components/sections/HeroSection'
import { ReviewsSection } from '../components/sections/ReviewsSection'
import { TrendingMealsSection } from '../components/sections/TrendingMealsSection'
import { WhyChooseUsSection } from '../components/sections/WhyChooseUsSection'
import { scrollToSection } from '../utils/scrollToSection'

type RouteState = {
  scrollTo?: string
}

export const LandingPage = () => {
  const location = useLocation()

  useEffect(() => {
    const state = location.state as RouteState | null
    if (state?.scrollTo) {
      window.setTimeout(() => {
        scrollToSection(state.scrollTo as string)
      }, 80)
    }
  }, [location.state])

  return (
    <>
      <HeroSection />
      <TrendingMealsSection />
      <FeatureShowcaseSection />
      <WhyChooseUsSection />
      <BlogPreviewSection />
      <ReviewsSection />
    </>
  )
}
