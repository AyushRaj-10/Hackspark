// scheduler.js - Cron job scheduler for weekly aggregation
// This can be integrated into app.js if you want to run aggregation automatically

require('dotenv').config();
const cron = require('node-cron');
const { runAggregation } = require('./aggregateWeekly');

// Schedule weekly aggregation (default: Sunday at 2 AM)
// Format: minute hour day month weekday
const CRON_SCHEDULE = process.env.AGGREGATION_CRON_SCHEDULE || '0 2 * * 0';

if (process.env.AGGREGATION_ENABLED === 'true') {
  console.log(`📅 Scheduling weekly aggregation: ${CRON_SCHEDULE}`);
  
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log('⏰ Running scheduled weekly aggregation...');
    await runAggregation();
  });
  
  console.log('✅ Aggregation scheduler started');
} else {
  console.log('ℹ️  Aggregation scheduler disabled (set AGGREGATION_ENABLED=true to enable)');
}

module.exports = { runAggregation };

