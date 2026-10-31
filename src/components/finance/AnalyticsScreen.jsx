import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowLeft,
  HiTrendingUp,
  HiLightningBolt,
  HiArrowUp,
  HiCalendar,
  HiChartBar,
} from '../../utils/icons';
import useFinanceStore, { getDetailedAnalytics } from '../../stores/useFinanceStore';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';
import { getCategoryIcon } from '../../utils/categories';

export default function AnalyticsScreen({ onClose, inline = false }) {
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);
  const [period, setPeriod] = useState('This Month');

  const periodOptions = ['This Month', 'This Week', 'Last Month', 'Overall'];

  // Compute rich analytics for the selected period
  const analytics = useMemo(() => {
    return getDetailedAnalytics(expenses, categories, period);
  }, [expenses, categories, period]);

  const {
    filteredExpenses,
    total,
    count,
    dailyAverage,
    highestExpense,
    mostFrequentCategory,
    peakDayOfWeek,
    topExpenses,
    categoryBreakdown,
    trendBuckets,
  } = analytics;

  // Build SVG trend sparkline path
  const sparkline = useMemo(() => {
    if (!trendBuckets || trendBuckets.length === 0) return { path: '', stroke: '', max: 1 };
    const max = Math.max(...trendBuckets.map((d) => d.total), 1);
    const len = trendBuckets.length;
    const points = trendBuckets.map((d, i) => {
      const x = len > 1 ? (i / (len - 1)) * 100 : 50;
      const y = 92 - (d.total / max) * 72;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const fillPath = `M0,100 L${points.join(' L')} L100,100 Z`;
    const strokePath = `M${points.join(' L')}`;
    return { fillPath, strokePath, max };
  }, [trendBuckets]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { y: '100%' }}
      animate={inline ? { opacity: 1 } : { y: 0 }}
      exit={inline ? { opacity: 1 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={inline ? 'flex flex-col h-full' : 'fixed inset-0 z-[100] bg-primary flex flex-col'}
    >
      {!inline && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
              <HiArrowLeft className="w-6 h-6 text-text-primary" />
            </button>
            <h2 className="text-lg font-bold text-text-primary">Financial Intelligence</h2>
          </div>
        </div>
      )}

      <div className={`flex-1 ${!inline ? 'overflow-y-auto p-5 no-scrollbar pb-24' : ''} space-y-5 mt-2`}>
        
        {/* Period Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-surface/70 border border-border gap-1">
          {periodOptions.map((opt) => {
            const isActive = period === opt;
            return (
              <button
                key={opt}
                onClick={() => setPeriod(opt)}
                className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 z-10 ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePeriodTab"
                    className="absolute inset-0 bg-accent-green rounded-xl shadow-md -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                {opt}
              </button>
            );
          })}
        </div>

        {/* Hero Period Summary Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-card via-surface/60 to-surface/30 border border-white/5 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Total Spending • {period}
                </p>
              </div>
              <motion.h2
                key={`total-${total}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black text-text-primary tracking-tight"
              >
                {formatCurrency(total)}
              </motion.h2>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-green/10 text-accent-green border border-accent-green/20">
                {count} {count === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Card Intelligence Metric Matrix */}
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Burn Rate */}
          <div className="p-4 rounded-2xl bg-card border border-border relative overflow-hidden group hover:border-accent-green/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Daily Burn Rate</span>
              <div className="p-1.5 rounded-lg bg-accent-green/10 text-accent-green">
                <HiLightningBolt className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-text-primary">
              {formatCurrency(dailyAverage)}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium">Avg per day</p>
          </div>

          {/* Peak Single Expense */}
          <div className="p-4 rounded-2xl bg-card border border-border relative overflow-hidden group hover:border-accent-red/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Peak Expense</span>
              <div className="p-1.5 rounded-lg bg-accent-red/10 text-accent-red">
                <HiArrowUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-text-primary truncate">
              {highestExpense ? formatCurrency(highestExpense.amount) : '₹0'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium truncate">
              {highestExpense ? highestExpense.title : 'None recorded'}
            </p>
          </div>

          {/* Peak Day of Week */}
          <div className="p-4 rounded-2xl bg-card border border-border relative overflow-hidden group hover:border-accent-blue/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Peak Day</span>
              <div className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue">
                <HiCalendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-text-primary">
              {peakDayOfWeek ? peakDayOfWeek.name : 'N/A'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium">
              {peakDayOfWeek ? `${peakDayOfWeek.percentage}% of period` : 'No data'}
            </p>
          </div>

          {/* Most Frequent Category */}
          <div className="p-4 rounded-2xl bg-card border border-border relative overflow-hidden group hover:border-accent-gold/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Top Frequency</span>
              <div className="p-1.5 rounded-lg bg-accent-gold/10 text-accent-gold">
                <HiChartBar className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-text-primary truncate">
              {mostFrequentCategory ? mostFrequentCategory.name : 'N/A'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium">
              {mostFrequentCategory ? `${mostFrequentCategory.count} times` : 'No data'}
            </p>
          </div>
        </div>

        {/* Velocity / Spending Trend Graph */}
        <div className="p-5 rounded-3xl bg-card border border-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Spending Velocity</h3>
              <p className="text-[10px] text-text-muted mt-0.5">7-Day Outflow Pattern</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 text-accent-green text-[10px] font-bold">
              <HiTrendingUp className="w-3.5 h-3.5" />
              Active
            </div>
          </div>

          <div className="h-[120px] relative w-full mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="analyticsSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                d={sparkline.fillPath}
                fill="url(#analyticsSparkGrad)"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                d={sparkline.strokePath}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
              {(trendBuckets || []).map((d, i) => (
                <div key={i} className="text-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase block">{d.date}</span>
                  <span className="text-[8px] font-semibold text-text-muted/70 block mt-0.5">
                    {d.total > 0 ? `₹${d.total >= 1000 ? `${(d.total / 1000).toFixed(0)}k` : d.total}` : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown Details */}
        <div className="p-5 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Category Distribution
            </h3>
            <span className="text-[10px] font-bold text-text-muted">
              {categoryBreakdown.length} Categories Active
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-text-muted italic">No expenses in this period.</p>
              </div>
            ) : (
              categoryBreakdown.map((cat, idx) => {
                const CatIcon = getCategoryIcon(cat.icon);
                return (
                  <div key={cat.id || idx} className="space-y-1.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary group-hover:text-accent-green transition-colors">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-text-muted font-medium">
                            {cat.count} txns • Avg {formatCurrency(cat.avgPerTx)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-text-primary">{formatCurrency(cat.total)}</p>
                        <p className="text-[10px] font-bold" style={{ color: cat.color }}>
                          {cat.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(2, cat.percentage)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                        className="h-full rounded-full relative"
                        style={{ backgroundColor: cat.color }}
                      >
                        <div className="absolute inset-0 bg-white/25 w-1/3 rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 5 Major Outflows */}
        {topExpenses.length > 0 && (
          <div className="p-5 rounded-3xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Major Purchases
              </h3>
              <span className="text-[10px] font-bold text-text-muted">Top {topExpenses.length}</span>
            </div>

            <div className="space-y-2">
              {topExpenses.map((exp, i) => {
                const cat = categories.find((c) => c.id === exp.category) || {
                  name: 'Other',
                  color: '#A0AAB2',
                  icon: 'tag',
                };
                const CatIcon = getCategoryIcon(cat.icon);
                return (
                  <div
                    key={exp.id || i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface/40 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{exp.title}</p>
                        <p className="text-[10px] text-text-muted truncate">
                          {cat.name} • {formatTimeAgo(exp.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-3">
                      <span className="text-sm font-black text-text-primary">
                        {formatCurrency(exp.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
