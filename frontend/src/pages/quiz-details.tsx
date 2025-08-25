import type { Attempt } from "@/components/attempt";
import type { Quiz } from "@/components/quiz";
import { QuizDetails } from "@/components/quiz-details";
import { QuizQuestions } from "@/components/quiz-questions";
import { QuizResults } from "@/components/quiz-results";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	attemptAnswerApiUrl,
	attemptApiUrl,
	attemptFinishApiUrl,
	quizActiveAttemptApiUrl,
	quizApiUrl,
	quizAttemptApiUrl,
	rootPath,
} from "@/paths";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

enum Step {
	Details = 0,
	Questions = 1,
	Result = 2,
}

export function QuizDetailsPage() {
	const { id } = useParams();
	if (!id) throw new Error("Quiz id param is required");

	const [step, setStep] = useState<Step>(Step.Details);

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [attempt, setAttempt] = useState<Attempt>();
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		fetch(quizApiUrl({ id }))
			.then((res) => res.json())
			.then((json) => setQuiz(json.data))
			.catch(setError);

		fetch(quizActiveAttemptApiUrl({ id }))
			.then((res) => res.json())
			.then((json) => setAttempt(json.data))
			.catch(setError);
	}, [id]);

	const getAttempt = useCallback((attemptId: string) => {
		// Does this user already have an active attempt at this quiz?
		return fetch(attemptApiUrl({ id: attemptId }))
			.then((res) => {
				if (res.status === 401) {
					// TODO: Log out if user doesn't own this attempt
					setError(new Error("Unauthorized"));
				}
				if (res.status === 404) {
					throw new Error("Attempt not found: please refresh the page.");
				}
				if (!res.ok) {
					throw new Error(`Error while fetching attempt: ${res.status}`);
				}
				return res.json();
			})
			.catch(setError);
	}, []);

	const ensureCreateAttempt = useCallback((quizId: string) => {
		return fetch(quizAttemptApiUrl({ id: quizId }), {
			method: "POST",
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Error while creating attempt: ${res.status}`);
				}
				return res.json();
			})
			.catch(setError);
	}, []);

	const updateAnswerSelections = useCallback(
		(body: string) => {
			if (!attempt) return;

			fetch(attemptAnswerApiUrl({ id: attempt.id.toString() }), {
				method: "POST",
				body,
			})
				.then((res) => {
					if (res.status === 401) {
						// TODO: Log out if 401
						throw new Error("Unauthorized");
					}
					if (res.status === 404) {
						// TODO: return to homepage if 404
						throw new Error("Not Found");
					}
					if (!res.ok) {
						throw new Error(
							`Error while updating answer selections: ${res.status}`,
						);
					}
				})
				.catch(setError);
		},
		[attempt],
	);

	const finishAttempt = useCallback(
		(body: string) => {
			if (!attempt) return;

			fetch(attemptFinishApiUrl({ id: attempt.id.toString() }), {
				method: "POST",
				body,
			})
				.then((res) => {
					if (res.status === 401) {
						// TODO: Log out if 401
						throw new Error("Unauthorized");
					}
					if (res.status === 404) {
						// TODO: return to homepage if 404
						throw new Error("Not Found");
					}
					if (!res.ok) {
						throw new Error(
							`Error while submitting final answers: ${res.status}`,
						);
					}
					return res.json();
				})
				.then((json) => {
					setAttempt(json.data);
					setStep(Step.Result);
				})
				.catch(setError);
		},
		[attempt],
	);

	const handleBeginQuiz = useCallback(() => {
		if (!quiz) return;
		// Refresh state if there is an attempt in state
		// Stale attempt data will cause error and prompt the user to refresh
		// If there isn't create one
		const action = attempt
			? getAttempt(attempt.id.toString())
			: ensureCreateAttempt(quiz?.id.toString());
		action.then((json) => {
			if (json.data) {
				setAttempt(json.data);
				setStep(Step.Questions);
			}
		});
	}, [quiz, attempt, getAttempt, ensureCreateAttempt]);

	const StepContent = useCallback(() => {
		if (!quiz) {
			return null;
		}
		switch (step) {
			case Step.Details:
				return (
					<QuizDetails
						title={quiz.title}
						hasAttempt={!!attempt}
						onNext={() => handleBeginQuiz()}
					/>
				);
			case Step.Questions:
				if (!attempt) {
					return <div className="text-center p-8">Loading...</div>;
				}
				return (
					<QuizQuestions
						quiz={quiz}
						attempt={attempt}
						onUpdate={updateAnswerSelections}
						onFinish={finishAttempt}
					/>
				);
			case Step.Result:
				if (!attempt) {
					return (
						// TODO: Better error/edge case handling here
						<div className="text-center p-8">No attempt result to view</div>
					);
				}
				return <QuizResults attempt={attempt} />;
		}
	}, [
		step,
		quiz,
		attempt,
		updateAnswerSelections,
		finishAttempt,
		handleBeginQuiz,
	]);

	if (error)
		return (
			<div className="text-red-500 p-4">
				<p className="font-bold mb-1">An error has occurred:</p>
				<p>{error.message}</p>
			</div>
		);

	if (!quiz) return <div className="text-center p-8">Loading...</div>;

	return (
		<Card className="w-[600px] mx-auto">
			<CardHeader className="pb-8">
				<CardTitle>Quiz #{quiz.id}</CardTitle>
				<CardDescription>Quiz details below...</CardDescription>
			</CardHeader>
			<CardContent>
				<StepContent />
			</CardContent>
			<CardFooter className="flex justify-between pt-8">
				<Link
					to={rootPath.pattern}
					className="text-muted-foreground hover:text-blue-600"
				>
					Back to home page
				</Link>
			</CardFooter>
		</Card>
	);
}
