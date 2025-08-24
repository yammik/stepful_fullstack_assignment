export type Attempt = {
	id: number;
	quiz_id: number;
	is_finished: boolean;
	answer_selections: string;
	time_elapsed: number;
	score: number;
	created_at: string;
	updated_at: string;
};
