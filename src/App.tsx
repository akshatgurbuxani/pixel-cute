import { useCallback, useEffect, useMemo } from 'react'
import { CatchGame } from './components/CatchGame'
import { AmbientCuties } from './components/AmbientCuties'
import { PixelBackground } from './components/PixelBackground'
import { HER_NAME } from './data/sprites'
import { useCatchGame } from './hooks/useCatchGame'
import { usePixelSound } from './hooks/usePixelSound'
import { fireVictoryConfetti } from './hooks/useVictoryConfetti'

export default function App() {
  const { catchSound, bomb, maxHugs, prime } = usePixelSound()

  const callbacks = useMemo(
    () => ({
      onCatchLove: () => catchSound(),
      onBomb: () => bomb(),
      onVictory: () => maxHugs(),
    }),
    [catchSound, bomb, maxHugs],
  )

  const game = useCatchGame(callbacks)
  const isVictoryMoment = game.phase === 'victoryCelebration' || game.phase === 'victory'
  const cutieMood = isVictoryMoment ? 'awake' : 'idle'
  const showCuties =
    game.phase === 'intro' ||
    game.phase === 'playing' ||
    isVictoryMoment

  useEffect(() => {
    if (game.phase === 'victoryCelebration') fireVictoryConfetti()
  }, [game.phase])

  const handleStart = useCallback(() => {
    prime()
    game.startGame()
  }, [prime, game.startGame])

  return (
    <div className={`app ${isVictoryMoment ? 'is-victory-blush' : ''}`}>
      <PixelBackground />
      {showCuties && <AmbientCuties mood={cutieMood} count={28} seed={5} />}

      <header className="header">
        <p className="header-tag">♡ catch love · dodge bombs ♡</p>
        <h1 className="header-title">for {HER_NAME}</h1>
      </header>

      <CatchGame
        phase={game.phase}
        loveCount={game.loveCount}
        loveGoal={game.loveGoal}
        pinkIntensity={game.pinkIntensity}
        playerX={game.playerX}
        items={game.items}
        bombHit={game.bombHit}
        onStart={handleStart}
        onMove={game.movePlayer}
        className={isVictoryMoment ? 'is-victory-front' : ''}
      />
    </div>
  )
}
