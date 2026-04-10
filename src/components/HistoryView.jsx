import { motion } from 'framer-motion';

function ropePercent(score) {
  const clamped = Math.max(-30, Math.min(30, score));
  return 50 + (clamped / 30) * 50;
}

export default function HistoryView({ history }) {
  if (history.length === 0) {
    return <div className="log-feed-empty">No history yet. Come back tomorrow!</div>;
  }

  return (
    <div className="history-list">
      {history.map(day => {
        const pct = ropePercent(day.score);
        const winState = day.score > 5 ? 'best' : day.score < -5 ? 'worst' : 'tie';
        return (
          <motion.div
            key={day.date}
            className="history-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="history-header">
              <span className="history-date">{day.date}</span>
              <span className={`history-badge ${winState}`}>
                {winState === 'best' ? '🏆 Best Self' : winState === 'worst' ? '💀 Worst Self' : '⚖️ Draw'}
              </span>
              <span className={`history-score ${day.score > 0 ? 'pos' : day.score < 0 ? 'neg' : 'zero'}`}>
                {day.score > 0 ? '+' : ''}{day.score}
              </span>
            </div>
            <div className="mini-rope">
              <div className="mini-fill-bad" style={{ width: `${pct}%` }} />
              <div className="mini-fill-good" style={{ width: `${100 - pct}%` }} />
              <div className="mini-knot" style={{ left: `${pct}%` }}>▼</div>
            </div>
            <div className="history-logs">
              {day.logs.slice(0, 5).map(l => (
                <span key={l.id} className={`history-chip ${l.weight > 0 ? 'chip-win' : 'chip-loss'}`}>
                  {l.emoji} {l.weight > 0 ? '+' : ''}{l.weight}
                </span>
              ))}
              {day.logs.length > 5 && <span className="history-chip chip-more">+{day.logs.length - 5} more</span>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
