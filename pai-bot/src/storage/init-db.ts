#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { logger } from "../utils/logger";
import { closeDb, getDb } from "./db";

async function initDatabase() {
  try {
    const db = getDb();

    // Read and execute schema
    const schemaPath = join(import.meta.dir, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    db.run(schema);

    logger.info("Database initialized successfully");
  } catch (error) {
    logger.error({ error }, "Failed to initialize database");
    process.exit(1);
  } finally {
    closeDb();
  }
}

initDatabase();
