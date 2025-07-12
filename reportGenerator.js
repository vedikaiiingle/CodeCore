const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');

class ReportGenerator {
  constructor() {
    this.csvWriter = createCsvWriter({
      path: 'reports/',
      header: []
    });
  }

  async generateUserActivityReport(startDate, endDate) {
    try {
      const users = await User.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }).select('-password');

      const reportData = users.map(user => ({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        joinDate: moment(user.createdAt).format('YYYY-MM-DD'),
        lastSeen: moment(user.lastSeen).format('YYYY-MM-DD HH:mm:ss'),
        isBanned: user.isBanned,
        banReason: user.banReason || ''
      }));

      const csvWriter = createCsvWriter({
        path: `reports/user-activity-${moment().format('YYYY-MM-DD')}.csv`,
        header: [
          { id: 'userId', title: 'User ID' },
          { id: 'username', title: 'Username' },
          { id: 'email', title: 'Email' },
          { id: 'role', title: 'Role' },
          { id: 'reputation', title: 'Reputation' },
          { id: 'joinDate', title: 'Join Date' },
          { id: 'lastSeen', title: 'Last Seen' },
          { id: 'isBanned', title: 'Is Banned' },
          { id: 'banReason', title: 'Ban Reason' }
        ]
      });

      await csvWriter.writeRecords(reportData);
      return `reports/user-activity-${moment().format('YYYY-MM-DD')}.csv`;
    } catch (error) {
      console.error('❌ User activity report generation failed:', error);
      throw error;
    }
  }

  async generateContentReport(startDate, endDate) {
    try {
      const questions = await Question.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('author', 'username');

      const answers = await Answer.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('author', 'username').populate('question', 'title');

      const questionData = questions.map(q => ({
        questionId: q._id,
        title: q.title,
        author: q.author.username,
        tags: q.tags.join(', '),
        votes: q.votes.upvotes.length - q.votes.downvotes.length,
        views: q.viewCount,
        answers: q.answerCount || 0,
        isAccepted: q.acceptedAnswer ? 'Yes' : 'No',
        createdAt: moment(q.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        status: q.status
      }));

      const answerData = answers.map(a => ({
        answerId: a._id,
        questionTitle: a.question.title,
        author: a.author.username,
        votes: a.votes.upvotes.length - a.votes.downvotes.length,
        isAccepted: a.isAccepted ? 'Yes' : 'No',
        createdAt: moment(a.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        status: a.status
      }));

      // Write questions report
      const questionCsvWriter = createCsvWriter({
        path: `reports/questions-${moment().format('YYYY-MM-DD')}.csv`,
        header: [
          { id: 'questionId', title: 'Question ID' },
          { id: 'title', title: 'Title' },
          { id: 'author', title: 'Author' },
          { id: 'tags', title: 'Tags' },
          { id: 'votes', title: 'Votes' },
          { id: 'views', title: 'Views' },
          { id: 'answers', title: 'Answer Count' },
          { id: 'isAccepted', title: 'Has Accepted Answer' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'status', title: 'Status' }
        ]
      });

      // Write answers report
      const answerCsvWriter = createCsvWriter({
        path: `reports/answers-${moment().format('YYYY-MM-DD')}.csv`,
        header: [
          { id: 'answerId', title: 'Answer ID' },
          { id: 'questionTitle', title: 'Question Title' },
          { id: 'author', title: 'Author' },
          { id: 'votes', title: 'Votes' },
          { id: 'isAccepted', title: 'Is Accepted' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'status', title: 'Status' }
        ]
      });

      await Promise.all([
        questionCsvWriter.writeRecords(questionData),
        answerCsvWriter.writeRecords(answerData)
      ]);

      return {
        questions: `reports/questions-${moment().format('YYYY-MM-DD')}.csv`,
        answers: `reports/answers-${moment().format('YYYY-MM-DD')}.csv`
      };
    } catch (error) {
      console.error('❌ Content report generation failed:', error);
      throw error;
    }
  }

  async generateAnalyticsReport() {
    try {
      const totalUsers = await User.countDocuments();
      const totalQuestions = await Question.countDocuments();
      const totalAnswers = await Answer.countDocuments();
      const totalNotifications = await Notification.countDocuments();

      const activeUsers = await User.countDocuments({
        lastSeen: { $gte: moment().subtract(7, 'days').toDate() }
      });

      const bannedUsers = await User.countDocuments({ isBanned: true });
      const acceptedAnswers = await Answer.countDocuments({ isAccepted: true });

      const topTags = await Question.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const topUsers = await User.aggregate([
        { $sort: { reputation: -1 } },
        { $limit: 10 },
        { $project: { username: 1, reputation: 1, questions: 1, answers: 1 } }
      ]);

      const analytics = {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalQuestions,
        totalAnswers,
        acceptedAnswers,
        totalNotifications,
        topTags,
        topUsers,
        generatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
      };

      const csvWriter = createCsvWriter({
        path: `reports/analytics-${moment().format('YYYY-MM-DD')}.csv`,
        header: [
          { id: 'metric', title: 'Metric' },
          { id: 'value', title: 'Value' }
        ]
      });

      const analyticsData = [
        { metric: 'Total Users', value: totalUsers },
        { metric: 'Active Users (7 days)', value: activeUsers },
        { metric: 'Banned Users', value: bannedUsers },
        { metric: 'Total Questions', value: totalQuestions },
        { metric: 'Total Answers', value: totalAnswers },
        { metric: 'Accepted Answers', value: acceptedAnswers },
        { metric: 'Total Notifications', value: totalNotifications },
        { metric: 'Generated At', value: analytics.generatedAt }
      ];

      await csvWriter.writeRecords(analyticsData);

      return {
        analytics,
        reportPath: `reports/analytics-${moment().format('YYYY-MM-DD')}.csv`
      };
    } catch (error) {
      console.error('❌ Analytics report generation failed:', error);
      throw error;
    }
  }
}

module.exports = new ReportGenerator(); 