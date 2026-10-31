import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiTrash, HiArrowRight, HiDownload, HiShieldCheck, HiExclamationTriangle, HiX, HiPencil } from '../../utils/icons';
import useFinanceStore from '../../stores/useFinanceStore';
import { exportData } from '../../utils/helpers';

export default function CategorySafetyModal({ mode = 'delete', category, newData = null, onClose }) {
  const financeStore = useFinanceStore();
  const [step, setStep] = useState(1); 
  const [action, setAction] = useState('move_to_existing');
  const [targetId, setTargetId] = useState('');
  const [newName, setNewName] = useState('');


  const affectedCount = useMemo(() => {
    return financeStore.expenses.filter(e => e.category === category.id).length;
  }, [financeStore.expenses, category.id]);

  const otherCategories = useMemo(() => {
    return financeStore.categories.filter(c => c.id !== category.id);
  }, [financeStore.categories, category.id]);

  const handleBackup = () => {
    exportData(financeStore);
    setStep(2);
  };

  const handleFinalAction = () => {
    if (mode === 'delete') {
      const createdCategory = action === 'move_to_new' ? {
        name: newName || 'New Category',
        color: '#4ADE80',
        icon: 'tag'
      } : null;
      financeStore.processCategoryDelete(category.id, action, targetId, createdCategory);
    } else {
      // Edit mode
      financeStore.editCategory(category.id, newData);
    }
    onClose();
  };

  if (!category) return null;

  const isEdit = mode === 'edit';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-primary flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isEdit ? 'bg-accent-blue/10 border-accent-blue/20' : 'bg-accent-red/10 border-accent-red/20'}`}>
            {isEdit ? <HiPencil className="w-5 h-5 text-accent-blue" /> : <HiTrash className="w-5 h-5 text-accent-red" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{isEdit ? 'Safe Category Edit' : 'Safe Category Deletion'}</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Category: {category.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <HiX className="w-6 h-6 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Progress Bar */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= i ? (isEdit ? 'bg-accent-blue' : 'bg-accent-red') : 'bg-border'}`} />
          ))}
        </div>

        {/* Step 1: Backup */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="p-6 rounded-card bg-surface border border-border space-y-4">
              <HiShieldCheck className="w-12 h-12 text-accent-blue" />
              <h3 className="text-xl font-bold text-text-primary">Safety First: Backup Your Data</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                You are about to modify a category linked to <span className="font-bold text-text-primary">{affectedCount} transactions</span>. 
                Before any changes are made, we must download a backup.
              </p>
            </div>
            <button 
              onClick={handleBackup}
              className="w-full py-4 rounded-btn bg-accent-blue text-primary font-bold flex items-center justify-center gap-2"
            >
              <HiDownload className="w-5 h-5" /> Download Backup & Continue
            </button>
          </motion.div>
        )}

        {/* Step 2: Impact Analysis (Edit) or Action Choice (Delete) */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {isEdit ? (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-text-primary">Review Changes</h3>
                <div className="p-4 rounded-card bg-card border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Current Name</span>
                    <span className="text-sm font-bold text-text-secondary line-through">{category.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">New Name</span>
                    <span className="text-sm font-bold text-accent-green">{newData.name}</span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-text-muted">
                      This will update <span className="text-text-primary font-bold">{affectedCount} historical records</span>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-text-primary">What should we do with the {affectedCount} transactions?</h3>
                <div className="space-y-3">
                  <button onClick={() => setAction('move_to_existing')} className={`w-full p-4 rounded-card border text-left transition-all ${action === 'move_to_existing' ? 'bg-accent-green/10 border-accent-green' : 'bg-card border-border'}`}>
                    <p className="text-sm font-bold text-text-primary">Move to existing category</p>
                    {action === 'move_to_existing' && (
                      <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full mt-3 p-3 rounded-lg bg-surface border border-border text-sm text-text-primary">
                        <option value="">Select a category...</option>
                        {otherCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </button>
                  <button onClick={() => setAction('move_to_new')} className={`w-full p-4 rounded-card border text-left transition-all ${action === 'move_to_new' ? 'bg-accent-green/10 border-accent-green' : 'bg-card border-border'}`}>
                    <p className="text-sm font-bold text-text-primary">Move to a new category</p>
                    {action === 'move_to_new' && <input type="text" placeholder="New category name..." value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full mt-3 p-3 rounded-lg bg-surface border border-border text-sm text-text-primary" />}
                  </button>
                  <button onClick={() => setAction('delete_transactions')} className={`w-full p-4 rounded-card border text-left transition-all ${action === 'delete_transactions' ? 'bg-accent-red/10 border-accent-red' : 'bg-card border-border'}`}>
                    <p className="text-sm font-bold text-text-primary">Delete all {affectedCount} transactions</p>
                    <p className="text-[10px] text-accent-red font-bold uppercase mt-1">WARNING: THIS CANNOT BE UNDONE</p>
                  </button>
                </div>
              </div>
            )}
            <button 
              disabled={!isEdit && action === 'move_to_existing' && !targetId}
              onClick={() => setStep(3)}
              className={`w-full py-4 rounded-btn font-bold flex items-center justify-center gap-2 disabled:opacity-50 ${isEdit ? 'bg-accent-blue text-primary' : 'bg-accent-green text-primary'}`}
            >
              Continue <HiArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 3: Confirmation 1 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`p-8 rounded-card border-2 border-dashed text-center space-y-4 ${isEdit ? 'bg-accent-blue/5 border-accent-blue/30' : 'bg-accent-red/5 border-accent-red/30'}`}>
              <HiExclamationTriangle className={`w-16 h-16 mx-auto ${isEdit ? 'text-accent-blue' : 'text-accent-red'}`} />
              <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${isEdit ? 'text-accent-blue' : 'text-accent-red'}`}>Warning: Impact Check</h3>
              <p className="text-sm text-text-primary font-bold leading-relaxed">
                You are about to {isEdit ? 'REWRITE' : 'PERMANENTLY MODIFY'} {affectedCount} financial records. 
                Once applied, this change will update your entire spending history.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-btn bg-surface text-text-primary font-bold">Back</button>
              <button onClick={() => setStep(4)} className={`flex-[2] py-4 rounded-btn text-white font-bold ${isEdit ? 'bg-accent-blue shadow-glow-blue' : 'bg-accent-red shadow-glow-red'}`}>I Understand, Proceed</button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`p-8 rounded-card text-white text-center space-y-4 shadow-2xl ${isEdit ? 'bg-accent-blue' : 'bg-accent-red'}`}>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Final Confirmation</h3>
              <p className="text-base font-bold leading-relaxed">
                {isEdit ? 'Apply these changes to all transactions?' : 'Delete this category and process its transactions?'}
              </p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleFinalAction}
                className={`w-full py-5 rounded-btn bg-white font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform ${isEdit ? 'text-accent-blue' : 'text-accent-red'}`}
              >
                Yes, Apply Now
              </button>
              <button onClick={onClose} className="w-full py-4 rounded-btn bg-white/10 text-white font-bold">
                No! Stop and cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
