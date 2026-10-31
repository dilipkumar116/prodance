import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiX, HiPencil, HiArrowRight, HiShieldCheck, HiExclamationTriangle, HiCheck } from '../../utils/icons';
import useFinanceStore from '../../stores/useFinanceStore';
import { exportData } from '../../utils/helpers';
import { getCategoryIcon } from '../../utils/categories';

export default function EditCategorySafetyModal({ originalCategory, newCategoryData, onClose, onConfirm }) {
  const financeStore = useFinanceStore();
  const [step, setStep] = useState(1);
  const [saveBackup, setSaveBackup] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const affectedCount = useMemo(() => {
    return financeStore.expenses.filter(e => e.category === originalCategory.id).length;
  }, [financeStore.expenses, originalCategory.id]);

  const handleFinalAction = async () => {
    setIsProcessing(true);
    if (saveBackup) {
      await exportData(financeStore);
    }
    financeStore.editCategory(originalCategory.id, newCategoryData);
    setIsProcessing(false);
    onConfirm();
  };

  if (!originalCategory || !newCategoryData) return null;

  const oldIconComp = getCategoryIcon(originalCategory.icon);
  const newIconComp = getCategoryIcon(newCategoryData.icon);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-primary/95 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-accent-blue/10 border-accent-blue/20">
            <HiPencil className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Safe Category Update</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">2-Step Verification</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <HiX className="w-6 h-6 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col justify-center max-w-lg mx-auto w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-4">
          <div className="h-1.5 flex-1 rounded-full transition-colors bg-accent-blue" />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-accent-blue' : 'bg-border'}`} />
        </div>

        {/* Step 1: Impact & Backup Selection */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-text-primary">Review Changes</h3>
              <p className="text-sm text-text-secondary">Please review the updates before proceeding.</p>
            </div>

            {/* Before / After Visualization */}
            <div className="flex items-center justify-between p-4 rounded-card bg-surface border border-border">
              {/* Before */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Original</span>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10" style={{ backgroundColor: originalCategory.color + '20' }}>
                  {oldIconComp({ className: "w-6 h-6", style: { color: originalCategory.color } })}
                </div>
                <span className="text-xs font-bold text-text-secondary truncate w-full text-center">{originalCategory.name}</span>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center w-1/3">
                <div className="p-2 rounded-full bg-card border border-border">
                  <HiArrowRight className="w-5 h-5 text-text-muted" />
                </div>
              </div>

              {/* After */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">New</span>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow-blue border border-accent-blue/30" style={{ backgroundColor: newCategoryData.color + '20' }}>
                  {newIconComp({ className: "w-6 h-6", style: { color: newCategoryData.color } })}
                </div>
                <span className="text-xs font-bold text-text-primary truncate w-full text-center">{newCategoryData.name}</span>
              </div>
            </div>

            {/* Impact Count */}
            <div className="p-4 rounded-card bg-accent-blue/10 border border-accent-blue/20 flex items-center gap-4">
              <HiExclamationTriangle className="w-8 h-8 text-accent-blue shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-accent-blue">Transaction Impact</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  This change will automatically update <span className="font-bold text-text-primary">{affectedCount} historical transactions</span> currently categorized as "{originalCategory.name}".
                </p>
              </div>
            </div>

            {/* Save Backup Toggle */}
            <div className="p-4 rounded-card bg-card border border-border flex items-center justify-between cursor-pointer" onClick={() => setSaveBackup(!saveBackup)}>
              <div className="flex items-center gap-3">
                <HiShieldCheck className={`w-6 h-6 ${saveBackup ? 'text-accent-green' : 'text-text-muted'}`} />
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Save Backup First</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">Highly recommended before modifying data.</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${saveBackup ? 'bg-accent-green' : 'bg-surface border border-border'}`}>
                <motion.div layout className={`w-4 h-4 rounded-full bg-white shadow-sm ${saveBackup ? 'ml-6' : 'ml-0'}`} />
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-btn bg-accent-blue text-primary font-bold flex items-center justify-center gap-2 shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Proceed to Confirm <HiArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Final Confirmation */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            
            <div className="p-8 rounded-card border-2 border-dashed bg-accent-blue/5 border-accent-blue/30 text-center space-y-4">
              <HiShieldCheck className="w-16 h-16 mx-auto text-accent-blue" />
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-accent-blue">Final Confirmation</h3>
              <p className="text-sm text-text-primary font-bold leading-relaxed">
                Are you sure you want to apply these changes to your financial records? <br/><br/>
                This action will instantly update {affectedCount} transactions.
              </p>
              {saveBackup && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-[10px] text-accent-green font-bold uppercase tracking-wider">
                  <HiCheck className="w-3.5 h-3.5" /> Backup will be generated
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)} 
                disabled={isProcessing}
                className="flex-1 py-4 rounded-btn bg-surface text-text-primary font-bold hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleFinalAction} 
                disabled={isProcessing}
                className="flex-[2] py-4 rounded-btn bg-accent-blue text-primary font-bold shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>Yes, Apply Changes</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
