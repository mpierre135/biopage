import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { downloadTokens, digitalFiles } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const [record] = await db
    .select({
      id: downloadTokens.id,
      fileId: downloadTokens.fileId,
      expiresAt: downloadTokens.expiresAt,
      downloadCount: downloadTokens.downloadCount,
      maxDownloads: downloadTokens.maxDownloads,
    })
    .from(downloadTokens)
    .where(eq(downloadTokens.token, token))
    .limit(1);

  if (!record) {
    return NextResponse.json(
      { error: "Invalid download link" },
      { status: 404 },
    );
  }

  if (new Date() > record.expiresAt) {
    return NextResponse.json(
      { error: "This download link has expired" },
      { status: 410 },
    );
  }

  if (record.downloadCount >= record.maxDownloads) {
    return NextResponse.json(
      { error: "Download limit reached" },
      { status: 429 },
    );
  }

  const [file] = await db
    .select({
      filename: digitalFiles.filename,
      storageKey: digitalFiles.storageKey,
      mimeType: digitalFiles.mimeType,
    })
    .from(digitalFiles)
    .where(eq(digitalFiles.id, record.fileId))
    .limit(1);

  if (!file) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 },
    );
  }

  await db
    .update(downloadTokens)
    .set({
      downloadCount: sql`${downloadTokens.downloadCount} + 1`,
    })
    .where(eq(downloadTokens.id, record.id));

  if (file.storageKey.startsWith("http://") || file.storageKey.startsWith("https://")) {
    return NextResponse.redirect(file.storageKey);
  }

  try {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-1",
      ...(process.env.AWS_ENDPOINT_URL && {
        endpoint: process.env.AWS_ENDPOINT_URL,
        forcePathStyle: true,
      }),
    });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET ?? "biohub-files",
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${file.filename}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return NextResponse.redirect(signedUrl);
  } catch (err) {
    console.error("[download] S3 error:", err);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}
