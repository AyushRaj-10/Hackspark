// App.jsx (Top-level Router)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import the Page Components
import DashboardHome from './pages/DashboardHome'; 
// Assuming these pages contain the logic you built previously:
import CrowdingDashboard from './components/CrowdDashboard'; 
import LiveTrackerMap from './components/LiveTrackerMap';     

export default function App() {
  return (
    <Routes>
      {/* 1. Landing Page / Main Search */}
      <Route path="/" element={<DashboardHome />} /> 
      
      {/* 2. Crowd Estimation Dashboard (Linked via Navbar/Search) */}
      <Route path="/crowd-dashboard" element={<CrowdingDashboard />} /> 
      
      {/* 3. Live Geospatial Tracker (Linked via Navbar) */}
      <Route path="/live-tracker" element={<LiveTrackerMap />} />
      
      {/* Optional: Add a catch-all 404 route */}
      <Route path="*" element={<div className="p-8 text-white bg-gray-900 min-h-screen"><h1>404 | Page Not Found</h1></div>} />

    </Routes>
  );
}