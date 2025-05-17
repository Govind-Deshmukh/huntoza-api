const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtppro.zoho.in",
  port: 587,
  secure: false,
  auth: {
    user: "govind.deshmukh@pentasynth.com",
    pass: "Govind@2357",
  },
});

/*
 * Load email template and replace placeholders with actual data
 */
const loadTemplate = async (templateName, replacements) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../mailTemplates",
      `${templateName}.html`
    );
    let template = await fs.readFile(templatePath, "utf8");

    if (replacements) {
      Object.keys(replacements).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        template = template.replace(regex, replacements[key]);
      });
    }

    return template;
  } catch (error) {
    console.error(`Error loading email template '${templateName}':`, error);
    throw error;
  }
};

/**
 * Send email with template and data
 */
const sendMail = async ({ to, subject, template, data }) => {
  try {
    if (process.env.EMAIL_ENABLED !== "true") {
      console.log(
        `[EMAIL DISABLED] Would have sent email to ${to}: ${subject}`
      );
      return true;
    }

    const html = await loadTemplate(template, data);
    const mailOptions = {
      from: `"Pursuit Pal" <govind.deshmukh@pentasynth.com>`,
      to,
      subject,
      html,
      text: "This is a fallback plain-text email.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error.message || error);
    return false;
  }
};

module.exports = { sendMail };
