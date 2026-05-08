const express = require("express");
const path = require("path");

function setupDeployment(app) {

    // Serve static files
    app.use(express.static(__dirname));

    // Homepage
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "dashboard.html"));
    });

}

module.exports = {
    setupDeployment
};