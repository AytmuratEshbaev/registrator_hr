import { z } from "zod";
import { FILE_KINDS, FILE_LIMITS, PASSPORT_REGEX } from "@/lib/constants";

export const uploadUrlSchema = z
  .object({
    passport_number: z
      .string()
      .trim()
      .toUpperCase()
      .regex(PASSPORT_REGEX, "Неверный номер паспорта"),
    kind: z.enum(FILE_KINDS as [string, ...string[]]),
    contentType: z.string().min(1),
    contentLength: z.number().int().positive(),
    filename: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    const limits = FILE_LIMITS[data.kind as keyof typeof FILE_LIMITS];
    if (!limits) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Неизвестный тип файла",
        path: ["kind"],
      });
      return;
    }
    if (!(limits.mimes as readonly string[]).includes(data.contentType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Разрешены только форматы: ${limits.mimes.join(", ")}`,
        path: ["contentType"],
      });
    }
    if (data.contentLength > limits.maxBytes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Размер файла не должен превышать ${Math.round(limits.maxBytes / 1024 / 1024)}MB`,
        path: ["contentLength"],
      });
    }
  });

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
