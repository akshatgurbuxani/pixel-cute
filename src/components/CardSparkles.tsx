import { motion } from 'framer-motion'
import { CARD_SPARKLES } from '../data/spaceDecor'

const ORBIT = [
  { x: -52, y: -38, r: 0 },
  { x: 58, y: -28, r: 45 },
  { x: -48, y: 42, r: -30 },
  { x: 54, y: 36, r: 60 },
  { x: 0, y: -58, r: 90 },
  { x: -62, y: 4, r: -60 },
  { x: 64, y: 8, r: 120 },
  { x: 4, y: 52, r: -90 },
]

interface Props {
  className?: string
}

export function CardSparkles({ className = '' }: Props) {
  return (
    <div className={`card-sparkles ${className}`.trim()} aria-hidden>
      {CARD_SPARKLES.map((s, i) => {
        const orbit = ORBIT[i % ORBIT.length]
        return (
          <motion.span
            key={s.id}
            className="card-sparkle"
            style={{ left: `${s.left}%`, top: `${s.top}%` }}
            animate={{
              x: [0, orbit.x * 0.35, orbit.x, orbit.x * 0.6, 0],
              y: [0, orbit.y * 0.35, orbit.y, orbit.y * 0.55, 0],
              opacity: [0.35, 1, 0.7, 1, 0.35],
              rotate: [0, orbit.r, orbit.r * 1.2, orbit.r * 0.8, 0],
              scale: [0.8, 1.15, 1, 1.1, 0.8],
            }}
            transition={{
              duration: 4.5 + (i % 3) * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: s.delay,
            }}
          >
            {s.char}
          </motion.span>
        )
      })}
    </div>
  )
}
