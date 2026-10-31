import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiFire, HiCheckCircle, HiChartBar } from '../../utils/icons';
import useProductivityStore, { getLocalDateString, getLongestStreak } from '../../stores/useProductivityStore';
import HabitCard from './HabitCard';

export default function ProductivityHome({ onNavigateToSettings }) {
  const habits = useProductivityStore(s => s.habits) || [];
  
  const todayStr = getLocalDateString(new Date());
  const habitsToday = habits.filter(h => h.completions && h.completions.includes(todayStr));
  const todayCompleted = habitsToday.length;
  const todayRate = habits.length ? Math.round((todayCompleted / habits.length) * 100) : 0;

  // Best streak currently across all habits
  const bestCurrentStreak = useMemo(() => {
    if (!habits || habits.length === 0) return 0;
    return Math.max(...habits.map(h => getLongestStreak(h)));
  }, [habits]);

  const isPerfectDay = habits.length > 0 && todayCompleted === habits.length;

  const monthScore = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalRate = 0;
    let daysPassed = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const currentD = new Date(year, month, i);
      if (currentD > d) break;

      const dStr = getLocalDateString(currentD);
      if (!habits || habits.length === 0) continue;

      const completedCount = habits.filter(h => h.completions && h.completions.includes(dStr)).length;
      totalRate += (completedCount / habits.length) * 100;
      daysPassed++;
    }
    
    if (daysPassed === 0) return 0;
    return Math.round(totalRate / daysPassed);
  }, [habits]);

  // Ring properties
  const radiusDaily = 60;
  const circumferenceDaily = 2 * Math.PI * radiusDaily;
  const strokeDashoffsetDaily = circumferenceDaily - (todayRate / 100) * circumferenceDaily;
  const ringColorDaily = todayRate >= 100 ? '#4ADE80' : todayRate >= 50 ? '#FACC15' : '#F87171';

  const radiusMonthly = 80;
  const circumferenceMonthly = 2 * Math.PI * radiusMonthly;
  const strokeDashoffsetMonthly = circumferenceMonthly - (monthScore / 100) * circumferenceMonthly;
  const ringColorMonthly = monthScore >= 70 ? '#60A5FA' : monthScore >= 40 ? '#A78BFA' : '#F472B6';

  return (
    <div className="space-y-6">
      
      {/* SVG Radial Progress Hero */}
      <div className="flex flex-col items-center justify-center py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-green/5 to-transparent blur-3xl -z-10" />
        
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Monthly Background Ring */}
            <circle cx="112" cy="112" r={radiusMonthly} className="stroke-surface" strokeWidth="12" fill="none" />
            {/* Monthly Progress Ring */}
            <motion.circle 
              cx="112" cy="112" r={radiusMonthly}
              stroke={ringColorMonthly} strokeWidth="12" fill="none" strokeLinecap="round"
              initial={{ strokeDashoffset: circumferenceMonthly }}
              animate={{ strokeDashoffset: strokeDashoffsetMonthly }}
              transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.1 }}
              style={{ strokeDasharray: circumferenceMonthly }}
            />
            {/* Daily Background Ring */}
            <circle cx="112" cy="112" r={radiusDaily} className="stroke-surface" strokeWidth="12" fill="none" />
            {/* Daily Progress Ring */}
            <motion.circle 
              cx="112" cy="112" r={radiusDaily}
              stroke={ringColorDaily} strokeWidth="12" fill="none" strokeLinecap="round"
              initial={{ strokeDashoffset: circumferenceDaily }}
              animate={{ strokeDashoffset: strokeDashoffsetDaily }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2, type: "spring", bounce: 0.1 }}
              style={{ strokeDasharray: circumferenceDaily }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-text-primary tracking-tighter"
            >
              {todayRate}<span className="text-xl text-text-muted">%</span>
            </motion.span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Today</span>
          </div>
          
          {/* Subtle glow behind ring */}
          <div 
            className="absolute inset-0 blur-2xl opacity-20 -z-10 rounded-full transition-colors duration-1000" 
            style={{ backgroundColor: ringColorDaily }} 
          />
        </div>

        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ringColorMonthly }} />
            <span className="text-xs font-bold text-text-secondary">Month ({monthScore}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ringColorDaily }} />
            <span className="text-xs font-bold text-text-secondary">Today ({todayRate}%)</span>
          </div>
        </div>
        
        {/* Perfect Day Banner */}
        <AnimatePresence>
          {isPerfectDay && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-6 px-4 py-2 bg-gradient-to-r from-accent-green/20 to-accent-blue/20 border border-accent-green/30 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            >
              <span className="text-lg">🎉</span>
              <span className="text-xs font-bold text-text-primary">Perfect Day! You did it all!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats Grid with Gradient Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-surface to-accent-orange/10 border border-border rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent-orange/20 blur-xl rounded-full -mr-4 -mt-4" />
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <HiFire className="w-6 h-6 text-accent-orange mb-2 drop-shadow-lg" />
          </motion.div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Streak</p>
          <p className="text-xl font-black text-text-primary">{bestCurrentStreak}</p>
        </div>
        
        <div className="bg-gradient-to-br from-surface to-accent-green/10 border border-border rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent-green/20 blur-xl rounded-full -mr-4 -mt-4" />
          <HiCheckCircle className="w-6 h-6 text-accent-green mb-2 drop-shadow-lg" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Today</p>
          <div className="flex items-end gap-1">
            <p className="text-xl font-black text-text-primary">{todayCompleted}</p>
            <p className="text-xs font-bold text-text-muted mb-1">/ {habits.length}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-surface to-accent-blue/10 border border-border rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/20 blur-xl rounded-full -mr-4 -mt-4" />
          <HiChartBar className="w-6 h-6 text-accent-blue mb-2 drop-shadow-lg" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Score</p>
          <p className="text-xl font-black text-text-primary">{todayRate}%</p>
        </div>
      </div>

      {/* Today's Habits Checklist */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Today's Habits</h3>
          {habits.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-surface border border-border text-text-primary">
              {todayCompleted} of {habits.length}
            </span>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} dateStr={todayStr} />
          ))}
          {habits.length === 0 && (
            <div className="text-center py-10 bg-surface/50 border border-dashed border-border rounded-[24px]">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <span className="text-2xl">🌱</span>
              </div>
              <p className="text-sm text-text-primary font-bold mb-1">No habits yet</p>
              <p className="text-xs text-text-muted mb-4">Time to build some good routines.</p>
              <button 
                onClick={onNavigateToSettings}
                className="px-5 py-2.5 bg-accent-green text-primary rounded-xl text-xs font-bold shadow-glow-green hover:scale-105 transition-transform"
              >
                Create a Habit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
