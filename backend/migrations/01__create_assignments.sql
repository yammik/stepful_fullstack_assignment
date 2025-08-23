CREATE TABLE
  quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quizzes (id),
    question_content TEXT,
    choices TEXT, -- sqlite doesn't support arrays, so we'll store choices as a string of ';;'-separated values
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );