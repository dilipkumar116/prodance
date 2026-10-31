import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp } from '../../utils/icons';
import useProductivityStore, { getWeeklyHabitProductivity, getHabitLeaderboard, getLocalDateString } from '../../stores/useProductivityStore';

export default function ProductivityInsights({ inline = false }) {
  const habits = useProductivityStore(s => s.habits) || [];
  
  const weeklyData = useMemo(() => getWeeklyHabitProductivity(habits).reverse(), [habits]);
  const leaderboard = useMemo(() => getHabitLeaderboard(habits), [habits]);
  
  // Calculate this month's score based on habits
  const monthScore = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalRate = 0;
    let daysPassed = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const currentD = new Date(year, month, i);
      if (currentD > d) break;

      const dStr = getLocalDateString(currentD);
      if (!habits || habits.length === 0) continue;

      const completedCount = habits.filter(h => h.completions && h.completions.includes(dStr)).length;
      totalRate += (completedCount / habits.length) * 100;
      daysPassed++;
    }
    
    if (daysPassed === 0) return 0;
    return Math.round(totalRate / daysPassed);
  }, [habits]);

  // Weekly score
  const weekScore = useMemo(() => {
    if (weeklyData.length === 0) return 0;
    const avg = weeklyData.reduce((acc, curr) => acc + curr.rate, 0) / weeklyData.length;
    return Math.round(avg);
  }, [weeklyData]);

  const getScoreMessage = (score) => {
    if (score >= 90) return "🔥 Unstoppable!";
    if (score >= 70) return "💪 Great momentum!";
    if (score >= 50) return "📈 Room to grow";
    if (score > 0) return "🌱 Every step counts";
    return "🚀 Time to start!";
  };

  const ringColorMonthly = monthScore >= 70 ? '#4ADE80' : monthScore >= 40 ? '#FACC15' : '#F87171';
  const ringColorWeekly = weekScore >= 70 ? '#60A5FA' : weekScore >= 40 ? '#A78BFA' : '#F472B6';

  // Build SVG Sparkline path
  const sparklinePath = useMemo(() => {
    if (weeklyData.length === 0) return '';
    const points = weeklyData.map((d, i) => {
      const x = (i / (weeklyData.length - 1)) * 100;
      const y = 100 - d.rate;
      return `${x},${y}`;
    });
    return `M0,100 L${points.join(' L')} L100,100 Z`;
  }, [weeklyData]);

  const sparklineStroke = useMemo(() => {
    if (weeklyData.length === 0) return '';
    const points = weeklyData.map((d, i) => {
      const x = (i / (weeklyData.length - 1)) * 100;
      const y = 100 - d.rate;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [weeklyData]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { y: '100%' }}
      animate={inline ? { opacity: 1 } : { y: 0 }}
      exit={inline ? { opacity: 1 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      <div className={`flex-1 ${!inline ? 'overflow-y-auto p-5 no-scrollbar pb-24' : ''} space-y-6 mt-4`}>
        
        {/* Dual Ring Circular Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent-green/5 blur-3xl rounded-full -ml-16 -mt-16 pointer-events-none" />
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6">Activity Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              {/* Monthly Background ring */}
              <circle cx="96" cy="96" r="80" className="stroke-surface/50" strokeWidth="12" fill="none" />
              {/* Monthly Progress */}
              <motion.circle 
                cx="96" cy="96" r="80" 
                stroke={ringColorMonthly} strokeWidth="12" fill="none" strokeLinecap="round"
                strokeDasharray="502.6" 
                initial={{ strokeDashoffset: 502.6 }}
                animate={{ strokeDashoffset: 502.6 - (502.6 * monthScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Weekly Background ring */}
              <circle cx="96" cy="96" r="60" className="stroke-surface/50" strokeWidth="12" fill="none" />
              {/* Weekly Progress */}
              <motion.circle 
                cx="96" cy="96" r="60" 
                stroke={ringColorWeekly} strokeWidth="12" fill="none" strokeLinecap="round"
                strokeDasharray="377.0" 
                initial={{ strokeDashoffset: 377.0 }}
                animate={{ strokeDashoffset: 377.0 - (377.0 * weekScore) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-4xl font-black text-text-primary">{monthScore}<span className="text-xl text-text-muted">%</span></span>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1">This Month</p>
            </div>
          </div>
          
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ringColorMonthly }} />
              <span className="text-xs font-bold text-text-secondary">Month ({monthScore}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ringColorWeekly }} />
              <span className="text-xs font-bold text-text-secondary">Week ({weekScore}%)</span>
            </div>
          </div>
          
          <p className="mt-4 text-sm font-bold bg-surface px-4 py-1.5 rounded-full border border-border" style={{ color: ringColorMonthly }}>
            {getScoreMessage(monthScore)}
          </p>
        </div>

        {/* Weekly Trend Custom Sparkline */}
        <div className="bg-gradient-to-b from-surface to-card border border-border p-5 rounded-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Weekly Sparkline</h3>
            <HiTrendingUp className="w-4 h-4 text-accent-green" />
          </div>
          
          <div className="h-[120px] relative w-full mt-2">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <motion.path 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                d={sparklinePath} fill="url(#sparkGradient)" 
              />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={sparklineStroke} fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" 
              />
              {/* Dot for today */}
              {weeklyData.length > 0 && (
                <motion.circle 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  cx="100" cy={100 - weeklyData[weeklyData.length - 1].rate} r="3" fill="#4ADE80" className="shadow-glow-green" 
                />
              )}
            </svg>
            <div className="absolute inset-0 flex justify-between items-end pb-0 px-0 translate-y-6">
              {(weeklyData || []).map((d, i) => (
                <span key={i} className="text-[8px] font-bold text-text-muted uppercase">{d.label[0]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Podium Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-card border border-border p-5 rounded-card">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 text-center">Top Habits</h3>
            
            <div className="flex items-end justify-center gap-3 mb-8 pt-4">
              {/* #2 Silver */}
              {leaderboard[1] && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center flex-1">
                  <div className="text-xl mb-1">🥈</div>
                  <div className="w-full bg-gradient-to-t from-surface to-[#C0C0C0]20 border border-[#C0C0C0]40 h-16 rounded-t-lg flex flex-col items-center justify-end pb-2 text-center">
                    <span className="text-[10px] font-bold text-text-primary truncate w-full px-1">{leaderboard[1].name}</span>
                    <span className="text-xs font-black text-[#C0C0C0]">{leaderboard[1].totalCompletions}</span>
                  </div>
                </motion.div>
              )}
              
              {/* #1 Gold */}
              {leaderboard[0] && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center flex-1 z-10">
                  <div className="text-3xl mb-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">👑</div>
                  <div className="w-full bg-gradient-to-t from-surface to-accent-yellow/20 border border-accent-yellow/40 h-24 rounded-t-lg shadow-[0_-5px_15px_rgba(250,204,21,0.1)] flex flex-col items-center justify-end pb-3 text-center">
                    <span className="text-xs font-bold text-text-primary truncate w-full px-1">{leaderboard[0].name}</span>
                    <span className="text-sm font-black text-accent-yellow">{leaderboard[0].totalCompletions}</span>
                  </div>
                </motion.div>
              )}

              {/* #3 Bronze */}
              {leaderboard[2] && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center flex-1">
                  <div className="text-xl mb-1">🥉</div>
                  <div className="w-full bg-gradient-to-t from-surface to-[#CD7F32]20 border border-[#CD7F32]40 h-12 rounded-t-lg flex flex-col items-center justify-end pb-1 text-center">
                    <span className="text-[10px] font-bold text-text-primary truncate w-full px-1">{leaderboard[2].name}</span>
                    <span className="text-xs font-black text-[#CD7F32]">{leaderboard[2].totalCompletions}</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* List for the rest */}
            {leaderboard.length > 3 && (
              <div className="space-y-3 pt-4 border-t border-border/50">
                {(leaderboard || []).slice(3).map((habit, idx) => (
                  <div key={habit.id} className="flex items-center justify-between bg-surface/50 p-2.5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-text-muted w-4">{idx + 4}.</span>
                      <span className="text-sm font-medium text-text-primary">{habit.name}</span>
                    </div>
                    <span className="text-xs font-bold text-text-secondary">{habit.totalCompletions} done</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </motion.div>
  );
}
