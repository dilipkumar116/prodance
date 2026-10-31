import { getStoredDirectoryHandle } from './db';

export const exportData = async (financeState, productivityState) => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    finance: {
      expenses: financeState.expenses,
      categories: financeState.categories,
    },
    productivity: productivityState ? {
      goals: productivityState.goals,
      habits: productivityState.habits,
    } : undefined,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const now = new Date();
  
  const datePart = now.toISOString().slice(0, 10);
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = `prodance-${datePart}_${timePart}.json`;

  try {
    const dirHandle = await getStoredDirectoryHandle();
    if (dirHandle) {
      if ((await dirHandle.queryPermission({ mode: 'readwrite' })) === 'granted') {
        const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonStr);
        await writable.close();
        return;
      }
    }
  } catch {
    // Failed to save to custom directory, falling back to download
  }

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const getFilterDateRange = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === 'Today') {
    return { start: startOfDay, end: now };
  }
  if (filter === 'This Week') {
    const start = new Date(startOfDay);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    start.setDate(diff);
    return { start, end: now };
  }
  if (filter === 'Last Week') {
    const start = new Date(startOfDay);
    start.setDate(start.getDate() - 7);
    return { start, end: now };
  }
  if (filter === 'This Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  }
  if (filter === 'Last Month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }
  if (filter === 'Last Year') {
    const start = new Date(startOfDay);
    start.setFullYear(start.getFullYear() - 1);
    return { start, end: now };
  }
  if (filter === 'Overall') {
    return { start: new Date(0), end: now };
  }

  // Parse month string e.g. "April 2026"
  const parsed = new Date(filter);
  if (!isNaN(parsed)) {
    const start = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    const end = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  return { start: new Date(0), end: now };
};

export const getDynamicFilterOptions = () => {
  return ['This Month', 'This Week', 'Last Month', 'Overall'];
};
