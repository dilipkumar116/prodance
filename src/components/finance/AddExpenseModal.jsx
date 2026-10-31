import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from '../../utils/icons';
import useFinanceStore from '../../stores/useFinanceStore';

export default function AddExpenseModal({ open, onClose, defaultDate }) {
  const categories = useFinanceStore((s) => s.categories);
  const addExpense = useFinanceStore((s) => s.addExpense);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!title.trim()) {
      setError('Enter a title');
      return;
    }
    addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: defaultDate,
    });
    reset();
    onClose();
  };

  const reset = () => {
    setTitle('');
    setAmount('');
    setCategory(categories[0]?.id || '');
    setError('');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] modal-backdrop flex items-end justify-center"
        onClick={onClose}
      >
        <motion.form
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleAdd}
          className="w-full max-w-lg bg-card rounded-t-[28px] p-6 pb-10 max-h-[85vh] overflow-y-auto no-scrollbar"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-text-primary">Add Expense</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors">
              <HiX className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {error && <p className="text-xs text-accent-red mb-3">{error}</p>}

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-muted uppercase font-bold px-1">Selected Date</label>
              <div className="px-4 py-3 rounded-input bg-surface border border-border text-sm text-text-secondary italic">
                {new Date(defaultDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
              </div>
            </div>

            <input
              type="text"
              placeholder="Title (e.g., Coffee, Rent)"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-input bg-surface border border-border text-sm text-text-primary focus:border-accent-green/40 outline-none"
            />

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-input bg-surface border border-border text-sm text-text-primary focus:border-accent-green/40 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-muted uppercase font-bold px-1">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${category === cat.id ? 'bg-accent-green/20 border-accent-green text-accent-green' : 'bg-surface border-border text-text-secondary'}`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-btn bg-accent-green text-primary font-bold text-sm shadow-glow-green mt-2"
            >
              Save Expense
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
