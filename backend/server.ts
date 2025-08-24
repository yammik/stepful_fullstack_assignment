import cors from "@fastify/cors";
import fastify, {
	type FastifyPluginCallback,
	type RouteGenericInterface,
} from "fastify";
import { db } from "./db-client";
import type { Attempt, Question, Quiz, User } from "./model";

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

interface AttemptsRouteGeneric extends RouteGenericInterface {
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

	return { data };
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

const ATTEMPTS_BASE_QUERY =
	"id, quiz_id, answer_selections, is_finished, created_at, updated_at";
const ATTEMPTS_TABLE_NAME = "attempts";

/** POST /quizzes/:id/attempts reads or creates an attempt for a quiz */
server.post<QuizzesRouteGeneric>("/quizzes/:id/attempts", (request, reply) => {
	const userId = String(request.user?.id ?? 1);
	const quizId = String(request.params.id);

	// Do they already have an active attempt for this quiz?
	const data = db.prepare<{ userId: string; quizId: string }, Attempt>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE user_id = :userId
			AND quiz_id = :quizId
			AND is_finished = 0
		`);

	const attempt = data.get({ userId, quizId });

	if (attempt) {
		reply.send({ data: attempt });
	}

	// Otherwise, make a new attempt
	const insertStmt = db.prepare<{ userId: string; quizId: string }, Attempt>(`
		INSERT INTO attempts
			(user_id, quiz_id)
		VALUES
			(:userId, :quizId)
	`);
	const insert = insertStmt.run({ userId, quizId });

	const newAttempt = db.prepare<{ id: string }, Attempt>(`
			SELECT
				${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE id = :id
		`);

	reply.send({ data: newAttempt.get({ id: String(insert.lastInsertRowid) }) });
});

/** GET /attempts fetches all attempts belonging to a user across all quizzes */
server.get("/attempts", (request, reply) => {
	const userId = String(request.user?.id ?? 1);
	const data = db.prepare<{ userId: string }, Attempt[]>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE user_id = :userId
		`);

	reply.send({ data: data.all({ userId }) });
});

/** GET /attempts/{id} fetches a user-scoped quiz attempt by ID */
server.get<AttemptsRouteGeneric>("/attempts/:id", (request, reply) => {
	const userId = String(request.user?.id ?? 1);
	const data = db.prepare<{ id: string; userId: string }, Attempt>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE id = :id
			AND user_id = :userId
		`);

	reply.send({ data: data.get({ id: request.params.id, userId }) });
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
