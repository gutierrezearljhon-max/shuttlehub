const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  round: Number,
  matchNumber: Number,
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    winner: { type: Boolean, default: false }
  }],
  scores: [{
    set1: { player1: Number, player2: Number },
    set2: { player1: Number, player2: Number },
    set3: { player1: Number, player2: Number }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'walkover'],
    default: 'scheduled'
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  scheduledTime: Date,
  completedAt: Date
});

module.exports = mongoose.model('Match', matchSchema);