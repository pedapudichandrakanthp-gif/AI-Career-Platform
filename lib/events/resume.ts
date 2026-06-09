export const RESUME_UPDATED_EVENT = "avsargrid:resume-updated";

export function dispatchResumeUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RESUME_UPDATED_EVENT));
  }
}
