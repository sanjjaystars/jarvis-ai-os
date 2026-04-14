import { motion } from 'framer-motion';
import { MessageSquare, Brain, Terminal, User, ChevronLeft, Plus, Trash2, X } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvisStore';
import { useState } from 'react';

export function JarvisSidebar() {
  const { activePanel, setActivePanel, sidebarOpen, toggleSidebar, userName, customCommands, addCommand, removeCommand, messages } = useJarvisStore();
  const [showAddCmd, setShowAddCmd] = useState(false);
  const [newCmd, setNewCmd] = useState({ name: '', trigger: '', actions: '', voiceResponse: '' });

  const navItems = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { id: 'memory' as const, icon: Brain, label: 'Memory' },
    { id: 'commands' as const, icon: Terminal, label: 'Commands' },
  ];

  const handleAddCmd = () => {
    if (newCmd.name && newCmd.trigger) {
      addCommand({ name: newCmd.name, trigger: newCmd.trigger, actions: newCmd.actions.split(',').map(s => s.trim()), voiceResponse: newCmd.voiceResponse || 'Done.' });
      setNewCmd({ name: '', trigger: '', actions: '', voiceResponse: '' });
      setShowAddCmd(false);
    }
  };

  if (!sidebarOpen) {
    return (
      <div className="w-14 border-r border-border bg-card/50 flex flex-col items-center py-4 gap-4">
        <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Terminal className="w-5 h-5" />
        </button>
        <div className="neon-line w-8" />
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActivePanel(item.id); toggleSidebar(); }}
            className={`p-2 rounded-lg transition-colors ${activePanel === item.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="w-[280px] border-r border-border bg-card/50 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-sm tracking-widest glow-text">JARVIS</span>
        </div>
        <button onClick={toggleSidebar} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="neon-line mx-4" />

      {/* User */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{userName}</div>
          <div className="text-[10px] text-muted-foreground tracking-wider">SYSTEM OPERATOR</div>
        </div>
      </div>

      {/* Nav */}
      <div className="px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activePanel === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="neon-line mx-4 my-3" />

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4">
        {activePanel === 'memory' && (
          <div className="space-y-3">
            <h3 className="text-xs font-display tracking-widest text-muted-foreground">MEMORY BANK</h3>
            {[
              { label: 'User Name', value: userName },
              { label: 'Preferred Mode', value: 'Dark' },
              { label: 'Wake Word', value: '"Hey Jarvis"' },
              { label: 'Recent Commands', value: `${messages.filter(m => m.role === 'user').length} logged` },
              { label: 'Custom Commands', value: `${customCommands.length} active` },
            ].map((item) => (
              <div key={item.label} className="glass-card p-3">
                <div className="text-[10px] text-muted-foreground tracking-wider">{item.label}</div>
                <div className="text-sm text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {activePanel === 'commands' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-display tracking-widest text-muted-foreground">CUSTOM COMMANDS</h3>
              <button onClick={() => setShowAddCmd(!showAddCmd)} className="p-1 text-primary hover:bg-primary/10 rounded">
                {showAddCmd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {showAddCmd && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-3 space-y-2">
                <input value={newCmd.name} onChange={e => setNewCmd({...newCmd, name: e.target.value})} placeholder="Command name" className="w-full bg-muted/50 rounded px-2 py-1.5 text-xs text-foreground outline-none" />
                <input value={newCmd.trigger} onChange={e => setNewCmd({...newCmd, trigger: e.target.value})} placeholder="Trigger phrase" className="w-full bg-muted/50 rounded px-2 py-1.5 text-xs text-foreground outline-none" />
                <input value={newCmd.actions} onChange={e => setNewCmd({...newCmd, actions: e.target.value})} placeholder="Actions (comma separated)" className="w-full bg-muted/50 rounded px-2 py-1.5 text-xs text-foreground outline-none" />
                <input value={newCmd.voiceResponse} onChange={e => setNewCmd({...newCmd, voiceResponse: e.target.value})} placeholder="Voice response" className="w-full bg-muted/50 rounded px-2 py-1.5 text-xs text-foreground outline-none" />
                <button onClick={handleAddCmd} className="w-full bg-primary/20 text-primary text-xs py-1.5 rounded hover:bg-primary/30 transition-colors">Create Command</button>
              </motion.div>
            )}

            {customCommands.map((cmd) => (
              <div key={cmd.id} className="glass-card p-3 group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{cmd.name}</div>
                    <div className="text-[10px] text-primary tracking-wider">"{cmd.trigger}"</div>
                  </div>
                  <button onClick={() => removeCommand(cmd.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
                <div className="mt-2 space-y-0.5">
                  {cmd.actions.map((a, i) => (
                    <div key={i} className="text-[11px] text-muted-foreground">→ {a}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activePanel === 'chat' && (
          <div className="space-y-3">
            <h3 className="text-xs font-display tracking-widest text-muted-foreground">RECENT ACTIVITY</h3>
            {messages.filter(m => m.role === 'user').slice(-5).reverse().map((m) => (
              <div key={m.id} className="glass-card p-3">
                <div className="text-xs text-foreground">{m.content}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{m.timestamp.toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proactive suggestion */}
      <div className="p-4">
        <div className="glass-card p-3 border-primary/20 glow-border">
          <div className="text-[10px] font-display tracking-widest text-primary mb-1">SUGGESTION</div>
          <div className="text-xs text-muted-foreground">You usually study at 7 PM. Should I prepare your setup?</div>
        </div>
      </div>
    </motion.div>
  );
}
