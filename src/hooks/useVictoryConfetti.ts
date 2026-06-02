import confetti from 'canvas-confetti'

const PINK_COLORS = ['#ff6eb4', '#ff9ecd', '#ff4d8d', '#ffd1e8', '#ffb6d9', '#ffe566', '#fff5f8']
const GOLD_COLORS = ['#ffe566', '#ffd93d', '#ffb703', '#fff8dc']

function burst(opts: confetti.Options) {
  confetti({ disableForReducedMotion: true, zIndex: 2000, ...opts })
}

export function fireVictoryConfetti() {
  // Big center pop
  burst({
    particleCount: 140,
    spread: 100,
    startVelocity: 48,
    scalar: 1.15,
    colors: PINK_COLORS,
    origin: { x: 0.5, y: 0.58 },
  })

  burst({
    particleCount: 60,
    spread: 360,
    startVelocity: 26,
    ticks: 80,
    scalar: 0.9,
    colors: GOLD_COLORS,
    origin: { x: 0.5, y: 0.62 },
  })

  window.setTimeout(() => {
    burst({ particleCount: 90, angle: 55, spread: 62, startVelocity: 52, origin: { x: 0, y: 0.68 }, colors: PINK_COLORS })
    burst({ particleCount: 90, angle: 125, spread: 62, startVelocity: 52, origin: { x: 1, y: 0.68 }, colors: PINK_COLORS })
  }, 180)

  window.setTimeout(() => {
    burst({ particleCount: 100, spread: 120, startVelocity: 42, origin: { x: 0.5, y: 0.35 }, colors: [...PINK_COLORS, ...GOLD_COLORS] })
  }, 420)

  window.setTimeout(() => {
    burst({ particleCount: 70, spread: 80, startVelocity: 36, scalar: 1.2, origin: { x: 0.5, y: 0.72 }, colors: PINK_COLORS })
  }, 780)

  // Sustained shower for celebration phase
  const end = Date.now() + 2600
  const shower = () => {
    burst({
      particleCount: 4,
      angle: 58,
      spread: 48,
      startVelocity: 28,
      origin: { x: Math.random() * 0.4 + 0.1, y: 0.55 },
      colors: PINK_COLORS,
    })
    burst({
      particleCount: 4,
      angle: 122,
      spread: 48,
      startVelocity: 28,
      origin: { x: Math.random() * 0.4 + 0.5, y: 0.55 },
      colors: GOLD_COLORS,
    })
    if (Date.now() < end) requestAnimationFrame(shower)
  }
  window.setTimeout(shower, 500)
}

export function fireVictoryFinale() {
  burst({
    particleCount: 120,
    spread: 160,
    startVelocity: 34,
    decay: 0.92,
    scalar: 1.1,
    colors: [...PINK_COLORS, ...GOLD_COLORS],
    origin: { x: 0.5, y: 0.5 },
  })
}
