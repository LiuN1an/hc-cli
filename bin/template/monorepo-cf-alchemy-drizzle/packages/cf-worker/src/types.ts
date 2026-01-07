/**
 * Worker environment bindings
 */
export interface Env {
  DB: D1Database;
  WORKER_ENABLED: string;
}

/**
 * Task result type
 */
export interface TaskResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  startedAt: string;
  completedAt: string;
}
