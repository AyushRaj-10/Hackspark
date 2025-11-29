// server.js
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

// --- Load Configuration ---
dotenv.config();

// --- Import Routes (FIXED: All routes now use default import syntax) ---
import bookingRoutes from './routes/booking.js';    // ✅ Correct for export default router; 
import feedbackRoutes from './routes/feedback.js';
import crowdingRoutes from './routes/crowding.js';  // This one likely uses default export
import connectDB from './config/db.js';          // Database Connect Function

const app = express();

// --- 1. Database Connection & Setup ---

// Ensure connectDB returns the Mongoose connection object/promise
const dbConnection = connectDB(); 

// Log MongoDB connection status (Replicating Crowding API behavior)


// --- 2. Middleware & CORS Configuration ---

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : '*',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// --- 3. Health Checks and Base Route ---

// Combined Health check endpoint
app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    
    // Check Mongoose connection state
    if (mongoose.connection.readyState === 1) {
        dbStatus = 'connected';
    } else if (mongoose.connection.readyState === 2) {
        dbStatus = 'connecting';
    }

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStatus
    });
});

// Vartamaan Gati Base Route
app.get('/', (req, res) => {
    res.send('Vartamaan Gati API is Running! 🚀');
});


// --- 4. API Routes ---

// Delhi Crowding Routes
app.use('/api', crowdingRoutes); // Mounted at /api, assumes crowdingRoutes contains full path handling

// Vartamaan Gati Routes (Ticket Booking and Feedback)
app.use('/api/booking', bookingRoutes); 
app.use('/api/feedback', feedbackRoutes); 


// --- 5. Error Handlers ---

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        path: req.path 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// --- 6. Server Startup and Graceful Shutdown ---

const PORT = process.env.PORT || 4000; 

// Start server
const server = app.listen(PORT, () => {
    console.log(`\n\x1b[34m🚌 Unified Mobility API server listening on port ${PORT}\x1b[0m`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n${signal} received, closing server...`);
    
    server.close(async () => {
        await mongoose.connection.close();
        console.log('Server and database connections closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));