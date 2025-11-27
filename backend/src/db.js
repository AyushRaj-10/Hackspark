// db.js - MongoDB connection using Mongoose
const mongoose = require('mongoose');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Mongoose connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, options)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Helper to test connection
async function testConnection() {
  try {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      return { connected: true, timestamp: new Date().toISOString() };
    } else {
      return { connected: false, state, error: 'Not connected' };
    }
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  mongoose,
  connection: mongoose.connection,
  testConnection
};
