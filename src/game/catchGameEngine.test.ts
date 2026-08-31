import { describe, expect, it } from 'vitest'
import {
  advanceGame,
  clampPlayerX,
  createGameEngineState,
  GAME_RULES,
  type FallingItem,
} from './catchGameEngine'

function item(overrides: Partial<FallingItem> = {}): FallingItem {
  return {
    id: 1,
    x: 50,
    y: GAME_RULES.catchY,
    sprite: 'heart',
    kind: 'love',
    speed: 0,
    wobble: 0,
    ...overrides,
  }
}

describe('catch game engine', () => {
  it('clamps the player to the playable area', () => {
    expect(clampPlayerX(-100)).toBe(GAME_RULES.minPlayerX)
    expect(clampPlayerX(50)).toBe(50)
    expect(clampPlayerX(200)).toBe(GAME_RULES.maxPlayerX)
  })

  it('collects love exactly once when an item touches the player', () => {
    const state = createGameEngineState()
    state.items = [item()]

    const result = advanceGame(state, 0)

    expect(result.caughtLove).toBe(1)
    expect(result.bombHit).toBeNull()
    expect(state.loveCount).toBe(1)
    expect(state.items).toHaveLength(0)
  })

  it('ends the round immediately when a bomb touches the player', () => {
    const state = createGameEngineState()
    state.items = [item({ kind: 'bomb', sprite: 'bomb' })]

    const result = advanceGame(state, 0)

    expect(result.bombHit?.kind).toBe('bomb')
    expect(result.won).toBe(false)
    expect(state.loveCount).toBe(0)
  })

  it('gives a bomb precedence over love in the same frame', () => {
    const state = createGameEngineState()
    state.items = [item(), item({ id: 2, kind: 'bomb', sprite: 'bomb' })]

    const result = advanceGame(state, 0)

    expect(result.bombHit?.kind).toBe('bomb')
    expect(result.caughtLove).toBe(0)
    expect(state.loveCount).toBe(0)
  })

  it('wins at the configured goal and clears remaining items', () => {
    const state = createGameEngineState()
    state.loveCount = GAME_RULES.loveGoal - 1
    state.items = [item(), item({ id: 2, x: 10, y: 20 })]

    const result = advanceGame(state, 0)

    expect(result.won).toBe(true)
    expect(state.loveCount).toBe(GAME_RULES.loveGoal)
    expect(state.items).toHaveLength(0)
  })

  it('caps large frame gaps so returning to the tab cannot skip collisions', () => {
    const state = createGameEngineState()
    state.items = [item({ x: 10, y: 0, speed: 1 })]

    advanceGame(state, 10_000)

    expect(state.items[0].y).toBeCloseTo(0.58 * (GAME_RULES.maxDeltaMs / 16.67), 5)
  })

  it('never spawns above the concurrent item cap', () => {
    const state = createGameEngineState()
    state.spawnElapsedMs = 10_000
    state.items = [item({ id: 1, y: 0 }), item({ id: 2, y: 0 }), item({ id: 3, y: 0 })]

    advanceGame(state, 0, () => 0.5)

    expect(state.items).toHaveLength(GAME_RULES.maxItems)
  })
})
