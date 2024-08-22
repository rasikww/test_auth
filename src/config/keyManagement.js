const jose = require("jose");
const signingKeyModel = require("../models/signingKeyModel");

async function loadOrGenerateKeys() {
    const existingKey = await signingKeyModel.getValidSigningKey();

    if (!existingKey) {
        const privateKey = await jose.generateKeyPair("RS256");
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);

        await signingKeyModel.insertSigningKey(privateKey, expiresAt);
    }
}

module.exports = {
    loadOrGenerateKeys,
};
