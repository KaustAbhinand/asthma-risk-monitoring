require("dotenv").config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("Email service initialized with Resend");

async function sendAlertEmail(to, risk, level) {
    if (!to) {
        console.error("❌ No recipient email provided");
        return;
    }

    try {
        console.log("Sending email to:", to);

        const data = await resend.emails.send({
            from: 'Asthma Alert <onboarding@resend.dev>', // For testing - change later
            to: to.trim(),
            subject: 'High Asthma Risk Alert',
            html: `
                <h2>High Risk Detected</h2>
                <p>Your current asthma risk score is <b>${risk}</b>.</p>
                <p>Risk Level: <b>${level}</b></p>
                <p>Please open your dashboard to see your precautions.</p>
            `,
            text: `
High Risk Detected

Your current asthma risk score is ${risk}
Risk Level: ${level}

Please open your dashboard to see your precautions.
            `
        });

        console.log("✅ Email sent:", data);
        return data;

    } catch (err) {
        console.error("❌ Email error:", err);
        throw err;
    }
}

module.exports = { sendAlertEmail };