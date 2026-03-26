import { useEffect, useRef, useState } from 'react'

const ORDER = ['wicket', 'dot', 'one', 'two', 'three', 'four', 'six']
const LABELS = { wicket: 'W', dot: 'DOT', one: '1', two: '2', three: '3', four: '4', six: '6' }

export function detectOutcome(sliderPos, probabilities) {
  let cumulative = 0
  for (const key of ORDER) {
    cumulative += probabilities[key]
    if (sliderPos < cumulative) return key
  }
  return ORDER.at(-1)
}

export default function PowerBar({
  probabilities,
  isRunning,
  gamePhase,
  battingStyle,
  ballsPlayed,
  onPositionChange,
  buttonLabel,
  onAction,
  buttonDisabled,
}) {
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)
  const directionRef = useRef(1)
  const [pos, setPos] = useState(0)

  useEffect(() => {
    onPositionChange(pos)
  }, [pos, onPositionChange])

  useEffect(() => {
    if (!isRunning) {
      lastTsRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    const baseCycle = battingStyle === 'aggressive' ? 1.4 : 2.2
    const overNumber = Math.floor(ballsPlayed / 6)
    const pressureFactor = Math.pow(1.1, overNumber)
    const speed = (1 / baseCycle) * pressureFactor

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setPos((prev) => {
        let next = prev + directionRef.current * speed * dt
        if (next >= 1) {
          next = 1 - (next - 1)
          directionRef.current = -1
        } else if (next <= 0) {
          next = -next
          directionRef.current = 1
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isRunning, battingStyle, ballsPlayed])

  return (
    <div>
      <div className="power-bar">
        {ORDER.map((key) => (
          <div
            key={key}
            className={`power-segment segment-${key} ${isRunning && key === 'wicket' ? 'danger-running' : ''}`}
            style={{ width: `${probabilities[key] * 100}%` }}
          >
            <span>{`${LABELS[key]} ${(probabilities[key] * 100).toFixed(0)}%`}</span>
          </div>
        ))}
        <div className="slider-indicator" style={{ left: `${pos * 100}%` }} />
        <div className="power-slider" style={{ left: `${pos * 100}%` }} />
      </div>
      <button
        type="button"
        className="play-shot-btn"
        onClick={onAction}
        disabled={buttonDisabled || gamePhase === 'gameover'}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
