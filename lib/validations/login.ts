import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email manzili noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lsin"),
});

export type LoginInput = z.infer<typeof loginSchema>;
