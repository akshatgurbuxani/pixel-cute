import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { ANIMAL_SPRITES, type SpriteId } from '../data/sprites'

function rand(seed: number) {
  const x = Math.sin(seed * 43758.5453) * 10000
  return x - Math.floor(x)
}

interface Cutie {
  id: string
  sprite: SpriteId
  x: number
  y: number
  scale: number
  duration: number
  delay: number
  wobble: number
}

interface Props {
  count: number
  seed: number
  party?: boolean
}

export function DriftingCuties({ count, seed, party = false }: Props) {
  const cuties = useMemo(() => {
    const items: Cutie[] = []
    for (let i = 0; i < count; i++) {
      const r = rand(seed + i * 17)
      items.push({
        id: `drift-${seed}-${i}`,
        sprite: ANIMAL_SPRITES[Math.floor(r * ANIMAL_SPRITES.length)],
        x: rand(seed + i) * 90 + 5,
        y: rand(seed + i + 50) * 70 + 5,
        scale: 3 + Math.floor(r * 3),
        duration: party ? 2.5 + r * 2 : 6 + r * 8,
        delay: r * (party ? 0.5 : 4),
        wobble: (r - 0.5) * (party ? 50 : 30),
      })
    }
    return items
  }, [count, seed, party])

  return (
    <div className="drifting-cuties" aria-hidden>
      {cuties.map((c) => (
        <motion.div
          key={c.id}
          className="drifting-cutie"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          animate={
            party
              ? {
                  y: [0, -28, 12, -22, 18, 0],
                  x: [0, c.wobble * 0.5, -c.wobble * 0.4, c.wobble * 0.35, 0],
                  rotate: [0, c.wobble * 0.35, -c.wobble * 0.25, c.wobble * 0.2, 0],
                  scale: [1, 1.12, 0.95, 1.08, 1],
                }
              : {
                  y: [0, -18, 0, 14, 0],
                  x: [0, c.wobble * 0.3, 0, -c.wobble * 0.2, 0],
                  rotate: [0, c.wobble * 0.15, 0, -c.wobble * 0.1, 0],
                }
          }
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <PixelSprite id={c.sprite} scale={c.scale} />
        </motion.div>
      ))}
    </div>
  )
}
