import { motion } from 'framer-motion';
import { useJarvisStore, type JarvisState } from '@/stores/jarvisStore';

const stateColors: Record<JarvisState, string> = {
  idle: 'from-neon-cyan/20 to-neon-blue/10',
  listening: 'from-neon-cyan/40 to-neon-blue/30',
  thinking: 'from-neon-blue/40 to-primary/30',
  speaking: 'from-neon-cyan/50 to-neon-blue/40',
};

const stateLabels: Record<JarvisState, string> = {
  idle: 'STANDBY',
  listening: 'LISTENING',
  thinking: 'PROCESSING',
  speaking: 'SPEAKING',
};

export function JarvisOrb() {
  const state = useJarvisStore((s) => s.state);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Orb container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-neon-cyan/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-3 rounded-full border border-neon-cyan/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner glow */}
        <motion.div
          className={`absolute inset-6 rounded-full bg-gradient-to-br ${stateColors[state]} backdrop-blur-sm`}
          animate={
            state === 'idle'
              ? { scale: [1, 1.05, 1] }
              : state === 'listening'
              ? { scale: [1, 1.12, 1] }
              : state === 'thinking'
              ? { scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }
              : { scale: [1, 1.1, 1.05, 1.1, 1] }
          }
          transition={{
            duration: state === 'thinking' ? 1.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Core */}
        <motion.div
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue animate-pulse-glow"
          animate={state === 'listening' ? { scale: [1, 1.3, 1] } : { scale: [1, 1.1, 1] }}
          transition={{ duration: state === 'listening' ? 0.8 : 2, repeat: Infinity }}
        />
        {/* Scan lines */}
        {state !== 'idle' && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-neon-cyan/10"
                style={{ inset: `${-10 - i * 15}px` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
              />
            ))}
          </>
        )}
      </div>

      {/* Status label */}
      <motion.div
        className="flex flex-col items-center gap-1"
        key={state}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs tracking-[0.3em] font-display text-muted-foreground uppercase">
          {stateLabels[state]}
        </span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-neon-cyan"
              animate={
                state !== 'idle'
                  ? { height: [4, 16, 4] }
                  : { height: 4 }
              }
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
