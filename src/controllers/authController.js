const authService = require("../services/authService");

function initiateAuth(req, res) {
    authService.initiateAuth(req, res);
}

function handleAuthCallback(req, res) {
    authService.handleAuthCallback(req, res);
}

function handleToken(req, res) {
    authService.issueJWTToken(req, res);
}

module.exports = { initiateAuth, handleAuthCallback, handleToken };
