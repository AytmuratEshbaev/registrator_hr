import { z } from "zod";
import { PASSPORT_REGEX } from "@/lib/constants";

export const passportSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Неверный формат номера паспорта. Пример: AA1234567"),
});

export type PassportInput = z.infer<typeof passportSchema>;

export const passportCheckSchema = passportSchema;
