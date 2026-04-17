const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const User = require('../models/User');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({})
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('players.user', 'name email skillLevel')
      .populate('matches');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private/Admin/Organizer
exports.createTournament = async (req, res) => {
  try {
    const tournament = new Tournament({
      ...req.body,
      organizer: req.user.id
    });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Organizer/Admin
exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const { name, format, category, startDate, endDate, venue, maxPlayers, entryFee, prizePool } = req.body;
    
    tournament.name = name || tournament.name;
    tournament.format = format || tournament.format;
    tournament.category = category || tournament.category;
    tournament.startDate = startDate || tournament.startDate;
    tournament.endDate = endDate || tournament.endDate;
    tournament.venue = venue || tournament.venue;
    tournament.maxPlayers = maxPlayers || tournament.maxPlayers;
    tournament.entryFee = entryFee !== undefined ? entryFee : tournament.entryFee;
    tournament.prizePool = prizePool !== undefined ? prizePool : tournament.prizePool;
    
    const updatedTournament = await tournament.save();
    res.json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Also delete all associated matches
    await Match.deleteMany({ tournament: tournament._id });
    await tournament.deleteOne();
    
    res.json({ message: 'Tournament deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register player for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private/Player
exports.registerPlayer = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Tournament is not open for registration' });
    }
    
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is full' });
    }
    
    // Check if already registered
    const alreadyRegistered = tournament.players.some(
      p => p.user.toString() === req.user.id
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this tournament' });
    }
    
    tournament.players.push({
      user: req.user.id,
      registrationDate: new Date(),
      status: 'confirmed'
    });
    tournament.currentPlayers++;
    
    await tournament.save();
    res.json({ message: 'Successfully registered', tournament });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unregister from tournament
// @route   DELETE /api/tournaments/:id/unregister
// @access  Private/Player
exports.unregisterPlayer = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Cannot unregister after registration period' });
    }
    
    const playerIndex = tournament.players.findIndex(
      p => p.user.toString() === req.user.id
    );
    
    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Not registered for this tournament' });
    }
    
    tournament.players.splice(playerIndex, 1);
    tournament.currentPlayers--;
    
    await tournament.save();
    res.json({ message: 'Successfully unregistered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get registered players
// @route   GET /api/tournaments/:id/players
// @access  Private
exports.getRegisteredPlayers = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('players.user', 'name email skillLevel stats');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament.players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate bracket
// @route   POST /api/tournaments/:id/generate-bracket
// @access  Private/Organizer/Admin
exports.generateBracket = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('players.user');
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.players.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 players to generate bracket' });
    }
    
    // Shuffle players for seeding
    const players = tournament.players.map(p => p.user._id);
    const shuffled = players.sort(() => 0.5 - Math.random());
    
    // Create bracket rounds
    const rounds = [];
    const numRounds = Math.ceil(Math.log2(shuffled.length));
    let roundMatches = [];
    let matchNumber = 1;
    
    // First round matches
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        roundMatches.push({
          matchNumber: matchNumber++,
          player1: shuffled[i],
          player2: shuffled[i + 1],
          player1Score: 0,
          player2Score: 0
        });
      } else {
        // Bye - player automatically advances
        roundMatches.push({
          matchNumber: matchNumber++,
          player1: shuffled[i],
          player2: null,
          player1Score: 0,
          player2Score: 0,
          walkover: true
        });
      }
    }
    
    rounds.push({ roundNumber: 1, matches: roundMatches });
    tournament.bracket = { rounds };
    tournament.status = 'in-progress';
    await tournament.save();
    
    // Create match documents
    for (const match of roundMatches) {
      const matchPlayers = [];
      if (match.player1) {
        matchPlayers.push({ user: match.player1 });
      }
      if (match.player2) {
        matchPlayers.push({ user: match.player2 });
      }
      
      await Match.create({
        tournament: tournament._id,
        round: 1,
        matchNumber: match.matchNumber,
        players: matchPlayers,
        status: match.walkover ? 'completed' : 'scheduled'
      });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tournament status
// @route   PUT /api/tournaments/:id/status
// @access  Private/Organizer/Admin
exports.updateTournamentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    tournament.status = status;
    await tournament.save();
    
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available tournaments for registration
// @route   GET /api/tournaments/available
// @access  Private
exports.getAvailableTournaments = async (req, res) => {
  try {
    const now = new Date();
    const tournaments = await Tournament.find({
      status: 'registration',
      startDate: { $gt: now }
    })
      .populate('organizer', 'name')
      .sort({ startDate: 1 });
    
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my tournaments
// @route   GET /api/tournaments/my-tournaments
// @access  Private
exports.getMyTournaments = async (req, res) => {
  try {
    let tournaments;
    
    if (req.user.role === 'organizer' || req.user.role === 'admin') {
      tournaments = await Tournament.find({ organizer: req.user.id })
        .populate('players.user', 'name')
        .sort({ createdAt: -1 });
    } else {
      tournaments = await Tournament.find({
        'players.user': req.user.id
      })
        .populate('organizer', 'name')
        .sort({ startDate: 1 });
    }
    
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};