const { Issuer, generators } = require("openid-client");

let client;

async function getOAuthClient() {
    if (!client) {
        const googleIssuer = await Issuer.discover(
            "https://accounts.google.com"
        );
        client = new googleIssuer.Client({
            client_id: process.env.MY_CLIENT_ID,
            client_secret: process.env.MY_CLIENT_SECRET,
            redirect_uris: ["http://localhost:3000/auth-callback"],
            response_types: ["code"],
        });
    }
    return client;
}

module.exports = { getOAuthClient, generators };
