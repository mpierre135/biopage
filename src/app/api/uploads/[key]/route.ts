import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { storage } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key: encoded } = await params;
  const key = decodeURIComponent(encoded);

  // Local disk path used by LocalDiskDriver
  const localPath = path.join(
    process.cwd(),
    ".uploads",
    key.replace(/\//g, "_"),
  );

  if (fs.existsSync(localPath)) {
    const data = fs.readFileSync(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const type =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".pdf"
              ? "application/pdf"
              : ext === ".mp4"
                ? "video/mp4"
                : "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  try {
    const signed = await storage.getSignedUrl(key, 300);
    if (signed.startsWith("http")) {
      return NextResponse.redirect(signed);
    }
  } catch {
    // fall through
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
