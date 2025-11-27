import React from 'react';
import { X, Users, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CrowdModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Mock Data: Hourly crowd levels (0-100)
  const crowdData = [
    { time: '9 AM', level: 80, color: 'bg-red-500' },
    { time: '10 AM', level: 45, color: 'bg-yellow-500' }, // Current Time (Low)
    { time: '11 AM', level: 30, color: 'bg-green-500' },
    { time: '12 PM', level: 20, color: 'bg-green-500' },
    { time: '1 PM', level: 50, color: 'bg-yellow-500' },
    { time: '2 PM', level: 75, color: 'bg-red-500' },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 10 }} 
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><Users size={16} /></span>
                <h2 className="text-xl font-bold text-gray-800">Crowd Prediction</h2>
              </div>
              <p className="text-gray-500 text-xs">AI forecast based on historical ticket data.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Graph Container */}
          <div className="p-6 pt-8">
            <div className="flex items-end justify-between h-40 gap-3 border-b border-gray-100 pb-2">
              {crowdData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center w-full group relative cursor-pointer">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded absolute bottom-full mb-1 whitespace-nowrap z-10">
                    {data.level}% Full
                  </div>
                  
                  {/* The Bar Animation */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.level}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1, type: "spring" }}
                    className={`w-full rounded-t-md opacity-80 group-hover:opacity-100 transition-all ${data.color}`}
                  ></motion.div>
                </div>
              ))}
            </div>
            
            {/* Time Labels */}
            <div className="flex justify-between mt-2 px-1">
              {crowdData.map((data, idx) => (
                 <span key={idx} className={`text-[10px] font-bold ${idx === 1 ? 'text-black bg-gray-100 px-2 py-0.5 rounded-full' : 'text-gray-400'}`}>
                    {data.time}
                 </span>
              ))}
            </div>
            
            {/* Insight Box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <TrendingUp size={18} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-blue-900">Best time to leave: NOW</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Crowd levels are expected to rise by <span className="font-bold">35%</span> in the next hour due to evening rush.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrowdModal;