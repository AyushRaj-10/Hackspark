// src/App.jsx (Top-level Router - FINALIZED for City Stride)
import React from 'react';
import { Routes, Route } from 'react-router-dom';


// Import the Page Components 
// NOTE: Paths are assumed to be correct based on project structure (pages/ or components/)
import DashboardHome from './pages/DashboardHome'; 
import CrowdingDashboard from './components/CrowdDashboard'; 
import LiveTrackerMap from './components/LiveTrackerMap';     
import Booking from './pages/Booking';                 
import Feedback from './pages/Feedback';      
import GoogleTranslate from './components/GoogleTranslate';         

// Authentication & Gamification Pages

import Profile from './pages/Profile'; // 🎯 The Gamification Display Page
import GamifyShowcase from './pages/GamifyShowcase';

export default function App() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 mt-14">
        {/* Widget is now rendered correctly outside the router logic */}
        <GoogleTranslate />
      </div>

      <Routes>
        {/* 2. <Routes> component MUST ONLY contain <Route> elements */}
        
        {/* 1. Landing Page / Main Search */}
        <Route path="/" element={<DashboardHome />} /> 
        
        {/* 2. Crowd Estimation Dashboard */}
        <Route path="/crowd-dashboard" element={<CrowdingDashboard />} /> 
        
        {/* 3. Live Geospatial Tracker */}
        <Route path="/live-tracker" element={<LiveTrackerMap />} />
        
        {/* 4. Ticket Booking System */}
        <Route path="/book-ticket" element={<Booking />} />
        
        {/* 5. Feedback Submission System */}
        <Route path="/submit-feedback" element={<Feedback />} />
        
        {/* 🛑 AUTHENTICATION & GAMIFICATION ROUTES 🛑 */}
        {/* 6. Profile Route (Using GamifyShowcase component) */}
        <Route path="/profile" element={<GamifyShowcase />} /> 
        
        {/* Catch-all 404 route */}
        <Route 
          path="*" 
          element={
            <div className="p-8 text-white bg-gray-900 min-h-screen flex items-center justify-center">
              <h1 className="text-4xl font-bold">404 | Page Not Found</h1>
            </div>
          } 
        />
      </Routes>
    </>
  );
}