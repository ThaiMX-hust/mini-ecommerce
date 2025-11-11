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

async function sendMail(to, subject, html) {
    const mailOptions = { from: process.env.SMTP_USER, to, subject, html }
    return await transporter.sendMail(mailOptions);
}

async function sendResetPasswordEmail(to, token) {
    const subject = "Reset your password";
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `<p>Click to reset password: <a href="${resetUrl}" target="_blank">${resetUrl}</a></p>`;
    return await sendMail(to, subject, html);
}

module.exports = {
    sendResetPasswordEmail
}