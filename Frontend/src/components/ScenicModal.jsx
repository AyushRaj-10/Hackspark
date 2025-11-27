import React from 'react';
import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScenicModal = ({ isOpen, onClose, images }) => {
  if (!isOpen || !images) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose} // Close when clicking background
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative"
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking card
        >
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Scenic Highlights</h2>
              <p className="text-gray-500 text-sm">You will pass through these locations</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Featured Image (Large) */}
            <div className="relative h-64 md:h-full rounded-2xl overflow-hidden group">
              <img src={images[0].url} alt={images[0].name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-bold flex items-center gap-2">
                  <MapPin size={16} className="text-green-400" /> {images[0].name}
                </p>
              </div>
            </div>

            {/* Smaller Images */}
            <div className="flex flex-col gap-4">
              {images.slice(1).map((img, idx) => (
                <div key={idx} className="relative h-32 rounded-xl overflow-hidden group">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs font-bold flex items-center gap-1">
                      <MapPin size={12} className="text-green-400" /> {img.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-green-50 p-4 flex items-center justify-between text-green-800 text-sm font-medium">
             <span>🌿 85% more tree cover than standard route</span>
             <button onClick={onClose} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700">
               Select this Route
             </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScenicModal;