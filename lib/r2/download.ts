import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET } from "./client";
import { DOWNLOAD_URL_EXPIRY_SECONDS } from "@/lib/constants";

export async function createDownloadUrl(key: string, downloadFilename?: string): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ResponseContentDisposition: downloadFilename
      ? `attachment; filename="${downloadFilename}"`
      : undefined,
  });
  return getSignedUrl(client, command, { expiresIn: DOWNLOAD_URL_EXPIRY_SECONDS });
}

export function extractKeyFromUrl(urlOrKey: string): string {
  if (!urlOrKey.startsWith("http")) return urlOrKey;
  try {
    const url = new URL(urlOrKey);
    return url.pathname.replace(/^\//, "");
  } catch {
    return urlOrKey;
  }
}
