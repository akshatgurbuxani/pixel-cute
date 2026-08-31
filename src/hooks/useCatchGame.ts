import { useCallback, useEffect, useRef, useState } from 'react'
import {
  advanceGame,
  clampPlayerX,
  createGameEngineState,
  GAME_RULES,
  type FallingItem,
  type GameEngineState,
} from '../game/catchGameEngine'

export type { FallingItem, ItemKind } from '../game/catchGameEngine'

export type GamePhase =
  | 'intro'
  | 'playing'
  | 'bombHit'
  | 'gameOver'
  | 'victoryCelebration'
  | 'victory'

interface GameCallbacks {
  onCatchLove: () => void
  onBomb: () => void
  onVictory: () => void
  onMove?: (deltaX: number) => void
}

export interface GameFrame {
  items: readonly FallingItem[]
  playerX: number
}

type FrameListener = (frame: GameFrame) => void

const BOMB_REVEAL_DELAY_MS = 1_500
const VICTORY_REVEAL_DELAY_MS = 3_800

function differentRandomLine<T>(lines: readonly T[], previousIndex: number): [T, number] {
  if (lines.length === 1) return [lines[0], 0]

  let index = Math.floor(Math.random() * lines.length)
  while (index === previousIndex) index = Math.floor(Math.random() * lines.length)
  return [lines[index], index]
}

export function useCatchGame(callbacks: GameCallbacks) {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [loveCount, setLoveCount] = useState(0)
  const [items, setItems] = useState<FallingItem[]>([])
  const [bombHit, setBombHit] = useState<{ x: number; y: number } | null>(null)
  const [deathLine, setDeathLine] = useState<DeathLine>(DEATH_LINES[0])
  const [deathSeq, setDeathSeq] = useState(0)
  const [winLine, setWinLine] = useState<WinLine>(WIN_LINES[0])
  const [winSeq, setWinSeq] = useState(0)

  const engineRef = useRef<GameEngineState>(createGameEngineState())
  const phaseRef = useRef<GamePhase>('intro')
  const callbacksRef = useRef(callbacks)
  const frameListenerRef = useRef<FrameListener | null>(null)
  const lastDeathIndexRef = useRef(-1)
  const lastWinIndexRef = useRef(-1)

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  const publishPhase = useCallback((nextPhase: GamePhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }, [])

  const triggerBombDeath = useCallback((item: FallingItem) => {
    if (phaseRef.current !== 'playing') return

    const [line, index] = differentRandomLine(DEATH_LINES, lastDeathIndexRef.current)
    lastDeathIndexRef.current = index
    publishPhase('bombHit')
    callbacksRef.current.onBomb()
    setBombHit({ x: item.x, y: item.y })
    setDeathLine(line)
    setDeathSeq((sequence) => sequence + 1)
  }, [publishPhase])

  const triggerVictory = useCallback(() => {
    if (phaseRef.current !== 'playing') return

    const [line, index] = differentRandomLine(WIN_LINES, lastWinIndexRef.current)
    lastWinIndexRef.current = index
    publishPhase('victoryCelebration')
    callbacksRef.current.onVictory()
    setItems([])
    setWinLine(line)
    setWinSeq((sequence) => sequence + 1)
  }, [publishPhase])

  const subscribeToFrames = useCallback((listener: FrameListener) => {
    frameListenerRef.current = listener
    listener({ items: engineRef.current.items, playerX: engineRef.current.playerX })

    return () => {
      if (frameListenerRef.current === listener) frameListenerRef.current = null
    }
  }, [])

  const startGame = useCallback(() => {
    const nextEngine = createGameEngineState()
    engineRef.current = nextEngine
    publishPhase('playing')
    setLoveCount(0)
    setItems([])
    setBombHit(null)
    frameListenerRef.current?.({ items: nextEngine.items, playerX: nextEngine.playerX })
  }, [publishPhase])

  const movePlayer = useCallback((x: number) => {
    if (phaseRef.current !== 'playing') return

    const engine = engineRef.current
    const nextX = clampPlayerX(x)
    const deltaX = nextX - engine.playerX
    engine.playerX = nextX
    frameListenerRef.current?.({ items: engine.items, playerX: nextX })
    if (Math.abs(deltaX) > 0.01) callbacksRef.current.onMove?.(deltaX)
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return

    let animationFrame = 0
    let previousTime = performance.now()

    const runFrame = (now: number) => {
      if (phaseRef.current !== 'playing') return

      const engine = engineRef.current
      const result = advanceGame(engine, now - previousTime)
      previousTime = now
      frameListenerRef.current?.({ items: engine.items, playerX: engine.playerX })

      if (result.itemsChanged) setItems(engine.items.slice())
      for (let caught = 0; caught < result.caughtLove; caught += 1) {
        callbacksRef.current.onCatchLove()
      }
      if (result.caughtLove > 0) setLoveCount(engine.loveCount)

      if (result.bombHit) {
        triggerBombDeath(result.bombHit)
        return
      }
      if (result.won) {
        triggerVictory()
        return
      }

      animationFrame = requestAnimationFrame(runFrame)
    }

    animationFrame = requestAnimationFrame(runFrame)
    return () => cancelAnimationFrame(animationFrame)
  }, [phase, triggerBombDeath, triggerVictory])

  useEffect(() => {
    if (phase !== 'bombHit') return
    const timer = window.setTimeout(() => publishPhase('gameOver'), BOMB_REVEAL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [phase, publishPhase])

  useEffect(() => {
    if (phase !== 'victoryCelebration') return
    const timer = window.setTimeout(() => publishPhase('victory'), VICTORY_REVEAL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [phase, publishPhase])

  return {
    phase,
    loveCount,
    items,
    bombHit,
    deathLine,
    deathSeq,
    winLine,
    winSeq,
    pinkIntensity: Math.min(loveCount / GAME_RULES.loveGoal, 1),
    loveGoal: GAME_RULES.loveGoal,
    startGame,
    movePlayer,
    subscribeToFrames,
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
