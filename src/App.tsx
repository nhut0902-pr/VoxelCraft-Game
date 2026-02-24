import { Canvas } from '@react-three/fiber';
import { Ground } from './components/Ground';
import { Player } from './components/Player';
import { Cubes } from './components/Cubes';
import { TextureSelector } from './components/TextureSelector';
import { MobileControls } from './components/MobileControls';
import { useStore } from './hooks/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, Save, RotateCcw, X, AlertTriangle, Smartphone, Box, Map as MapIcon, Eye, ShoppingBag, Coins } from 'lucide-react';
import { Settings } from './components/Settings';
import { LoadingScreen } from './components/LoadingScreen';
import { MapSelection } from './components/MapSelection';
import { ShopModal } from './components/ShopModal';

import { DayNightCycle } from './components/DayNightCycle';

export default function App() {
  const { saveWorld, resetWorld, playerScale, setPlayerScale, cubes, cameraMode, setCameraMode, weather, coins } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showBugNotice, setShowBugNotice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showMapSelection, setShowMapSelection] = useState(false);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLoadingFinished = () => {
    setIsLoading(false);
    if (cubes.length === 0) {
      setShowMapSelection(true);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden font-sans">
      <AnimatePresence>
        {isLoading && <LoadingScreen onFinished={handleLoadingFinished} />}
      </AnimatePresence>

      <AnimatePresence>
        {showMapSelection && (
          <MapSelection onSelect={() => setShowMapSelection(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShop && (
          <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} />
        )}
      </AnimatePresence>

      <Canvas shadows camera={{ fov: 45 }}>
        <DayNightCycle />
        <Player />
        <Cubes />
        <Ground />
      </Canvas>

      {/* Weather UI Indicator */}
      <div className="absolute top-24 left-6 z-50 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            weather === 'clear' ? 'bg-yellow-400' : weather === 'rain' ? 'bg-blue-400' : 'bg-purple-500 animate-pulse'
          }`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
            Thời tiết: {weather === 'clear' ? 'Nắng' : weather === 'rain' ? 'Mưa' : 'Bão'}
          </span>
        </div>
      </div>

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
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-32 right-6 z-[60] max-w-[280px] pointer-events-auto"
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
              onClick={() => {
                saveWorld();
                alert('Đã lưu thế giới thành công!');
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all border border-emerald-400/50 group flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              title="Save World"
            >
              <Save size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Lưu Game</span>
            </button>
            <button 
              onClick={() => setShowMapSelection(true)}
              className="p-2 bg-white/10 hover:bg-blue-500/50 text-white rounded-xl transition-all border border-white/10 group"
              title="Change Map"
            >
              <MapIcon size={18} className="group-hover:scale-110 transition-transform" />
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
            <button 
              onClick={() => setCameraMode(cameraMode === 'first-person' ? 'orbit' : 'first-person')}
              className={`p-2 rounded-xl transition-all border border-white/10 group flex items-center gap-2 px-3 ${
                cameraMode === 'orbit' ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-blue-500/50'
              }`}
              title="Toggle Camera Mode"
            >
              <Eye size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{cameraMode === 'orbit' ? 'Orbit' : 'FPS'}</span>
            </button>
            <button 
              onClick={() => setShowShop(true)}
              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 rounded-xl transition-all border border-yellow-500/30 group flex items-center gap-2 px-3"
              title="Shop"
            >
              <ShoppingBag size={18} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] font-black uppercase opacity-60">Cửa hàng</span>
                <span className="text-[10px] font-black uppercase flex items-center gap-1">
                  <Coins size={10} /> {coins}
                </span>
              </div>
            </button>
            <Settings />
          </div>
        </div>
      </motion.div>

      <TextureSelector />
      {isMobile && <MobileControls />}
    </div>
  );
}
