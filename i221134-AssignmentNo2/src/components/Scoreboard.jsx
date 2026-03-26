import { useEffect, useMemo, useState } from 'react'

const classes = {
  wicket: 'chip-wicket',
  dot: 'chip-dot',
  one: 'chip-one',
  two: 'chip-two',
  three: 'chip-three',
  four: 'chip-four',
  six: 'chip-six',
}

export default function Scoreboard({ runs, wickets, maxWickets, oversDisplay, maxOvers, ballHistory, ballsRemaining }) {
  const [pulse, setPulse] = useState(false)
  const [prevRuns, setPrevRuns] = useState(runs)
  const highlightedIndex = ballHistory.length - 1

  useEffect(() => {
    if (runs > prevRuns) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 400)
      setPrevRuns(runs)
      return () => clearTimeout(t)
    }
    setPrevRuns(runs)
    return undefined
  }, [runs, prevRuns])

  const balls = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => ({
        key: idx,
        outcome: ballHistory[idx] ?? null,
      })),
    [ballHistory],
  )

  return (
    <section className="scoreboard">
      <div className="score-grid">
        <div className="score-card">
          <h4>RUNS</h4>
          <div className={`runs-number ${pulse ? 'score-pop score-glow' : ''}`}>{runs}</div>
        </div>
        <div className="score-card">
          <h4>WICKETS</h4>
          <div className={`wickets-number ${wickets === maxWickets ? 'danger' : ''}`}>{`${wickets}/${maxWickets}`}</div>
        </div>
        <div className="score-card">
          <h4>OVERS</h4>
          <div className="overs-number">{`${oversDisplay}/${maxOvers}`}</div>
        </div>
      </div>
      <div className="ball-tracker">
        {balls.map(({ key, outcome }) => (
          <span
            key={key}
            className={`ball-chip ${outcome ? classes[outcome] : ''} ${key === highlightedIndex ? 'ball-pop' : ''}`}
          />
        ))}
      </div>
      <div className="remaining-label">{`BALLS LEFT: ${ballsRemaining}`}</div>
    </section>
  )
}
