import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiCalendar, HiListBullet, HiChevronLeft, HiChevronRight, HiPlus, HiX } from '../utils/icons';
import useFinanceStore, { getFilteredExpenses, getTotalSpent } from '../stores/useFinanceStore';
import { formatCurrency, getDynamicFilterOptions } from '../utils/helpers';
import { getCategoryIcon } from '../utils/categories';
import ExpenseItem from './finance/ExpenseItem';
import AddExpenseModal from './finance/AddExpenseModal';
const DoughnutChart = lazy(() => import('./finance/DoughnutChart'));

export default function HistoryScreen({ onClose, inline = false, initialView = 'calendar' }) {
  const [viewMode, setViewMode] = useState(initialView); // Default to calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('This Month');
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false);
  const [showMonthSummary, setShowMonthSummary] = useState(false);

  // Sync viewMode with parent prop if it changes
  useState(() => {
    if (inline) setViewMode(initialView);
  }, [initialView]);
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, year, month };
  }, [currentMonth]);

  const monthData = useMemo(() => {
    const data = {};
    (expenses || []).forEach(exp => {
      const d = new Date(exp?.createdAt || 0);
      if (d.getMonth() === daysInMonth.month && d.getFullYear() === daysInMonth.year) {
        const date = d.getDate();
        data[date] = (data[date] || 0) + exp.amount;
      }
    });
    return data;
  }, [expenses, daysInMonth]);

  const monthCategoryTotals = useMemo(() => {
    const totals = {};
    (expenses || []).forEach(exp => {
      const d = new Date(exp?.createdAt || 0);
      if (d.getMonth() === daysInMonth.month && d.getFullYear() === daysInMonth.year) {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
      }
    });
    return Object.entries(totals).map(([id, total]) => {
      const cat = (categories || []).find(c => c.id === id) || { color: '#666' };
      return { id, total, color: cat.color };
    }).sort((a, b) => b.total - a.total);
  }, [expenses, daysInMonth, categories]);

  const monthTotal = useMemo(() => monthCategoryTotals.reduce((s, c) => s + c.total, 0), [monthCategoryTotals]);

  const getConicGradient = (data) => {
    if (data.length === 0) return 'conic-gradient(#333 0deg, #333 360deg)';
    const total = data.reduce((s, d) => s + d.total, 0);
    let currentAngle = 0;
    const segments = data.map(d => {
      const startAngle = currentAngle;
      const angle = (d.total / total) * 360;
      currentAngle += angle;
      return `${d.color} ${startAngle.toFixed(2)}deg ${currentAngle.toFixed(2)}deg`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  const filteredBySelectedDate = useMemo(() => {
    return (expenses || []).filter(exp => {
      const d = new Date(exp?.createdAt || 0);
      return d.getDate() === selectedDate.getDate() && 
             d.getMonth() === selectedDate.getMonth() && 
             d.getFullYear() === selectedDate.getFullYear();
    });
  }, [expenses, selectedDate]);

  // Timeline-filtered expenses (first filter)
  const timelineFiltered = useMemo(() => {
    return getFilteredExpenses(expenses, timelineFilter);
  }, [expenses, timelineFilter]);

  // Category-filtered expenses (second filter, within timeline)
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return timelineFiltered || [];
    return (timelineFiltered || []).filter(e => e.category === selectedCategory);
  }, [timelineFiltered, selectedCategory]);

  // Total spent for the filtered set
  const totalFilteredSpent = useMemo(() => {
    return getTotalSpent(filteredExpenses);
  }, [filteredExpenses]);

  const dailyTotalsList = useMemo(() => {
    const totals = {};
    (filteredExpenses || []).forEach(exp => {
      const dateKey = new Date(exp?.createdAt || 0).toDateString();
      totals[dateKey] = (totals[dateKey] || 0) + exp.amount;
    });
    return Object.entries(totals)
      .map(([date, amount]) => ({ date: new Date(date), amount }))
      .sort((a, b) => b.date - a.date);
  }, [filteredExpenses]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      {/* Header (Only shown if NOT inline) */}
      {!inline && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
              <HiArrowLeft className="w-6 h-6 text-text-primary" />
            </button>
            <h2 className="text-lg font-bold text-text-primary">Spending History</h2>
          </div>
          <div className="flex bg-surface p-1 rounded-btn border border-border">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent-green text-primary' : 'text-text-muted'}`}
            >
              <HiListBullet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-accent-green text-primary' : 'text-text-muted'}`}
            >
              <HiCalendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 ${!inline ? 'overflow-y-auto no-scrollbar pb-10' : ''}`}>
        {(inline ? initialView : viewMode) === 'list' ? (
          <div className="space-y-4">
            {/* Timeline Filter & Total Spent Banner */}
            <div className="mx-5 mt-5 p-4 rounded-2xl bg-gradient-to-br from-accent-green/10 via-surface/60 to-surface/30 border border-accent-green/20 relative">
              {/* Decorative blur */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent-green/10 blur-2xl rounded-full pointer-events-none" />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Spent</p>
                  <motion.p
                    key={totalFilteredSpent}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black text-text-primary"
                  >
                    {formatCurrency(totalFilteredSpent)}
                  </motion.p>
                  <p className="text-[10px] text-text-muted mt-1 font-medium">
                    {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
                    {selectedCategory !== 'all' && ` in ${(categories || []).find(c => c.id === selectedCategory)?.name || 'category'}`}
                  </p>
                </div>

                {/* Timeline Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTimelineDropdown(!showTimelineDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-sm text-text-primary hover:bg-card-hover transition-colors duration-150"
                  >
                    <span className="text-xs font-bold">{timelineFilter}</span>
                    <svg
                      className={`w-3 h-3 text-text-secondary transition-transform duration-200 ${showTimelineDropdown ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {showTimelineDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-xl bg-card border border-border shadow-dropdown overflow-hidden"
                      >
                        {getDynamicFilterOptions().map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setTimelineFilter(opt);
                              setShowTimelineDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-100 ${
                              timelineFilter === opt
                                ? 'text-accent-green bg-accent-green/10'
                                : 'text-text-primary hover:bg-white/5'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-accent-green border-accent-green text-primary'
                    : 'bg-card border-border text-text-muted'
                }`}
              >
                All
              </button>
              {(categories || []).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedCategory === cat.id
                      ? 'border-accent-green text-accent-green bg-accent-green/10'
                      : 'bg-card border-border text-text-muted'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="px-5 pb-4 space-y-4">
              {(dailyTotalsList || []).map(({ date, amount }) => (
                <div key={date.toDateString()} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </h3>
                    <span className="text-sm font-bold text-text-primary">{formatCurrency(amount)}</span>
                  </div>
                  <div className="glass rounded-card p-3 space-y-1">
                    {(filteredExpenses || []).filter(e => new Date(e?.createdAt || 0).toDateString() === date.toDateString()).map(exp => (
                      <ExpenseItem key={exp.id} expense={exp} />
                    ))}
                  </div>
                </div>
              ))}
              {dailyTotalsList.length === 0 && (
                <p className="text-sm text-text-muted text-center py-20 italic">No history available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            <div className="mb-6 space-y-3">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-text-primary">
                    {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </h3>
                  {monthTotal > 0 && (
                    <motion.button 
                      onClick={() => setShowMonthSummary(true)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface border border-border hover:bg-white/5 transition-colors"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ background: getConicGradient(monthCategoryTotals) }}
                      />
                      <span className="text-xs font-bold text-text-primary">{formatCurrency(monthTotal)}</span>
                    </motion.button>
                  )}
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

              {/* Monthly Categories Slider */}
              {monthCategoryTotals.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {(monthCategoryTotals || []).map(cat => {
                    const category = (categories || []).find(c => c.id === cat.id);
                    const CatIcon = getCategoryIcon(category?.icon);
                    return (
                      <div key={cat.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (cat.color || '#666') + '20' }}>
                          <CatIcon className="w-2.5 h-2.5" style={{ color: cat.color }} />
                        </div>
                        <span className="text-[10px] font-bold text-text-primary">{category?.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-text-muted py-2">{d}</div>
              ))}
              {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth.days }).map((_, i) => {
                const day = i + 1;
                const total = monthData[day] || 0;
                const isSelected = selectedDate.getDate() === day && 
                                  selectedDate.getMonth() === daysInMonth.month && 
                                  selectedDate.getFullYear() === daysInMonth.year;
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === daysInMonth.month && 
                               new Date().getFullYear() === daysInMonth.year;
                
                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDate(new Date(daysInMonth.year, daysInMonth.month, day))}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-between relative border transition-all py-1 ${
                      isSelected ? 'bg-accent-green border-accent-green text-primary' : 'bg-card border-border text-text-primary'
                    } ${isToday && !isSelected ? 'border-accent-green' : ''}`}
                  >
                    {/* Dot at top */}
                    <div
                      style={{
                        width: 4, height: 4, borderRadius: '50%',
                        backgroundColor: total > 0 ? (isSelected ? '#000000' : '#4ADE80') : 'transparent',
                      }}
                    />
                    <span className="text-sm font-bold">{day}</span>
                    {/* Amount at bottom */}
                    <span style={{
                      fontSize: 8, fontWeight: 600, lineHeight: 1,
                      color: total > 0 ? (isSelected ? 'rgba(0,0,0,0.7)' : '#4ADE80') : 'transparent',
                    }}>
                      {total > 0 ? `₹${total >= 1000 ? `${(total/1000).toFixed(1)}k` : total}` : '0'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Day Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-text-primary">
                    {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                  </h3>
                  <button 
                    onClick={() => setAddModalOpen(true)}
                    className="p-1.5 rounded-full bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors"
                    title="Add expense for this date"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-lg font-bold text-accent-green">
                  {formatCurrency(filteredBySelectedDate.reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>
              <div className="space-y-2">
                {(filteredBySelectedDate || []).map(exp => (
                  <ExpenseItem key={exp.id} expense={exp} />
                ))}
                {filteredBySelectedDate.length === 0 && (
                  <div className="text-center py-10 px-6 bg-surface/30 rounded-card border border-dashed border-border">
                    <p className="text-sm text-text-muted italic mb-3">No expenses on this day</p>
                    <button 
                      onClick={() => setAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-accent-green/10 text-accent-green text-xs font-bold"
                    >
                      <HiPlus className="w-4 h-4" /> Add Expense
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <AddExpenseModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            defaultDate={selectedDate}
          />
        )}
      </AnimatePresence>

      {/* Month Summary Modal */}
      <AnimatePresence>
        {showMonthSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] modal-backdrop flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowMonthSummary(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-card rounded-t-[28px] sm:rounded-3xl border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/50">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} Summary
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                    {formatCurrency(monthTotal)} Total
                  </p>
                </div>
                <button onClick={() => setShowMonthSummary(false)} className="p-1.5 rounded-full hover:bg-white/10 text-text-secondary">
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto no-scrollbar space-y-6 pb-10">
                {/* Chart Display inside modal */}
                <div className="relative mb-4 mt-2">
                  <Suspense fallback={<div className="w-[240px] h-[240px] mx-auto rounded-full bg-surface/30 animate-pulse" />}>
                    <DoughnutChart 
                      customCategoryTotals={(monthCategoryTotals || []).map(c => {
                        const cat = (categories || []).find(catObj => catObj.id === c.id);
                        return { name: cat?.name, total: c.total, color: cat?.color || '#666' };
                      })}
                      customTotalSpent={monthTotal}
                    />
                  </Suspense>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Categories Split</h4>
                    <span className="text-[10px] font-bold text-accent-green uppercase">{monthCategoryTotals.length} Groups</span>
                  </div>
                  {(monthCategoryTotals || []).map((cat, idx) => {
                    const category = (categories || []).find(c => c.id === cat.id);
                    const CatIcon = getCategoryIcon(category?.icon);
                    const percent = Math.round((cat.total / monthTotal) * 100) || 0;
                    
                    return (
                      <motion.div 
                        key={cat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/50 hover:bg-surface/80 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: (cat.color || '#666') + '20' }}>
                          <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-text-primary truncate">{category?.name}</span>
                            <span className="text-xs font-black text-text-primary">{formatCurrency(cat.total)}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: cat.color }} />
                            </div>
                            <span className="text-[10px] font-bold text-text-muted w-8 text-right">{percent}%</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
