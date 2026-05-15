require("dotenv").config();

const { score } = require("./model");
const { getSensorData } = require("./iot_integration");
const { sendAlertEmail } = require("./email_service");
const {transformToModelInput} = require("./transformUserData");
const { createClient } = require("@supabase/supabase-js");

// Supabase setup
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Cooldown tracking
const lastAlertTime = {};

const COOLDOWN = 1 * 60 * 1000; // 1 minute

async function monitorUsers() {

    try {

        console.log("Running continuous monitoring...");

        // Fetch profiles
        const { data: users, error } =
            await supabase
                .from("profiles").select("*");

        if (error) {
            console.error("Supabase Error:", error);
            return;
        }

        // Fetch sensor data once
        const sensorData = await getSensorData();

        console.log("Sensor Data:", sensorData);

        // Process each user
        for (const user of users) {

            // Fetch email from auth.users
            const {
                data: authUser,
                error: authError
            } = await supabase.auth.admin.getUserById(user.id);

            if (authError || !authUser?.user?.email) {

                console.error(
                    `No email found for user ${user.id}`
                );

                continue;
            }

            const email = authUser.user.email;
            const transformedUser = transformToModelInput(user);
            const features = [
                transformedUser.age,
                transformedUser.gender,
                transformedUser.smoking,
                transformedUser.activity,
                transformedUser.work_type,
                transformedUser.stress_level,
                transformedUser.sleep_quality,
                transformedUser.illness_count,
                transformedUser.family_history,
                transformedUser.symptom_score,
                transformedUser.allergen_count,
                sensorData.pm25,
                sensorData.no2,
                sensorData.h2s,
                sensorData.temperature,
                sensorData.humidity
            ];

            console.log("Monitoring features:", features);

            let baseRisk = score(features);

            baseRisk *= 0.8;
            baseRisk += 5;

            baseRisk = Math.round(baseRisk );

            console.log(
                `${email} -> Risk: ${baseRisk}`
            );

            let level = "Low";

            if (baseRisk >= 70)
                level = "High";
            else if (baseRisk >= 40)
                level = "Moderate";

            // High-risk email alerts
            if (baseRisk >= 70) {

                const now = Date.now();

                const previousTime =
                    lastAlertTime[email] || 0;

                const cooldownExpired =
                    now - previousTime > COOLDOWN;

                if (cooldownExpired) {

                    console.log(
                        `Sending alert to ${email}`
                    );

                    try {

                        await sendAlertEmail(
                            email,
                            baseRisk,
                            level
                        );

                        lastAlertTime[email] = now;

                    } catch (emailErr) {

                        console.error(
                            "Email Error:",
                            emailErr
                        );
                    }

                } else {

                    console.log(
                        `Cooldown active for ${email}`
                    );
                }
            }
        }

    } catch (err) {

        console.error(
            "Monitoring Error:",
            err
        );
    }
}

// Run every 1 minutes
setInterval(
    monitorUsers,
    1 * 60 * 1000
);

// Run immediately
monitorUsers();