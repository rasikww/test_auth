const signingKeyModel = require("../models/signingKeyModel");
const jose = require("jose");

async function GenerateAndStoreKeys() {
    const { privateKey, publicKey } = await jose.generateKeyPair("RS256");

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const privateKeyPEM = await jose.exportPKCS8(privateKey);
    const publicKeyPEM = await jose.exportSPKI(publicKey);

    await signingKeyModel.insertSigningKey(
        privateKeyPEM,
        publicKeyPEM,
        expiresAt
    );
}

module.exports = {
    GenerateAndStoreKeys,
};
