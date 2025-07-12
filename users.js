const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats
    const questions = await Question.countDocuments({ author: req.params.id, status: 'active' });
    const answers = await Answer.countDocuments({ author: req.params.id, status: 'active' });
    const acceptedAnswers = await Answer.countDocuments({ author: req.params.id, isAccepted: true });

    const profile = {
      ...user.toObject(),
      stats: {
        questions,
        answers,
        acceptedAnswers
      }
    };

    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user questions
router.get('/:id/questions', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ 
      author: req.params.id, 
      status: 'active' 
    })
    .populate('author', 'username avatar reputation')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Question.countDocuments({ 
      author: req.params.id, 
      status: 'active' 
    });

    res.json({
      questions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user answers
router.get('/:id/answers', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ 
      author: req.params.id, 
      status: 'active' 
    })
    .populate('question', 'title')
    .populate('author', 'username avatar reputation')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Answer.countDocuments({ 
      author: req.params.id, 
      status: 'active' 
    });

    res.json({
      answers,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Ban user
router.put('/admin/:id/ban', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = true;
    user.banReason = reason || 'Violation of platform policies';
    await user.save();

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Unban user
router.put('/admin/:id/unban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = '';
    await user.save();

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Change user role
router.put('/admin/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 