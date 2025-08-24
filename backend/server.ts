import cors from "@fastify/cors";
import fastify, {
	type FastifyPluginCallback,
	type RouteGenericInterface,
} from "fastify";
import { db } from "./db-client";
import type { Question, Quiz, User } from "./model";

declare module "fastify" {
	interface FastifyRequest {
		user?: { id: string };
	}
}

interface QuizzesRouteGeneric extends RouteGenericInterface {
	Params: {
		id: string;
	};
}

const authMiddleware: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.decorateRequest("user", null);

	fastify.addHook("preHandler", (req, _reply, done) => {
		// stub: Get user here

		req.user = { id: "1" };
		done();
	});

	done();
};

const server = fastify();

server.register(cors, {});
server.register(authMiddleware);

const PORT = +(process.env.BACKEND_SERVER_PORT ?? 3001);

server.get("/", async (_request, _reply) => {
	return "hello world\n";
});

server.get("/users", (_request, reply) => {
	const data = db.prepare<[], User[]>("SELECT * FROM users").all();

	reply.send({ data });
});

/** GET /me fetches the session user's details (hardcoded in demo)  */
server.get("/me", (request, reply) => {
	const data = db.prepare<{ id: string }, User[]>(
		"SELECT * FROM users WHERE id = :id",
	);

	reply.send({ data: data.get({ id: request.user?.id ?? "1" }) });
});

/** GET /quizzes fetches all quizzes */
server.get("/quizzes", (_request, reply) => {
	const data = db.prepare<[], Quiz[]>("SELECT * FROM quizzes").all();

	reply.send({ data });
});

/** GET /quizzes/:id fetches a quiz */
server.get<QuizzesRouteGeneric>("/quizzes/:id", (request, reply) => {
	const data = db.prepare<{ id: string }, Quiz>(
		"SELECT * FROM quizzes WHERE id = :id",
	);

	reply.send({ data: data.get({ id: request.params.id }) });
});

/** GET /quizzes/:id/questions fetches all questions for a quiz */
server.get<QuizzesRouteGeneric>("/quizzes/:id/questions", (request, reply) => {
	const data = db.prepare<{ id: string }, Question[]>(`
		SELECT *
		FROM quiz_questions
		WHERE quiz_id = :id
	`);

	reply.send({ data: data.all({ id: request.params.id }) });
});

/**
 * Run server
 */
server.listen({ port: PORT }, (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at http://localhost:${PORT}`);
});
