const fs = require("fs/promises");
const path = require("path");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function loadTemplate(template_dir, token) {
    const filePath = path.join(__dirname, "../templates", "email", template_dir);

    let html = await fs.readFile(filePath, "utf8");

    return html;
}

async function sendMail(from, to, subject, html) {
    const mailOptions = { from: from, to: to, subject: subject, html: html }
    return await transporter.sendMail(mailOptions);
}

async function sendResetPasswordEmail(to, token) {
    const subject = "Reset your password";
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = (await loadTemplate("resetPassword.html"))
                .replace(/{{RESET_URL}}/g, resetUrl)
                .replace(/{{TOKEN}}/g, token);

    return await sendMail(
        process.env.SMTP_FROM,
        to,
        subject,
        html
    );
}

module.exports = {
    sendResetPasswordEmail
}