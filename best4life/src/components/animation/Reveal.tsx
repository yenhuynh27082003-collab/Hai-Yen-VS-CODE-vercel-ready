import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Props = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const Reveal = ({ children, className, style }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}