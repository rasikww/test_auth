const queryDB = require("../config/db");

async function getValidSigningKey() {
    const { rows } = await queryDB(
        `SELECT signing_key 
        FROM signing_key 
        WHERE expires_at > NOW() 
        AND is_revoked = FALSE 
        ORDER BY expires_at DESC 
        LIMIT 1`
    );
    return rows[0];
}

async function insertSigningKey(privateKey, expiresAt) {
    await queryDB(
        `INSERT INTO signing_key (signing_key, expires_at) VALUES ($1, $2)`,
        [privateKey.export({ format: "pem", type: "pkcs1" }), expiresAt]
    );
}

module.exports = {
    getValidSigningKey,
    insertSigningKey,
};
