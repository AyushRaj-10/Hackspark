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
let updateInterval = null;
let isUpdating = true;
let selectedVehicle = null;

// DOM elements
const connectionStatus = document.getElementById('connection-status');
const vehicleCount = document.getElementById('vehicle-count');
const lastUpdate = document.getElementById('last-update');
const toggleButton = document.getElementById('toggle-updates');
const vehicleList = document.getElementById('vehicle-list');

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
            updateVehicleCount(data.count);
            updateLastUpdateTime(data.lastUpdate);
            updateMap(data.vehicles);
            updateVehicleList(data.vehicles);
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

// Initialize
startUpdates();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopUpdates();
});

