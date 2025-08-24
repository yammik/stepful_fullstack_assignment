# API Docs – Quiz App

## 1. Overview

Environments

- Local dev server [http://localhost:3001](http://localhost:3001)

## 2. Authentication

A middleware is sketched out with a hardcoded user ID in this demo. Incoming requests to all routes in this API are decorated with the user ID.

## 3. Endpoints Reference

### 3.1 Quizzes

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

## 5. Schemas

Quiz

```json
{
  "id": "string",
  "title": "Skeletal Systems Basics",
  "created_at": "2025-08-22T15:10:00Z"
}
```

Question

```json
{
  "id": "string",
  "quiz_id": "string",
  "question_content": "What is the common name for the clavicle?",
  "choices": "Collarbone;;Wishbone;;Shoulderblade;;Neckbone",
  "created_at": "2025-08-22T15:10:00Z"
}
```

Error

```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```

## 6. Error Catalog

Not implemented yet, but these are possible errors for invalid answer selection payload

- 400 invalid_payload
- 401 unauthorized
- 404 not_found
- 409 conflict_out_of_order or conflict_duplicate_submit
