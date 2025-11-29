// routes/crowding.js
import express from 'express';
// Assuming model, getTimeSlot, getWeekday, and validation are converted to ES modules:
import model from '../models/crowdingModel.js';
import { getTimeSlot, getWeekday } from '../utils/timeSlot.js';
import { validateCrowdingReport, validateCrowdScoreQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/crowding-report
 * Submit a new crowding report
 */
router.post('/crowding-report', validateCrowdingReport, async (req, res) => {
  try {
    const { bus_id, route_id, stop_id, crowd_level, source } = req.body;
    
    // Convert crowd_level to Number safely
    const level = Number(crowd_level);

    const row = await model.insertReport({ 
      bus_id: bus_id ? bus_id.trim() : null, 
      route_id: route_id ? route_id.trim() : null, 
      stop_id: stop_id ? stop_id.trim() : null, 
      crowd_level: level, 
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
 * * Algorithm: 50% historical + 30% recent users + 20% driver
 */
router.get('/crowd-score', validateCrowdScoreQuery, async (req, res) => {
  try {
    const { bus_id, route_id, time } = req.query;
    
    // Parse time or use current time
    const date = time ? new Date(time) : new Date();
    
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
    
    // Default fallbacks (neutral medium crowding: 2.0 on a 1-3 scale)
    const hist = historicalAvg !== null ? historicalAvg : 2.0;
    const usr = recentUserAvg !== null ? recentUserAvg : 2.0;
    const drv = driverLatest !== null ? driverLatest : 2.0;
    
    // Weighted formula
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

// 🚨 FIX: Change to ES Module default export
export default router;