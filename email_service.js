
require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("Email service initialized with user:", process.env.EMAIL_USER);

// SMTP transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection (debug)
transporter.verify((err, success) => {
    if (err) {
        console.error("SMTP Error:", err);
    } else {
        console.log("SMTP Server Ready");
    }
});

// Send email
async function sendAlertEmail(to, risk, level) {

    if (!to) {
        console.error("❌ No recipient email provided");
        return;
    }

    try {
        console.log("Sending email to:", to);

        await transporter.sendMail({
            from: `"Asthma Risk Prediction" <${process.env.EMAIL_USER}>`,
            to: to.trim(),
            subject: "High Asthma Risk Alert",
            html: `
                <h2>High Risk Detected</h2>
                <p>Your current asthma risk score is <b>${risk}</b>.</p>
                <p>Risk Level: <b>${level}</b></p>
                <p>Please open your dashboard to see your precautions</p>
            `
        });

        console.log("✅ Email sent to:", to);

    } catch (err) {
        console.error("❌ Email error:", err);
    }
}

module.exports = { sendAlertEmail };
