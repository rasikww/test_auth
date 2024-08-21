const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
});

async function queryDB(query, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } finally {
        client.release();
    }
}

module.exports = queryDB;
