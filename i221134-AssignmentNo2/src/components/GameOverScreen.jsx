import { useEffect, useMemo, useState } from 'react'

export default function GameOverScreen({ runs, wickets, maxWickets, ballsPlayed, ballHistory, runRate, commentary, onRestart }) {
  const [displayRuns, setDisplayRuns] = useState(0)
  const fours = useMemo(() => ballHistory.filter((item) => item === 'four').length, [ballHistory])
  const sixes = useMemo(() => ballHistory.filter((item) => item === 'six').length, [ballHistory])

  useEffect(() => {
    setDisplayRuns(0)
    const duration = 1500
    const start = performance.now()
    let raf = null
    const tick = (ts) => {
      const p = Math.min((ts - start) / duration, 1)
      setDisplayRuns(Math.floor(runs * p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [runs])

  return (
    <div className="gameover-overlay">
      <div className="gameover-card">
        <h2>INNINGS COMPLETE</h2>
        <h3>FINAL SCORE</h3>
        <div className="gameover-runs">{displayRuns}</div>
        <p>{`Wickets Lost: ${wickets}/${maxWickets}`}</p>
        <p>{`Balls Faced: ${ballsPlayed}`}</p>
        <p>{`Boundaries: ${fours} fours, ${sixes} sixes`}</p>
        <p>{`Run Rate: ${runRate}`}</p>
        {commentary && <p className="final-commentary">{`Last Ball: ${commentary}`}</p>}
        <div className="history-row">
          {ballHistory.map((outcome, index) => (
            <span key={`${outcome}-${index}`} className={`history-chip chip-${outcome}`}>
              {outcome === 'wicket' ? 'W' : outcome === 'dot' ? '.' : outcome.replace('one', '1').replace('two', '2').replace('three', '3')}
            </span>
          ))}
        </div>
        <button type="button" className="restart-btn" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  )
}
