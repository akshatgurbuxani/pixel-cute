import { useCallback, useEffect, useMemo } from 'react'
import { CatchGame } from './components/CatchGame'
import { AmbientCuties } from './components/AmbientCuties'
import { PixelBackground } from './components/PixelBackground'
import { APP_COPY } from './data/sprites'
import { useCatchGame } from './hooks/useCatchGame'
import { usePixelSound } from './hooks/usePixelSound'
import { fireVictoryConfetti, fireVictoryFinale } from './hooks/useVictoryConfetti'

export default function App() {
  const { catchSound, bomb, maxHugs, prime, updateSlide, stopSlide, startBgm, stopBgm } = usePixelSound()

  const callbacks = useMemo(
    () => ({
      onCatchLove: () => catchSound(),
      onBomb: () => bomb(),
      onVictory: () => maxHugs(),
      onMove: (deltaX: number) => updateSlide(deltaX),
    }),
    [catchSound, bomb, maxHugs, updateSlide],
  )

  const game = useCatchGame(callbacks)
  const isVictoryCelebration = game.phase === 'victoryCelebration'
  const isVictoryMoment = isVictoryCelebration || game.phase === 'victory'
  const isDeathMoment = game.phase === 'bombHit' || game.phase === 'gameOver'
  const cutieMood = isVictoryMoment ? 'awake' : 'idle'
  // Keep mounted across intro↔playing so animals don't pop/flicker out.
  const showCuties = !isDeathMoment

  useEffect(() => {
    if (game.phase === 'victoryCelebration') fireVictoryConfetti()
    if (game.phase === 'victory') fireVictoryFinale()
  }, [game.phase])

  useEffect(() => {
    if (game.phase === 'playing') {
      void startBgm()
    } else {
      stopBgm()
    }
  }, [game.phase, startBgm, stopBgm])

  useEffect(() => {
    if (game.phase === 'playing') return
    stopSlide()
  }, [game.phase, stopSlide])

  const handleStart = useCallback(() => {
    void prime()
    game.startGame()
  }, [prime, game.startGame])

  const handlePrime = useCallback(() => {
    void prime()
  }, [prime])

  return (
    <div
      className={[
        'app',
        isVictoryMoment ? 'is-victory-blush' : '',
        isVictoryCelebration ? 'is-victory-celebration' : '',
        isDeathMoment ? 'is-death-moment' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <PixelBackground />
      {showCuties && <AmbientCuties mood={cutieMood} count={28} seed={5} />}

      <header className="header header-cosmic">
        <div className="header-stars" aria-hidden>
          <span className="header-star hs1">♡</span>
          <span className="header-star hs2">♡</span>
          <span className="header-star hs3">♥</span>
        </div>
        <p className="header-tag">♡ catch love · dodge bombs ♡</p>
        <h1 className="header-title">{APP_COPY.headerTitle}</h1>
      </header>

      <CatchGame
        phase={game.phase}
        loveCount={game.loveCount}
        loveGoal={game.loveGoal}
        pinkIntensity={game.pinkIntensity}
        playerX={game.playerX}
        items={game.items}
        itemsRef={game.itemsRef}
        playerXRef={game.playerXRef}
        bombHit={game.bombHit}
        deathLine={game.deathLine}
        deathSeq={game.deathSeq}
        winLine={game.winLine}
        winSeq={game.winSeq}
        onStart={handleStart}
        onMove={game.movePlayer}
        onPrime={handlePrime}
        onDragEnd={stopSlide}
        className={isVictoryMoment ? 'is-victory-front' : ''}
      />
    </div>
  )
}
