import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// This variable will hold the singleton promise for the database connection.
let dbPromise: Promise<Database> | null = null;

const initializeDb = async () => {
  // Determine the database path based on the environment.
  const dbPath = process.env.VERCEL ? path.join('/tmp', 'roboka.db') : './api/roboka.db';
  console.log(`[database]: Initializing database at ${dbPath}`);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Run migrations to create tables if they don't exist.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      accessToken TEXT NOT NULL,
      instagramAccountId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL,
      keyword TEXT NOT NULL,
      tone TEXT NOT NULL,
      status TEXT NOT NULL,
      repliesCount INTEGER NOT NULL
    );
  `);

  console.log('[database]: Database tables are ready.');
  return db;
};

/**
 * Gets the singleton database connection promise.
 * On the first call, it initializes the database.
 * On subsequent calls, it returns the existing connection promise.
 */
export const getDb = () => {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
};
