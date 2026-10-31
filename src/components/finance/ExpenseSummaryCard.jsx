import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import useFinanceStore, { getFilteredExpenses, getCategoryTotals, getTotalSpent } from '../../stores/useFinanceStore';
import { formatCurrency, getDynamicFilterOptions } from '../../utils/helpers';
import Dropdown from '../shared/Dropdown';
const DoughnutChart = lazy(() => import('./DoughnutChart'));

export default function ExpenseSummaryCard() {
  const expenses = useFinanceStore((s) => s.expenses) || [];
  const categories = useFinanceStore((s) => s.categories) || [];
  const filter = useFinanceStore((s) => s.filter);
  const setFilter = useFinanceStore((s) => s.setFilter);

  const filteredExpenses = getFilteredExpenses(expenses, filter) || [];
  const categoryTotals = getCategoryTotals(categories, filteredExpenses)
    .sort((a, b) => b.total - a.total);
  const totalSpent = getTotalSpent(filteredExpenses);

  return (
    <div className="glass rounded-card p-6 shadow-card border border-white/5 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-3xl rounded-full -mr-16 -mt-16" />
      </div>

      {/* Header Row */}
      <div className="flex items-start justify-between relative z-10 mb-6">
        <div>
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spending</h2>
          <motion.p 
            key={totalSpent}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-text-primary mt-1"
          >
            {formatCurrency(totalSpent)}
          </motion.p>
        </div>
        <Dropdown options={getDynamicFilterOptions()} value={filter} onChange={setFilter} />
      </div>

      {/* Chart */}
      <div className="relative mb-8">
        <Suspense fallback={<div className="w-[240px] h-[240px] mx-auto rounded-full bg-surface/30 animate-pulse" />}>
          <DoughnutChart />
        </Suspense>
      </div>

      {/* Legend - Improved Layout */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Top Categories</h3>
          <span className="text-[10px] font-bold text-accent-green uppercase">{categoryTotals.length} Groups</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto no-scrollbar pr-1">
          {(categoryTotals || []).map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              className="flex flex-col gap-1 p-2 rounded-lg bg-surface/40 border border-border/30 hover:bg-surface/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[10px] font-semibold text-text-primary truncate">{cat.name}</span>
              </div>
              <div className="flex items-end justify-between mt-0.5">
                <span className="text-[11px] font-bold text-text-primary">
                  {formatCurrency(cat.total)}
                </span>
                <span className="text-[9px] text-text-muted font-medium">
                  {Math.round((cat.total / totalSpent) * 100 || 0)}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-accent-green opacity-50"
                  style={{ width: `${(cat.total / totalSpent) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
          {categoryTotals.length === 0 && (
            <div className="py-8 text-center bg-surface/30 rounded-2xl border border-dashed border-border">
              <p className="text-xs text-text-muted italic">No expenses for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
