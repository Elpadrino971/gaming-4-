import { useCallback, useRef, useEffect } from 'react'

/**
 * Custom hook for playing sound effects
 * Uses Web Audio API for low-latency playback
 */
export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize AudioContext on user interaction
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const playBeep = useCallback(async (frequency: number = 440, duration: number = 100, volume: number = 0.3) => {
    if (!audioContextRef.current) return

    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration / 1000)
    } catch (error) {
      console.debug('Audio not available', error)
    }
  }, [])

  const playClick = useCallback(() => {
    playBeep(800, 50, 0.2)
  }, [playBeep])

  const playSuccess = useCallback(() => {
    // Arpeggio for success
    playBeep(523, 80, 0.2) // C
    setTimeout(() => playBeep(659, 80, 0.2), 80) // E
    setTimeout(() => playBeep(784, 120, 0.2), 160) // G
  }, [playBeep])

  const playError = useCallback(() => {
    playBeep(200, 150, 0.3)
  }, [playBeep])

  const playWin = useCallback(() => {
    // Victory fanfare
    playBeep(523, 100, 0.25) // C
    setTimeout(() => playBeep(659, 100, 0.25), 100) // E
    setTimeout(() => playBeep(784, 100, 0.25), 200) // G
    setTimeout(() => playBeep(1047, 300, 0.25), 300) // C high
  }, [playBeep])

  const playJackpot = useCallback(() => {
    // Epic jackpot sound
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playBeep(freq, 100, 0.2), i * 60)
    })
  }, [playBeep])

  const playSpin = useCallback(() => {
    // Spinning wheel sound
    let freq = 200
    const interval = setInterval(() => {
      playBeep(freq, 30, 0.1)
      freq += 50
      if (freq > 1000) {
        clearInterval(interval)
      }
    }, 100)
  }, [playBeep])

  const playTick = useCallback(() => {
    playBeep(1200, 20, 0.15)
  }, [playBeep])

  const playPop = useCallback(() => {
    playBeep(600, 80, 0.2)
    setTimeout(() => playBeep(800, 60, 0.15), 40)
  }, [playBeep])

  return {
    playBeep,
    playClick,
    playSuccess,
    playError,
    playWin,
    playJackpot,
    playSpin,
    playTick,
    playPop,
  }
}
