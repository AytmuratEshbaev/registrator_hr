import { S3Client } from "@aws-sdk/client-s3";

let cached: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cached) return cached;

  cached = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // AWS SDK v3 (3.729+) PutObject'ga sukut bo'yicha CRC32 checksum qo'shadi.
    // Bu brauzerdan presigned PUT'ni buzadi (imzolangan x-amz-checksum-crc32
    // sarlavhasi yuborilmaydi) va R2 bilan mos kelmaydi. WHEN_REQUIRED bilan o'chiramiz.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return cached;
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
