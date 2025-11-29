// src/pages/CrowdingDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Zap, BarChart2 } from 'lucide-react'; // Import necessary icons
import BusCard from '../components/BusCard';

export default function CrowdingDashboard() {
  const [busId, setBusId] = useState('DL1PC1234');
  const [routeId, setRouteId] = useState('534');
  const [customBus, setCustomBus] = useState({ busId: '', routeId: '' });
  const [customStop, setCustomStop] = useState('');
  
  const navigate = useNavigate(); 

  const handleAddBus = () => {
    if (customBus.busId && customBus.routeId) {
      setBusId(customBus.busId);
      setRouteId(customBus.routeId);
      setCustomBus({ busId: '', routeId: '' });
      setCustomStop('');
    }
  };

  const handleNavigateToMap = () => {
    navigate('/live-tracker'); 
  };
  
  const formInputClasses = `p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-all flex-grow`;

  return (
    // Outer Container: Dark Background
    <div className="min-h-screen bg-[#1E1E2E] antialiased font-sans text-gray-200">
      
      {/* Header: High Contrast Navbar Style */}
      <header className="bg-gray-900 shadow-xl p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-cyan-400" />
            City Stride | Crowd Analytics
          </h1>
          <button 
            onClick={handleNavigateToMap}
            className="p-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shadow-md"
            title="Go to Real-Time Map"
          >
            <Map className="w-4 h-4" />
            Live Map
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        
        {/* Load Trip Details Card - Dark Glassmorphic Style */}
        <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl shadow-2xl mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Load Trip Details</h2>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input fields using dark styles */}
            <input
              type="text"
              placeholder="Bus ID (e.g., DL1PC1234)"
              value={customBus.busId}
              onChange={(e) => setCustomBus({ ...customBus, busId: e.target.value })}
              className={formInputClasses}
            />
            <input
              type="text"
              placeholder="Route ID (e.g., 534)"
              value={customBus.routeId}
              onChange={(e) => setCustomBus({ ...customBus, routeId: e.target.value })}
              className={formInputClasses}
            />
            <input
              type="text"
              placeholder="Stop ID (Optional)"
              value={customStop}
              onChange={(e) => setCustomStop(e.target.value)}
              className={formInputClasses + ' flex-grow-0'}
            />
            <button 
              onClick={handleAddBus} 
              className="p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
            >
              Load Trip
            </button>
          </div>
        </div>

        {/* BusCard component (This styling should be handled internally by BusCard.jsx) */}
        <BusCard busId={busId} routeId={routeId} stopId={customStop} />

        {/* How It Works Info Box - Accent Contrast */}
        <div className="bg-gray-800 p-5 rounded-xl text-gray-300 mt-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" /> How Our AI Works
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
            <li>
              <strong>Crowd Score</strong> uses a weighted average: Historical (50%), Recent Users (30%), Driver (20%).
            </li>
            <li>
              User reports instantly feed into the backend feedback loop, improving live predictions.
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-gray-500 text-sm border-t border-gray-700">
        <p>City Stride Mobility System v1.0</p>
      </footer>
    </div>
  );
}