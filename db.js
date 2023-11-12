/** Database setup for BizTime. */
const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

const dbPassword = process.env.DB_PASSWORD;

const DB_URI =
    process.env.NODE_ENV === 'test'
        ? `postgresql://postgres:${dbPassword}@localhost:5432/usersdb_test`
        : `postgresql://postgres:${dbPassword}@localhost:5432/usersdb`;

let db = new Client({
    connectionString: DB_URI,
});

db.connect();

module.exports = db;
