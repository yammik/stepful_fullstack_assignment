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
