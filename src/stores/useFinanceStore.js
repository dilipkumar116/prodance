import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { generateId, getFilterDateRange } from '../utils/helpers';

// Purge obsolete deadweight storage keys from localStorage on startup
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const deadKeys = ['sms-storage', 'prodance-productivity-storage', 'productivity-storage'];
    deadKeys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Non-fatal if localStorage is restricted
  }
}

// Deep sanitizer: ensures zero corrupt entries or bloated payloads in the DB
export function sanitizeExpense(raw, categories = DEFAULT_CATEGORIES) {
  if (!raw || typeof raw !== 'object') return null;
  const num = Number(raw.amount);
  if (isNaN(num) || num <= 0) return null;

  const validCatIds = new Set(categories.map((c) => c.id));
  const rawCat = raw.category || raw.categoryId || 'others';
  const category = validCatIds.has(rawCat) ? rawCat : 'others';

  let createdAt = raw.createdAt || raw.date;
  if (!createdAt || isNaN(new Date(createdAt).getTime())) {
    createdAt = new Date().toISOString();
  } else {
    createdAt = new Date(createdAt).toISOString();
  }

  return {
    id: String(raw.id || generateId()),
    title: String(raw.title || 'Untitled Expense').trim() || 'Untitled Expense',
    amount: Math.round(num * 100) / 100,
    category,
    createdAt,
  };
}

export function sanitizeExpenseList(list = [], categories = DEFAULT_CATEGORIES) {
  if (!Array.isArray(list)) return [];
  const sanitized = [];
  for (const item of list) {
    const clean = sanitizeExpense(item, categories);
    if (clean) sanitized.push(clean);
  }
  return sanitized;
}

const useFinanceStore = create(
  persist(
    (set) => ({
      expenses: [],
      categories: [...DEFAULT_CATEGORIES],
      filter: 'This Month',

      addExpense: (expense) => {
        set((state) => {
          const clean = sanitizeExpense(
            {
              id: generateId(),
              ...expense,
              createdAt: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
            },
            state.categories
          );
          if (!clean) return state;
          return {
            expenses: [clean, ...state.expenses],
          };
        });
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      editExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((e) => {
            if (e.id !== id) return e;
            const merged = { ...e, ...updates };
            return sanitizeExpense(merged, state.categories) || e;
          }),
        }));
      },

      setFilter: (filter) => set({ filter }),

      addCategory: (category) => {
        const newCat = { id: generateId(), ...category };
        set((state) => ({
          categories: [...state.categories, newCat],
        }));
      },

      editCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      processCategoryDelete: (sourceId, action, targetId = null, newCategory = null) => {
        set((state) => {
          let updatedExpenses = [...state.expenses];
          let updatedCategories = [...state.categories];

          if (action === 'delete_transactions') {
            updatedExpenses = updatedExpenses.filter((e) => e.category !== sourceId);
          } else if (action === 'move_to_existing') {
            updatedExpenses = updatedExpenses.map((e) =>
              e.category === sourceId ? { ...e, category: targetId } : e
            );
          } else if (action === 'move_to_new' && newCategory) {
            const newCatId = generateId();
            const createdCategory = { id: newCatId, ...newCategory };
            updatedCategories.push(createdCategory);
            updatedExpenses = updatedExpenses.map((e) =>
              e.category === sourceId ? { ...e, category: newCatId } : e
            );
          }

          updatedCategories = updatedCategories.filter((c) => c.id !== sourceId);

          return {
            expenses: sanitizeExpenseList(updatedExpenses, updatedCategories),
            categories: updatedCategories,
          };
        });
      },

      importFinanceData: (data) => {
        const categories = Array.isArray(data.categories) && data.categories.length > 0
          ? data.categories
          : [...DEFAULT_CATEGORIES];
        const expenses = sanitizeExpenseList(data.expenses || [], categories);
        set({ expenses, categories });
      },
    }),
    {
      name: 'finance-storage',
      version: 4,
      partialize: (state) => ({
        expenses: sanitizeExpenseList(state.expenses, state.categories),
        categories: state.categories,
      }),
      migrate: (persistedState) => {
        if (!persistedState) return persistedState;
        if (persistedState.categories) {
          const xCat = persistedState.categories.find((c) => c.id === 'x' || c.name === 'X');
          if (xCat) xCat.color = '#FF3366';
        }
        if (persistedState.expenses) {
          persistedState.expenses = sanitizeExpenseList(
            persistedState.expenses,
            persistedState.categories || DEFAULT_CATEGORIES
          );
        }
        return persistedState;
      },
    }
  )
);

// Derived data helpers
export function getFilteredExpenses(expenses = [], filter) {
  if (!expenses || !Array.isArray(expenses)) return [];
  const { start, end } = getFilterDateRange(filter);
  return expenses.filter((e) => {
    const date = new Date(e.createdAt);
    return date >= start && date <= end;
  });
}

export function getCategoryTotals(categories = [], filteredExpenses = []) {
  if (!categories || !categories.length || !filteredExpenses) return [];

  const totals = {};
  categories.forEach((cat) => { totals[cat.id] = 0; });

  filteredExpenses.forEach((exp) => {
    const catId = exp.category || exp.categoryId;
    if (totals[catId] !== undefined) {
      totals[catId] += exp.amount || 0;
    } else {
      totals['others'] = (totals['others'] || 0) + (exp.amount || 0);
    }
  });

  return Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId) || { name: 'Others', color: '#A0AAB2', id: 'others' };
      return { ...cat, total: amount };
    });
}

export function getTotalSpent(filteredExpenses = []) {
  return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
}

export function getWeeklyTrend(expenses = []) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  return last7Days.map((date) => {
    const dayTotal = expenses
      .filter((exp) => {
        const expDate = new Date(exp.createdAt);
        return (
          expDate.getDate() === date.getDate() &&
          expDate.getMonth() === date.getMonth() &&
          expDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    return {
      date: date.toLocaleDateString(undefined, { weekday: 'short' }),
      total: dayTotal,
    };
  });
}

// Comprehensive intelligence & analytics helper
export function getDetailedAnalytics(expenses = [], categories = [], filter = 'This Month') {
  const currentList = getFilteredExpenses(expenses, filter);
  const total = getTotalSpent(currentList);
  const count = currentList.length;

  // Day calculations for daily burn rate
  const { start, end } = getFilterDateRange(filter);
  const diffTime = Math.max(end.getTime() - start.getTime(), 1);
  const daysInPeriod = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const dailyAverage = total / daysInPeriod;

  // Highest single expense
  let highestExpense = null;
  if (currentList.length > 0) {
    highestExpense = [...currentList].sort((a, b) => b.amount - a.amount)[0];
  }

  // Frequency by category
  const categoryFreq = {};
  const categorySums = {};
  currentList.forEach((e) => {
    const cat = e.category || 'others';
    categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
    categorySums[cat] = (categorySums[cat] || 0) + (e.amount || 0);
  });

  let mostFrequentCatId = null;
  let maxFreq = 0;
  Object.entries(categoryFreq).forEach(([catId, c]) => {
    if (c > maxFreq) {
      maxFreq = c;
      mostFrequentCatId = catId;
    }
  });

  const mostFrequentCategory = mostFrequentCatId
    ? {
        ...categories.find((c) => c.id === mostFrequentCatId) || { name: 'Others', color: '#A0AAB2' },
        count: maxFreq,
        total: categorySums[mostFrequentCatId] || 0,
      }
    : null;

  // Peak day of week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekTotals = [0, 0, 0, 0, 0, 0, 0];
  currentList.forEach((e) => {
    const d = new Date(e.createdAt).getDay();
    dayOfWeekTotals[d] += e.amount || 0;
  });
  let peakDayIdx = 0;
  let peakDayAmount = 0;
  dayOfWeekTotals.forEach((amt, idx) => {
    if (amt > peakDayAmount) {
      peakDayAmount = amt;
      peakDayIdx = idx;
    }
  });

  const peakDayOfWeek = peakDayAmount > 0
    ? {
        name: dayNames[peakDayIdx],
        total: peakDayAmount,
        percentage: total > 0 ? Math.round((peakDayAmount / total) * 100) : 0,
      }
    : null;

  // Top 5 largest expenses
  const topExpenses = [...currentList]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Category breakdown list
  const categoryBreakdown = getCategoryTotals(categories, currentList)
    .map((c) => ({
      ...c,
      count: categoryFreq[c.id] || 0,
      percentage: total > 0 ? Math.round((c.total / total) * 100) : 0,
      avgPerTx: (categoryFreq[c.id] || 0) > 0 ? c.total / categoryFreq[c.id] : c.total,
    }))
    .sort((a, b) => b.total - a.total);

  // Sparkline/trend data (last 7 or 14 buckets depending on filter)
  const trendBuckets = getWeeklyTrend(currentList.length > 0 ? currentList : expenses);

  return {
    filteredExpenses: currentList,
    total,
    count,
    dailyAverage,
    highestExpense,
    mostFrequentCategory,
    peakDayOfWeek,
    topExpenses,
    categoryBreakdown,
    trendBuckets,
    daysInPeriod,
  };
}

export default useFinanceStore;
