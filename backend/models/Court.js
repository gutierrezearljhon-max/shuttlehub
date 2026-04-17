const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: String,
  location: String,
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  currentMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  queue: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: Date,
    party: [mongoose.Schema.Types.ObjectId] // For doubles teams
  }],
  settings: {
    maxQueueSize: { type: Number, default: 20 },
    gameDuration: { type: Number, default: 15 }, // minutes
    rotationType: { type: String, enum: ['standard', 'winner-stays'], default: 'standard' }
  }
});

module.exports = mongoose.model('Court', courtSchema);