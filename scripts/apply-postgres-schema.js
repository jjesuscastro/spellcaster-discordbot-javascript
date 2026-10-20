require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('Missing required environment variable: DATABASE_URL');
}

async function main() {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        await client.query(schema);
        console.log('Spellcaster PostgreSQL schema applied.');
    } finally {
        await client.end();
    }
}

main().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
});
