const { getOAuthClient, generators } = require("../config/oauthClient");
const userModel = require("../models/userModel");
const authStateModel = require("../models/authStateModel");
const userTokenModel = require("../models/userTokenModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

async function initiateAuth(req, res) {
    try {
        const state = crypto.randomBytes(16).toString("hex");
        //const codeVerifier = crypto.randomBytes(32).toString("hex");
        const codeVerifier = generators.codeVerifier();

        // const codeChallenge = crypto
        //     .createHash("sha256")
        //     .update(codeVerifier)
        //     .digest("base64url");

        const codeChallenge = generators.codeChallenge(codeVerifier);

        const authStateData = {
            state,
            nonce: state,
            codeChallenge: codeChallenge,
            originUrl: req.originalUrl,
        };

        await authStateModel.saveAuthState(authStateData);

        res.cookie("code_verifier", codeVerifier, {
            httpOnly: true,
            secure: true,
        });

        const oathClient = await getOAuthClient();

        const authorizationUrl = oathClient.authorizationUrl({
            redirect_uri: "http://localhost:3000/auth-callback",
            scope: "openid profile email",
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        res.redirect(authorizationUrl);
    } catch (error) {
        console.error("Error saving auth state:", error);
        res.status(500).send(
            "Internal Server Error: couldn't complete authentication"
        );
    }
}

async function handleAuthCallback(req, res) {
    try {
        const { state, code } = req.query;

        const authState = await authStateModel.getAuthStateByState(state);

        if (!authState) {
            return res.status(400).send("Invalid state parameter");
        }

        const client = await getOAuthClient();

        const tokenSet = await client.callback(
            "http://localhost:3000/auth-callback",
            { code },
            {
                code_verifier: req.cookies.code_verifier,
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);

        console.log("user info :- " + userInfo);

        let user = await userModel.getUserByEmail(userInfo.email);
        if (!user) {
            user = await userModel.saveUser({
                username: userInfo.name,
                email: userInfo.email,
                profilePicture: userInfo.picture,
            });
        }

        console.log("user :-" + user);
        console.log(
            "expire date :-" +
                new Date(tokenSet.expires_at * 1000).toISOString()
        );

        const tokenInfo = {
            userId: user.id,
            idpSubjectId: userInfo.sub,
            idpAccessToken: tokenSet.access_token,
            idpAccessTokenExpiresAt: new Date(
                tokenSet.expires_at * 1000
            ).toISOString(),
            idpRefreshToken: tokenSet.refresh_token,
            idpRefreshTokenExpiresAt: tokenSet.refresh_token_expires_at,
            appRefreshToken: crypto.randomBytes(32).toString("hex"),
            appRefreshTokenExpiresAt: tokenSet.appRefreshTokenExpiresAt,
        };

        try {
            await userTokenModel.saveUserToken(tokenInfo);
            console.log("user token saved successfully");
        } catch (error) {
            console.log("error saving token" + error);
        }

        res.redirect("http://localhost:3000/token");
    } catch (error) {
        console.error("Error handling auth callback:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { initiateAuth, handleAuthCallback };
