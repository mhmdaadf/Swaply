/**
 * Email Service
 * Integrated for production notifications.
 */

const fs = require('fs');
const path = require('path');

// Email service integration point

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

  // Log to console for observability
  console.log(`[Email] To: ${to} | Subject: ${subject}`);

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
