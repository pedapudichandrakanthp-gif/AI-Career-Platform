import { NextResponse } from "next/server";

import { logAiError, toAiUserMessage } from "@/lib/ai/errors";

export function aiErrorResponse(context: string, error: unknown, status = 503): NextResponse {
  logAiError(context, error);
  return NextResponse.json({ error: toAiUserMessage() }, { status });
}
