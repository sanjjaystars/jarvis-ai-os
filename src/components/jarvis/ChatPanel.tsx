import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvisStore';

const quickSuggestions = [
  "Start my day",
  "What's on my schedule?",
  "Coding mode",
  "Set a reminder",
];

export function ChatPanel() {
  const { messages, addMessage, setState, state } = useJarvisStore();
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    addMessage('user', msg);
    setInput('');
    setState('thinking');

    // Simulate Jarvis response
    setTimeout(() => {
      const responses = getResponse(msg);
      setState('speaking');
      addMessage('jarvis', responses);
      setTimeout(() => setState('idle'), 1500);
    }, 1200 + Math.random() * 800);
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      setState('listening');
      setTimeout(() => {
        setState('idle');
        setIsVoiceActive(false);
      }, 3000);
    } else {
      setState('idle');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-foreground border border-primary/20'
                    : 'glass-card text-secondary-foreground'
                }`}
              >
                {msg.role === 'jarvis' && (
                  <span className="text-[10px] font-display tracking-widest text-neon-cyan block mb-1">JARVIS</span>
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick suggestions */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {quickSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 pt-2">
        <div className="glass-card flex items-center gap-2 px-4 py-2">
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-full transition-colors ${
              isVoiceActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to Jarvis..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || state === 'thinking'}
            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('start my day')) return "Good morning, Commander. It's a clear day. You have 3 tasks pending and 1 meeting at 2 PM. Your study playlist is queued. Shall I open your workspace?";
  if (lower.includes('coding mode')) return "Coding mode activated. Opening VS Code, GitHub, and documentation. Focus mode is on. Distractions eliminated. You've got this.";
  if (lower.includes('study mode')) return "Study mode engaged. Lo-fi beats playing. Timer set for 45 minutes. Your notes are ready. Focus time begins now.";
  if (lower.includes('beast mode')) return "Beast mode. No excuses. Workout plan loaded, gym playlist on, Do Not Disturb activated. Let's go.";
  if (lower.includes('remind')) return "Reminder set. I'll make sure you don't forget. You can view it in the reminders panel.";
  if (lower.includes('weather')) return "Currently 22°C with clear skies. Perfect conditions for productivity.";
  if (lower.includes('time')) return `It's ${new Date().toLocaleTimeString()}. Make every second count.`;
  if (lower.includes('schedule') || lower.includes('agenda')) return "You have 3 items today: Team standup at 9 AM, Project review at 2 PM, and a focus session at 4 PM.";
  if (lower.includes('hello') || lower.includes('hi')) return "Hello, Commander. Systems are online and ready. What's the mission?";
  if (lower.includes('who are you')) return "I'm Jarvis — your personal AI operating system. I think, I remember, and I act. At your service.";
  return "Understood. Processing your request. Is there anything else you need?";
}
