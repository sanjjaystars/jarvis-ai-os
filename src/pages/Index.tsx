import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftClose, PanelRightClose, PanelLeft, PanelRight } from 'lucide-react';
import { JarvisOrb } from '@/components/jarvis/JarvisOrb';
import { ChatPanel } from '@/components/jarvis/ChatPanel';
import { WidgetsPanel } from '@/components/jarvis/WidgetsPanel';
import { JarvisSidebar } from '@/components/jarvis/Sidebar';
import { useJarvisStore } from '@/stores/jarvisStore';

const Index = () => {
  const { sidebarOpen, toggleSidebar, widgetsOpen, toggleWidgets } = useJarvisStore();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(hsl(var(--neon-cyan)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <JarvisSidebar />
      </AnimatePresence>

      {/* Center */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/30 backdrop-blur-sm">
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-display tracking-[0.4em] text-muted-foreground">J.A.R.V.I.S</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <button onClick={toggleWidgets} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {widgetsOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Orb section */}
          <motion.div
            className="flex items-center justify-center py-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <JarvisOrb />
          </motion.div>

          <div className="neon-line mx-8" />

          {/* Chat section */}
          <div className="flex-1 min-h-0">
            <ChatPanel />
          </div>
        </div>
      </div>

      {/* Widgets panel */}
      <AnimatePresence>
        {widgetsOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-[280px] border-l border-border bg-card/30 backdrop-blur-sm"
          >
            <WidgetsPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
