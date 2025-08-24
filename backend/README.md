# API Docs – Quiz App

## 1. Overview

Environments

- Local dev server [http://localhost:3001](http://localhost:3001)

## 2. Authentication

A middleware is sketched out with a hardcoded user ID in this demo. Incoming requests to all routes in this API are decorated with the user ID. This was meaningful because the Resume feature involves attempts which are user-scoped.

## 3. Resource Model

Entities

- `Quiz`: id title version questions[]
- `Attempt`: id quizId userId current score finished updatedAt version

Invariants

- An attempt belongs to one user and one quiz.
- A user may only have one unfinished attempt per quiz.
- Finished attempts are immutable (not implemented yet)

## 4. Endpoints Reference

### 4.1 Quizzes

#### `GET /quizzes`

##### Response

```json
{ "items": [{ "id": "1", "title": "Skeletal Basics" }] }
```

#### `GET /quizzes/{quizId}`

##### Query params

- quizId: quiz ID.

##### Response

```json
{
  "id": "1",
  "title": "Skeletal Basics",
  "created_at": "2025-08-22T15:00:00Z"
}
```

#### `GET /quizzes/{quizId}/questions`

##### Query params

- quizId: ID of the quiz the questions belong to.

##### Response

```json
[
  {
    "id": "1",
    "quiz_id": "Skeletal Basics",
    "question_content": "Which bone is the longest in the human body?",
    "choices": "Femur;;Tibia;;Humerus;;Fibula",
    "created_at": "2025-08-22T15:00:00Z"
  }
]
```

### 4.2 Attempts

#### `POST /quizzes/{quizId}/attempts`

Ensure or create active attempt for quiz with the provided ID.

##### Query Params

- quizId: quiz ID.

##### Response

Returns the created attempt object.

```json
{
  "id": "0",
  "quizId": "1",
  "score": 0,
  "finished": 0,
  "updatedAt": "2025-08-22T15:00:00Z"
}
```

#### `GET /quizzes/{quizId}/attempts/active`

##### Query Params

- quizId: quiz ID.

##### Response

Returns an unfinished attempt for given quiz, if any.

```json
{
  "id": "0",
  "quizId": "1",
  "score": 1,
  "finished": 0,
  "updatedAt": "2025-08-22T15:05:00Z"
}
```

#### `GET /attempts/{attemptId}`

##### Query Params

- attemptId: ID of a specific attempt.

##### Response

Gets a specific attempt with the given ID.

```json
{
  "id": "0",
  "quizId": "1",
  "score": 1,
  "finished": 0,
  "updatedAt": "2025-08-22T15:05:00Z"
}
```

#### `POST /attempts/{attemptId}/finish`

##### Query Params

- attemptId: ID of the attempt to complete.

##### Response

Updates the specified attempt to mark a completed quiz attempt. This means the attempt is graded and should have a score.

```json
{
  "id": "0",
  "quizId": "1",
  "score": 4,
  "finished": 1,
  "updatedAt": "2025-08-22T15:10:00Z"
}
```

## 5. Schemas

Quiz

```json
{
  "id": "string",
  "title": "string",
  "version": 0,
  "questions": [{ "id": "string", "prompt": "string", "choices": ["string"] }]
}
```

Attempt

```json
{
  "id": "string",
  "quizId": "string",
  "userId": "string",
  "current": 0,
  "score": 0,
  "finished": false,
  "version": 0,
  "updatedAt": "ISO-8601"
}
```

Error

```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```

## 6. Error Catalog

Not implemented yet, but these are possible errors for invalid answer selection payload, mismatching userId on an attempt, etc.

- 400 invalid_payload
- 401 unauthorized
- 404 not_found
- 409 conflict_out_of_order or conflict_duplicate_submit

 <!--
- Should store attempt information, like time taken, how many times paused, final score
- Ideally collect data from the quiz attempts to build a growth plan for student
- Behavior analysis per question–collect time taken per question? see if AI can see a pattern
 -->

# Trade offs

- _Updating answer choices on every question advance._ The choices are important data to save because they directly influence the final score. The final score is a part of licensure or employment success so should be treated with high fidelity and security.

# Possible optimizations

- _Question answer key table._ Answer keys could have been stored by a hashed column on the quiz_questions table. But an entirely separate table is better for least privilege and allows audit. endpoints that fetch quizzes never touch this table. Cons is that you have to do an extra join when grading, introduces more code lift and latency, and possible schema drift. I optimized for preventing leaks.
- A middleware for `attempt.user_id` ownership check.

# Notes about what I did

- I did not implement a dedicated `GET /quizzes/{id}` endpoint, since `GET /quizzes` returns all the necessary data to display a detail page for each quiz.
- Technically you could grade both MCQ and FT (free text) questions with LLM, but would incur increased infrastructural cost.
- In production, I would not use autoincrementing integer as the primary key of a sensitive table like answer_keys.
- `quiz` should have a `version` column and `attempt` should have a corresponding `quiz_version` so outdated attempts should be invalidated.
