import { z } from "zod";
import { PASSPORT_REGEX, PHONE_REGEX } from "@/lib/constants";

// Baza (umumiy) maydonlar
const baseSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Hujjat raqami formati noto'g'ri. (Masalan: AA1234567 yoki I-AN 1234567)"),
  passport_series: z.string().min(1, "Seriyani tanlang"),
  passport_number_digits: z.string().regex(/^\d{7}$/, "Hujjat raqami 7 ta raqamdan iborat bo'lishi kerak"),
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
  middle_name: z.string().optional().nullable(),
  phone_secondary: z.string().optional().nullable(),
  passport_scan_url: z.string().optional().nullable(),
  diploma_url: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
});

// O'quvchilar qabuli validatsiyasi
export const studentApplicationSchema = baseSchema.extend({
  type: z.literal("student"),
  middle_name: z.string().trim().min(3, "Sharifingizni kiriting").max(60),
  phone_secondary: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Telefon raqami noto'g'ri. Format: +998XXXXXXXXX")
    .optional()
    .nullable()
    .or(z.literal("")),
  parent_name: z.string().optional().nullable(),
  grade: z.string().trim().min(1, "Sinfni tanlang"),
  position_id: z.null().optional(),
  position_title: z.string().optional().nullable(),
  cv_url: z.string().optional().nullable(),
});

// Vakansiya / Ishchi qabuli validatsiyasi
export const vacancyApplicationSchema = z.object({
  type: z.literal("vacancy"),
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}\d{7}$/, "Pasport seriyasi va raqami noto'g'ri formatda. (Masalan: AA1234567)"),
  passport_series: z.string().optional().nullable(),
  passport_number_digits: z.string().optional().nullable(),
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
  middle_name: z.string().optional().nullable(),
  phone_secondary: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Telefon raqami noto'g'ri. Format: +998XXXXXXXXX")
    .optional()
    .nullable()
    .or(z.literal("")),
  passport_scan_url: z.string().optional().nullable(),
  diploma_url: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  parent_name: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
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
