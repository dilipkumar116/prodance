import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from '../../utils/icons';
import useProductivityStore, { getLocalDateString } from '../../stores/useProductivityStore';
import DayHabitChecklist from './DayHabitChecklist';

export default function ProductivityCalendar({ inline = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState(null);
  
  const habits = useProductivityStore((s) => s.habits) || [];

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, year, month };
  }, [currentMonth]);

  const monthData = useMemo(() => {
    const data = {};
    for (let i = 1; i <= daysInMonth.days; i++) {
      const dStr = getLocalDateString(new Date(daysInMonth.year, daysInMonth.month, i));
      const completedCount = (habits || []).filter(h => h.completions && h.completions.includes(dStr)).length;
      const rate = habits.length ? (completedCount / habits.length) * 100 : 0;
      data[i] = { total: habits.length, completed: completedCount, rate };
    }
    return data;
  }, [habits, daysInMonth]);

  const perfectDaysThisMonth = useMemo(() => {
    return Object.values(monthData).filter(d => d.total > 0 && d.rate === 100).length;
  }, [monthData]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      <div className={`flex-1 ${!inline ? 'p-5 overflow-y-auto no-scrollbar pb-24' : ''} space-y-6 mt-2`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-primary">
              {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-text-muted mt-0.5 font-medium">Tracking {habits.length} habits</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(new Date(daysInMonth.year, daysInMonth.month - 1))}
              className="p-2 rounded-xl bg-card border border-border text-text-primary hover:bg-white/5 transition-colors"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(daysInMonth.year, daysInMonth.month + 1))}
              className="p-2 rounded-xl bg-card border border-border text-text-primary hover:bg-white/5 transition-colors"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card border border-border p-4 rounded-card shadow-sm">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-text-muted uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth.days }).map((_, i) => {
              const day = i + 1;
              const data = monthData[day];
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === daysInMonth.month && 
                             new Date().getFullYear() === daysInMonth.year;
              
              const isPerfect = data.total > 0 && data.rate === 100;
              const isPartial = data.total > 0 && data.rate > 0 && data.rate < 100;
              const opacity = isPartial ? Math.max(0.3, data.rate / 100) : 1;
              
              return (
                <motion.button 
                  key={day} 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingDate(new Date(daysInMonth.year, daysInMonth.month, day))}
                  className={`aspect-square rounded-xl flex items-center justify-center relative transition-all ${
                    isPerfect 
                      ? 'bg-accent-green border-none text-primary shadow-glow-green font-black' 
                      : 'bg-surface border font-bold text-text-primary hover:bg-white/5'
                  } ${
                    isToday && !isPerfect ? 'border-accent-green shadow-[0_0_15px_rgba(74,222,128,0.3)] animate-pulse' : 
                    !isPerfect ? 'border-border' : ''
                  }`}
                >
                  {isPartial && (
                    <div 
                      className="absolute inset-0 rounded-xl border-2 pointer-events-none" 
                      style={{ borderColor: `rgba(74, 222, 128, ${opacity})` }} 
                    />
                  )}
                  <span className="text-sm z-10">{day}</span>
                  
                  {isPartial && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-accent-green" style={{ opacity }} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-gradient-to-r from-surface to-accent-blue/10 border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-xl">
              🌟
            </div>
            <div>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">This Month</p>
              <p className="text-sm font-bold text-text-primary">{perfectDaysThisMonth} Perfect Days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Completion</p>
            <p className="text-sm font-bold text-accent-blue">
              {Math.round(Object.values(monthData).reduce((sum, d) => sum + d.rate, 0) / daysInMonth.days)}% Avg
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingDate && (
          <DayHabitChecklist date={editingDate} onClose={() => setEditingDate(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
