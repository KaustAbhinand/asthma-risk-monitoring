require("dotenv").config();
const brevo = require('@getbrevo/brevo');

console.log("Email service initialized with Brevo");

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

async function sendAlertEmail(to, risk, level) {
    if (!to) {
        console.error("❌ No recipient email provided");
        return;
    }

    try {
        console.log("Sending email to:", to);

        // Create email object
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = "High Asthma Risk Alert";
        sendSmtpEmail.to = [{ email: to.trim() }];
        sendSmtpEmail.htmlContent = `
            <h2>High Risk Detected</h2>
            <p>Your current asthma risk score is <b>${risk}</b>.</p>
            <p>Risk Level: <b>${level}</b></p>
            <p>Please open your dashboard to see your precautions.</p>
        `;
        sendSmtpEmail.textContent = `
High Risk Detected

Your current asthma risk score is ${risk}
Risk Level: ${level}

Please open your dashboard to see your precautions.
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