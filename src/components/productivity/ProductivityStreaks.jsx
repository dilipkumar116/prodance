import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import useProductivityStore, { getCurrentStreak, getLongestStreak, getLocalDateString, getTotalCompletions, getYearlyHeatmapData, getMonthlyHeatmapData } from '../../stores/useProductivityStore';
import * as Icons from '../../utils/icons';

// Simple shimmer effect
const shimmerAnimation = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "linear"
  }
};

export default function ProductivityStreaks({ inline = false }) {
  const habits = useProductivityStore(s => s.habits) || [];

  const bestCurrentStreak = useMemo(() => {
    if (!habits || habits.length === 0) return 0;
    return Math.max(...(habits || []).map(h => getCurrentStreak(h)));
  }, [habits]);

  const totalCompletions = useMemo(() => getTotalCompletions(habits), [habits]);

  const [heatmapView, setHeatmapView] = useState('yearly');
  const yearlyScrollRef = useRef(null);

  const yearlyData = useMemo(() => getYearlyHeatmapData(habits), [habits]);
  const monthlyData = useMemo(() => getMonthlyHeatmapData(habits), [habits]);

  const yearlyWeeks = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [];
    const weeks = [];
    let currentWeek = [];
    const firstDay = yearlyData[0].dayOfWeek;
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    yearlyData.forEach(d => {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  }, [yearlyData]);

  useEffect(() => {
    if (heatmapView === 'yearly' && yearlyScrollRef.current) {
      // Small timeout to ensure rendering is complete
      setTimeout(() => {
        if (yearlyScrollRef.current) {
          yearlyScrollRef.current.scrollLeft = yearlyScrollRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [heatmapView, yearlyWeeks]);

  const badges = [
    { id: 'first', title: 'First Step', desc: 'Complete 1 habit', icon: 'HiLightningBolt', unlocked: totalCompletions >= 1, color: '#00C2FF' },
    { id: 'fire3', title: 'On Fire', desc: '3-day streak', icon: 'HiFire', unlocked: bestCurrentStreak >= 3, color: '#FFD166' },
    { id: 'consistent7', title: 'Consistent', desc: '7-day streak', icon: 'HiStar', unlocked: bestCurrentStreak >= 7, color: '#4ADE80' },
    { id: 'diamond30', title: 'Diamond', desc: '30-day streak', icon: 'HiShieldCheck', unlocked: bestCurrentStreak >= 30, color: '#BB86FC' },
    { id: 'champion', title: 'Champion', desc: '100 total completions', icon: 'HiUsers', unlocked: totalCompletions >= 100, color: '#FF007F' },
  ];

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { y: '100%' }}
      animate={inline ? { opacity: 1 } : { y: 0 }}
      exit={inline ? { opacity: 1 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      <div className={`flex-1 ${!inline ? 'overflow-y-auto p-5 no-scrollbar pb-24' : ''} space-y-6 mt-4`}>
        
        {/* Overall Streak Hero */}
        <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-b from-surface to-card border border-border rounded-[32px] text-center relative overflow-hidden shadow-sm">
          {/* Animated Particles */}
          <motion.div 
            animate={{ y: [-10, -30, -10], opacity: [0, 1, 0] }} 
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} 
            className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-accent-orange/50" 
          />
          <motion.div 
            animate={{ y: [-10, -40, -10], opacity: [0, 0.8, 0] }} 
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} 
            className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-accent-yellow/40" 
          />
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0, 0.5, 0] }} 
            transition={{ duration: 3, repeat: Infinity, delay: 0 }} 
            className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-accent-red/50" 
          />

          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-orange/10 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none" />
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-tr from-accent-orange/20 to-accent-yellow/20 rounded-full flex items-center justify-center mb-6 border border-accent-orange/30 shadow-[0_0_40px_rgba(251,146,60,0.2)]"
          >
            <span className="text-5xl drop-shadow-lg">🔥</span>
          </motion.div>
          
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-orange via-accent-red to-accent-pink tracking-tighter mb-2">
            {bestCurrentStreak}
          </h2>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Days Longest Streak</p>
        </div>

        {/* Heatmap with Legend */}
        <div className="bg-card border border-border p-5 rounded-[24px] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Activity Heatmap</h3>
            <div className="flex bg-surface rounded-full p-1 border border-border">
              <button 
                onClick={() => setHeatmapView('yearly')}
                className={`text-[9px] font-bold px-3 py-1 rounded-full transition-colors ${heatmapView === 'yearly' ? 'bg-accent-green text-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                Yearly
              </button>
              <button 
                onClick={() => setHeatmapView('monthly')}
                className={`text-[9px] font-bold px-3 py-1 rounded-full transition-colors ${heatmapView === 'monthly' ? 'bg-accent-green text-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {heatmapView === 'yearly' ? (
              <div 
                ref={yearlyScrollRef}
                className="overflow-x-auto no-scrollbar pb-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="flex gap-1 pt-4" style={{ width: 'max-content' }}>
                  {yearlyWeeks.map((week, wIdx) => {
                    const firstOfMonth = week.find(d => d && d.monthLabel);
                    return (
                      <div key={wIdx} className="flex flex-col gap-1 relative">
                        {firstOfMonth && (
                          <span className="absolute -top-4 left-0 text-[8px] font-bold text-text-muted">
                            {firstOfMonth.monthLabel}
                          </span>
                        )}
                        <div className="flex flex-col gap-1">
                          {week.map((d, dIdx) => {
                            if (!d) return <div key={dIdx} className="w-2.5 h-2.5 rounded-[2px]" />;
                            return (
                              <div 
                                key={dIdx} 
                                className={`w-2.5 h-2.5 rounded-[2px] transition-colors ${
                                  d.intensity === 3 ? 'bg-accent-green' :
                                  d.intensity === 2 ? 'bg-[#3CB371]' :
                                  d.intensity === 1 ? 'bg-[#2E8B57]' :
                                  'bg-surface border border-white/5'
                                }`}
                                title={`${d.count} habits on ${d.dateStr}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`header-${i}`} className="text-center text-[10px] font-bold text-text-muted mb-1">{d}</div>
                ))}
                {monthlyData.map((d, i) => {
                  if (d.isEmpty) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  return (
                    <div 
                      key={d.id} 
                      className={`aspect-square rounded-[8px] flex items-center justify-center transition-colors relative overflow-hidden group ${
                        d.intensity === 3 ? 'bg-accent-green text-primary shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]' :
                        d.intensity === 2 ? 'bg-[#3CB371] text-primary/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]' :
                        d.intensity === 1 ? 'bg-[#2E8B57] text-white/60' :
                        'bg-surface border border-white/5 text-text-muted'
                      } ${d.isToday ? 'ring-2 ring-accent-blue ring-offset-2 ring-offset-card' : ''}`}
                      title={`${d.count} habits on ${d.dateStr}`}
                    >
                      <span className={`text-[9px] font-bold ${d.intensity > 0 ? 'opacity-100' : 'opacity-30'}`}>{d.dayNum}</span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Legend */}
            <div className="flex justify-end items-center gap-1.5 mt-2">
              <span className="text-[9px] text-text-muted mr-1">Less</span>
              <div className="w-3 h-3 rounded-[4px] bg-surface border border-white/5" />
              <div className="w-3 h-3 rounded-[4px] bg-[#2E8B57]" />
              <div className="w-3 h-3 rounded-[4px] bg-[#3CB371]" />
              <div className="w-3 h-3 rounded-[4px] bg-accent-green" />
              <span className="text-[9px] text-text-muted ml-1">More</span>
            </div>
          </div>
        </div>

        {/* Per-Habit Streaks */}
        <div>
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 pl-2">Habit Streaks</h3>
          <div className="space-y-3">
            {(habits || []).map(habit => {
              const current = getCurrentStreak(habit);
              const longest = getLongestStreak(habit);
              const Icon = Icons[habit.icon] || Icons.HiLightningBolt;
              
              const last7Days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dStr = getLocalDateString(d);
                return { done: habit.completions && habit.completions.includes(dStr), initial: ['S','M','T','W','T','F','S'][d.getDay()] };
              });

              return (
                <div key={habit.id} className="bg-surface border border-border p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${habit.color}15`, color: habit.color }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {/* Mini target ring on icon */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-10" />
                      {current > 0 && (
                        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="138" strokeDashoffset={138 - Math.min(138, (current/longest || 1)*138)} />
                      )}
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text-primary truncate mb-1">{habit.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="text-accent-orange">🔥 {current} Now</span>
                      <span className="text-text-muted">🏆 {longest} Best</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 bg-card p-1.5 rounded-full border border-border">
                    {last7Days.map((day, i) => (
                      <div key={i} className={`w-4 h-6 rounded-full flex flex-col items-center justify-center transition-colors ${day.done ? 'bg-accent-green/20' : 'bg-transparent'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mb-0.5 ${day.done ? 'bg-accent-green shadow-glow-green' : 'bg-surface border border-white/10'}`} />
                        <span className={`text-[6px] font-bold ${day.done ? 'text-accent-green' : 'text-text-muted'}`}>{day.initial}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {habits.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-4 bg-surface/30 rounded-xl border border-dashed border-border">No habits yet.</p>
            )}
          </div>
        </div>

        {/* Achievement Badges */}
        <div>
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 pl-2">Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map(badge => {
              const BadgeIcon = Icons[badge.icon] || Icons.HiStar;
              return (
                <div key={badge.id} className={`p-4 rounded-[20px] border relative overflow-hidden flex flex-col items-center text-center transition-all ${
                  badge.unlocked ? 'bg-gradient-to-b from-card to-surface border-border shadow-md' : 'bg-surface/30 border-white/5 opacity-60'
                }`}>
                  {/* Shimmer effect for unlocked */}
                  {badge.unlocked && (
                    <motion.div 
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: `linear-gradient(120deg, transparent 0%, transparent 40%, ${badge.color} 50%, transparent 60%, transparent 100%)`, backgroundSize: '200% 100%' }}
                      variants={shimmerAnimation}
                      animate="animate"
                    />
                  )}
                  
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner relative z-10" style={{ backgroundColor: badge.unlocked ? `${badge.color}20` : '#1A1A1A', color: badge.unlocked ? badge.color : '#444' }}>
                      <BadgeIcon className="w-7 h-7" />
                    </div>
                    {/* Glow behind unlocked badge */}
                    {badge.unlocked && (
                      <div className="absolute inset-0 blur-xl opacity-40 z-0 rounded-full" style={{ backgroundColor: badge.color }} />
                    )}
                    {/* Lock overlay for locked */}
                    {!badge.unlocked && (
                      <div className="absolute -bottom-1 -right-1 bg-surface border border-border w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-sm">
                        <span className="text-[10px]">🔒</span>
                      </div>
                    )}
                  </div>
                  
                  <h4 className={`text-xs font-bold mb-1 ${badge.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>{badge.title}</h4>
                  <p className="text-[9px] text-text-secondary">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
