# Quizard UI

This is the frontend of the quiz app, Quizard. Once you run `npm run dev` in the root of this repository, you can reach the frontend at http://localhost:3000 or whatever you have set `VITE_FRONTEND_SERVER_PORT` to.

# Diagram of resume attempt flow
<img width="3349" height="2292" alt="Stepful_take_home_resume_client_flow-2" src="https://github.com/user-attachments/assets/d40de13d-f50f-48df-b1ea-1ae54d8ac934" />

# TODO (must haves)

- [ ] Progress percentage while attempting a quiz
- [ ] Modify RHF watch so free text answer gets updated onBlur, or less frequently (not on every keystroke)
- [ ] Text input style standardized with radix
- [ ] Graded attempt view with score and feedback
- [ ] Autosave progress with debounce instead of on change event
- [ ] Debounce refresh of attempt state instead of refresh on window wake

# Future features (Nice to haves)

- View of all past quiz attempts
- View metrics on attempts (scores, time taken, etc)
- Shuffle the question/choice order to improve test integrity
- In Quiz list view, hoist quizzes that were most recently attempted but not finished
- Replace some of the client state management with React Query cache. I kept `useState` for this take-home because adding caching would have added a considerable amount of QA surface area.
- API performance metrics, more advanced error logging
