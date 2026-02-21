import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Box, Globe } from 'lucide-react';

export const LoadingScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  
  const loadingTexts = [
    "Đang tạo các khối...",
    "Đang tạo thế giới ảo...",
    "Xin vui lòng đợi trong giây lát...",
    "Chuẩn bị bước vào thế giới Voxel..."
  ];

  useEffect(() => {
    const duration = 7000; // 7 seconds
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinished, 500);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1750);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, [onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Particles Effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 3, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-2 h-2 bg-blue-500 rounded-sm"
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Animated Logo/Icon */}
        <div className="relative">
          <motion.div
            animate={{ 
              rotateY: 360,
              y: [0, -20, 0]
            }}
            transition={{ 
              rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center"
          >
            <Box size={48} className="text-white" />
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full -z-10"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            Voxel<span className="text-blue-500">Craft</span>
          </h1>
          
          <div className="h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-blue-400 font-bold text-sm uppercase tracking-widest"
              >
                {loadingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          <Globe size={12} />
          <span>Team Nhutcoder Project</span>
        </div>
      </div>
    </motion.div>
  );
};
