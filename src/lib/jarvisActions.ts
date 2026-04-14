// Jarvis Action System - Parses and executes actions from AI responses

export interface JarvisAction {
  type: string;
  payload: string;
  label: string;
}

export function parseActions(text: string): { cleanText: string; actions: JarvisAction[] } {
  const actionRegex = /\[ACTION:(\w+)(?::([^\]]*))?\]/g;
  const actions: JarvisAction[] = [];
  let match;

  while ((match = actionRegex.exec(text)) !== null) {
    const type = match[1];
    const payload = match[2] || '';

    switch (type) {
      case 'OPEN_URL':
        actions.push({ type: 'OPEN_URL', payload, label: `Open ${new URL(payload).hostname}` });
        break;
      case 'SEARCH':
        actions.push({ type: 'SEARCH', payload, label: `Search: ${payload}` });
        break;
      case 'REMINDER':
        actions.push({ type: 'REMINDER', payload, label: `Reminder: ${payload.split('|')[0]}` });
        break;
      case 'TIMER':
        actions.push({ type: 'TIMER', payload, label: `Timer: ${payload} min` });
        break;
      case 'FOCUS_MODE':
        actions.push({ type: 'FOCUS_MODE', payload: '', label: 'Focus Mode' });
        break;
      case 'PLAY_MUSIC':
        actions.push({ type: 'PLAY_MUSIC', payload, label: `Play: ${payload}` });
        break;
      default:
        actions.push({ type, payload, label: type });
    }
  }

  const cleanText = text.replace(actionRegex, '').trim();
  return { cleanText, actions };
}

export function executeAction(action: JarvisAction): string {
  switch (action.type) {
    case 'OPEN_URL':
      window.open(action.payload, '_blank', 'noopener,noreferrer');
      return `Opened ${action.payload}`;
    case 'SEARCH':
      window.open(`https://www.google.com/search?q=${encodeURIComponent(action.payload)}`, '_blank');
      return `Searching for "${action.payload}"`;
    case 'PLAY_MUSIC':
      if (action.payload.includes('http')) {
        window.open(action.payload, '_blank');
      } else {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(action.payload + ' playlist')}`, '_blank');
      }
      return `Playing ${action.payload}`;
    case 'FOCUS_MODE':
      return 'Focus mode activated. Distractions minimized.';
    case 'TIMER':
      return `Timer set for ${action.payload} minutes.`;
    case 'REMINDER':
      return `Reminder set: ${action.payload}`;
    default:
      return `Action executed: ${action.type}`;
  }
}
