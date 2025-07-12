const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { adminAuth } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const reportGenerator = require('../utils/reportGenerator');
const moment = require('moment');

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminAuth);

// Dashboard Analytics
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: moment().subtract(7, 'days').toDate() }
    });

    const recentQuestions = await Question.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    const topTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const analytics = {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalQuestions,
      totalAnswers,
      recentQuestions,
      topTags
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (status === 'banned') query.isBanned = true;
    if (status === 'active') query.isBanned = false;

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
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// Ban/Unban User
router.put('/users/:id/ban', [
  body('reason').notEmpty().withMessage('Ban reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = true;
    user.banReason = reason;
    await user.save();

    // Send email notification
    await emailService.sendEmail(
      user.email,
      'Account Banned - StackIt',
      `Your account has been banned for: ${reason}`,
      `Your account has been banned for: ${reason}`
    );

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to ban user' });
  }
});

router.put('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = '';
    await user.save();

    // Send email notification
    await emailService.sendEmail(
      user.email,
      'Account Unbanned - StackIt',
      'Your account has been unbanned. You can now access the platform again.',
      'Your account has been unbanned. You can now access the platform again.'
    );

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unban user' });
  }
});

// Change User Role
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Content Moderation
router.get('/content', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    let content;
    let total;

    if (type === 'questions' || !type) {
      content = await Question.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      total = await Question.countDocuments(query);
    } else if (type === 'answers') {
      content = await Answer.find(query)
        .populate('author', 'username')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      total = await Answer.countDocuments(query);
    }

    res.json({
      content,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load content' });
  }
});

// Delete Content
router.delete('/content/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'question') {
      await Question.findByIdAndUpdate(id, { status: 'deleted' });
      // Also delete related answers
      await Answer.updateMany({ question: id }, { status: 'deleted' });
    } else if (type === 'answer') {
      await Answer.findByIdAndUpdate(id, { status: 'deleted' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

// Send Platform Announcement
router.post('/announcements', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('sendEmail').isBoolean().withMessage('sendEmail must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, sendEmail } = req.body;

    // Create system notification for all users
    const users = await User.find({ isBanned: false });
    
    const notificationPromises = users.map(user => 
      new Notification({
        recipient: user._id,
        type: 'system',
        title,
        message,
        link: '/'
      }).save()
    );

    await Promise.all(notificationPromises);

    // Send email if requested
    if (sendEmail) {
      await emailService.sendAdminAnnouncement(users, { title, message });
    }

    res.json({ 
      message: 'Announcement sent successfully',
      recipients: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

// Generate Reports
router.get('/reports', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let reportPath;
    let analytics;

    switch (type) {
      case 'user-activity':
        reportPath = await reportGenerator.generateUserActivityReport(
          new Date(startDate),
          new Date(endDate)
        );
        break;

      case 'content':
        const contentReports = await reportGenerator.generateContentReport(
          new Date(startDate),
          new Date(endDate)
        );
        reportPath = contentReports;
        break;

      case 'analytics':
        const result = await reportGenerator.generateAnalyticsReport();
        analytics = result.analytics;
        reportPath = result.reportPath;
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({
      message: 'Report generated successfully',
      reportPath,
      analytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Download Report
router.get('/reports/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = `reports/${filename}`;
  
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'Report file not found' });
    }
  });
});

// Get System Statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: moment().subtract(7, 'days').toDate() }
    });

    const questionsThisWeek = await Question.countDocuments({
      createdAt: { $gte: moment().subtract(7, 'days').toDate() }
    });

    const answersThisWeek = await Answer.countDocuments({
      createdAt: { $gte: moment().subtract(7, 'days').toDate() }
    });

    const topTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const statistics = {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalQuestions,
      totalAnswers,
      questionsThisWeek,
      answersThisWeek,
      topTags
    };

    res.json({ statistics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load statistics' });
  }
});

module.exports = router; 