import { motion } from 'motion/react';
import { Map as MapIcon, ChevronRight, Box, Sun, Trees } from 'lucide-react';
import { useStore, MapType } from '../hooks/useStore';
import { generateWorld } from '../utils/worldGenerator';

export const MapSelection = ({ onSelect }: { onSelect: () => void }) => {
  const { setMapType } = useStore();

  const handleSelect = (type: MapType) => {
    setMapType(type);
    const newCubes = generateWorld(type);
    useStore.setState({ cubes: newCubes });
    onSelect();
  };

  const maps = [
    { 
      id: 'plains' as MapType, 
      name: 'Đồng Bằng', 
      desc: 'Vùng đất xanh mướt với những tán cây thưa thớt.', 
      icon: <Trees className="text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-900/40'
    },
    { 
      id: 'desert' as MapType, 
      name: 'Sa Mạc', 
      desc: 'Cát vàng trải dài và những ốc đảo nhỏ.', 
      icon: <Sun className="text-yellow-400" />,
      color: 'from-yellow-500/20 to-yellow-900/40'
    },
    { 
      id: 'forest' as MapType, 
      name: 'Rừng Rậm', 
      desc: 'Mật độ cây cối dày đặc, lý tưởng để khai thác gỗ.', 
      icon: <Box className="text-blue-400" />,
      color: 'from-blue-500/20 to-blue-900/40'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center p-6 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-4xl w-full space-y-12 my-auto py-12">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest"
          >
            <MapIcon size={14} />
            Khởi tạo thế giới
          </motion.div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Chọn vùng đất của bạn</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Mỗi bản đồ sẽ mang lại những tài nguyên và trải nghiệm xây dựng khác nhau. Hãy chọn một nơi để bắt đầu!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {maps.map((map, i) => (
            <motion.button
              key={map.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSelect(map.id)}
              className={`group relative p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${map.color} hover:border-white/30 transition-all text-left overflow-hidden`}
            >
              <div className="relative z-10 space-y-6">
                <div className="p-4 bg-white/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {map.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{map.name}</h3>
                  <p className="text-white/50 text-xs leading-relaxed mt-2">{map.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Bắt đầu ngay <ChevronRight size={12} />
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
