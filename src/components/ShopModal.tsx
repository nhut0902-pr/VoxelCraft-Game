import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, User, Coins, ChevronRight, Check } from 'lucide-react';
import { useStore, CharacterType } from '../hooks/useStore';
import { useSounds } from '../hooks/useSounds';

interface ShopItem {
  id: CharacterType;
  name: string;
  price: number;
  color: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'steve', name: 'Steve', price: 0, color: 'bg-blue-500' },
  { id: 'alex', name: 'Alex', price: 0, color: 'bg-orange-500' },
  { id: 'robot', name: 'Robot', price: 50, color: 'bg-slate-500' },
  { id: 'ninja', name: 'Ninja', price: 150, color: 'bg-zinc-900' },
  { id: 'astronaut', name: 'Astronaut', price: 300, color: 'bg-white' },
];

export const ShopModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { 
    coins, 
    addCoins, 
    character, 
    setCharacter, 
    unlockedCharacters, 
    unlockCharacter,
    npcCount,
    setNPCCount
  } = useStore();
  const { playSound } = useSounds();

  if (!isOpen) return null;

  const handlePurchase = (item: ShopItem) => {
    if (unlockedCharacters.includes(item.id)) {
      setCharacter(item.id);
      playSound('click');
      return;
    }

    if (coins >= item.price) {
      addCoins(-item.price);
      unlockCharacter(item.id);
      setCharacter(item.id);
      playSound('place');
    } else {
      alert('Không đủ xu!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-bottom border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl">
              <ShoppingBag className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Cửa hàng & Nhân vật</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nâng cấp trải nghiệm của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 flex items-center gap-2">
              <Coins size={14} className="text-yellow-500" />
              <span className="text-sm font-black text-yellow-500">{coins}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* NPC Controls */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Số lượng nhân vật ảo (NPC)
              </h3>
              <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{npcCount} NPCs</span>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="20" 
                value={npcCount} 
                onChange={(e) => setNPCCount(parseInt(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setNPCCount(Math.max(0, npcCount - 1))}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                >
                  -
                </button>
                <button 
                  onClick={() => setNPCCount(Math.min(20, npcCount + 1))}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          {/* Character Selection */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Chọn nhân vật
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHOP_ITEMS.map((item) => {
                const isUnlocked = unlockedCharacters.includes(item.id);
                const isSelected = character === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePurchase(item)}
                    className={`group relative p-4 rounded-3xl border transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-500/20 border-blue-500/50' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${item.color} shadow-lg flex items-center justify-center text-white font-black`}>
                        {item.name[0]}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.name}</h4>
                        <p className="text-[10px] text-white/40 font-bold uppercase">
                          {isUnlocked ? (isSelected ? 'Đang chọn' : 'Đã sở hữu') : `${item.price} Xu`}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : isUnlocked 
                          ? 'bg-white/10 text-white/40 group-hover:bg-white/20' 
                          : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {isSelected ? <Check size={16} /> : (isUnlocked ? <ChevronRight size={16} /> : <Coins size={14} />)}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Earn Coins Tip */}
          <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <Coins size={16} />
            </div>
            <p className="text-[10px] text-emerald-400/80 font-bold uppercase leading-relaxed">
              Mẹo: Bạn có thể kiếm thêm xu bằng cách xây dựng thế giới! Mỗi khối được đặt sẽ giúp bạn tích lũy tài sản.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/10">
          <button 
            onClick={() => addCoins(50)}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
          >
            <Coins size={18} /> Nhận 50 Xu miễn phí
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
