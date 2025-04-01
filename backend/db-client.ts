import Database from "better-sqlite3";

const DATABASE_NAME = "quiz_db.sqlite3";

export const db = new Database(DATABASE_NAME, { verbose: console.log });

db.pragma("journal_mode = WAL");
