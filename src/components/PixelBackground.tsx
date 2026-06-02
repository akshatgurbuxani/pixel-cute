import { ARENA_STARS, BG_SPARKLES, BG_STARS } from '../data/spaceDecor'

export function PixelBackground() {
  return (
    <div className="pixel-bg" aria-hidden>
      <div className="gradient-base" />
      <div className="gradient-layer layer-nebula layer-nebula-a" />
      <div className="gradient-layer layer-nebula layer-nebula-b" />
      <div className="gradient-layer layer-nebula layer-nebula-c" />
      <div className="gradient-shimmer" />

      <div className="bg-stars">
        {BG_STARS.map((s) => (
          <span
            key={s.id}
            className="bg-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              ['--star-drift' as string]: `${s.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="bg-sparkles">
        {BG_SPARKLES.map((s) => (
          <span
            key={s.id}
            className="bg-sparkle"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
            }}
          >
            {s.char}
          </span>
        ))}
      </div>

      <div className="pixel-sun-wrap">
        <div className="pixel-sun-rays" />
        <div className="pixel-sun" />
      </div>

      <div className="bg-orbit bg-orbit-a" />
      <div className="bg-orbit bg-orbit-b" />

      <div className="scanlines" />
    </div>
  )
}

/** Inner starfield for the game arena card */
export function ArenaCosmos() {
  return (
    <div className="arena-cosmos" aria-hidden>
      <div className="arena-cosmos-glow" />
      <div className="arena-cosmos-band band-a" />
      <div className="arena-cosmos-band band-b" />
      {ARENA_STARS.map((s) => (
        <span
          key={s.id}
          className="arena-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            ['--star-drift' as string]: `${s.drift * 0.45}px`,
          }}
        />
      ))}
    </div>
  )
}
