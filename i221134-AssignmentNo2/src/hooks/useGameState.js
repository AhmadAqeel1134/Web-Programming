import { useMemo, useReducer } from 'react'
import { COMMENTARY, PROBABILITIES, RUN_VALUES } from '../data/probabilities'

const initialState = {
  runs: 0,
  wickets: 0,
  ballsPlayed: 0,
  maxBalls: 12,
  maxWickets: 2,
  battingStyle: 'aggressive',
  gamePhase: 'ready',
  lastOutcome: null,
  lastRunsScored: null,
  ballHistory: [],
  commentary: '',
  commentaryEventId: 0,
  commentaryHistory: [],
  sliderRunning: false,
}

function pickCommentary(outcome) {
  const arr = COMMENTARY[outcome] ?? ['Play continues.']
  return arr[Math.floor(Math.random() * arr.length)]
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STYLE':
      if (state.gamePhase !== 'ready') return state
      return { ...state, battingStyle: action.payload, sliderRunning: false }
    case 'START_BOWL':
      if (state.gamePhase !== 'ready') return state
      return { ...state, gamePhase: 'bowling', sliderRunning: false }
    case 'START_PLAY':
      if (state.gamePhase !== 'bowling') return state
      return { ...state, gamePhase: 'playing', sliderRunning: true }
    case 'RECORD_SHOT': {
      if (state.gamePhase !== 'playing') return state
      const outcome = action.payload
      const runsScored = RUN_VALUES[outcome]
      const wickets = outcome === 'wicket' ? state.wickets + 1 : state.wickets
      const ballsPlayed = state.ballsPlayed + 1
      const runs = runsScored ? state.runs + runsScored : state.runs
      const overIdx = Math.floor((ballsPlayed - 1) / 6)
      const ballInOver = ((ballsPlayed - 1) % 6) + 1
      const ballLabel = `${overIdx}.${ballInOver}`
      const commentaryText = pickCommentary(outcome)
      const shotLabel = outcome === 'wicket' ? 'WICKET' : `${runsScored} RUN${runsScored === 1 ? '' : 'S'}`
      const entry = {
        id: state.commentaryEventId + 1,
        ballLabel,
        text: commentaryText,
        outcome,
        shotLabel,
        totalRuns: runs,
        battingStyle: state.battingStyle,
      }
      const gameOver = wickets >= state.maxWickets || ballsPlayed >= state.maxBalls
      return {
        ...state,
        runs,
        wickets,
        ballsPlayed,
        gamePhase: gameOver ? 'gameover' : 'result',
        sliderRunning: false,
        lastOutcome: outcome,
        lastRunsScored: runsScored,
        ballHistory: [...state.ballHistory, outcome],
        commentary: commentaryText,
        commentaryEventId: state.commentaryEventId + 1,
        commentaryHistory: [entry, ...state.commentaryHistory],
      }
    }
    case 'NEXT_BALL':
      if (state.gamePhase !== 'result') return state
      return { ...state, gamePhase: 'ready', lastRunsScored: null }
    case 'CLEAR_COMMENTARY':
      return { ...state, commentaryHistory: [] }
    case 'RESTART':
      return { ...initialState }
    default:
      return state
  }
}

export default function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const derived = useMemo(() => {
    const { ballsPlayed, maxBalls, wickets, maxWickets, battingStyle, runs } = state
    const oversDisplay = `${Math.floor(ballsPlayed / 6)}.${ballsPlayed % 6}`
    const ballsRemaining = maxBalls - ballsPlayed
    const isGameOver = wickets >= maxWickets || ballsPlayed >= maxBalls
    const currentProbabilities = PROBABILITIES[battingStyle]
    const runRate = ballsPlayed ? (runs / (ballsPlayed / 6)).toFixed(2) : '0.00'
    return { oversDisplay, ballsRemaining, isGameOver, currentProbabilities, runRate }
  }, [state])

  return { state, dispatch, ...derived }
}
