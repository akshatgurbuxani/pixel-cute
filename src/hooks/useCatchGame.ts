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

export const LOVE_GOAL = 1

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
  onMove?: (deltaX: number) => void
}

export function useCatchGame(callbacks: GameCallbacks) {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [loveCount, setLoveCount] = useState(0)
  const [playerX, setPlayerX] = useState(50)
  const [items, setItems] = useState<FallingItem[]>([])
  const [bombHit, setBombHit] = useState<{ x: number; y: number } | null>(null)
  const [deathLine, setDeathLine] = useState<DeathLine>(DEATH_LINES[0])
  const [deathSeq, setDeathSeq] = useState(0)
  const [winLine, setWinLine] = useState<WinLine>(WIN_LINES[0])
  const [winSeq, setWinSeq] = useState(0)
  const lastDeathIndexRef = useRef(-1)
  const lastWinIndexRef = useRef(-1)

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

  const rollDeathLine = useCallback((): DeathLine => {
    const count = DEATH_LINES.length
    if (count <= 1) return DEATH_LINES[0]
    let idx = Math.floor(Math.random() * count)
    while (idx === lastDeathIndexRef.current) {
      idx = Math.floor(Math.random() * count)
    }
    lastDeathIndexRef.current = idx
    return DEATH_LINES[idx]
  }, [])

  const rollWinLine = useCallback((): WinLine => {
    const count = WIN_LINES.length
    if (count <= 1) return WIN_LINES[0]
    let idx = Math.floor(Math.random() * count)
    while (idx === lastWinIndexRef.current) {
      idx = Math.floor(Math.random() * count)
    }
    lastWinIndexRef.current = idx
    return WIN_LINES[idx]
  }, [])

  const triggerBombDeath = useCallback(
    (x: number, y: number) => {
      const r = refs.current
      if (r.phase !== 'playing') return

      const line = rollDeathLine()
      r.phase = 'bombHit'
      r.callbacks.onBomb()

      setBombHit({ x, y })
      setDeathLine(line)
      setDeathSeq((n) => n + 1)
      setPhase('bombHit')
    },
    [rollDeathLine],
  )

  const triggerVictory = useCallback(() => {
    const r = refs.current
    if (r.phase !== 'playing') return

    const line = rollWinLine()
    r.phase = 'victoryCelebration'
    r.items = []
    r.callbacks.onVictory()

    setItems([])
    setWinLine(line)
    setWinSeq((n) => n + 1)
    setPhase('victoryCelebration')
  }, [rollWinLine])

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
    const prev = refs.current.playerX
    const next = Math.max(8, Math.min(92, x))
    const delta = next - prev
    refs.current.playerX = next
    setPlayerX(next)
    if (Math.abs(delta) > 0.01) refs.current.callbacks.onMove?.(delta)
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
                triggerBombDeath(item.x, item.y)
                return false
              }

              r.loveCount += 1
              r.callbacks.onCatchLove()
              setLoveCount(r.loveCount)

              if (r.loveCount >= r.loveGoal) {
                triggerVictory()
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
  }, [triggerBombDeath, triggerVictory])

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
    triggerVictory()
  }, [phase, loveCount, triggerVictory])

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
    deathLine,
    deathSeq,
    winLine,
    winSeq,
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

export const DEATH_LINES = [
  { bubble: 'oops!', title: 'that was a bomb', sub: 'catch love next time ♡' },
  { bubble: 'oh no!!', title: 'oh no you died', sub: 'try again cutie ♡' },
  { bubble: 'nooo!!', title: 'boom goes the bunny', sub: 'dodge the bombs next time ♡' },
  { bubble: 'yikes!', title: 'not the bomb!!', sub: 'catch love next time ♡' },
  { bubble: 'uh oh!', title: 'wrong catch buddy', sub: 'you got this ♡' },
  { bubble: 'boom!', title: 'so close... not', sub: 'one more try ♡' },
  { bubble: 'eek!', title: 'that was explosive', sub: 'catch love next time ♡' },
  { bubble: '💣', title: 'bomb got you', sub: 'dodge next time ♡' },
] as const

export type DeathLine = (typeof DEATH_LINES)[number]

export const WIN_LINES = [
  { title: 'hugs received ♡', sub: 'yes queen you won!' },
  { title: 'you did it!!', sub: 'absolute legend ♡' },
  { title: 'max love!!', sub: 'my sweetheart wins again' },
  { title: 'victory dance!!', sub: 'the bunny is so proud' },
  { title: 'love meter full ♡', sub: 'queen behavior honestly' },
  { title: 'woohoo!!', sub: 'catch master unlocked' },
  { title: 'so many hugs ♡', sub: "you're unstoppable" },
  { title: 'winner winner ♡', sub: 'cutest win ever' },
] as const

export type WinLine = (typeof WIN_LINES)[number]
