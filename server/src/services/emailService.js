const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const env = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass',
      },
    });
  }

  async sendJobAlerts(user, recommendedJobs) {
    if (!recommendedJobs || recommendedJobs.length === 0) return;

    try {
      const jobHtmlList = recommendedJobs.map(job => `
        <li>
          <strong><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/jobs/${job._id}">${job.title}</a></strong> at ${job.company.name}<br/>
          <em>${job.location.city || 'Remote'} | ${job.salary.min ? '$' + job.salary.min : 'Salary unlisted'}</em>
        </li>
      `).join('');

      const mailOptions = {
        from: '"CareerPilot AI" <alerts@careerpilotai.com>',
        to: user.email,
        subject: `🚀 ${recommendedJobs.length} New Job Matches for You!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Hello ${user.firstName},</h2>
            <p>We found some new jobs that strongly match the skills on your resume.</p>
            <ul>
              ${jobHtmlList}
            </ul>
            <p>Log in to CareerPilot AI to generate custom cover letters and practice interview questions for these roles.</p>
            <br/>
            <p>Best regards,<br/>The CareerPilot AI Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Sent job alert email to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send job alert to ${user.email}: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
