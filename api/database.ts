import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import path from 'path';

export async function openDb() {
  // Use /tmp directory for the database file in Vercel environment
  const dbPath = process.env.VERCEL ? path.join('/tmp', 'roboka.db') : './roboka.db';

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL,
      keyword TEXT NOT NULL,
      tone TEXT NOT NULL,
      status TEXT NOT NULL,
      repliesCount INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      accessToken TEXT NOT NULL,
      instagramAccountId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}
