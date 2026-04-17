const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  format: {
    type: String,
    enum: ['single-elimination', 'round-robin', 'double-elimination', 'group-stage'],
    required: true
  },
  category: {
    type: String,
    enum: ["men-singles", "women-singles", "men-doubles", "women-doubles", "mixed-doubles"],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  venue: String,
  maxPlayers: Number,
currentPlayers: { type: Number, default: 0 },
  entryFee: Number,
  prizePool: Number,
  status: {
    type: String,
    enum: ['registration', 'in-progress', 'completed', 'cancelled'],
    default: 'registration'
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrationDate: Date,
    seed: Number,
    status: { type: String, enum: ['pending', 'confirmed', 'withdrawn'], default: 'pending' }
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  bracket: {
    rounds: [{
      roundNumber: Number,
      matches: [mongoose.Schema.Types.Mixed]
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tournament', tournamentSchema);