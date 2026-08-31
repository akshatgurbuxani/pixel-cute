import { LOVE_SPRITES, type SpriteId } from '../data/sprites'

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

export interface GameEngineState {
  items: FallingItem[]
  playerX: number
  loveCount: number
  nextItemId: number
  spawnElapsedMs: number
}

export interface GameFrameResult {
  caughtLove: number
  bombHit: FallingItem | null
  itemsChanged: boolean
  won: boolean
}

export const GAME_RULES = {
  loveGoal: 10,
  minPlayerX: 8,
  maxPlayerX: 92,
  catchY: 78,
  catchHeight: 6,
  catchWidth: 11,
  despawnY: 108,
  maxItems: 3,
  maxDeltaMs: 34,
} as const

type RandomSource = () => number

export function createGameEngineState(): GameEngineState {
  return {
    items: [],
    playerX: 50,
    loveCount: 0,
    nextItemId: 0,
    spawnElapsedMs: 0,
  }
}

export function clampPlayerX(x: number): number {
  return Math.max(GAME_RULES.minPlayerX, Math.min(GAME_RULES.maxPlayerX, x))
}

function spawnIntervalMs(loveCount: number): number {
  return Math.max(1_067, 1_500 - loveCount * 7)
}

function createItem(state: GameEngineState, random: RandomSource): FallingItem {
  const isBomb = random() < Math.min(0.28 + state.loveCount * 0.006, 0.4)

  return {
    id: state.nextItemId++,
    x: 16 + random() * 68,
    y: -8,
    sprite: isBomb
      ? 'bomb'
      : LOVE_SPRITES[Math.floor(random() * LOVE_SPRITES.length)],
    kind: isBomb ? 'bomb' : 'love',
    speed: 0.3 + random() * 0.12,
    wobble: (random() - 0.5) * 0.15,
  }
}

function touchesPlayer(item: FallingItem, playerX: number): boolean {
  const inCatchZone = item.y >= GAME_RULES.catchY
    && item.y < GAME_RULES.catchY + GAME_RULES.catchHeight
  return inCatchZone && Math.abs(item.x - playerX) < GAME_RULES.catchWidth
}

/** Advances mutable simulation state without forcing React to render each frame. */
export function advanceGame(
  state: GameEngineState,
  deltaMs: number,
  random: RandomSource = Math.random,
): GameFrameResult {
  const safeDeltaMs = Math.min(Math.max(deltaMs, 0), GAME_RULES.maxDeltaMs)
  const frameScale = safeDeltaMs / 16.67
  let itemsChanged = false
  let caughtLove = 0

  state.spawnElapsedMs += safeDeltaMs
  const spawnEveryMs = spawnIntervalMs(state.loveCount)
  if (state.spawnElapsedMs >= spawnEveryMs && state.items.length < GAME_RULES.maxItems) {
    state.spawnElapsedMs %= spawnEveryMs
    state.items.push(createItem(state, random))
    itemsChanged = true
  }

  for (let index = state.items.length - 1; index >= 0; index -= 1) {
    const item = state.items[index]
    item.y += item.speed * 0.58 * frameScale
    item.x += item.wobble * frameScale * 0.12

    if (item.y > GAME_RULES.despawnY) {
      state.items.splice(index, 1)
      itemsChanged = true
    }
  }

  // A bomb always wins a simultaneous collision; scoring must stop immediately.
  const bombIndex = state.items.findIndex(
    (item) => item.kind === 'bomb' && touchesPlayer(item, state.playerX),
  )
  if (bombIndex >= 0) {
    const [bombHit] = state.items.splice(bombIndex, 1)
    return { caughtLove: 0, bombHit, itemsChanged: true, won: false }
  }

  for (let index = state.items.length - 1; index >= 0; index -= 1) {
    const item = state.items[index]
    if (item.kind === 'love' && touchesPlayer(item, state.playerX)) {
      state.items.splice(index, 1)
      itemsChanged = true
      state.loveCount += 1
      caughtLove += 1
      if (state.loveCount >= GAME_RULES.loveGoal) {
        state.items = []
        return { caughtLove, bombHit: null, itemsChanged: true, won: true }
      }
    }
  }

  return { caughtLove, bombHit: null, itemsChanged, won: false }
}
