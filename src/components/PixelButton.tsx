import { motion } from 'framer-motion'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'victory'
}

export function PixelButton({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <motion.button
      type="button"
      className={`pixel-btn ${variant}`}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerDown={(e) => e.stopPropagation()}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 1 }}
    >
      <span className="pixel-btn-shimmer" aria-hidden />
      {label}
    </motion.button>
  )
}

export function NudgeButton({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      className="nudge-btn"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={dir === -1 ? 'Move left' : 'Move right'}
      whileTap={{ scale: 0.9 }}
    >
      {dir === -1 ? '◀' : '▶'}
    </motion.button>
  )
}
