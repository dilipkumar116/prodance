import { motion } from 'framer-motion';

function formatSMSDate(isoString) {
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  const hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${dd}/${mm}/${yy}, ${h12}:${mins} ${ampm}`;
}

export default function SMSTransactionCard({ transaction, onSkip, onAdd }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="p-4 rounded-btn bg-card border border-border flex items-center justify-between"
    >
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-text-primary">
          ₹{transaction.amount}
        </span>
        <span className="text-xs text-text-muted flex items-center gap-1">
          {formatSMSDate(transaction.date)}
          {transaction.dateIsApproximate && <span title="Approximate date">⚠️</span>}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSkip(transaction.id)}
          className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
        >
          Skip
        </button>
        <button
          onClick={() => onAdd(transaction)}
          className="px-4 py-2 rounded-lg bg-accent-green text-primary text-xs font-bold shadow-glow-green"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}
