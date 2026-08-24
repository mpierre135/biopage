import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { storage } from "@/lib/storage";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/zip",
  "audio/mpeg",
  "audio/wav",
  "text/plain",
]);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED.has(contentType) && !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const ext = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "bin";
  const key = `uploads/${userId}/${nanoid(12)}.${ext ?? "bin"}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await storage.upload({
    key,
    body: buffer,
    contentType,
  });

  return NextResponse.json({
    url: result.url,
    key: result.key,
    filename: file.name,
    mimeType: contentType,
    sizeBytes: file.size,
  });
}
