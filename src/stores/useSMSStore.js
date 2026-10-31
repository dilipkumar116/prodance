import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSMSStore = create(
  persist(
    (set) => ({
      transactions: [],

      addTransactions: (newList) => {
        set((state) => {
          const existingIds = new Set(state.transactions.map((t) => t.id));
          const toAdd = newList.filter((t) => !existingIds.has(t.id));
          return {
            transactions: [...toAdd, ...state.transactions],
          };
        });
      },

      markAdded: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, status: 'added' } : t
          ),
        }));
      },

      markSkipped: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, status: 'skipped' } : t
          ),
        }));
      },
      
      pruneOld: (cutoffISO) => {
         set((state) => ({
            transactions: state.transactions.filter(
               (t) => t.status === 'pending'
                  ? new Date(t.date) >= new Date(cutoffISO)
                  : true // keep added/skipped indefinitely for deduplication
            )
         }));
      }
    }),
    {
      name: 'sms-storage',
      version: 1,
      migrate: (persistedState, version) => {
         if (version < 1) {
            return { transactions: [] };
         }
         return persistedState;
      }
    }
  )
);

export default useSMSStore;
