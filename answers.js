const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create answer
router.post('/', auth, [
  body('content').isLength({ min: 10 }).withMessage('Answer must be at least 10 characters'),
  body('questionId').notEmpty().withMessage('Question ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId, images } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Process mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    const mentionMatches = content.match(mentionRegex);
    
    if (mentionMatches) {
      for (const match of mentionMatches) {
        const username = match.substring(1);
        const user = await require('../models/User').findOne({ username });
        if (user) {
          mentions.push(user._id);
        }
      }
    }

    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId,
      images: images || [],
      mentions
    });

    await answer.save();

    // Send notification to question author
    const notification = new Notification({
      recipient: question.author,
      sender: req.user._id,
      type: 'answer',
      title: 'New answer to your question',
      message: `${req.user.username} answered your question "${question.title}"`,
      relatedQuestion: questionId,
      relatedAnswer: answer._id,
      link: `/questions/${questionId}#answer-${answer._id}`
    });
    await notification.save();

    // Send notifications to mentioned users
    const io = req.app.get('io');
    for (const mentionId of mentions) {
      const mentionNotification = new Notification({
        recipient: mentionId,
        sender: req.user._id,
        type: 'mention',
        title: 'You were mentioned',
        message: `${req.user.username} mentioned you in an answer`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id,
        link: `/questions/${questionId}#answer-${answer._id}`
      });
      await mentionNotification.save();
      
      io.to(`user_${mentionId}`).emit('notification', mentionNotification);
    }

    // Emit to question author
    io.to(`user_${question.author}`).emit('notification', notification);

    res.status(201).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;

    if (voteType === 'upvote') {
      if (answer.votes.upvotes.includes(userId)) {
        answer.votes.upvotes = answer.votes.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        answer.votes.upvotes.push(userId);
        answer.votes.downvotes = answer.votes.downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (voteType === 'downvote') {
      if (answer.votes.downvotes.includes(userId)) {
        answer.votes.downvotes = answer.votes.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        answer.votes.downvotes.push(userId);
        answer.votes.upvotes = answer.votes.upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await answer.save();
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Unaccept previously accepted answer
    await Answer.updateMany(
      { question: answer.question, isAccepted: true },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update question
    question.acceptedAnswer = answer._id;
    await question.save();

    // Send notification to answer author
    const notification = new Notification({
      recipient: answer.author,
      sender: req.user._id,
      type: 'accept',
      title: 'Your answer was accepted',
      message: `${req.user.username} accepted your answer`,
      relatedQuestion: question._id,
      relatedAnswer: answer._id,
      link: `/questions/${question._id}#answer-${answer._id}`
    });
    await notification.save();

    const io = req.app.get('io');
    io.to(`user_${answer.author}`).emit('notification', notification);

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update answer
router.put('/:id', auth, [
  body('content').isLength({ min: 10 }).withMessage('Answer must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    answer.content = req.body.content;
    await answer.save();

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    answer.status = 'deleted';
    await answer.save();

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 