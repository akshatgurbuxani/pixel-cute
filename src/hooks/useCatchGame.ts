import { useCallback, useEffect, useRef, useState } from 'react'
import type { SpriteId } from '../data/sprites'

export type GamePhase = 'intro' | 'playing' | 'bombHit' | 'gameOver' | 'victoryCelebration' | 'victory'

export type ItemKind = 'love' | 'bomb'

export interface FallingItem {
  id: number
  x: number
  y: number
  sprite: SpriteId
  kind: ItemKind
  speed: number
  wobble: number
}

export const LOVE_GOAL = 5

const LOVE_SPRITES: SpriteId[] = ['heart', 'flower', 'butterfly', 'star']

function pickItem(loveCount: number): { sprite: SpriteId; kind: ItemKind } {
  if (Math.random() < Math.min(0.28 + loveCount * 0.006, 0.4)) {
    return { sprite: 'bomb', kind: 'bomb' }
  }
  return {
    sprite: LOVE_SPRITES[Math.floor(Math.random() * LOVE_SPRITES.length)],
    kind: 'love',
  }
}

interface GameCallbacks {
  onCatchLove: () => void
  onBomb: () => void
  onVictory: () => void
}

export function useCatchGame(callbacks: GameCallbacks) {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [loveCount, setLoveCount] = useState(0)
  const [playerX, setPlayerX] = useState(50)
  const [items, setItems] = useState<FallingItem[]>([])
  const [bombHit, setBombHit] = useState<{ x: number; y: number } | null>(null)

  const refs = useRef({
    phase: 'intro' as GamePhase,
    playerX: 50,
    items: [] as FallingItem[],
    loveCount: 0,
    loveGoal: LOVE_GOAL,
    nextId: 0,
    spawnTimer: 0,
    raf: 0,
    callbacks,
  })

  refs.current.callbacks = callbacks
  refs.current.loveGoal = LOVE_GOAL

  const pinkIntensity = Math.min(loveCount / LOVE_GOAL, 1)

  const startGame = useCallback(() => {
    const r = refs.current
    r.phase = 'playing'
    r.loveCount = 0
    r.loveGoal = LOVE_GOAL
    r.items = []
    r.playerX = 50
    r.spawnTimer = 0
    setPhase('playing')
    setLoveCount(0)
    setPlayerX(50)
    setItems([])
    setBombHit(null)
  }, [])

  const movePlayer = useCallback((x: number) => {
    refs.current.playerX = Math.max(8, Math.min(92, x))
    setPlayerX(refs.current.playerX)
  }, [])

  useEffect(() => {
    let last = performance.now()

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2)
      last = now
      const r = refs.current

      if (r.phase === 'playing') {
        r.spawnTimer += dt
        if (r.spawnTimer >= Math.max(32, 52 - r.loveCount * 0.8)) {
          r.spawnTimer = 0
          const { sprite, kind } = pickItem(r.loveCount)
          r.items.push({
            id: r.nextId++,
            x: 12 + Math.random() * 76,
            y: -8,
            sprite,
            kind,
            speed: 0.38 + Math.random() * 0.18,
            wobble: (Math.random() - 0.5) * 0.25,
          })
        }

        const catchY = 78
        const catchW = 11

        r.items = r.items.filter((item) => {
          item.y += item.speed * 0.58 * dt
          item.x += item.wobble * dt * 0.12

          if (item.y >= catchY && item.y < catchY + 6) {
            if (Math.abs(item.x - r.playerX) < catchW) {
              if (item.kind === 'bomb') {
                r.phase = 'bombHit'
                r.callbacks.onBomb()
                setBombHit({ x: item.x, y: item.y })
                setPhase('bombHit')
                return false
              }

              r.loveCount += 1
              r.callbacks.onCatchLove()
              setLoveCount(r.loveCount)

              if (r.loveCount >= r.loveGoal) {
                r.phase = 'victoryCelebration'
                r.items = []
                r.callbacks.onVictory()
                setItems([])
                setPhase('victoryCelebration')
              }
              return false
            }
          }

          return item.y <= 108
        })

        setItems([...r.items])
      }

      r.raf = requestAnimationFrame(loop)
    }

    refs.current.raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(refs.current.raf)
  }, [])

  useEffect(() => {
    if (phase !== 'bombHit') return
    const timer = window.setTimeout(() => {
      refs.current.phase = 'gameOver'
      setPhase('gameOver')
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [phase])

  // backup win trigger — catches stale loop / HMR edge cases
  useEffect(() => {
    if (phase !== 'playing' || loveCount < LOVE_GOAL) return
    if (refs.current.phase !== 'playing') return
    refs.current.phase = 'victoryCelebration'
    refs.current.items = []
    refs.current.callbacks.onVictory()
    setItems([])
    setPhase('victoryCelebration')
  }, [phase, loveCount])

  useEffect(() => {
    if (phase !== 'victoryCelebration') return
    const timer = window.setTimeout(() => {
      refs.current.phase = 'victory'
      setPhase('victory')
      setItems([])
    }, 3800)
    return () => window.clearTimeout(timer)
  }, [phase])

  return {
    phase,
    loveCount,
    playerX,
    items,
    bombHit,
    pinkIntensity,
    loveGoal: LOVE_GOAL,
    startGame,
    movePlayer,
  }
}

export const GAME_TIPS = [
  'move the bunny left & right',
  'catch ♡ · dodge 💣',
  'only catch the love!',
  'fill the meter to win',
  'misses are ok!',
]
