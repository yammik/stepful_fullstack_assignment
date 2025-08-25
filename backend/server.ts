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

const ATTEMPTS_BASE_QUERY =
	"id, quiz_id, answer_selections, is_finished, created_at, updated_at";
const ATTEMPTS_TABLE_NAME = "attempts";

/** GET /quizzes/:id/attempts/active fetches any unfinished attempt for the specified quiz */
server.get<QuizzesRouteGeneric>(
	"/quizzes/:id/attempts/active",
	(request, reply) => {
		const userId = request.user?.id ?? "1";
		const query = db.prepare<{ userId: string; quizId: string }, Attempt>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE user_id = :userId
			AND quiz_id = :quizId
			AND is_finished = 0
		`);
		const data = query.get({
			userId,
			quizId: request.params.id,
		});
		// In this case, query may not return any data and that's part of the expected behavior

		reply.send({ data });
	},
);

/** POST /quizzes/:id/attempts reads or creates (=ensure create) an attempt for a quiz */
server.post<QuizzesRouteGeneric>("/quizzes/:id/attempts", (request, reply) => {
	const userId = String(request.user?.id ?? 1);
	const quizId = String(request.params.id);

	// Do they already have an active attempt for this quiz?
	const query = db.prepare<{ userId: string; quizId: string }, Attempt>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE user_id = :userId
			AND quiz_id = :quizId
			AND is_finished = 0
		`);
	const attempt = query.get({ userId, quizId });

	if (attempt) {
		reply.send({ data: attempt });
		return;
	}

	// If not, make a new attempt
	const insertQuery = db.prepare<{ userId: string; quizId: string }, Attempt>(`
		INSERT INTO attempts
			(user_id, quiz_id)
		VALUES
			(:userId, :quizId)
	`);
	const insert = insertQuery.run({ userId, quizId });

	const updatedQuery = db.prepare<{ id: string }, Attempt>(`
			SELECT
				${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE id = :id
		`);

	reply.send({
		data: updatedQuery.get({ id: String(insert.lastInsertRowid) }),
	});
});

/** GET /attempts fetches all active (unfinished) attempts belonging to a user across all quizzes */
server.get("/attempts", (request, reply) => {
	const userId = String(request.user?.id ?? 1);
	// TODO: Add a query param to allow filtering active/finished attempts
	const query = db.prepare<{ userId: string }, Attempt[]>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE user_id = :userId
			AND is_finished = 0
		`);

	reply.send({ data: query.all({ userId }) });
});

/** GET /attempts/{id} fetches a user-scoped active quiz attempt by ID */
server.get<AttemptsRouteGeneric>("/attempts/:id", (request, reply) => {
	const userId = String(request.user?.id ?? 1);
	// TODO: enable querying for finished attempts via query params
	const query = db.prepare<{ id: string; userId: string }, Attempt>(`
			SELECT ${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE id = :id
			AND user_id = :userId
			AND is_finished = 0
		`);

	const data = query.get({ id: request.params.id, userId });
	if (!data) {
		reply.code(404).send({ error: "Could not find attempt" });
		return;
	}
	reply.send({ data });
});

/** POST /attempts/:id/answer updates an attempt with answer selections */
server.post<AttemptsRouteGeneric>("/attempts/:id/answer", (request, reply) => {
	// Verify attempt belongs to this user
	const userId = request.user?.id ?? 1;
	const query = db.prepare<{ id: string }, Attempt>(`
		SELECT user_id FROM ${ATTEMPTS_TABLE_NAME} WHERE id = :id
		`);
	const attempt = query.get({ id: request.params.id });

	if (!attempt || attempt.user_id !== userId) {
		// Attempt with this ID does not exist for calling user
		reply.code(404).send({ error: "Could not find attempt" });
		return;
	}

	if (attempt.is_finished) {
		// Prevent updating an already finished attempt
		reply.code(403).send({ error: "Cannot update attempt" });
		return;
	}

	// Update answer selections
	const updateQuery = db.prepare(`
		UPDATE ${ATTEMPTS_TABLE_NAME}
		SET answer_selections = :answerSelections,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = :id
	`);
	updateQuery.run({
		id: request.params.id,
		answerSelections: request.body,
	});

	const newAttemptQuery = db.prepare<{ id: string }, Attempt>(`
		SELECT ${ATTEMPTS_BASE_QUERY}
		FROM ${ATTEMPTS_TABLE_NAME}
		WHERE id = :id
		`);

	reply.send({ data: newAttemptQuery.get({ id: request.params.id }) });
});

/** POST /attempts/:id/finish updates an attempt state to finished */
server.post<AttemptsRouteGeneric>("/attempts/:id/finish", (request, reply) => {
	// Verify attempt belongs to this user
	const userId = request.user?.id ?? 1;
	const query = db.prepare<{ id: string }, Attempt>(`
		SELECT user_id
		FROM ${ATTEMPTS_TABLE_NAME}
		WHERE id = :id
	`);
	const attempt = query.get({ id: request.params.id });

	if (!attempt || attempt.user_id !== userId) {
		// Attempt with this ID does not exist for calling user
		reply.code(404).send({ error: "Could not find attempt" });
		return;
	}

	// Update status
	const updateStmt = db.prepare(`
		UPDATE ${ATTEMPTS_TABLE_NAME}
		SET is_finished = 1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = :id
	`);
	updateStmt.run({ id: request.params.id });

	const updatedAttempt = db.prepare<{ id: string }, Attempt>(`
			SELECT
				${ATTEMPTS_BASE_QUERY}
			FROM ${ATTEMPTS_TABLE_NAME}
			WHERE id = :id
		`);

	reply.send({ data: updatedAttempt.get({ id: request.params.id }) });

	// TODO: Grading should happen at this point
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
