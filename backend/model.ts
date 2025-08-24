export interface Attempt {
	id: number;
	user_id: number;
	quiz_id: number;
	is_finished: boolean;
	answer_selections: string | undefined;
	time_elapsed: number | undefined;
	score: number | undefined;
	created_at: Date;
	updated_at: Date;
}

export interface Quiz {
	id: number;
	title: string;
	created_at: Date;
}

export interface Question {
	id: number;
	quiz_id: number;
	question_content: string;
	choices: string;
	created_at: Date;
}

export interface User {
	id: number;
	name: string;
	email: string;
}
