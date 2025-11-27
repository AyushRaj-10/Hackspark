import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { API_KEY, OTD_API_URL, UPDATE_INTERVAL } from './config.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store latest data and timestamps for delay calculation
let latestVehicleData = new Map();
let lastUpdateTime = null;

/**
 * Fetch and parse GTFS-Realtime vehicle positions
 */
async function fetchVehiclePositions() {
  try {
    const url = `${OTD_API_URL}?key=${API_KEY}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Delhi-Transit-Tracker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const currentTime = Date.now();
    const vehicles = [];

    feed.entity.forEach(entity => {
      if (entity.vehicle && entity.vehicle.position) {
        const vehicle = entity.vehicle;
        const vehicleId = vehicle.vehicle?.id || 'unknown';
        const position = vehicle.position;
        const trip = vehicle.trip;
        // Parse timestamp from GTFS-Realtime format
        let timestamp = new Date();
        if (vehicle.timestamp) {
          try {
            if (typeof vehicle.timestamp === 'object' && vehicle.timestamp.low !== undefined) {
              // Long timestamp format (from protobuf)
              const seconds = vehicle.timestamp.low + (vehicle.timestamp.high || 0) * 4294967296;
              timestamp = new Date(seconds * 1000);
            } else if (typeof vehicle.timestamp === 'number') {
              // Unix timestamp in seconds
              if (vehicle.timestamp > 1e12) {
                // Already in milliseconds
                timestamp = new Date(vehicle.timestamp);
              } else {
                timestamp = new Date(vehicle.timestamp * 1000);
              }
            }
          } catch (e) {
            console.warn(`Error parsing timestamp for vehicle ${vehicleId}:`, e);
            timestamp = new Date();
          }
        }

        // Calculate delay
        let delaySeconds = 0;
        const vehicleKey = `${vehicleId}_${trip?.tripId || 'unknown'}`;
        const reportTime = timestamp.getTime();
        const timeSinceReport = (currentTime - reportTime) / 1000; // seconds
        
        if (latestVehicleData.has(vehicleKey)) {
          const previous = latestVehicleData.get(vehicleKey);
          const timeDiff = (currentTime - previous.lastSeen) / 1000; // seconds
          
          // Estimate delay based on position change vs time elapsed
          if (previous.position && timeDiff > 30) {
            const distance = calculateDistance(
              previous.position.latitude,
              previous.position.longitude,
              position.latitude,
              position.longitude
            );
            
            // If vehicle hasn't moved much (< 50m) but significant time passed, likely delayed
            if (distance < 0.05 && timeDiff > 60) {
              // Accumulate delay
              delaySeconds = (previous.delay || 0) + (timeDiff - 30);
            } else if (distance > 0.1) {
              // Vehicle is moving, reset or reduce delay
              delaySeconds = Math.max(0, (previous.delay || 0) - 10);
            } else {
              delaySeconds = previous.delay || 0;
            }
          } else {
            delaySeconds = previous.delay || 0;
          }
        }

        // If report is stale (older than 2 minutes), add to delay
        if (timeSinceReport > 120) {
          delaySeconds = Math.max(delaySeconds, Math.floor(timeSinceReport - 60));
        }

        // Check vehicle status for delays
        const currentStatus = vehicle.currentStatus || 'IN_TRANSIT_TO';
        if (currentStatus === 'STOPPED_AT' || currentStatus === 'STOPPED') {
          delaySeconds = Math.max(delaySeconds, 60); // Minimum 1 minute delay if stopped
        }

        const vehicleData = {
          id: vehicleId,
          lat: position.latitude,
          lng: position.longitude,
          bearing: position.bearing || null,
          speed: position.speed || null,
          trip: {
            tripId: trip?.tripId || null,
            routeId: trip?.routeId || null,
            directionId: trip?.directionId || null,
          },
          timestamp: timestamp.toISOString(),
          delaySeconds: Math.round(delaySeconds),
          currentStatus: vehicle.currentStatus || 'IN_TRANSIT_TO'
        };

        vehicles.push(vehicleData);
        
        // Store for next comparison
        latestVehicleData.set(vehicleKey, {
          position: { latitude: position.latitude, longitude: position.longitude },
          lastSeen: currentTime,
          delay: delaySeconds,
          timestamp: reportTime
        });
      }
    });

    // Clean up old entries (older than 5 minutes)
    const fiveMinutesAgo = currentTime - (5 * 60 * 1000);
    for (const [key, value] of latestVehicleData.entries()) {
      if (value.lastSeen < fiveMinutesAgo) {
        latestVehicleData.delete(key);
      }
    }

    lastUpdateTime = new Date();
    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicle positions:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Format delay time for display
 */
function formatDelay(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// API endpoint to get live vehicle positions
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await fetchVehiclePositions();
    res.json({
      success: true,
      vehicles: vehicles,
      lastUpdate: lastUpdateTime?.toISOString() || null,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    lastUpdate: lastUpdateTime?.toISOString() || null
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚌 Delhi Transit Tracker server running on http://localhost:${PORT}`);
  console.log(`📡 Fetching updates every ${UPDATE_INTERVAL / 1000} seconds`);
  
  // Initial fetch
  fetchVehiclePositions().catch(console.error);
  
  // Set up periodic updates
  setInterval(() => {
    fetchVehiclePositions().catch(console.error);
  }, UPDATE_INTERVAL);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log(`💡 Solutions:`);
    console.log(`   1. Kill the process using port ${PORT}:`);
    console.log(`      netstat -ano | findstr :${PORT}`);
    console.log(`      taskkill /PID <PID> /F`);
    console.log(`   2. Use a different port:`);
    console.log(`      $env:PORT=3001; npm start`);
    console.log(`\n   Or set PORT environment variable before starting.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

