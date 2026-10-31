import { AnimatePresence, motion } from 'framer-motion';
import useFinanceStore from '../../stores/useFinanceStore';
import ExpenseItem from './ExpenseItem';

export default function RecentExpenses() {
  const expenses = useFinanceStore((s) => s.expenses) || [];
  const recentExpenses = expenses.slice(0, 15);

  return (
    <div className="glass rounded-card p-6 shadow-card border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Transaction History</h3>
        <span className="text-[10px] font-bold text-text-muted px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
          {expenses.length} TOTAL
        </span>
      </div>

      {recentExpenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-3 border border-border">
            <span className="text-xl opacity-50">💸</span>
          </div>
          <p className="text-text-muted text-xs font-medium uppercase tracking-tighter">No transactions found</p>
        </motion.div>
      ) : (
        <div className="space-y-1 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {recentExpenses.map((expense, idx) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5), type: 'spring', damping: 25, stiffness: 200 }}
              >
                <ExpenseItem expense={expense} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
