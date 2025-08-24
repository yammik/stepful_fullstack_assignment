import type { Attempt } from "@/components/attempt";
import type { Quiz } from "@/components/quiz";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { attemptAnswerApiUrl, questionsApiUrl } from "@/paths";
import { TextField } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";
import { Controller, type FieldValues, useForm } from "react-hook-form";

type Question = {
	id: number;
	question_content: string;
	choices: string[];
};

export function QuizQuestions({
	quiz,
	attempt,
}: { quiz: Quiz; attempt: Attempt }) {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		// on mount, get questions for this quiz
		fetch(questionsApiUrl({ quizId: String(quiz.id) }))
			.then((res) => res.json())
			.then((json) => {
				const questionSet = json.data?.map(
					(d: Question & { choices: string | null }) => {
						return {
							id: d.id,
							question_content: d.question_content,
							choices: d.choices?.split(";;") ?? null,
						};
					},
				);
				setQuestions(questionSet);
			})
			.catch(setError);
	}, [quiz]);

	const methods = useForm({
		defaultValues: JSON.parse(attempt.answer_selections),
	});

	const onSubmit = useCallback((values: FieldValues) => {
		console.log(values);
	}, []);

	useEffect(() => {
		const callback = methods.subscribe({
			formState: {
				values: true,
			},
			callback: ({ values }) => {
				console.log("updating attempt");

				fetch(attemptAnswerApiUrl({ id: String(attempt.id) }), {
					method: "POST",
					body: JSON.stringify(values),
				});
			},
		});

		return () => callback();
	}, [attempt, methods.subscribe]);

	return (
		<Form {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				{questions.map((q) => {
					const questionId = String(q.id);
					return (
						<div key={q.id}>
							{q.choices ? (
								// Multiple choice
								<Controller
									name={questionId}
									control={methods.control}
									render={({ field }) => (
										<>
											<p>{q.question_content}</p>
											<RadioGroup
												value={field.value ?? ""}
												onValueChange={field.onChange}
												aria-label={`Question ${q.id}`}
											>
												{q.choices?.map((c, i) => {
													const key = `${q.id}&${i}`;
													return (
														<div key={key} style={{ display: "flex" }}>
															<RadioGroupItem id={key} value={c} />
															<Label htmlFor={key}>{c}</Label>
														</div>
													);
												})}
											</RadioGroup>
										</>
									)}
								/>
							) : (
								// Free text
								<Controller
									name={questionId}
									control={methods.control}
									render={({ field }) => (
										<div>
											<Label htmlFor={questionId}>{q.question_content}</Label>
											<input
												{...field}
												id={questionId}
												onChange={field.onChange}
											/>
										</div>
									)}
								/>
							)}
						</div>
					);
				})}
			</form>
		</Form>
	);
}
