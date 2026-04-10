import { useMemo } from 'react';
import { CATEGORIES } from '../data/actions';

export default function CategoryBar({ logs }) {
  const categoryScores = useMemo(() => {
    const scores = {};
    for (const cat of Object.values(CATEGORIES)) {
      scores[cat.id] = 0;
    }
    for (const log of logs) {
      if (scores[log.category] !== undefined) {
        scores[log.category] += log.weight;
      }
    }
    return scores;
  }, [logs]);

  return (
    <div className="category-bar">
      {Object.values(CATEGORIES).map(cat => {
        const val = categoryScores[cat.id];
        return (
          <div key={cat.id} className="cat-chip">
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
            <span className={`cat-score ${val > 0 ? 'pos' : val < 0 ? 'neg' : 'zero'}`}>
              {val > 0 ? '+' : ''}{val}
            </span>
          </div>
        );
      })}
    </div>
  );
}
