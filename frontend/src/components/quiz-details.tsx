import { Button } from "./ui/button";

export function QuizDetails({
	title,
	hasAttempt,
	onNext,
}: { title: string; hasAttempt: boolean; onNext(): void }) {
	return (
		<>
			<p>{title}</p>
			{hasAttempt ? (
				<div>You have an incomplete attempt to finish this quiz.</div>
			) : null}
			<Button onClick={() => onNext()}>
				{hasAttempt ? "Resume " : "Begin "}Quiz
			</Button>
		</>
	);
}
