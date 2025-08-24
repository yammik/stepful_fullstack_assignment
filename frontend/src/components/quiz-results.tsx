import type { Attempt } from "./attempt";

interface QuizResultsProps {
	attempt: Attempt;
}
export function QuizResults({ attempt }: QuizResultsProps) {
	/**
	 * TODO: A more helpful results view.
	 * - User should see their selected answers (requires answer_key)
	 * - User should see the correct answer for each question, i.e. did they get it right?
	 * - User should see feedback for each question
	 * - User should see tallied up score (requires score property)
	 * - (debatable) User should see how long it took to finish the quiz
	 */
	return (
		<div>
			You have finished.
			<div>
				{/* stats */}
				<p>Begun at: {attempt.created_at}</p>
				<p>Finished at: {attempt.updated_at}</p>
			</div>
		</div>
	);
}
