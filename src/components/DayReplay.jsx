import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function scoreAtIndex(logs, idx) {
  let s = 0;
  for (let i = 0; i <= idx; i++) s += logs[i].weight;
  return s;
}

function ropePercent(score) {
  const clamped = Math.max(-30, Math.min(30, score));
  return 50 + (clamped / 30) * 50;
}

export default function DayReplay({ logs, finalScore, onClose }) {
  const [step, setStep] = useState(-1); // -1 = intro
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  const totalSteps = logs.length;
  const currentScore = step < 0 ? 0 : scoreAtIndex(logs, step);
  const pct = ropePercent(currentScore);

  const winState = finalScore > 5 ? 'best' : finalScore < -5 ? 'worst' : 'tie';

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= totalSteps - 1) {
            setPlaying(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, totalSteps]);

  const start = () => {
    setStep(-1);
    setTimeout(() => {
      setStep(0);
      setPlaying(true);
    }, 400);
  };

  const currentLog = step >= 0 ? logs[step] : null;

  return (
    <div className="replay-overlay">
      <div className="replay-panel">
        <button className="close-btn replay-close" onClick={onClose}>✕</button>
        <h2 className="replay-title">⚔️ Day Replay</h2>

        {/* Mini rope */}
        <div className="replay-rope-wrapper">
          <div className="replay-rope-track">
            <motion.div
              className="replay-knot"
              animate={{ left: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            >▼</motion.div>
            <motion.div
              className="replay-fill-bad"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            />
            <div className="replay-fill-good" />
          </div>
          <div className="rope-labels">
            <span className="worst-label-small">💀</span>
            <span className="best-label-small">🪽</span>
          </div>
        </div>

        {/* Score */}
        <motion.div
          className={`replay-score ${currentScore > 0 ? 'pos' : currentScore < 0 ? 'neg' : 'zero'}`}
          key={currentScore}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
        >
          {currentScore > 0 ? '+' : ''}{currentScore}
        </motion.div>

        {/* Current event */}
        <div className="replay-event-zone">
          <AnimatePresence mode="wait">
            {step === -1 && (
              <motion.div key="intro" className="replay-event" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="event-emoji">⚔️</span>
                <span className="event-text">Get ready...</span>
              </motion.div>
            )}
            {currentLog && (
              <motion.div
                key={currentLog.id}
                className={`replay-event ${currentLog.weight > 0 ? 'event-win' : 'event-loss'}`}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <span className="event-emoji">{currentLog.emoji}</span>
                <div>
                  <div className="event-text">{currentLog.label}</div>
                  <div className={`event-weight ${currentLog.weight > 0 ? 'pos' : 'neg'}`}>
                    {currentLog.weight > 0 ? '+' : ''}{currentLog.weight}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        {totalSteps > 0 && (
          <div className="replay-dots">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`replay-dot ${i <= step ? (log.weight > 0 ? 'dot-win' : 'dot-loss') : 'dot-empty'}`}
              />
            ))}
          </div>
        )}

        {/* Final verdict */}
        {step >= totalSteps - 1 && !playing && (
          <motion.div
            className={`final-verdict ${winState}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            {winState === 'best' && <><span>🏆</span> Best Self Won!</>}
            {winState === 'worst' && <><span>💀</span> Worst Self Won</>}
            {winState === 'tie' && <><span>⚖️</span> It's a Draw</>}
          </motion.div>
        )}

        {/* Controls */}
        <div className="replay-controls">
          {!playing && step < totalSteps - 1 && (
            <button className="replay-btn" onClick={start}>
              {step < 0 ? '▶ Play Replay' : '↺ Restart'}
            </button>
          )}
          {playing && (
            <button className="replay-btn pause" onClick={() => setPlaying(false)}>
              ⏸ Pause
            </button>
          )}
          {!playing && step >= 0 && step < totalSteps - 1 && (
            <button className="replay-btn" onClick={() => setPlaying(true)}>
              ▶ Resume
            </button>
          )}
          {!playing && step === totalSteps - 1 && (
            <button className="replay-btn" onClick={start}>
              ↺ Watch Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
