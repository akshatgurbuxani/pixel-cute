import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { ANIMAL_SPRITES, type SpriteId } from '../data/sprites'

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

/**
 * Place cuties only in side/edge bands — never across the center play column
 * so they can't clutter the arena on phones.
 */
function buildCuties(count: number, seed: number): CutieDef[] {
  const items: CutieDef[] = []

  for (let i = 0; i < count; i++) {
    const r = rand(seed + i * 17)
    const r2 = rand(seed + i * 41)
    const r3 = rand(seed + i * 59)

    // Alternate left strip / right strip / top band / bottom band
    const band = i % 4
    let x: number
    let y: number
    if (band === 0) {
      x = 2 + r * 12
      y = 8 + r2 * 84
    } else if (band === 1) {
      x = 86 + r * 12
      y = 8 + r2 * 84
    } else if (band === 2) {
      x = 8 + r * 84
      y = 2 + r2 * 10
    } else {
      x = 8 + r * 84
      y = 88 + r2 * 10
    }

    items.push({
      id: `cutie-${seed}-${i}`,
      sprite: ANIMAL_SPRITES[Math.floor(r * ANIMAL_SPRITES.length)],
      x,
      y,
      idleScale: 2 + Math.floor(r2 * 2),
      heroScale: 5 + Math.floor(r3 * 2),
      opacity: 0.45 + r2 * 0.25,
      orbitX: 10 + r * 18,
      orbitY: 8 + r2 * 14,
      spin: (r > 0.5 ? 1 : -1) * (6 + r3 * 10),
      delay: i * 0.1 + r * 0.2,
      duration: 2.8 + r2 * 2,
    })
  }

  return items
}

export const AmbientCuties = memo(function AmbientCuties({
  mood,
  count = 12,
  seed = 1,
}: Props) {
  const cuties = useMemo(() => buildCuties(count, seed), [count, seed])
  const awake = mood === 'awake'

  return (
    <div className={`ambient-cuties ${awake ? 'is-awake' : ''}`} aria-hidden>
      {cuties.map((c) =>
        awake ? (
          <motion.div
            key={c.id}
            className="ambient-cutie cutie-hero"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            initial={false}
            animate={{
              x: [0, c.orbitX, -c.orbitX * 0.55, c.orbitX * 0.75, -c.orbitX * 0.35, 0],
              y: [0, -c.orbitY, c.orbitY * 0.45, -c.orbitY * 0.65, c.orbitY * 0.25, 0],
              rotate: [0, c.spin, -c.spin * 0.6, c.spin * 0.85, -c.spin * 0.4, 0],
              opacity: 1,
            }}
            transition={{
              x: { duration: c.duration, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
              y: { duration: c.duration, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
              rotate: { duration: c.duration, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
              opacity: { duration: 0.35, ease: 'easeOut' },
            }}
          >
            <div
              className="cutie-sprite-wrap"
              style={{ transform: `scale(${c.heroScale / c.idleScale})` }}
            >
              <PixelSprite id={c.sprite} scale={c.idleScale} />
            </div>
          </motion.div>
        ) : (
          <div
            key={c.id}
            className="ambient-cutie cutie-idle"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              opacity: c.opacity,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration * 1.8}s`,
              ['--cutie-ox' as string]: `${c.orbitX * 0.16}px`,
              ['--cutie-oy' as string]: `${c.orbitY * 0.12}px`,
              ['--cutie-spin' as string]: `${c.spin * 0.12}deg`,
            }}
          >
            <PixelSprite id={c.sprite} scale={c.idleScale} />
          </div>
        ),
      )}
    </div>
  )
})
