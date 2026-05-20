import { z } from "zod";
import { PASSPORT_REGEX } from "@/lib/constants";

export const passportSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Pasport raqami noto'g'ri formatda. Misol: AA1234567"),
});

export type PassportInput = z.infer<typeof passportSchema>;

export const passportCheckSchema = passportSchema.extend({
  turnstileToken: z.string().min(1, "Bot tekshiruvidan o'tilmadi").optional(),
});
