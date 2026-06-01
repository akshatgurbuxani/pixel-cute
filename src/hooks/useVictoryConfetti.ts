import confetti from 'canvas-confetti'

const PINK_COLORS = ['#ff6eb4', '#ff9ecd', '#ff4d8d', '#ffd1e8', '#ffb6d9', '#ffe566']

export function fireVictoryConfetti() {
  const base = { colors: PINK_COLORS, disableForReducedMotion: true, zIndex: 2000 }

  confetti({ ...base, particleCount: 90, spread: 75, startVelocity: 38, origin: { x: 0.5, y: 0.55 } })

  window.setTimeout(() => {
    confetti({ ...base, particleCount: 55, spread: 110, startVelocity: 32, origin: { x: 0.12, y: 0.62 } })
    confetti({ ...base, particleCount: 55, spread: 110, startVelocity: 32, origin: { x: 0.88, y: 0.62 } })
  }, 280)

  window.setTimeout(() => {
    confetti({ ...base, particleCount: 40, spread: 90, ticks: 120, origin: { x: 0.5, y: 0.35 } })
  }, 700)
}
