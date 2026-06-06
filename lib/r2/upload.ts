import { randomUUID } from "crypto";
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

// Kalit foydalanuvchi pasportidan EMAS, server tomonida yaratilgan tasodifiy UUID'dan
// quriladi. Bu boshqa nomzodning "papkasi" ostiga fayl yuklash/o'chirishning oldini oladi.
export function buildObjectKey(kind: FileKind, mime: string): string {
  const ext = EXT_FROM_MIME[mime] ?? "bin";
  return `applications/${randomUUID()}/${kind}.${ext}`;
}

// Saqlangan kalit faqat shu naqsh bo'yicha qabul qilinadi (server yaratgani bilan mos).
export const UPLOAD_KEY_REGEX =
  /^applications\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(cv|passport_scan|diploma|photo)\.(pdf|jpg|png)$/;

export function isValidUploadKey(value: string | null | undefined): boolean {
  if (!value) return false;
  return UPLOAD_KEY_REGEX.test(value);
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
