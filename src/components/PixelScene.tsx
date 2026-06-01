import { motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'

const SCENE_CHARS = [
  { id: 'bunny', x: '18%', delay: 0, bounce: 12 },
  { id: 'cat' as const, x: '38%', delay: 0.4, bounce: 10 },
  { id: 'bear' as const, x: '58%', delay: 0.8, bounce: 14 },
  { id: 'mushroom' as const, x: '78%', delay: 0.2, bounce: 6 },
]

export function PixelGround() {
  return (
    <div className="pixel-ground" aria-hidden>
      <div className="grass-row">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="grass-tile" />
        ))}
      </div>
      <div className="dirt-row" />
    </div>
  )
}

export function PixelScene() {
  return (
    <div className="pixel-scene">
      <motion.div
        className="scene-cloud scene-cloud-1"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PixelSprite id="cloud" scale={5} />
      </motion.div>
      <motion.div
        className="scene-cloud scene-cloud-2"
        animate={{ x: [0, -25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PixelSprite id="cloud" scale={4} />
      </motion.div>

      <div className="scene-characters">
        {SCENE_CHARS.map((ch) => (
          <div
            key={ch.id}
            className="scene-char pixel-bounce"
            style={{
              left: ch.x,
              animationDelay: `${ch.delay}s`,
              ['--bounce' as string]: `-${ch.bounce}px`,
            }}
          >
            <PixelSprite id={ch.id as 'bunny' | 'cat' | 'bear' | 'mushroom'} scale={5} />
          </div>
        ))}
      </div>

      <PixelGround />
    </div>
  )
}
