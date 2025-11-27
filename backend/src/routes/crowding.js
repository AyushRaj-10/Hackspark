// crowding.js - API routes for crowding reports and scores
const express = require('express');
const router = express.Router();
const model = require('../models/crowdingModel');
const { getTimeSlot, getWeekday } = require('../utils/timeSlot');
const { validateCrowdingReport, validateCrowdScoreQuery } = require('../middleware/validation');

/**
 * POST /api/crowding-report
 * Submit a new crowding report
 * Body: { bus_id, route_id, stop_id?, crowd_level (1|2|3), source: 'user'|'driver'|'auto' }
 */
router.post('/crowding-report', validateCrowdingReport, async (req, res) => {
  try {
    const { bus_id, route_id, stop_id, crowd_level, source } = req.body;
    
    const row = await model.insertReport({ 
      bus_id: bus_id.trim(), 
      route_id: route_id.trim(), 
      stop_id: stop_id ? stop_id.trim() : null, 
      crowd_level: Number(crowd_level), 
      source 
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Crowding report submitted successfully',
      data: row 
    });
  } catch (err) {
    console.error('Error inserting crowding report:', err);
    res.status(500).json({ 
      error: 'Failed to submit crowding report',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * GET /api/crowd-score
 * Get computed crowd score for a bus
 * Query params: bus_id, route_id, time? (ISO date string)
 * 
 * Returns computed crowd_score (numeric) and category (low/med/high)
 * 
 * Algorithm:
 * - Historical average (50% weight): Based on route/time-slot/weekday
 * - Recent user reports (30% weight): Average of user reports in last 15 minutes
 * - Latest driver report (20% weight): Most recent driver report
 */
router.get('/crowd-score', validateCrowdScoreQuery, async (req, res) => {
  try {
    const { bus_id, route_id, time } = req.query;
    
    // Parse time or use current time
    const date = time ? new Date(time) : new Date();
    
    // Validate date
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid time parameter. Use ISO 8601 format.' 
      });
    }
    
    // Calculate time slot and weekday
    const time_slot = getTimeSlot(date);
    const weekday = getWeekday(date);
    
    // Get all three components
    const [historicalAvg, recentUserAvg, driverLatest] = await Promise.all([
      model.getHistoricalAvg(route_id, time_slot, weekday),
      model.getRecentUserAvg(bus_id, 15),
      model.getLatestDriverReport(bus_id)
    ]);
    
    // Default fallbacks (neutral medium crowding)
    const hist = historicalAvg !== null ? historicalAvg : 2.0;
    const usr = recentUserAvg !== null ? recentUserAvg : 2.0;
    const drv = driverLatest !== null ? driverLatest : 2.0;
    
    // Weighted formula: 50% historical + 30% recent users + 20% driver
    const crowd_score = Math.round((0.5 * hist + 0.3 * usr + 0.2 * drv) * 100) / 100;
    
    // Categorize
    let category = 'medium';
    if (crowd_score <= 1.5) {
      category = 'low';
    } else if (crowd_score >= 2.5) {
      category = 'high';
    }
    
    res.json({
      bus_id,
      route_id,
      time_slot,
      weekday,
      timestamp: date.toISOString(),
      components: {
        historicalAvg: hist,
        recentUserAvg: usr,
        driverLatest: drv,
        weights: { historical: 0.5, recentUsers: 0.3, driver: 0.2 }
      },
      crowd_score,
      category
    });
  } catch (err) {
    console.error('Error computing crowd score:', err);
    res.status(500).json({ 
      error: 'Failed to compute crowd score',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * GET /api/crowd-score/:bus_id/reports
 * Get recent reports for a specific bus (for debugging/admin)
 */
router.get('/crowd-score/:bus_id/reports', async (req, res) => {
  try {
    const { bus_id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const reports = await model.getBusReports(bus_id, limit);
    
    res.json({
      bus_id,
      count: reports.length,
      reports
    });
  } catch (err) {
    console.error('Error fetching bus reports:', err);
    res.status(500).json({ 
      error: 'Failed to fetch reports',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;

