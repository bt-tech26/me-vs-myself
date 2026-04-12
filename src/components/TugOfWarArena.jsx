import { motion, useSpring, useTransform, useMotionValue, animate as animateMV } from 'framer-motion';
import { useEffect } from 'react';

const ROPE_Y = 94;
const LEFT_GRIP_X  = 155;
const RIGHT_GRIP_X = 245;

// Drives a MotionValue through a looping pull cycle.
// extendPos → pullPos → hold → extendPos, repeating forever.
function usePullElbow(ex, ey, px, py, delay = 0) {
  const mvX = useMotionValue(ex);
  const mvY = useMotionValue(ey);

  useEffect(() => {
    const cx = animateMV(mvX, [ex, px, px, ex], {
      duration: 1.4, repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
      times: [0, 0.35, 0.65, 1],
      delay,
    });
    const cy = animateMV(mvY, [ey, py, py, ey], {
      duration: 1.4, repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
      times: [0, 0.35, 0.65, 1],
      delay,
    });
    return () => { cx.stop(); cy.stop(); };
  }, []); // eslint-disable-line

  return [mvX, mvY];
}

export default function TugOfWarArena({ ropePercent, score }) {
  const springPct = useSpring(ropePercent, { stiffness: 55, damping: 22 });
  useEffect(() => { springPct.set(ropePercent); }, [ropePercent, springPct]);

  const knotX    = useTransform(springPct, v => LEFT_GRIP_X + (v / 100) * (RIGHT_GRIP_X - LEFT_GRIP_X));
  const worstLean = useTransform(springPct, [0, 50, 100], [-14, 0, 18]);
  const bestLean  = useTransform(springPct, [0, 50, 100],  [18, 0, -14]);

  // ── Worst Self elbow positions ──
  // Right arm (top grip): shoulder (113,75) → hand (152,91)
  //   Extend elbow: (132,88)   Pull elbow: (118,60)
  const [wrEx, wrEy] = usePullElbow(132, 88, 118, 60, 0);
  // Left arm (bottom grip): shoulder (61,79) → hand (148,97)
  //   Extend elbow: (98,95)    Pull elbow: (78,72)
  const [wlEx, wlEy] = usePullElbow(98, 95, 78, 72, 0.28);

  // ── Best Self elbow positions ──
  // Left arm (top grip): shoulder (287,75) → hand (248,91)
  //   Extend elbow: (268,88)   Pull elbow: (282,60)
  const [blEx, blEy] = usePullElbow(268, 88, 282, 60, 0);
  // Right arm (bottom grip): shoulder (339,79) → hand (252,97)
  //   Extend elbow: (302,95)   Pull elbow: (320,72)
  const [brEx, brEy] = usePullElbow(302, 95, 320, 72, 0.28);

  const winState = score > 5 ? 'best' : score < -5 ? 'worst' : 'tie';

  return (
    <div className={`arena-wrapper ${winState === 'worst' ? 'glow-red' : winState === 'best' ? 'glow-blue' : 'glow-neutral'}`}>
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', display: 'block', overflow: 'visible' }}
      >
        {/* ════ WORST SELF ════ */}
        <motion.g style={{ rotate: worstLean }} transformOrigin="85px 200px">
          {/* Body strain bob */}
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
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
            {/* Shoulder caps */}
            <circle cx="61"  cy="79" r="13" fill="#a82020" />
            <circle cx="113" cy="75" r="14" fill="#a82020" />

            {/* ── Animated Arms ── */}
            {/* Left arm: shoulder → elbow → hand */}
            <motion.line x1="61"  y1="79"  x2={wlEx} y2={wlEy} stroke="#a82020" strokeWidth="12" strokeLinecap="round" />
            <motion.line x1={wlEx} y1={wlEy} x2="148" y2="97"  stroke="#c0392b" strokeWidth="11" strokeLinecap="round" />
            {/* Right arm */}
            <motion.line x1="113" y1="75"  x2={wrEx} y2={wrEy} stroke="#a82020" strokeWidth="12" strokeLinecap="round" />
            <motion.line x1={wrEx} y1={wrEy} x2="152" y2="91"  stroke="#c0392b" strokeWidth="11" strokeLinecap="round" />

            {/* Fists */}
            <ellipse cx="150" cy="93" rx="10" ry="8" fill="#c0392b" />
            <ellipse cx="147" cy="99" rx="10" ry="7" fill="#b03020" />
            <line x1="144" y1="89" x2="144" y2="97" stroke="#8b1a1a" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="148" y1="88" x2="148" y2="96" stroke="#8b1a1a" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="152" y1="89" x2="152" y2="96" stroke="#8b1a1a" strokeWidth="1.5" strokeOpacity="0.6" />

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
            <path d="M75 35 Q81 31 87 35" stroke="#5a0f0f" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M88 34 Q95 30 101 34" stroke="#5a0f0f" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="80" y="50" width="16" height="7" rx="2" fill="#fff" opacity="0.85" />
            <line x1="84" y1="50" x2="84" y2="57" stroke="#ccc" strokeWidth="1" />
            <line x1="88" y1="50" x2="88" y2="57" stroke="#ccc" strokeWidth="1" />
            <line x1="92" y1="50" x2="92" y2="57" stroke="#ccc" strokeWidth="1" />
            <path d="M68 35 Q87 18 106 32" stroke="#2a0a0a" strokeWidth="8" fill="none" strokeLinecap="round" />
          </motion.g>
        </motion.g>

        {/* ════ ROPE ════ */}
        {/* Shadow under rope */}
        <line x1={LEFT_GRIP_X} y1={ROPE_Y + 6} x2={RIGHT_GRIP_X} y2={ROPE_Y + 6}
          stroke="rgba(0,0,0,0.25)" strokeWidth="9" strokeLinecap="round" />
        {/* Rope core */}
        <line x1={LEFT_GRIP_X} y1={ROPE_Y} x2={RIGHT_GRIP_X} y2={ROPE_Y}
          stroke="#3A2505" strokeWidth="11" strokeLinecap="round" />
        <line x1={LEFT_GRIP_X} y1={ROPE_Y} x2={RIGHT_GRIP_X} y2={ROPE_Y}
          stroke="#8B6914" strokeWidth="7" strokeLinecap="round" />
        {/* Rope strand twist texture */}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = LEFT_GRIP_X + 2 + i * 11;
          return (
            <line key={i} x1={x} y1={ROPE_Y - 2.5} x2={x + 7} y2={ROPE_Y + 2.5}
              stroke="#A8820A" strokeWidth="2" strokeLinecap="round" />
          );
        })}

        {/* Red side of rope (worst winning side) */}
        <motion.line
          x1={LEFT_GRIP_X} y1={ROPE_Y}
          x2={knotX} y2={ROPE_Y}
          stroke="#c0392b" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.75"
        />
        {/* Blue side */}
        <motion.line
          x1={knotX} y1={ROPE_Y}
          x2={RIGHT_GRIP_X} y2={ROPE_Y}
          stroke="#2980b9" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.75"
        />

        {/* Rope knot — looks like a wrapped tie */}
        <motion.g style={{ x: knotX, y: ROPE_Y }}>
          {/* Outer wrap shadow */}
          <ellipse cx="0" cy="2"  rx="12" ry="8"  fill="#2A1803" />
          {/* Lower wrap */}
          <ellipse cx="0" cy="2"  rx="11" ry="6.5" fill="#5A3E0A" />
          {/* Upper wrap */}
          <ellipse cx="0" cy="-1" rx="12" ry="6"   fill="#6B4D0F" />
          {/* Knot body highlight */}
          <ellipse cx="0" cy="0.5" rx="9" ry="4.5"  fill="#8B6914" />
          {/* Centre shine */}
          <ellipse cx="-2" cy="-1" rx="4.5" ry="2.5" fill="#A8820A" />
          <ellipse cx="-3" cy="-2" rx="2"   ry="1.2"  fill="#C4A030" opacity="0.55" />
        </motion.g>

        {/* ════ BEST SELF ════ */}
        <motion.g style={{ rotate: bestLean }} transformOrigin="315px 200px">
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.18 }}
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
            {/* Shoulder caps */}
            <circle cx="339" cy="79" r="13" fill="#2471a3" />
            <circle cx="287" cy="75" r="14" fill="#2471a3" />

            {/* ── Animated Arms ── */}
            {/* Left arm */}
            <motion.line x1="287" y1="75"  x2={blEx} y2={blEy} stroke="#2471a3" strokeWidth="12" strokeLinecap="round" />
            <motion.line x1={blEx} y1={blEy} x2="248" y2="91"  stroke="#2e86c1" strokeWidth="11" strokeLinecap="round" />
            {/* Right arm */}
            <motion.line x1="339" y1="79"  x2={brEx} y2={brEy} stroke="#2471a3" strokeWidth="12" strokeLinecap="round" />
            <motion.line x1={brEx} y1={brEy} x2="252" y2="97"  stroke="#2e86c1" strokeWidth="11" strokeLinecap="round" />

            {/* Fists */}
            <ellipse cx="250" cy="93" rx="10" ry="8" fill="#2e86c1" />
            <ellipse cx="253" cy="99" rx="10" ry="7" fill="#1a6ea8" />
            <line x1="247" y1="89" x2="247" y2="97" stroke="#0d3d6e" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="251" y1="88" x2="251" y2="96" stroke="#0d3d6e" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="255" y1="89" x2="255" y2="96" stroke="#0d3d6e" strokeWidth="1.5" strokeOpacity="0.6" />

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
            <path d="M299 35 Q305 31 312 34" stroke="#0a2744" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M313 34 Q319 30 325 35" stroke="#0a2744" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="304" y="50" width="16" height="7" rx="2" fill="#fff" opacity="0.85" />
            <line x1="308" y1="50" x2="308" y2="57" stroke="#ccc" strokeWidth="1" />
            <line x1="312" y1="50" x2="312" y2="57" stroke="#ccc" strokeWidth="1" />
            <line x1="316" y1="50" x2="316" y2="57" stroke="#ccc" strokeWidth="1" />
            <path d="M294 35 Q313 18 332 32" stroke="#0a1a2e" strokeWidth="7" fill="none" strokeLinecap="round" />
          </motion.g>
        </motion.g>

        {/* ════ LABELS ════ */}
        <text x="52"  y="216" textAnchor="middle" fontSize="11" fill="#e74c3c" fontWeight="800" letterSpacing="0.5">💀 WORST SELF</text>
        <text x="348" y="216" textAnchor="middle" fontSize="11" fill="#3498db" fontWeight="800" letterSpacing="0.5">BEST SELF 🪽</text>
      </svg>

      {/* Score */}
      <div className="score-display">
        <motion.div
          className={`score-badge ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'}`}
          key={score}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {score > 0 ? '+' : ''}{score}
        </motion.div>
        <div className="score-sub">Who will win today?</div>
      </div>
    </div>
  );
}
