'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SoundType = 'move' | 'capture' | 'check' | 'gameEnd' | 'illegal'

interface UseSoundReturn {
  playMove: () => void
  playCapture: () => void
  playCheck: () => void
  playGameEnd: () => void
  playIllegal: () => void
  muted: boolean
  volume: number
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
}

function createTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3
): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

export function useSound(): UseSoundReturn {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [muted, setMutedState] = useState(false)
  const [volume, setVolumeState] = useState(0.7)

  useEffect(() => {
    const stored = localStorage.getItem('chess-sound-muted')
    if (stored !== null) setMutedState(JSON.parse(stored))
    const storedVol = localStorage.getItem('chess-sound-volume')
    if (storedVol !== null) setVolumeState(parseFloat(storedVol))
  }, [])

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
    }
    return audioCtxRef.current
  }, [])

  const play = useCallback(
    (type: SoundType) => {
      if (muted) return
      const ctx = getCtx()
      if (!ctx) return

      const g = volume * 0.4

      switch (type) {
        case 'move':
          createTone(ctx, 440, 0.08, 'triangle', g)
          break
        case 'capture':
          createTone(ctx, 180, 0.15, 'sawtooth', g * 0.8)
          createTone(ctx, 90, 0.12, 'square', g * 0.4)
          break
        case 'check':
          createTone(ctx, 660, 0.1, 'sine', g)
          setTimeout(() => createTone(ctx, 880, 0.12, 'sine', g * 0.7), 120)
          break
        case 'gameEnd':
          createTone(ctx, 523, 0.3, 'sine', g * 0.6)
          setTimeout(() => createTone(ctx, 392, 0.35, 'sine', g * 0.5), 200)
          setTimeout(() => createTone(ctx, 330, 0.5, 'sine', g * 0.4), 400)
          break
        case 'illegal':
          createTone(ctx, 120, 0.15, 'square', g * 0.3)
          break
      }
    },
    [muted, volume, getCtx]
  )

  const setMuted = useCallback((val: boolean) => {
    setMutedState(val)
    localStorage.setItem('chess-sound-muted', JSON.stringify(val))
  }, [])

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolumeState(clamped)
    localStorage.setItem('chess-sound-volume', String(clamped))
  }, [])

  return {
    playMove: () => play('move'),
    playCapture: () => play('capture'),
    playCheck: () => play('check'),
    playGameEnd: () => play('gameEnd'),
    playIllegal: () => play('illegal'),
    muted,
    volume,
    setMuted,
    setVolume,
  }
}
