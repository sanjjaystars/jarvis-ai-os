import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, ExternalLink, Zap } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvisStore';
import { streamJarvisChat } from '@/lib/jarvisStream';
import { parseActions, executeAction, type JarvisAction } from '@/lib/jarvisActions';

const quickSuggestions = [
  "Start my day",
  "What's on my schedule?",
  "Coding mode",
  "Set a reminder for 7 PM to study",
  "Search the web for React best practices",
];

export function ChatPanel() {
  const { messages, addMessage, updateLastMessage, setState, state, memoryItems, customCommands, addReminder, setFocusMode } = useJarvisStore();
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;
    
    addMessage('user', msg);
    setInput('');
    setState('thinking');
    setIsStreaming(true);

    // Check for custom command matches first
    const matchedCmd = customCommands.find(c => msg.toLowerCase().includes(c.trigger.toLowerCase()));
    if (matchedCmd) {
      // Execute custom command actions
      setTimeout(() => {
        setState('speaking');
        const actionText = matchedCmd.actions.map(a => `→ ${a}`).join('\n');
        addMessage('jarvis', `${matchedCmd.voiceResponse}\n\n${actionText}`);
        if (matchedCmd.trigger.toLowerCase().includes('focus') || matchedCmd.trigger.toLowerCase().includes('coding')) {
          setFocusMode(true);
        }
        setTimeout(() => { setState('idle'); setIsStreaming(false); }, 1000);
      }, 600);
      return;
    }

    // Build conversation history for AI
    const conversationHistory = messages
      .slice(-20)
      .map(m => ({
        role: m.role === 'jarvis' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }));
    conversationHistory.push({ role: 'user', content: msg });

    let fullResponse = '';
    
    await streamJarvisChat({
      messages: conversationHistory,
      memory: memoryItems,
      onDelta: (chunk) => {
        fullResponse += chunk;
        const { cleanText } = parseActions(fullResponse);
        setState('speaking');
        updateLastMessage(cleanText || '...');
      },
      onDone: () => {
        const { cleanText, actions } = parseActions(fullResponse);
        
        // Execute parsed actions
        actions.forEach(action => {
          executeAction(action);
          // Handle specific action types
          if (action.type === 'REMINDER') {
            const [reminderText, time] = action.payload.split('|');
            addReminder(reminderText?.trim() || action.payload, time?.trim() || 'Soon');
          }
          if (action.type === 'FOCUS_MODE') {
            setFocusMode(true);
          }
        });

        // Update final message with actions
        if (actions.length > 0) {
          // Update the last message to include actions
          const store = useJarvisStore.getState();
          const msgs = [...store.messages];
          const last = msgs[msgs.length - 1];
          if (last?.role === 'jarvis') {
            msgs[msgs.length - 1] = { ...last, content: cleanText, actions };
            useJarvisStore.setState({ messages: msgs });
          }
        }

        setState('idle');
        setIsStreaming(false);
      },
      onError: (error) => {
        addMessage('jarvis', `System alert: ${error}`);
        setState('idle');
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages, memoryItems, customCommands, addMessage, updateLastMessage, setState, addReminder, setFocusMode]);

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      setState('listening');
      // Browser Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsVoiceActive(false);
          setState('idle');
          handleSend(transcript);
        };
        recognition.onerror = () => {
          setIsVoiceActive(false);
          setState('idle');
        };
        recognition.onend = () => {
          setIsVoiceActive(false);
          setState('idle');
        };
        recognition.start();
      } else {
        setTimeout(() => {
          setState('idle');
          setIsVoiceActive(false);
        }, 3000);
      }
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
              <div className={`max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/20 text-foreground border border-primary/20'
                      : 'glass-card text-secondary-foreground'
                  }`}
                >
                  {msg.role === 'jarvis' && (
                    <span className="text-[10px] font-display tracking-widest text-neon-cyan block mb-1">JARVIS</span>
                  )}
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                  {isStreaming && msg === messages[messages.length - 1] && msg.role === 'jarvis' && (
                    <motion.span
                      className="inline-block w-1.5 h-4 bg-primary ml-1 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => executeAction(action)}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        {action.type === 'OPEN_URL' ? <ExternalLink className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {state === 'thinking' && !messages.some(m => m.role === 'jarvis' && m === messages[messages.length - 1]) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="text-[10px] font-display tracking-widest text-neon-cyan">JARVIS</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {quickSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            disabled={isStreaming}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-30"
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
              isVoiceActive ? 'bg-primary/20 text-primary animate-pulse' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isVoiceActive ? 'Listening...' : 'Talk to Jarvis...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
