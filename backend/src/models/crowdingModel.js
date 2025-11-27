// crowdingModel.js - Database access functions for crowding data (MongoDB)
const CrowdingReport = require('./CrowdingReport');
const CrowdingHistory = require('./CrowdingHistory');

/**
 * Insert a new crowding report
 * @param {Object} params - Report parameters
 * @param {string} params.bus_id - Bus identifier
 * @param {string} params.route_id - Route identifier
 * @param {string|null} params.stop_id - Stop identifier (optional)
 * @param {number} params.crowd_level - Crowd level (1-3)
 * @param {string} params.source - Source of report ('user', 'driver', 'auto')
 * @returns {Promise<Object>} Inserted report document
 */
async function insertReport({ bus_id, route_id, stop_id, crowd_level, source }) {
  const report = new CrowdingReport({
    bus_id,
    route_id,
    stop_id: stop_id || null,
    crowd_level: Number(crowd_level),
    source,
    timestamp: new Date()
  });
  
  const saved = await report.save();
  return saved.toObject();
}

/**
 * Get historical average crowd level for a route/time-slot/weekday
 * @param {string} route_id - Route identifier
 * @param {string} time_slot - Time slot string (e.g., '08:00-08:30')
 * @param {number} weekday - Weekday (0=Monday, 6=Sunday)
 * @returns {Promise<number|null>} Average crowd level or null if not found
 */
async function getHistoricalAvg(route_id, time_slot, weekday) {
  const history = await CrowdingHistory.findOne({
    route_id,
    time_slot,
    weekday
  });
  
  return history ? parseFloat(history.avg_crowd) : null;
}

/**
 * Get recent user-reported average for a specific bus
 * @param {string} bus_id - Bus identifier
 * @param {number} minutesWindow - Time window in minutes (default: 15)
 * @returns {Promise<number|null>} Average crowd level or null if no reports
 */
async function getRecentUserAvg(bus_id, minutesWindow = 15) {
  const cutoffTime = new Date(Date.now() - minutesWindow * 60 * 1000);
  
  const result = await CrowdingReport.aggregate([
    {
      $match: {
        bus_id,
        source: 'user',
        timestamp: { $gte: cutoffTime }
      }
    },
    {
      $group: {
        _id: null,
        avg_user: { $avg: '$crowd_level' }
      }
    }
  ]);
  
  if (result.length > 0 && result[0].avg_user !== null) {
    return Math.round(result[0].avg_user * 100) / 100; // Round to 2 decimal places
  }
  
  return null;
}

/**
 * Get the latest driver report for a bus
 * @param {string} bus_id - Bus identifier
 * @returns {Promise<number|null>} Latest driver-reported crowd level or null
 */
async function getLatestDriverReport(bus_id) {
  const report = await CrowdingReport.findOne({
    bus_id,
    source: 'driver'
  })
    .sort({ timestamp: -1 })
    .limit(1)
    .lean();
  
  return report ? parseInt(report.crowd_level, 10) : null;
}

/**
 * Insert or update historical aggregation data
 * Used by the weekly aggregation job
 * @param {string} route_id - Route identifier
 * @param {string} time_slot - Time slot string
 * @param {number} weekday - Weekday (0-6)
 * @param {number} avg_crowd - Average crowd level
 * @param {number} sample_count - Number of samples
 * @returns {Promise<void>}
 */
async function insertOrUpdateHistory(route_id, time_slot, weekday, avg_crowd, sample_count) {
  await CrowdingHistory.findOneAndUpdate(
    {
      route_id,
      time_slot,
      weekday
    },
    {
      route_id,
      time_slot,
      weekday,
      avg_crowd: parseFloat(avg_crowd),
      sample_count: parseInt(sample_count, 10),
      updated_at: new Date()
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

/**
 * Get all reports for a bus (for debugging/admin)
 * @param {string} bus_id - Bus identifier
 * @param {number} limit - Maximum number of reports to return
 * @returns {Promise<Array>} Array of report objects
 */
async function getBusReports(bus_id, limit = 50) {
  const reports = await CrowdingReport.find({ bus_id })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  
  return reports;
}

module.exports = {
  insertReport,
  getHistoricalAvg,
  getRecentUserAvg,
  getLatestDriverReport,
  insertOrUpdateHistory,
  getBusReports
};
