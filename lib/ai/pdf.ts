import pdf from "pdf-parse";

export async function extractTextFromPdfBase64(pdfBase64: string): Promise<string> {
  const buffer = Buffer.from(pdfBase64, "base64");
  const result = await pdf(buffer);
  const text = result.text?.trim() ?? "";

  if (!text) {
    throw new Error("PDF text extraction returned empty content.");
  }

  return text;
}
