-- Create some test usrs
INSERT INTO
  users (name, email)
VALUES
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Brown', 'bob@example.com');

-- Create test quizzes
INSERT INTO
  quizzes (title)
VALUES
  ('Basic Skeletal System Quiz'),
  ('Cardiovascular System Basics'),
  ('Digestive System Overview');

-- Create questions for Skeletal System Quiz
INSERT INTO
  quiz_questions (quiz_id, question_content, choices)
SELECT
  (
    SELECT
      id
    FROM
      quizzes
    WHERE
      title = 'Basic Skeletal System Quiz'
  ),
  q.column1,
  q.column2
FROM
  (
    VALUES
      (
        'Which bone is the longest in the human body?',
        'Femur;;Tibia;;Humerus;;Fibula'
      ),
      (
        'How many bones are in the adult human body?',
        '206;;186;;226;;196'
      ),
      (
        'Which part of the skull protects the brain?',
        'Cranium;;Mandible;;Maxilla;;Hyoid'
      ),
      (
        'What is the common name for the clavicle?',
        'Collarbone;;Wishbone;;Shoulderblade;;Neckbone'
      ),
      (
        'Explain the difference between compact and spongy bone tissue:',
        NULL
      )
  ) AS q;

-- Create questions for Cardiovascular Quiz
INSERT INTO
  quiz_questions (quiz_id, question_content, choices)
SELECT
  (
    SELECT
      id
    FROM
      quizzes
    WHERE
      title = 'Cardiovascular System Basics'
  ),
  q.column1,
  q.column2
FROM
  (
    VALUES
      (
        'Which chamber of the heart pumps blood to the body?',
        'Left ventricle;;Right ventricle;;Left atrium;;Right atrium'
      ),
      (
        'What is the main function of red blood cells?',
        'Carry oxygen;;Fight infection;;Form blood clots;;Produce antibodies'
      ),
      (
        'Which blood vessel carries oxygenated blood?',
        'Arteries;;Veins;;Capillaries;;Venules'
      ),
      (
        'How many chambers are in the human heart?',
        '4;;2;;3;;6'
      ),
      (
        'Describe the path of blood flow through the heart:',
        NULL
      )
  ) AS q;

-- Create questions for Digestive System Quiz
INSERT INTO
  quiz_questions (quiz_id, question_content, choices)
SELECT
  (
    SELECT
      id
    FROM
      quizzes
    WHERE
      title = 'Digestive System Overview'
  ),
  q.column1,
  q.column2
FROM
  (
    VALUES
      (
        'Where does chemical digestion begin?',
        'Mouth;;Stomach;;Small intestine;;Esophagus'
      ),
      (
        'Which organ produces bile?',
        'Liver;;Pancreas;;Gallbladder;;Stomach'
      ),
      (
        'What is the longest part of the digestive system?',
        'Small intestine;;Large intestine;;Esophagus;;Stomach'
      ),
      (
        'Which enzyme breaks down proteins in the stomach?',
        'Pepsin;;Amylase;;Lipase;;Trypsin'
      ),
      (
        'Explain the role of villi in the small intestine:',
        NULL
      )
  ) AS q;
