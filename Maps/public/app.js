// Map initialization
const delhiCoords = [28.6139, 77.2090]; // Delhi coordinates
const map = L.map('map').setView(delhiCoords, 11);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// State management
let vehicleMarkers = new Map();
let allVehicles = []; // Store all vehicles
let filteredVehicles = []; // Store filtered vehicles
let updateInterval = null;
let isUpdating = true;
let selectedVehicle = null;
let routeStart = null;
let routeEnd = null;
let routePolyline = null;
let routeStartMarker = null;
let routeEndMarker = null;
let isRouteFilterActive = false;
let locationClickMode = null; // 'start' or 'end'

// DOM elements
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

// Create custom bus icon
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

// Format delay for display
function formatDelay(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m delay`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m delay`;
    }
}

// Format time for display
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
}

// Fetch vehicle data from API
async function fetchVehicles() {
    try {
        const response = await fetch('/api/vehicles');
        const data = await response.json();
        
        if (data.success) {
            updateConnectionStatus('connected', 'Connected');
            allVehicles = data.vehicles;
            
            // Apply route filter if active
            if (isRouteFilterActive && routeStart && routeEnd) {
                filteredVehicles = filterVehiclesByRoute(allVehicles, routeStart, routeEnd);
                updateVehicleCount(filteredVehicles.length);
                updateMap(filteredVehicles);
                updateVehicleList(filteredVehicles);
                updateRouteResults(filteredVehicles);
            } else {
                filteredVehicles = allVehicles;
                updateVehicleCount(data.count);
                updateMap(data.vehicles);
                updateVehicleList(data.vehicles);
            }
            updateLastUpdateTime(data.lastUpdate);
        } else {
            throw new Error(data.error || 'Failed to fetch vehicles');
        }
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        updateConnectionStatus('error', 'Error');
        updateConnectionStatus('error', `Error: ${error.message}`);
    }
}

// Update connection status
function updateConnectionStatus(status, message) {
    connectionStatus.textContent = message;
    connectionStatus.className = `status-value ${status}`;
}

// Update vehicle count
function updateVehicleCount(count) {
    vehicleCount.textContent = count;
}

// Update last update time
function updateLastUpdateTime(timestamp) {
    if (timestamp) {
        const date = new Date(timestamp);
        lastUpdate.textContent = formatTime(timestamp);
        lastUpdate.title = date.toLocaleString();
    } else {
        lastUpdate.textContent = '--';
    }
}

// Update map with vehicle positions
function updateMap(vehicles) {
    const currentVehicleIds = new Set(vehicles.map(v => v.id));
    
    // Remove markers for vehicles that are no longer active
    for (const [vehicleId, marker] of vehicleMarkers.entries()) {
        if (!currentVehicleIds.has(vehicleId)) {
            map.removeLayer(marker);
            vehicleMarkers.delete(vehicleId);
        }
    }
    
    // Add or update markers for current vehicles
    vehicles.forEach(vehicle => {
        const isMoving = vehicle.speed && vehicle.speed > 0;
        const delayMinutes = vehicle.delaySeconds / 60;
        
        if (vehicleMarkers.has(vehicle.id)) {
            // Update existing marker
            const marker = vehicleMarkers.get(vehicle.id);
            marker.setLatLng([vehicle.lat, vehicle.lng]);
            
            // Update icon if delay status changed significantly
            const oldDelay = marker.delaySeconds || 0;
            const delayDiff = Math.abs(vehicle.delaySeconds - oldDelay);
            if (delayDiff > 60) { // Only update icon if delay changed by more than 1 minute
                const newIcon = createBusIcon(vehicle.delaySeconds, isMoving);
                marker.setIcon(newIcon);
            }
            
            // Update popup
            marker.bindPopup(createPopupContent(vehicle));
            
            // Store delay for comparison
            marker.delaySeconds = vehicle.delaySeconds;
        } else {
            // Create new marker
            const icon = createBusIcon(vehicle.delaySeconds, isMoving);
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
                .bindPopup(createPopupContent(vehicle))
                .addTo(map);
            
            marker.delaySeconds = vehicle.delaySeconds;
            marker.vehicleData = vehicle;
            
            // Add click handler
            marker.on('click', () => {
                selectVehicle(vehicle);
            });
            
            vehicleMarkers.set(vehicle.id, marker);
        }
    });
}

// Create popup content for vehicle marker
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

// Update vehicle list sidebar
function updateVehicleList(vehicles) {
    if (vehicles.length === 0) {
        vehicleList.innerHTML = '<p class="empty-state">No vehicles found</p>';
        return;
    }
    
    // Sort by delay (most delayed first)
    const sortedVehicles = [...vehicles].sort((a, b) => b.delaySeconds - a.delaySeconds);
    
    vehicleList.innerHTML = sortedVehicles.map(vehicle => {
        const delayMinutes = vehicle.delaySeconds / 60;
        const delayClass = delayMinutes >= 2 ? 'delayed' : 'on-time';
        const delayText = delayMinutes >= 2 
            ? `<span class="delay-badge ${delayClass}">${formatDelay(vehicle.delaySeconds)}</span>`
            : '<span class="delay-badge on-time">On time</span>';
        
        const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id ? 'selected' : '';
        
        return `
            <div class="vehicle-card ${isSelected}" data-vehicle-id="${vehicle.id}">
                <h3>Vehicle ${vehicle.id}</h3>
                <div class="vehicle-info">
                    <div class="vehicle-info-item">
                        <span class="vehicle-info-label">Route</span>
                        <span class="vehicle-info-value">${vehicle.trip.routeId || 'N/A'}</span>
                    </div>
                    <div class="vehicle-info-item">
                        <span class="vehicle-info-label">Trip</span>
                        <span class="vehicle-info-value">${vehicle.trip.tripId ? vehicle.trip.tripId.substring(0, 10) + '...' : 'N/A'}</span>
                    </div>
                    <div class="vehicle-info-item">
                        <span class="vehicle-info-label">Status</span>
                        <span class="vehicle-info-value">${vehicle.currentStatus || 'In Transit'}</span>
                    </div>
                    ${vehicle.speed ? `
                    <div class="vehicle-info-item">
                        <span class="vehicle-info-label">Speed</span>
                        <span class="vehicle-info-value">${Math.round(vehicle.speed * 3.6)} km/h</span>
                    </div>
                    ` : ''}
                </div>
                ${delayText}
            </div>
        `;
    }).join('');
    
    // Add click handlers to vehicle cards
    vehicleList.querySelectorAll('.vehicle-card').forEach(card => {
        card.addEventListener('click', () => {
            const vehicleId = card.dataset.vehicleId;
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if (vehicle) {
                selectVehicle(vehicle);
            }
        });
    });
}

// Select vehicle and center map on it
function selectVehicle(vehicle) {
    selectedVehicle = vehicle;
    
    // Update UI
    vehicleList.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.vehicleId === vehicle.id) {
            card.classList.add('selected');
        }
    });
    
    // Center map and open popup
    const marker = vehicleMarkers.get(vehicle.id);
    if (marker) {
        map.setView([vehicle.lat, vehicle.lng], 14);
        marker.openPopup();
    }
}

// Toggle updates
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

// Start auto-updates
function startUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Fetch immediately
    fetchVehicles();
    
    // Then fetch every 15 seconds
    updateInterval = setInterval(fetchVehicles, 15000);
}

// Stop auto-updates
function stopUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Autocomplete search function
let autocompleteTimeouts = {};

async function searchLocations(query, limit = 5) {
    if (!query || query.length < 2) {
        return [];
    }
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Delhi, India')}&limit=${limit}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'Delhi-Transit-Tracker'
                }
            }
        );
        const data = await response.json();
        return data.map(item => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            name: item.display_name,
            address: item.address || {}
        }));
    } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}

// Show autocomplete dropdown
function showAutocompleteDropdown(inputId, suggestions) {
    const dropdown = document.getElementById(`${inputId}-dropdown`);
    if (!dropdown) return;
    
    if (suggestions.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-item autocomplete-no-results">No locations found</div>';
        dropdown.classList.add('show');
        return;
    }
    
    dropdown.innerHTML = suggestions.map((item, index) => {
        const shortName = item.name.split(',')[0];
        return `
            <div class="autocomplete-item" data-index="${index}" data-lat="${item.lat}" data-lng="${item.lng}" data-name="${item.name}">
                <div class="autocomplete-item-name">${shortName}</div>
                <div class="autocomplete-item-address">${item.name}</div>
            </div>
        `;
    }).join('');
    
    dropdown.classList.add('show');
    
    // Add click handlers
    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            const name = item.dataset.name;
            
            const input = document.getElementById(inputId);
            input.value = name.split(',')[0];
            
            if (inputId === 'start-location') {
                routeStart = { lat, lng, name };
            } else {
                routeEnd = { lat, lng, name };
            }
            
            dropdown.classList.remove('show');
        });
        
        item.addEventListener('mouseenter', () => {
            dropdown.querySelectorAll('.autocomplete-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
        });
    });
}

// Hide autocomplete dropdown
function hideAutocompleteDropdown(inputId) {
    const dropdown = document.getElementById(`${inputId}-dropdown`);
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// Setup autocomplete for an input
function setupAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    let selectedIndex = -1;
    let currentSuggestions = [];
    
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        selectedIndex = -1;
        
        // Clear existing timeout
        if (autocompleteTimeouts[inputId]) {
            clearTimeout(autocompleteTimeouts[inputId]);
        }
        
        if (query.length < 2) {
            hideAutocompleteDropdown(inputId);
            return;
        }
        
        // Debounce the search
        autocompleteTimeouts[inputId] = setTimeout(async () => {
            const suggestions = await searchLocations(query);
            currentSuggestions = suggestions;
            showAutocompleteDropdown(inputId, suggestions);
        }, 300);
    });
    
    input.addEventListener('blur', () => {
        // Delay hiding to allow click on dropdown
        setTimeout(() => {
            hideAutocompleteDropdown(inputId);
        }, 200);
    });
    
    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query.length >= 2) {
            searchLocations(query).then(suggestions => {
                currentSuggestions = suggestions;
                showAutocompleteDropdown(inputId, suggestions);
            });
        }
    });
    
    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        const dropdown = document.getElementById(`${inputId}-dropdown`);
        if (!dropdown || !dropdown.classList.contains('show')) return;
        
        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                items.forEach((item, idx) => {
                    item.classList.toggle('selected', idx === selectedIndex);
                });
                items[selectedIndex].scrollIntoView({ block: 'nearest' });
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                items.forEach((item, idx) => {
                    item.classList.toggle('selected', idx === selectedIndex);
                });
                if (selectedIndex >= 0) {
                    items[selectedIndex].scrollIntoView({ block: 'nearest' });
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                }
                break;
                
            case 'Escape':
                hideAutocompleteDropdown(inputId);
                input.blur();
                break;
        }
    });
}

// Geocoding function to convert location name to coordinates
async function geocodeLocation(locationName) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ', Delhi, India')}&limit=1`,
            {
                headers: {
                    'User-Agent': 'Delhi-Transit-Tracker'
                }
            }
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

// Calculate distance from point to line segment (in km)
function distanceToLineSegment(point, lineStart, lineEnd) {
    const A = point.lat - lineStart.lat;
    const B = point.lng - lineStart.lng;
    const C = lineEnd.lat - lineStart.lat;
    const D = lineEnd.lng - lineStart.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = lineStart.lat;
        yy = lineStart.lng;
    } else if (param > 1) {
        xx = lineEnd.lat;
        yy = lineEnd.lng;
    } else {
        xx = lineStart.lat + param * C;
        yy = lineStart.lng + param * D;
    }

    const dx = point.lat - xx;
    const dy = point.lng - yy;
    return Math.sqrt(dx * dx + dy * dy) * 111; // Convert to km (approximate)
}

// Filter vehicles by route - show buses within 2km of the route
function filterVehiclesByRoute(vehicles, start, end) {
    return vehicles.filter(vehicle => {
        const distance = distanceToLineSegment(
            { lat: vehicle.lat, lng: vehicle.lng },
            { lat: start.lat, lng: start.lng },
            { lat: end.lat, lng: end.lng }
        );
        // Show buses within 2km of the route
        return distance <= 2.0;
    });
}

// Draw route on map
function drawRoute(start, end) {
    // Remove existing route if any
    if (routePolyline) {
        map.removeLayer(routePolyline);
    }
    if (routeStartMarker) {
        map.removeLayer(routeStartMarker);
    }
    if (routeEndMarker) {
        map.removeLayer(routeEndMarker);
    }

    // Draw route line
    routePolyline = L.polyline(
        [[start.lat, start.lng], [end.lat, end.lng]],
        {
            color: '#667eea',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }
    ).addTo(map);

    // Add start marker
    routeStartMarker = L.marker([start.lat, start.lng], {
        icon: L.divIcon({
            className: 'route-marker',
            html: '<div style="background: #4caf50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map).bindPopup(`Start: ${start.name || 'Start Location'}`);

    // Add end marker
    routeEndMarker = L.marker([end.lat, end.lng], {
        icon: L.divIcon({
            className: 'route-marker',
            html: '<div style="background: #f44336; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map).bindPopup(`End: ${end.name || 'End Location'}`);

    // Fit map to show route
    const bounds = L.latLngBounds([[start.lat, start.lng], [end.lat, end.lng]]);
    map.fitBounds(bounds, { padding: [50, 50] });
}

// Clear route
function clearRoute() {
    isRouteFilterActive = false;
    routeStart = null;
    routeEnd = null;
    
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
    
    startLocationInput.value = '';
    endLocationInput.value = '';
    clearRouteBtn.style.display = 'none';
    startLocationBtn.classList.remove('active');
    endLocationBtn.classList.remove('active');
    locationClickMode = null;
    
    // Hide route results
    const routeResults = document.getElementById('route-results');
    if (routeResults) {
        routeResults.style.display = 'none';
    }
    
    // Show all vehicles
    updateVehicleCount(allVehicles.length);
    updateMap(allVehicles);
    updateVehicleList(allVehicles);
}

// Update route results section with bus details
function updateRouteResults(vehicles) {
    const routeResults = document.getElementById('route-results');
    const routeBusCount = document.getElementById('route-bus-count');
    const routeOnTimeCount = document.getElementById('route-on-time-count');
    const routeDelayedCount = document.getElementById('route-delayed-count');
    const routeBusList = document.getElementById('route-bus-list');
    
    if (!routeResults) return;
    
    // Show the section
    routeResults.style.display = 'block';
    
    // Calculate statistics
    const totalBuses = vehicles.length;
    const onTimeBuses = vehicles.filter(v => (v.delaySeconds / 60) < 2).length;
    const delayedBuses = vehicles.filter(v => (v.delaySeconds / 60) >= 2).length;
    
    // Update stats
    if (routeBusCount) routeBusCount.textContent = totalBuses;
    if (routeOnTimeCount) routeOnTimeCount.textContent = onTimeBuses;
    if (routeDelayedCount) routeDelayedCount.textContent = delayedBuses;
    
    // Update bus list
    if (routeBusList) {
        if (vehicles.length === 0) {
            routeBusList.innerHTML = '<p class="empty-route-message">No buses found on this route</p>';
        } else {
            // Sort by delay (most delayed first)
            const sortedVehicles = [...vehicles].sort((a, b) => b.delaySeconds - a.delaySeconds);
            
            routeBusList.innerHTML = sortedVehicles.map(vehicle => {
                const delayMinutes = vehicle.delaySeconds / 60;
                const isDelayed = delayMinutes >= 2;
                const delayClass = isDelayed ? 'delayed' : 'on-time';
                const delayText = isDelayed 
                    ? `${formatDelay(vehicle.delaySeconds)} delayed`
                    : 'On time';
                
                return `
                    <div class="route-bus-item" data-vehicle-id="${vehicle.id}">
                        <div class="route-bus-header">
                            <span class="route-bus-id">Vehicle ${vehicle.id}</span>
                            <span class="route-bus-delay ${delayClass}">${delayText}</span>
                        </div>
                        <div class="route-bus-info">
                            <div class="route-bus-detail">
                                <span class="route-bus-label">Route:</span>
                                <span class="route-bus-value">${vehicle.trip.routeId || 'N/A'}</span>
                            </div>
                            ${vehicle.speed ? `
                            <div class="route-bus-detail">
                                <span class="route-bus-label">Speed:</span>
                                <span class="route-bus-value">${Math.round(vehicle.speed * 3.6)} km/h</span>
                            </div>
                            ` : ''}
                            <div class="route-bus-detail">
                                <span class="route-bus-label">Status:</span>
                                <span class="route-bus-value">${vehicle.currentStatus || 'In Transit'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add click handlers to route bus items
            routeBusList.querySelectorAll('.route-bus-item').forEach(item => {
                item.addEventListener('click', () => {
                    const vehicleId = item.dataset.vehicleId;
                    const vehicle = vehicles.find(v => v.id === vehicleId);
                    if (vehicle) {
                        selectVehicle(vehicle);
                    }
                });
            });
        }
    }
}

// Search route handler
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
        let startData = routeStart;
        let endData = routeEnd;
        
        // If locations weren't set via autocomplete, geocode them
        if (!startData || !startData.lat) {
            startData = await geocodeLocation(startLocation);
            if (!startData) {
                alert('Could not find start location. Please try a different name or select from suggestions.');
                searchRouteBtn.disabled = false;
                searchRouteBtn.textContent = 'Search Route';
                return;
            }
        }
        
        if (!endData || !endData.lat) {
            endData = await geocodeLocation(endLocation);
            if (!endData) {
                alert('Could not find end location. Please try a different name or select from suggestions.');
                searchRouteBtn.disabled = false;
                searchRouteBtn.textContent = 'Search Route';
                return;
            }
        }
        
        routeStart = startData;
        routeEnd = endData;
        isRouteFilterActive = true;
        
        // Draw route on map
        drawRoute(routeStart, routeEnd);
        
        // Filter vehicles
        filteredVehicles = filterVehiclesByRoute(allVehicles, routeStart, routeEnd);
        updateVehicleCount(filteredVehicles.length);
        updateMap(filteredVehicles);
        updateVehicleList(filteredVehicles);
        
        // Update route results section
        updateRouteResults(filteredVehicles);
        
        clearRouteBtn.style.display = 'block';
        startLocationInput.value = startData.name.split(',')[0]; // Show simplified name
        endLocationInput.value = endData.name.split(',')[0];
        
    } catch (error) {
        console.error('Route search error:', error);
        alert('Error searching route. Please try again.');
    } finally {
        searchRouteBtn.disabled = false;
        searchRouteBtn.textContent = 'Search Route';
    }
});

// Clear route handler
clearRouteBtn.addEventListener('click', () => {
    clearRoute();
});

// Location button handlers - toggle map click mode
startLocationBtn.addEventListener('click', () => {
    if (locationClickMode === 'start') {
        locationClickMode = null;
        startLocationBtn.classList.remove('active');
        map.getContainer().classList.remove('selecting-location');
    } else {
        locationClickMode = 'start';
        endLocationBtn.classList.remove('active');
        startLocationBtn.classList.add('active');
        map.getContainer().classList.add('selecting-location');
    }
});

endLocationBtn.addEventListener('click', () => {
    if (locationClickMode === 'end') {
        locationClickMode = null;
        endLocationBtn.classList.remove('active');
        map.getContainer().classList.remove('selecting-location');
    } else {
        locationClickMode = 'end';
        startLocationBtn.classList.remove('active');
        endLocationBtn.classList.add('active');
        map.getContainer().classList.add('selecting-location');
    }
});

// Map click handler to set locations
map.on('click', async (e) => {
    if (locationClickMode) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        try {
            // Reverse geocode to get location name
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'Delhi-Transit-Tracker'
                    }
                }
            );
            const data = await response.json();
            const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            if (locationClickMode === 'start') {
                routeStart = { lat, lng, name: locationName };
                startLocationInput.value = locationName.split(',')[0];
                startLocationBtn.classList.remove('active');
                map.getContainer().classList.remove('selecting-location');
            } else {
                routeEnd = { lat, lng, name: locationName };
                endLocationInput.value = locationName.split(',')[0];
                endLocationBtn.classList.remove('active');
                map.getContainer().classList.remove('selecting-location');
            }
            
            locationClickMode = null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Still set coordinates even if reverse geocoding fails
            if (locationClickMode === 'start') {
                routeStart = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
                startLocationInput.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                startLocationBtn.classList.remove('active');
                map.getContainer().classList.remove('selecting-location');
            } else {
                routeEnd = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
                endLocationInput.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                endLocationBtn.classList.remove('active');
                map.getContainer().classList.remove('selecting-location');
            }
            locationClickMode = null;
        }
    }
});

// Initialize autocomplete
setupAutocomplete('start-location');
setupAutocomplete('end-location');

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
        hideAutocompleteDropdown('start-location');
        hideAutocompleteDropdown('end-location');
    }
});

// Initialize
startUpdates();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopUpdates();
});

