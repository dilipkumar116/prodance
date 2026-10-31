import { motion } from 'framer-motion';
import { HiCheck } from '../../utils/icons';
import useProductivityStore, { getCurrentStreak } from '../../stores/useProductivityStore';
import * as Icons from '../../utils/icons';

export default function HabitCard({ habit, dateStr }) {
  const toggleHabitForDate = useProductivityStore(s => s.toggleHabitForDate);
  if (!habit) return null;

  const Icon = Icons[habit.icon] || Icons.HiLightningBolt;
  const isDone = habit.completions && habit.completions.includes(dateStr);
  const currentStreak = getCurrentStreak(habit);

  return (
    <motion.div 
      layout
      whileTap={{ scale: 0.98 }}
      className={`relative bg-surface rounded-xl overflow-hidden transition-all duration-300 ${isDone ? 'border-accent-green/30 bg-accent-green/5' : 'border border-border shadow-sm hover:border-white/10'}`}
    >
      {/* Left colored border accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: habit.color }}
      />
      
      <div 
        className="p-3 pl-4 flex items-center gap-4 cursor-pointer"
        onClick={() => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
          }
          toggleHabitForDate(habit.id, dateStr);
        }}
      >
        <div 
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity ${isDone ? 'opacity-50' : 'opacity-100'}`}
          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <h3 className={`text-sm font-medium truncate transition-all ${isDone ? 'text-text-muted line-through' : 'text-text-primary'}`}>
            {habit.name}
          </h3>
          {currentStreak >= 2 && !isDone && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-[9px] font-bold text-accent-orange flex items-center gap-1">
              🔥 {currentStreak}
            </span>
          )}
        </div>

        <button
          className={`w-8 h-8 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors duration-300 ${
            isDone 
              ? 'bg-accent-green border-accent-green text-primary shadow-glow-green' 
              : 'border-border text-transparent hover:border-accent-green hover:text-accent-green/30'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ scale: isDone ? 1 : 0.5, opacity: isDone ? 1 : 0, rotate: isDone ? 0 : -45 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, bounce: 0.5 }}
          >
            <HiCheck className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}
