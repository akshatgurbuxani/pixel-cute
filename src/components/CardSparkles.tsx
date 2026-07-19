import { CARD_SPARKLES } from '../data/spaceDecor'

interface Props {
  className?: string
}

/** Hearts only — no star/X glyphs. CSS motion, no Framer thrash. */
export function CardSparkles({ className = '' }: Props) {
  return (
    <div className={`card-sparkles ${className}`.trim()} aria-hidden>
      {CARD_SPARKLES.map((s) => (
        <span
          key={s.id}
          className="card-sparkle css-heart"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ♡
        </span>
      ))}
    </div>
  )
}
