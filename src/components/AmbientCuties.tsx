import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { SPRITE_IDS, type SpriteId } from '../data/sprites'

const CUTIE_SPRITES = SPRITE_IDS.filter((id) => id !== 'bomb')

function rand(seed: number) {
  const x = Math.sin(seed * 43758.5453) * 10000
  return x - Math.floor(x)
}

export type CutieMood = 'idle' | 'awake'

interface CutieDef {
  id: string
  sprite: SpriteId
  x: number
  y: number
  idleScale: number
  heroScale: number
  opacity: number
  orbitX: number
  orbitY: number
  spin: number
  delay: number
  duration: number
}

interface Props {
  mood: CutieMood
  count?: number
  seed?: number
}

/** Spread cuties across the full viewport — edges included, no clustering */
function buildCuties(count: number, seed: number): CutieDef[] {
  const cols = Math.ceil(Math.sqrt(count * 1.55))
  const rows = Math.ceil(count / cols)
  const items: CutieDef[] = []

  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const r = rand(seed + i * 17)
    const r2 = rand(seed + i * 41)
    const r3 = rand(seed + i * 59)

    const gx = cols <= 1 ? 0.5 : col / (cols - 1)
    const gy = rows <= 1 ? 0.5 : row / (rows - 1)

    items.push({
      id: `cutie-${seed}-${i}`,
      sprite: CUTIE_SPRITES[Math.floor(r * CUTIE_SPRITES.length)],
      x: gx * 112 - 6 + (r - 0.5) * 22,
      y: gy * 94 + 3 + (r2 - 0.5) * 20,
      idleScale: 2 + Math.floor(r2 * 2),
      heroScale: 5 + Math.floor(r3 * 2),
      opacity: 0.32 + r2 * 0.22,
      orbitX: 22 + r * 38,
      orbitY: 16 + r2 * 28,
      spin: (r > 0.5 ? 1 : -1) * (8 + r3 * 14),
      delay: i * 0.09 + r * 0.15,
      duration: 2.2 + r2 * 1.8,
    })
  }

  return items
}

export function AmbientCuties({ mood, count = 26, seed = 1 }: Props) {
  const cuties = useMemo(() => buildCuties(count, seed), [count, seed])
  const awake = mood === 'awake'

  return (
    <div className={`ambient-cuties ${awake ? 'is-awake' : ''}`} aria-hidden>
      {cuties.map((c) => (
        <motion.div
          key={c.id}
          className={`ambient-cutie ${awake ? 'cutie-hero' : 'cutie-idle'}`}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          initial={false}
          animate={
            awake
              ? {
                  x: [0, c.orbitX, -c.orbitX * 0.55, c.orbitX * 0.75, -c.orbitX * 0.35, 0],
                  y: [0, -c.orbitY, c.orbitY * 0.45, -c.orbitY * 0.65, c.orbitY * 0.25, 0],
                  rotate: [0, c.spin, -c.spin * 0.6, c.spin * 0.85, -c.spin * 0.4, 0],
                  opacity: 1,
                }
              : { x: 0, y: 0, rotate: 0, opacity: c.opacity }
          }
          transition={
            awake
              ? {
                  x: { duration: c.duration, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
                  y: { duration: c.duration, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
                  rotate: { duration: c.duration, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
                  opacity: { duration: 0.35, ease: 'easeOut' },
                }
              : { duration: 0.45, ease: 'easeOut' }
          }
        >
          <motion.div
            className="cutie-sprite-wrap"
            animate={
              awake
                ? { scale: c.heroScale / c.idleScale }
                : { scale: 1 }
            }
            transition={
              awake
                ? { type: 'spring', stiffness: 420, damping: 18, delay: c.delay * 0.5 }
                : { duration: 0.35 }
            }
          >
            <PixelSprite id={c.sprite} scale={c.idleScale} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
