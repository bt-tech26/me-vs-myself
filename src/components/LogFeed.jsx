import { motion, AnimatePresence } from 'framer-motion';

export default function LogFeed({ logs, onRemove }) {
  const sorted = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  if (sorted.length === 0) {
    return (
      <div className="log-feed-empty">
        No actions logged yet today.<br />Start by logging a win or a loss!
      </div>
    );
  }

  return (
    <div className="log-feed">
      <AnimatePresence initial={false}>
        {sorted.map(log => (
          <motion.div
            key={log.id}
            className={`log-entry ${log.weight > 0 ? 'log-win' : 'log-loss'}`}
            initial={{ opacity: 0, x: log.weight > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <span className="log-emoji">{log.emoji}</span>
            <span className="log-label">{log.label}</span>
            <span className={`log-weight ${log.weight > 0 ? 'pos' : 'neg'}`}>
              {log.weight > 0 ? '+' : ''}{log.weight}
            </span>
            <button className="log-remove" onClick={() => onRemove(log.id)} title="Remove">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
