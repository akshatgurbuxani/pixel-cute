import { useCallback, useRef } from 'react'

export function usePixelSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const ctx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const blip = useCallback(
    (freq: number, dur = 0.08, type: OscillatorType = 'square', vol = 0.06) => {
      const c = ctx()
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = type
      osc.frequency.value = freq
      g.gain.setValueAtTime(vol, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
      osc.connect(g)
      g.connect(c.destination)
      osc.start()
      osc.stop(c.currentTime + dur)
    },
    [ctx],
  )

  const catchSound = useCallback(() => {
    blip(784, 0.07, 'square', 0.07)
    setTimeout(() => blip(988, 0.06, 'square', 0.06), 40)
  }, [blip])

  const bomb = useCallback(() => {
    // cute but clear "bonk — oops!" 
    blip(220, 0.1, 'square', 0.12)
    setTimeout(() => blip(165, 0.14, 'square', 0.11), 90)
    setTimeout(() => blip(110, 0.22, 'sawtooth', 0.09), 180)
    setTimeout(() => blip(90, 0.3, 'triangle', 0.07), 280)
  }, [blip])

  const maxHugs = useCallback(() => {
    ;[523, 659, 784, 988].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'sine', 0.06), i * 100))
  }, [blip])

  const prime = useCallback(() => {
    const c = ctx()
    void c.resume()
  }, [ctx])

  return { catchSound, bomb, maxHugs, prime }
}
