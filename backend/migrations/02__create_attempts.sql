CREATE TABLE
  attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users (id),
    quiz_id INTEGER NOT NULL REFERENCES quizzes (id),
    is_finished BOOLEAN NOT NULL DEFAULT 0,
    answer_selections TEXT, -- serialized json containing key-value pair of question_id and selected answer
    time_elapsed INTEGER, -- time elapsed taking test in seconds
    score INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
