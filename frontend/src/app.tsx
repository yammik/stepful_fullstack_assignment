import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout";
import { QuizPage } from "@/pages/quiz";
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
				element: <QuizPage />,
			},
		],
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
