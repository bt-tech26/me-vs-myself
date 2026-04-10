import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tug_of_war_v1';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useGameStore() {
  const [allData, setAllData] = useState(() => loadState());
  const todayKey = getTodayKey();

  const todayData = allData[todayKey] || { logs: [], score: 0 };

  const persist = useCallback((updater) => {
    setAllData(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const logAction = useCallback((action) => {
    const entry = {
      ...action,
      timestamp: Date.now(),
      id: `${action.id}_${Date.now()}`,
    };
    persist(prev => {
      const day = prev[todayKey] || { logs: [], score: 0 };
      return {
        ...prev,
        [todayKey]: {
          logs: [...day.logs, entry],
          score: day.score + action.weight,
        },
      };
    });
  }, [todayKey, persist]);

  const removeLog = useCallback((entryId) => {
    persist(prev => {
      const day = prev[todayKey] || { logs: [], score: 0 };
      const removed = day.logs.find(l => l.id === entryId);
      if (!removed) return prev;
      return {
        ...prev,
        [todayKey]: {
          logs: day.logs.filter(l => l.id !== entryId),
          score: day.score - removed.weight,
        },
      };
    });
  }, [todayKey, persist]);

  const getHistory = useCallback(() => {
    return Object.entries(allData)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({ date, ...data }));
  }, [allData]);

  // Score clamped to -30..30 for tug position
  const ropePosition = Math.max(-30, Math.min(30, todayData.score));
  // Normalize to 0..100 where 50 = center
  const ropePercent = 50 + (ropePosition / 30) * 50;

  return {
    todayLogs: todayData.logs,
    todayScore: todayData.score,
    ropePercent,
    logAction,
    removeLog,
    getHistory,
    allData,
    todayKey,
  };
}
