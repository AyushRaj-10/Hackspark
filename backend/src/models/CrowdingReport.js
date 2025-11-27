// CrowdingReport.js - Mongoose schema for crowding reports
const mongoose = require('mongoose');

const crowdingReportSchema = new mongoose.Schema({
  bus_id: {
    type: String,
    required: true,
    index: true
  },
  route_id: {
    type: String,
    required: true,
    index: true
  },
  stop_id: {
    type: String,
    default: null
  },
  crowd_level: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    validate: {
      validator: Number.isInteger,
      message: 'crowd_level must be an integer between 1 and 3'
    }
  },
  source: {
    type: String,
    required: true,
    enum: ['user', 'driver', 'auto'],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for performance
crowdingReportSchema.index({ bus_id: 1, timestamp: -1 });
crowdingReportSchema.index({ route_id: 1, timestamp: -1 });
crowdingReportSchema.index({ source: 1, timestamp: -1 });

const CrowdingReport = mongoose.model('CrowdingReport', crowdingReportSchema);

module.exports = CrowdingReport;

