/**
 * @license By Zahra
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beef, 
  Gamepad2, 
  Bath, 
  Moon, 
  Sun, 
  Heart, 
  Zap, 
  Shield,
  Dna,
  Droplets,
  Sparkles,
  RefreshCcw,
  Mountain
} from 'lucide-react';

// --- Constants ---
const DECAY_RATES = {
  hunger: 0.1,
  happiness: 0.15,
  cleanliness: 0.08,
  energy: 0.12,
};

const STAT_LABELS = {
  hunger: 'Nutrisi',
  happiness: 'Kebahagiaan',
  cleanliness: 'Kebersihan',
  energy: 'Energi',
};

type PetStats = {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  growth: number;
  level: number;
  age: number;
  lastUpdate: number;
};

const INITIAL_STATS: PetStats = {
  hunger: 100,
  happiness: 100,
  cleanliness: 100,
  energy: 100,
  growth: 0,
  level: 1,
  age: 0,
  lastUpdate: Date.now(),
};

export default function App() {
  const [stats, setStats] = useState<PetStats>(() => {
    const saved = localStorage.getItem('rock-pet-stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Catch up on missed time
      const elapsedSeconds = (Date.now() - parsed.lastUpdate) / 1000;
      return {
        ...parsed,
        hunger: Math.max(0, parsed.hunger - elapsedSeconds * DECAY_RATES.hunger),
        happiness: Math.max(0, parsed.happiness - elapsedSeconds * DECAY_RATES.happiness),
        cleanliness: Math.max(0, parsed.cleanliness - elapsedSeconds * DECAY_RATES.cleanliness),
        energy: Math.max(0, parsed.energy - elapsedSeconds * DECAY_RATES.energy * (parsed.isSleeping ? 0 : 1)),
        lastUpdate: Date.now(),
      };
    }
    return INITIAL_STATS;
  });

  const [isSleeping, setIsSleeping] = useState(false);
  const [isHardened, setIsHardened] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [message, setMessage] = useState("Halo! Aku Pria Solo batumu.");
  
  // Persistence
  useEffect(() => {
    localStorage.setItem('rock-pet-stats', JSON.stringify({ ...stats, lastUpdate: Date.now() }));
  }, [stats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const multiplier = isHardened ? 0.3 : 1;
        const energyDecay = isSleeping ? -0.5 : DECAY_RATES.energy;
        return {
          ...prev,
          hunger: Math.max(0, prev.hunger - DECAY_RATES.hunger * multiplier),
          happiness: Math.max(0, prev.happiness - DECAY_RATES.happiness * multiplier),
          cleanliness: Math.max(0, prev.cleanliness - DECAY_RATES.cleanliness * multiplier),
          energy: Math.min(100, Math.max(0, prev.energy - energyDecay)),
          lastUpdate: Date.now(),
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSleeping, isHardened]);

  useEffect(() => {
    if (stats.hunger < 20) setMessage("Aku lapar... Tolong beri aku mineral.");
    else if (stats.cleanliness < 20) setMessage("Badanku kotor... Tolong bersihkan agar mengkilap.");
    else if (stats.happiness < 20) setMessage("Aku bosan... Mari berguling.");
    else if (stats.energy < 20) setMessage("Sudah lelah... Aku ingin tidur dulu.");
  }, [stats.hunger, stats.cleanliness, stats.happiness, stats.energy]);

  const handleAction = (type: keyof typeof STAT_LABELS, amount: number, msg: string) => {
    if (isSleeping && type !== 'energy') {
      setMessage("Ssstt... Aku sedang hibernasi!");
      return;
    }
    if (isRolling) return;
    setActiveAction(type);
    setStats(prev => {
      const nextVal = Math.min(100, prev[type] + amount);
      let newGrowth = prev.growth + 5;
      let newLevel = prev.level;
      
      if (newGrowth >= 100) {
        newGrowth = 0;
        newLevel += 1;
        setMessage("Wah! Aku bertambah besar! (Level Up!)");
      }

      return {
        ...prev,
        [type]: nextVal,
        growth: newGrowth,
        level: newLevel,
      };
    });
    setMessage(msg);
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handleHarden = () => {
    if (isSleeping) return;
    setIsHardened(!isHardened);
    setMessage(isHardened ? "Aku melunak kembali." : "Aku sekarang keras dan tak tergoyahkan!");
  };

  const handleRoll = () => {
    if (isSleeping || isRolling) return;
    setIsRolling(true);
    setMessage("Woooo! Aku meluncur menembus rintangan!");
    setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 20) }));
    setTimeout(() => setIsRolling(false), 2000);
  };

  const toggleSleep = () => {
    if (isRolling) return;
    setIsSleeping(!isSleeping);
    setMessage(!isSleeping ? "Zahra juga butuh istirahat... Zzz..." : "Sudah bangun! Siap melayani dengan sopan.");
    if (!isSleeping) setIsHardened(false);
  };

  const resetGame = () => {
    if (confirm("Reset Zahra? Semua data akan hilang!")) {
      setStats(INITIAL_STATS);
      setIsSleeping(false);
      setIsHardened(false);
      setMessage("Batu Zahra telah tiba.");
    }
  };

  const getRockExpression = () => {
    if (isSleeping) return "😴";
    if (isHardened) return "👿";
    if (isRolling) return "🤪";
    if (stats.hunger < 20 || stats.happiness < 20) return "😢";
    if (stats.energy < 20) return "🥱";
    if (stats.cleanliness < 30) return "🤢";
    if (stats.happiness > 80) return "😊";
    return "😐";
  };

  const isSleepingState: boolean = isSleeping;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 transition-colors duration-1000 ${isSleepingState ? 'bg-slate-950 text-slate-100' : 'bg-orange-50 text-slate-900'} overflow-hidden relative`}>
      
      {/* Background Decor: Solo City Vibes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <Mountain className="absolute -bottom-10 -left-20 w-96 h-96 text-slate-400" />
        <Mountain className="absolute -bottom-20 -right-20 w-80 h-80 text-slate-500" />
      </div>

      {/* HUD: Stats */}
      <div className="w-full max-w-md mt-8 z-10 space-y-4">
        {/* Growth Bar */}
        <div className="bg-white/30 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-sm">
          <div className="flex justify-between items-center mb-1 text-[10px] font-black uppercase tracking-widest opacity-60">
            <span>Level {stats.level}</span>
            <span>Tahap Pertumbuhan ({Math.floor(stats.growth)}%)</span>
          </div>
          <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${stats.growth}%` }}
              className="h-full bg-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>).map((key) => {
            const val = stats[key as keyof PetStats];
            return (
              <StatBar 
                key={key} 
                label={STAT_LABELS[key]} 
                value={typeof val === 'number' ? val : 0} 
                icon={getIcon(key)}
                isDark={isSleepingState}
              />
            );
          })}
        </div>
      </div>

      {/* Area Karakter Utama */}
      <div className="relative flex flex-col items-center justify-center flex-1 w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSleeping ? 'sleeping' : 'awake'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            {/* Si Batu */}
            <motion.div
              animate={{
                y: isSleeping ? [0, -5, 0] : [0, -20, 0],
                x: isRolling ? [-300, 300, -300] : 0,
                rotate: isRolling ? [0, 360, 720] : (isSleeping ? 0 : [0, -2, 2, 0]),
                scale: (isHardened ? 1.1 : 1) * (1 + (stats.level - 1) * 0.1), // Tumbuh 10% setiap level
              }}
              transition={{
                y: { duration: isSleeping ? 3 : 2, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 2, repeat: isRolling ? Infinity : 0, ease: "linear" },
                rotate: { duration: isRolling ? 0.5 : 2, repeat: Infinity, ease: isRolling ? "linear" : "easeInOut" },
                scale: { duration: 0.3 }
              }}
              className={`w-64 h-56 rounded-[40%_60%_70%_30%_/_50%_60%_40%_50%] transition-all duration-1000 shadow-2xl relative flex items-center justify-center text-8xl
                ${isSleeping ? 'bg-slate-700' : isHardened ? 'bg-slate-900 border-indigo-400' : 'bg-slate-400'} 
                ${isHardened ? 'border-4 ring-4 ring-indigo-500/30' : 'border-b-8 border-slate-600/50'}
              `}
            >
              {getRockExpression()}
              
              {/* Efek Partikel */}
              <AnimatePresence>
                {activeAction === 'hunger' && <Effect icon={<Dna className="text-orange-500" />} />}
                {activeAction === 'happiness' && <Effect icon={<Gamepad2 className="text-pink-500" />} />}
                {activeAction === 'cleanliness' && <Effect icon={<Sparkles className="text-cyan-400" />} />}
              </AnimatePresence>
            </motion.div>

            {/* Bayangan */}
            <motion.div 
              animate={{ 
                scale: isSleeping ? [1, 1.05, 1] : [1, 0.8, 1],
                opacity: isRolling ? 0 : 1
              }}
              transition={{ duration: isSleeping ? 3 : 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-6 bg-black/10 rounded-full blur-sm mt-4 mx-auto"
            />
          </motion.div>
        </AnimatePresence>

        {/* Bubble Pesan */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          key={message}
          className={`absolute top-0 px-6 py-3 rounded-2xl shadow-lg border text-sm font-bold text-center max-w-[250px]
            ${isSleeping ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          `}
        >
          {message}
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r border-b 
            ${isSleeping ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          `} />
        </motion.div>
      </div>

      {/* Action Bar */}
      <div className={`w-full max-w-2xl grid grid-cols-3 md:grid-cols-6 gap-4 p-6 rounded-3xl backdrop-blur-md mb-8 z-10
        ${isSleeping ? 'bg-white/5' : 'bg-black/5'}
      `}>
        <ActionButton 
          onClick={() => handleAction('hunger', 20, "Terima kasih, mineralnya sangat enak.")} 
          icon={<Beef size={24} />} 
          label="Makan" 
          color="bg-orange-500"
          isDark={isSleeping}
        />
        <ActionButton 
          onClick={handleRoll} 
          icon={<RefreshCcw size={24} />} 
          label="Guling" 
          color="bg-pink-500"
          isDark={isSleeping}
        />
        <ActionButton 
          onClick={() => handleAction('cleanliness', 25, "Bersih sekali, terima kasih!")} 
          icon={<Bath size={24} />} 
          label="Mandi" 
          color="bg-cyan-500"
          isDark={isSleeping}
        />
         <ActionButton 
          onClick={handleHarden} 
          icon={<Shield size={24} />} 
          label={isHardened ? "Lunak" : "Keras"} 
          color="bg-indigo-600"
          isDark={isSleeping}
        />
        <ActionButton 
          onClick={toggleSleep} 
          icon={isSleeping ? <Sun size={24} /> : <Moon size={24} />} 
          label={isSleeping ? "Bangun" : "Tidur"} 
          color={isSleeping ? "bg-amber-400" : "bg-indigo-600"}
          isDark={isSleeping}
        />
        <ActionButton 
          onClick={() => setMessage("Aku batu dari kota Solo yang penuh tata krama.")} 
          icon={<Mountain size={24} />} 
          label="Solo" 
          color="bg-emerald-600"
          isDark={isSleeping}
        />
      </div>

      {/* Footer Tools */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button 
          onClick={resetGame}
          className="p-2 rounded-full hover:bg-black/10 transition-colors opacity-50 hover:opacity-100"
          title="Reset Game"
        >
          <RefreshCcw size={16} className={isSleepingState ? 'text-white' : 'text-black'} />
        </button>
      </div>
    </div>
  );
}

// --- Specific components ---

interface StatBarProps {
  key?: React.Key;
  label: string;
  value: number;
  icon: React.ReactNode;
  isDark: boolean;
}

function StatBar({ label, value, icon, isDark }: StatBarProps) {
  const color = value > 50 ? 'bg-emerald-500' : value > 20 ? 'bg-amber-500' : 'bg-rose-500';
  
  return (
    <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{icon}</span>
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">{label}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200/30 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} transition-colors duration-500`}
        />
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, color, isDark }: { onClick: () => void, icon: React.ReactNode, label: string, color: string, isDark: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`p-4 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all ${color}`}>
        {icon}
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </span>
    </motion.button>
  );
}

function Effect({ icon }: { icon: React.ReactNode }) {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 0, 
            scale: 1,
            x: (Math.random() - 0.5) * 200, 
            y: (Math.random() - 0.5) * 200 - 50,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1 }}
          className="absolute z-50 text-2xl"
        >
          {icon}
        </motion.div>
      ))}
    </>
  );
}

function getIcon(key: string) {
  switch (key) {
    case 'hunger': return <Dna size={14} />;
    case 'happiness': return <Heart size={14} />;
    case 'cleanliness': return <Droplets size={14} />;
    case 'energy': return <Zap size={14} />;
    default: return null;
  }
}
