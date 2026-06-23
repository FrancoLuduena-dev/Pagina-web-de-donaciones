import "dotenv/config";
import { Client } from "pg";


async function main() {
  

const password = process.env.DB_PASS;

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password,
  database: "postgres",
});

  await client.connect();

  const dbName = process.env.DB_NAME!;

  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Database '${dbName}' created`);
  } else {
    console.log(`ℹ️ Database '${dbName}' already exists`);
  }

  await client.end();
}

main().catch(console.error);