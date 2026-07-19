export interface StarDef {
  id: number
  left: number
  top: number
  size: number
  delay: number
  drift: number
}

export interface SparkleDef {
  id: number
  left: number
  top: number
  delay: number
  char: string
}

function seeded(i: number, salt: number) {
  const x = Math.sin((i + 1) * (salt + 1) * 43758.5453) * 10000
  return x - Math.floor(x)
}

export function buildStars(count: number, salt: number, topMax = 100): StarDef[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seeded(i, salt) * 96 + 2,
    top: seeded(i, salt + 7) * topMax + 1,
    size: i % 5 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
    delay: (i % 9) * 0.32,
    drift: 8 + seeded(i, salt + 13) * 18,
  }))
}

export function buildSparkles(count: number, salt: number, topMax = 100): SparkleDef[] {
  const chars = ['♡', '♡', '♥', '♡', '♥'] as const
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seeded(i, salt + 3) * 94 + 3,
    top: seeded(i, salt + 11) * topMax + 2,
    delay: i * 0.55,
    char: chars[i % chars.length],
  }))
}

export const BG_STARS = [
  ...buildStars(40, 1, 52),
  ...buildStars(36, 21, 48).map((s, i) => ({ ...s, id: 100 + i, top: 52 + s.top })),
]
export const BG_SPARKLES = [
  ...buildSparkles(12, 2, 50),
  ...buildSparkles(14, 31, 48).map((s, i) => ({ ...s, id: 100 + i, top: 50 + s.top })),
]
export const ARENA_STARS = buildStars(22, 5, 72)
export const CARD_SPARKLES = buildSparkles(8, 9, 100)
