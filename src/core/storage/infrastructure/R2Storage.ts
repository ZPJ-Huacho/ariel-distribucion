import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { env } from "@/shared/lib/env";
import type { StorageRepository, UploadResult } from "../domain/repositories";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

export class R2Storage implements StorageRepository {
  private client: S3Client | null = null;

  private getClient(): { s3: S3Client; bucket: string } {
    if (
      !env.R2_ACCOUNT_ID ||
      !env.R2_ACCESS_KEY_ID ||
      !env.R2_SECRET_ACCESS_KEY ||
      !env.R2_BUCKET
    ) {
      throw new Error("R2 env vars missing");
    }
    if (!this.client) {
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      });
    }
    return { s3: this.client, bucket: env.R2_BUCKET };
  }

  async uploadImage(file: File, prefix: string): Promise<UploadResult> {
    if (!ALLOWED.has(file.type)) return { ok: false, error: "invalid_type" };
    if (file.size > MAX_BYTES) return { ok: false, error: "file_too_large" };
    const { s3, bucket } = this.getClient();
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const key = `${prefix.replace(/\/$/, "")}/${nanoid(14)}.${ext}`;
    const body = new Uint8Array(await file.arrayBuffer());
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type,
      }),
    );
    return { ok: true, key, url: this.publicUrl(key)! };
  }

  async delete(key: string): Promise<void> {
    const { s3, bucket } = this.getClient();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  publicUrl(key: string | null | undefined): string | undefined {
    if (!key) return undefined;
    if (key.startsWith("http") || key.startsWith("data:")) return key;
    if (!env.R2_PUBLIC_URL) return undefined;
    return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
}
