const jose = require("jose");
const signingKeyModel = require("../models/signingKeyModel");

async function verifyJWT(req, res, next) {
    try {
        const token = req.headers["authorization"];

        if (!token) {
            return res.status(401).send("Unauthorized: No token provided");
        }

        const bearerToken = token.split(" ")[1];

        const keyRecord = await signingKeyModel.getValidPublicKey();
        const publicKey = await jose.importSPKI(keyRecord.public_key, "RS256");

        const { payload } = await jose.jwtVerify(bearerToken, publicKey, {
            algorithms: ["RS256"],
        });
        req.userId = payload.sub;

        next();
    } catch (error) {
        console.error("JWT Verification Error: ", error);
        res.status(401).send("Unauthorized: Invalid token");
    }
}

async function createToken(userInfo) {
    const keyRecord = await signingKeyModel.getValidPrivateKey();
    const privateKey = await jose.importPKCS8(keyRecord.private_key, "RS256");

    const payload = {
        username: userInfo.username,
        email: userInfo.email,
        sub: userInfo.id,
    };

    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(privateKey);

    return jwt;
}

module.exports = {
    verifyJWT,
    createToken,
};
