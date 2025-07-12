const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: `"StackIt" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to StackIt! 🎉';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to StackIt!</h2>
        <p>Hi ${user.username},</p>
        <p>Welcome to StackIt - your community for collaborative learning and knowledge sharing!</p>
        <p>You can now:</p>
        <ul>
          <li>Ask questions with rich text formatting</li>
          <li>Answer questions and help others</li>
          <li>Vote on questions and answers</li>
          <li>Get notified of new interactions</li>
        </ul>
        <p>Happy learning! 🚀</p>
        <p>Best regards,<br>The StackIt Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendNotificationEmail(user, notification) {
    const subject = `StackIt Notification: ${notification.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #2563eb;">${notification.title}</h3>
        <p>${notification.message}</p>
        <p><a href="${process.env.CLIENT_URL}${notification.link}" style="color: #2563eb;">View Details</a></p>
        <p>Best regards,<br>The StackIt Team</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendAdminAnnouncement(users, announcement) {
    const subject = `StackIt Announcement: ${announcement.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">📢 StackIt Announcement</h2>
        <h3>${announcement.title}</h3>
        <p>${announcement.message}</p>
        <p>Best regards,<br>The StackIt Admin Team</p>
      </div>
    `;

    const emailPromises = users.map(user => 
      this.sendEmail(user.email, subject, html)
    );

    return Promise.all(emailPromises);
  }
}

module.exports = new EmailService(); 