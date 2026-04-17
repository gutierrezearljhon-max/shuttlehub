const Court = require('../models/Court');

// @desc    Get all courts
// @route   GET /api/courts
// @access  Public
exports.getCourts = async (req, res) => {
  try {
    const courts = await Court.find({})
      .populate('currentMatch', 'round matchNumber')
      .populate('queue.user', 'name skillLevel');
    
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available courts
// @route   GET /api/courts/available
// @access  Public
exports.getAvailableCourts = async (req, res) => {
  try {
    const courts = await Court.find({ status: 'available' })
      .select('name location');
    
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get court by ID
// @route   GET /api/courts/:id
// @access  Public
exports.getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('currentMatch', 'round matchNumber players')
      .populate('queue.user', 'name skillLevel profileImage');
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    res.json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create court
// @route   POST /api/courts
// @access  Private/Admin/Organizer
exports.createCourt = async (req, res) => {
  try {
    const { name, location, settings } = req.body;
    
    const court = await Court.create({
      name,
      location,
      settings: settings || {
        maxQueueSize: 20,
        gameDuration: 15,
        rotationType: 'standard'
      }
    });
    
    res.status(201).json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update court
// @route   PUT /api/courts/:id
// @access  Private/Admin/Organizer
exports.updateCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    const { name, location, settings } = req.body;
    court.name = name || court.name;
    court.location = location || court.location;
    if (settings) court.settings = { ...court.settings, ...settings };
    
    const updatedCourt = await court.save();
    res.json(updatedCourt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete court
// @route   DELETE /api/courts/:id
// @access  Private/Admin
exports.deleteCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    await court.deleteOne();
    res.json({ message: 'Court removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update court status
// @route   PUT /api/courts/:id/status
// @access  Private/Admin/Organizer
exports.updateCourtStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    court.status = status;
    await court.save();
    
    res.json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};