// src/pages/CrowdingDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigate for future transitions
import BusCard from '../components/BusCard';

// NOTE: Global App styles for the layout should be applied here 
// or in a dedicated layout component/index.css

export default function CrowdingDashboard() {
  // We keep the logic here, separate from App.jsx
  const [busId, setBusId] = useState('DL1PC1234');
  const [routeId, setRouteId] = useState('534');
  const [customBus, setCustomBus] = useState({ busId: '', routeId: '' });
  const [customStop, setCustomStop] = useState('');
  
  // Initialize navigation function
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
    // Example: Navigate to the live tracker map page
    navigate('/live-tracker'); 
  };

  return (
    // Tailwind classes for overall page structure
    <div className="min-h-screen bg-gray-50 antialiased font-sans">
      
      <header className="bg-white shadow-md p-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900">🚌 Crowd Estimation</h1>
          <button 
            onClick={handleNavigateToMap}
            className="p-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to Live Map
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Load Trip Details</h2>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input fields remain the same */}
            <input
              type="text"
              placeholder="Bus ID (e.g., DL1PC1234)"
              value={customBus.busId}
              onChange={(e) => setCustomBus({ ...customBus, busId: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Route ID (e.g., 534)"
              value={customBus.routeId}
              onChange={(e) => setCustomBus({ ...customBus, routeId: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Stop ID (Optional)"
              value={customStop}
              onChange={(e) => setCustomStop(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg flex-grow-0"
            />
            <button 
              onClick={handleAddBus} 
              className="p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150"
            >
              Load Trip
            </button>
          </div>
        </div>

        <BusCard busId={busId} routeId={routeId} stopId={customStop} />

        <div className="bg-gray-100 p-5 rounded-xl text-gray-700 mt-6">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>Crowd Score</strong> uses a weighted average: Historical (50%), Recent Users (30%), Driver (20%).
            </li>
            <li>
              User reports instantly feed into the backend feedback loop.
            </li>
          </ul>
        </div>
      </main>

      <footer className="mt-8 py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        <p>Delhi Bus Crowding Estimation System v1.0</p>
      </footer>
    </div>
  );
}