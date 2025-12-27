import { sql } from '@vercel/postgres';

/**
 * Creates the necessary database tables if they don't already exist.
 * This function is called once when the database connection is first established.
 */
export const createTables = async () => {
  try {
    console.log('[database]: Initializing database tables...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        "accessToken" TEXT NOT NULL,
        "instagramAccountId" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(255) PRIMARY KEY,
        "postId" VARCHAR(255) NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        tone VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        "repliesCount" INT NOT NULL
      );
    `;
    console.log('[database]: Tables are ready.');
  } catch (error) {
    console.error('[database]: Error creating tables:', error);
    // In a serverless environment, it's critical to throw the error
    // to prevent the function from executing with a faulty db state.
    throw error;
  }
};
