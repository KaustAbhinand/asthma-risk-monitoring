const express = require("express");
const cors = require("cors");
let lastRiskSent = null;
// imports
const { score } = require("./model");
const { getSensorData } = require("./iot_integration");
const { getPrecautionMeasures } = require("./gemini_integration");
const { sendAlertEmail } = require("./email_service");

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────
// TEST ROUTE
// ─────────────────────────────
app.get("/", (req, res) => {
    res.send("Backend running");
});

// ─────────────────────────────
// PREDICT ROUTE (WITH SENSOR DATA)
// ─────────────────────────────
app.post("/predict", async (req, res) => {
    try {
        const userData = req.body;

        // ✅ 1. Fetch real sensor data
        const sensorData = await getSensorData();
        console.log("Sensor Data:", sensorData);

        // ✅ 2. Override environmental values
        userData.pm25 = sensorData.pm25;
        userData.no2 = sensorData.no2;
        userData.h2s = sensorData.h2s;
        userData.temperature = sensorData.temperature;
        userData.humidity = sensorData.humidity;

        //  3. Build features AFTER override
        const features = [
            userData.age,
            userData.gender,
            userData.smoking,
            userData.activity,
            userData.work_type,
            userData.stress_level,
            userData.sleep_quality,
            userData.illness_count,
            userData.family_history,
            userData.symptom_score,
            userData.allergen_count,
            userData.pm25,
            userData.no2,
            userData.h2s,
            userData.temperature,
            userData.humidity,
        ];

        console.log("Features:", features);

        // ── ML Prediction ──
        let baseRisk = score(features);
        baseRisk *= 0.8; 
        baseRisk += 5;
        baseRisk = Math.round(baseRisk);
        console.log("BaseRisk:", baseRisk);


        // ── Risk Level ──
        let level = "Low";
        if (baseRisk >= 70) level = "High";
        else if (baseRisk >= 40) level = "Moderate";

        // ── Email Alert ──
        if (baseRisk >= 70 && (lastRiskSent !== baseRisk || lastRiskSent < 70)) {
            console.log("Email:", userData.email);

            await sendAlertEmail(
                userData.email,
                baseRisk,
                level
            );

            lastRiskSent = baseRisk;
        }

        //  Return sensor data also
        res.json({
            risk: baseRisk,
            level,
            sensors: sensorData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Prediction failed" });
    }
});

// ─────────────────────────────
// PRECAUTIONS ROUTE (WITH SENSOR DATA)
// ─────────────────────────────
app.post("/precautions", async (req, res) => {
    try {
        const userData = req.body;

        // ✅ Fetch real sensor data
        const sensorData = await getSensorData();

        const climateData = {
            temperature: sensorData.temperature,
            pm25: sensorData.pm25,
            no2: sensorData.no2,
            h2s: sensorData.h2s,
            humidity: sensorData.humidity
        };

        const precautions = await getPrecautionMeasures(userData, climateData);

        res.json({ precautions });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch precautions" });
    }
});

// ─────────────────────────────
// START SERVER
// ─────────────────────────────
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

