const User = require('../models/User');
const Match = require('../models/Match');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstname, middlename, lastname, email, role, phoneNumber } = req.body;
    user.firstname = firstname || user.firstname;
    user.middlename = middlename || user.middlename;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstname: updatedUser.firstname,
      middlename: updatedUser.middlename,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, skillLevel, phoneNumber, profileImage } = req.body;
    
    // Update only provided fields
    if (firstname) user.firstname = firstname;
    if (middlename) user.middlename = middlename;
    if (lastname) user.lastname = lastname;
    // if (skillLevel) user.skillLevel = skillLevel;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();
    
    // Return user without password
    res.json({
      _id: updatedUser._id,
      firstname: updatedUser.firstname,
      middlename: updatedUser.middlename,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      role: updatedUser.role,
      // skillLevel: updatedUser.skillLevel,
      phoneNumber: updatedUser.phoneNumber,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'organizer', 'player'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();
    res.json({ message: 'User role updated successfully', role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get match history
    const matches = await Match.find({
      'players.user': userId,
      status: 'completed'
    }).populate('players.user', 'lastname');

    // Calculate detailed stats
    const totalMatches = matches.length;
    const wins = matches.filter(match => 
      match.winner && match.winner.toString() === userId
    ).length;
    
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    
    // Calculate ELO rating history (last 10 matches)
    const ratingHistory = [];
    let currentRating = user.stats.rating || 1200;
    
    matches.slice(-10).forEach(match => {
      ratingHistory.push({
        date: match.completedAt,
        rating: currentRating
      });
    });

    // Recent performance (last 5 matches)
    const recentPerformance = matches.slice(-5).map(match => ({
      date: match.completedAt,
      result: match.winner && match.winner.toString() === userId ? 'Win' : 'Loss',
      score: match.scores
    }));

    res.json({
      totalMatches,
      wins,
      losses: totalMatches - wins,
      winRate: winRate.toFixed(2),
      currentRating: user.stats.rating,
      ratingHistory,
      recentPerformance,
      tournamentsWon: user.stats.tournamentsWon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('name skillLevel stats rating profileImage')
      .sort('-stats.rating')
      .limit(50);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};