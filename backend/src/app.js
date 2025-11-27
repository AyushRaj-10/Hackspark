// app.js - Main Express application
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crowdingRoutes = require('./routes/crowding');
const db = require('./db');

// Ensure MongoDB connection is established before starting server
db.connection.once('connected', () => {
  console.log('MongoDB ready for requests');
});

const app = express();

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

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await db.testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// API routes
app.use('/api', crowdingRoutes);

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

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`🚌 Delhi Bus Crowding API server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await db.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await db.connection.close();
  process.exit(0);
});

