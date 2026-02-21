import { useStore, MapType } from '../hooks/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, X, Move, Layout, MousePointer2, Map as MapIcon, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { generateWorld } from '../utils/worldGenerator';

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { controlSettings, setControlSettings, mapType, setMapType, resetWorld } = useStore();

  const handleMapChange = (type: MapType) => {
    if (confirm(`Bạn có chắc muốn đổi sang bản đồ ${type}? Thế giới hiện tại sẽ bị xóa!`)) {
      setMapType(type);
      const newCubes = generateWorld(type);
      useStore.setState({ cubes: newCubes });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 group pointer-events-auto"
        title="Settings"
      >
        <SettingsIcon size={18} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <SettingsIcon size={20} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">Cài đặt</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Map Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <MapIcon size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Chọn Bản Đồ</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['plains', 'desert', 'forest'] as MapType[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleMapChange(m)}
                        className={`py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-tighter ${
                          mapType === m 
                            ? 'bg-emerald-500/20 border-emerald-500 text-white' 
                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control Type */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <Layout size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Loại điều khiển</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setControlSettings({ type: 'dpad' })}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        controlSettings.type === 'dpad' 
                          ? 'bg-blue-500/20 border-blue-500 text-white' 
                          : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <Move size={24} />
                      <span className="text-xs font-bold uppercase">D-Pad</span>
                    </button>
                    <button
                      onClick={() => setControlSettings({ type: 'joystick' })}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        controlSettings.type === 'joystick' 
                          ? 'bg-blue-500/20 border-blue-500 text-white' 
                          : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <MousePointer2 size={24} />
                      <span className="text-xs font-bold uppercase">Joystick</span>
                    </button>
                  </div>
                </div>

                {/* Position Adjustment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <Move size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Vị trí điều khiển (Y-Offset)</span>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>Bên trái (D-Pad/Joystick)</span>
                        <span className="text-blue-400">{controlSettings.leftPos.y}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="200" 
                        value={controlSettings.leftPos.y}
                        onChange={(e) => setControlSettings({ leftPos: { ...controlSettings.leftPos, y: parseInt(e.target.value) } })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>Bên phải (Nút Nhảy)</span>
                        <span className="text-blue-400">{controlSettings.rightPos.y}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="200" 
                        value={controlSettings.rightPos.y}
                        onChange={(e) => setControlSettings({ rightPos: { ...controlSettings.rightPos, y: parseInt(e.target.value) } })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa toàn bộ thế giới?')) {
                        resetWorld();
                        setIsOpen(false);
                      }
                    }}
                    className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={14} />
                    Reset Thế giới
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20"
                >
                  Hoàn tất
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
