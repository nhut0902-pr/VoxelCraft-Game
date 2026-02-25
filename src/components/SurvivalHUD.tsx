import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Utensils, Trophy, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export const SurvivalHUD = () => {
  const { health, hunger, achievements, updateStats } = useStore();
  const [showAchievements, setShowAchievements] = useState(false);

  // Survival logic: hunger decreases over time
  useEffect(() => {
    const interval = setInterval(() => {
      updateStats(0, -1);
      if (hunger <= 0) {
        updateStats(-2, 0);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [hunger, updateStats]);

  const completedCount = achievements.filter(a => a.completed).length;

  return (
    <div className="fixed top-6 left-6 z-40 space-y-4 pointer-events-none">
      {/* Health & Hunger */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-48">
          <div className="bg-red-500/20 p-1.5 rounded-lg">
            <Heart className="text-red-500 fill-red-500" size={16} />
          </div>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${health}%` }}
              className="h-full bg-red-500"
            />
          </div>
          <span className="text-[10px] font-black text-white w-6">{health}</span>
        </div>

        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-48">
          <div className="bg-orange-500/20 p-1.5 rounded-lg">
            <Utensils className="text-orange-500" size={16} />
          </div>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${hunger}%` }}
              className="h-full bg-orange-500"
            />
          </div>
          <span className="text-[10px] font-black text-white w-6">{hunger}</span>
        </div>
      </div>

      {/* Achievement Summary */}
      <div 
        className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-48 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setShowAchievements(!showAchievements)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-1.5 rounded-lg">
            <Trophy className="text-yellow-500" size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Thành tựu</span>
            <span className="text-[10px] font-black text-white uppercase">{completedCount}/{achievements.length}</span>
          </div>
        </div>
        <Star className={`text-yellow-500 transition-transform ${showAchievements ? 'rotate-180' : ''}`} size={14} />
      </div>

      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 w-64 space-y-3 pointer-events-auto"
          >
            {achievements.map(ach => (
              <div key={ach.id} className={`flex items-start gap-3 p-2 rounded-xl border ${ach.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10 opacity-50'}`}>
                <div className={`p-1.5 rounded-lg ${ach.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                  <Trophy size={14} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-tight ${ach.completed ? 'text-emerald-400' : 'text-white/60'}`}>{ach.title}</span>
                  <span className="text-[8px] text-white/40 font-bold leading-tight">{ach.description}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
