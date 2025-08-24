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

	const ensureCreateAttempt = useCallback((quizId: string) => {
		fetch(quizActiveAttemptApiUrl({ id: quizId }))
			.then((res) => res.json())
			.then((json) => {
				if (json.data) {
					setAttempt(json.data);
					return;
				}
				fetch(quizAttemptApiUrl({ id: quizId }), {
					method: "POST",
				})
					.then((res) => res.json())
					.then((json) => setAttempt(json.data));
			});
	}, []);

	const updateAnswerSelections = useCallback(
		(body: string) => {
			if (!attempt) return;

			fetch(attemptAnswerApiUrl({ id: String(attempt.id) }), {
				method: "POST",
				body,
			})
				.then((res) => res.json())
				.then((json) => setAttempt(json.data));
		},
		[attempt],
	);

	const finishAttempt = useCallback(
		(body: string) => {
			if (!attempt) return;

			fetch(attemptFinishApiUrl({ id: String(attempt.id) }), {
				method: "POST",
				body,
			})
				.then((res) => res.json())
				.then((json) => {
					setAttempt(json.data);
					setStep(Step.Result);
				});
		},
		[attempt],
	);

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
						onNext={() => {
							ensureCreateAttempt(String(quiz.id));
							setStep(Step.Questions);
						}}
					/>
				);
			case Step.Questions:
				if (!attempt) {
					// TODO: Better error/edge case handling here
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
		ensureCreateAttempt,
		updateAnswerSelections,
		finishAttempt,
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
