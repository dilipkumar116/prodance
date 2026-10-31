import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDownload, HiUpload, HiPencil, HiTrash, HiCheck, HiShieldCheck, HiArrowUp, HiArrowDown } from '../utils/icons';
import useFinanceStore from '../stores/useFinanceStore';
import { exportData, importData } from '../utils/helpers';
import { CATEGORY_ICONS } from '../utils/categories';
import CategorySafetyModal from './finance/CategorySafetyModal';
import EditCategorySafetyModal from './finance/EditCategorySafetyModal';
import { getStoredDirectoryHandle, setStoredDirectoryHandle, removeStoredDirectoryHandle } from '../utils/db';
import useProductivityStore from '../stores/useProductivityStore';
import AddHabitModal from './productivity/AddHabitModal';
import * as Icons from '../utils/icons';

export default function SettingsScreen() {
  const financeStore = useFinanceStore();
  const productivityStore = useProductivityStore();
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [safetyAction, setSafetyAction] = useState(null); // { mode: 'edit'|'delete', category, newData }
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [backupDirName, setBackupDirName] = useState('');
  const [backupDirHandle, setBackupDirHandle] = useState(null);
  const [dirPermission, setDirPermission] = useState('prompt');
  const [showCategories, setShowCategories] = useState(false);
  const [showHabits, setShowHabits] = useState(false);
  const [showBackupSettings, setShowBackupSettings] = useState(false);

  useEffect(() => {
    getStoredDirectoryHandle().then(async (handle) => {
      if (handle) {
        setBackupDirHandle(handle);
        setBackupDirName(handle.name);
        const perm = await handle.queryPermission({ mode: 'readwrite' });
        setDirPermission(perm);
      }
    });
  }, []);

  const handleConfigureFolder = async () => {
    try {
      if (!window.showDirectoryPicker) {
        alert("Your browser or current environment does not support the File System Access API. This feature requires a modern browser (Chrome/Edge) running in a secure context (HTTPS or localhost).");
        return;
      }
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await setStoredDirectoryHandle(handle);
      setBackupDirHandle(handle);
      setBackupDirName(handle.name);
      setDirPermission('granted');
    } catch (e) {
      console.error('User cancelled or error picking directory', e);
      if (e.name !== 'AbortError') {
        alert('Could not open folder manager: ' + e.message);
      }
    }
  };

  const handleClearFolder = async () => {
    await removeStoredDirectoryHandle();
    setBackupDirHandle(null);
    setBackupDirName('');
    setDirPermission('prompt');
  };

  const handleRequestPermission = async () => {
    if (backupDirHandle) {
      const perm = await backupDirHandle.requestPermission({ mode: 'readwrite' });
      setDirPermission(perm);
    }
  };

  const handleExport = async () => {
    await exportData(financeStore, productivityStore);
    setImportStatus('Data exported!');
    setTimeout(() => setImportStatus(''), 2000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      if (data.finance) {
        financeStore.importFinanceData(data.finance);
      }
      if (data.productivity) {
        productivityStore.importProductivityData(data.productivity);
      }
      setImportStatus('Data imported successfully!');
      setTimeout(() => setImportStatus(''), 2000);
    } catch (err) {
      setImportStatus(`Error: ${err.message}`);
      setTimeout(() => setImportStatus(''), 3000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
      className="h-full flex flex-col px-5 pt-5 pb-24 overflow-y-auto no-scrollbar"
    >
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Data Management */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Data Management</h3>
          <div className="space-y-2">
            <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-3 rounded-btn bg-card border border-border hover:bg-card-hover transition-colors">
              <HiDownload className="w-5 h-5 text-accent-blue" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Export Data</p>
                <p className="text-[10px] text-text-muted">Download your productivity backup</p>
              </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 rounded-btn bg-card border border-border hover:bg-card-hover transition-colors">
              <HiUpload className="w-5 h-5 text-accent-green" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Import Data</p>
                <p className="text-[10px] text-text-muted">Restore from a JSON backup</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {importStatus && <p className={`text-[10px] text-center mt-1 ${importStatus.startsWith('Error') ? 'text-accent-red' : 'text-accent-green'}`}>{importStatus}</p>}
          </div>

          <div className="mt-4">
            <button 
              onClick={() => setShowBackupSettings(!showBackupSettings)}
              className="w-full flex items-center justify-between text-left bg-surface p-3 rounded-btn border border-border hover:bg-white/5 transition-colors"
            >
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                  <HiShieldCheck className="w-4 h-4" />
                </span>
                Backup Destination
              </h3>
              <svg className={`w-5 h-5 text-text-muted transition-transform ${showBackupSettings ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <AnimatePresence>
              {showBackupSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-b-card bg-surface/50 border-x border-b border-border mt-[-4px] pt-5">
                    {backupDirHandle ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-text-secondary">Selected Folder:</p>
                            <p className="text-sm font-bold text-accent-blue">{backupDirName}</p>
                          </div>
                          {dirPermission !== 'granted' ? (
                            <button onClick={handleRequestPermission} className="px-3 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20 text-[10px] text-accent-red font-bold flex items-center gap-1">
                              <HiShieldCheck className="w-3.5 h-3.5" /> Authorize
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-[10px] text-accent-green font-bold flex items-center gap-1">
                              <HiCheck className="w-3.5 h-3.5" /> Authorized
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleConfigureFolder} className="flex-1 py-2 rounded-btn bg-card border border-border text-xs font-bold text-text-primary hover:bg-white/5 transition-colors">Change</button>
                          <button onClick={handleClearFolder} className="flex-1 py-2 rounded-btn bg-accent-red/10 border border-accent-red/20 text-xs font-bold text-accent-red hover:bg-accent-red/20 transition-colors">Clear</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-text-muted leading-relaxed">Not configured. Backups will download to your default downloads folder.</p>
                        <button onClick={handleConfigureFolder} className="w-full py-2.5 rounded-btn bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-bold text-sm hover:bg-accent-blue/20 transition-colors">
                          Configure Folder
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>


        {/* Categories */}
        <section>
          <button 
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between text-left mb-3 bg-surface p-3 rounded-btn border border-border hover:bg-white/5 transition-colors"
          >
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent-blue/10 text-accent-blue flex items-center justify-center">💼</span>
              Finance Categories
            </h3>
            <svg className={`w-5 h-5 text-text-muted transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 pb-4">
            {(financeStore.categories || []).map((cat, index) => {
              if (!cat) return null;
              return (
              <div key={cat.id || `fallback-cat-${index}`} className="p-3 rounded-btn bg-card border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat.color || '#666') + '18' }}>
                    {(() => {
                      const Icon = (cat.icon && CATEGORY_ICONS[cat.icon]) ? CATEGORY_ICONS[cat.icon] : HiDownload;
                      return <Icon className="w-4 h-4" style={{ color: cat.color || '#666' }} />;
                    })()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingCategory(cat)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
                      <HiPencil className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                    <button 
                      onClick={() => setDeletingCategory(cat)} 
                      className="p-1.5 rounded-md hover:bg-accent-red/10 transition-colors"
                    >
                      <HiTrash className="w-3.5 h-3.5 text-accent-red" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{cat.name || 'Unnamed'}</p>
              </div>
            )})}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Productivity Habits */}
        <section>
          <button 
            onClick={() => setShowHabits(!showHabits)}
            className="w-full flex items-center justify-between text-left mb-3 bg-surface p-3 rounded-btn border border-border hover:bg-white/5 transition-colors"
          >
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent-green/10 text-accent-green flex items-center justify-center">🚀</span>
              Productivity Habits
            </h3>
            <svg className={`w-5 h-5 text-text-muted transition-transform ${showHabits ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <AnimatePresence>
            {showHabits && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mb-3">
            {(productivityStore.habits || []).map((habit, index) => {
              if (!habit) return null;
              return (
              <div key={habit.id || `fallback-habit-${index}`} className="p-3 rounded-btn bg-card border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (habit.color || '#666') + '18' }}>
                    {(() => {
                      const Icon = (habit.icon && Icons[habit.icon]) ? Icons[habit.icon] : HiDownload;
                      return <Icon className="w-4 h-4" style={{ color: habit.color || '#666' }} />;
                    })()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => productivityStore.moveHabitUp(habit.id)} className="p-1 rounded-md hover:bg-white/5 transition-colors" title="Move Up">
                      <HiArrowUp className="w-3 h-3 text-text-muted" />
                    </button>
                    <button onClick={() => productivityStore.moveHabitDown(habit.id)} className="p-1 rounded-md hover:bg-white/5 transition-colors" title="Move Down">
                      <HiArrowDown className="w-3 h-3 text-text-muted" />
                    </button>
                    <button onClick={() => setEditingHabit(habit)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors ml-1">
                      <HiPencil className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                    <button 
                      onClick={() => setDeletingHabit(habit)} 
                      className="p-1.5 rounded-md hover:bg-accent-red/10 transition-colors"
                    >
                      <HiTrash className="w-3.5 h-3.5 text-accent-red" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{habit.name || 'Unnamed'}</p>
              </div>
            )})}
          </div>
          <button 
            onClick={() => setIsAddingHabit(true)}
            className="w-full py-3 rounded-btn border border-dashed border-border text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-xs font-bold"
          >
                  + Add Habit
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingCategory(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-card rounded-card border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Edit Category</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Name</label>
                  <input 
                    type="text" value={editingCategory.name} 
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-input bg-surface border border-border text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={editingCategory.color} 
                      onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0 shadow-lg"
                    />
                    <div className="flex gap-2">
                      {['#05E099', '#FFD166', '#FF3366', '#00C2FF', '#FF007F', '#BB86FC'].map(c => (
                        <button 
                          key={c}
                          onClick={() => setEditingCategory({...editingCategory, color: c})}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${editingCategory.color === c ? 'border-white scale-110 shadow-glow-white' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Icon</label>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto no-scrollbar p-1">
                    {Object.keys(CATEGORY_ICONS).map((iconName) => {
                      const Icon = CATEGORY_ICONS[iconName];
                      return (
                        <button 
                          key={iconName} 
                          onClick={() => setEditingCategory({...editingCategory, icon: iconName})}
                          className={`flex items-center justify-center p-2 rounded-lg border ${editingCategory.icon === iconName ? 'bg-accent-green/20 border-accent-green' : 'bg-surface border-border'}`}
                        >
                          <Icon className={`w-5 h-5 ${editingCategory.icon === iconName ? 'text-accent-green' : 'text-text-muted'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setEditingCategory(null)} 
                    className="flex-1 py-2.5 rounded-btn bg-surface text-text-primary text-sm font-medium"
                  >Cancel</button>
                  <button 
                    onClick={() => {
                      setSafetyAction({ 
                        mode: 'edit', 
                        category: financeStore.categories.find(c => c.id === editingCategory.id), 
                        newData: editingCategory 
                      });
                      setEditingCategory(null);
                    }} 
                    className="flex-1 py-2.5 rounded-btn bg-accent-green text-primary text-sm font-bold"
                  >Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Habit Modal */}
      <AnimatePresence>
        {editingHabit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingHabit(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-card rounded-card border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Edit Habit</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Name</label>
                  <input 
                    type="text" value={editingHabit.name} 
                    onChange={(e) => setEditingHabit({...editingHabit, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-input bg-surface border border-border text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={editingHabit.color} 
                      onChange={(e) => setEditingHabit({...editingHabit, color: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0 shadow-lg"
                    />
                    <div className="flex gap-2">
                      {['#05E099', '#FFD166', '#FF3366', '#00C2FF', '#FF007F', '#BB86FC'].map(c => (
                        <button 
                          key={c}
                          onClick={() => setEditingHabit({...editingHabit, color: c})}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${editingHabit.color === c ? 'border-white scale-110 shadow-glow-white' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Icon</label>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto no-scrollbar p-1">
                    {['HiLightningBolt', 'HiHeart', 'HiAcademicCap', 'HiClock', 'HiClipboardCheck', 'HiFire', 'HiStar', 'IoFastFood', 'MdHealthAndSafety', 'HiFilm', 'HiUsers', 'HiNotebook'].map((iconName) => {
                      const Icon = Icons[iconName];
                      return (
                        <button 
                          key={iconName} 
                          onClick={() => setEditingHabit({...editingHabit, icon: iconName})}
                          className={`flex items-center justify-center p-2 rounded-lg border ${editingHabit.icon === iconName ? 'bg-accent-green/20 border-accent-green' : 'bg-surface border-border'}`}
                        >
                          <Icon className={`w-5 h-5 ${editingHabit.icon === iconName ? 'text-accent-green' : 'text-text-muted'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setEditingHabit(null)} 
                    className="flex-1 py-2.5 rounded-btn bg-surface text-text-primary text-sm font-medium"
                  >Cancel</button>
                  <button 
                    onClick={() => {
                      productivityStore.editHabit(editingHabit.id, editingHabit);
                      setEditingHabit(null);
                    }} 
                    className="flex-1 py-2.5 rounded-btn bg-accent-green text-primary text-sm font-bold"
                  >Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Delete Habit Modal */}
      <AnimatePresence>
        {deletingHabit && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeletingHabit(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-card rounded-card border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-bold text-text-primary mb-2">Delete Habit?</h2>
              <p className="text-sm text-text-muted mb-6">Are you sure you want to delete "{deletingHabit.name}"? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingHabit(null)} 
                  className="flex-1 py-2.5 rounded-btn bg-surface text-text-primary text-sm font-bold hover:bg-white/5 transition-colors"
                >Cancel</button>
                <button 
                  onClick={() => {
                    productivityStore.deleteHabit(deletingHabit.id);
                    setDeletingHabit(null);
                  }} 
                  className="flex-1 py-2.5 rounded-btn bg-accent-red text-white text-sm font-bold hover:bg-accent-red/90 transition-colors shadow-glow-red"
                >Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingHabit && (
          <AddHabitModal onClose={() => setIsAddingHabit(false)} />
        )}
      </AnimatePresence>

      {/* Unified Safety Modal (for both Edit and Delete) */}
      <AnimatePresence>
        {safetyAction?.mode === 'edit' && (
          <EditCategorySafetyModal
            originalCategory={safetyAction.category}
            newCategoryData={safetyAction.newData}
            onClose={() => setSafetyAction(null)}
            onConfirm={() => setSafetyAction(null)}
          />
        )}
        {(safetyAction?.mode === 'delete' || deletingCategory) && (
          <CategorySafetyModal 
            mode="delete"
            category={safetyAction ? safetyAction.category : deletingCategory}
            onClose={() => {
              setSafetyAction(null);
              setDeletingCategory(null);
            }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
