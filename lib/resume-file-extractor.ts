import * as mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export const MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024;

function getFileExtension(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

function normalizeResumeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validateExtractedText(text: string) {
  const normalizedText = normalizeResumeText(text);

  if (normalizedText.length < 150) {
    throw new Error(
      "Very little text was found. Upload a text-based PDF or DOCX resume, not a scanned image."
    );
  }

  if (normalizedText.length > 30000) {
    throw new Error(
      "The extracted resume content is too large. Please upload a shorter resume."
    );
  }

  return normalizedText;
}

export async function extractResumeText(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Please select a resume file.");
  }

  if (file.size > MAX_RESUME_FILE_BYTES) {
    throw new Error("Resume file must be 5 MB or smaller.");
  }

  const extension = getFileExtension(file.name);
  const arrayBuffer = await file.arrayBuffer();

  try {
    if (extension === "pdf") {
      const document = await getDocumentProxy(
        new Uint8Array(arrayBuffer)
      );

      const result = await extractText(document, {
        mergePages: true,
      });

      const text = Array.isArray(result.text)
        ? result.text.join("\n")
        : result.text;

      return validateExtractedText(text);
    }

    if (extension === "docx") {
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(arrayBuffer),
      });

      return validateExtractedText(result.value);
    }

    throw new Error(
      "Unsupported file type. Upload only a PDF or DOCX resume."
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to read the uploaded resume.");
  }
}
