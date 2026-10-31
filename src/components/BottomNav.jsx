import { motion } from 'framer-motion';
import { HiRupee, HiChartBar, HiCog } from '../utils/icons';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'finance', label: 'Finance', icon: HiRupee },
    { id: 'productivity', label: 'Productivity - Tracker', icon: HiChartBar },
    { id: 'settings', label: 'Settings', icon: HiCog },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1
                         transition-colors duration-150"
            >
              {isActive && (
                <div className="absolute top-0 inset-x-0 flex justify-center">
                  <motion.div
                    layoutId="activeTab"
                    className="w-12 h-[3px] rounded-full bg-accent-green"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                </div>
              )}
              <Icon
                className={`w-6 h-6 transition-colors duration-150 ${
                  isActive ? 'text-accent-green' : 'text-text-muted'
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent-green' : 'text-text-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
