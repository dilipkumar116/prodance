import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSMSStore from '../../stores/useSMSStore';
import { parseSMSBatch } from '../../utils/smsParser';
import SMSTransactionCard from './SMSTransactionCard';
import SMSAddModal from './SMSAddModal';

export default function SMSScreen() {
  const [pastedText, setPastedText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const transactions = useSMSStore(state => state.transactions);
  const addTransactions = useSMSStore(state => state.addTransactions);
  const markSkipped = useSMSStore(state => state.markSkipped);
  const pruneOld = useSMSStore(state => state.pruneOld);

  useEffect(() => {
    // Prune pending transactions older than 30 days on mount
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    pruneOld(cutoff.toISOString());
  }, [pruneOld]);

  const pendingTransactions = transactions
    .filter(t => t.status === 'pending')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate slight delay for UX
    await new Promise(res => setTimeout(res, 300));
    
    const parsed = parseSMSBatch(pastedText);
    if (parsed.length > 0) {
      addTransactions(parsed);
    }
    
    setPastedText('');
    setIsRefreshing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="h-full flex flex-col px-5 pt-5 pb-24 overflow-y-auto no-scrollbar"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">SMS Transactions</h1>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-accent-green' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="mb-6">
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste your bank SMS messages here, then tap Refresh"
          className="w-full min-h-[100px] p-4 rounded-card bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-green/50 transition-colors"
        />
      </div>

      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        Pending ({pendingTransactions.length})
      </h3>

      <div className="flex-1">
         {pendingTransactions.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center">
               <span className="text-4xl mb-3 opacity-50">✉️</span>
               <p className="text-sm text-text-secondary">No pending SMS transactions.</p>
               <p className="text-xs text-text-muted mt-1">Paste your bank SMS above and tap Refresh.</p>
            </div>
         ) : (
            <div className="space-y-3">
               <AnimatePresence mode="popLayout">
                  {pendingTransactions.map(t => (
                     <SMSTransactionCard 
                        key={t.id} 
                        transaction={t} 
                        onSkip={markSkipped}
                        onAdd={(transaction) => setSelectedTransaction(transaction)} 
                     />
                  ))}
               </AnimatePresence>
            </div>
         )}
      </div>

      {selectedTransaction && (
         <SMSAddModal 
            transaction={selectedTransaction} 
            onClose={() => setSelectedTransaction(null)} 
         />
      )}
    </motion.div>
  );
}
