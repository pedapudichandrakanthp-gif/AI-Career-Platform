export const AI_USER_MESSAGE = "AI service temporarily unavailable. Please try again.";

export function logAiError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`[AI:${context}]`, error.message, error.stack);
    return;
  }

  console.error(`[AI:${context}]`, error);
}

export function toAiUserMessage(): string {
  return AI_USER_MESSAGE;
}
