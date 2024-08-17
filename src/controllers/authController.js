const authService = require("../services/authService");

function initiateAuth(req, res) {
    authService.initiateAuth(req, res);
}

function handleAuthCallback(req, res) {
    authService.handleAuthCallback(req, res);
}

module.exports = { initiateAuth, handleAuthCallback };
