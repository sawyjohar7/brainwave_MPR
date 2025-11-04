// Step 1: Install the pg package first (run in terminal)
// npm install pg

const { Client } = require('pg');

// Connection parameters
const client = new Client({
     host: 'localhost',
    port: 5432,
    database: 'fuckedup',
    user: 'postgres',
    password: 'Hellosawyy', // your PostgreSQL password
});

async function main() {
    try {
        // Connect to the database
        await client.connect();
        console.log("Connected to the database successfully!");

        // Fetch first 10 students
        const res = await client.query("SELECT * FROM students ;");
        res.rows.forEach(row => {
            console.log(row);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        // Close the connection
        await client.end();
        console.log("Database connection closed.");
    }
}

main();
