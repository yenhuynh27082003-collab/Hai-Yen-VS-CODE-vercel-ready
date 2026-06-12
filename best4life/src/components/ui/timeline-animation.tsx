import { motion, type Variants } from 'framer-motion'
import { useEffect, useState, type ElementType, type ReactNode, type RefObject } from 'react'
import { cn } from '../../utils/cn'

type TimelineContentProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  animationNum: number
  timelineRef?: RefObject<HTMLElement>
  className?: string
  customVariants?: Variants
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.12, duration: 0.45 },
  }),
}

export const TimelineContent = <T extends ElementType = 'div'>({
  as,
  children,
  animationNum,
  timelineRef,
  className,
  customVariants,
}: TimelineContentProps<T>) => {
  const [visible, setVisible] = useState(false)
  const Comp = (as ?? 'div') as ElementType

  useEffect(() => {
    const target = timelineRef?.current
    if (!target) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [timelineRef])

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      animate={visible ? 'visible' : 'hidden'}
      variants={customVariants ?? defaultVariants}
      className={cn(className)}
    >
      <Comp>{children}</Comp>
    </motion.div>
  )
}
