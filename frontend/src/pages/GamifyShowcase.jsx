// src/pages/GamifyShowcase.jsx - Static Badge Collection View
import React, { useState } from "react";
// Assuming these are available in your project structure
import { BADGES } from "../data/badges"; 
import { 
  Wind, MapPin, LogOut, Map as MapIcon, X, Lock,
  Award, Zap, Crown, TrendingUp, Leaf, Navigation 
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// --- Mock User Data (Simulates a user being logged in) ---
const mockUser = {
  displayName: "Urban Commuter",
  email: "test@citystride.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=urbancommuter",
  points: 4500,
  level: "Epic Traveler",
  co2Saved: 145.5,
  trips: 42,
  // Mock unlocked badges for demonstration
  badges: ["eco_starter", "navigator", "daily_driver", "carbon_crusher", "urban_legend"]
};

// --- Sub-Component: Badge Card (Requires CSS for shimmer animation) ---
const BadgeCard = ({ badge, isUnlocked, onClick }) => {
  const IconComponent = badge.icon || Lock; 
  
  return (
    <motion.div
      layoutId={`badge-${badge.id}`}
      onClick={() => onClick(badge)}
      className="relative cursor-pointer group"
      whileHover={isUnlocked ? { scale: 1.05, rotateX: 5, rotateY: 5, z: 10 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glow Effect for Unlocked */}
      {isUnlocked && (
        <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${badge.color} opacity-30 blur-lg transition duration-500 group-hover:opacity-70`} />
      )}

      <div className={`
        relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 p-3 text-center shadow-xl backdrop-blur-sm transition-all duration-300
        ${isUnlocked 
          ? `bg-white/90 border-transparent ${badge.shadow}` 
          : "bg-slate-100/50 border-slate-200 grayscale opacity-70"
        }
      `}>
        {isUnlocked && (
          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-current opacity-50" />
        )}
        <div className={`
          mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-inner
          ${isUnlocked ? badge.color : "from-slate-300 to-slate-400"}
        `}>
          {isUnlocked ? <IconComponent size={24} /> : <Lock size={20} />}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
          {badge.name}
        </span>
        
        {isUnlocked && (
           <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer rounded-2xl pointer-events-none" />
        )}
      </div>
    </motion.div>
  );
};

// --- Sub-Component: Badge Details Modal (Placeholder content) ---
const BadgeModal = ({ badge, isUnlocked, onClose }) => {
  if (!badge) return null;
  const IconComponent = badge.icon || Lock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        layoutId={`badge-${badge.id}`}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`
            mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br shadow-2xl ${badge.shadow}
            ${isUnlocked ? badge.color : "from-slate-300 to-slate-400 grayscale"}
          `}>
             <IconComponent size={48} className="text-white" />
          </div>

          <h3 className="text-2xl font-black text-slate-800">{badge.name}</h3>
          <span className={`
            mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest
            ${badge.tier === 'legendary' ? 'bg-amber-100 text-amber-700' : 
              badge.tier === 'epic' ? 'bg-purple-100 text-purple-700' : 
              badge.tier === 'rare' ? 'bg-blue-100 text-blue-700' : 
              'bg-slate-100 text-slate-600'}
          `}>
            {badge.tier} Tier
          </span>

          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
            {badge.description}
          </p>

          <div className="mt-8 w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full w-full ${isUnlocked ? `bg-gradient-to-r ${badge.color}` : 'bg-slate-300'}`} />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-400">
                {isUnlocked ? "UNLOCKED!" : "Criteria: " + badge.threshold_value + " " + badge.threshold_key}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


const GamifyShowcase = () => {
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState(null);

  // We are using a mock user, so no real logout is needed.
  const handleLogout = () => {
    alert("Logged out mock user. Navigating to Login.");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* 2. Header & Avatar Section */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 opacity-30" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        {/* Navigation/Action Buttons */}
        <div className="absolute right-6 top-6 z-10 flex gap-3">
           <button onClick={() => navigate('/')} className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/20 transition border border-white/10">
             <MapPin size={18} />
           </button>
           <button onClick={handleLogout} className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/20 transition border border-white/10">
             <LogOut size={18} />
           </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent" />
        
        {/* Avatar/Name Block */}
        <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-center">
          <div className="relative inline-block">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative z-10"
            >
              <img 
                src={mockUser.avatar} 
                alt="Profile" 
                className="h-28 w-28 rounded-full border-4 border-white bg-white shadow-2xl"
              />
              <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-sm font-black text-white ring-4 ring-white shadow-lg">
                {Math.floor((mockUser.points || 0) / 1000) + 1}
              </div>
            </motion.div>
          </div>
          <div className="mt-2">
             <h1 className="text-2xl font-black text-slate-900">{mockUser.displayName}</h1>
             <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{mockUser.level}</p>
          </div>
        </div>
      </div>

      {/* 3. Stats Section */}
      <div className="mt-20 px-6">
        <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-50" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Wind size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CO₂ Saved</span>
                    </div>
                    <span className="text-xl font-black text-slate-800">{mockUser.co2Saved}</span>
                    <span className="text-xs text-slate-500 font-medium ml-1">kg</span>
                </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-violet-50" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <MapIcon size={16} className="text-violet-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Trips</span>
                    </div>
                    <span className="text-xl font-black text-slate-800">{mockUser.trips}</span>
                </div>
            </motion.div>
        </div>
      </div>

      {/* 4. Badges Section */}
      <div className="mt-8 px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-800">Badge Collection</h3>
            <p className="text-xs font-medium text-slate-400">Collect them all to become an Urban Legend</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {(mockUser.badges || []).length} / {BADGES.length}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-3"> 
          {BADGES.map((badge) => (
            <BadgeCard 
              key={badge.id}
              badge={badge}
              isUnlocked={(mockUser.badges || []).includes(badge.id)}
              onClick={setSelectedBadge}
            />
          ))}
        </div>
      </div>

      {/* 5. Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 transform z-40 w-full px-6 max-w-sm">
         <Link to="/crowd-dashboard" className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/40 transition active:scale-95">
            <div className="rounded-full bg-white/10 p-1 group-hover:bg-white/20">
                <MapIcon size={16} className="text-sky-400" />
            </div>
            Start New Trip
         </Link>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal 
            badge={selectedBadge} 
            isUnlocked={(mockUser.badges || []).includes(selectedBadge.id)} 
            onClose={() => setSelectedBadge(null)} 
          />
        )}
      </AnimatePresence>

      {/* NOTE: You need to include the CSS for the framer motion shimmer effect in your global styles */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default GamifyShowcase;