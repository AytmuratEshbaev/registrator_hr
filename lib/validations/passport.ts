import { z } from "zod";
import { PASSPORT_REGEX } from "@/lib/constants";

export const passportSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Hujjat raqami formati noto'g'ri. (Masalan: AA1234567 yoki I-TAS 1234567)"),
});

export type PassportInput = z.infer<typeof passportSchema>;

export const passportCheckSchema = passportSchema;
