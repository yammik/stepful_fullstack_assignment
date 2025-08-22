import fs from "node:fs";
import { db } from "../db-client";

/**
 * Usage: `npm run setup` from the root repo.
 *
 * This script runs the available SQL migrations in the `./migrations` folder, in alphanumeric order.
 * It skips already-executed migrations (using the `my_migrations` table as a record).
 *
 * To force re-run all migrations, DROP the `my_migrations` table.
 */

try {
	// select all migrations in the ./migrations folder, sorted by name i.e. 00_ first, 99_ last
	const allMigrationNames = fs
		.readdirSync("./migrations")
		.map((file) => (file.endsWith(".sql") ? file.slice(0, -4) : null))
		.filter((file) => file != null)
		.sort((a, b) => a.localeCompare(b));

	// setup migrations table
	db.exec(`
		CREATE TABLE IF NOT EXISTS my_migrations (
			name TEXT NOT NULL
		)
	`);

	const migrationsRan = db
		.prepare<[], { name: string }>(`
			SELECT name FROM my_migrations
		`)
		.all()
		.map((row) => row.name);

	db.transaction(() => {
		// run all migrations in order
		for (const migration of allMigrationNames) {
			if (migrationsRan.includes(migration)) {
				console.log(`--> Skipping migration: ${migration} (already ran)`);
				continue;
			}

			const rawSql = fs.readFileSync(`./migrations/${migration}.sql`, "utf8");

			console.log(`--> Running migration: ${migration}`);
			db.exec(rawSql);
			console.log("<-- completed successfully.");

			db.prepare(`
				INSERT INTO my_migrations (name) VALUES (?)
			`).run(migration);
		}
	})();

	console.log("Database migrations ran successfully!");
} catch (err) {
	const error = err as Error;
	console.log(error.name, { ...error });
	console.error("Error running migrations:", err);
} finally {
	db.close();
}
