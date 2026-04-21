require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getPrecautionMeasures(userData, climateData) {
    try {
        const prompt = `
You are a healthcare assistant.

Given the following patient and environmental data, suggest personalized precautionary measures for asthma prevention.

Patient Data:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Existing Conditions: ${userData.conditions}
- Risk Score: ${userData.riskScore}

Climate Data:
- Temperature: ${climateData.temperature}°C
- Humidity: ${climateData.humidity}%
- AQI: ${climateData.aqi}
- Pollen Level: ${climateData.pollen}

Return:
- Clear, practical precautions
- Avoid medical jargon
- Keep it actionable
- clean formatting
- 5-7 bullet points maximum
- Directly give the points, no introductory text or conclusion, just the bullet points.
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            }
        );

        return response.data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Gemini API error:", error.response?.data || error.message);
        return "Could not fetch precautionary measures.";
    }
}

module.exports = { getPrecautionMeasures };