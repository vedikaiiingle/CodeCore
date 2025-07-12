const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { auth, optionalAuth } = require('../middleware/auth');
const { getAllQuestions } = require('../controllers/questionController');

const router = express.Router();

// Get all questions with pagination and filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', tag, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'active' };
    let sortOption = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Tag filter
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    // Sort options
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { voteCount: -1 };
        break;
      case 'views':
        sortOption = { viewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar reputation')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

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

// Get single question with answers
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer');

    if (!question || question.status === 'deleted') {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.viewCount += 1;
    await question.save();

    // Get answers
    const answers = await Answer.find({ 
      question: req.params.id,
      status: 'active'
    })
    .populate('author', 'username avatar reputation')
    .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 });

    res.json({ question, answers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create question
router.post('/', auth, [
  body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be 10-200 characters'),
  body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('tags').isArray({ min: 1, max: 5 }).withMessage('Must have 1-5 tags')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags, images } = req.body;

    // Process mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    const mentionMatches = description.match(mentionRegex);
    
    if (mentionMatches) {
      for (const match of mentionMatches) {
        const username = match.substring(1);
        const user = await require('../models/User').findOne({ username });
        if (user) {
          mentions.push(user._id);
        }
      }
    }

    const question = new Question({
      title,
      description,
      tags: tags.map(tag => tag.toLowerCase()),
      author: req.user._id,
      images: images || [],
      mentions
    });

    await question.save();

    // Send notifications to mentioned users
    const io = req.app.get('io');
    for (const mentionId of mentions) {
      const notification = new Notification({
        recipient: mentionId,
        sender: req.user._id,
        type: 'mention',
        title: 'You were mentioned',
        message: `${req.user.username} mentioned you in a question`,
        relatedQuestion: question._id,
        link: `/questions/${question._id}`
      });
      await notification.save();
      
      io.to(`user_${mentionId}`).emit('notification', notification);
    }

    res.status(201).json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 10, max: 200 }),
  body('description').optional().isLength({ min: 20 }),
  body('tags').optional().isArray({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.tags) updates.tags = req.body.tags.map(tag => tag.toLowerCase());

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('author', 'username avatar reputation');

    res.json({ question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on question
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;

    if (voteType === 'upvote') {
      if (question.votes.upvotes.includes(userId)) {
        question.votes.upvotes = question.votes.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        question.votes.upvotes.push(userId);
        question.votes.downvotes = question.votes.downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (voteType === 'downvote') {
      if (question.votes.downvotes.includes(userId)) {
        question.votes.downvotes = question.votes.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        question.votes.downvotes.push(userId);
        question.votes.upvotes = question.votes.upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await question.save();
    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    question.status = 'deleted';
    await question.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 