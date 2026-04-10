import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WIN_ACTIONS, LOSS_ACTIONS, CATEGORIES } from '../data/actions';

export default function LogModal({ type, onClose, onLog }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customWeight, setCustomWeight] = useState(type === 'win' ? 2 : -2);

  const actions = type === 'win' ? WIN_ACTIONS : LOSS_ACTIONS;
  const filtered = selectedCat ? actions.filter(a => a.category === selectedCat) : actions;

  const handleLog = (action) => {
    onLog(action);
    onClose();
  };

  const handleCustomLog = () => {
    if (!customLabel.trim()) return;
    onLog({
      id: `custom_${Date.now()}`,
      label: customLabel.trim(),
      category: selectedCat || 'BODY',
      weight: type === 'win' ? Math.abs(customWeight) : -Math.abs(customWeight),
      emoji: type === 'win' ? '⭐' : '💔',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`modal-panel ${type === 'win' ? 'modal-win' : 'modal-loss'}`}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{type === 'win' ? '💪 Log a Win' : '😤 Log a Loss'}</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Category filter */}
          <div className="cat-filter">
            <button
              className={`cat-btn ${!selectedCat ? 'active' : ''}`}
              onClick={() => setSelectedCat(null)}
            >All</button>
            {Object.values(CATEGORIES).map(cat => (
              <button
                key={cat.id}
                className={`cat-btn ${selectedCat === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Action list */}
          <div className="action-list">
            {filtered.map(action => (
              <motion.button
                key={action.id}
                className="action-item"
                whileTap={{ scale: 0.96 }}
                onClick={() => handleLog(action)}
              >
                <span className="action-emoji">{action.emoji}</span>
                <span className="action-label">{action.label}</span>
                <span className={`action-weight ${action.weight > 0 ? 'pos' : 'neg'}`}>
                  {action.weight > 0 ? '+' : ''}{action.weight}
                </span>
              </motion.button>
            ))}

            {/* Custom entry */}
            <div className="custom-entry">
              <input
                type="text"
                placeholder="Custom action..."
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                className="custom-input"
                onKeyDown={e => e.key === 'Enter' && handleCustomLog()}
              />
              <input
                type="number"
                min="1"
                max="5"
                value={Math.abs(customWeight)}
                onChange={e => setCustomWeight(parseInt(e.target.value) || 1)}
                className="weight-input"
              />
              <button className="custom-log-btn" onClick={handleCustomLog}>
                Log
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
