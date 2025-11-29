// CrowdingHistory.js - Mongoose schema for historical aggregation data (ES Module Conversion)

// 🚨 FIX 1: Change CommonJS require to ES Module import
import mongoose from 'mongoose';

const crowdingHistorySchema = new mongoose.Schema({
  route_id: {
    type: String,
    required: true,
    index: true
  },
  time_slot: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(v);
      },
      message: 'time_slot must be in format HH:MM-HH:MM'
    }
  },
  weekday: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
    validate: {
      validator: Number.isInteger,
      message: 'weekday must be an integer between 0 and 6'
    }
  },
  avg_crowd: {
    type: Number,
    required: true,
    min: 1.0,
    max: 3.0
  },
  sample_count: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  // NOTE: timestamps: true in the options handles created_at and updated_at automatically
}, {
  timestamps: true // This option simplifies created_at and updated_at fields
});

// Unique compound index for route_id, time_slot, and weekday
crowdingHistorySchema.index({ route_id: 1, time_slot: 1, weekday: 1 }, { unique: true });
crowdingHistorySchema.index({ route_id: 1, weekday: 1, time_slot: 1 });

const CrowdingHistory = mongoose.model('CrowdingHistory', crowdingHistorySchema);

// 🚨 FIX 2: Replace module.exports = CrowdingHistory with default export
export default CrowdingHistory;