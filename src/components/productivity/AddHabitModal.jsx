import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiX } from '../../utils/icons';
import * as Icons from '../../utils/icons';
import useProductivityStore from '../../stores/useProductivityStore';

const COLORS = ['#05E099', '#FFD166', '#FF3366', '#00C2FF', '#FF007F', '#BB86FC'];
const ICON_OPTIONS = [
  'HiLightningBolt', 'HiHeart', 'HiAcademicCap', 'HiClock', 'HiClipboardCheck',
  'HiFire', 'HiStar', 'IoFastFood', 'MdHealthAndSafety', 'HiFilm', 'HiUsers', 'HiNotebook'
];

export default function AddHabitModal({ onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const addHabit = useProductivityStore(s => s.addHabit);

  const handleSave = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), color, icon });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm bg-card rounded-[28px] border border-border shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/50">
          <h2 className="text-lg font-bold text-text-primary">New Habit</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-text-secondary">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Name</label>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. Read for 20 mins"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary focus:border-accent-green"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110 shadow-glow-white' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((iconName) => {
                const IconComponent = Icons[iconName] || Icons.HiLightningBolt;
                return (
                  <button 
                    key={iconName} 
                    onClick={() => setIcon(iconName)}
                    className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                      icon === iconName 
                        ? 'bg-surface border-accent-green text-accent-green' 
                        : 'bg-surface/50 border-border text-text-muted hover:border-text-muted'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl bg-accent-green text-primary font-bold shadow-glow-green disabled:opacity-50 mt-2"
          >
            Create Habit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
