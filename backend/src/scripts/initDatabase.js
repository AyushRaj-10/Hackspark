// initDatabase.js - Initialize MongoDB database with indexes
// Usage: node src/scripts/initDatabase.js

require('dotenv').config();
const db = require('../db');
const CrowdingReport = require('../models/CrowdingReport');
const CrowdingHistory = require('../models/CrowdingHistory');

async function initDatabase() {
  try {
    console.log('Initializing MongoDB database...');
    
    // Wait for connection
    if (db.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);
        
        db.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
    
    // Create indexes (Mongoose will create them automatically, but we can ensure they exist)
    console.log('Creating indexes...');
    
    await CrowdingReport.createIndexes();
    await CrowdingHistory.createIndexes();
    
    console.log('✅ Database initialized successfully!');
    console.log('   Indexes created for:');
    console.log('   - CrowdingReport (bus_id, route_id, source, timestamp)');
    console.log('   - CrowdingHistory (route_id, time_slot, weekday)');
    
    await db.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    await db.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };

