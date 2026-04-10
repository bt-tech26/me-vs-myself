export const CATEGORIES = {
  BODY: { id: 'BODY', label: 'Body', icon: '❤️', color: '#e74c3c' },
  WORK: { id: 'WORK', label: 'Work', icon: '💼', color: '#3498db' },
  DIET: { id: 'DIET', label: 'Diet', icon: '🍎', color: '#2ecc71' },
  MIND: { id: 'MIND', label: 'Mind', icon: '💡', color: '#9b59b6' },
  SCREEN: { id: 'SCREEN', label: 'Screen', icon: '📱', color: '#e67e22' },
};

export const WIN_ACTIONS = [
  { id: 'w1', label: 'Workout / Exercise', category: 'BODY', weight: 3, emoji: '💪' },
  { id: 'w2', label: 'Morning run', category: 'BODY', weight: 2, emoji: '🏃' },
  { id: 'w3', label: 'Slept 8+ hours', category: 'BODY', weight: 2, emoji: '😴' },
  { id: 'w4', label: 'Deep work session (2h+)', category: 'WORK', weight: 3, emoji: '🎯' },
  { id: 'w5', label: 'Finished task list', category: 'WORK', weight: 2, emoji: '✅' },
  { id: 'w6', label: 'No procrastination', category: 'WORK', weight: 2, emoji: '⚡' },
  { id: 'w7', label: 'Ate healthy all day', category: 'DIET', weight: 3, emoji: '🥗' },
  { id: 'w8', label: 'No junk food', category: 'DIET', weight: 2, emoji: '🚫' },
  { id: 'w9', label: 'Drank 8 glasses water', category: 'DIET', weight: 1, emoji: '💧' },
  { id: 'w10', label: 'Meditated', category: 'MIND', weight: 2, emoji: '🧘' },
  { id: 'w11', label: 'Read for 30+ min', category: 'MIND', weight: 2, emoji: '📚' },
  { id: 'w12', label: 'Journaled', category: 'MIND', weight: 1, emoji: '📝' },
  { id: 'w13', label: 'Screen time < 2h', category: 'SCREEN', weight: 3, emoji: '📵' },
  { id: 'w14', label: 'No social media', category: 'SCREEN', weight: 2, emoji: '🚫' },
  { id: 'w15', label: 'Phone-free morning', category: 'SCREEN', weight: 2, emoji: '🌅' },
];

export const LOSS_ACTIONS = [
  { id: 'l1', label: 'Skipped workout', category: 'BODY', weight: -2, emoji: '😞' },
  { id: 'l2', label: 'Bad sleep (<6h)', category: 'BODY', weight: -2, emoji: '😵' },
  { id: 'l3', label: 'Stayed in bed all day', category: 'BODY', weight: -3, emoji: '🛌' },
  { id: 'l4', label: 'Wasted the day', category: 'WORK', weight: -3, emoji: '💀' },
  { id: 'l5', label: 'Procrastinated badly', category: 'WORK', weight: -2, emoji: '😑' },
  { id: 'l6', label: 'Missed deadlines', category: 'WORK', weight: -2, emoji: '⏰' },
  { id: 'l7', label: 'Ate junk food', category: 'DIET', weight: -2, emoji: '🍔' },
  { id: 'l8', label: 'Skipped meals', category: 'DIET', weight: -1, emoji: '🤢' },
  { id: 'l9', label: 'Drank alcohol', category: 'DIET', weight: -2, emoji: '🍺' },
  { id: 'l10', label: 'Spiraled mentally', category: 'MIND', weight: -3, emoji: '🌀' },
  { id: 'l11', label: 'Negative self-talk', category: 'MIND', weight: -2, emoji: '💭' },
  { id: 'l12', label: 'Avoided problems', category: 'MIND', weight: -2, emoji: '🙈' },
  { id: 'l13', label: 'Screen time > 6h', category: 'SCREEN', weight: -3, emoji: '📺' },
  { id: 'l14', label: 'Doom scrolled', category: 'SCREEN', weight: -2, emoji: '📱' },
  { id: 'l15', label: 'Phone first thing AM', category: 'SCREEN', weight: -1, emoji: '📲' },
];
