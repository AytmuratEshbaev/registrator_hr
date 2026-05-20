import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET } from "./client";
import { PRESIGNED_URL_EXPIRY_SECONDS, type FileKind } from "@/lib/constants";

const EXT_FROM_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
};

export function buildObjectKey(passport: string, kind: FileKind, mime: string): string {
  const ext = EXT_FROM_MIME[mime] ?? "bin";
  const random = Math.random().toString(36).slice(2, 8);
  const safePassport = passport.replace(/[^A-Za-z0-9]/g, "");
  return `applications/${safePassport}/${kind}-${Date.now()}-${random}.${ext}`;
}

export async function createUploadUrl(opts: {
  key: string;
  contentType: string;
  contentLength: number;
}): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
    ContentLength: opts.contentLength,
  });
  return getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
}
