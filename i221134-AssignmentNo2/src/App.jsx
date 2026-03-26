import { useEffect, useState } from 'react'
import BattingStyleSelector from './components/BattingStyleSelector'
import Commentary from './components/Commentary'
import CricketGround from './components/CricketGround'
import GameOverScreen from './components/GameOverScreen'
import PowerBar, { detectOutcome } from './components/PowerBar'
import Scoreboard from './components/Scoreboard'
import WicketFlash from './components/WicketFlash'
import useGameState from './hooks/useGameState'

function App() {
  const { state, dispatch, oversDisplay, isGameOver, currentProbabilities, runRate, ballsRemaining } = useGameState()
  const [sliderPosition, setSliderPosition] = useState(0)
  const [showOverBanner, setShowOverBanner] = useState(false)

  useEffect(() => {
    if (state.ballsPlayed > 0 && state.ballsPlayed % 6 === 0 && !isGameOver) {
      setShowOverBanner(true)
      const t = setTimeout(() => setShowOverBanner(false), 1500)
      return () => clearTimeout(t)
    }
    return undefined
  }, [state.ballsPlayed, isGameOver])

  useEffect(() => {
    if (state.gamePhase !== 'result') return undefined
    const t = setTimeout(() => dispatch({ type: 'NEXT_BALL' }), 2800)
    return () => clearTimeout(t)
  }, [state.gamePhase, dispatch])

  const phaseButtons = {
    ready: { label: 'BOWL IT', disabled: false, action: () => dispatch({ type: 'START_BOWL' }) },
    bowling: { label: 'BOWLING...', disabled: true, action: () => {} },
    playing: {
      label: 'HIT!',
      disabled: false,
      action: () => {
        const outcome = detectOutcome(sliderPosition, currentProbabilities)
        dispatch({ type: 'RECORD_SHOT', payload: outcome })
      },
    },
    result: { label: 'NEXT BALL ->', disabled: false, action: () => dispatch({ type: 'NEXT_BALL' }) },
    gameover: { label: '', disabled: true, action: () => {} },
  }

  const activeButton = phaseButtons[state.gamePhase]

  return (
    <div className={`app-shell ${state.lastOutcome === 'wicket' && state.gamePhase !== 'ready' ? 'screen-shake' : ''}`}>
      <header className="app-header">CRICKET BLITZ</header>
      <main className="app-grid">
        <section className="ground-panel">
          <CricketGround
            gamePhase={state.gamePhase}
            lastOutcome={state.lastOutcome}
            onBowlingComplete={() => dispatch({ type: 'START_PLAY' })}
          />
        </section>
        <section className="controls-panel">
          <Scoreboard
            runs={state.runs}
            wickets={state.wickets}
            maxWickets={state.maxWickets}
            oversDisplay={oversDisplay}
            maxOvers={state.maxBalls / 6}
            ballHistory={state.ballHistory}
            ballsRemaining={ballsRemaining}
          />
          <BattingStyleSelector
            value={state.battingStyle}
            disabled={state.gamePhase !== 'ready'}
            onChange={(style) => dispatch({ type: 'SET_STYLE', payload: style })}
            probabilities={currentProbabilities}
          />
          <PowerBar
            probabilities={currentProbabilities}
            isRunning={state.sliderRunning}
            gamePhase={state.gamePhase}
            battingStyle={state.battingStyle}
            ballsPlayed={state.ballsPlayed}
            onPositionChange={setSliderPosition}
            buttonLabel={activeButton.label}
            onAction={activeButton.action}
            buttonDisabled={activeButton.disabled}
          />
          <Commentary items={state.commentaryHistory} onClear={() => dispatch({ type: 'CLEAR_COMMENTARY' })} />
        </section>
      </main>
      {showOverBanner && <div className="over-banner">{`END OF OVER ${Math.floor(state.ballsPlayed / 6)}`}</div>}
      <WicketFlash show={state.lastOutcome === 'wicket' && state.gamePhase !== 'ready'} />
      {isGameOver && (
        <GameOverScreen
          runs={state.runs}
          wickets={state.wickets}
          maxWickets={state.maxWickets}
          ballsPlayed={state.ballsPlayed}
          ballHistory={state.ballHistory}
          runRate={runRate}
          commentary={state.commentary}
          onRestart={() => dispatch({ type: 'RESTART' })}
        />
      )}
    </div>
  )
}

export default App
