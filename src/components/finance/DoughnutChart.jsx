import { useMemo } from 'react';
import { motion } from 'framer-motion';
import useFinanceStore, { getFilteredExpenses, getCategoryTotals, getTotalSpent } from '../../stores/useFinanceStore';
import { formatCurrency } from '../../utils/helpers';

export default function DoughnutChart({ customCategoryTotals, customTotalSpent }) {
  const expenses = useFinanceStore((s) => s.expenses) || [];
  const categories = useFinanceStore((s) => s.categories) || [];
  const filter = useFinanceStore((s) => s.filter);

  const filteredExpenses = getFilteredExpenses(expenses, filter);
  const categoryTotals = customCategoryTotals || getCategoryTotals(categories, filteredExpenses);
  const totalSpent = customTotalSpent !== undefined ? customTotalSpent : getTotalSpent(filteredExpenses);

  const hasData = categoryTotals.length > 0;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const segments = useMemo(() => {
    if (!hasData || totalSpent === 0) return [];
    let currentOffset = 0;
    return (categoryTotals || []).map(c => {
      // Create a small gap by reducing the segment length slightly, 
      // except if it's the only segment (100%)
      const percentage = c.total / totalSpent;
      const isFull = percentage === 1;
      const gap = isFull ? 0 : 4; // 4px gap
      
      const dashLength = Math.max(0, (percentage * circumference) - gap);
      const dashRest = circumference - dashLength;
      
      const segment = {
        ...c,
        strokeDasharray: `${dashLength} ${dashRest}`,
        strokeDashoffset: -currentOffset,
        percentage
      };
      
      currentOffset += (percentage * circumference);
      return segment;
    });
  }, [categoryTotals, totalSpent, hasData, circumference]);

  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto mt-2 flex items-center justify-center">
      <motion.svg 
        viewBox="0 0 200 200" 
        className="w-full h-full transform -rotate-90 drop-shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {!hasData || totalSpent === 0 ? (
          <circle 
            cx="100" cy="100" r={radius} 
            fill="transparent" 
            stroke="rgba(255, 255, 255, 0.05)" 
            strokeWidth="20" 
          />
        ) : (
          (segments || []).map((s, i) => (
            <motion.circle
              key={i}
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth="20"
              strokeLinecap="butt"
              strokeDasharray={s.strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: s.strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
            />
          ))
        )}
      </motion.svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Total</span>
        <span className="text-xl font-black text-text-primary">
          {formatCurrency(totalSpent)}
        </span>
      </div>
    </div>
  );
}
