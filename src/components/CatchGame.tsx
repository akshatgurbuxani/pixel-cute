import { useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { PixelGround } from './PixelScene'
import { NudgeButton, PixelButton } from './PixelButton'
import { ArenaCosmos } from './PixelBackground'
import { CardSparkles } from './CardSparkles'
import { APP_COPY } from '../data/sprites'
import { GAME_TIPS, type FallingItem, type GamePhase } from '../hooks/useCatchGame'

interface Props {
  phase: GamePhase
  loveCount: number
  loveGoal: number
  pinkIntensity: number
  playerX: number
  items: FallingItem[]
  bombHit: { x: number; y: number } | null
  deathLine: { bubble: string; title: string; sub: string }
  deathSeq: number
  winLine: { title: string; sub: string }
  winSeq: number
  onStart: () => void
  onMove: (x: number) => void
  onPrime?: () => void
  onDragEnd?: () => void
  className?: string
}

const FLY_EASE = [0.22, 1, 0.36, 1] as const

const VICTORY_SPARKS = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * Math.PI * 2,
  dist: 36 + (i % 4) * 16,
}))

const FIZZLE_OFFSETS = [
  { x: -18, y: -22 },
  { x: 14, y: -18 },
  { x: -10, y: 8 },
  { x: 20, y: 4 },
  { x: 0, y: -28 },
  { x: -22, y: -4 },
  { x: 16, y: 14 },
  { x: -6, y: 18 },
  { x: -28, y: 6 },
  { x: 24, y: -8 },
  { x: -14, y: 22 },
  { x: 8, y: -32 },
]

export function CatchGame({
  phase,
  loveCount,
  loveGoal,
  pinkIntensity,
  playerX,
  items,
  bombHit,
  deathLine,
  deathSeq,
  winLine,
  winSeq,
  onStart,
  onMove,
  onPrime,
  onDragEnd,
  className = '',
}: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const dragPointerRef = useRef<number | null>(null)
  const isPlaying = phase === 'playing'
  const isBombMoment = phase === 'bombHit' || phase === 'gameOver'
  const isVictoryMoment = phase === 'victoryCelebration' || phase === 'victory'
  const isVictoryCelebration = phase === 'victoryCelebration'
  const lovePct = (loveCount / loveGoal) * 100

  const pointerX = useCallback(
    (clientX: number) => {
      const arena = arenaRef.current
      if (!arena || !isPlaying) return
      const rect = arena.getBoundingClientRect()
      onMove(((clientX - rect.left) / rect.width) * 100)
    },
    [onMove, isPlaying],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isPlaying) return
      if ((e.target as HTMLElement).closest('button, .end-card, .intro-card, .lose-ribbon, .win-card')) return
      e.preventDefault()
      dragPointerRef.current = e.pointerId
      arenaRef.current?.setPointerCapture(e.pointerId)
      onPrime?.()
      pointerX(e.clientX)
    },
    [pointerX, isPlaying, onPrime],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPlaying || dragPointerRef.current !== e.pointerId) return
      e.preventDefault()
      pointerX(e.clientX)
    },
    [pointerX, isPlaying],
  )

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (dragPointerRef.current !== e.pointerId) return
      dragPointerRef.current = null
      onDragEnd?.()
    },
    [onDragEnd],
  )

  const nudge = useCallback(
    (dir: -1 | 1) => {
      if (!isPlaying) return
      onPrime?.()
      onMove(playerX + dir * 10)
    },
    [isPlaying, playerX, onMove, onPrime],
  )

  const arenaClass = [
    'catch-arena',
    isPlaying ? 'is-playing' : 'is-idle',
    phase === 'bombHit' ? 'is-bomb-hit' : '',
    phase === 'gameOver' ? 'is-game-over' : '',
    isVictoryMoment ? 'is-victory' : '',
    isVictoryCelebration ? 'is-victory-celebration' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`catch-game-wrap ${className}`.trim()}>
      {phase !== 'gameOver' && phase !== 'victory' && phase !== 'victoryCelebration' && phase !== 'bombHit' && (
        <div className="love-meter-bar">
          <div className="love-meter-label">
            <span>love collected</span>
            <span className="love-count">{loveCount} / {loveGoal} ♡</span>
          </div>
          <div className="love-meter-track">
            <motion.div
              className="love-meter-fill"
              animate={{ width: `${lovePct}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            />
          </div>
        </div>
      )}

      <div className="catch-arena-shell">
        <div className="arena-frame-glow" aria-hidden />
        <div className="arena-corner arena-corner-tl" aria-hidden>✦</div>
        <div className="arena-corner arena-corner-tr" aria-hidden>✦</div>
        <div className="arena-corner arena-corner-bl" aria-hidden>♡</div>
        <div className="arena-corner arena-corner-br" aria-hidden>♡</div>

      <div
        ref={arenaRef}
        className={arenaClass}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <ArenaCosmos />

        <motion.div
          className="pink-wash"
          animate={{ opacity: isPlaying ? pinkIntensity * 0.35 : isVictoryMoment ? 0.5 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        <AnimatePresence>
          {phase === 'bombHit' && (
            <>
              <motion.div
                key="bomb-flash"
                className="bomb-flash"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
              <motion.div
                key="bomb-bloom"
                className="bomb-bloom"
                initial={{ opacity: 0.85, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {isBombMoment && <div className="bomb-mood-wash" aria-hidden />}

        {isVictoryMoment && <div className="victory-mood-wash" aria-hidden />}

        <AnimatePresence>
          {isVictoryCelebration && (
            <>
              <motion.div
                key="victory-flash"
                className="victory-flash"
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              <motion.div
                key="victory-bloom"
                className="victory-bloom"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.95, 0.55], scale: [0.6, 1.35, 1.15] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
              <motion.div
                key="victory-ring"
                className="victory-ring"
                initial={{ opacity: 0.8, scale: 0.3 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

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
          <motion.div
            className="arena-float-star s1"
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✦
          </motion.div>
          <motion.div
            className="arena-float-star s2"
            animate={{ y: [0, 8, 0], opacity: [0.4, 0.95, 0.4], rotate: [0, -120, -240] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            ♡
          </motion.div>
          <motion.div
            className="arena-float-star s3"
            animate={{ y: [0, -6, 0], x: [0, 6, 0], opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          >
            ✧
          </motion.div>
        </div>

        {!isVictoryMoment &&
          items.map((item) => (
            <div
              key={item.id}
              className={`falling-item kind-${item.kind} ${isBombMoment ? 'is-frozen' : ''}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              <PixelSprite id={item.sprite} scale={item.kind === 'bomb' ? 5 : 4} />
            </div>
          ))}

        {phase === 'bombHit' && bombHit && (
          <div className="bomb-fizzle" style={{ left: `${bombHit.x}%`, top: `${bombHit.y}%` }}>
            <motion.div
              className="bomb-shockwave"
              initial={{ opacity: 0.9, scale: 0.2 }}
              animate={{ opacity: 0, scale: 2.4 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
            {FIZZLE_OFFSETS.map((offset, i) => (
              <motion.span
                key={i}
                className="fizzle-puff"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
                animate={{ x: offset.x, y: offset.y, opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: i * 0.02 }}
              />
            ))}
            <motion.div
              className="fizzle-bomb"
              initial={{ scale: 1, opacity: 1, rotate: 0 }}
              animate={{ scale: 1.6, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <PixelSprite id="bomb" scale={5} />
            </motion.div>
          </div>
        )}

        {(isPlaying || phase === 'intro' || isBombMoment || isVictoryMoment) && (
          <div className="player-bunny" style={{ left: `${playerX}%` }}>
            {isBombMoment && (
              <div className="dizzy-stars">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="dizzy-star"
                    style={{ left: `${-18 + i * 18}px`, top: `${-28 - i * 2}px` }}
                    animate={{ rotate: 360, y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
                    transition={{
                      rotate: { duration: 1.8 + i * 0.3, repeat: Infinity, ease: 'linear' },
                      y: { duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' },
                      opacity: { duration: 0.7, repeat: Infinity, delay: i * 0.15 },
                    }}
                  >
                    <PixelSprite id="star" scale={2} />
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              className={`player-bunny-inner ${isVictoryMoment ? 'cutie-hero' : ''}`}
              animate={
                phase === 'bombHit'
                  ? { x: [0, -10, 10, -8, 8, -4, 0], y: [0, 8, 6, 4, 2, 0], rotate: [0, -10, 10, -6, 4, 0] }
                  : phase === 'gameOver'
                    ? { y: 6, rotate: -12, x: 0, scale: 1 }
                    : isVictoryMoment
                      ? { y: [0, -14, 0, -10, 0], rotate: [0, 5, -5, 3, 0], scale: 1, x: 0 }
                      : phase === 'intro'
                        ? { y: [0, -8, 0], rotate: 0, x: 0, scale: 1 }
                        : { y: 0, rotate: 0, x: 0, scale: 1 }
              }
              transition={
                phase === 'bombHit'
                  ? { duration: 0.85, ease: 'easeInOut' }
                  : phase === 'gameOver'
                    ? { type: 'spring', stiffness: 280, damping: 18 }
                    : isVictoryMoment
                      ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                      : phase === 'intro'
                        ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                        : undefined
              }
            >
              <PixelSprite id="bunny" scale={6} />
            </motion.div>

            <AnimatePresence>
              {isVictoryCelebration && (
                <div className="victory-sparks" aria-hidden>
                  {VICTORY_SPARKS.map((s, i) => (
                    <motion.span
                      key={i}
                      className="victory-spark"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                      animate={{
                        x: Math.cos(s.angle) * s.dist,
                        y: Math.sin(s.angle) * s.dist - 24,
                        opacity: 0,
                        scale: 1.3,
                        rotate: (i % 2 === 0 ? 1 : -1) * 40,
                      }}
                      transition={{ duration: 1, delay: i * 0.035, ease: 'easeOut' }}
                    >
                      ♥
                    </motion.span>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'bombHit' && (
                <motion.div
                  key={`death-bubble-${deathSeq}`}
                  className="bunny-speech"
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {deathLine.bubble}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <PixelGround />

        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              key="intro"
              className="arena-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="intro-card"
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: [0, 1, -1, 0] }}
                transition={{
                  opacity: { duration: 0.35 },
                  y: { type: 'spring', stiffness: 320, damping: 22 },
                  scale: { type: 'spring', stiffness: 320, damping: 22 },
                  rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <CardSparkles />
                <div className="intro-icons">
                  <PixelSprite id="heart" scale={3} />
                  <span className="intro-vs">vs</span>
                  <PixelSprite id="bomb" scale={3} />
                </div>
                <p className="intro-card-title">catch the love!</p>
                <p className="intro-card-sub">{APP_COPY.introSub}</p>
                <PixelButton label="start ♡" onClick={onStart} />
              </motion.div>
            </motion.div>
          )}

          {phase === 'gameOver' && (
            <motion.div
              key={`lose-${deathSeq}`}
              className="lose-ribbon"
              initial={{ y: 56, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PixelSprite id="bomb" scale={3} />
              <div className="lose-ribbon-text">
                <p className="lose-ribbon-title">{deathLine.title}</p>
                <p className="lose-ribbon-sub">{deathLine.sub}</p>
              </div>
              <PixelButton label="try again" onClick={onStart} />
            </motion.div>
          )}

          {isVictoryMoment && (
            <motion.div
              key={`win-${winSeq}`}
              className="arena-overlay win-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <motion.div
                key={`win-card-${winSeq}`}
                className="win-card"
                initial={{ opacity: 0, scale: 0.5, y: 30, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, y: [0, -6, 0], rotate: [0, 2, -1, 0] }}
                transition={{
                  delay: 0.9,
                  duration: 0.7,
                  ease: FLY_EASE,
                  y: { delay: 1.2, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { delay: 1.6, duration: 0.5 },
                }}
              >
                <CardSparkles />
                <PixelSprite id="heart" scale={5} />
                <p className="win-card-title">{winLine.title}</p>
                <p className="win-card-sub">{winLine.sub}</p>
                {phase === 'victory' && (
                  <PixelButton label="play again ♡" onClick={onStart} variant="victory" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {isPlaying && (
        <div className="mobile-controls">
          <NudgeButton dir={-1} onClick={() => nudge(-1)} />
          <span className="control-hint">{GAME_TIPS[loveCount % GAME_TIPS.length]}</span>
          <NudgeButton dir={1} onClick={() => nudge(1)} />
        </div>
      )}
    </div>
  )
}
