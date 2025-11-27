# Delhi Transit Live Tracker

A real-time web application for tracking Delhi public transport vehicles with live position updates and delay calculations using the OTD (One Transport Delhi) GTFS-Realtime API.

## Features

- 🚌 **Live Vehicle Tracking**: Real-time position updates every 15 seconds
- ⏱️ **Delay Calculation**: Automatic delay time estimation based on vehicle movement patterns
- 🗺️ **Interactive Map**: Interactive Leaflet map showing all active vehicles
- 📊 **Vehicle Details**: Sidebar with detailed information about each vehicle
- 🎨 **Visual Indicators**: Color-coded markers (green for on-time, red for delayed)
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. The API key is already configured in `config.js`. If you need to change it, edit the file:
```javascript
export const API_KEY = 'your-api-key-here';
```

## Running the Application

Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
.
├── server.js          # Express backend server
├── config.js          # Configuration (API key, URLs)
├── package.json       # Dependencies and scripts
├── public/            # Frontend files
│   ├── index.html     # Main HTML page
│   ├── style.css      # Styling
│   └── app.js         # Frontend JavaScript
└── README.md          # This file
```

## How It Works

### Backend (`server.js`)
- Fetches GTFS-Realtime feed from OTD API every 15 seconds
- Parses Protocol Buffer data using `gtfs-realtime-bindings`
- Calculates delays based on:
  - Vehicle position changes over time
  - Timestamp staleness
  - Vehicle status (stopped, in transit, etc.)
- Exposes REST API endpoint `/api/vehicles` for frontend

### Frontend (`public/app.js`)
- Fetches vehicle data from backend API
- Displays vehicles as markers on Leaflet map
- Updates positions and delays in real-time
- Shows detailed information in sidebar

### Delay Calculation

The delay is calculated using multiple factors:
1. **Position Analysis**: If a vehicle hasn't moved significantly (< 50m) but time has passed, it's likely delayed
2. **Timestamp Staleness**: If the vehicle's position report is old (> 2 minutes), delay is estimated
3. **Status-Based**: Vehicles marked as "STOPPED" get minimum delay values
4. **Accumulation**: Delays accumulate when vehicles remain stationary

## API Endpoints

- `GET /` - Serves the main web interface
- `GET /api/vehicles` - Returns JSON with all active vehicles and their positions
- `GET /api/health` - Health check endpoint

## Technologies Used

- **Backend**: Node.js, Express
- **GTFS Parsing**: gtfs-realtime-bindings
- **Frontend**: Vanilla JavaScript
- **Maps**: Leaflet.js with OpenStreetMap
- **Styling**: Custom CSS

## Notes

- The application updates vehicle positions every 15 seconds
- Delay calculations are estimates based on movement patterns
- Some vehicles may not have complete trip/route information
- Map is centered on Delhi by default

## Troubleshooting

If you see "Error" status:
- Check your internet connection
- Verify the API key in `config.js` is valid
- Check if the OTD API is accessible: `https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb`

If no vehicles appear:
- Wait a few seconds for the first update
- Check browser console for errors
- Verify the API is returning data (check Network tab)

## License

MIT

