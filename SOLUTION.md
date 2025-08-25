# Solution

By May Kim | mkim0514@gmail.com

## Notes on implementation

- I added README.md to both frontend and backend. I know how much work goes into interviewing candidates so please feel free to skip reading them. I've used the frontend one to keep track of tasks and future improvements, and the backend one has a bit more of an API documentation style in addition to the future optimizations.
- It's probably fairly obvious upon opening the app, but I've focused more on the API functionalities than on frontend to limit the scope for this take-home. I basically developed the UI only to the point of being able to test the API. I promise I like to make things look pretty too!
- While I've tried to optimize for UX clarity and good practice of not making mutations without explicit input from the user, I made an exception for the progress saving UX. I didn't think it would be realistic to make the student remember to hit the save button in the middle of a quiz. Taking tests is nervewracking enough (some folks have bad anxiety about it), so I didn't want to add the mental burden of remembering to save the progress. I wanted the save frequency to be frequent enough to save progress as real-time as possible. There is definitely room to improve UX and performance here, though.
- I would have used cache for some of the things that are stored in state in this take home, e.g. list of quizzes or attempts. I kept `useState` for this take-home because adding caching would have added a considerable amount of QA surface area.

## Feedback for Stepful

Thank you for the boilerplate–it did save tons of time. Sometimes having some constraint helps speed things along. I appreciated the real-life relevance to the problem domain as well.
