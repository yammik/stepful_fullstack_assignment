import { Button } from "./ui/button";

export function QuizView({
	title,
	hasAttempt,
	onNext,
}: { title: string; hasAttempt: boolean; onNext(): void }) {
	return (
		<>
			<p>{title}</p>
			{hasAttempt ? (
				<>
					<div>You have an incomplete attempt to finish this quiz.</div>
					<Button onClick={() => onNext()}>Resume Quiz</Button>
				</>
			) : (
				<Button onClick={() => onNext()}>Begin Quiz</Button>
			)}
		</>
	);
}
