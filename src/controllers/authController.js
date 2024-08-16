const authService = require("../services/authService");

async function initiateAuth(req, res) {
    authService.initiateAuth(req, res);
}

module.exports = { initiateAuth };
