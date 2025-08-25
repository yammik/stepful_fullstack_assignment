# API Docs – Quiz App

## 1. Overview

Environments

- Local dev server [http://localhost:3001](http://localhost:3001)

## 2. Authentication

A middleware is sketched out with a hardcoded user ID in this demo. Incoming requests to all routes in this API are decorated with the user ID. This was meaningful because the Resume feature involves attempts which are user-scoped.

## 3. Resource Model

`Quiz`

```json
{
  "id": "string",
  "title": "string",
  "created_at": "ISO-8601"
}
```

`Question`

```json
{
  "id": "string",
  "quiz_id": "string",
  "question_content": "string",
  "choices": "string",
  "created_at": "ISO-8601"
}
```

`Attempt`

```json
{
  "id": "string",
  "quiz_id": "string",
  "user_id": "string",
  "answer_selections": "string",
  "score": 0,
  "is_finished": false,
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

`Error`

```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```

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
  "id": "1",
  "quiz_id": "1",
  "user_id": "1",
  "answer_selections": "",
  "is_finished": 0,
  "time_elapsed": 0,
  "score": null,
  "updated_at": "2025-08-22T15:10:00Z"
}
```

#### `GET /quizzes/{quizId}/attempts/active`

##### Query Params

- quizId: quiz ID.

##### Response

Returns an unfinished attempt for given quiz, if any.

```json
{
  "id": "1",
  "quiz_id": "1",
  "user_id": "1",
  "answer_selections": "{\"1\": \"Tibia\", \"3\": \"Example answer here\"}",
  "is_finished": 0,
  "time_elapsed": 0,
  "score": null,
  "updated_at": "2025-08-22T15:10:00Z"
}
```

#### `GET /attempts/{attemptId}`

##### Query Params

- attemptId: ID of a specific attempt.

##### Response

Gets a specific attempt with the given ID.

```json
{
  "id": "1",
  "quiz_id": "1",
  "user_id": "1",
  "answer_selections": "",
  "is_finished": 0,
  "time_elapsed": 0,
  "score": null,
  "updated_at": "2025-08-22T15:10:00Z"
}
```

#### `POST /attempts/{attemptId}/answer`

##### Query Params

- `attemptId`: ID of the attempt to update.

##### Request

The request should contain a body of stringified JSON of answer selections to be graded. The JSON is key-value pair of question ID and the answer.

```json
"{\"1\": \"Chicken bone\", \"2\": \"Cow bone\", \"3\": \"Example answer about bone here\"}"
```

##### Response

Updates the specified attempt field `answer_selections` with a JSON blob. The JSON blob is a key-value pair of question ID and the answer choice/text selected by the student.

```json
{
  "id": "1",
  "quiz_id": "1",
  "user_id": "1",
  "answer_selections": "{\"1\": \"Chicken bone\", \"2\": \"Cow bone\", \"3\": \"Example answer about bone here\"}",
  "is_finished": 0,
  "time_elapsed": 0,
  "score": null,
  "updated_at": "2025-08-22T15:10:00Z"
}
```

#### `POST /attempts/{attemptId}/finish`

##### Query Params

- `attemptId`: ID of the attempt to complete.

##### Request

The request should contain a body of stringified JSON of answer selections to be graded. The JSON is key-value pair of question ID and the answer.

```json
"{\"1\": \"Chicken bone\", \"2\": \"Cow bone\", \"3\": \"Final answer about bone here\"}"
```

##### Response

Updates the specified attempt to mark a completed quiz attempt. This means the attempt is graded and should have a score.

```json
{
  "id": "1",
  "quiz_id": "1",
  "user_id": "1",
  "answer_selections": "{\"1\": \"Tibia\", \"2\": \"Tibia\", \"3\": \"Example answer here\"}",
  "is_finished": 1,
  "time_elapsed": 2495,
  "score": 4,
  "updated_at": "2025-08-22T15:10:00Z"
}
```

## 5. Error Catalog

Not implemented yet, but these are possible errors for invalid answer selection payload, mismatching userId on an attempt, etc.

- `400 invalid_payload`
- `401 unauthorized`
- `404 not_found`

# Trade offs

- _Updating answer choices on every question advance._ The choices are important data to save because they directly influence the final score. The final score is a part of licensure or employment success so should be treated with high fidelity and security.

# TODO (Must haves)

- Handle edge cases like invalid payload on `POST`
- `quiz` should have a `version` column and `attempt` should have a corresponding `quiz_version` so outdated attempts should be invalidated.
- Needs a multiple choice question grading handler.
- Needs to implement LLM for grading short answer questions.
- A handler to grade and return feedback and score.
- Idempotency key to prevent double submit.

# Future features (Nice to haves)

- _Question answer key table._ Answer keys could have been stored by a hashed column on the quiz_questions table. But an entirely separate table is better for least privilege and allows audit. Can help prevent leaks because the endpoints that fetch quizzes never touch this table. Cons is that you have to do an extra join when grading, introduces more code lift and latency, and possible schema drift.
- A middleware for `attempt.user_id` ownership check.
- Add an explicit field to `quiz_question` schema to specify multiple choice or free text instead of inferring from `choices` value.
- More metrics stored in attempts, like time taken, how many times paused, and final score. Maybe metrics that can be used to build a growth plan for the student.
- In production, I would not use autoincrementing integer as the primary key of a table.
- Technically you could perhaps grade both MCQ and FT (free text) questions with LLM, but could incur increased infrastructural cost.
