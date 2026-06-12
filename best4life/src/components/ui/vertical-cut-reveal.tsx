'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { Transition } from 'framer-motion'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

type TextProps = {
  children: React.ReactNode
  reverse?: boolean
  transition?: Transition
  splitBy?: 'words' | 'characters' | 'lines' | string
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number
  containerClassName?: string
  wordLevelClassName?: string
  elementLevelClassName?: string
  onClick?: () => void
  onStart?: () => void
  onComplete?: () => void
  autoStart?: boolean
}

export interface VerticalCutRevealRef {
  startAnimation: () => void
  reset: () => void
}

const VerticalCutReveal = forwardRef<VerticalCutRevealRef, TextProps>(
  (
    {
      children,
      reverse = false,
      transition = { type: 'spring', stiffness: 190, damping: 22 },
      splitBy = 'words',
      staggerDuration = 0.2,
      staggerFrom = 'first',
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onClick,
      onStart,
      onComplete,
      autoStart = true,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null)
    const text = typeof children === 'string' ? children : (children?.toString() ?? '')
    const [isAnimating, setIsAnimating] = useState(false)

    const splitIntoCharacters = (value: string): string[] => Array.from(value)

    const tokens = useMemo(() => {
      if (splitBy === 'lines') return text.split('\n')
      if (splitBy === 'characters') return splitIntoCharacters(text)
      if (splitBy === 'words') return text.split(' ')
      return text.split(splitBy)
    }, [text, splitBy])

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total = tokens.length
        if (staggerFrom === 'first') return index * staggerDuration
        if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration
        if (staggerFrom === 'center') {
          const center = Math.floor(total / 2)
          return Math.abs(center - index) * staggerDuration
        }
        if (staggerFrom === 'random') return Math.floor(Math.random() * total) * staggerDuration
        return Math.abs(staggerFrom - index) * staggerDuration
      },
      [tokens.length, staggerFrom, staggerDuration],
    )

    const startAnimation = useCallback(() => {
      setIsAnimating(true)
      onStart?.()
    }, [onStart])

    useImperativeHandle(ref, () => ({
      startAnimation,
      reset: () => setIsAnimating(false),
    }))

    useEffect(() => {
      if (autoStart) startAnimation()
    }, [autoStart, startAnimation])

    return (
      <span
        ref={containerRef}
        className={cn('flex flex-wrap whitespace-pre-wrap', splitBy === 'lines' && 'flex-col', containerClassName)}
        onClick={onClick}
      >
        <span className="sr-only">{text}</span>
        {tokens.map((token, index) => (
          <span key={`${token}-${index}`} aria-hidden="true" className={cn('inline-flex overflow-hidden', wordLevelClassName)}>
            <motion.span
              initial={{ y: reverse ? '-100%' : '100%' }}
              animate={isAnimating ? { y: 0 } : { y: reverse ? '-100%' : '100%' }}
              transition={{ ...transition, delay: Number((transition as { delay?: number })?.delay || 0) + getStaggerDelay(index) }}
              onAnimationComplete={index === tokens.length - 1 ? onComplete : undefined}
              className={cn('inline-block', elementLevelClassName)}
            >
              {token}
              {splitBy === 'words' && index !== tokens.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </span>
    )
  },
)

VerticalCutReveal.displayName = 'VerticalCutReveal'

export { VerticalCutReveal }
