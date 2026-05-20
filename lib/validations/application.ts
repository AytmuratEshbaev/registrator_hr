import { z } from "zod";
import { PASSPORT_REGEX, PHONE_REGEX } from "@/lib/constants";

export const applicationSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Pasport raqami noto'g'ri formatda. Misol: AA1234567"),
  first_name: z
    .string()
    .trim()
    .min(2, "Ismni kiriting")
    .max(60, "Ism juda uzun"),
  last_name: z
    .string()
    .trim()
    .min(2, "Familyani kiriting")
    .max(60, "Familya juda uzun"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Telefon raqami noto'g'ri. Format: +998XXXXXXXXX"),
  birth_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Tug'ilgan sana noto'g'ri" })
    .refine(
      (v) => {
        const d = new Date(v);
        const now = new Date();
        const age = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 16 && age <= 80;
      },
      { message: "Yosh 16 dan 80 gacha bo'lishi kerak" }
    ),
  position_id: z.string().uuid().nullable().optional(),
  position_title: z.string().trim().min(2, "Lavozimni tanlang").max(150),
  cv_url: z.string().min(1, "CV faylini yuklang"),
  passport_scan_url: z.string().min(1, "Pasport skanini yuklang"),
  diploma_url: z.string().min(1, "Diplom faylini yuklang"),
  photo_url: z.string().min(1, "Suratni yuklang"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
