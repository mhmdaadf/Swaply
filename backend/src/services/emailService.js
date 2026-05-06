/**
 * Email Service — Simulates sending emails for production-ready demonstration.
 * In a real production app, you would use Nodemailer with SendGrid, Mailgun, or AWS SES.
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../logs/email_log.txt');

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, '../../logs'))) {
  fs.mkdirSync(path.join(__dirname, '../../logs'));
}

exports.sendEmail = async ({ to, subject, body }) => {
  const timestamp = new Date().toISOString();
  const entry = `
[${timestamp}] 
TO: ${to}
SUBJECT: ${subject}
BODY: 
${body}
------------------------------------------------------------
`;

  // Log to console for development visibility
  console.log(`\n📧 EMAIL SENT TO: ${to}\n   SUBJECT: ${subject}\n   BODY: ${body.substring(0, 50)}...\n`);

  // Log to file for "sent" history
  fs.appendFileSync(LOG_FILE, entry);

  return true;
};

exports.sendWelcomeEmail = async (user) => {
  return this.sendEmail({
    to: user.email,
    subject: 'Welcome to Swaply!',
    body: `Hi ${user.username},\n\nWelcome to Swaply! Your account is ready. Start listing items and find your first smart match today.`
  });
};

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  return this.sendEmail({
    to: user.email,
    subject: 'Swaply Password Reset',
    body: `You requested a password reset. Please click the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
  });
};

exports.sendTradeNotification = async (receiver, sender, type) => {
  const messages = {
    'new_proposal': `${sender.username} proposed a new trade with you!`,
    'accepted': `${sender.username} accepted your trade proposal!`,
    'completed': `Your trade with ${sender.username} has been marked as completed!`,
  };

  return this.sendEmail({
    to: receiver.email,
    subject: `Swaply: ${type.replace('_', ' ')}`,
    body: `Hi ${receiver.username},\n\n${messages[type] || 'You have a new update on Swaply.'}\n\nLog in to see the details.`
  });
};
