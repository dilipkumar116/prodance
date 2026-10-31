import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowLeft,
  HiTrendingUp,
  HiLightningBolt,
  HiArrowUp,
  HiCalendar,
  HiChartBar,
  HiChevronLeft,
  HiChevronRight,
  HiX,
} from '../../utils/icons';
import useFinanceStore, { getDetailedAnalytics } from '../../stores/useFinanceStore';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';
import { getCategoryIcon } from '../../utils/categories';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function AnalyticsScreen({ onClose, inline = false }) {
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);

  const [selectedPeriodTab, setSelectedPeriodTab] = useState('This Month');
  const [customMonthDate, setCustomMonthDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const [selectedCategoryDrilldown, setSelectedCategoryDrilldown] = useState(null);

  const periodOptions = ['This Month', 'This Week', 'Last Month', 'Custom'];

  // Current active period filter string passed to analytics
  const activePeriodFilter = useMemo(() => {
    if (selectedPeriodTab === 'Custom') {
      return `${MONTH_NAMES[customMonthDate.month]} ${customMonthDate.year}`;
    }
    return selectedPeriodTab;
  }, [selectedPeriodTab, customMonthDate]);

  // Compute rich analytics for the selected period
  const analytics = useMemo(() => {
    return getDetailedAnalytics(expenses, categories, activePeriodFilter);
  }, [expenses, categories, activePeriodFilter]);

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

  // Available years where transactions exist
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const set = new Set([currentYear]);
    (expenses || []).forEach((e) => {
      if (e.createdAt) {
        const y = new Date(e.createdAt).getFullYear();
        if (!isNaN(y)) set.add(y);
      }
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [expenses]);

  // Count & spend per month to show badges in calendar
  const monthDataMap = useMemo(() => {
    const map = {};
    (expenses || []).forEach((e) => {
      if (e.createdAt) {
        const d = new Date(e.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!map[key]) map[key] = { count: 0, total: 0 };
          map[key].count += 1;
          map[key].total += e.amount || 0;
        }
      }
    });
    return map;
  }, [expenses]);

  // Transactions for selected category drilldown
  const drilldownTransactions = useMemo(() => {
    if (!selectedCategoryDrilldown) return [];
    return (filteredExpenses || [])
      .filter((e) => {
        const catId = e.category || e.categoryId;
        if (selectedCategoryDrilldown.id === 'others') {
          return !categories.some((c) => c.id === catId);
        }
        return catId === selectedCategoryDrilldown.id;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [selectedCategoryDrilldown, filteredExpenses, categories]);

  const openMonthPicker = () => {
    setPickerYear(customMonthDate.year);
    setShowMonthPicker(true);
  };

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
        
        {/* Period Selector Tabs: Replace 'Overall' with 'Custom' */}
        <div className="flex items-center p-1 rounded-2xl bg-surface/70 border border-border gap-1">
          {periodOptions.map((opt) => {
            const isActive = selectedPeriodTab === opt;
            return (
              <button
                key={opt}
                onClick={() => {
                  if (opt === 'Custom') {
                    setSelectedPeriodTab('Custom');
                    openMonthPicker();
                  } else {
                    setSelectedPeriodTab(opt);
                  }
                }}
                className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 z-10 flex items-center justify-center gap-1 ${
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
                <span>{opt}</span>
                {opt === 'Custom' && (
                  <HiCalendar className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Hero Period Summary Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-card via-surface/60 to-surface/30 border border-white/5 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Total Spending • {activePeriodFilter}
                </p>
                {selectedPeriodTab === 'Custom' && (
                  <button
                    onClick={openMonthPicker}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20 transition-all active:scale-95"
                    title="Change selected month"
                  >
                    <HiCalendar className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
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
              <p className="text-[10px] text-text-muted mt-0.5">
                {selectedPeriodTab === 'This Week' ? '7-Day Outflow Pattern' : 'Weekly Outflow Pattern'}
              </p>
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

        {/* Category Breakdown Details with Clickable Drilldown */}
        <div className="p-5 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Category Distribution
              </h3>
              <p className="text-[10px] text-text-muted font-medium mt-0.5">
                Tap any category to view its transactions
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted">
              {categoryBreakdown.length} Active
            </span>
          </div>

          <div className="space-y-1">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-text-muted italic">No expenses in this period.</p>
              </div>
            ) : (
              categoryBreakdown.map((cat, idx) => {
                const CatIcon = getCategoryIcon(cat.icon);
                return (
                  <div
                    key={cat.id || idx}
                    onClick={() => setSelectedCategoryDrilldown(cat)}
                    role="button"
                    tabIndex={0}
                    className="p-3 -mx-2 rounded-2xl hover:bg-white/5 active:scale-[0.99] transition-all cursor-pointer group border border-transparent hover:border-white/5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary group-hover:text-accent-green transition-colors truncate">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-text-muted font-medium">
                              {cat.count} {cat.count === 1 ? 'txn' : 'txns'} • Avg {formatCurrency(cat.avgPerTx)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right flex-shrink-0">
                          <div>
                            <p className="text-xs font-black text-text-primary">{formatCurrency(cat.total)}</p>
                            <p className="text-[10px] font-bold" style={{ color: cat.color }}>
                              {cat.percentage}%
                            </p>
                          </div>
                          <HiChevronRight className="w-4 h-4 text-text-muted/60 group-hover:text-accent-green group-hover:translate-x-0.5 transition-all" />
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

      {/* Custom Month Picker Calendar Modal (Months only, no days) */}
      <AnimatePresence>
        {showMonthPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] modal-backdrop flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowMonthPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-card rounded-t-[28px] sm:rounded-3xl border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Drag handle for mobile */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3 sm:hidden" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-2 pb-4 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Select Month</h3>
                  <p className="text-xs text-text-muted mt-0.5">Analyze data for a specific month</p>
                </div>
                <button
                  onClick={() => setShowMonthPicker(false)}
                  className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto no-scrollbar space-y-5">
                {/* Year Navigation Bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-white/5">
                  <button
                    onClick={() => setPickerYear((y) => y - 1)}
                    className="p-2 rounded-xl bg-card hover:bg-white/10 text-text-primary transition-all active:scale-95"
                    aria-label="Previous Year"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <p className="text-xl font-black text-text-primary tracking-tight">{pickerYear}</p>
                    <p className="text-[10px] font-semibold text-text-muted">
                      {availableYears.includes(pickerYear) ? 'Data available' : 'No recorded transactions'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPickerYear((y) => y + 1)}
                    className="p-2 rounded-xl bg-card hover:bg-white/10 text-text-primary transition-all active:scale-95"
                    aria-label="Next Year"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Available Years Quick Select */}
                {availableYears.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex-shrink-0 mr-1">
                      Years:
                    </span>
                    {availableYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => setPickerYear(y)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          pickerYear === y
                            ? 'bg-accent-green text-primary shadow-sm'
                            : 'bg-surface/80 text-text-muted hover:text-text-primary border border-white/5'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}

                {/* 12-Month Grid (Months only, no days) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {SHORT_MONTH_NAMES.map((mName, mIdx) => {
                    const isSelected =
                      selectedPeriodTab === 'Custom' &&
                      customMonthDate.year === pickerYear &&
                      customMonthDate.month === mIdx;
                    const key = `${pickerYear}-${mIdx}`;
                    const data = monthDataMap[key];
                    const hasData = data && data.count > 0;

                    return (
                      <button
                        key={mName}
                        onClick={() => {
                          setCustomMonthDate({ year: pickerYear, month: mIdx });
                          setSelectedPeriodTab('Custom');
                          setShowMonthPicker(false);
                        }}
                        className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-accent-green text-primary shadow-lg ring-2 ring-accent-green/40'
                            : hasData
                            ? 'bg-card border border-accent-green/30 hover:border-accent-green hover:bg-white/5 text-text-primary'
                            : 'bg-card/50 border border-white/5 hover:border-white/10 hover:bg-white/5 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className="text-sm font-extrabold tracking-tight">{mName}</span>
                        {hasData ? (
                          <span
                            className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-accent-green/10 text-accent-green'
                            }`}
                          >
                            {data.count} {data.count === 1 ? 'txn' : 'txns'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium opacity-40 mt-1">
                            0 txns
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Transactions Drilldown Modal */}
      <AnimatePresence>
        {selectedCategoryDrilldown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] modal-backdrop flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setSelectedCategoryDrilldown(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-card rounded-t-[28px] sm:rounded-3xl border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Drag handle for mobile */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3 sm:hidden" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-2 pb-4 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${selectedCategoryDrilldown.color}25` }}
                  >
                    {(() => {
                      const CatIcon = getCategoryIcon(selectedCategoryDrilldown.icon);
                      return <CatIcon className="w-5 h-5" style={{ color: selectedCategoryDrilldown.color }} />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-text-primary truncate">
                      {selectedCategoryDrilldown.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {drilldownTransactions.length} {drilldownTransactions.length === 1 ? 'transaction' : 'transactions'} • {activePeriodFilter}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-base font-black text-text-primary">
                      {formatCurrency(selectedCategoryDrilldown.total)}
                    </p>
                    <p className="text-[10px] font-bold" style={{ color: selectedCategoryDrilldown.color }}>
                      {selectedCategoryDrilldown.percentage}% of spend
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCategoryDrilldown(null)}
                    className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Transaction List */}
              <div className="p-5 overflow-y-auto no-scrollbar space-y-2.5 max-h-[60vh]">
                {drilldownTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm font-bold text-text-primary mb-1">No Transactions Found</p>
                    <p className="text-xs text-text-muted">
                      No expenses recorded under {selectedCategoryDrilldown.name} for {activePeriodFilter}.
                    </p>
                  </div>
                ) : (
                  drilldownTransactions.map((exp) => {
                    const expDate = new Date(exp.createdAt);
                    const formattedDate = expDate.toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    const formattedTime = expDate.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-2xl bg-surface/50 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-text-primary truncate">
                            {exp.title}
                          </p>
                          <p className="text-[10px] text-text-muted font-medium">
                            {formattedDate} • {formattedTime}
                          </p>
                          {exp.note && (
                            <p className="text-[10px] text-text-muted/80 italic truncate">
                              {exp.note}
                            </p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-black text-text-primary">
                            {formatCurrency(exp.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
