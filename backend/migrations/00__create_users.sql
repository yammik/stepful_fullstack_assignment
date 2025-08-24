-- Drop existing tables for easy re-seed
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;

CREATE TABLE
  users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  );