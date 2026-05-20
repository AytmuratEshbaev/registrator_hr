import { z } from "zod";
import { PASSPORT_REGEX, PHONE_REGEX } from "@/lib/constants";

export const applicationSchema = z.object({
  passport_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PASSPORT_REGEX, "Неверный формат номера паспорта. Пример: AA1234567"),
  first_name: z
    .string()
    .trim()
    .min(2, "Введите имя")
    .max(60, "Имя слишком длинное"),
  last_name: z
    .string()
    .trim()
    .min(2, "Введите фамилию")
    .max(60, "Фамилия слишком длинная"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Неверный номер телефона. Формат: +998XXXXXXXXX"),
  birth_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "Неверная дата рождения" })
    .refine(
      (v) => {
        const d = new Date(v);
        const now = new Date();
        const age = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 16 && age <= 80;
      },
      { message: "Возраст должен быть от 16 до 80 лет" }
    ),
  position_id: z.string().uuid().nullable().optional(),
  position_title: z.string().trim().min(2, "Выберите должность").max(150),
  cv_url: z.string().min(1, "Загрузите файл резюме"),
  passport_scan_url: z.string().min(1, "Загрузите скан паспорта"),
  diploma_url: z.string().min(1, "Загрузите файл диплома"),
  photo_url: z.string().min(1, "Загрузите фото"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
