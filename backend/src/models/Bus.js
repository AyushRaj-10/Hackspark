// Bus.js - Mongoose schema for bus metadata (optional)
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  bus_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  route_id: {
    type: String,
    index: true
  },
  vehicle_number: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;

