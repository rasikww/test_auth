const queryDB = require("../config/db");

async function saveUserToken(tokenInfo) {
    const query = `INSERT INTO user_token 
    (user_id,
    idp_subject_id, 
    idp_access_token, 
    idp_access_token_expires_at, 
    idp_refresh_token, 
    idp_refresh_token_expires_at, 
    app_refresh_token, 
    app_refresh_token_expires_at, 
    created_at, 
    updated_at) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *;`;

    const values = [
        tokenInfo.userId,
        tokenInfo.idpSubjectId,
        tokenInfo.idpAccessToken,
        tokenInfo.idpAccessTokenExpiresAt,
        tokenInfo.idpRefreshToken,
        tokenInfo.idpRefreshTokenExpiresAt,
        tokenInfo.appRefreshToken,
        tokenInfo.appRefreshTokenExpiresAt,
    ];

    const result = await queryDB(query, values);
    return result.rows[0];
}

async function getUserTokenByUserId(userId) {
    const result = await queryDB(
        "SELECT * FROM user_token WHERE user_id = $1",
        [userId]
    );
    return result.rows[0];
}

async function getUserTokenByAppRefreshToken(refreshToken) {
    const result = await queryDB(
        "SELECT * FROM user_token WHERE app_refresh_token = $1",
        [refreshToken]
    );
    return result.rows[0];
}

module.exports = {
    saveUserToken,
    getUserTokenByUserId,
    getUserTokenByAppRefreshToken,
};
