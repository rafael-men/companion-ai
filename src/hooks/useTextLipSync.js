import { useEffect, useRef, useState } from 'react'


const VOWEL_PATTERNS = {
  aa: /[áàâãa]/i,
  eh: /[éèêe]/i,
  ih: /[íìîi]/i,
  oh: /[óòôõo]/i,
  uu: /[úùûu]/i,
}

const ZERO = { aa: 0, ih: 0, uu: 0, eh: 0, oh: 0 }


function getVowelIntensity(char) {
  for (const [vowel, pattern] of Object.entries(VOWEL_PATTERNS)) {
    if (pattern.test(char)) return { [vowel]: 1 }
  }
  return null
}


function buildTimeline(text, durationMs) {
  const chars = text.split('')
  const totalFrames = Math.max(20, Math.min(120, Math.floor(durationMs / 50)))
  const frameDuration = durationMs / totalFrames
  const timeline = []

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames
    const charIndex = Math.min(chars.length - 1, Math.floor(progress * chars.length))
    const currentChar = chars[charIndex]
    const vowelData = getVowelIntensity(currentChar)
    const prevChar = charIndex > 0 ? chars[charIndex - 1] : null
    const prevVowel = prevChar ? getVowelIntensity(prevChar) : null

    const intensities = { ...ZERO }
    const ativa = vowelData ?? prevVowel
    const vogalAtiva = ativa ? Object.keys(ativa)[0] : "aa"
    const isVowel = !!vowelData
    const wobble = (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.2
    const openness = isVowel ? Math.min(1, 0.7 + wobble) : 0.05
    intensities[vogalAtiva] = Math.min(1, openness)

    timeline.push({ time: i * frameDuration, intensities })
  }
  return timeline
}

/**
 * @param {string} text 
 * @param {boolean} isSpeaking 
 * @returns {{aa:number, ih:number, uu:number, eh:number, oh:number}}
 */
export function useTextLipSync(text, isSpeaking, intensity = 1) {
  const [currentIntensities, setCurrentIntensities] = useState({ ...ZERO })
  const startTimeRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    if (!isSpeaking || !text) {
      setCurrentIntensities({ ...ZERO })
      return
    }

    const duration = Math.min(6000, Math.max(1000, text.length * 80))
    const timeline = buildTimeline(text, duration)
    startTimeRef.current = performance.now()

    let previous = { ...ZERO }

    const animate = (now) => {
      const elapsed = now - startTimeRef.current
      if (elapsed >= duration) {
        setCurrentIntensities({ ...ZERO })
        return
      }

      let idx = 0
      for (let i = 0; i < timeline.length; i++) {
        if (elapsed >= timeline[i].time) idx = i
        else break
      }
      const target = timeline[idx]?.intensities || timeline[timeline.length - 1]?.intensities

      if (target) {
        const lerp = (a, b, t) => a + (b - a) * t
        const factor = 0.4
        const smoothed = {
          aa: lerp(previous.aa, target.aa, factor),
          ih: lerp(previous.ih, target.ih, factor),
          uu: lerp(previous.uu, target.uu, factor),
          eh: lerp(previous.eh, target.eh, factor),
          oh: lerp(previous.oh, target.oh, factor),
        }
        previous = smoothed
        setCurrentIntensities({
          aa: Math.min(1, smoothed.aa * intensity),
          ih: Math.min(1, smoothed.ih * intensity),
          uu: Math.min(1, smoothed.uu * intensity),
          eh: Math.min(1, smoothed.eh * intensity),
          oh: Math.min(1, smoothed.oh * intensity),
        })
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [text, isSpeaking])

  return currentIntensities
}
