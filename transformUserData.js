function transformToModelInput(user) {
    return {
        age: user.age,
        gender: user.gender === "Male" ? 0 : 1,
        smoking: user.smoking === "no" ? 0 : 1,
        activity: parseInt(user.activity) || 0,
        work_type: parseInt(user.work) || 0,
        stress_level: user.stress_level,
        sleep_quality: user.sleep_quality,
        illness_count: user.illnesses ? user.illnesses.length : 0,
        family_history: user.family_illnesses && user.family_illnesses.length > 0 ? 1 : 0,
        symptom_score: user.symptoms ? user.symptoms.length : 0,
        allergen_count: user.allergens ? user.allergens.length : 0
    };
}

module.exports = { transformToModelInput };