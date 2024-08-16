const { Client } = require("pg");

const client = new Client({
    connectionString: "postgresql://postgres:postgre@localhost:5432/auth",
});

client.connect();

module.exports = client;
