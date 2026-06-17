import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET } from "./client";
import { DOWNLOAD_URL_EXPIRY_SECONDS } from "@/lib/constants";

export async function createDownloadUrl(
  key: string,
  downloadFilename?: string,
  disposition: "attachment" | "inline" = "attachment",
): Promise<string> {
  const client = getR2Client();
  // Qo'shtirnoq/boshqaruv belgilarini olib tashlab, Content-Disposition headerini buzishning oldini olamiz.
  const safeFilename = downloadFilename?.replace(/["\r\n\\]/g, "").trim() || undefined;
  const contentDisposition = safeFilename
    ? `${disposition}; filename="${safeFilename}"`
    : disposition === "inline"
      ? "inline"
      : undefined;
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ResponseContentDisposition: contentDisposition,
    // Inline ko'rishda brauzer faylni PDF sifatida ochishi uchun content-type'ni majburlaymiz.
    ResponseContentType: disposition === "inline" ? "application/pdf" : undefined,
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
