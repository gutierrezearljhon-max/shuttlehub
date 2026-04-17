const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Court = require('../models/Court');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ status: 'in-progress' });
    const totalMatches = await Match.countDocuments();
    const completedMatches = await Match.countDocuments({ status: 'completed' });
    const totalCourts = await Court.countDocuments();
    
    // Calculate revenue (sum of tournament entry fees)
    const tournaments = await Tournament.find({});
    const revenue = tournaments.reduce((sum, t) => sum + (t.entryFee || 0), 0);
    
    // Get user distribution by role
    const admins = await User.countDocuments({ role: 'admin' });
    const organizers = await User.countDocuments({ role: 'organizer' });
    const players = await User.countDocuments({ role: 'player' });
    
    res.json({
      totalUsers,
      activeTournaments,
      totalMatches,
      completedMatches,
      totalCourts,
      revenue,
      userDistribution: [
        { name: 'Admins', value: admins },
        { name: 'Organizers', value: organizers },
        { name: 'Players', value: players }
      ],
      monthlyGrowth: await getMonthlyGrowth(),
      recentActivities: await getRecentActivitiesList()
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user growth data
// @route   GET /api/admin/reports/users
// @access  Private/Admin
exports.getUserGrowth = async (req, res) => {
  try {
    const growth = await getUserGrowthData();
    res.json(growth);
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tournament statistics
// @route   GET /api/admin/reports/tournaments
// @access  Private/Admin
exports.getTournamentStats = async (req, res) => {
  try {
    const tournaments = await Tournament.find({});
    
    const byFormat = {
      'single-elimination': tournaments.filter(t => t.format === 'single-elimination').length,
      'round-robin': tournaments.filter(t => t.format === 'round-robin').length,
      'group-stage': tournaments.filter(t => t.format === 'group-stage').length
    };
    
    const byStatus = {
      registration: tournaments.filter(t => t.status === 'registration').length,
      'in-progress': tournaments.filter(t => t.status === 'in-progress').length,
      completed: tournaments.filter(t => t.status === 'completed').length,
      cancelled: tournaments.filter(t => t.status === 'cancelled').length
    };
    
    const byCategory = {
      singles: tournaments.filter(t => t.category === 'singles').length,
      doubles: tournaments.filter(t => t.category === 'doubles').length,
      'mixed-doubles': tournaments.filter(t => t.category === 'mixed-doubles').length
    };
    
    res.json({
      totalTournaments: tournaments.length,
      byFormat,
      byStatus,
      byCategory,
      averagePlayers: tournaments.reduce((sum, t) => sum + (t.currentPlayers || 0), 0) / (tournaments.length || 1),
      completionRate: (tournaments.filter(t => t.status === 'completed').length / (tournaments.length || 1)) * 100
    });
  } catch (error) {
    console.error('Get tournament stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue report
// @route   GET /api/admin/reports/revenue
// @access  Private/Admin
exports.getRevenueReport = async (req, res) => {
  try {
    const tournaments = await Tournament.find({});
    
    const totalRevenue = tournaments.reduce((sum, t) => sum + (t.entryFee || 0), 0);
    const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0);
    
    // Revenue by month
    const revenueByMonth = {};
    tournaments.forEach(tournament => {
      const month = new Date(tournament.createdAt).toLocaleString('default', { month: 'short' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (tournament.entryFee || 0);
    });
    
    const monthlyData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }));
    
    res.json({
      totalRevenue,
      totalPrizePool,
      netRevenue: totalRevenue - totalPrizePool,
      monthlyRevenue: monthlyData,
      averageEntryFee: totalRevenue / (tournaments.length || 1)
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular categories
// @route   GET /api/admin/reports/categories
// @access  Private/Admin
exports.getPopularCategories = async (req, res) => {
  try {
    const tournaments = await Tournament.find({});
    
    const categoryCount = {
      singles: tournaments.filter(t => t.category === 'singles').length,
      doubles: tournaments.filter(t => t.category === 'doubles').length,
      'mixed-doubles': tournaments.filter(t => t.category === 'mixed-doubles').length
    };
    
    const popularCategories = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));
    
    res.json(popularCategories);
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/reports/activities
// @access  Private/Admin
exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await getRecentActivitiesList();
    res.json(activities);
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
async function getMonthlyGrowth() {
  const users = await User.find({});
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyData = months.map(month => ({
    month,
    users: 0,
    matches: 0
  }));
  
  users.forEach(user => {
    const monthIndex = new Date(user.createdAt).getMonth();
    if (monthlyData[monthIndex]) {
      monthlyData[monthIndex].users++;
    }
  });
  
  const matches = await Match.find({});
  matches.forEach(match => {
    const monthIndex = new Date(match.createdAt || match.completedAt || Date.now()).getMonth();
    if (monthlyData[monthIndex]) {
      monthlyData[monthIndex].matches++;
    }
  });
  
  return monthlyData;
}

async function getUserGrowthData() {
  const users = await User.find({});
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const growth = months.map(month => ({
    month,
    users: 0
  }));
  
  users.forEach(user => {
    const monthIndex = new Date(user.createdAt).getMonth();
    if (growth[monthIndex]) {
      growth[monthIndex].users++;
    }
  });
  
  return growth;
}

async function getRecentActivitiesList() {
  const activities = [];
  
  // Get recent user registrations
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
  recentUsers.forEach(user => {
    activities.push({
      description: `New user registered: ${user.name}`,
      user: user.name,
      timestamp: user.createdAt,
      status: 'success'
    });
  });
  
  // Get recent tournaments
  const recentTournaments = await Tournament.find().sort({ createdAt: -1 }).limit(5);
  recentTournaments.forEach(tournament => {
    activities.push({
      description: `New tournament created: ${tournament.name}`,
      user: tournament.organizer?.name || 'Unknown',
      timestamp: tournament.createdAt,
      status: 'success'
    });
  });
  
  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return activities.slice(0, 10);
}