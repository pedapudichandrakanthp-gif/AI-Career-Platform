import type { JobRow, SavedJobWithJob } from "@/types/database";

export type SavedJobQueryJob = Pick<
  JobRow,
  "id" | "exam_name" | "conducting_body" | "location" | "category"
>;

export interface SavedJobQueryRow {
  readonly id: string;
  readonly saved_at: string | null;
  readonly jobs: SavedJobQueryJob | SavedJobQueryJob[] | null;
}

export function normalizeSavedJob(row: SavedJobQueryRow): SavedJobWithJob {
  return {
    id: row.id,
    saved_at: row.saved_at,
    jobs: Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs
  };
}
