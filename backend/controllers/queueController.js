const Court = require('../models/Court');
const User = require('../models/User');

// @desc    Join queue
// @route   POST /api/queue/:courtId/join
// @access  Private
exports.joinQueue = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    // Check if court is full
    if (court.queue.length >= court.settings.maxQueueSize) {
      return res.status(400).json({ message: 'Queue is full' });
    }
    
    // Check if already in queue
    const alreadyInQueue = court.queue.some(q => q.user.toString() === req.user.id);
    if (alreadyInQueue) {
      return res.status(400).json({ message: 'Already in queue' });
    }
    
    // Add to queue
    court.queue.push({
      user: req.user.id,
      joinedAt: new Date(),
      party: req.body.party || [] // For team registration
    });
    
    await court.save();
    
    // Populate user details for response
    const populatedCourt = await Court.findById(req.params.courtId)
      .populate('queue.user', 'name skillLevel profileImage');
    
    res.status(201).json({
      message: 'Added to queue',
      position: court.queue.length,
      queue: populatedCourt.queue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave queue
// @route   DELETE /api/queue/:courtId/leave
// @access  Private
exports.leaveQueue = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    const initialLength = court.queue.length;
    court.queue = court.queue.filter(q => q.user.toString() !== req.user.id);
    
    if (court.queue.length === initialLength) {
      return res.status(404).json({ message: 'User not in queue' });
    }
    
    await court.save();
    res.json({ message: 'Removed from queue' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get queue status
// @route   GET /api/queue/:courtId/status
// @access  Private
exports.getQueueStatus = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId)
      .populate('queue.user', 'name skillLevel profileImage');
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    // Find user's position
    const userPosition = court.queue.findIndex(q => q.user._id.toString() === req.user.id);
    
    // Calculate estimated wait time (assuming 15 min per game)
    const estimatedWaitTime = userPosition !== -1 
      ? Math.ceil((userPosition + 1) / 4) * court.settings.gameDuration
      : null;
    
    res.json({
      courtId: court._id,
      courtName: court.name,
      queueSize: court.queue.length,
      maxSize: court.settings.maxQueueSize,
      currentGame: court.currentMatch,
      userPosition: userPosition !== -1 ? userPosition + 1 : null,
      estimatedWaitTime: estimatedWaitTime,
      queue: court.queue.map((q, index) => ({
        position: index + 1,
        user: q.user,
        joinedAt: q.joinedAt,
        waitTime: Math.floor((new Date() - new Date(q.joinedAt)) / 60000) // minutes
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get next players from queue
// @route   GET /api/queue/:courtId/next
// @access  Private
exports.getNextPlayers = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId)
      .populate('queue.user', 'name skillLevel profileImage');
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    // Get next 4 players (for doubles) or 2 (for singles)
    const gameType = req.query.type || 'doubles';
    const playersNeeded = gameType === 'doubles' ? 4 : 2;
    
    const nextPlayers = court.queue.slice(0, playersNeeded);
    
    if (nextPlayers.length < playersNeeded) {
      return res.json({
        available: false,
        message: `Need ${playersNeeded - nextPlayers.length} more players`,
        currentQueue: court.queue.length
      });
    }
    
    res.json({
      available: true,
      players: nextPlayers,
      gameType: gameType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rotate queue (after game completion)
// @route   PUT /api/queue/:courtId/rotate
// @access  Private
exports.rotateQueue = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    const { winners, gameType } = req.body;
    const playersPerGame = gameType === 'doubles' ? 4 : 2;
    
    if (court.settings.rotationType === 'winner-stays') {
      // Winners stay at the front, losers go to back
      const currentPlayers = court.queue.slice(0, playersPerGame);
      
      if (winners && winners.length > 0) {
        // Separate winners and losers
        const winnersList = currentPlayers.filter(p => winners.includes(p.user.toString()));
        const losersList = currentPlayers.filter(p => !winners.includes(p.user.toString()));
        
        // Remove all current players
        court.queue.splice(0, playersPerGame);
        
        // Add winners back to front (preserving their order)
        court.queue.unshift(...winnersList);
        
        // Add losers to back
        court.queue.push(...losersList);
      } else {
        // Default: all players go to back
        const rotated = court.queue.splice(0, playersPerGame);
        court.queue.push(...rotated);
      }
    } else {
      // Standard rotation: all players go to back
      const currentPlayers = court.queue.splice(0, playersPerGame);
      court.queue.push(...currentPlayers);
    }
    
    await court.save();
    
    const populatedCourt = await Court.findById(req.params.courtId)
      .populate('queue.user', 'name skillLevel');
    
    res.json({
      message: 'Queue rotated successfully',
      queue: populatedCourt.queue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear queue
// @route   DELETE /api/queue/:courtId/clear
// @access  Private
exports.clearQueue = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    court.queue = [];
    await court.save();
    
    res.json({ message: 'Queue cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update queue position (admin override)
// @route   PUT /api/queue/:courtId/position
// @access  Private
exports.updateQueuePosition = async (req, res) => {
  try {
    const { userId, newPosition } = req.body;
    const court = await Court.findById(req.params.courtId);
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    // Find user in queue
    const userIndex = court.queue.findIndex(q => q.user.toString() === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not in queue' });
    }
    
    // Remove user from current position
    const [user] = court.queue.splice(userIndex, 1);
    
    // Insert at new position
    court.queue.splice(newPosition - 1, 0, user);
    
    await court.save();
    res.json({ message: 'Queue position updated', newPosition });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get queue history
// @route   GET /api/queue/:courtId/history
// @access  Private
exports.getQueueHistory = async (req, res) => {
  try {
    // This would typically fetch from a separate QueueHistory model
    // For now, return current queue with timestamps
    const court = await Court.findById(req.params.courtId)
      .populate('queue.user', 'name');
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    const history = court.queue.map((q, index) => ({
      position: index + 1,
      user: q.user,
      joinedAt: q.joinedAt,
      waitTime: Math.floor((new Date() - new Date(q.joinedAt)) / 60000),
      status: index < 4 ? 'playing' : 'waiting'
    }));
    
    res.json({
      courtId: court._id,
      courtName: court.name,
      totalInQueue: court.queue.length,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};