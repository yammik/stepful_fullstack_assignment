import type { Attempt } from "@/components/attempt";
import { type Quiz, type QuizRow, QuizzesList } from "@/components/quiz";
import { attemptsApiUrl, quizzesApiUrl } from "@/paths";
import { useEffect, useMemo, useState } from "react";

export function RootPage() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [attempts, setAttempts] = useState<Attempt[]>([]);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		fetch(quizzesApiUrl({}))
			.then((res) => res.json())
			.then((json) => setQuizzes(json.data))
			.catch(setError);

		function getAttempts() {
			fetch(attemptsApiUrl({}))
				.then((res) => res.json())
				.then((json) => setAttempts(json.data))
				.catch(setError);
		}

		// Load attempts
		getAttempts();
		// TODO: event-based for this take home for low lift. Would use debounce for more up-to-date attempts state.
		window.addEventListener("focus", getAttempts);

		return () => window.addEventListener("focus", getAttempts);
	}, []);

	const quizRowItems = useMemo<QuizRow[]>(() => {
		const attemptMap = new Map<number, Attempt>(
			attempts.map((a) => [a.quiz_id, a]),
		);

		return quizzes.map((q) => {
			const attempt = attemptMap.get(q.id);
			return { ...q, inProgress: !!attempt, attemptId: attempt?.id };
		});
	}, [quizzes, attempts]);

	if (error) return <div>An error has occurred: {error.message}</div>;

	if (!quizzes) return <div className="text-center p-8">Loading...</div>;

	return (
		<>
			<div className="text-xl text-muted-foreground mt-5">Welcome back!</div>
			<div className="mt-10 text-lg text-center">
				<QuizzesList quizzes={quizRowItems} />
			</div>
		</>
	);
}
