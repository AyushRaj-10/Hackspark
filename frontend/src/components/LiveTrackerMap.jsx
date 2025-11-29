// src/pages/LiveTrackerMap.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Keep Leaflet CSS Import

export default function LiveTrackerMap() {
    const navigate = useNavigate();
    
    // Ref to hold the DOM element where the map will be initialized
    const mapContainerRef = useRef(null); 

    const handleNavigateBack = () => {
        navigate('/');
    };

    // --- EFFECT: Initialization and Lifecycle Management ---
    useEffect(() => {
        // --- 1. SETUP: DOM ELEMENT CHECKS ---
        const mapElement = mapContainerRef.current;
        if (!mapElement || typeof window.L === 'undefined') {
            console.error("Critical: Map container or Leaflet is not available.");
            return;
        }

        // --- DOM elements (Fetched inside useEffect scope) ---
        const connectionStatus = document.getElementById('connection-status');
        const vehicleCount = document.getElementById('vehicle-count');
        const lastUpdate = document.getElementById('last-update');
        const toggleButton = document.getElementById('toggle-updates');
        const vehicleList = document.getElementById('vehicle-list');
        const startLocationInput = document.getElementById('start-location');
        const endLocationInput = document.getElementById('end-location');
        const startLocationBtn = document.getElementById('start-location-btn');
        const endLocationBtn = document.getElementById('end-location-btn');
        const searchRouteBtn = document.getElementById('search-route');
        const clearRouteBtn = document.getElementById('clear-route');
        const routeResultsEl = document.getElementById('route-results');
        const routeBusCountEl = document.getElementById('route-bus-count');
        const routeOnTimeCountEl = document.getElementById('route-on-time-count');
        const routeDelayedCountEl = document.getElementById('route-delayed-count');
        const routeBusListEl = document.getElementById('route-bus-list');


        if (!connectionStatus || !vehicleList || !searchRouteBtn) {
            console.error("Critical: Essential Sidebar DOM elements missing.");
            return;
        }
        
        // --- 2. START OF IMPERATIVE JAVASCRIPT LOGIC ---

        // Map initialization
        const delhiCoords = [28.6139, 77.2090]; 
        const map = L.map(mapElement).setView(delhiCoords, 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // State management (Internal)
        let vehicleMarkers = new Map();
        let allVehicles = []; 
        let filteredVehicles = []; 
        let updateInterval = null;
        let isUpdating = true;
        let selectedVehicle = null;
        let routeStart = null;
        let routeEnd = null;
        let routePolyline = null;
        let routeStartMarker = null;
        let routeEndMarker = null;
        let isRouteFilterActive = false;
        let locationClickMode = null; 
        let autocompleteTimeouts = {}; 

        // --- CORE FUNCTIONS (Original Logic) ---

        function formatDelay(seconds) {
            if (seconds < 60) return `${seconds}s`;
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(seconds / 3600);
            if (seconds < 3600) return `${minutes}m delay`;
            return `${hours}h ${Math.floor((seconds % 3600) / 60)}m delay`;
        }

        function formatTime(dateString) {
            const date = new Date(dateString);
            return date.toLocaleTimeString();
        }

        function createBusIcon(delaySeconds, isMoving = true) {
            const delayMinutes = delaySeconds / 60;
            const isDelayed = delayMinutes >= 2;
            const color = isDelayed ? '#f44336' : '#4caf50';
            
            return L.divIcon({
                className: 'bus-marker-container',
                html: `
                    <div class="bus-marker ${isDelayed ? 'delayed' : 'on-time'}" style="background: ${color};">
                    </div>
                    ${isDelayed ? `<div style="
                        position: absolute;
                        top: -25px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #f44336;
                        color: white;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                        white-space: nowrap;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">${formatDelay(delaySeconds)}</div>` : ''}
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });
        }
        
        function createPopupContent(vehicle) {
            const delayMinutes = vehicle.delaySeconds / 60;
            const delayClass = delayMinutes >= 2 ? 'delayed' : 'on-time';
            const delayText = delayMinutes >= 2 
                ? `<span class="${delayClass}">${formatDelay(vehicle.delaySeconds)} delayed</span>`
                : '<span class="on-time">On time</span>';
            
            return `
                <div class="popup-content">
                    <div class="popup-header">Vehicle ${vehicle.id}</div>
                    <div class="popup-info"><strong>Route:</strong> ${vehicle.trip.routeId || 'N/A'}</div>
                    <div class="popup-info"><strong>Trip:</strong> ${vehicle.trip.tripId || 'N/A'}</div>
                    <div class="popup-info"><strong>Status:</strong> ${delayText}</div>
                    ${vehicle.speed ? `<div class="popup-info"><strong>Speed:</strong> ${Math.round(vehicle.speed * 3.6)} km/h</div>` : ''}
                    ${vehicle.bearing ? `<div class="popup-info"><strong>Direction:</strong> ${Math.round(vehicle.bearing)}°</div>` : ''}
                    <div class="popup-info"><strong>Last Update:</strong> ${formatTime(vehicle.timestamp)}</div>
                </div>
            `;
        }
        
        function updateConnectionStatus(status, message) {
            if(connectionStatus) {
                connectionStatus.textContent = message;
                connectionStatus.className = `status-value ${status}`;
            }
        }

        function updateVehicleCount(count) {
            if(vehicleCount) vehicleCount.textContent = count;
        }

        function updateLastUpdateTime(timestamp) {
            if (lastUpdate) {
                if (timestamp) {
                    const date = new Date(timestamp);
                    lastUpdate.textContent = formatTime(timestamp);
                    lastUpdate.title = date.toLocaleString();
                } else {
                    lastUpdate.textContent = '--';
                }
            }
        }
        
        function selectVehicle(vehicle) {
            selectedVehicle = vehicle;
            
            vehicleList.querySelectorAll('.vehicle-card').forEach(card => {
                card.classList.remove('selected');
                if (card.dataset.vehicleId === vehicle.id) {
                    card.classList.add('selected');
                }
            });
            
            const marker = vehicleMarkers.get(vehicle.id);
            if (marker) {
                map.setView([vehicle.lat, vehicle.lng], 14);
                marker.openPopup();
            }
        }
        
        function updateVehicleList(vehicles) { 
            if (!vehicleList) return;
            if (vehicles.length === 0) {
                vehicleList.innerHTML = `
                    <div class="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                        <div class="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                            🚌
                        </div>
                        <p class="text-slate-600 font-medium mb-1">No vehicles found</p>
                        <p class="text-xs text-slate-400">Waiting for active buses...</p>
                    </div>
                `;
                return;
            }
            
            const sortedVehicles = [...vehicles].sort((a, b) => b.delaySeconds - a.delaySeconds);
            
            vehicleList.innerHTML = sortedVehicles.map(vehicle => {
                const delayMinutes = vehicle.delaySeconds / 60;
                const isDelayed = delayMinutes >= 2;
                const delayText = isDelayed 
                    ? formatDelay(vehicle.delaySeconds)
                    : 'On time';
                
                const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id ? 'selected' : '';
                const statusColor = isDelayed ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200';
                const badgeColor = isDelayed ? 'bg-red-500' : 'bg-green-500';
                const selectedClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl' : 'hover:shadow-lg';
                
                return `
                    <div class="vehicle-card bg-gradient-to-br ${statusColor} border-2 rounded-xl p-4 cursor-pointer transition-all transform hover:-translate-y-0.5 ${selectedClass}" data-vehicle-id="${vehicle.id}">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 ${badgeColor} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    ${vehicle.id.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-800 text-sm">Vehicle ${vehicle.id}</h3>
                                    <p class="text-xs text-slate-500">Route ${vehicle.trip.routeId || 'N/A'}</p>
                                </div>
                            </div>
                            <div class="${badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                ${delayText}
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="bg-white/60 rounded-lg px-3 py-2">
                                <p class="text-slate-500 font-medium mb-0.5">Trip ID</p>
                                <p class="text-slate-800 font-semibold truncate">${vehicle.trip.tripId ? vehicle.trip.tripId.substring(0, 8) + '...' : 'N/A'}</p>
                            </div>
                            <div class="bg-white/60 rounded-lg px-3 py-2">
                                <p class="text-slate-500 font-medium mb-0.5">Status</p>
                                <p class="text-slate-800 font-semibold">${vehicle.currentStatus || 'In Transit'}</p>
                            </div>
                            ${vehicle.speed ? `
                            <div class="bg-white/60 rounded-lg px-3 py-2 col-span-2">
                                <p class="text-slate-500 font-medium mb-0.5">Speed</p>
                                <p class="text-slate-800 font-semibold">${Math.round(vehicle.speed * 3.6)} km/h</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            vehicleList.querySelectorAll('.vehicle-card').forEach(card => {
                card.addEventListener('click', () => {
                    const vehicle = allVehicles.find(v => v.id === card.dataset.vehicleId);
                    if (vehicle) {
                        selectVehicle(vehicle);
                    }
                });
            });
        }
        
        function updateMap(vehicles) {
            const currentVehicleIds = new Set(vehicles.map(v => v.id));
            
            for (const [vehicleId, marker] of vehicleMarkers.entries()) {
                if (!currentVehicleIds.has(vehicleId)) {
                    map.removeLayer(marker);
                    vehicleMarkers.delete(vehicleId);
                }
            }
            
            vehicles.forEach(vehicle => {
                const isMoving = vehicle.speed && vehicle.speed > 0;
                
                if (vehicleMarkers.has(vehicle.id)) {
                    const marker = vehicleMarkers.get(vehicle.id);
                    marker.setLatLng([vehicle.lat, vehicle.lng]);
                    
                    const oldDelay = marker.delaySeconds || 0;
                    const delayDiff = Math.abs(vehicle.delaySeconds - oldDelay);
                    if (delayDiff > 60) {
                        const newIcon = createBusIcon(vehicle.delaySeconds, isMoving);
                        marker.setIcon(newIcon);
                    }
                    
                    marker.bindPopup(createPopupContent(vehicle));
                    marker.delaySeconds = vehicle.delaySeconds;
                } else {
                    const icon = createBusIcon(vehicle.delaySeconds, isMoving);
                    const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
                        .bindPopup(createPopupContent(vehicle))
                        .addTo(map);
                    
                    marker.delaySeconds = vehicle.delaySeconds;
                    marker.vehicleData = vehicle;
                    
                    marker.on('click', () => {
                        selectVehicle(vehicle);
                    });
                    
                    vehicleMarkers.set(vehicle.id, marker);
                }
            });
        }
        
        async function fetchVehicles() { 
            try {
                const response = await fetch('http://localhost:8000/api/vehicles'); 
                const data = await response.json();
                
                if (data.success) {
                    updateConnectionStatus('connected', 'Connected');
                    allVehicles = data.vehicles;
                    updateVehicleCount(data.count);
                    updateMap(allVehicles);
                    updateVehicleList(allVehicles);
                    updateLastUpdateTime(data.lastUpdate);
                } else {
                    throw new Error(data.error || 'Failed to fetch vehicles');
                }
            } catch (error) {
                updateConnectionStatus('error', 'Error');
                if (connectionStatus) connectionStatus.textContent = `Error: ${error.message}`;
            }
        }
        
        function startUpdates() {
            if (updateInterval) clearInterval(updateInterval);
            fetchVehicles();
            updateInterval = setInterval(fetchVehicles, 15000);
        }

        function stopUpdates() {
            if (updateInterval) clearInterval(updateInterval);
            updateInterval = null;
        }
        
        function filterVehiclesByRoute(vehicles, start, end) {
            // Calculate if vehicles are near the route line
            const distanceToLineSegment = (point, lineStart, lineEnd) => {
                const x0 = point.lat;
                const y0 = point.lng;
                const x1 = lineStart.lat;
                const y1 = lineStart.lng;
                const x2 = lineEnd.lat;
                const y2 = lineEnd.lng;
                
                const A = x0 - x1;
                const B = y0 - y1;
                const C = x2 - x1;
                const D = y2 - y1;
                
                const dot = A * C + B * D;
                const lenSq = C * C + D * D;
                let param = -1;
                
                if (lenSq !== 0) param = dot / lenSq;
                
                let xx, yy;
                
                if (param < 0) {
                    xx = x1;
                    yy = y1;
                } else if (param > 1) {
                    xx = x2;
                    yy = y2;
                } else {
                    xx = x1 + param * C;
                    yy = y1 + param * D;
                }
                
                const dx = x0 - xx;
                const dy = y0 - yy;
                
                // Convert to approximate meters (rough calculation)
                return Math.sqrt(dx * dx + dy * dy) * 111000;
            };
            
            // Filter vehicles within 500 meters of the route line
            const threshold = 500; // meters
            return vehicles.filter(vehicle => {
                const distance = distanceToLineSegment(
                    { lat: vehicle.lat, lng: vehicle.lng },
                    start,
                    end
                );
                return distance <= threshold;
            });
        }

        function drawRoute(start, end) {
            // Remove existing route elements
            if (routePolyline) {
                map.removeLayer(routePolyline);
                routePolyline = null;
            }
            if (routeStartMarker) {
                map.removeLayer(routeStartMarker);
                routeStartMarker = null;
            }
            if (routeEndMarker) {
                map.removeLayer(routeEndMarker);
                routeEndMarker = null;
            }
            
            // Create start marker (blue)
            const startIcon = L.divIcon({
                className: 'route-marker',
                html: `
                    <div style="
                        background: #3b82f6;
                        width: 30px;
                        height: 30px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    "></div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            routeStartMarker = L.marker([start.lat, start.lng], { icon: startIcon })
                .bindPopup(`<strong>Start:</strong> ${start.name}`)
                .addTo(map);
            
            // Create end marker (red)
            const endIcon = L.divIcon({
                className: 'route-marker',
                html: `
                    <div style="
                        background: #ef4444;
                        width: 30px;
                        height: 30px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    "></div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            routeEndMarker = L.marker([end.lat, end.lng], { icon: endIcon })
                .bindPopup(`<strong>End:</strong> ${end.name}`)
                .addTo(map);
            
            // Draw a line between start and end
            routePolyline = L.polyline(
                [[start.lat, start.lng], [end.lat, end.lng]], 
                {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.7,
                    dashArray: '10, 10'
                }
            ).addTo(map);
            
            // Fit map to show the entire route
            map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
            
            // Store route data
            routeStart = start;
            routeEnd = end;
        }

        function clearRoute() {
            // Remove route visualization
            if (routePolyline) map.removeLayer(routePolyline);
            if (routeStartMarker) map.removeLayer(routeStartMarker);
            if (routeEndMarker) map.removeLayer(routeEndMarker);
            
            routePolyline = null;
            routeStartMarker = null;
            routeEndMarker = null;
            routeStart = null;
            routeEnd = null;
            isRouteFilterActive = false;
            
            // Clear inputs
            if (startLocationInput) startLocationInput.value = '';
            if (endLocationInput) endLocationInput.value = '';
            
            if (startLocationInput && startLocationInput.dataset) {
                delete startLocationInput.dataset.lat;
                delete startLocationInput.dataset.lng;
            }
            if (endLocationInput && endLocationInput.dataset) {
                delete endLocationInput.dataset.lat;
                delete endLocationInput.dataset.lng;
            }
            
            // Hide route results and clear button
            if (routeResultsEl) routeResultsEl.style.display = 'none';
            if (clearRouteBtn) clearRouteBtn.style.display = 'none';
            
            // Reset map and vehicle list to show all vehicles
            updateMap(allVehicles);
            updateVehicleList(allVehicles);
            
            // Reset map view to Delhi
            map.setView(delhiCoords, 11);
        }

        // --- Geocoding/Autocomplete Functions (Must be defined here) ---
        
        async function geocodeLocation(locationName) {
            try {
                // Using Nominatim OpenStreetMap API for geocoding
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)},Delhi,India&format=json&limit=1`
                );
                const data = await response.json();
                
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        name: data[0].display_name
                    };
                }
                return null;
            } catch (error) {
                console.error('Geocoding error:', error);
                return null;
            }
        }
        
        async function searchLocationSuggestions(query) {
            if (!query || query.length < 3) return [];
            
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},Delhi,India&format=json&limit=5&addressdetails=1`
                );
                const data = await response.json();
                
                return data.map(item => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                }));
            } catch (error) {
                console.error('Location search error:', error);
                return [];
            }
        }

        function showAutocompleteDropdown(inputId, suggestions) {
            const dropdown = document.getElementById(`${inputId}-dropdown`);
            if (!dropdown) return;
            
            if (suggestions.length === 0) {
                dropdown.classList.add('hidden');
                return;
            }
            
            dropdown.innerHTML = suggestions.map((suggestion, index) => `
                <div class="autocomplete-item px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-slate-100 transition-colors" data-index="${index}">
                    <div class="flex items-start gap-2">
                        <span class="text-blue-500 mt-0.5">📍</span>
                        <div class="flex-grow">
                            <p class="text-sm font-medium text-slate-800">${suggestion.name.split(',')[0]}</p>
                            <p class="text-xs text-slate-500 truncate">${suggestion.name}</p>
                        </div>
                    </div>
                </div>
            `).join('');
            
            dropdown.classList.remove('hidden');
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 2px solid #e2e8f0;
                border-top: none;
                border-radius: 0 0 0.75rem 0.75rem;
                max-height: 300px;
                overflow-y: auto;
                z-index: 50;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            `;
            
            dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = suggestions[index].name.split(',')[0];
                        // Store coordinates in dataset
                        input.dataset.lat = suggestions[index].lat;
                        input.dataset.lng = suggestions[index].lng;
                    }
                    hideAutocompleteDropdown(inputId);
                });
            });
        }
        
        function hideAutocompleteDropdown(inputId) {
            const dropdown = document.getElementById(`${inputId}-dropdown`);
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
        }
        
        function setupAutocomplete(inputId) {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            input.addEventListener('input', async (e) => {
                const query = e.target.value.trim();
                
                if (autocompleteTimeouts[inputId]) {
                    clearTimeout(autocompleteTimeouts[inputId]);
                }
                
                if (query.length < 3) {
                    hideAutocompleteDropdown(inputId);
                    return;
                }
                
                autocompleteTimeouts[inputId] = setTimeout(async () => {
                    const suggestions = await searchLocationSuggestions(query);
                    showAutocompleteDropdown(inputId, suggestions);
                }, 300);
            });
            
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target)) {
                    hideAutocompleteDropdown(inputId);
                }
            });
        }
        
        // --- EVENT LISTENERS ---
        
        if(toggleButton) {
            toggleButton.addEventListener('click', () => {
                isUpdating = !isUpdating;
                if (isUpdating) {
                    toggleButton.textContent = 'Pause Updates';
                    startUpdates();
                } else {
                    toggleButton.textContent = 'Resume Updates';
                    stopUpdates();
                }
            });
        }
        
        if (searchRouteBtn) {
            searchRouteBtn.addEventListener('click', async () => {
                const startLocation = startLocationInput.value.trim();
                const endLocation = endLocationInput.value.trim();
                
                if (!startLocation || !endLocation) {
                    alert('Please enter both start and end locations');
                    return;
                }
                
                searchRouteBtn.disabled = true;
                searchRouteBtn.textContent = 'Searching...';
                
                try {
                    let startData, endData;
                    
                    // Use stored coordinates from dataset if available
                    if (startLocationInput.dataset.lat && startLocationInput.dataset.lng) {
                        startData = {
                            lat: parseFloat(startLocationInput.dataset.lat),
                            lng: parseFloat(startLocationInput.dataset.lng),
                            name: startLocation
                        };
                    } else {
                        startData = await geocodeLocation(startLocation);
                    }
                    
                    if (endLocationInput.dataset.lat && endLocationInput.dataset.lng) {
                        endData = {
                            lat: parseFloat(endLocationInput.dataset.lat),
                            lng: parseFloat(endLocationInput.dataset.lng),
                            name: endLocation
                        };
                    } else {
                        endData = await geocodeLocation(endLocation);
                    }

                    if (startData && endData) {
                        // Draw the route on map
                        drawRoute(startData, endData);
                        
                        // Filter vehicles along the route
                        let vehiclesOnRoute = filterVehiclesByRoute(allVehicles, startData, endData);
                        isRouteFilterActive = true;
                        
                        // Update map with filtered vehicles
                        updateMap(vehiclesOnRoute);
                        
                        // Update vehicle list with filtered vehicles
                        updateVehicleList(vehiclesOnRoute);
                        
                        // Update route results display
                        updateRouteResults(vehiclesOnRoute);
                        
                        // Show clear button
                        if (clearRouteBtn) clearRouteBtn.style.display = 'block';
                    } else {
                        alert('Could not find one or both locations. Please try different search terms.');
                    }
                } catch (error) {
                    console.error('Route search error:', error);
                    alert('An error occurred while searching for the route. Please try again.');
                }
                
                searchRouteBtn.disabled = false;
                searchRouteBtn.textContent = 'Search Route';
            });
        }
        
        if (clearRouteBtn) {
            clearRouteBtn.addEventListener('click', () => {
                // Remove route visualization
                if (routePolyline) map.removeLayer(routePolyline);
                if (routeStartMarker) map.removeLayer(routeStartMarker);
                if (routeEndMarker) map.removeLayer(routeEndMarker);
                
                routePolyline = null;
                routeStartMarker = null;
                routeEndMarker = null;
                routeStart = null;
                routeEnd = null;
                isRouteFilterActive = false;
                
                // Clear inputs
                if (startLocationInput) startLocationInput.value = '';
                if (endLocationInput) endLocationInput.value = '';
                
                if (startLocationInput && startLocationInput.dataset) {
                    delete startLocationInput.dataset.lat;
                    delete startLocationInput.dataset.lng;
                }
                if (endLocationInput && endLocationInput.dataset) {
                    delete endLocationInput.dataset.lat;
                    delete endLocationInput.dataset.lng;
                }
                
                // Hide route results and clear button
                if (routeResultsEl) routeResultsEl.style.display = 'none';
                if (clearRouteBtn) clearRouteBtn.style.display = 'none';
                
                // Reset map and vehicle list to show all vehicles
                updateMap(allVehicles);
                updateVehicleList(allVehicles);
                
                // Reset map view to Delhi
                map.setView(delhiCoords, 11);
            });
        }

        // --- INITIALIZATION ---
        setupAutocomplete('start-location'); 
        setupAutocomplete('end-location'); 
        startUpdates();

        // --- 4. CLEANUP (Runs on component unmount) ---
        return () => {
            stopUpdates();
            if (map) {
                map.remove(); 
            }
        };
    }, []); 

    // --- RENDER (Enhanced UI with Tailwind) ---
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* --- MODERN HEADER --- */}
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl sticky top-0 z-20 border-b border-slate-700">
                <div className="flex justify-between items-center max-w-full px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-xl shadow-lg">
                            <span className='text-2xl'>🚌</span>
                        </div>
                        <div>
                            <h1 className='text-xl font-bold tracking-tight'>City Stride Live Tracker</h1>
                            <p className="text-xs text-slate-400 mt-0.5">Real-time bus monitoring system</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {/* Stats Cards */}
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600">
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Status</div>
                                <div id="connection-status" className="text-sm font-semibold text-green-400">Connecting...</div>
                            </div>
                            <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600">
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Vehicles</div>
                                <div id="vehicle-count" className="text-2xl font-bold text-blue-400">0</div>
                            </div>
                            <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600">
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Last Update</div>
                                <div id="last-update" className="text-sm font-semibold text-slate-300">--</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button id="toggle-updates" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg transition font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Pause Updates
                            </button>
                            <button onClick={handleNavigateBack} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                ← Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <div className="main-content flex flex-grow h-[calc(100vh-88px)]">
                {/* --- ENHANCED SIDEBAR --- */}
                <div className="sidebar w-[420px] bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-2xl overflow-y-auto flex flex-col flex-shrink-0 z-10">
                    
                    {/* Route Search Section */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                🔍
                            </div>
                            <h2 className='text-lg font-bold text-slate-800'>Route Search</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Start Location */}
                            <div>
                                <label htmlFor="start-location" className='block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2'>
                                    Starting Point
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        id="start-location" 
                                        placeholder="e.g., Connaught Place" 
                                        autoComplete="off" 
                                        className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none group-hover:border-slate-300"
                                    />
                                    <button 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-blue-600 text-white w-9 h-9 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105" 
                                        id="start-location-btn" 
                                        title="Click on map to set"
                                    >
                                        📍
                                    </button>
                                    <div id="start-location-dropdown" className="autocomplete-dropdown hidden"></div>
                                </div>
                            </div>

                            {/* End Location */}
                            <div>
                                <label htmlFor="end-location" className='block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2'>
                                    Destination
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        id="end-location" 
                                        placeholder="e.g., India Gate" 
                                        autoComplete="off" 
                                        className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none group-hover:border-slate-300"
                                    />
                                    <button 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-red-500 to-red-600 text-white w-9 h-9 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105" 
                                        id="end-location-btn" 
                                        title="Click on map to set"
                                    >
                                        📍
                                    </button>
                                    <div id="end-location-dropdown" className="autocomplete-dropdown hidden"></div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    id="search-route" 
                                    className="flex-grow bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Search Route
                                </button>
                                <button 
                                    id="clear-route" 
                                    className="bg-slate-400 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-slate-500 transition-all shadow-lg hover:shadow-xl" 
                                    style={{display: 'none'}}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Route Results */}
                    <div id="route-results" className="mx-6 my-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg overflow-hidden" style={{display: 'none'}}>
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3">
                            <h3 className='text-base font-bold flex items-center gap-2'>
                                <span>✓</span> Buses on Route
                            </h3>
                        </div>
                        <div className="p-4">
                            <div id="route-bus-list" className="space-y-3">
                                {/* Injected Bus List */}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details Stream - CLEANER DESIGN */}
                    <div className="flex-grow px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                    🚌
                                </div>
                                <h2 className='text-lg font-bold text-slate-800'>Live Vehicles</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live</span>
                            </div>
                        </div>
                        
                        <div id="vehicle-list" className="space-y-3">
                            {/* Empty State */}
                            <div className="empty-state bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                                    🔄
                                </div>
                                <p className="text-slate-600 font-medium mb-1">Connecting to server...</p>
                                <p className="text-xs text-slate-400">Waiting for data from localhost:8000</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Legend */}
                    <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-4 mt-auto">
                        <h3 className='text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide'>Legend</h3>
                        <div className='space-y-2.5'>
                            <div className='flex items-center gap-3'>
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-md"></div>
                                <span className="text-sm text-slate-600 font-medium">On Time <span className="text-xs text-slate-400">(&lt; 2 min delay)</span></span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md"></div>
                                <span className="text-sm text-slate-600 font-medium">Delayed <span className="text-xs text-slate-400">(≥ 2 min)</span></span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* MAP CONTAINER: Target for Leaflet initialization */}
                <div id="map" ref={mapContainerRef} className="map-container flex-grow h-full relative z-0 shadow-inner"></div>
            </div>
        </div>
    );
}

// Ensure the necessary component code is present (omitted for brevity)
// ...