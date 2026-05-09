require("dotenv").config();

console.log("Email service initialized with Brevo");

async function sendAlertEmail(to, risk, level) {
    if (!to) {
        console.error("❌ No recipient email provided");
        return;
    }

    try {
        console.log("Sending email to:", to);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "Asthma Alert System",
                    email: process.env.BREVO_SENDER_EMAIL
                },
                to: [
                    {
                        email: to.trim()
                    }
                ],
                subject: "High Asthma Risk Alert",
                htmlContent: `
                    <h2>High Risk Detected</h2>
                    <p>Your current asthma risk score is <b>${risk}</b>.</p>
                    <p>Risk Level: <b>${level}</b></p>
                    <p>Please open your dashboard to see your precautions.</p>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Email sending failed');
        }

        console.log("✅ Email sent:", data.messageId);
        return data;

    } catch (err) {
        console.error("❌ Email error:", err);
        throw err;
    }
}

module.exports = { sendAlertEmail };