const tone = {
  wicket: 'var(--accent-red)',
  dot: 'var(--seg-dot)',
  one: 'var(--seg-one)',
  two: 'var(--seg-two)',
  three: 'var(--seg-three)',
  four: 'var(--seg-four)',
  six: 'var(--seg-six)',
}

export default function Commentary({ items, onClear }) {
  return (
    <section className="commentary-panel">
      <div className="commentary-header">
        <h4>BALL BY BALL</h4>
        <button type="button" className="commentary-clear" onClick={onClear} disabled={items.length === 0}>
          CLEAR
        </button>
      </div>
      <div className="commentary-list">
        {items.length === 0 ? (
          <p className="commentary-empty">Play a ball to start commentary feed.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="commentary-item" style={{ borderLeftColor: tone[item.outcome] ?? 'var(--accent-gold)' }}>
              <div className="commentary-meta">
                <span>{`OVER ${item.ballLabel}`}</span>
                <span>{item.shotLabel}</span>
                <span>{`TOTAL ${item.totalRuns}`}</span>
              </div>
              <p>{item.text}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
