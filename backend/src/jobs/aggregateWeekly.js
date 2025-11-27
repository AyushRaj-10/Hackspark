// aggregateWeekly.js - Weekly aggregation job (MongoDB)
// Aggregates crowding_reports into crowding_history for historical averages
// Usage: node src/jobs/aggregateWeekly.js

require('dotenv').config();
const db = require('../db');
const model = require('../models/crowdingModel');
const CrowdingReport = require('../models/CrowdingReport');
const { getTimeSlot, getWeekday } = require('../utils/timeSlot');

/**
 * Helper to create time slot string from hour and minute
 * @param {number} hour - Hour (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {string} Time slot string (e.g., '08:00-08:30')
 */
function slotString(hour, minute) {
  const startMin = minute < 30 ? 0 : 30;
  const endHour = minute < 30 ? hour : (hour + 1) % 24;
  const endMin = minute < 30 ? 30 : 0;
  
  const startStr = `${String(hour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
  const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  
  return `${startStr}-${endStr}`;
}

/**
 * Convert JavaScript weekday (0=Sunday) to our system (0=Monday)
 * @param {number} jsDay - JavaScript weekday (0-6)
 * @returns {number} Our weekday (0=Monday, 6=Sunday)
 */
function convertWeekday(jsDay) {
  return (jsDay + 6) % 7; // Sunday=0 -> 6, Monday=1 -> 0, etc.
}

/**
 * Run the aggregation process
 */
async function runAggregation() {
  console.log('Starting weekly aggregation...');
  const startTime = Date.now();
  
  try {
    // Wait for MongoDB connection
    if (db.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        db.connection.once('connected', resolve);
      });
    }
    
    // Get all distinct routes
    const routes = await CrowdingReport.distinct('route_id');
    console.log(`Found ${routes.length} routes to aggregate`);
    
    let totalAggregations = 0;
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
    
    for (const route_id of routes) {
      // Process reports in JavaScript for clarity
      const reports = await CrowdingReport.find({
        route_id,
        timestamp: { $gte: twelveWeeksAgo }
      }).lean();
      
      // Group by weekday and time slot
      const grouped = {};
      
      for (const report of reports) {
        const date = new Date(report.timestamp);
        const weekday = getWeekday(date);
        const time_slot = getTimeSlot(date);
        
        const key = `${weekday}-${time_slot}`;
        if (!grouped[key]) {
          grouped[key] = {
            weekday,
            time_slot,
            levels: []
          };
        }
        grouped[key].levels.push(report.crowd_level);
      }
      
      // Calculate averages and save
      for (const key in grouped) {
        const group = grouped[key];
        if (group.levels.length >= 3) {
          const avg_crowd = group.levels.reduce((a, b) => a + b, 0) / group.levels.length;
          const sample_count = group.levels.length;
          
          await model.insertOrUpdateHistory(
            route_id,
            group.time_slot,
            group.weekday,
            Math.round(avg_crowd * 100) / 100,
            sample_count
          );
          
          totalAggregations++;
        }
      }
      
      console.log(`  ✓ Aggregated route ${route_id}: ${Object.keys(grouped).length} time slots`);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Aggregation complete!`);
    console.log(`   Routes processed: ${routes.length}`);
    console.log(`   Total aggregations: ${totalAggregations}`);
    console.log(`   Duration: ${duration}s`);
    
    await db.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Aggregation error:', err);
    await db.connection.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAggregation();
}

module.exports = { runAggregation };
