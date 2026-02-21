import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Ground } from './components/Ground';
import { Player } from './components/Player';
import { Cubes } from './components/Cubes';
import { TextureSelector } from './components/TextureSelector';
import { MobileControls } from './components/MobileControls';
import { useStore } from './hooks/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, Save, RotateCcw, X, AlertTriangle, Smartphone } from 'lucide-react';

export default function App() {
  const { saveWorld, resetWorld, playerScale, setPlayerScale } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showBugNotice, setShowBugNotice] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkMobile();
    checkOrientation();
    
    window.addEventListener('resize', () => {
      checkMobile();
      checkOrientation();
    });
    
    return () => window.removeEventListener('resize', () => {
      checkMobile();
      checkOrientation();
    });
  }, []);

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden font-sans">
      <Canvas shadows camera={{ fov: 45 }}>
        <Sky sunPosition={[100, 100, 20]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} castShadow intensity={2} />
        <Player />
        <Cubes />
        <Ground />
      </Canvas>

      {/* Orientation Warning Overlay */}
      <AnimatePresence>
        {isMobile && isPortrait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-10 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-8"
            >
              <Smartphone size={64} className="text-blue-400" />
            </motion.div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Vui lòng xoay ngang thiết bị</h2>
            <p className="text-sm opacity-60 max-w-xs leading-relaxed">
              VoxelCraft được tối ưu hóa cho màn hình ngang. Hãy xoay điện thoại của bạn để có trải nghiệm xây dựng tốt nhất!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crosshair */}
      {!isMobile && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-4 border-2 border-white/50 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
      )}

      {/* Bug Notice Notification */}
      <AnimatePresence>
        {showBugNotice && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-32 right-6 z-[60] max-w-[280px] pointer-events-auto"
          >
            <div className="bg-black/60 backdrop-blur-2xl p-4 rounded-3xl border border-white/20 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
              <button 
                onClick={() => setShowBugNotice(false)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-xl">
                  <AlertTriangle size={18} className="text-yellow-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase tracking-wider text-yellow-500">Thông báo thử nghiệm</span>
                  <p className="text-[10px] leading-relaxed opacity-80">
                    Game đang được team <span className="font-bold text-white">Nhutcoder</span> thử nghiệm nên có thể có bug. Nếu thấy lỗi, xin vui lòng báo cáo qua Fanpage của team hoặc TikTok của mình ạ!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Controls */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 flex items-start gap-3 pointer-events-none z-50"
      >
        <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 text-white shadow-2xl pointer-events-auto flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Voxel</h1>
            <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">1.0.0 (beta)</span>
          </div>
          
          <div className="h-8 w-[1px] bg-white/20" />

          <div className="flex gap-1.5">
            <button 
              onClick={saveWorld}
              className="p-2 bg-white/10 hover:bg-emerald-500/50 text-white rounded-xl transition-all border border-white/10 group"
              title="Save World"
            >
              <Save size={18} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={resetWorld}
              className="p-2 bg-white/10 hover:bg-rose-500/50 text-white rounded-xl transition-all border border-white/10 group"
              title="Reset World"
            >
              <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => setPlayerScale(playerScale === 1 ? 0.05 : 1)}
              className={`p-2 rounded-xl transition-all border border-white/10 group flex items-center gap-2 px-3 ${
                playerScale === 1 ? 'bg-white/10 hover:bg-blue-500/50' : 'bg-blue-500 text-white'
              }`}
            >
              {playerScale === 1 ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              <span className="text-[10px] font-bold uppercase tracking-wider">{playerScale === 1 ? 'Shrink' : 'Grow'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      <TextureSelector />
      {isMobile && <MobileControls />}
    </div>
  );
}
