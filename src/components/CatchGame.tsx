import { useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PixelSprite } from './PixelSprite'
import { PixelGround } from './PixelScene'
import { NudgeButton, PixelButton } from './PixelButton'
import { HER_NAME } from '../data/sprites'
import { GAME_TIPS, type FallingItem, type GamePhase } from '../hooks/useCatchGame'

interface Props {
  phase: GamePhase
  loveCount: number
  loveGoal: number
  pinkIntensity: number
  playerX: number
  items: FallingItem[]
  bombHit: { x: number; y: number } | null
  onStart: () => void
  onMove: (x: number) => void
  className?: string
}

const FLY_EASE = [0.22, 1, 0.36, 1] as const

const FIZZLE_OFFSETS = [
  { x: -18, y: -22 },
  { x: 14, y: -18 },
  { x: -10, y: 8 },
  { x: 20, y: 4 },
  { x: 0, y: -28 },
  { x: -22, y: -4 },
  { x: 16, y: 14 },
  { x: -6, y: 18 },
]

export function CatchGame({
  phase,
  loveCount,
  loveGoal,
  pinkIntensity,
  playerX,
  items,
  bombHit,
  onStart,
  onMove,
  className = '',
}: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
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
      arenaRef.current?.setPointerCapture(e.pointerId)
      pointerX(e.clientX)
    },
    [pointerX, isPlaying],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPlaying) return
      if (e.buttons > 0 || e.pointerType === 'touch') pointerX(e.clientX)
    },
    [pointerX, isPlaying],
  )

  const nudge = useCallback(
    (dir: -1 | 1) => {
      if (!isPlaying) return
      onMove(playerX + dir * 10)
    },
    [isPlaying, playerX, onMove],
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

      <div
        ref={arenaRef}
        className={arenaClass}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <motion.div
          className="pink-wash"
          animate={{ opacity: isPlaying ? pinkIntensity * 0.35 : isVictoryMoment ? 0.5 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        <AnimatePresence>
          {phase === 'bombHit' && (
            <motion.div
              key="bomb-flash"
              className="bomb-flash"
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {isBombMoment && <div className="bomb-mood-wash" aria-hidden />}

        {isVictoryMoment && <div className="victory-mood-wash" aria-hidden />}

        <div className="arena-sky">
          <motion.div
            className="arena-cloud c1"
            animate={{ x: [0, 18, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PixelSprite id="cloud" scale={4} />
          </motion.div>
          <motion.div
            className="arena-cloud c2"
            animate={{ x: [0, -14, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PixelSprite id="cloud" scale={3} />
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
              {phase === 'bombHit' && (
                <motion.div
                  key="oops-bubble"
                  className="bunny-speech"
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  oops!
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="intro-icons">
                  <PixelSprite id="heart" scale={3} />
                  <span className="intro-vs">vs</span>
                  <PixelSprite id="bomb" scale={3} />
                </div>
                <p className="intro-card-title">catch the love!</p>
                <p className="intro-card-sub">dodge bombs · for {HER_NAME}</p>
                <PixelButton label="start ♡" onClick={onStart} />
              </motion.div>
            </motion.div>
          )}

          {phase === 'gameOver' && (
            <motion.div
              key="lose"
              className="lose-ribbon"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.05 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PixelSprite id="bomb" scale={3} />
              <div className="lose-ribbon-text">
                <p className="lose-ribbon-title">that was a bomb</p>
                <p className="lose-ribbon-sub">catch love next time ♡</p>
              </div>
              <PixelButton label="try again" onClick={onStart} />
            </motion.div>
          )}

          {isVictoryMoment && (
            <motion.div
              key="win"
              className="arena-overlay win-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <motion.div
                className="win-card"
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.65, ease: FLY_EASE }}
              >
                <PixelSprite id="heart" scale={5} />
                <p className="win-card-title">hugs received ♡</p>
                <p className="win-card-sub">yay {HER_NAME}!!</p>
                {phase === 'victory' && (
                  <PixelButton label="play again ♡" onClick={onStart} variant="victory" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isPlaying && (
        <div className="mobile-controls">
          <NudgeButton dir={-1} onClick={() => nudge(-1)} />
          <span className="control-hint">{GAME_TIPS[loveCount % GAME_TIPS.length]}</span>
          <NudgeButton dir={1} onClick={() => nudge(1)} />
        </div>
      )}

      {phase === 'intro' && <p className="idle-hint">♡ = catch · 💣 = dodge</p>}
    </div>
  )
}
