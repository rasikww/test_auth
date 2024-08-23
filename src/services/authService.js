const { getOAuthClient, generators } = require("../config/oauthClient");
const userModel = require("../models/userModel");
const authStateModel = require("../models/authStateModel");
const userTokenModel = require("../models/userTokenModel");
const crypto = require("crypto");
const { createToken } = require("./jwtService");

async function initiateAuth(req, res) {
    try {
        const state = generators.state();
        const codeVerifier = generators.codeVerifier();

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

        const oauthClient = await getOAuthClient();

        const tokenSet = await oauthClient.callback(
            "http://localhost:3000/auth-callback",
            { code },
            {
                code_verifier: req.cookies.code_verifier,
            }
        );

        const userInfo = await oauthClient.userinfo(tokenSet.access_token);

        // console.log("user info :- " + JSON.stringify(userInfo));
        // console.log("auth client info :- " + JSON.stringify(oauthClient));
        // console.log("token set info :- " + JSON.stringify(tokenSet));

        let user = await userModel.getUserByEmail(userInfo.email);
        if (!user) {
            user = await userModel.saveUser({
                username: userInfo.name,
                email: userInfo.email,
                profilePicture: userInfo.picture,
            });
        }

        // console.log("user :-" + user);
        // console.log(
        //     "expire date :-" +
        //         new Date(tokenSet.expires_at * 1000).toISOString()
        // );

        const refreshToken = crypto.randomBytes(32).toString("base64");
        const appRefreshTokenExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
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
            appRefreshToken: refreshToken,
            appRefreshTokenExpiresAt: appRefreshTokenExpiresAt,
        };

        try {
            await userTokenModel.saveUserToken(tokenInfo);
            console.log("user token saved successfully");
        } catch (error) {
            console.log("error saving token" + error);
        }

        res.cookie("APP_REFRESH_TOKEN", refreshToken, {
            httpOnly: true,
            secure: true,
            expires: appRefreshTokenExpiresAt,
        });

        res.redirect("http://localhost:3000/token");
    } catch (error) {
        console.error("Error handling auth callback:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function issueJWTToken(req, res) {
    const refreshToken = req.cookies.APP_REFRESH_TOKEN;
    if (!refreshToken) {
        return res.status(401).send("Unauthorized: user not authenticated");
    }
    const tokenRecord = await userTokenModel.getUserTokenByAppRefreshToken(
        refreshToken
    );

    // refreshToken doesn't exist
    if (!tokenRecord) {
        return res.status(401).send("Unauthorized");
    }

    //checking refresh token expiration time
    if (Date.now() > Date.parse(tokenRecord.app_refresh_token_expires_at)) {
        return res.status(401).send("Unauthorized: expired token");
    }

    //getting userinfo from db
    const userInfo = await userModel.getUserById(tokenRecord.user_id);

    //creating jwt token
    try {
        const jwtToken = await createToken(userInfo);
        res.json({ token: jwtToken });
    } catch (error) {
        console.error("error occurred while creating jwt token", error);
        throw new Error("jwt creation error");
    }
}

module.exports = { initiateAuth, handleAuthCallback, issueJWTToken };
