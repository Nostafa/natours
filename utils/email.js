const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // 2) Define the email options
    const mailOptions = {
        from: `Mustafa Yasser <smtp.mantrap.io>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.htmlMessage,
    };
    // 3) Send the email
    await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;