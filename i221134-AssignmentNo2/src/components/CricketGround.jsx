import { useEffect, useRef, useState } from 'react'

const initialBall = { x: 250, y: 140, scale: 1, opacity: 1 }
const strikerHomeX = 250
const strikerHomeY = 370
const nonStrikerHomeX = 286
const nonStrikerHomeY = 164
const strikerRunLaneX = 262
const nonStrikerRunLaneX = 238

function lerp(a, b, t) {
  return a + (b - a) * t
}

function triangleWave(t) {
  const mod = t % 1
  return mod < 0.5 ? mod * 2 : 2 - mod * 2
}

export default function CricketGround({ gamePhase, lastOutcome, onBowlingComplete }) {
  const [ballPos, setBallPos] = useState(initialBall)
  const [particles, setParticles] = useState([])
  const [runnerState, setRunnerState] = useState({
    active: false,
    strikerX: strikerHomeX,
    strikerY: strikerHomeY,
    nonStrikerX: nonStrikerHomeX,
    nonStrikerY: nonStrikerHomeY,
  })
  const rafRef = useRef(null)
  const runRafRef = useRef(null)
  const prevPhaseRef = useRef(gamePhase)
  const latestBallRef = useRef(initialBall)
  const trajectoryRef = useRef({ targetX: 430, targetY: 260, arcHeight: 220 })

  useEffect(() => {
    latestBallRef.current = ballPos
  }, [ballPos])

  useEffect(() => {
    if (gamePhase !== 'bowling') return
    const start = performance.now()
    const duration = 800
    const animate = (ts) => {
      const p = Math.min((ts - start) / duration, 1)
      const eased = p * p
      setBallPos({ x: 250, y: lerp(140, 340, eased), scale: lerp(1, 1.5, eased), opacity: 1 })
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        onBowlingComplete()
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [gamePhase, onBowlingComplete])

  useEffect(() => {
    if (gamePhase !== 'result') return
    const outcome = lastOutcome
    const start = performance.now()
    const duration = 850

    if (outcome === 'four') {
      trajectoryRef.current = {
        targetX: Math.random() > 0.5 ? 468 : 34,
        targetY: 190 + Math.random() * 150,
        arcHeight: 0,
      }
    }
    if (outcome === 'six') {
      trajectoryRef.current = {
        targetX: Math.random() > 0.5 ? 456 : 42,
        targetY: 64 + Math.random() * 80,
        arcHeight: 190 + Math.random() * 80,
      }
    }

    const animate = (ts) => {
      const t = Math.min((ts - start) / duration, 1)
      if (outcome === 'wicket') {
        setBallPos({ x: 250, y: lerp(340, 355, t), scale: 1.35, opacity: 1 })
      } else if (outcome === 'dot') {
        setBallPos({ x: lerp(250, 258, t), y: lerp(340, 325, t), scale: 1.2, opacity: 1 })
      } else if (outcome === 'one') {
        setBallPos({ x: lerp(250, 190, t), y: lerp(340, 230, t), scale: 1, opacity: 1 })
      } else if (outcome === 'two' || outcome === 'three') {
        setBallPos({ x: lerp(250, 335, t), y: lerp(340, 220, t), scale: 0.9, opacity: 1 })
      } else if (outcome === 'four') {
        setBallPos({
          x: lerp(250, trajectoryRef.current.targetX, t),
          y: lerp(340, trajectoryRef.current.targetY, t),
          scale: 0.8,
          opacity: 1,
        })
      } else if (outcome === 'six') {
        const x = lerp(250, trajectoryRef.current.targetX, t)
        const y = lerp(340, trajectoryRef.current.targetY, t) - trajectoryRef.current.arcHeight * (4 * t * (1 - t))
        setBallPos({ x, y, scale: 0.75, opacity: 1 })
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    if (outcome === 'four' || outcome === 'six') {
      const tint = outcome === 'four' ? 'var(--accent-gold)' : 'var(--accent-blue)'
      const count = 12 + Math.floor(Math.random() * 5)
      const origin = latestBallRef.current
      const generated = Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
        const magnitude = 35 + Math.random() * 70
        return {
          id: `${Date.now()}-${i}`,
          x: origin.x,
          y: origin.y,
          dx: Math.cos(angle) * magnitude,
          dy: Math.sin(angle) * magnitude,
          color: tint,
        }
      })
      setParticles(generated)
      const clear = setTimeout(() => setParticles([]), 1000)
      return () => clearTimeout(clear)
    }
    return undefined
  }, [gamePhase, lastOutcome])

  useEffect(() => {
    if (gamePhase !== 'result') return
    if (!['one', 'two', 'three'].includes(lastOutcome)) return
    const runs = lastOutcome === 'one' ? 1 : lastOutcome === 'two' ? 2 : 3
    const duration = runs === 1 ? 950 : runs === 2 ? 1350 : 1800
    const start = performance.now()
    const animateRuns = (ts) => {
      const p = Math.min((ts - start) / duration, 1)
      const legs = runs
      const phase = triangleWave(p * legs)
      const strikerX = lerp(strikerHomeX, strikerRunLaneX, phase)
      const strikerY = lerp(strikerHomeY, nonStrikerHomeY, phase)
      const nonStrikerX = lerp(nonStrikerHomeX, nonStrikerRunLaneX, phase)
      const nonStrikerY = lerp(nonStrikerHomeY, strikerHomeY, phase)
      setRunnerState({ active: true, strikerX, strikerY, nonStrikerX, nonStrikerY })
      if (p < 1) {
        runRafRef.current = requestAnimationFrame(animateRuns)
      } else {
        setRunnerState({
          active: false,
          strikerX: strikerHomeX,
          strikerY: strikerHomeY,
          nonStrikerX: nonStrikerHomeX,
          nonStrikerY: nonStrikerHomeY,
        })
      }
    }
    runRafRef.current = requestAnimationFrame(animateRuns)
    return () => {
      if (runRafRef.current) cancelAnimationFrame(runRafRef.current)
      setRunnerState({
        active: false,
        strikerX: strikerHomeX,
        strikerY: strikerHomeY,
        nonStrikerX: nonStrikerHomeX,
        nonStrikerY: nonStrikerHomeY,
      })
    }
  }, [gamePhase, lastOutcome])

  useEffect(() => {
    if (prevPhaseRef.current === 'result' && gamePhase === 'ready') {
      setBallPos(initialBall)
      setParticles([])
      setRunnerState({
        active: false,
        strikerX: strikerHomeX,
        strikerY: strikerHomeY,
        nonStrikerX: nonStrikerHomeX,
        nonStrikerY: nonStrikerHomeY,
      })
    }
    prevPhaseRef.current = gamePhase
  }, [gamePhase])

  return (
    <div className="ground-container">
      <svg viewBox="0 0 500 520" className="ground-svg" role="img" aria-label="Cricket ground">
        <defs>
          <filter id="stumpGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="flood-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffde7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fffde7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="cricket-field-outfield" cx="250" cy="260" rx="240" ry="250" fill="#1a4a1a" />
        <ellipse cx="250" cy="260" rx="235" ry="245" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.5" />
        <ellipse cx="250" cy="260" rx="140" ry="150" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <rect x="228" y="140" width="44" height="240" rx="4" fill="#c8a46e" />
        <line x1="228" y1="200" x2="272" y2="200" stroke="#b8945e" strokeWidth="0.5" opacity="0.6" />
        <line x1="228" y1="260" x2="272" y2="260" stroke="#b8945e" strokeWidth="0.5" opacity="0.6" />
        <line x1="228" y1="320" x2="272" y2="320" stroke="#b8945e" strokeWidth="0.5" opacity="0.6" />
        <line x1="222" y1="345" x2="278" y2="345" stroke="white" strokeWidth="2.5" />
        <line x1="222" y1="345" x2="216" y2="345" stroke="white" strokeWidth="1.5" />
        <line x1="278" y1="345" x2="284" y2="345" stroke="white" strokeWidth="1.5" />
        <line x1="222" y1="175" x2="278" y2="175" stroke="white" strokeWidth="2.5" />
        <line x1="222" y1="175" x2="216" y2="175" stroke="white" strokeWidth="1.5" />
        <line x1="278" y1="175" x2="284" y2="175" stroke="white" strokeWidth="1.5" />
        <g id="batsman-stumps" className={lastOutcome === 'wicket' ? 'wicket-fallen' : ''} filter="url(#stumpGlow)">
          <rect className="stump-left" x="242" y="345" width="5" height="30" rx="1" fill="#f5e6c8" />
          <rect className="stump-mid" x="247.5" y="345" width="5" height="30" rx="1" fill="#f5e6c8" />
          <rect className="stump-right" x="253" y="345" width="5" height="30" rx="1" fill="#f5e6c8" />
          <rect x="241.5" y="343" width="7" height="2.5" rx="1" fill="#f5c542" />
          <rect x="248.5" y="343" width="7" height="2.5" rx="1" fill="#f5c542" />
        </g>
        <g id="bowler-stumps" filter="url(#stumpGlow)">
          <rect x="242" y="145" width="5" height="30" rx="1" fill="#f5e6c8" />
          <rect x="247.5" y="145" width="5" height="30" rx="1" fill="#f5e6c8" />
          <rect x="253" y="145" width="5" height="30" rx="1" fill="#f5e6c8" />
          <rect x="241.5" y="143" width="7" height="2.5" rx="1" fill="#f5c542" />
          <rect x="248.5" y="143" width="7" height="2.5" rx="1" fill="#f5c542" />
        </g>
        <g id="bowler" transform="translate(250, 132) scale(0.62)">
          <ellipse cx="0" cy="-28" rx="8" ry="7" fill="#b71c1c" />
          <path d="M 8 -26 Q 14 -24 13 -21 L 7 -23 Z" fill="#8b0000" />
          <ellipse cx="0" cy="-27" rx="6" ry="6.5" fill="#c68642" />
          <rect x="-7" y="-20" width="14" height="18" rx="3" fill="white" />
          <rect x="-7" y="-15" width="14" height="3" fill="#b71c1c" opacity="0.7" />
          <g className={gamePhase === 'bowling' ? 'bowler-arm-swing' : ''}>
            <line x1="7" y1="-16" x2="14" y2="-28" stroke="#c68642" strokeWidth="5" strokeLinecap="round" />
            <line x1="14" y1="-28" x2="10" y2="-40" stroke="#c68642" strokeWidth="4" strokeLinecap="round" />
          </g>
          <line x1="-7" y1="-16" x2="-13" y2="-8" stroke="#c68642" strokeWidth="4" strokeLinecap="round" />
          <line x1="3" y1="-2" x2="8" y2="16" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="10" cy="17" rx="6" ry="2.5" fill="#222" />
          <line x1="-3" y1="-2" x2="-10" y2="14" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="-12" cy="15" rx="6" ry="2.5" fill="#222" />
          {gamePhase !== 'bowling' && (
            <>
              <circle cx="9" cy="-43" r="5" fill="#cc1100" />
              <path d="M 6 -45 Q 9 -42 12 -44" fill="none" stroke="white" strokeWidth="0.8" />
            </>
          )}
        </g>
        <g
          id="batsman"
          className={gamePhase === 'result' ? 'hitting' : ''}
          transform="translate(250, 370)"
          opacity={runnerState.active ? 0 : 1}
        >
          <ellipse cx="0" cy="-62" rx="10" ry="9" fill="#1a237e" />
          <path d="M -10 -58 Q -16 -56 -14 -52 L -8 -54 Z" fill="#111" />
          <line x1="-10" y1="-56" x2="-14" y2="-48" stroke="#aaa" strokeWidth="1" />
          <line x1="-8" y1="-56" x2="-12" y2="-48" stroke="#aaa" strokeWidth="1" />
          <line x1="-11" y1="-52" x2="-7" y2="-52" stroke="#aaa" strokeWidth="0.8" />
          <ellipse cx="0" cy="-60" rx="7" ry="8" fill="#d4956a" />
          <rect x="-8" y="-50" width="16" height="22" rx="3" fill="white" />
          <rect x="-8" y="-44" width="16" height="3" fill="#1a237e" opacity="0.6" />
          <rect x="-10" y="-28" width="8" height="28" rx="3" fill="#e8e8e8" />
          <line x1="-10" y1="-22" x2="-2" y2="-22" stroke="#bbb" strokeWidth="1" />
          <line x1="-10" y1="-14" x2="-2" y2="-14" stroke="#bbb" strokeWidth="1" />
          <rect x="2" y="-28" width="8" height="28" rx="3" fill="#d8d8d8" />
          <line x1="2" y1="-22" x2="10" y2="-22" stroke="#bbb" strokeWidth="1" />
          <ellipse cx="12" cy="-34" rx="5" ry="4" fill="#cc2200" />
          <ellipse cx="13" cy="-26" rx="4" ry="3.5" fill="#cc2200" />
          <line x1="9" y1="-36" x2="8" y2="-39" stroke="#aa1100" strokeWidth="1" />
          <line x1="11" y1="-37" x2="10" y2="-40" stroke="#aa1100" strokeWidth="1" />
          <line x1="13" y1="-37" x2="13" y2="-40" stroke="#aa1100" strokeWidth="1" />
          <rect x="11" y="-50" width="3.5" height="20" rx="1.5" fill="#8B4513" transform="rotate(15, 12, -40)" />
          <rect x="10" y="-30" width="10" height="22" rx="2" fill="#DEB887" transform="rotate(15, 15, -19)" />
          <rect x="11.5" y="-26" width="7" height="16" rx="1" fill="#F5DEB3" opacity="0.6" transform="rotate(15, 15, -18)" />
          <line x1="8" y1="-46" x2="12" y2="-34" stroke="#d4956a" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="-6" cy="0" rx="7" ry="3" fill="#222" />
          <ellipse cx="6" cy="0" rx="6" ry="3" fill="#1a1a1a" />
        </g>
        <g
          id="non-striker"
          className={runnerState.active ? 'runner-moving' : ''}
          transform={`translate(${runnerState.active ? runnerState.nonStrikerX : nonStrikerHomeX}, ${runnerState.active ? runnerState.nonStrikerY : nonStrikerHomeY}) scale(0.68) rotate(180)`}
          opacity="0.95"
        >
          <ellipse cx="0" cy="-62" rx="10" ry="9" fill="#1a237e" />
          <ellipse cx="0" cy="-60" rx="7" ry="8" fill="#d4956a" />
          <rect x="-8" y="-50" width="16" height="22" rx="3" fill="white" />
          <rect x="-10" y="-28" width="8" height="28" rx="3" fill="#e8e8e8" />
          <rect x="2" y="-28" width="8" height="28" rx="3" fill="#d8d8d8" />
          <ellipse cx="-6" cy="0" rx="7" ry="3" fill="#222" />
          <ellipse cx="6" cy="0" rx="6" ry="3" fill="#1a1a1a" />
          <rect x="10" y="-30" width="10" height="22" rx="2" fill="#DEB887" transform="rotate(15, 15, -19)" />
        </g>
        {runnerState.active && (
          <g id="striker-runner" transform={`translate(${runnerState.strikerX}, ${runnerState.strikerY})`} opacity="0.88">
            <ellipse cx="0" cy="-62" rx="10" ry="9" fill="#1a237e" />
            <ellipse cx="0" cy="-60" rx="7" ry="8" fill="#d4956a" />
            <rect x="-8" y="-50" width="16" height="22" rx="3" fill="white" />
            <rect x="-10" y="-28" width="8" height="28" rx="3" fill="#e8e8e8" />
            <rect x="2" y="-28" width="8" height="28" rx="3" fill="#d8d8d8" />
            <ellipse cx="-6" cy="0" rx="7" ry="3" fill="#222" />
            <ellipse cx="6" cy="0" rx="6" ry="3" fill="#1a1a1a" />
          </g>
        )}
        <g className="fielders-pack" opacity="0.93">
          <g transform="translate(358 234) scale(1.36)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(304 176) scale(1.28)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(194 178) scale(1.28)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(144 292) scale(1.36)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(118 252) scale(1.28)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(374 116) scale(1.28)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(96 124) scale(1.28)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g transform="translate(430 292) scale(1.28)">
            <circle cx="0" cy="-16" r="4" fill="#c68642" />
            <ellipse cx="0" cy="-19" rx="4.5" ry="2.5" fill="#b71c1c" />
            <rect x="-4" y="-12" width="8" height="9" rx="2" fill="white" />
            <rect x="-4" y="-9" width="8" height="2" fill="#b71c1c" />
            <line x1="-2" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
        <rect x="18" y="40" width="6" height="50" fill="#555" />
        <rect x="476" y="40" width="6" height="50" fill="#555" />
        <rect x="18" y="430" width="6" height="50" fill="#555" />
        <rect x="476" y="430" width="6" height="50" fill="#555" />
        <ellipse cx="21" cy="38" rx="80" ry="70" fill="url(#flood-grad)" />
        <ellipse cx="479" cy="38" rx="80" ry="70" fill="url(#flood-grad)" />
        <ellipse cx="21" cy="482" rx="80" ry="70" fill="url(#flood-grad)" />
        <ellipse cx="479" cy="482" rx="80" ry="70" fill="url(#flood-grad)" />
      </svg>
      <div
        className="ball-sprite"
        style={{
          left: `${(ballPos.x / 500) * 100}%`,
          top: `${(ballPos.y / 520) * 100}%`,
          transform: `translate(-50%, -50%) scale(${ballPos.scale})`,
          opacity: ballPos.opacity,
        }}
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="boundary-particle"
          style={{
            left: `${(p.x / 500) * 100}%`,
            top: `${(p.y / 520) * 100}%`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}
