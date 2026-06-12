type Props = {
  eyebrow?: string
  title: string
  description?: string
  center?: boolean
}

export const SectionHeader = ({ eyebrow, title, description, center }: Props) => {
  return (
    <div className={center ? 'mx-auto max-w-6xl text-center' : 'max-w-6xl'}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>
      ) : null}
      <h2
        className={
          center
            ? 'mx-auto max-w-5xl font-heading text-3xl font-bold leading-tight tracking-tight text-brand-900 md:text-4xl'
            : 'max-w-5xl font-heading text-3xl font-bold leading-tight tracking-tight text-brand-900 md:text-4xl'
        }
      >
        {title}
      </h2>
      {description ? (
        <p className={center ? 'mx-auto mt-4 max-w-3xl text-base leading-relaxed text-brand-700/90' : 'mt-4 max-w-3xl text-base leading-relaxed text-brand-700/90'}>
          {description}
        </p>
      ) : null}
    </div>
  )
}