import type { CSSProperties, ReactNode } from 'react'
import { PALETTE, SPRITES, type PixelSpriteDef, type SpriteId } from '../data/sprites'

interface Props {
  id: SpriteId
  scale?: number
  className?: string
  style?: CSSProperties
}

function renderSprite(def: PixelSpriteDef, scale: number) {
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
  return rects
}

export function PixelSprite({ id, scale = 4, className, style }: Props) {
  const def = SPRITES[id]
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
      aria-hidden
    >
      {renderSprite(def, scale)}
    </svg>
  )
}
