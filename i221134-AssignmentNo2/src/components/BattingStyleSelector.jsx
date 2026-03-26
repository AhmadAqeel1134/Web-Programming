const entries = [
  { key: 'wicket', text: 'Wicket', color: 'var(--seg-wicket)' },
  { key: 'dot', text: 'Dot', color: 'var(--seg-dot)' },
  { key: 'one', text: '1', color: 'var(--seg-one)' },
  { key: 'two', text: '2', color: 'var(--seg-two)' },
  { key: 'three', text: '3', color: 'var(--seg-three)' },
  { key: 'four', text: '4', color: 'var(--seg-four)' },
  { key: 'six', text: '6', color: 'var(--seg-six)' },
]

export default function BattingStyleSelector({ value, onChange, probabilities, disabled }) {
  return (
    <section className="style-selector">
      <div className="style-buttons">
        <button
          type="button"
          className={`style-btn ${value === 'aggressive' ? 'active-aggressive' : ''}`}
          disabled={disabled}
          onClick={() => onChange('aggressive')}
        >
          ⚡ AGGRESSIVE
        </button>
        <button
          type="button"
          className={`style-btn ${value === 'defensive' ? 'active-defensive' : ''}`}
          disabled={disabled}
          onClick={() => onChange('defensive')}
        >
          🛡 DEFENSIVE
        </button>
      </div>
      <div className="probability-legend">
        {entries.map((entry) => (
          <div key={entry.key} className="legend-item">
            <span className="legend-dot" style={{ background: entry.color }} />
            <span>{`${entry.text}: ${(probabilities[entry.key] * 100).toFixed(0)}%`}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
