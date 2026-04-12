import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, animate as animateMV } from 'framer-motion';

const LEFT_GRIP_X  = 155;
const RIGHT_GRIP_X = 245;
const ROPE_Y = 94;

function scoreAtIndex(logs, idx) {
  let s = 0;
  for (let i = 0; i <= idx; i++) s += logs[i].weight;
  return s;
}
function toRopePct(score) {
  const clamped = Math.max(-30, Math.min(30, score));
  return 50 + (clamped / 30) * 50;
}

// ── Elbow MotionValue pair that can be driven imperatively ──
function useElbow(startX, startY) {
  const x = useMotionValue(startX);
  const y = useMotionValue(startY);
  return { x, y, startX, startY };
}

// Run a looping pull animation on an elbow pair
function startPull(elbow, pullX, pullY, delay = 0) {
  const cx = animateMV(elbow.x, [elbow.startX, pullX, pullX, elbow.startX], {
    duration: 1.4, repeat: Infinity,
    ease: [0.4, 0, 0.6, 1],
    times: [0, 0.35, 0.65, 1],
    delay,
  });
  const cy = animateMV(elbow.y, [elbow.startY, pullY, pullY, elbow.startY], {
    duration: 1.4, repeat: Infinity,
    ease: [0.4, 0, 0.6, 1],
    times: [0, 0.35, 0.65, 1],
    delay,
  });
  return () => { cx.stop(); cy.stop(); };
}

// Snap an elbow to a target position (for victory / defeat pose)
function snapElbow(elbow, tx, ty) {
  animateMV(elbow.x, tx, { type: 'spring', stiffness: 80, damping: 14 });
  animateMV(elbow.y, ty, { type: 'spring', stiffness: 80, damping: 14 });
}

function ReplayArena({ pct, phase, winState }) {
  const springPct = useSpring(pct, { stiffness: 55, damping: 22 });
  useEffect(() => { springPct.set(pct); }, [pct, springPct]);

  const knotX     = useTransform(springPct, v => LEFT_GRIP_X + (v / 100) * (RIGHT_GRIP_X - LEFT_GRIP_X));
  const worstLean = useTransform(springPct, [0, 50, 100], [-14, 0, 18]);
  const bestLean  = useTransform(springPct, [0, 50, 100], [18, 0, -14]);

  const isDone    = phase === 'done';
  const isPlaying = phase === 'playing';
  const worstFalls = isDone && winState === 'best';
  const bestFalls  = isDone && winState === 'worst';
  const isTie      = isDone && winState === 'tie';

  // ── Worst Self elbows ──
  const wrElbow = useElbow(132, 88);  // right arm of left figure
  const wlElbow = useElbow(98,  95);  // left arm

  // ── Best Self elbows ──
  const blElbow = useElbow(268, 88);  // left arm of right figure
  const brElbow = useElbow(302, 95);  // right arm

  useEffect(() => {
    if (phase === 'playing') {
      const stopWr = startPull(wrElbow, 118, 60, 0);
      const stopWl = startPull(wlElbow, 78,  72, 0.28);
      const stopBl = startPull(blElbow, 282, 60, 0);
      const stopBr = startPull(brElbow, 320, 72, 0.28);
      return () => { stopWr(); stopWl(); stopBl(); stopBr(); };
    }

    if (phase === 'done') {
      if (worstFalls) {
        // Worst self falls forward — arms splay
        snapElbow(wrElbow, 148, 52);
        snapElbow(wlElbow, 32,  56);
        // Best self victory — arms raise
        snapElbow(blElbow, 255, 60);
        snapElbow(brElbow, 360, 48);
      } else if (bestFalls) {
        // Best self falls forward — arms splay
        snapElbow(blElbow, 252, 52);
        snapElbow(brElbow, 368, 56);
        // Worst self victory — arms raise
        snapElbow(wrElbow, 148, 48);
        snapElbow(wlElbow, 26,  46);
      } else {
        // Tie — arms lower with slight raise
        snapElbow(wrElbow, 148, 82);
        snapElbow(wlElbow, 90,  85);
        snapElbow(blElbow, 262, 82);
        snapElbow(brElbow, 312, 85);
      }
    }

    if (phase === 'idle') {
      // Reset to neutral grip
      snapElbow(wrElbow, 132, 88);
      snapElbow(wlElbow, 98,  95);
      snapElbow(blElbow, 268, 88);
      snapElbow(brElbow, 302, 95);
    }
  }, [phase]); // eslint-disable-line

  return (
    <svg
      viewBox="0 0 400 230"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', display: 'block', overflow: 'visible' }}
    >
      {/* ════ WORST SELF ════ */}
      <motion.g
        style={{ rotate: isDone ? undefined : worstLean }}
        animate={isDone ? {
          rotate: worstFalls ? 92 : isTie ? 4 : -12,
          x: worstFalls ? 28 : 0,
          y: worstFalls ? 16 : 0,
        } : {}}
        transition={isDone ? { type: 'spring', stiffness: 55, damping: 13, delay: 0.25 } : {}}
        transformOrigin="85px 200px"
      >
        {/* Body strain bob — stops when done */}
        <motion.g
          animate={isDone ? { y: 0 } : isPlaying ? { y: [0, -4, 0] } : { y: 0 }}
          transition={isDone ? { duration: 0.2 } : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="85" cy="204" rx="36" ry="5" fill="rgba(0,0,0,0.35)" />
          {/* Legs */}
          <line x1="72"  y1="138" x2="38"  y2="168" stroke="#6e1f1f" strokeWidth="13" strokeLinecap="round" />
          <line x1="38"  y1="168" x2="18"  y2="200" stroke="#6e1f1f" strokeWidth="12" strokeLinecap="round" />
          <line x1="92"  y1="138" x2="112" y2="168" stroke="#6e1f1f" strokeWidth="13" strokeLinecap="round" />
          <line x1="112" y1="168" x2="100" y2="200" stroke="#6e1f1f" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="18"  cy="202" rx="16" ry="6" fill="#3d0f0f" />
          <ellipse cx="100" cy="202" rx="14" ry="6" fill="#3d0f0f" />
          {/* Torso */}
          <polygon points="60,78 114,74 104,138 55,140" fill="#8b1a1a" />
          <line x1="85" y1="78" x2="80" y2="125" stroke="#6e1f1f" strokeWidth="2" strokeOpacity="0.5" />
          <circle cx="61"  cy="79" r="13" fill="#a82020" />
          <circle cx="113" cy="75" r="14" fill="#a82020" />

          {/* ── Animated Arms ── */}
          <motion.line x1="61"  y1="79"  x2={wlElbow.x} y2={wlElbow.y} stroke="#a82020" strokeWidth="12" strokeLinecap="round" />
          <motion.line x1={wlElbow.x} y1={wlElbow.y} x2="148" y2="97" stroke="#c0392b" strokeWidth="11" strokeLinecap="round" />
          <motion.line x1="113" y1="75"  x2={wrElbow.x} y2={wrElbow.y} stroke="#a82020" strokeWidth="12" strokeLinecap="round" />
          <motion.line x1={wrElbow.x} y1={wrElbow.y} x2="152" y2="91" stroke="#c0392b" strokeWidth="11" strokeLinecap="round" />

          {/* Fists — only during play */}
          {!isDone && (
            <>
              <ellipse cx="150" cy="93" rx="10" ry="8" fill="#c0392b" />
              <ellipse cx="147" cy="99" rx="10" ry="7" fill="#b03020" />
              <line x1="144" y1="89" x2="144" y2="97" stroke="#8b1a1a" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="148" y1="88" x2="148" y2="96" stroke="#8b1a1a" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="152" y1="89" x2="152" y2="96" stroke="#8b1a1a" strokeWidth="1.5" strokeOpacity="0.6" />
            </>
          )}

          {/* Neck + Head */}
          <polygon points="78,62 94,60 98,78 74,80" fill="#c0392b" />
          <circle cx="87" cy="44" r="20" fill="#c0392b" />
          <ellipse cx="68"  cy="44" rx="6" ry="8" fill="#c0392b" />
          <ellipse cx="106" cy="43" rx="6" ry="8" fill="#c0392b" />
          <ellipse cx="80" cy="41" rx="4.5" ry="4"   fill="white" />
          <ellipse cx="93" cy="40" rx="5"   ry="4.5" fill="white" />
          <circle cx="81.5" cy="41" r="2.5" fill="#0d0d0d" />
          <circle cx="94.5" cy="40" r="2.8" fill="#0d0d0d" />
          <circle cx="82" cy="40" r="1" fill="white" />
          <circle cx="95" cy="39" r="1" fill="white" />
          {/* Brows: X eyes if fallen, else angry */}
          {worstFalls && isDone ? (
            <>
              <line x1="76" y1="35" x2="84" y2="43" stroke="#5a0f0f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="84" y1="35" x2="76" y2="43" stroke="#5a0f0f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="89" y1="34" x2="97" y2="42" stroke="#5a0f0f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="97" y1="34" x2="89" y2="42" stroke="#5a0f0f" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M75 35 Q81 31 87 35" stroke="#5a0f0f" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M88 34 Q95 30 101 34" stroke="#5a0f0f" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
          {/* Mouth */}
          {isDone && !worstFalls
            ? <path d="M79 52 Q87 58 95 52" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            : <rect x="80" y="50" width="16" height="7" rx="2" fill="#fff" opacity="0.85" />
          }
          <path d="M68 35 Q87 18 106 32" stroke="#2a0a0a" strokeWidth="8" fill="none" strokeLinecap="round" />

          {/* Victory stars */}
          {isDone && !worstFalls && (
            <>
              <motion.text x="20" y="14" fontSize="16" textAnchor="middle"
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.9, type: 'spring' }}>⭐</motion.text>
              <motion.text x="55" y="6" fontSize="11" textAnchor="middle"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: 'spring' }}>✨</motion.text>
            </>
          )}
        </motion.g>
      </motion.g>

      {/* ════ ROPE ════ */}
      <line x1={LEFT_GRIP_X} y1={ROPE_Y + 6} x2={RIGHT_GRIP_X} y2={ROPE_Y + 6}
        stroke="rgba(0,0,0,0.25)" strokeWidth="9" strokeLinecap="round" />
      <line x1={LEFT_GRIP_X} y1={ROPE_Y} x2={RIGHT_GRIP_X} y2={ROPE_Y}
        stroke="#3A2505" strokeWidth="11" strokeLinecap="round" />
      <line x1={LEFT_GRIP_X} y1={ROPE_Y} x2={RIGHT_GRIP_X} y2={ROPE_Y}
        stroke="#8B6914" strokeWidth="7" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = LEFT_GRIP_X + 2 + i * 11;
        return (
          <line key={i} x1={x} y1={ROPE_Y - 2.5} x2={x + 7} y2={ROPE_Y + 2.5}
            stroke="#A8820A" strokeWidth="2" strokeLinecap="round" />
        );
      })}
      {/* Coloured sides */}
      <motion.line x1={LEFT_GRIP_X} y1={ROPE_Y} x2={knotX} y2={ROPE_Y}
        stroke="#c0392b" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.75" />
      <motion.line x1={knotX} y1={ROPE_Y} x2={RIGHT_GRIP_X} y2={ROPE_Y}
        stroke="#2980b9" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.75" />
      {/* Rope knot */}
      <motion.g style={{ x: knotX, y: ROPE_Y }}>
        <ellipse cx="0" cy="2"  rx="12" ry="8"   fill="#2A1803" />
        <ellipse cx="0" cy="2"  rx="11" ry="6.5"  fill="#5A3E0A" />
        <ellipse cx="0" cy="-1" rx="12" ry="6"    fill="#6B4D0F" />
        <ellipse cx="0" cy="0.5" rx="9" ry="4.5"  fill="#8B6914" />
        <ellipse cx="-1" cy="0" rx="5" ry="3"     fill="#A8820A" />
        <ellipse cx="-3" cy="-2" rx="2" ry="1.2"  fill="#C4A030" opacity="0.55" />
      </motion.g>

      {/* ════ BEST SELF ════ */}
      <motion.g
        style={{ rotate: isDone ? undefined : bestLean }}
        animate={isDone ? {
          rotate: bestFalls ? -92 : isTie ? -4 : 12,
          x: bestFalls ? -28 : 0,
          y: bestFalls ? 16 : 0,
        } : {}}
        transition={isDone ? { type: 'spring', stiffness: 55, damping: 13, delay: 0.25 } : {}}
        transformOrigin="315px 200px"
      >
        <motion.g
          animate={isDone ? { y: 0 } : isPlaying ? { y: [0, -4, 0] } : { y: 0 }}
          transition={isDone ? { duration: 0.2 } : { duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.18 }}
        >
          <ellipse cx="315" cy="204" rx="36" ry="5" fill="rgba(0,0,0,0.35)" />
          {/* Legs */}
          <line x1="328" y1="138" x2="362" y2="168" stroke="#0d3d6e" strokeWidth="13" strokeLinecap="round" />
          <line x1="362" y1="168" x2="382" y2="200" stroke="#0d3d6e" strokeWidth="12" strokeLinecap="round" />
          <line x1="308" y1="138" x2="288" y2="168" stroke="#0d3d6e" strokeWidth="13" strokeLinecap="round" />
          <line x1="288" y1="168" x2="300" y2="200" stroke="#0d3d6e" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="382" cy="202" rx="16" ry="6" fill="#061e36" />
          <ellipse cx="300" cy="202" rx="14" ry="6" fill="#061e36" />
          {/* Torso */}
          <polygon points="340,78 286,74 296,138 345,140" fill="#1a5276" />
          <line x1="315" y1="78" x2="320" y2="125" stroke="#0d3d6e" strokeWidth="2" strokeOpacity="0.5" />
          <circle cx="339" cy="79" r="13" fill="#2471a3" />
          <circle cx="287" cy="75" r="14" fill="#2471a3" />

          {/* ── Animated Arms ── */}
          <motion.line x1="287" y1="75"  x2={blElbow.x} y2={blElbow.y} stroke="#2471a3" strokeWidth="12" strokeLinecap="round" />
          <motion.line x1={blElbow.x} y1={blElbow.y} x2="248" y2="91"  stroke="#2e86c1" strokeWidth="11" strokeLinecap="round" />
          <motion.line x1="339" y1="79"  x2={brElbow.x} y2={brElbow.y} stroke="#2471a3" strokeWidth="12" strokeLinecap="round" />
          <motion.line x1={brElbow.x} y1={brElbow.y} x2="252" y2="97"  stroke="#2e86c1" strokeWidth="11" strokeLinecap="round" />

          {/* Fists */}
          {!isDone && (
            <>
              <ellipse cx="250" cy="93" rx="10" ry="8" fill="#2e86c1" />
              <ellipse cx="253" cy="99" rx="10" ry="7" fill="#1a6ea8" />
              <line x1="247" y1="89" x2="247" y2="97" stroke="#0d3d6e" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="251" y1="88" x2="251" y2="96" stroke="#0d3d6e" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="255" y1="89" x2="255" y2="96" stroke="#0d3d6e" strokeWidth="1.5" strokeOpacity="0.6" />
            </>
          )}

          {/* Neck + Head */}
          <polygon points="306,62 322,60 326,78 302,80" fill="#2e86c1" />
          <circle cx="313" cy="44" r="20" fill="#2e86c1" />
          <ellipse cx="294" cy="43" rx="6" ry="8" fill="#2e86c1" />
          <ellipse cx="332" cy="44" rx="6" ry="8" fill="#2e86c1" />
          <ellipse cx="307" cy="41" rx="5"   ry="4.5" fill="white" />
          <ellipse cx="320" cy="40" rx="4.5" ry="4"   fill="white" />
          <circle cx="305.5" cy="41" r="2.8" fill="#0d0d0d" />
          <circle cx="318.5" cy="40" r="2.5" fill="#0d0d0d" />
          <circle cx="305" cy="40" r="1" fill="white" />
          <circle cx="318" cy="39" r="1" fill="white" />
          {bestFalls && isDone ? (
            <>
              <line x1="302" y1="35" x2="310" y2="43" stroke="#0a2744" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="310" y1="35" x2="302" y2="43" stroke="#0a2744" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="315" y1="34" x2="323" y2="42" stroke="#0a2744" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="323" y1="34" x2="315" y2="42" stroke="#0a2744" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M299 35 Q305 31 312 34" stroke="#0a2744" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M313 34 Q319 30 325 35" stroke="#0a2744" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
          {isDone && !bestFalls
            ? <path d="M305 52 Q313 58 321 52" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            : <rect x="304" y="50" width="16" height="7" rx="2" fill="#fff" opacity="0.85" />
          }
          <path d="M294 35 Q313 18 332 32" stroke="#0a1a2e" strokeWidth="7" fill="none" strokeLinecap="round" />

          {/* Victory stars */}
          {isDone && !bestFalls && (
            <>
              <motion.text x="380" y="14" fontSize="16" textAnchor="middle"
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.9, type: 'spring' }}>⭐</motion.text>
              <motion.text x="345" y="6" fontSize="11" textAnchor="middle"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: 'spring' }}>✨</motion.text>
            </>
          )}
        </motion.g>
      </motion.g>

      {/* Labels */}
      <text x="52"  y="222" textAnchor="middle" fontSize="10" fill="#e74c3c" fontWeight="800" letterSpacing="0.5">💀 WORST</text>
      <text x="348" y="222" textAnchor="middle" fontSize="10" fill="#3498db" fontWeight="800" letterSpacing="0.5">BEST 🪽</text>
    </svg>
  );
}

export default function DayReplay({ logs, finalScore, onClose }) {
  const [step, setStep]     = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase]   = useState('idle');
  const intervalRef         = useRef(null);

  const totalSteps   = logs.length;
  const currentScore = step < 0 ? 0 : scoreAtIndex(logs, step);
  const pct          = toRopePct(currentScore);
  const winState     = finalScore > 5 ? 'best' : finalScore < -5 ? 'worst' : 'tie';
  const currentLog   = step >= 0 ? logs[step] : null;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= totalSteps - 1) {
            setPlaying(false);
            clearInterval(intervalRef.current);
            setTimeout(() => setPhase('done'), 600);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, totalSteps]);

  const start = () => {
    setPhase('idle');
    setStep(-1);
    setTimeout(() => {
      setStep(0);
      setPlaying(true);
      setPhase('playing');
    }, 400);
  };

  return (
    <div className="replay-overlay">
      <div className="replay-panel-full">
        <button className="close-btn replay-close" onClick={onClose}>✕</button>
        <h2 className="replay-title">⚔️ Day Replay</h2>

        <div className="replay-arena-wrap">
          <ReplayArena pct={pct} phase={phase} winState={winState} />
        </div>

        <motion.div
          className={`replay-score ${currentScore > 0 ? 'pos' : currentScore < 0 ? 'neg' : 'zero'}`}
          key={currentScore} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
        >
          {currentScore > 0 ? '+' : ''}{currentScore}
        </motion.div>

        <div className="replay-event-zone">
          <AnimatePresence mode="wait">
            {step === -1 && phase !== 'done' && (
              <motion.div key="intro" className="replay-event"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="event-emoji">⚔️</span>
                <span className="event-text">Get ready...</span>
              </motion.div>
            )}
            {currentLog && phase !== 'done' && (
              <motion.div key={currentLog.id}
                className={`replay-event ${currentLog.weight > 0 ? 'event-win' : 'event-loss'}`}
                initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }} transition={{ duration: 0.3 }}>
                <span className="event-emoji">{currentLog.emoji}</span>
                <div>
                  <div className="event-text">{currentLog.label}</div>
                  <div className={`event-weight ${currentLog.weight > 0 ? 'pos' : 'neg'}`}>
                    {currentLog.weight > 0 ? '+' : ''}{currentLog.weight}
                  </div>
                </div>
              </motion.div>
            )}
            {phase === 'done' && (
              <motion.div key="verdict"
                className={`final-verdict ${winState}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.9 }}>
                {winState === 'best'  && <><span>🏆</span> Best Self Won!</>}
                {winState === 'worst' && <><span>💀</span> Worst Self Won</>}
                {winState === 'tie'   && <><span>⚖️</span> It's a Draw</>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {totalSteps > 0 && (
          <div className="replay-dots">
            {logs.map((log, i) => (
              <div key={i} className={`replay-dot ${i <= step ? (log.weight > 0 ? 'dot-win' : 'dot-loss') : 'dot-empty'}`} />
            ))}
          </div>
        )}

        <div className="replay-controls">
          {phase === 'idle' && (
            <button className="replay-btn" onClick={start}>▶ Play Replay</button>
          )}
          {playing && (
            <button className="replay-btn pause" onClick={() => setPlaying(false)}>⏸ Pause</button>
          )}
          {!playing && phase === 'playing' && step < totalSteps - 1 && (
            <button className="replay-btn" onClick={() => setPlaying(true)}>▶ Resume</button>
          )}
          {phase === 'done' && (
            <button className="replay-btn" onClick={start}>↺ Watch Again</button>
          )}
        </div>
      </div>
    </div>
  );
}
