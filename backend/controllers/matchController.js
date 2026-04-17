const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private/Admin/Organizer
exports.getMatches = async (req, res) => {
  try {
    const { status, tournament, court } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (tournament) filter.tournament = tournament;
    if (court) filter.court = court;
    
    const matches = await Match.find(filter)
      .populate('players.user', 'name email skillLevel')
      .populate('tournament', 'name')
      .populate('court', 'name location')
      .sort({ scheduledTime: 1 });
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('players.user', 'name email skillLevel profileImage')
      .populate('tournament', 'name category')
      .populate('court', 'name location')
      .populate('winner', 'name');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my matches
// @route   GET /api/matches/my-matches
// @access  Private
exports.getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      'players.user': req.user.id
    })
      .populate('players.user', 'name email')
      .populate('tournament', 'name')
      .populate('court', 'name')
      .sort({ scheduledTime: 1 });
    
    // Separate upcoming and completed matches
    const now = new Date();
    const upcoming = matches.filter(m => 
      m.status === 'scheduled' && new Date(m.scheduledTime) > now
    );
    const completed = matches.filter(m => 
      m.status === 'completed'
    );
    const inProgress = matches.filter(m => 
      m.status === 'in-progress'
    );
    
    res.json({
      upcoming,
      inProgress,
      completed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tournament matches
// @route   GET /api/matches/tournament/:tournamentId
// @access  Private
exports.getTournamentMatches = async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('players.user', 'name')
      .populate('court', 'name')
      .sort({ round: 1, matchNumber: 1 });
    
    // Group by round
    const groupedByRound = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {});
    
    res.json({
      tournamentId: req.params.tournamentId,
      rounds: groupedByRound,
      totalMatches: matches.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match score
// @route   PUT /api/matches/:id/score
// @access  Private/Organizer/Admin
exports.updateMatchScore = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const { scores, currentSet } = req.body;
    
    // Update scores
    if (scores) {
      match.scores = scores;
    }
    
    // Check if match is complete (best of 3)
    let setsWon = [0, 0];
    match.scores.forEach(score => {
      if (score.set1) {
        if (score.set1.player1 > score.set1.player2) setsWon[0]++;
        else if (score.set1.player2 > score.set1.player1) setsWon[1]++;
      }
      if (score.set2) {
        if (score.set2.player1 > score.set2.player2) setsWon[0]++;
        else if (score.set2.player2 > score.set2.player1) setsWon[1]++;
      }
      if (score.set3) {
        if (score.set3.player1 > score.set3.player2) setsWon[0]++;
        else if (score.set3.player2 > score.set3.player1) setsWon[1]++;
      }
    });
    
    if (setsWon[0] >= 2) {
      match.status = 'completed';
      match.winner = match.players[0].user;
      match.completedAt = new Date();
      
      // Update player stats
      await updatePlayerStats(match.players[0].user, match.players[1].user, true);
    } else if (setsWon[1] >= 2) {
      match.status = 'completed';
      match.winner = match.players[1].user;
      match.completedAt = new Date();
      
      await updatePlayerStats(match.players[1].user, match.players[0].user, true);
    }
    
    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update player stats
async function updatePlayerStats(winnerId, loserId, isComplete) {
  if (!isComplete) return;
  
  const winner = await User.findById(winnerId);
  const loser = await User.findById(loserId);
  
  // Update match counts
  winner.stats.matchesPlayed += 1;
  winner.stats.matchesWon += 1;
  loser.stats.matchesPlayed += 1;
  
  // ELO rating calculation (simplified)
  const expectedWinner = 1 / (1 + Math.pow(10, (loser.stats.rating - winner.stats.rating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winner.stats.rating - loser.stats.rating) / 400));
  
  const K = 32; // K-factor
  winner.stats.rating += K * (1 - expectedWinner);
  loser.stats.rating += K * (0 - expectedLoser);
  
  await winner.save();
  await loser.save();
}

// @desc    Complete match
// @route   PUT /api/matches/:id/complete
// @access  Private/Organizer/Admin
exports.completeMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    match.status = 'completed';
    match.completedAt = new Date();
    
    // Determine winner if not set
    if (!match.winner) {
      let setsWon = [0, 0];
      match.scores.forEach(score => {
        if (score.set1 && score.set1.player1 > score.set1.player2) setsWon[0]++;
        else if (score.set1 && score.set1.player2 > score.set1.player1) setsWon[1]++;
        if (score.set2 && score.set2.player1 > score.set2.player2) setsWon[0]++;
        else if (score.set2 && score.set2.player2 > score.set2.player1) setsWon[1]++;
        if (score.set3 && score.set3.player1 > score.set3.player2) setsWon[0]++;
        else if (score.set3 && score.set3.player2 > score.set3.player1) setsWon[1]++;
      });
      
      match.winner = setsWon[0] > setsWon[1] ? match.players[0].user : match.players[1].user;
      
      // Update stats
      await updatePlayerStats(match.winner, 
        match.winner.toString() === match.players[0].user.toString() ? match.players[1].user : match.players[0].user,
        true
      );
    }
    
    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Schedule match
// @route   POST /api/matches/schedule
// @access  Private/Organizer/Admin
exports.scheduleMatch = async (req, res) => {
  try {
    const { tournament, round, matchNumber, players, scheduledTime, court } = req.body;
    
    const match = await Match.create({
      tournament,
      round,
      matchNumber,
      players: players.map(p => ({ user: p })),
      scheduledTime,
      court,
      status: 'scheduled'
    });
    
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match status
// @route   PUT /api/matches/:id/status
// @access  Private/Organizer/Admin
exports.updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    match.status = status;
    if (status === 'in-progress') {
      // Update court status to occupied
      if (match.court) {
        const Court = require('../models/Court');
        await Court.findByIdAndUpdate(match.court, { status: 'occupied', currentMatch: match._id });
      }
    } else if (status === 'completed') {
      match.completedAt = new Date();
      if (match.court) {
        const Court = require('../models/Court');
        await Court.findByIdAndUpdate(match.court, { status: 'available', currentMatch: null });
      }
    }
    
    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};