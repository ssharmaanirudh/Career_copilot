import { NextResponse } from "next/server";
import { Document, Packer, Paragraph } from "docx";

export const runtime = "nodejs";

const FILE_NAMES: Record<string, string> = {
  resume: "Tailored-Resume.docx",
  "cover-letter": "Cover-Letter.docx",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { text, kind } = (body ?? {}) as { text?: unknown; kind?: unknown };

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Missing text to export." }, { status: 400 });
  }
  if (typeof kind !== "string" || !(kind in FILE_NAMES)) {
    return NextResponse.json({ error: "Invalid document kind." }, { status: 400 });
  }

  const paragraphs = text
    .split("\n")
    .map((line) => new Paragraph({ text: line }));

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  const fileName = FILE_NAMES[kind];

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
