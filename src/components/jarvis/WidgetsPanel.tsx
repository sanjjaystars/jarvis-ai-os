import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CloudSun, CheckCircle2, Circle, Trash2, Zap, Activity, Cpu, Wifi } from 'lucide-react';
import { useJarvisStore } from '@/stores/jarvisStore';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="glass-card p-4 glow-border">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-xs font-display tracking-widest text-muted-foreground">TIME</span>
      </div>
      <div className="font-display text-3xl glow-text tracking-wider">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-xs text-muted-foreground mt-1 font-body">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

function WeatherCard() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CloudSun className="w-4 h-4 text-primary" />
        <span className="text-xs font-display tracking-widest text-muted-foreground">WEATHER</span>
      </div>
      <div className="flex items-end gap-3">
        <span className="font-display text-3xl text-foreground">22°</span>
        <div className="text-xs text-muted-foreground pb-1">
          <div>Clear Skies</div>
          <div>Wind 8 km/h</div>
        </div>
      </div>
    </div>
  );
}

function RemindersCard() {
  const { reminders, toggleReminder, removeReminder } = useJarvisStore();
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-xs font-display tracking-widest text-muted-foreground">REMINDERS</span>
      </div>
      <div className="space-y-2">
        {reminders.map((r) => (
          <motion.div
            key={r.id}
            layout
            className="flex items-center gap-2 text-sm group"
          >
            <button onClick={() => toggleReminder(r.id)}>
              {r.done ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <span className={`flex-1 ${r.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {r.text}
            </span>
            <span className="text-xs text-muted-foreground">{r.time}</span>
            <button
              onClick={() => removeReminder(r.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-xs font-display tracking-widest text-muted-foreground">SYSTEM</span>
      </div>
      <div className="space-y-2 text-xs">
        {[
          { icon: Cpu, label: 'AI Core', value: 'Online', ok: true },
          { icon: Wifi, label: 'Network', value: 'Connected', ok: true },
          { icon: Activity, label: 'Memory', value: 'Synced', ok: true },
        ].map(({ icon: Icon, label, value, ok }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-3 h-3" />
              {label}
            </div>
            <span className={ok ? 'text-primary' : 'text-destructive'}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WidgetsPanel() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 space-y-4">
      <LiveClock />
      <WeatherCard />
      <RemindersCard />
      <SystemStatus />
    </div>
  );
}
