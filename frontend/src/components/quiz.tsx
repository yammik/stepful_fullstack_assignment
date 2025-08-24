import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { quizPath } from "@/paths";
import { Link } from "react-router-dom";

export type Quiz = {
	id: number;
	title: string;
};

export type QuizRow = Quiz & {
	inProgress: boolean;
};

function QuizRow({ title, id, inProgress }: QuizRow) {
	return (
		<TableRow key={id}>
			<TableCell>{id}</TableCell>
			<TableCell>{title}</TableCell>
			<TableCell>{inProgress ? <p>In progress</p> : null}</TableCell>
			<TableCell>
				<Button asChild>
					<Link to={quizPath({ id: id.toString() })}>View Quiz</Link>
				</Button>
			</TableCell>
		</TableRow>
	);
}

export function QuizzesList({ quizzes }: { quizzes: QuizRow[] }) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Progress</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>{quizzes.map((quiz) => QuizRow(quiz))}</TableBody>
		</Table>
	);
}
