import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { ANIMAL_SPRITES, type SpriteId } from '../data/sprites'

export interface SpawnedCutie {
  id: number
  sprite: SpriteId
  x: number
  y: number
}

interface Props {
  cuties: SpawnedCutie[]
}

export function SpawnedCuties({ cuties }: Props) {
  return (
    <div className="spawned-cuties" aria-hidden>
      <AnimatePresence>
        {cuties.map((c) => (
          <motion.div
            key={c.id}
            className="spawned-cutie"
            style={{ left: c.x, top: c.y }}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: [20, -40, -80] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { type: 'spring', stiffness: 500, damping: 15 },
              opacity: { duration: 0.2 },
              y: { duration: 2.5, ease: 'easeOut' },
            }}
          >
            <PixelSprite id={c.sprite} scale={4} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface BubbleProps {
  message: string
}

export function SpeechBubble({ message }: BubbleProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        className="speech-bubble"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <span>{message}</span>
        <div className="bubble-tail" />
      </motion.div>
    </AnimatePresence>
  )
}

export function useRotatingMessage(messages: string[], interval = 3500) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), interval)
    return () => clearInterval(id)
  }, [messages, interval])
  return messages[index]
}

export function randomSprite(): SpriteId {
  return ANIMAL_SPRITES[Math.floor(Math.random() * ANIMAL_SPRITES.length)]
}
