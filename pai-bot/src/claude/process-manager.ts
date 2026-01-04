import type { Subprocess } from "bun";
import { logger } from "../utils/logger";

interface ActiveProcess {
  proc: Subprocess;
  userId: number;
  startedAt: Date;
  abortController: AbortController;
}

class ProcessManager {
  private activeProcesses: Map<number, ActiveProcess> = new Map();

  /**
   * Register a new Claude process for a user
   */
  register(userId: number, proc: Subprocess, abortController: AbortController): void {
    // Kill any existing process for this user first
    this.abort(userId);

    this.activeProcesses.set(userId, {
      proc,
      userId,
      startedAt: new Date(),
      abortController,
    });

    logger.debug({ userId, pid: proc.pid }, "Process registered");
  }

  /**
   * Abort the active process for a user
   * Returns true if a process was aborted
   */
  abort(userId: number): boolean {
    const active = this.activeProcesses.get(userId);
    if (!active) {
      return false;
    }

    try {
      // Signal abortion
      active.abortController.abort();

      // Kill the process
      active.proc.kill();

      logger.info({ userId, pid: active.proc.pid }, "Process aborted");
    } catch (error) {
      logger.warn({ userId, error }, "Error while aborting process");
    }

    this.activeProcesses.delete(userId);
    return true;
  }

  /**
   * Remove a process from tracking (called when it completes normally)
   */
  unregister(userId: number): void {
    this.activeProcesses.delete(userId);
    logger.debug({ userId }, "Process unregistered");
  }

  /**
   * Check if a user has an active process
   */
  hasActiveProcess(userId: number): boolean {
    return this.activeProcesses.has(userId);
  }

  /**
   * Get process info for a user
   */
  getProcessInfo(userId: number): { pid?: number; startedAt?: Date } | null {
    const active = this.activeProcesses.get(userId);
    if (!active) {
      return null;
    }
    return {
      pid: active.proc.pid,
      startedAt: active.startedAt,
    };
  }
}

export const processManager = new ProcessManager();
