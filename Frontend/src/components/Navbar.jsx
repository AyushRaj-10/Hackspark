import React from 'react';
import { Home, Map, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="bg-black/80 backdrop-blur-xl text-white rounded-full p-2 shadow-2xl border border-white/10 flex justify-between items-center px-6">
        <button onClick={() => navigate('/')} className={`p-3 rounded-full transition-all ${isActive('/') ? 'bg-blue-600 scale-110 shadow-glow' : 'text-gray-400'}`}><Home size={24} /></button>
        <button onClick={() => navigate('/results')} className={`p-3 rounded-full transition-all ${isActive('/results') ? 'bg-blue-600 scale-110 shadow-glow' : 'text-gray-400'}`}><Map size={24} /></button>
        <button onClick={() => navigate('/profile')} className={`p-3 rounded-full transition-all ${isActive('/profile') ? 'bg-blue-600 scale-110 shadow-glow' : 'text-gray-400'}`}><User size={24} /></button>
      </div>
    </div>
  );
};

export default Navbar;