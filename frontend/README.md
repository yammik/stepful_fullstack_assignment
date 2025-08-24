# Quizard UI

This is the frontend of the quiz app, Quizard. Once you run `npm run dev` in the root of this repository, you can reach the frontend at http://localhost:3000 or whatever you have set `VITE_FRONTEND_SERVER_PORT` to.

# TODO

- [ ] Error handling in QuizQuestions
- [ ] Progress percentage
- [ ] Modify RHF watch so free text answer gets updated onBlur, or less frequently (not on every keystroke)
- [ ] Text input style standardized with radix
- [ ] Graded attempt view with score and feedback

# Nice to have (future feature)

- Metrics on attempts (scores, time taken, etc)
- Autosave progress with debounce instead of on update
- Debounce refresh of attempt state
- Shuffle the question/choice order to improve test integrity
- Progress percentage based on number of questions solved
- View of all past quiz attempts
- In Quiz list view, hoist quizzes that were most recently attempted but not finished

# Trade offs

- Implicit UX flow vs. clarity, re: attempt resume/create. The UI-API interaction could have been more granular for clarity of the data flow, instead of combining read and create in one endpoint. For the sake of smoother UX (because testing anxiety is real and doesn't need to be exacerbated with slow UX), I chose to combine the operations into one endpoint.
- In production, I would use cache instead of state to observe attempts and invalidate cache frequently or refetch on window focus to prevent showing stale attempts. As it is possible for the user to pause on one browser window or computer and resume in another, a stale attempt state could be confusing and even introduce a pathway to corrupt the attempt data. So some sort of mechanism to keep client state fresh is necessary.
