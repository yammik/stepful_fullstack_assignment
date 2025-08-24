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
