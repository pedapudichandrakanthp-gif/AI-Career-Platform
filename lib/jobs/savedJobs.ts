import type { JobRow, SavedJobWithJob } from "@/types/database";

export type SavedJobQueryJob = Pick<
  JobRow,
  "id" | "exam_name" | "conducting_body" | "state" | "category" | "location"
>;

export interface SavedJobQueryRow {
  readonly id: string;
  readonly created_at: string | null;
  readonly jobs: SavedJobQueryJob | SavedJobQueryJob[] | null;
}

export function normalizeSavedJob(row: SavedJobQueryRow): SavedJobWithJob {
  return {
    id: row.id,
    created_at: row.created_at,
    jobs: Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs
  };
}
