const { Issuer } = require("openid-client");

let client;

async function getOAuthClient() {
    if (!client) {
        const googleIssuer = await Issuer.discover(
            "https://accounts.google.com"
        );
        client = new googleIssuer.Client({
            client_id:
                "378283612239-j98t0ukbuj2vl4lkkhu877pgj62e8jg9.apps.googleusercontent.com",
            client_secret: "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",
            redirect_uris: ["http://localhost:3000/auth-callback"],
            response_types: ["code"],
        });
    }
    return client;
}

module.exports = { getOAuthClient };
