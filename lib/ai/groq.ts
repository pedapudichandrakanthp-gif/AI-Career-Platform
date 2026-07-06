import Groq from "groq-sdk";

import { logAiError } from "@/lib/ai/errors";
import { extractTextFromPdfBase64 } from "@/lib/ai/pdf";

const PRIMARY_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const FALLBACK_MODEL = "llama-3.1-70b-versatile";

const JSON_SYSTEM_PREFIX =
  "You must respond with a single valid JSON object only. No markdown fences, no explanation, no preamble.";

function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return apiKey;
}

function getGroqClient(): Groq {
  return new Groq({ apiKey: getGroqApiKey() });
}

function isModelUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("model") &&
    (message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("decommissioned") ||
      message.includes("unsupported"))
  );
}

function parseJsonResponse<T>(text: string): T {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON.");
    }

    return JSON.parse(jsonMatch[0]) as T;
  }
}

async function createJsonCompletion(systemPrompt: string, userContent: string): Promise<string> {
  const client = getGroqClient();
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${JSON_SYSTEM_PREFIX}\n\n${systemPrompt}` },
          { role: "user", content: userContent },
        ],
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("AI response was empty.");
      }

      return content;
    } catch (error) {
      lastError = error;

      if (model === PRIMARY_MODEL && isModelUnavailableError(error)) {
        logAiError("model-fallback", error);
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI completion failed.");
}

export async function generateJsonFromText<T>(prompt: string, content: string): Promise<T> {
  const text = await createJsonCompletion(
    prompt,
    `The following is input content to analyze:\n\n${content}`,
  );

  return parseJsonResponse<T>(text);
}

export async function generateJsonFromPdf<T>(prompt: string, pdfBase64: string): Promise<T> {
  const pdfText = await extractTextFromPdfBase64(pdfBase64);

  const text = await createJsonCompletion(
    prompt,
    `The following is plain text extracted from a resume PDF. Layout formatting may be imperfect.\n\n${pdfText}`,
  );

  return parseJsonResponse<T>(text);
}

export async function extractPdfText(pdfBase64: string): Promise<string> {
  return extractTextFromPdfBase64(pdfBase64);
}

export async function generateJsonFromPrompt<T>(prompt: string): Promise<T> {
  const text = await createJsonCompletion(prompt, "Generate the requested JSON output.");
  return parseJsonResponse<T>(text);
}
