# Quizard UI

This is the frontend of the quiz app, Quizard. Once you run `npm run dev` in the root of this repository, you can reach the frontend at http://localhost:3000 or whatever you have set `VITE_FRONTEND_SERVER_PORT` to.

# TODO

- [x] Quiz preview page
- [x] Begin quiz flow (get questions, read/create attempt)
- [x] Question flow
- [x] Select answer choice
- [x] save progress on select
- [ ] Submit quiz for grading flow (update attempt to set finished=1)
- [ ] Exit out of quiz, resume.

# Nice to have (future feature)

- [ ] per-user metrics
- [ ] Autosave progress with debounce

# Notes about what I did

- I did not implement a dedicated `GET /quizzes/{id}` endpoint, since `GET /quizzes` returns all the necessary data to display a detail page for each quiz.
- Also in production, mixing up the question/choice order would be a consideration.

# Trade offs

- implicit UX flow vs. clarity, re: attempt resume/create. In production, I would use cache instead of state to observe attempts and invalidate cache frequently or refetch on window focus to prevent showing stale attempts.
