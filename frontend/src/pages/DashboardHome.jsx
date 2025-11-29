// src/pages/DashboardHome.jsx
import React, { useState } from 'react';
import { MapPin, Navigation, Shield, Zap, User, BarChart2, Map, Link, Ticket, MessageSquare, LogIn } from 'lucide-react'; 
import Spline from '@splinetool/react-spline';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const [safetyMode, setSafetyMode] = useState(false);
  const [fromLocation, setFromLocation] = useState('J.P Nagar, Bengaluru');
  const [toLocation, setToLocation] = useState('Koramangla, Bengaluru');
  
  const navigate = useNavigate();

  // --- Utility Functions (Omitted for brevity) ---
  const handleGoogleMapsLink = () => { /* ... */ };
  const handleLyftLink = () => { /* ... */ };
  
  const handleSmartCommuteSearch = () => {
    if (!fromLocation || !toLocation) {
        alert("Please enter both starting and destination locations.");
        return;
    }
    navigate('/crowd-dashboard', { 
        state: { 
            from: fromLocation, 
            to: toLocation, 
            safety: safetyMode 
        } 
    });
  };

  // 🚨 STATIC PROFILE LINK HANDLER: Always navigates to /profile
  const handleProfileClick = () => {
      // Direct link to the Gamify/Profile page (or Login if needed)
      navigate('/profile'); 
  };


  return (
    <div className="min-h-screen bg-[#1E1E2E] relative overflow-hidden font-sans text-gray-200 selection:bg-blue-800">
      
      {/* 🛑 Language Widget Placeholder */}
      <div className="absolute top-4 right-4 z-50">
        <div id="google_translate_element" className="p-1 bg-gray-900/50 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-xs text-gray-400">Language Widget</p>
        </div>
      </div>

      {/* --- Spline 3D Background --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
        <Spline
          scene="https://prod.spline.design/Yo8nDgEeIenzGfLc/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* --- Navbar (Navigation Updated) --- */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-20 text-gray-100">
        
        {/* Left: Logo/Title - City Stride */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="font-bold text-xl block leading-none">City Stride</span> 
            <span className="text-[10px] font-medium text-gray-400 tracking-wide">POWERED BY AI</span>
          </div>
        </div>
        
        {/* Right: Navigation Buttons */}
        <div className="flex items-center gap-4">

          {/* Ticket Booking Button */}
          <button 
            onClick={() => navigate('/book-ticket')} 
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-600 bg-gray-800/70 hover:bg-gray-700 transition-colors text-yellow-400 text-sm font-medium"
            title="Book Digital Ticket"
          >
            <Ticket className="w-4 h-4" />
            Book Ticket
          </button>
          
          {/* Feedback Button */}
          <button 
            onClick={() => navigate('/submit-feedback')} 
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-600 bg-gray-800/70 hover:bg-gray-700 transition-colors text-cyan-400 text-sm font-medium"
            title="Submit Feedback"
          >
            <MessageSquare className="w-4 h-4" />
            Feedback
          </button>
          
          {/* Crowd Dashboard Button */}
          <button 
            onClick={() => navigate('/crowd-dashboard')}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-600 bg-gray-800/70 hover:bg-gray-700 transition-colors text-gray-100 text-sm font-medium"
            title="Crowd Estimation Dashboard"
          >
            <BarChart2 className="w-4 h-4" />
            Crowd Dashboard
          </button>
          
          {/* Live Map Button */}
          <button 
            onClick={() => navigate('/live-tracker')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium shadow-md"
            title="Real-Time Map Tracker"
          >
            <Map className="w-4 h-4" />
            Live Map
          </button>

          {/* 🚨 USER AVATAR/PROFILE BUTTON (Links directly to Gamify page) */}
          <button 
            onClick={handleProfileClick} 
            className="flex items-center gap-2 rounded-full border border-gray-600 bg-gray-800/70 p-2 pl-4 text-gray-100 transition-colors hover:bg-gray-700"
            title={"View Gamify Profile"}
          >
            <span className="text-sm font-bold hidden sm:block">
                Profile
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-green-600`}>
                <User className="w-4 h-4" />
            </div>
          </button>

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-24 flex flex-col md:flex-row items-center gap-12 relative z-10">
        
        {/* Left Column: Text */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="space-y-4">
            
            {/* Dynamic AI Badge based on Safety Mode */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700/60 backdrop-blur-sm rounded-full border transition-all 
                ${safetyMode ? 'border-rose-500 shadow-rose-500/30' : 'border-blue-500 shadow-blue-500/30'} shadow-sm">
              <Shield className={`w-3.5 h-3.5 ${safetyMode ? 'text-rose-400 fill-rose-400' : 'text-blue-400 fill-blue-400'} transition-colors`} />
              <span className="text-xs font-bold tracking-wide uppercase 
                    ${safetyMode ? 'text-rose-400' : 'text-blue-400'} transition-colors">
                {safetyMode ? 'Safety Protocol Active' : 'AI-Powered Route Intelligence'}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              City Stride offers 
              
              {/* Dynamic Gradient Text */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r 
                  ${safetyMode ? 'from-rose-500 to-red-500' : 'from-blue-500 to-purple-500'} transition-all">
                safer, faster
              </span>
              <br className="hidden md:block" />
              
              {/* Variable Safety Highlight */}
              <span className="text-transparent bg-clip-text 
                  ${safetyMode 
                    ? 'bg-gradient-to-r from-red-400 to-rose-400' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'} transition-all">
                urban transit solutions
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                City Stride is the next generation mobility platform, unifying public transit, live crowd alerts, and secure ticketing. We analyze real-time data to guarantee every journey is optimized for safety and efficiency.
            </p>
            <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
              Real-time tracking, crowd alerts, and instant comparison, ensuring your journey is 
              <span className={safetyMode ? 'text-rose-400 font-bold' : 'text-blue-400 font-bold'}>
                {safetyMode ? ' secure and prioritized' : ' efficient and optimized'}
              </span>.
            </p>
          </div>

        </div>

        {/* Right Column: Search Card - DEEP LINK INTEGRATION HERE */}
        <div className="flex-1 w-full max-w-md md:max-w-lg relative">
          {/* Intense Glow behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-[40px] blur-2xl -z-10"></div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.3)] p-6 md:p-8 border border-gray-800 relative z-20">
            <h3 className="text-lg font-bold text-gray-100 mb-6">Plan your journey</h3>

            <div className="space-y-5">
              {/* Input Fields */}
              <div className="flex flex-col gap-4">
                {/* Input 1: From */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="From location"
                    className="w-full bg-gray-800/50 hover:bg-gray-800 focus:bg-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none border border-gray-600 focus:border-blue-500 transition-all font-medium text-gray-200 placeholder:text-gray-500 shadow-sm"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                  />
                </div>

                {/* Input 2: To */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="To destination"
                    className="w-full bg-gray-800/50 hover:bg-gray-800 focus:bg-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none border border-gray-600 focus:border-green-500 transition-all font-medium text-gray-200 placeholder:text-gray-500 shadow-sm"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Safety Toggle */}
              <button
                onClick={() => setSafetyMode(!safetyMode)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  safetyMode
                    ? 'bg-rose-900/50 border-rose-700 text-rose-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${safetyMode ? 'fill-current' : ''}`} />
                  <span className="text-xs font-bold">Female Safety Priority</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${safetyMode ? 'bg-rose-500' : 'bg-gray-500'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${safetyMode ? 'left-6' : 'left-1'}`}></div>
                </div>
              </button>

              {/* Primary Search Button (Navigates to integrated results) */}
              <button
                onClick={handleSmartCommuteSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="font-semibold">Search SmartCommute</span>
              </button>
              
              {/* Deep Link Buttons (External Booking) */}
              <div className='flex gap-3 pt-2 border-t border-gray-800'>
                  <button 
                    onClick={handleGoogleMapsLink}
                    className="flex-1 bg-green-700/50 text-white font-semibold text-sm py-3 rounded-lg border border-green-700 hover:bg-green-700 transition"
                  >
                    Open in Maps
                  </button>
                  <button 
                    onClick={handleLyftLink}
                    className="flex-1 bg-purple-700/50 text-white font-semibold text-sm py-3 rounded-lg border border-purple-700 hover:bg-purple-700 transition"
                  >
                    Open in Lyft
                  </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;