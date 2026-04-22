require("dotenv").config();

// ─────────────────────────────
// FETCH SENSOR DATA FROM THINGSPEAK
// ─────────────────────────────
async function getSensorData() {
    try {
        const url = `https://api.thingspeak.com/channels/${process.env.THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${process.env.THINGSPEAK_API_KEY}&results=1`;

        const res = await fetch(url);
        const data = await res.json();

        const latest = data.feeds[0];

        return {
            pm25: parseFloat(latest.field3) || 0,
            no2: parseFloat(latest.field2) || 0,
            h2s: parseFloat(latest.field1) || 0,
            temperature: parseFloat(latest.field4) || 30,
            humidity: parseFloat(latest.field5) || 0
        };
        console.log("ThingSpeak data:", latest);

    } catch (err) {
        console.error("ThingSpeak error:", err);

        // fallback values
        return {
            pm25: 0,
            no2: 0,
            h2s: 0,
            temperature: 30,
            humidity: 0
        };
    }
}

// ─────────────────────────────
// EXPORT
// ─────────────────────────────
module.exports = {
    getSensorData
};