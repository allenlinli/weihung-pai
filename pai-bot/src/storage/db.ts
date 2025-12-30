import { Database } from "bun:sqlite";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "../config";
import { logger } from "../utils/logger";

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(config.database.path);
    db.exec("PRAGMA journal_mode = WAL");
    logger.info({ path: config.database.path }, "Database connected");

    // Auto migration on startup
    const schemaPath = join(import.meta.dir, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    db.exec(schema);
    logger.info("Database migration completed");
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    logger.info("Database closed");
  }
}
