const db = require("../config/db");

async function saveUserToken(tokenInfo) {
    const query = `INSERT INTO user_token 
    (id, 
    user_id,
    idp_subject_id, 
    idp_access_token, 
    idp_access_token_expires_at, 
    idp_refresh_token, 
    idp_refresh_token_expires_at, 
    app_refresh_token, 
    app_refresh_token_expires_at, 
    created_at, 
    updated_at) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *;`;

    const values = [
        tokenInfo.id,
        tokenInfo.user_id,
        tokenInfo.idp_subject_id,
        tokenInfo.idp_access_token,
        tokenInfo.idp_access_token_expires_at,
        tokenInfo.idp_refresh_token,
        tokenInfo.idp_refresh_token_expires_at,
        tokenInfo.app_refresh_token,
        tokenInfo.app_refresh_token_expires_at,
        tokenInfo.created_at,
        tokenInfo.updated_at,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}

async function getUserTokenByUserId(userId) {
    const result = await db.query(
        "SELECT * FROM user_token WHERE user_id = $1",
        [userId]
    );
    return result.rows[0];
}

module.exports = {
    saveUserToken,
    getUserTokenByUserId,
};
