// src/components/DeepLinkBooking.jsx
import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeepLinkBooking = () => {
    // Initialize state with default values from your original HTML
    const [pickup, setPickup] = useState("Times Square, New York");
    const [destination, setDestination] = useState("JFK Airport, New York");
    
    // Sample locations for cycling (DBLCLICK logic)
    const samples = [
        { pickup: "Times Square, New York", destination: "JFK Airport, New York" },
        { pickup: "Golden Gate Bridge, San Francisco", destination: "SFO Airport, San Francisco" },
        { pickup: "Wrigley Field, Chicago", destination: "O'Hare Airport, Chicago" }
    ];
    const [sampleIndex, setSampleIndex] = useState(0);

    const handleGoogleMapsLink = () => {
        if (!pickup || !destination) {
            alert('Please enter both pickup and destination locations.');
            return;
        }
        // NOTE: The URL structure below is the standard format for deep linking to Google Maps directions.
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`;
        window.open(url, '_blank');
    };

    const handleLyftLink = () => {
        if (!destination) {
            alert('Please enter at least a destination.');
            return;
        }
        
        let url = `https://lyft.com/ride`;
        if (pickup) {
            // Lyft format with both pickup and destination
            url += `?pickup[address]=${encodeURIComponent(pickup)}&destination[address]=${encodeURIComponent(destination)}`;
        } else {
            // Lyft format with only destination
            url += `?destination[address]=${encodeURIComponent(destination)}`;
        }
        
        window.open(url, '_blank');
    };

    const handleCycleSamples = () => {
        const nextIndex = (sampleIndex + 1) % samples.length;
        setSampleIndex(nextIndex);
        setPickup(samples[nextIndex].pickup);
        setDestination(samples[nextIndex].destination);
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Ride (Deep Link Test)</h2>
            
            <div className="space-y-4">
                {/* Pickup Location */}
                <div>
                    <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">Pickup Location:</label>
                    <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            id="pickup"
                            placeholder="Enter pickup location"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            onDoubleClick={handleCycleSamples} // DBLCLICK logic migrated
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Double-click input to cycle sample locations.</p>
                </div>
                
                {/* Destination */}
                <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination:</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            id="destination"
                            placeholder="Enter destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleGoogleMapsLink}
                    className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition shadow-md"
                >
                    Open Google Maps
                </button>
                <button
                    onClick={handleLyftLink}
                    className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition shadow-md"
                >
                    Open Lyft
                </button>
            </div>
        </div>
    );
};

export default DeepLinkBooking;