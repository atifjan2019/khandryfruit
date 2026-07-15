import "server-only";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
export interface StorageProvider {
  createUpload(input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{ key: string; uploadUrl: string }>;
}
export class S3StorageProvider implements StorageProvider {
  private readonly client = new S3Client({
    region: env.AWS_REGION,
    endpoint: env.AWS_S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(env.AWS_S3_ENDPOINT),
  });
  async createUpload(input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    if (!env.AWS_S3_BUCKET) throw new Error("STORAGE_NOT_CONFIGURED");
    if (!allowedTypes.has(input.mimeType) || input.sizeBytes > 8_000_000)
      throw new Error("INVALID_UPLOAD");
    const extension = input.mimeType.split("/")[1].replace("jpeg", "jpg");
    const key = `products/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes,
      Metadata: { originalName: input.fileName.slice(0, 100) },
    });
    return {
      key,
      uploadUrl: await getSignedUrl(this.client, command, { expiresIn: 300 }),
    };
  }
}
