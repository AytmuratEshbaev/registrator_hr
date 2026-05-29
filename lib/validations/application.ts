import { z } from "zod";
import { PASSPORT_REGEX, PHONE_REGEX } from "@/lib/constants";

// Baza (umumiy) maydonlar
const baseSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Hujjat raqami formati noto'g'ri. (Masalan: AA1234567 yoki I-TAS 1234567)"),
  first_name: z
    .string()
    .trim()
    .min(2, "Ismni kiriting")
    .max(60, "Ism juda uzun"),
  last_name: z
    .string()
    .trim()
    .min(2, "Familiyani kiriting")
    .max(60, "Familiya juda uzun"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Telefon raqami noto'g'ri. Format: +998XXXXXXXXX"),
  passport_scan_url: z.string().optional().nullable(),
  diploma_url: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
});

// O'quvchilar qabuli validatsiyasi
export const studentApplicationSchema = baseSchema.extend({
  type: z.literal("student"),
  parent_name: z.string().trim().min(3, "Ota-onaning ismi va familiyasini kiriting").max(100),
  grade: z.string().trim().min(1, "Sinfni tanlang"),
  birth_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Noto'g'ri sana" })
    .refine(
      (v) => {
        const d = new Date(v);
        const now = new Date();
        const age = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 5 && age <= 20;
      },
      { message: "O'quvchi yoshi 5 dan 20 yoshgacha bo'lishi kerak" }
    ),
  position_id: z.null().optional(),
  position_title: z.string().optional().nullable(),
  cv_url: z.string().optional().nullable(),
});

// Vakansiya / Ishchi qabuli validatsiyasi
export const vacancyApplicationSchema = baseSchema.extend({
  type: z.literal("vacancy"),
  parent_name: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  birth_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Noto'g'ri sana" })
    .refine(
      (v) => {
        const d = new Date(v);
        const now = new Date();
        const age = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 18 && age <= 70;
      },
      { message: "Nomzod yoshi 18 dan 70 yoshgacha bo'lishi kerak" }
    ),
  position_id: z.string().uuid("Lavozimni tanlang").nullable().optional(),
  position_title: z.string().trim().min(2, "Lavozimni tanlang").max(150),
  cv_url: z.string().min(1, "Rezyumeni (CV) yuklang"),
});

// Birlashtirilgan validatsiya sxemasi
export const applicationSchema = z.discriminatedUnion("type", [
  studentApplicationSchema,
  vacancyApplicationSchema,
]);

export type ApplicationInput = z.infer<typeof applicationSchema>;
