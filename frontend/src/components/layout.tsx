import { Link, Outlet } from "react-router-dom";
import { rootPath } from "@/paths";

export function Layout() {
	return (
		<div className="container my-5 mx-auto">
			<div className="flex justify-between items-center pb-3 border-b-2 mb-3">
				<h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight group">
					<Link to={rootPath.pattern}>
						Quiz
						<span className="group-hover:scale-[1.2] transition-transform duration-300 inline-block">
							🧠
						</span>
						<span className="text-primary">Wizard</span>
					</Link>
				</h1>
			</div>

			<Outlet />
		</div>
	);
}
