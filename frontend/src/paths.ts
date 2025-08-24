import { type Params, path as pathFactory } from "static-path";

const SERVER_HOST = import.meta.env.VITE_BACKEND_SERVER || "localhost:3001";
const SERVER_ORIGIN = `http://${SERVER_HOST}`;

const apiUrlFactory = <T extends string>(pattern: T) => {
	const builder = pathFactory(pattern);
	return (params: Params<T>) => SERVER_ORIGIN + builder(params);
};

// api urls
export const userApiUrl = apiUrlFactory("/users/:id");
export const quizzesApiUrl = apiUrlFactory("/quizzes");
export const quizApiUrl = apiUrlFactory("/quizzes/:id");
export const quizActiveAttemptApiUrl = apiUrlFactory(
	"/quizzes/:id/attempts/active",
);
export const quizAttemptApiUrl = apiUrlFactory("/quizzes/:id/attempts");
export const questionsApiUrl = apiUrlFactory("/quizzes/:quizId/questions");
export const attemptsApiUrl = apiUrlFactory("/attempts");
export const attemptApiUrl = apiUrlFactory("/attempts/:id");
export const attemptAnswerApiUrl = apiUrlFactory("/attempts/:id/answer");
export const attemptFinishApiUrl = apiUrlFactory("/attempts/:id/finish");

// local routes
export const rootPath = pathFactory("/");
export const quizPath = pathFactory("/quiz/:id");
export const quizzesPath = pathFactory("/quiz");
export const quizQuestionsPath = pathFactory("/quiz/:id/questions");
