const queryDB = require("../config/db");

async function getUserByEmail(email) {
    const result = await queryDB("SELECT * FROM users WHERE email = $1", [
        email,
    ]);
    return result.rows[0];
}

async function getUserById(id) {
    try {
        await queryDB(`SELECT set_config('app.user_id', '${id}', true)`);
        const result = await queryDB("SELECT * FROM users");
        return result.rows[0];
    } catch (error) {
        console.error("error setting user_id", error);
    }
}

async function saveUser(user) {
    const result = await queryDB(
        "INSERT INTO users (username, email, profile_picture) VALUES ($1, $2, $3) RETURNING *",
        [user.username, user.email, user.profilePicture]
    );

    return result.rows[0];
}

module.exports = {
    getUserByEmail,
    getUserById,
    saveUser,
};
