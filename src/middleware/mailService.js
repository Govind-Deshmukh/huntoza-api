const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

/*
 * Load email template and replace placeholders with actual data
 * @param {string} templateName - The name of the template file (without extension)
 * @param {Object} replacements - Object containing key-value pairs for replacements
 * @returns {Promise<string>} - HTML content of the email
 */
const loadTemplate = async (templateName, replacements) => {
  try {
    const templatePath = path.join(__dirname, '../mailTemplates', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Replace all placeholders with values
    if (replacements) {
      Object.keys(replacements).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, replacements[key]);
      });
    }
    
    return template;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw error;
  }
};

/**
 * Send email asynchronously without waiting for response
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Data for template placeholders
 * @returns {Promise<void>}
 */
const sendMail = async ({ to, subject, template, data }) => {
  try {
    // Load and process template
    const html = await loadTemplate(template, data);
    
    // Configure email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to,
      subject,
      html
    };
    
    // Send email without awaiting for result
    transporter.sendMail(mailOptions).then(info => {
      console.log(`Email sent to ${to}: ${info.messageId}`);
    }).catch(error => {
      console.error(`Failed to send email to ${to}:`, error);
    });
    
    // Return immediately without waiting for email to be sent
    return true;
  } catch (error) {
    console.error('Send mail error:', error);
    // Even if there's an error, we don't want to block the response
    return false;
  }
};

module.exports = { sendMail };