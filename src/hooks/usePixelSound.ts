import { useCallback, useEffect, useRef } from 'react'

const SLIDE_MIN_DELTA = 0.15
const BGM_BEAT = 0.25
const BGM_LOOP_BEATS = 16
const BGM_VOLUME = 0.22
const BGM_MELODY_VOL = 0.038
const BGM_BASS_VOL = 0.052
const BGM_HARM_VOL = 0.022

interface SlideNodes {
  source: AudioBufferSourceNode
  filter: BiquadFilterNode
  pan: StereoPannerNode
  gain: GainNode
}

interface BgmNote {
  beat: number
  f: number
  len: number
  type?: OscillatorType
  vol?: number
}

/** Cute C-major loop — melody + bass, ~3.5s per cycle */
const BGM_MELODY: BgmNote[] = [
  { beat: 0, f: 784, len: 0.45, type: 'square' },
  { beat: 0.5, f: 659, len: 0.45, type: 'square' },
  { beat: 1, f: 784, len: 0.45, type: 'square' },
  { beat: 1.5, f: 880, len: 0.45, type: 'square' },
  { beat: 2, f: 784, len: 0.45, type: 'square' },
  { beat: 2.5, f: 659, len: 0.45, type: 'square' },
  { beat: 3, f: 523, len: 0.45, type: 'triangle' },
  { beat: 3.5, f: 659, len: 0.45, type: 'triangle' },
  { beat: 4, f: 784, len: 0.45, type: 'square' },
  { beat: 4.5, f: 659, len: 0.45, type: 'square' },
  { beat: 5, f: 784, len: 0.45, type: 'square' },
  { beat: 5.5, f: 988, len: 0.45, type: 'square' },
  { beat: 6, f: 880, len: 0.45, type: 'square' },
  { beat: 6.5, f: 784, len: 0.45, type: 'square' },
  { beat: 7, f: 659, len: 0.45, type: 'triangle' },
  { beat: 7.5, f: 523, len: 0.45, type: 'triangle' },
  { beat: 8, f: 880, len: 0.45, type: 'square' },
  { beat: 8.5, f: 784, len: 0.45, type: 'square' },
  { beat: 9, f: 659, len: 0.45, type: 'square' },
  { beat: 9.5, f: 784, len: 0.45, type: 'square' },
  { beat: 10, f: 880, len: 0.45, type: 'square' },
  { beat: 10.5, f: 988, len: 0.45, type: 'square' },
  { beat: 11, f: 1047, len: 0.45, type: 'triangle' },
  { beat: 11.5, f: 988, len: 0.45, type: 'triangle' },
  { beat: 12, f: 880, len: 0.45, type: 'square' },
  { beat: 12.5, f: 784, len: 0.45, type: 'square' },
  { beat: 13, f: 659, len: 0.45, type: 'square' },
  { beat: 13.5, f: 587, len: 0.45, type: 'triangle' },
  { beat: 14, f: 659, len: 0.45, type: 'square' },
  { beat: 14.5, f: 784, len: 0.45, type: 'square' },
  { beat: 15, f: 523, len: 0.9, type: 'triangle' },
]

const BGM_BASS: BgmNote[] = [
  { beat: 0, f: 131, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 2, f: 98, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 4, f: 110, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 6, f: 87, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 8, f: 131, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 10, f: 98, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 12, f: 82, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
  { beat: 14, f: 65, len: 1.9, type: 'square', vol: BGM_BASS_VOL },
]

const BGM_HARM: BgmNote[] = [
  { beat: 0, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 0.25, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 0.5, f: 784, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 1, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 1.25, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 1.5, f: 784, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 2, f: 440, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 2.25, f: 554, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 2.5, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 3, f: 392, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 3.25, f: 494, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 3.5, f: 587, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 4, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 4.25, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 4.5, f: 784, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 5, f: 587, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 5.25, f: 740, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 5.5, f: 880, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 6, f: 440, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 6.25, f: 554, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 6.5, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 7, f: 349, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 7.25, f: 440, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 7.5, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 8, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 8.25, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 8.5, f: 784, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 9, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 9.25, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 9.5, f: 784, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 10, f: 440, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 10.25, f: 554, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 10.5, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 11, f: 392, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 11.25, f: 494, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 11.5, f: 587, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 12, f: 523, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 12.25, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 12.5, f: 784, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 13, f: 587, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 13.25, f: 740, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 13.5, f: 880, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 14, f: 440, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 14.25, f: 554, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 14.5, f: 659, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 15, f: 262, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 15.25, f: 330, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
  { beat: 15.5, f: 392, len: 0.35, type: 'triangle', vol: BGM_HARM_VOL },
]

const BGM_LOOP_SEC = BGM_LOOP_BEATS * BGM_BEAT

export function usePixelSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)
  const slideRef = useRef<SlideNodes | null>(null)
  const slideIdleTimerRef = useRef<number | null>(null)
  const primedRef = useRef(false)
  const bgmMasterRef = useRef<GainNode | null>(null)
  const bgmRunningRef = useRef(false)
  const bgmLoopTimerRef = useRef<number | null>(null)

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (Ctx) ctxRef.current = new Ctx()
    }
    return ctxRef.current!
  }, [])

  const ensureRunning = useCallback(async () => {
    const c = ctx()
    if (c.state === 'suspended') await c.resume()
  }, [ctx])

  const getNoiseBuffer = useCallback(() => {
    if (noiseBufferRef.current) return noiseBufferRef.current
    const c = ctx()
    const buffer = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    noiseBufferRef.current = buffer
    return buffer
  }, [ctx])

  const getBgmMaster = useCallback(() => {
    const c = ctx()
    if (!bgmMasterRef.current) {
      const master = c.createGain()
      master.gain.value = 0
      master.connect(c.destination)
      bgmMasterRef.current = master
    }
    return bgmMasterRef.current
  }, [ctx])

  const scheduleBgmNote = useCallback(
    (when: number, note: BgmNote, defaultVol: number, defaultType: OscillatorType = 'square') => {
      const c = ctx()
      const osc = c.createOscillator()
      const g = c.createGain()
      const dur = note.len * BGM_BEAT
      const vol = note.vol ?? defaultVol
      osc.type = note.type ?? defaultType
      osc.frequency.value = note.f
      g.gain.setValueAtTime(0.001, when)
      g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.001), when + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, when + dur)
      osc.connect(g)
      g.connect(getBgmMaster())
      osc.start(when)
      osc.stop(when + dur + 0.03)
    },
    [ctx, getBgmMaster],
  )

  const scheduleBgmLoop = useCallback(
    (startAt: number) => {
      const all: BgmNote[] = [
        ...BGM_MELODY.map((n) => ({ ...n, vol: n.vol ?? BGM_MELODY_VOL })),
        ...BGM_BASS,
        ...BGM_HARM,
      ]
      for (const note of all) {
        scheduleBgmNote(startAt + note.beat * BGM_BEAT, note, BGM_MELODY_VOL)
      }
    },
    [scheduleBgmNote],
  )

  const stopBgm = useCallback(() => {
    bgmRunningRef.current = false
    if (bgmLoopTimerRef.current) {
      window.clearTimeout(bgmLoopTimerRef.current)
      bgmLoopTimerRef.current = null
    }
    const master = bgmMasterRef.current
    const c = ctxRef.current
    if (master && c) {
      master.gain.cancelScheduledValues(c.currentTime)
      master.gain.setValueAtTime(master.gain.value, c.currentTime)
      master.gain.linearRampToValueAtTime(0, c.currentTime + 0.2)
    }
  }, [])

  const queueBgmLoop = useCallback(() => {
    if (!bgmRunningRef.current) return
    const c = ctx()
    const startAt = c.currentTime + 0.06
    scheduleBgmLoop(startAt)
    bgmLoopTimerRef.current = window.setTimeout(() => {
      queueBgmLoop()
    }, BGM_LOOP_SEC * 1000 - 60)
  }, [ctx, scheduleBgmLoop])

  const startBgm = useCallback(async () => {
    await ensureRunning()
    if (bgmRunningRef.current) return
    bgmRunningRef.current = true
    const c = ctx()
    const master = getBgmMaster()
    master.gain.cancelScheduledValues(c.currentTime)
    master.gain.setValueAtTime(0, c.currentTime)
    master.gain.linearRampToValueAtTime(BGM_VOLUME, c.currentTime + 0.35)
    queueBgmLoop()
  }, [ensureRunning, ctx, getBgmMaster, queueBgmLoop])

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

  const noiseBurst = useCallback(
    (dur = 0.14, vol = 0.1, freq = 900, filterType: BiquadFilterType = 'lowpass') => {
      const c = ctx()
      const source = c.createBufferSource()
      source.buffer = getNoiseBuffer()
      const filter = c.createBiquadFilter()
      filter.type = filterType
      filter.frequency.value = freq
      const g = c.createGain()
      g.gain.setValueAtTime(vol, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
      source.connect(filter)
      filter.connect(g)
      g.connect(c.destination)
      source.start()
      source.stop(c.currentTime + dur)
    },
    [ctx, getNoiseBuffer],
  )

  const sweep = useCallback(
    (startFreq: number, endFreq: number, dur: number, type: OscillatorType = 'square', vol = 0.08) => {
      const c = ctx()
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(startFreq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), c.currentTime + dur)
      g.gain.setValueAtTime(vol, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur * 0.92)
      osc.connect(g)
      g.connect(c.destination)
      osc.start()
      osc.stop(c.currentTime + dur)
    },
    [ctx],
  )

  const stopSlide = useCallback(() => {
    if (slideIdleTimerRef.current) {
      window.clearTimeout(slideIdleTimerRef.current)
      slideIdleTimerRef.current = null
    }
    const slide = slideRef.current
    if (!slide) return
    const c = ctx()
    slide.gain.gain.setTargetAtTime(0.0001, c.currentTime, 0.05)
    const { source } = slide
    window.setTimeout(() => {
      try {
        source.stop()
      } catch {
        /* already stopped */
      }
      if (slideRef.current?.source === source) slideRef.current = null
    }, 100)
  }, [ctx])

  const startSlide = useCallback(() => {
    if (slideRef.current) return
    const c = ctx()
    const source = c.createBufferSource()
    source.buffer = getNoiseBuffer()
    source.loop = true

    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 900
    filter.Q.value = 0.8

    const pan = c.createStereoPanner()
    const gain = c.createGain()
    gain.gain.value = 0.0001

    source.connect(filter)
    filter.connect(pan)
    pan.connect(gain)
    gain.connect(c.destination)
    source.start()

    slideRef.current = { source, filter, pan, gain }
  }, [ctx, getNoiseBuffer])

  const updateSlide = useCallback(
    (deltaX: number) => {
      const speed = Math.abs(deltaX)
      if (speed < SLIDE_MIN_DELTA) {
        stopSlide()
        return
      }

      void ensureRunning().then(() => {
        startSlide()
        const slide = slideRef.current
        if (!slide) return

        const c = ctx()
        const direction = Math.sign(deltaX) || 1
        slide.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, direction * 0.8)), c.currentTime, 0.04)
        slide.source.playbackRate.setTargetAtTime(0.7 + Math.min(speed, 16) * 0.05, c.currentTime, 0.04)
        slide.filter.frequency.setTargetAtTime(650 + Math.min(speed, 16) * 30, c.currentTime, 0.04)
        slide.gain.gain.setTargetAtTime(Math.min(0.09, 0.03 + speed * 0.003), c.currentTime, 0.04)
      })

      if (slideIdleTimerRef.current) window.clearTimeout(slideIdleTimerRef.current)
      slideIdleTimerRef.current = window.setTimeout(() => stopSlide(), 80)
    },
    [ctx, ensureRunning, startSlide, stopSlide],
  )

  const catchSound = useCallback(() => {
    void ensureRunning()
    blip(784, 0.07, 'square', 0.07)
    setTimeout(() => blip(988, 0.06, 'square', 0.06), 40)
  }, [blip, ensureRunning])

  const bomb = useCallback(() => {
    void ensureRunning()
    stopSlide()
    stopBgm()

    // impact — boom + crack + thump
    noiseBurst(0.34, 0.2, 260, 'lowpass')
    noiseBurst(0.1, 0.13, 2200, 'highpass')
    blip(52, 0.2, 'sine', 0.15)
    blip(98, 0.1, 'square', 0.13)
    sweep(180, 70, 0.18, 'sawtooth', 0.1)

    // pixel "oof" stinger
    window.setTimeout(() => blip(147, 0.12, 'square', 0.11), 90)
    window.setTimeout(() => noiseBurst(0.08, 0.09, 800), 110)

    // classic game-over wah (descending minor)
    window.setTimeout(() => blip(220, 0.18, 'square', 0.11), 220)
    window.setTimeout(() => sweep(185, 92, 0.28, 'square', 0.1), 310)
    window.setTimeout(() => blip(147, 0.24, 'sawtooth', 0.095), 430)
    window.setTimeout(() => blip(110, 0.3, 'triangle', 0.085), 560)
    window.setTimeout(() => sweep(88, 48, 0.45, 'sine', 0.075), 690)
    window.setTimeout(() => blip(65, 0.55, 'sine', 0.06), 860)
  }, [blip, ensureRunning, noiseBurst, stopBgm, stopSlide, sweep])

  const maxHugs = useCallback(() => {
    void ensureRunning()
    stopBgm()
    const fanfare: { f: number; t: number; d?: number; vol?: number; type?: OscillatorType }[] = [
      { f: 392, t: 0, d: 0.1, vol: 0.05, type: 'sine' },
      { f: 523, t: 90, d: 0.12, vol: 0.065, type: 'sine' },
      { f: 659, t: 180, d: 0.12, vol: 0.07, type: 'sine' },
      { f: 784, t: 270, d: 0.14, vol: 0.075, type: 'triangle' },
      { f: 988, t: 380, d: 0.18, vol: 0.085, type: 'triangle' },
      { f: 1175, t: 500, d: 0.22, vol: 0.09, type: 'sine' },
      { f: 523, t: 620, d: 0.45, vol: 0.045, type: 'sine' },
      { f: 659, t: 620, d: 0.45, vol: 0.045, type: 'sine' },
      { f: 784, t: 620, d: 0.45, vol: 0.045, type: 'sine' },
      { f: 988, t: 620, d: 0.45, vol: 0.045, type: 'sine' },
      { f: 1319, t: 760, d: 0.1, vol: 0.055, type: 'square' },
      { f: 1568, t: 850, d: 0.12, vol: 0.05, type: 'square' },
      { f: 1760, t: 940, d: 0.2, vol: 0.06, type: 'sine' },
    ]
    fanfare.forEach(({ f, t, d, vol, type }) => {
      window.setTimeout(() => blip(f, d, type, vol), t)
    })
  }, [blip, ensureRunning, stopBgm])

  const prime = useCallback(async () => {
    await ensureRunning()
    getNoiseBuffer()

    if (!primedRef.current) {
      // Quiet ping unlocks iOS / Android audio on first user gesture.
      blip(440, 0.03, 'sine', 0.015)
      primedRef.current = true
    }
  }, [blip, ensureRunning, getNoiseBuffer])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void ctxRef.current?.resume()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => () => {
    stopSlide()
    stopBgm()
    void ctxRef.current?.close()
  }, [stopBgm, stopSlide])

  return { catchSound, bomb, maxHugs, prime, updateSlide, stopSlide, startBgm, stopBgm }
}
