import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryIcon, getCategoryById } from '../../utils/categories';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';
import useFinanceStore from '../../stores/useFinanceStore';
import { HiTrash, HiDotsVertical, HiX } from '../../utils/icons';

// Inline swap/tag icon for "change category"
const SwapIcon = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-1.47a.75.75 0 111.22-.872l2.25 3.15a.75.75 0 010 .872l-2.25 3.15a.75.75 0 11-1.22-.872l1.048-1.47H6.75A.75.75 0 016 10z" clipRule="evenodd" />
  </svg>
);

export default function ExpenseItem({ expense }) {
  const categories = useFinanceStore((s) => s.categories);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);
  const editExpense = useFinanceStore((s) => s.editExpense);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [stagedCategory, setStagedCategory] = useState(null);

  useEffect(() => {
    const handleMenuOpen = (e) => {
      if (e.detail !== expense.id) {
        setShowMenu(false);
        setShowConfirm(false);
        setShowCategoryPicker(false);
        setStagedCategory(null);
      }
    };
    window.addEventListener('expense-menu-open', handleMenuOpen);
    return () => window.removeEventListener('expense-menu-open', handleMenuOpen);
  }, [expense.id]);
  
  if (!expense || !categories) return null;

  const cat = getCategoryById(categories, expense.category) || categories[0] || { name: 'Other', color: '#666', icon: 'food' };
  const iconComp = getCategoryIcon(cat.icon);

  const handleCategorySelect = (catId) => {
    if (catId === expense.category) return;
    setStagedCategory(catId);
  };

  const confirmCategoryChange = () => {
    if (stagedCategory) {
      editExpense(expense.id, { category: stagedCategory });
    }
    setStagedCategory(null);
    setShowCategoryPicker(false);
    setShowMenu(false);
  };

  const closeCategoryPicker = () => {
    setStagedCategory(null);
    setShowCategoryPicker(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 py-3 soft-separator group relative"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (cat.color || '#666') + '18' }}
      >
        {iconComp({ className: "w-5 h-5", style: { color: cat.color } })}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {expense.title || 'Untitled Expense'}
        </p>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{cat.name}</p>
      </div>

      {/* Amount + Time or Actions */}
      <div className="text-right flex-shrink-0 flex items-center min-h-[40px]">
        <AnimatePresence mode="wait">
          {!showMenu ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              <div className="flex flex-col items-end mr-1">
                <p className="text-sm font-black text-text-primary">
                  {formatCurrency(expense.amount || 0)}
                </p>
                <p className="text-[10px] text-text-muted font-medium">
                  {formatTimeAgo(expense.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMenu(true);
                  window.dispatchEvent(new CustomEvent('expense-menu-open', { detail: expense.id }));
                }}
                className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <HiDotsVertical className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border"
            >
              {showConfirm ? (
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="px-3 py-1.5 rounded-lg bg-accent-red text-white text-[10px] font-bold uppercase tracking-widest shadow-glow-red"
                >
                  Confirm Delete
                </button>
              ) : (
                <>
                  {/* Change Category Button */}
                  <button
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className={`p-1.5 rounded-lg transition-colors ${showCategoryPicker ? 'bg-accent-green/20 text-accent-green' : 'text-text-secondary hover:bg-white/10'}`}
                    title="Change category"
                  >
                    <SwapIcon className="w-4 h-4" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="p-1.5 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowConfirm(false);
                  closeCategoryPicker();
                }}
                className="p-1.5 rounded-lg text-text-muted hover:bg-white/5 transition-colors"
              >
                <HiX className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Picker Modal */}
      <AnimatePresence>
        {showCategoryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] modal-backdrop flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowCategoryPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-sm bg-card rounded-t-[28px] sm:rounded-3xl border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/50">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">
                  {stagedCategory ? 'Confirm Change' : 'Move to Category'}
                </h3>
                <button onClick={closeCategoryPicker} className="p-1.5 rounded-full hover:bg-white/10 text-text-secondary">
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 overflow-y-auto no-scrollbar flex-1 pb-10">
                {stagedCategory ? (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key="confirm-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 flex flex-col items-center justify-center space-y-8 mt-4"
                    >
                      <div className="flex items-center justify-center gap-4 w-full">
                        {/* Old Category */}
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: (cat.color || '#666') + '18' }}>
                            {iconComp({ className: "w-6 h-6", style: { color: cat.color } })}
                          </div>
                          <span className="text-xs font-bold text-text-muted truncate w-full text-center">{cat.name}</span>
                        </div>

                        {/* Arrow */}
                        <div className="p-2 rounded-full bg-surface border border-border flex-shrink-0 relative">
                          <div className="absolute inset-0 bg-accent-green/20 animate-pulse rounded-full blur-md" />
                          <svg className="w-5 h-5 text-accent-green relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>

                        {/* New Category */}
                        {(() => {
                          const newC = getCategoryById(categories, stagedCategory);
                          const NewIcon = getCategoryIcon(newC?.icon);
                          return (
                            <div className="flex flex-col items-center gap-2 flex-1">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: (newC?.color || '#666') + '18', border: `2px solid ${newC?.color}` }}>
                                <NewIcon className="w-6 h-6" style={{ color: newC?.color }} />
                              </div>
                              <span className="text-xs font-bold text-text-primary truncate w-full text-center">{newC?.name}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="w-full space-y-2">
                        <button
                          onClick={confirmCategoryChange}
                          className="w-full py-4 rounded-btn bg-accent-green text-primary font-bold text-sm shadow-glow-green"
                        >
                          Confirm Move
                        </button>
                        <button
                          onClick={() => setStagedCategory(null)}
                          className="w-full py-3.5 rounded-btn bg-surface border border-border text-text-primary font-bold text-sm hover:bg-white/5 transition-colors"
                        >
                          Back to List
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <motion.div 
                    key="list-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-2 p-2"
                  >
                    {categories.map((c) => {
                      const isActive = c.id === expense.category;
                      const CatIcon = getCategoryIcon(c.icon);
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleCategorySelect(c.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-accent-green/20 border-accent-green text-accent-green'
                              : 'bg-surface border-border text-text-secondary hover:bg-white/5'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: (c.color || '#666') + '18' }}
                          >
                            <CatIcon className="w-4 h-4" style={{ color: c.color }} />
                          </div>
                          <span className="text-xs font-bold truncate">{c.name}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-accent-green flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
