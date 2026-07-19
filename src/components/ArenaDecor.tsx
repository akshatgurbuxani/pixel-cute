import { memo } from 'react'
import { motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { ArenaCosmos } from './PixelBackground'

/** Static arena décor — must not re-render when falling items update. */
export const ArenaDecor = memo(function ArenaDecor() {
  return (
    <>
      <ArenaCosmos />
      <div className="arena-sky">
        <motion.div
          className="arena-cloud c1"
          animate={{ x: [0, 18, 0], y: [0, -4, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PixelSprite id="cloud" scale={4} />
        </motion.div>
        <motion.div
          className="arena-cloud c2"
          animate={{ x: [0, -14, 0], y: [0, 3, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PixelSprite id="cloud" scale={3} />
        </motion.div>
        <span className="arena-float-star s1 css-float" aria-hidden>♡</span>
        <span className="arena-float-star s2 css-float" aria-hidden>♥</span>
        <span className="arena-float-star s3 css-float" aria-hidden>♡</span>
      </div>
    </>
  )
})
