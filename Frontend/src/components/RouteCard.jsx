import React, { useState } from "react";
import {
  Bus,
  Car,
  Zap,
  Shield,
  Users,
  Leaf,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RouteCard = ({ data, onPreviewClick, onShowCrowdAnalytics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Styling helpers
  const getCrowdStyle = (level) => {
    if (level === "High") return "bg-red-50 text-red-600 border-red-100";
    if (level === "Medium")
      return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-100 cursor-pointer overflow-hidden ${
        data.isScenic ? "ring-1 ring-green-400 border-green-400" : ""
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {/* Large Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
              data.mode === "BUS"
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {data.mode === "BUS" ? <Bus size={28} /> : <Car size={28} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-xl">
                {data.duration}
              </h3>
              {data.isScenic && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Leaf size={10} /> SCENIC
                </span>
              )}
            </div>
            <div className="flex items-center text-gray-500 text-xs font-medium mt-0.5 gap-2">
              <span className="flex items-center gap-1">
                <Clock size={12} /> ETA: {data.arrivalTime}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <h3 className="font-bold text-2xl text-gray-900">₹{data.price}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase">
            Starting From
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-4">
        <div
          className={`px-2 py-1 rounded-md text-xs font-bold border flex items-center gap-1 ${getCrowdStyle(
            data.crowdLevel
          )}`}
        >
          <Users size={12} /> {data.crowdLevel} Crowd
        </div>
        {data.safetyRating > 4.5 && (
          <div className="px-2 py-1 rounded-md text-xs font-bold bg-pink-50 text-pink-600 border border-pink-100 flex items-center gap-1">
            <Shield size={12} /> Safe Verified
          </div>
        )}
        {data.isScenic && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreviewClick(data); // Trigger the parent function
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition-colors flex items-center gap-1 ml-auto z-10"
          >
            📷 View Photos
          </button>
        )}
        <div
          onClick={(e) => {
            e.stopPropagation(); // Stop card from expanding
            if (onShowCrowdAnalytics) onShowCrowdAnalytics(); // Trigger Modal
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform ${getCrowdStyle(
            data.crowdLevel
          )}`}
        >
          <Users size={14} /> {data.crowdLevel} Crowd
          {/* Visual cue that it's clickable */}
          <TrendingUp size={10} className="ml-1 opacity-50" />
        </div>

        {/* ... Safety Badge ... */}
      </div>

      {/* --- EXPANDED DETAILS SECTION --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className={`
        relative overflow-hidden rounded-2xl p-4 mb-3 cursor-pointer transition-all duration-300
        ${
          data.isScenic
            ? "bg-linear-to-br from-white to-emerald-50/80 border border-emerald-200/60 shadow-lg shadow-emerald-900/5"
            : "bg-white/90 border border-white/60 shadow-lg shadow-gray-900/5"
        }
        backdrop-blur-sm
      `}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
              {/* 1. AVAILABLE BUSES LIST (Only if data exists) */}
              {data.availableBuses && data.availableBuses.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Incoming Buses
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {data.availableBuses.map((bus, idx) => (
                      <div
                        key={idx}
                        className="shrink-0 bg-gray-50 border border-gray-100 rounded-lg p-2 min-w-[100px]"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-800">
                            {bus.number}
                          </span>
                          {bus.seats ? (
                            <CheckCircle size={12} className="text-green-500" />
                          ) : (
                            <XCircle size={12} className="text-red-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bus.eta} away
                        </div>
                        <div
                          className={`text-[10px] mt-1 ${
                            bus.crowd === "Low"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {bus.crowd} Crowd
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. PRICE COMPARISON TABLE */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Transport Options
                </p>
                <div className="space-y-2">
                  {data.fareBreakdown &&
                    data.fareBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-1.5 rounded-full shadow-sm text-gray-600">
                            {item.mode === "Bus" ? (
                              <Bus size={14} />
                            ) : item.mode === "Bike" ? (
                              <Zap size={14} />
                            ) : (
                              <Car size={14} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {item.provider}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {item.time} trip
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-gray-900">
                            ₹{item.price}
                          </span>
                          {/* Highlight Best Price */}
                          {item.price ===
                            Math.min(
                              ...data.fareBreakdown.map((i) => i.price)
                            ) && (
                            <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded-sm">
                              BEST
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Booking initiated!");
                }}
                className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all"
              >
                Select This Option
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Indicator */}
      {!isExpanded && (
        <div className="flex justify-center -mb-2 mt-1 opacity-20">
          <ChevronDown size={16} />
        </div>
      )}
    </motion.div>
  );
};

export default RouteCard;
