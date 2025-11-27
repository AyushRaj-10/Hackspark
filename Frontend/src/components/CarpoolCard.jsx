import React from 'react';
import { User, Star, MapPin, ShieldCheck, MessageCircle } from 'lucide-react';

const CarpoolCard = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3 border border-indigo-100 shadow-sm hover:shadow-md cursor-pointer transition-all">
      
      {/* Driver Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
            {data.driverName[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              {data.driverName}
              {data.femaleDriver && <ShieldCheck size={12} className="text-pink-500" />}
            </h3>
            <p className="text-[10px] text-gray-500">{data.role}</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-xl text-gray-900">₹{data.price}</h3>
          <div className="flex items-center justify-end gap-1 text-xs font-bold text-yellow-500">
            <Star size={10} fill="currentColor" /> {data.rating}
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="bg-gray-50 rounded-xl p-2 mb-3">
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
           <span>🚗 {data.carModel}</span>
           <span className="font-bold text-green-600">{data.seats} seats left</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
           <MapPin size={10} /> {data.route}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">
          Request Seat
        </button>
        <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
          <MessageCircle size={16} />
        </button>
      </div>

    </div>
  );
};

export default CarpoolCard;