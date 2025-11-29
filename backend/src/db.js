// src/config/db.js - MongoDB connection using Mongoose (ES Module)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables here just in case server.js hasn't finished
dotenv.config();

/**
 * Initiates the MongoDB connection.
 * @returns {Promise<mongoose.Connection>} The Mongoose connection object.
 */
async function connectDB() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ ERROR: MONGODB_URI environment variable is not set in .env');
        process.exit(1);
    }

    // Mongoose connection options
    const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    try {
        // Attempt connection
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        // Return the connection instance for event handling in server.js
        return mongoose.connection; 
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        // Exit the process if the initial connection fails
        process.exit(1);
    }
}

// --- Graceful Shutdown Logic ---

// Listen for OS signals to close the connection gracefully
const handleShutdown = async (signal) => {
    console.log(`\n${signal} received. Closing Mongoose connection...`);
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));


// Export the function as the default export
export default connectDB;

// You can also export the connection object directly for access in other modules
// export const connection = mongoose.connection;