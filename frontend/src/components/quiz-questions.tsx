import type { Attempt } from "@/components/attempt";
import type { Quiz } from "@/components/quiz";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { questionsApiUrl } from "@/paths";
import { useCallback, useEffect, useState } from "react";
import {
	Controller,
	useForm,
	type ControllerRenderProps,
	type FieldValues,
} from "react-hook-form";
import { Button } from "./ui/button";

type Question = {
	id: number;
	questionContent: string;
	choices: string[];
};

interface QuizQuestionsProps {
	quiz: Quiz;
	attempt: Attempt;
	onUpdate(body: string): void;
	onFinish(body: string): void;
}

export function QuizQuestions({
	quiz,
	attempt,
	onUpdate,
	onFinish,
}: QuizQuestionsProps) {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		// on mount, get questions for this quiz
		fetch(questionsApiUrl({ quizId: String(quiz.id) }))
			.then((res) => res.json())
			.then((json) => {
				const questionsData = json.data?.map(
					(d: {
						id: string;
						question_content: string;
						choices: string | null;
					}) => {
						return {
							id: d.id,
							questionContent: d.question_content,
							choices: d.choices?.split(";;") ?? null,
						};
					},
				);
				setQuestions(questionsData);
			})
			.catch(setError);
	}, [quiz]);

	const methods = useForm({
		defaultValues: JSON.parse(attempt.answer_selections),
	});

	const onSubmit = useCallback(
		(values: FieldValues) => {
			onFinish(JSON.stringify(values));
		},
		[onFinish],
	);

	useEffect(() => {
		const callback = methods.subscribe({
			formState: {
				values: true,
			},
			callback: ({ values }) => {
				onUpdate(JSON.stringify(values));
			},
		});

		return () => callback();
	}, [onUpdate, methods.subscribe]);

	return (
		<div className="container text-sm/7">
			<Form {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<ol>
						{questions.map((q) => {
							const questionId = String(q.id);
							return (
								<li key={q.id}>
									<fieldset className="mb-4">
										<Controller
											name={questionId}
											control={methods.control}
											render={({ field }) => (
												<>
													<legend>{q.questionContent}</legend>
													{q.choices ? (
														<MultipleChoiceQuestion
															questionId={questionId}
															choices={q.choices}
															field={field}
														/>
													) : (
														<FreeTextQuestion
															field={field}
															questionId={questionId}
														/>
													)}
												</>
											)}
										/>
									</fieldset>
								</li>
							);
						})}
					</ol>
					<Button type="submit">Submit Quiz</Button>
					{error ? <p>An error has occurred: {error.message}</p> : null}
				</form>
			</Form>
		</div>
	);
}

interface QuestionProps {
	questionId: string;
	field: ControllerRenderProps;
}

interface MultipleChoiceQuestionProps extends QuestionProps {
	choices: string[];
}

function MultipleChoiceQuestion({
	questionId,
	choices,
	field,
}: MultipleChoiceQuestionProps) {
	return (
		<>
			<RadioGroup
				value={field.value ?? ""}
				onValueChange={field.onChange}
				aria-label={`Question ${questionId}`}
			>
				{choices.map((c, i) => {
					const key = `${questionId}&${i}`;
					return (
						<div key={key} style={{ display: "flex" }}>
							<RadioGroupItem id={key} value={c} />
							<Label htmlFor={key}>{c}</Label>
						</div>
					);
				})}
			</RadioGroup>
		</>
	);
}

function FreeTextQuestion({ questionId, field }: QuestionProps) {
	return (
		<div>
			<textarea
				id={questionId}
				value={field.value ?? ""}
				onChange={field.onChange}
				onBlur={field.onBlur}
				placeholder="Type your answer"
				aria-label={`Question ${questionId}`}
			/>
		</div>
	);
}
