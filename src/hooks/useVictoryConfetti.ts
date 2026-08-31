import confetti from 'canvas-confetti'

const PINK_COLORS = ['#ff6eb4', '#ff9ecd', '#ff4d8d', '#ffd1e8', '#ffb6d9', '#ffe566', '#fff5f8']
const GOLD_COLORS = ['#ffe566', '#ffd93d', '#ffb703', '#fff8dc']
const fireConfetti = confetti.create(undefined, { resize: true, useWorker: true })

type Cleanup = () => void

function burst(options: confetti.Options) {
  void fireConfetti({
    disableForReducedMotion: true,
    zIndex: 2_000,
    ...options,
  })
}

function after(delayMs: number, callback: () => void): Cleanup {
  const timer = window.setTimeout(callback, delayMs)
  return () => window.clearTimeout(timer)
}

export function fireVictoryConfetti(): Cleanup {
  const compactScreen = window.matchMedia('(max-width: 600px)').matches
  const scale = compactScreen ? 0.55 : 1

  burst({
    particleCount: Math.round(90 * scale),
    spread: 100,
    startVelocity: 42,
    ticks: 100,
    scalar: 1,
    colors: PINK_COLORS,
    origin: { x: 0.5, y: 0.58 },
  })

  const cancelSideBurst = after(220, () => {
    const particleCount = Math.round(40 * scale)
    burst({ particleCount, angle: 55, spread: 58, startVelocity: 44, origin: { x: 0, y: 0.68 }, colors: PINK_COLORS })
    burst({ particleCount, angle: 125, spread: 58, startVelocity: 44, origin: { x: 1, y: 0.68 }, colors: GOLD_COLORS })
  })

  const cancelFinalBurst = after(620, () => {
    burst({
      particleCount: Math.round(55 * scale),
      spread: 110,
      startVelocity: 34,
      ticks: 90,
      colors: [...PINK_COLORS, ...GOLD_COLORS],
      origin: { x: 0.5, y: 0.42 },
    })
  })

  return () => {
    cancelSideBurst()
    cancelFinalBurst()
  }
}

export function fireVictoryFinale(): Cleanup {
  burst({
    particleCount: window.matchMedia('(max-width: 600px)').matches ? 55 : 90,
    spread: 150,
    startVelocity: 30,
    decay: 0.92,
    scalar: 1,
    colors: [...PINK_COLORS, ...GOLD_COLORS],
    origin: { x: 0.5, y: 0.5 },
  })

  return () => undefined
}
