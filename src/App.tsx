import { Canvas } from '@react-three/fiber';
import { Ground } from './components/Ground';
import { Player } from './components/Player';
import { Cubes } from './components/Cubes';
import { TextureSelector } from './components/TextureSelector';
import { MobileControls } from './components/MobileControls';
import { useStore } from './hooks/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, Save, RotateCcw, X, AlertTriangle, Smartphone, Box, Map as MapIcon, Eye, ShoppingBag, Coins, Star, Heart, User, Trophy } from 'lucide-react';
import { Settings } from './components/Settings';
import { LoadingScreen } from './components/LoadingScreen';
import { MapSelection } from './components/MapSelection';
import { ShopModal } from './components/ShopModal';
import { Minimap } from './components/Minimap';
import { SurvivalHUD } from './components/SurvivalHUD';
import { DayNightCycle } from './components/DayNightCycle';

export default function App() {
  const { saveWorld, resetWorld, playerScale, setPlayerScale, cubes, cameraMode, setCameraMode, weather, coins } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showBugNotice, setShowBugNotice] = useState(true);
  const [showUpdateNotice, setShowUpdateNotice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showMapSelection, setShowMapSelection] = useState(false);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    // Check if user has seen update notice
    const seen = localStorage.getItem('seen_v2_update');
    if (seen) setShowUpdateNotice(false);
    else setShowUpdateNotice(false); // Default to false, show after loading
  }, []);

  const closeUpdateNotice = () => {
    setShowUpdateNotice(false);
    localStorage.setItem('seen_v2_update', 'true');
  };

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
    const seen = localStorage.getItem('seen_v2_update');
    if (!seen) setShowUpdateNotice(true);
    
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
        {!isLoading && showUpdateNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[1100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 pointer-events-auto"
          >
            <div className="max-w-xl w-full bg-slate-900 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <Star size={14} /> Bản cập nhật 2.0.0
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Chào mừng đến với Thế giới mới!</h2>
                <p className="text-white/40 text-sm font-medium leading-relaxed">
                  Chúng tôi vừa triển khai một loạt tính năng mới để nâng tầm trải nghiệm sinh tồn và sáng tạo của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Heart className="text-red-400" />, title: 'Sinh tồn', desc: 'Máu & Cơn đói.', img: 'https://picsum.photos/seed/survival/400/200' },
                  { icon: <MapIcon className="text-blue-400" />, title: 'Minimap', desc: 'Radar định vị.', img: 'https://picsum.photos/seed/map/400/200' },
                  { icon: <Box className="text-orange-400" />, title: 'TNT', desc: 'Thuốc nổ mạnh.', img: 'https://picsum.photos/seed/tnt/400/200' },
                  { icon: <User className="text-emerald-400" />, title: 'NPC', desc: 'Nhân vật ảo.', img: 'https://picsum.photos/seed/npc/400/200' },
                ].map((f, i) => (
                  <div key={i} className="group relative h-24 rounded-2xl border border-white/10 overflow-hidden">
                    <img src={f.img} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="relative h-full p-4 flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">{f.icon}</div>
                      <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-tighter">{f.title}</h4>
                        <p className="text-[8px] text-white/40 font-bold uppercase">{f.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={closeUpdateNotice}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20"
              >
                Bắt đầu khám phá ngay
              </button>
            </div>
          </motion.div>
        )}
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

      <Minimap />
      <SurvivalHUD />

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
            <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">2.0.0 (survival)</span>
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
