# Delhi Bus Crowding Backend

Backend API for the Delhi Bus Crowding Estimation System. Built with Node.js, Express, and MongoDB.

## Features

- RESTful API for submitting crowding reports
- Real-time crowd score calculation using weighted algorithm
- Historical data aggregation for predictive estimates
- Support for multiple data sources (users, drivers, auto-detection)
- Weekly aggregation job for historical averages

## Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.4 (local or MongoDB Atlas)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/delhi_bus
   PORT=4000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   AGGREGATION_ENABLED=true
   AGGREGATION_CRON_SCHEDULE=0 2 * * 0
   ```

   For MongoDB Atlas (cloud):
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/delhi_bus
   ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB:
   mongod
   
   # Or use MongoDB Atlas (cloud) - no local setup needed
   ```

4. **Initialize database (optional - indexes are created automatically):**
   ```bash
   npm run init-db
   ```

5. **Run the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Run weekly aggregation (optional):**
   ```bash
   npm run aggregate
   ```

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Crowding Reports
- `POST /api/crowding-report` - Submit a new crowding report
  ```json
  {
    "bus_id": "DL1PC1234",
    "route_id": "534",
    "stop_id": "STOP001",
    "crowd_level": 2,
    "source": "user"
  }
  ```

### Crowd Scores
- `GET /api/crowd-score?bus_id=DL1PC1234&route_id=534&time=2024-01-15T08:30:00Z` - Get crowd score for a bus
- `GET /api/crowd-score/:bus_id/reports?limit=50` - Get recent reports for a bus

## Crowd Score Algorithm

The crowd score is calculated using a weighted average:

- **50%** Historical average (route/time-slot/weekday)
- **30%** Recent user reports (last 15 minutes)
- **20%** Latest driver report

Score categories:
- **Low**: ≤ 1.5
- **Medium**: 1.5 < score < 2.5
- **High**: ≥ 2.5

## Database Schema

### Collections

**crowdingreports** - Individual crowd reports
- `bus_id`, `route_id`, `stop_id`, `crowd_level`, `source`, `timestamp`

**crowdinghistories** - Aggregated historical averages
- `route_id`, `time_slot`, `weekday`, `avg_crowd`, `sample_count`

## Project Structure

```
backend/
├── src/
│   ├── app.js          # Main Express app
│   ├── db.js           # MongoDB connection
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Validation middleware
│   ├── utils/          # Utility functions
│   └── jobs/           # Background jobs
└── package.json
```

## Development

- Use `npm run dev` for development with auto-reload
- Check `/health` endpoint to verify database connection
- Logs include detailed error messages in development mode

## License

MIT
