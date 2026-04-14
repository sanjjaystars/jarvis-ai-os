import { create } from 'zustand';

export type JarvisState = 'idle' | 'listening' | 'thinking' | 'speaking';
export type Message = { id: string; role: 'user' | 'jarvis'; content: string; timestamp: Date };
export type Reminder = { id: string; text: string; time: string; done: boolean };
export type CustomCommand = { id: string; name: string; trigger: string; actions: string[]; voiceResponse: string };

interface JarvisStore {
  state: JarvisState;
  setState: (s: JarvisState) => void;
  messages: Message[];
  addMessage: (role: 'user' | 'jarvis', content: string) => void;
  reminders: Reminder[];
  addReminder: (text: string, time: string) => void;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;
  customCommands: CustomCommand[];
  addCommand: (cmd: Omit<CustomCommand, 'id'>) => void;
  removeCommand: (id: string) => void;
  userName: string;
  setUserName: (n: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  widgetsOpen: boolean;
  toggleWidgets: () => void;
  activePanel: 'chat' | 'memory' | 'commands';
  setActivePanel: (p: 'chat' | 'memory' | 'commands') => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useJarvisStore = create<JarvisStore>((set) => ({
  state: 'idle',
  setState: (s) => set({ state: s }),
  messages: [
    { id: uid(), role: 'jarvis', content: "Good evening. I'm Jarvis, your personal AI system. How can I assist you?", timestamp: new Date() },
  ],
  addMessage: (role, content) =>
    set((s) => ({ messages: [...s.messages, { id: uid(), role, content, timestamp: new Date() }] })),
  reminders: [
    { id: uid(), text: 'Review project milestones', time: '7:00 PM', done: false },
    { id: uid(), text: 'Team standup call', time: '9:00 AM', done: true },
  ],
  addReminder: (text, time) =>
    set((s) => ({ reminders: [...s.reminders, { id: uid(), text, time, done: false }] })),
  toggleReminder: (id) =>
    set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),
  removeReminder: (id) =>
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
  customCommands: [
    { id: uid(), name: 'Coding Mode', trigger: 'coding mode', actions: ['Open VS Code', 'Open GitHub', 'Enable focus UI'], voiceResponse: 'Coding mode activated. All systems ready.' },
    { id: uid(), name: 'Study Mode', trigger: 'study mode', actions: ['Open notes app', 'Play lo-fi music', 'Set 45min timer'], voiceResponse: 'Study mode engaged. Focus time begins now.' },
    { id: uid(), name: 'Beast Mode', trigger: 'beast mode', actions: ['Open gym playlist', 'Show workout plan', 'Enable DND'], voiceResponse: 'Beast mode. No excuses. Let\'s go.' },
  ],
  addCommand: (cmd) => set((s) => ({ customCommands: [...s.customCommands, { ...cmd, id: uid() }] })),
  removeCommand: (id) => set((s) => ({ customCommands: s.customCommands.filter((c) => c.id !== id) })),
  userName: 'Commander',
  setUserName: (n) => set({ userName: n }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  widgetsOpen: true,
  toggleWidgets: () => set((s) => ({ widgetsOpen: !s.widgetsOpen })),
  activePanel: 'chat',
  setActivePanel: (p) => set({ activePanel: p }),
}));
