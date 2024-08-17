const { getOAuthClient } = require("../config/oauthClient");
const userModel = require("../models/userModel");
const authStateModel = require("../models/authStateModel");
const userTokenModel = require("../models/userTokenModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

async function initiateAuth(req, res) {
    try {
        const state = crypto.randomBytes(16).toString("hex");
        const codeVerifier = crypto.randomBytes(32).toString("hex");

        const codeChallenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

        const authStateData = {
            state,
            nonce: state,
            codeChallenge: codeChallenge,
            originUrl: req.originalUrl,
        };

        await authStateModel.saveAuthState(authStateData);

        const oathClient = getOAuthClient();
        const authorizationUrl = oathClient.authorizationUrl({
            state: authStateData.state,
            codeChallenge: authStateData.codeChallenge,
            codeChallengeMethod: "S256",
        });

        res.redirect(authorizationUrl);
    } catch (error) {
        console.error("Error saving auth state:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { initiateAuth };
