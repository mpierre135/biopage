import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type UploadOptions = {
  key: string;
  body: Buffer | Uint8Array | ReadableStream;
  contentType?: string;
  /** Signed URL TTL in seconds; defaults to 3600. */
  expiresIn?: number;
};

export interface StorageDriver {
  upload(options: UploadOptions): Promise<{ url: string; key: string }>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Local disk driver (development)
// ---------------------------------------------------------------------------

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

class LocalDiskDriver implements StorageDriver {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  async upload(options: UploadOptions): Promise<{ url: string; key: string }> {
    const filePath = path.join(this.dir, options.key.replace(/\//g, "_"));
    const data =
      options.body instanceof ReadableStream
        ? Buffer.from(await new Response(options.body).arrayBuffer())
        : Buffer.from(options.body);
    fs.writeFileSync(filePath, data);
    const url = `/api/uploads/${encodeURIComponent(options.key)}`;
    return { url, key: options.key };
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    return `/api/uploads/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.dir, key.replace(/\//g, "_"));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// ---------------------------------------------------------------------------
// R2 / S3-compatible driver
// ---------------------------------------------------------------------------

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
};

class R2Driver implements StorageDriver {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor(config: R2Config) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(options: UploadOptions): Promise<{ url: string; key: string }> {
    const body =
      options.body instanceof ReadableStream
        ? Buffer.from(await new Response(options.body).arrayBuffer())
        : options.body;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: body,
        ContentType: options.contentType ?? "application/octet-stream",
      })
    );

    const url = this.publicUrl
      ? `${this.publicUrl.replace(/\/$/, "")}/${options.key}`
      : await this.getSignedUrl(options.key, options.expiresIn ?? 3600);

    return { url, key: options.key };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn }
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

function createStorageDriver(): StorageDriver {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (accountId && accessKeyId && secretAccessKey && bucket) {
    return new R2Driver({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucket,
      publicUrl: process.env.R2_PUBLIC_URL,
    });
  }

  return new LocalDiskDriver(LOCAL_UPLOAD_DIR);
}

export const storage: StorageDriver = createStorageDriver();
