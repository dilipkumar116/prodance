import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiChartBar, HiCalendar, HiFire } from '../../utils/icons';

const ProductivityHome = lazy(() => import('./ProductivityHome'));
const ProductivityCalendar = lazy(() => import('./ProductivityCalendar'));
const ProductivityInsights = lazy(() => import('./ProductivityInsights'));
const ProductivityStreaks = lazy(() => import('./ProductivityStreaks'));

export default function ProductivityScreen({ setActiveTab }) {
  const [activeTab, setLocalActiveTab] = useState('home');

  const tabs = [
    { id: 'home', icon: HiHome, label: 'Home' },
    { id: 'calendar', icon: HiCalendar, label: 'Calendar' },
    { id: 'insights', icon: HiChartBar, label: 'Insights' },
    { id: 'streaks', icon: HiFire, label: 'Streaks' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="h-full flex flex-col"
    >
      {/* Fixed Header with 4 Navigation Icons */}
      <div className="px-5 pt-5 pb-4 bg-primary/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">
            {tabs.find(t => t.id === activeTab)?.label || 'Productivity'}
          </h1>
          
          <div className="flex bg-surface p-1 rounded-xl border border-border shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLocalActiveTab(tab.id)}
                  className={`p-2 rounded-lg transition-all duration-200 relative ${
                    isActive ? 'bg-accent-green text-primary shadow-lg' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div 
                      layoutId="activeProdTabGlow"
                      className="absolute inset-0 bg-accent-green/20 blur-md -z-10 rounded-lg"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <Suspense fallback={<div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                <ProductivityHome onNavigateToSettings={() => setActiveTab('settings')} />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Suspense fallback={<div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                <ProductivityCalendar inline />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Suspense fallback={<div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                <ProductivityInsights inline />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'streaks' && (
            <motion.div
              key="streaks"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Suspense fallback={<div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
                <ProductivityStreaks inline />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
