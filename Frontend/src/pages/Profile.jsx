import React from 'react';
import { Leaf, Award, TrendingUp, Zap, Share2, Crown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  // Enhanced stats to match the "Gamification" screenshot design
  const userStats = { 
    name: "Chandan", 
    points: 1250, 
    co2Saved: "15.4 kg", 
    level: "Green Warrior",
    rank: 23
  };

  const badges = [
    { 
      id: 1, 
      name: "Safe Traveler", 
      icon: <Share2 size={18} />, 
      color: "text-rose-500", 
      bg: "bg-rose-50", 
      desc: "Used Safety Mode 10x" 
    },
    { 
      id: 2, 
      name: "Green Hero", 
      icon: <Leaf size={18} />, 
      color: "text-green-600", 
      bg: "bg-green-50", 
      desc: "Saved 10kg CO2" 
    },
    { 
      id: 3, 
      name: "Early Bird", 
      icon: <Zap size={18} />, 
      color: "text-amber-500", 
      bg: "bg-amber-50", 
      desc: "Commuted before 7AM" 
    },
    { 
      id: 4, 
      name: "Carpool Champ", 
      icon: <TrendingUp size={18} />, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      desc: "Shared 5 rides" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 pb-24 relative overflow-hidden">
      
      {/* Background Ambience (Light Mode) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-60"></div>
      <div className="absolute top-40 left-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -z-10 -translate-x-1/3 opacity-50"></div>

      {/* Header */}
      <div className="max-w-md mx-auto p-6 pt-8 flex items-center justify-between z-10 relative">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Impact</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Welcome back, {userStats.name}</p>
        </div>
        <div className="relative group cursor-pointer">
           <div className="w-14 h-14 rounded-full p-1 bg-white border border-slate-100 shadow-sm group-hover:border-blue-200 transition-colors">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya" alt="User" className="w-full h-full rounded-full bg-slate-50" />
           </div>
           <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
              Lvl 12
           </div>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="px-6 mb-8 max-w-md mx-auto">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-[32px] p-6 text-center relative overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] border border-slate-100 group"
        >
          {/* Top colored strip */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-500"></div>

          <div className="flex justify-between items-start mb-6 pt-2">
             <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full mb-3 border border-green-100">
                    <Leaf size={12} className="fill-green-700" />
                    <span className="text-xs font-bold uppercase tracking-wide">{userStats.level}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{userStats.co2Saved}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">CO₂ Emissions Prevented</p>
             </div>
             
             {/* Circular Progress Ring Representation */}
             <div className="relative w-16 h-16 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset="35" className="text-green-500" strokeLinecap="round" />
                 </svg>
                 <Leaf size={20} className="absolute text-green-500 fill-green-500/20" />
             </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
             <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                   <div className="p-1.5 bg-yellow-50 rounded-lg">
                      <Crown size={14} className="text-yellow-500 fill-yellow-500" />
                   </div>
                   <span className="text-lg font-bold text-slate-800">#{userStats.rank}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium pl-9">Global Rank</div>
             </div>
             <div className="w-px h-10 bg-slate-100"></div>
             <div className="flex-1 text-left pl-2">
                <div className="flex items-center gap-2 mb-0.5">
                   <div className="p-1.5 bg-purple-50 rounded-lg">
                      <Award size={14} className="text-purple-500 fill-purple-500" />
                   </div>
                   <span className="text-lg font-bold text-slate-800">{userStats.points}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium pl-9">Total Points</div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Badges Grid */}
      <div className="px-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-slate-800">Earned Badges</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
               View All <ChevronRight size={12} />
            </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge, i) => (
            <motion.div 
              key={badge.id} 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: i * 0.1 }} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col items-start group"
            >
              <div className={`w-10 h-10 ${badge.bg} rounded-xl flex items-center justify-center ${badge.color} mb-3 group-hover:scale-110 transition-transform`}>
                  {badge.icon}
              </div>
              <h4 className="font-bold text-sm text-slate-800 mb-1">{badge.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{badge.desc}</p>
            </motion.div>
          ))}
          
          {/* Next Badge Teaser */}
          <div className="bg-slate-50 border border-dashed border-slate-200 p-5 rounded-2xl flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-10 h-10 bg-slate-200 rounded-full mb-2 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400">Locked</span>
              <span className="text-[10px] text-slate-400 mt-1">1 Ride away</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;