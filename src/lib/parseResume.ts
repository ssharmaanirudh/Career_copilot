import mammoth from "mammoth";

export class ResumeParseError extends Error {}

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

function bufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

async function extractPdfText(data: Uint8Array): Promise<string> {
  // unpdf bundles a worker-free build of pdf.js, which avoids the worker
  // bootstrapping issues regular pdfjs-dist/pdf-parse hit under Next.js's
  // server bundler (Turbopack/webpack rewrite the worker's dynamic import
  // paths, breaking them at runtime).
  const { extractText } = await import("unpdf");
  const { text } = await extractText(data, { mergePages: true });
  return text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractResumeText(file: File): Promise<string> {
  if (file.size === 0) {
    throw new ResumeParseError("The uploaded file is empty.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ResumeParseError("The uploaded file is too large (max 8 MB).");
  }

  const arrayBuffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  let text: string;
  try {
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      text = await extractPdfText(bufferToUint8Array(arrayBuffer));
    } else if (
      name.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractDocxText(Buffer.from(arrayBuffer));
    } else if (name.endsWith(".txt") || file.type === "text/plain") {
      text = Buffer.from(arrayBuffer).toString("utf-8");
    } else if (name.endsWith(".doc")) {
      throw new ResumeParseError(
        "Legacy .doc files aren't supported. Please upload PDF, DOCX, or TXT.",
      );
    } else {
      throw new ResumeParseError(
        "Unsupported file type. Please upload a PDF, DOCX, or TXT resume.",
      );
    }
  } catch (err) {
    if (err instanceof ResumeParseError) throw err;
    console.error("Resume parsing failed:", err);
    throw new ResumeParseError(
      "Couldn't read that file. Make sure it isn't corrupted or password-protected.",
    );
  }

  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length < 40) {
    throw new ResumeParseError(
      "Couldn't find enough text in that resume. Try a different file.",
    );
  }
  return cleaned;
}
