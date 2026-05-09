require("dotenv").config();
const SibApiV3Sdk = require('@getbrevo/brevo');

console.log("Email service initialized with Brevo");

// Initialize Brevo API client
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API key
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

async function sendAlertEmail(to, risk, level) {
    if (!to) {
        console.error("❌ No recipient email provided");
        return;
    }

    try {
        console.log("Sending email to:", to);

        // Create email object
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        sendSmtpEmail.subject = "High Asthma Risk Alert";
        sendSmtpEmail.to = [{ email: to.trim() }];
        sendSmtpEmail.htmlContent = `
            <h2>High Risk Detected</h2>
            <p>Your current asthma risk score is <b>${risk}</b>.</p>
            <p>Risk Level: <b>${level}</b></p>
            <p>Please open your dashboard to see your precautions.</p>
        `;
        sendSmtpEmail.sender = { 
            name: "Asthma Alert System", 
            email: process.env.BREVO_SENDER_EMAIL
        };

        // Send email
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        console.log("✅ Email sent:", data.messageId);
        return data;

    } catch (err) {
        console.error("❌ Email error:", err);
        throw err;
    }
}

module.exports = { sendAlertEmail };