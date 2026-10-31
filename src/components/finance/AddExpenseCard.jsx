import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus } from '../../utils/icons';
import useFinanceStore from '../../stores/useFinanceStore';

export default function AddExpenseCard() {
  const categories = useFinanceStore((s) => s.categories);
  const addExpense = useFinanceStore((s) => s.addExpense);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'food');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!title.trim()) {
      setError('Enter a title');
      return;
    }
    setError('');
    addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
    });
    setTitle('');
    setAmount('');
  };

  return (
    <div className="glass rounded-card p-6 shadow-card border border-white/5 relative overflow-hidden">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Quick Add</h3>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-accent-red mb-3 uppercase"
        >
          {error}
        </motion.p>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="What did you buy?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl bg-surface/50 border border-border
                     text-sm text-text-primary placeholder:text-text-muted/50
                     focus:border-accent-green/40 transition-all duration-200 outline-none"
        />

        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">₹</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3.5 rounded-2xl bg-surface/50 border border-border
                         text-sm text-text-primary placeholder:text-text-muted/50
                         focus:border-accent-green/40 transition-all duration-200 outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3.5 rounded-2xl bg-surface/50 border border-border
                       text-sm text-text-primary cursor-pointer outline-none
                       focus:border-accent-green/40 transition-all duration-200
                       min-w-[130px] appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-primary text-text-primary">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl bg-accent-green text-primary font-black text-sm uppercase tracking-widest
                     shadow-glow-green hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <HiPlus className="w-4 h-4" /> Add Expense
        </motion.button>
      </div>
    </div>
  );
}
