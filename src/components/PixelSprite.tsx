import { memo, type CSSProperties, type ReactNode } from 'react'
import { PALETTE, SPRITES, type PixelSpriteDef, type SpriteId } from '../data/sprites'

interface Props {
  id: SpriteId
  scale?: number
  className?: string
  style?: CSSProperties
}

const rectCache = new Map<string, ReactNode[]>()

function cacheKey(def: PixelSpriteDef, scale: number) {
  // Include pixel rows so HMR / sprite edits never serve stale art (old X/bow/etc).
  return `${def.id}:${scale}:${def.pixels.join('|')}`
}

function renderSprite(def: PixelSpriteDef, scale: number) {
  const key = cacheKey(def, scale)
  const cached = rectCache.get(key)
  if (cached) return cached

  const rects: ReactNode[] = []
  def.pixels.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      const fill = PALETTE[ch]
      if (fill && fill !== 'transparent') {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x * scale}
            y={y * scale}
            width={scale}
            height={scale}
            fill={fill}
          />,
        )
      }
    }
  })
  rectCache.set(key, rects)
  // Bound cache growth during HMR churn
  if (rectCache.size > 200) {
    const first = rectCache.keys().next().value
    if (first) rectCache.delete(first)
  }
  return rects
}

export const PixelSprite = memo(function PixelSprite({ id, scale = 4, className, style }: Props) {
  const def = SPRITES[id]
  if (!def) return null
  const w = def.width * scale
  const h = def.height * scale

  return (
    <svg
      className={`pixel-sprite ${className ?? ''}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      style={style}
      data-sprite={id}
      aria-hidden
    >
      {renderSprite(def, scale)}
    </svg>
  )
})
