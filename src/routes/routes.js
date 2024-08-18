const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth", (req, res) => {
    authController.initiateAuth(req, res);
});

router.get("/auth-callback", (req, res) => {
    authController.handleAuthCallback(req, res);
});

router.get("/token", (req, res) => {
    authController.handleToken(req, res);
});

module.exports = router;
