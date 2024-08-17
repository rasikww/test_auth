const db = require("../config/db");

async function getUserByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]);
    return result.rows[0];
}

async function saveUser(user) {
    const result = await db.query(
        "INSERT INTO users (username, email, profile_picture) VALUES ($1, $2, $3) RETURNING *",
        [user.username, user.email, user.profilePicture]
    );
    return result.rows[0];
}

module.exports = {
    getUserByEmail,
    saveUser,
};
