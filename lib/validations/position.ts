import { z } from "zod";

export const positionSchema = z.object({
  title: z.string().trim().min(2, "Lavozim nomini kiriting").max(150),
  description: z
    .string()
    .trim()
    .min(5, "Lavozim tavsifini (talablarni) kiriting")
    .max(1000),
  active: z.boolean(),
});

export const positionUpdateSchema = positionSchema.partial();

export type PositionInput = z.infer<typeof positionSchema>;
export type PositionUpdateInput = z.infer<typeof positionUpdateSchema>;
