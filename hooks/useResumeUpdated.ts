"use client";

import { useEffect } from "react";

import { RESUME_UPDATED_EVENT } from "@/lib/events/resume";

export function useResumeUpdated(callback: () => void): void {
  useEffect(() => {
    window.addEventListener(RESUME_UPDATED_EVENT, callback);
    return () => window.removeEventListener(RESUME_UPDATED_EVENT, callback);
  }, [callback]);
}
