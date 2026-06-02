export const APPLICATION_STATUSES = [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const FILE_LIMITS = {
  cv: { maxBytes: 5 * 1024 * 1024, mimes: ["application/pdf"], label: "Резюме (PDF)" },
  passport_scan: {
    maxBytes: 2 * 1024 * 1024,
    mimes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    label: "Скан паспорта (PDF/JPG/PNG)",
  },
  diploma: {
    maxBytes: 2 * 1024 * 1024,
    mimes: ["application/pdf"],
    label: "Диплом (PDF)",
  },
  photo: {
    maxBytes: 500 * 1024,
    mimes: ["image/jpeg", "image/jpg", "image/png"],
    label: "Фото 3x4 (JPG/PNG)",
  },
} as const;

export type FileKind = keyof typeof FILE_LIMITS;
export const FILE_KINDS = Object.keys(FILE_LIMITS) as FileKind[];

export const PASSPORT_REGEX = /^[A-Z0-9 -]{5,20}$/i;
export const PHONE_REGEX = /^\+998\d{9}$/;

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 5;

export const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 5;
export const DOWNLOAD_URL_EXPIRY_SECONDS = 60 * 10;
