const fs = require("fs/promises");
const path = require("path");
const nodemailer = require('nodemailer');
const { order } = require("../infrastructure/prisma");
const { formatMoney } = require("../utils/moneyFormatUtils")

const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: process.env.SMTP_SECURE === 'true',
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//     }
// });

async function loadTemplate(template_dir, token) {
    const filePath = path.join(__dirname, "../templates", "email", template_dir);

    let html = await fs.readFile(filePath, "utf8");

    return html;
}

async function sendMail(from, to, subject, html) {
    // await transporter.verify();
    // console.log("SMTP connection OK");

    // const mailOptions = { from: from, to: to, subject: subject, html: html };
    // return await transporter.sendMail(mailOptions);

    const result = await emailApi.sendTransacEmail({
        sender: {
            email: process.env.MAIL_FROM_EMAIL,
            name: process.env.MAIL_FROM_NAME,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
    });
    return result;
}

async function sendResetPasswordEmail(to, token) {
    const subject = "Reset your password";
    const resetUrl = `${process.env.FRONTEND_URL}/forgot-password?token=${token}`;
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

async function sendPurchaseSuccessfullyEmail( to, orderDetail ) {
    try {
        const subject = "Thanh toán thành công";
        const html = (await loadTemplate("purchaseSuccessfully.html"))
                    .replace(/{{CUSTOMER_NAME}}/g, orderDetail.receiver_name)
                    .replace(/{{ORDER_ID}}/g, orderDetail.order_id)
                    .replace(/{{AMOUNT_PAID}}/g, formatMoney(orderDetail.final_total_price))
                    .replace(/{PAYMENT_DATE}/g, new Date())


        const emailResult = await sendMail(
            process.env.SMTP_FROM,
            to,
            subject,
            html
        );

        if (emailResult.success) {
            console.log(`Purchase success email sent to ${to} for order ${orderId}`);
            return true;
        } else {
            console.error(`Failed to send email to ${to}:`, emailResult.error);
            return false;
        }

    } catch (error) {
        console.error("Error in sendPurchaseSuccessfullyEmail:", error);
        return false;
    }
}
module.exports = {
    sendResetPasswordEmail,
    sendPurchaseSuccessfullyEmail
}
