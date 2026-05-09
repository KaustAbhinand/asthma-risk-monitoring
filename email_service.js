require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("Email service initialized with user:", process.env.EMAIL_USER);

// Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// Verify connection
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

        const mailOptions = {
            from: `"Asthma Risk Prediction" <${process.env.EMAIL_USER}>`,
            to: to.trim(),
            subject: "High Asthma Risk Alert",

            text: `
High Risk Detected

Your current asthma risk score is ${risk}
Risk Level: ${level}

Please open your dashboard to see your precautions.
            `,

            html: `
                <h2>High Risk Detected</h2>

                <p>Your current asthma risk score is 
                <b>${risk}</b>.</p>

                <p>Risk Level: <b>${level}</b></p>

                <p>
                    Please open your dashboard to see 
                    your precautions.
                </p>
            `
        };

        console.log("Before sendMail");

        const info = await transporter.sendMail(mailOptions);

        console.log("After sendMail");
        console.log("✅ Email sent:", info.response);

        return info;

    } catch (err) {
        console.error("❌ Email error:", err);
    }
}

module.exports = { sendAlertEmail };