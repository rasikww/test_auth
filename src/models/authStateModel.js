const queryDB = require("../config/db");

async function saveAuthState(authStateData) {
    const { state, nonce, codeChallenge, originUrl } = authStateData;
    return await queryDB(
        `INSERT INTO auth_state (state, nonce, code_challenge, origin_url) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [state, nonce, codeChallenge, originUrl]
    );
}

async function getAuthStateByState(state) {
    const result = await queryDB("SELECT * FROM auth_state WHERE state = $1", [
        state,
    ]);
    return result.rows[0];
}

module.exports = {
    saveAuthState,
    getAuthStateByState,
};
