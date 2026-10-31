import { motion } from 'framer-motion';
import { HiArrowLeft } from '../../utils/icons';
import useProductivityStore, { getLocalDateString } from '../../stores/useProductivityStore';
import HabitCard from './HabitCard';

export default function DayHabitChecklist({ date, onClose }) {
  const habits = useProductivityStore(s => s.habits) || [];
  const dateStr = getLocalDateString(date);
  
  const habitsCompleted = (habits || []).filter(h => h.completions && h.completions.includes(dateStr));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[110] bg-primary flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
            <HiArrowLeft className="w-6 h-6 text-text-primary" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
              {habitsCompleted.length} of {habits.length} Habits Done
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
        <div className="space-y-2">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} dateStr={dateStr} />
          ))}
          {habits.length === 0 && (
            <div className="text-center py-12 bg-surface/30 rounded-card border border-dashed border-border">
              <p className="text-sm text-text-muted italic">No habits configured.</p>
              <p className="text-xs text-text-muted mt-2">Head to Settings to add habits.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
