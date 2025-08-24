import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout";
import { QuizDetailsPage } from "@/pages/quiz-details";
import { RootPage } from "@/pages/root";
import { rootPath, quizPath } from "@/paths";

const router = createBrowserRouter([
	{
		path: rootPath.pattern,
		element: <Layout />,
		children: [
			{
				path: rootPath.pattern,
				element: <RootPage />,
			},
			{
				path: quizPath.pattern,
				element: <QuizDetailsPage />,
			},
		],
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
