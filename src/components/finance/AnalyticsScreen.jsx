import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiArrowUp, HiArrowDown, HiTrendingUp } from '../../utils/icons';
import useFinanceStore, { getCategoryTotals, getWeeklyTrend } from '../../stores/useFinanceStore';
import { formatCurrency } from '../../utils/helpers';

export default function AnalyticsScreen({ onClose, inline = false }) {
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);

  const categoryTotals = useMemo(() => {
    return getCategoryTotals(categories, expenses).sort((a, b) => b.total - a.total);
  }, [categories, expenses]);

  const weeklyTrend = useMemo(() => getWeeklyTrend(expenses).reverse(), [expenses]);

  const totalSpent = useMemo(() => categoryTotals.reduce((s, c) => s + (c.total || 0), 0), [categoryTotals]);
  const highestExpense = categoryTotals[0];

  // Build SVG Sparkline path for the weekly trend
  const sparklinePath = useMemo(() => {
    if (weeklyTrend.length === 0) return '';
    const maxTotal = Math.max(...weeklyTrend.map(d => d.total), 1); // avoid / 0
    const points = weeklyTrend.map((d, i) => {
      const x = (i / (weeklyTrend.length - 1)) * 100;
      const y = 100 - ((d.total / maxTotal) * 80); // leave 20% padding at top
      return `${x},${y}`;
    });
    return `M0,100 L${points.join(' L')} L100,100 Z`;
  }, [weeklyTrend]);

  const sparklineStroke = useMemo(() => {
    if (weeklyTrend.length === 0) return '';
    const maxTotal = Math.max(...weeklyTrend.map(d => d.total), 1);
    const points = weeklyTrend.map((d, i) => {
      const x = (i / (weeklyTrend.length - 1)) * 100;
      const y = 100 - ((d.total / maxTotal) * 80);
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [weeklyTrend]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { y: '100%' }}
      animate={inline ? { opacity: 1 } : { y: 0 }}
      exit={inline ? { opacity: 1 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      {!inline && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
              <HiArrowLeft className="w-6 h-6 text-text-primary" />
            </button>
            <h2 className="text-lg font-bold text-text-primary">Advanced Analytics</h2>
          </div>
        </div>
      )}

      <div className={`flex-1 ${!inline ? 'overflow-y-auto p-5 no-scrollbar pb-24' : ''} space-y-6 mt-2`}>
        
        {/* Weekly Trend Sparkline */}
        <div className="bg-card border border-border p-5 rounded-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Weekly Spending Trend</h3>
            <HiTrendingUp className="w-4 h-4 text-accent-green" />
          </div>
          
          <div className="h-[120px] relative w-full mt-2">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="financeSparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <motion.path 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                d={sparklinePath} fill="url(#financeSparkGradient)" 
              />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={sparklineStroke} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" 
              />
              {/* Dot for today */}
              {weeklyTrend.length > 0 && (
                <motion.circle 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  cx="100" 
                  cy={100 - ((weeklyTrend[weeklyTrend.length - 1].total / Math.max(...weeklyTrend.map(d => d.total), 1)) * 80)} 
                  r="3.5" 
                  fill="#10B981" 
                  className="shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                />
              )}
            </svg>
            <div className="absolute inset-0 flex justify-between items-end pb-0 px-0 translate-y-6">
              {weeklyTrend.map((d, i) => (
                <span key={i} className="text-[8px] font-bold text-text-muted uppercase">{d.date.charAt(0)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Category Horizontal Bar Chart */}
        <div className="bg-card border border-border p-5 rounded-card">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Spending by Category</h3>
          
          <div className="space-y-4">
            {categoryTotals.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No data available.</p>
            ) : (
              categoryTotals.map((cat, idx) => {
                const percentage = Math.max(0.5, (cat.total / totalSpent) * 100);
                return (
                  <div key={idx} className="w-full">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-bold text-text-primary">{cat.name}</span>
                      <span className="text-[10px] font-medium text-text-muted">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                        className="h-full rounded-full relative"
                        style={{ backgroundColor: cat.color }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-1/2 rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-4 rounded-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent-green/10 blur-xl rounded-full -mr-4 -mt-4" />
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-green/10 text-accent-green">
                <HiArrowUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">Peak Category</span>
            </div>
            <p className="text-sm font-bold text-text-primary truncate mt-2">{highestExpense?.name || 'N/A'}</p>
            <p className="text-xs font-bold text-text-muted">{formatCurrency(highestExpense?.total || 0)}</p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/10 blur-xl rounded-full -mr-4 -mt-4" />
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue">
                <HiArrowDown className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">Transactions</span>
            </div>
            <p className="text-sm font-bold text-text-primary mt-2">{expenses.length}</p>
            <p className="text-[10px] font-bold text-text-muted">Total recorded</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
