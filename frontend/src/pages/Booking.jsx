import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Clock, CheckCircle, Ticket, DollarSign, Zap } from 'lucide-react'; // Lucide icons for better UI
import AutocompleteInput from '../components/AutocompleteInput';
// NOTE: Assuming these data files and functions exist in the parent scope
import { delhiLocations, calculateDistance, calculateFare } from '../data/delhiLocations';

const Booking = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto-calculate fare when source and destination change (Logic Preserved)
  useEffect(() => {
    if (source && destination) {
      const sourceLocation = delhiLocations.find(
        (loc) => loc.name.toLowerCase() === source.toLowerCase()
      )
      const destLocation = delhiLocations.find(
        (loc) => loc.name.toLowerCase() === destination.toLowerCase()
      )

      if (sourceLocation && destLocation) {
        const dist = calculateDistance(
          sourceLocation.lat,
          sourceLocation.lng,
          destLocation.lat,
          destLocation.lng
        )
        const calculatedFare = calculateFare(dist);
        setDistance(dist);
        setFare(calculatedFare);
      } else {
        setDistance(null);
        setFare(null);
      }
    } else {
      setDistance(null);
      setFare(null);
    }
  }, [source, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!source || !destination) {
      setError('Please select both source and destination');
      return;
    }

    if (!fare) {
      setError('Please select valid locations to calculate fare');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/booking/book', {
        source: source.trim(),
        destination: destination.trim(),
        fare: fare,
      });

      setResult(response.data);
      setSource('');
      setDestination('');
      setFare(null);
      setDistance(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book ticket. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTION (TAILWIND UI - DARK THEME) ---
  return (
    // Outer container: Same dark background as DashboardHome for consistency
    <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center p-4 sm:p-6 text-gray-200 font-sans">
      
      {/* Visual background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-lg booking-container relative z-10">
        
        {/* Booking Card - Glassmorphic / Dark Contrast */}
        <div className="bg-gray-900/90 backdrop-blur-md booking-card p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-800">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-white page-title flex items-center justify-center gap-3">
              <Ticket className="w-7 h-7 text-yellow-400" />
              Book Digital Ticket
              <Zap className="w-5 h-5 text-blue-500" />
            </h2>
            <p className="text-gray-400 page-subtitle mt-1">
              Real-time fare calculation and cryptographically secure ticket generation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 booking-form">
            
            {/* Source Input */}
            <AutocompleteInput
              id="source"
              label="From Location"
              placeholder="Enter source location (e.g., Rohini)"
              value={source}
              onChange={setSource}
              disabled={loading}
              // Tailwind classes mimicking the dark theme input style
              className="w-full bg-gray-800/80 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              icon={<Navigation className="w-5 h-5 text-gray-500" />}
            />

            {/* Destination Input */}
            <AutocompleteInput
              id="destination"
              label="To Destination"
              placeholder="Enter destination (e.g., Connaught Place)"
              value={destination}
              onChange={setDestination}
              disabled={loading}
              // Tailwind classes mimicking the dark theme input style
              className="w-full bg-gray-800/80 border border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
              icon={<MapPin className="w-5 h-5 text-gray-500" />}
            />

            {/* Fare Calculation Display */}
            {fare !== null && distance !== null && (
              <div className="fare-info bg-gray-800 p-4 rounded-lg border border-blue-600/50 shadow-inner">
                <div className="flex justify-between items-center fare-row">
                  <span className="fare-label text-sm font-medium text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" /> Distance:
                  </span>
                  <span className="fare-value text-base font-semibold text-gray-200">
                    {distance.toFixed(2)} km
                  </span>
                </div>
                <div className="flex justify-between items-center fare-row mt-2 pt-2 border-t border-gray-700">
                  <span className="fare-label text-base font-bold text-blue-400 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Total Fare:
                  </span>
                  <span className="fare-value highlight text-3xl font-extrabold text-yellow-400">
                    ₹{fare}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message bg-red-900/50 text-red-300 p-3 rounded-lg text-sm font-medium border border-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition duration-150 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/50"
              disabled={loading}
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </>
                ) : (
                  'Book Secure Digital Ticket'
                )}
              </span>
            </button>
          </form>

          {/* Success/Result Display */}
          {result && (
            <div className="ticket-result mt-8 pt-6 border-t border-gray-700">
              <div className="success-header flex items-start gap-3 mb-4 bg-green-900/50 p-3 rounded-lg border border-green-700">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <h3 className="text-xl font-semibold text-green-300">Ticket Booked Successfully!</h3>
              </div>
              
              <div className="ticket-details-card bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700">
                
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {/* From */}
                    <div className="ticket-row col-span-2 sm:col-span-1">
                        <span className="ticket-label text-gray-400">From:</span>
                        <span className="ticket-value font-medium block text-white">{result.ticket.source}</span>
                    </div>
                    {/* To */}
                    <div className="ticket-row col-span-2 sm:col-span-1">
                        <span className="ticket-label text-gray-400">To:</span>
                        <span className="ticket-value font-medium block text-white">{result.ticket.destination}</span>
                    </div>
                    {/* Fare */}
                    <div className="ticket-row col-span-1">
                        <span className="ticket-label text-gray-400">Fare:</span>
                        <span className="ticket-value font-medium block text-lg text-yellow-400">₹{result.ticket.fare}</span>
                    </div>
                    {/* Booked At */}
                    <div className="ticket-row col-span-1">
                        <span className="ticket-label text-gray-400">Booked At:</span>
                        <span className="ticket-value font-medium block text-gray-300 text-sm">
                            {new Date(result.ticket.bookedAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                
                {result.ticket.qrCode && (
                  <div className="qr-section pt-4 mt-2 border-t border-gray-700">
                    <p className="qr-label text-base font-semibold mb-3 flex items-center gap-2 text-white">
                      <Ticket className="w-4 h-4 text-yellow-400" />
                      Digital Ticket QR Code:
                    </p>
                    <div className="qr-code-container flex justify-center p-3 bg-white rounded-lg border border-gray-600">
                      <img src={result.ticket.qrCode} alt="QR Code" className="qr-code w-36 h-36 sm:w-48 sm:h-48" />
                    </div>
                    <p className="qr-hash text-xs text-gray-500 font-mono mt-3 break-all">
                      Hash: {result.ticket.ticketHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;