// Route.js - Mongoose schema for route metadata (optional)
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  route_name: {
    type: String
  },
  start_stop: {
    type: String
  },
  end_stop: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;

