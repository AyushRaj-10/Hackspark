import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import MapView from '../components/MapView';
import RouteCard from '../components/RouteCard';
import CarpoolCard from '../components/CarpoolCard'; 
import ScenicModal from '../components/ScenicModal';
import CrowdModal from '../components/CrowdModal'; 

// Data
import { MOCK_RESULTS } from '../data/mockRoutes'; 
import { MOCK_CARPOOLS } from '../data/mockCarpools'; 

// Icons
import { ArrowLeft, Shield, MapPin, Navigation, Car, Zap, Filter } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const { from, to, safetyMode } = location.state || { from: "Koramangala", to: "Whitefield", safetyMode: false };

  // --- STATE ---
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Modal States
  const [isScenicModalOpen, setIsScenicModalOpen] = useState(false);
  const [scenicImages, setScenicImages] = useState(null);
  const [isCrowdModalOpen, setIsCrowdModalOpen] = useState(false);

  // --- FILTER LOGIC ---
  const filteredRoutes = MOCK_RESULTS.filter(route => {
    if (safetyMode && route.crowdLevel === 'High') return false;
    if (activeFilter === 'fastest' && route.type !== 'fastest') return false;
    if (activeFilter === 'scenic' && !route.isScenic) return false;
    return true;
  }).sort((a, b) => {
    return safetyMode ? b.safetyRating - a.safetyRating : a.price - b.price;
  });

  // --- EFFECTS ---
  useEffect(() => {
    if (activeFilter === 'carpool') {
      if (MOCK_CARPOOLS.length > 0) setSelectedRoute({ coordinates: MOCK_CARPOOLS[0].coordinates, color: '#4F46E5' });
    } else {
      if (filteredRoutes.length > 0) setSelectedRoute(filteredRoutes[0]);
    }
  }, [activeFilter, safetyMode]);

  const handlePreviewScenic = (route) => {
    if (route.scenicImages) {
      setScenicImages(route.scenicImages);
      setIsScenicModalOpen(true);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      {/* 1. BACKGROUND MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapView 
           routeCoordinates={selectedRoute?.coordinates} 
           routeColor={selectedRoute?.color || '#2563EB'} 
           showBuses={activeFilter === 'all' || activeFilter === 'fastest'}
        />
        {/* Map Gradient Overlay for better text readability if needed */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/80 to-transparent pointer-events-none md:hidden"></div>
      </div>

      {/* 2. SIDEBAR PANEL (Floating) */}
      <div className="absolute top-0 left-0 bottom-0 md:top-4 md:left-4 md:bottom-4 w-full md:w-[420px] z-20 flex flex-col gap-4 pointer-events-none">
        
        {/* A. Search Summary Card */}
        <div className="bg-white/95 backdrop-blur-xl md:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 pointer-events-auto rounded-b-[32px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="font-bold text-xl text-slate-800 tracking-tight">Trip Details</h1>
            </div>
            
            {safetyMode && (
              <div className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-100 flex items-center gap-1.5 shadow-sm animate-pulse">
                <Shield size={12} className="fill-current" /> 
                <span>Safety Priority</span>
              </div>
            )}
          </div>

          {/* Journey Timeline */}
          <div className="relative pl-2 py-1">
            {/* Connector Line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200"></div>
            
            {/* From */}
            <div className="flex items-start gap-4 mb-6 relative">
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Start Point</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">{from}</p>
              </div>
            </div>

            {/* To */}
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                <MapPin size={12} className="text-green-600 fill-current" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Destination</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">{to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* B. Filter Tabs */}
        <div className="pointer-events-auto px-1">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
             <FilterButton 
                active={activeFilter === 'all'} 
                onClick={() => setActiveFilter('all')} 
                icon={null} 
                label="All Routes" 
             />
             <FilterButton 
                active={activeFilter === 'fastest'} 
                onClick={() => setActiveFilter('fastest')} 
                icon={<Zap size={14} className={activeFilter === 'fastest' ? 'fill-blue-400 text-blue-100' : 'text-slate-400'} />} 
                label="Fastest" 
                activeColor="bg-slate-900 text-white"
             />
             <FilterButton 
                active={activeFilter === 'scenic'} 
                onClick={() => setActiveFilter('scenic')} 
                icon={<MapPin size={14} />} 
                label="Scenic" 
                activeColor="bg-emerald-500 text-white"
             />
             <FilterButton 
                active={activeFilter === 'carpool'} 
                onClick={() => setActiveFilter('carpool')} 
                icon={<Car size={16} />} 
                label="Carpool" 
                activeColor="bg-indigo-600 text-white"
             />
          </div>
        </div>

        {/* C. Results List */}
        <div className="flex-1 overflow-y-auto px-1 pb-20 md:pb-0 pointer-events-auto no-scrollbar mask-image-b space-y-4">
          
          {activeFilter === 'carpool' ? (
             <div className="space-y-3">
               <div className="flex justify-between items-center px-2">
                 <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                   Community Rides ({MOCK_CARPOOLS.length})
                 </p>
               </div>
               {MOCK_CARPOOLS.map(carpool => (
                 <div key={carpool.id} onClick={() => setSelectedRoute({ coordinates: carpool.coordinates, color: '#4F46E5' })}>
                    <div className={`transition-all duration-300 ${selectedRoute?.coordinates === carpool.coordinates ? 'transform scale-[0.98]' : 'hover:scale-[1.01]'}`}>
                       <CarpoolCard data={carpool} />
                    </div>
                 </div>
               ))}
             </div>
          ) : (
             <div className="space-y-3">
               <div className="flex justify-between items-center px-2">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                   {filteredRoutes.length} Routes Found
                 </p>
                 <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-medium">
                    Sorted by: {safetyMode ? 'Safety Score' : 'Best Match'}
                 </div>
               </div>
               
               {filteredRoutes.map((route) => (
                <div key={route.id} onClick={() => setSelectedRoute(route)}>
                  <div className={`transition-all duration-300 cursor-pointer ${selectedRoute?.id === route.id ? 'ring-2 ring-offset-2 ring-blue-500 rounded-[24px] transform scale-[0.98]' : 'hover:translate-y-[-2px]'}`}>
                    <RouteCard 
                      data={route} 
                      active={selectedRoute?.id === route.id}
                      onPreviewClick={() => handlePreviewScenic(route)}
                      onShowCrowdAnalytics={() => setIsCrowdModalOpen(true)}
                    />
                  </div>
                </div>
              ))}
              
              {filteredRoutes.length === 0 && (
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl text-center border border-dashed border-slate-300 mx-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Filter size={20} />
                  </div>
                  <p className="text-slate-600 font-bold text-sm">No routes match your filters.</p>
                  <button onClick={() => setActiveFilter('all')} className="text-blue-600 text-xs font-bold mt-2 hover:underline">Clear Filters</button>
                </div>
              )}
             </div>
          )}
        </div>
      </div>

      {/* 3. MODALS */}
      <ScenicModal 
        isOpen={isScenicModalOpen} 
        onClose={() => setIsScenicModalOpen(false)} 
        images={scenicImages} 
      />

      <CrowdModal 
        isOpen={isCrowdModalOpen} 
        onClose={() => setIsCrowdModalOpen(false)} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// Helper Component for the Pill Buttons
const FilterButton = ({ active, onClick, icon, label, activeColor = 'bg-slate-900 text-white' }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-sm border transition-all flex items-center gap-2 whitespace-nowrap ${
      active 
        ? `${activeColor} border-transparent shadow-md scale-105` 
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {icon} {label}
  </button>
);

export default Results;