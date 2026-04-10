import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/useGameStore';
import TugOfWarArena from './components/TugOfWarArena';
import CategoryBar from './components/CategoryBar';
import LogModal from './components/LogModal';
import LogFeed from './components/LogFeed';
import DayReplay from './components/DayReplay';
import HistoryView from './components/HistoryView';
import './App.css';

export default function App() {
  const { todayLogs, todayScore, ropePercent, logAction, removeLog, getHistory } = useGameStore();
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState('today');
  const [showReplay, setShowReplay] = useState(false);

  const history = getHistory();

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-title">ME vs MYSELF</div>
        <button className="replay-trigger" onClick={() => setShowReplay(true)}>
          ⏪ Replay
        </button>
      </div>

      {/* Category scores */}
      <CategoryBar logs={todayLogs} />

      {/* Arena */}
      <TugOfWarArena ropePercent={ropePercent} score={todayScore} />

      {/* Log buttons */}
      <div className="log-buttons">
        <motion.button
          className="btn-loss"
          whileTap={{ scale: 0.93 }}
          onClick={() => setModal('loss')}
        >
          😤 Log Loss &nbsp;<span className="btn-delta">-1</span>
        </motion.button>
        <motion.button
          className="btn-win"
          whileTap={{ scale: 0.93 }}
          onClick={() => setModal('win')}
        >
          💪 Log Win &nbsp;<span className="btn-delta">+1</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
          Today
        </button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          History
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {tab === 'today' ? (
            <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LogFeed logs={todayLogs} onRemove={removeLog} />
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoryView history={history} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <LogModal
            type={modal}
            onClose={() => setModal(null)}
            onLog={logAction}
          />
        )}
      </AnimatePresence>

      {/* Replay */}
      <AnimatePresence>
        {showReplay && (
          <DayReplay
            logs={todayLogs}
            finalScore={todayScore}
            onClose={() => setShowReplay(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
