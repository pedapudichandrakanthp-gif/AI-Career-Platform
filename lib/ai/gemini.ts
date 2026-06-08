import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-2.0-flash";

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return apiKey;
}

function getModel() {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey());
  return genAI.getGenerativeModel({ model: DEFAULT_MODEL });
}

export async function generateJsonFromPrompt<T>(prompt: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

export async function generateJsonFromPdf<T>(prompt: string, pdfBase64: string, mimeType: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: pdfBase64,
        mimeType,
      },
    },
  ]);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

export async function generateJsonFromText<T>(prompt: string, content: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent(`${prompt}\n\n---\n\n${content}`);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return JSON.parse(jsonMatch[0]) as T;
}
