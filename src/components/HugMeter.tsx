import { motion } from 'framer-motion'
import { HUG_LEVELS } from '../data/sprites'

interface Props {
  level: number
  progress: number
}

export function HugMeter({ level, progress }: Props) {
  const capped = Math.min(level, HUG_LEVELS.length - 1)
  const info = HUG_LEVELS[capped]

  return (
    <div className="hug-meter">
      <div className="hug-meter-label">
        <span>hug level</span>
        <span className="hug-meter-status">{info.emoji} {info.label}</span>
      </div>
      <div className="hug-meter-track">
        <motion.div
          className="hug-meter-fill"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
        {Array.from({ length: HUG_LEVELS.length }).map((_, i) => (
          <div key={i} className={`hug-meter-notch ${i <= level ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  )
}
