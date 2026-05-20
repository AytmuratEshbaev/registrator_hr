-- Migration 002: applications jadvalini soddalashtirish
-- Sanasi: 2026-05-20
-- O'zgarishlar:
--   * email ustuni olib tashlanadi
--   * about ustuni olib tashlanadi
--   * full_name ustuni first_name + last_name ga ajratiladi

-- 1. email va about ustunlarini o'chirish
ALTER TABLE public.applications DROP COLUMN IF EXISTS email;
ALTER TABLE public.applications DROP COLUMN IF EXISTS about;

-- 2. first_name va last_name ustunlarini qo'shish (mavjud yozuvlar uchun bo'sh string default)
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS last_name  text NOT NULL DEFAULT '';

-- 3. Mavjud yozuvlardagi full_name'ni bo'lish (bo'sh DB bo'lsa hech narsa o'zgarmaydi)
UPDATE public.applications
SET
  first_name = COALESCE(NULLIF(split_part(full_name, ' ', 1), ''), ''),
  last_name  = COALESCE(NULLIF(trim(substring(full_name from position(' ' in full_name) + 1)), ''), '')
WHERE full_name IS NOT NULL;

-- 4. full_name ustuni va eski indeksini o'chirish
DROP INDEX IF EXISTS applications_full_name_idx;
ALTER TABLE public.applications DROP COLUMN IF EXISTS full_name;

-- 5. Yangi indeks (familya bo'yicha qidiruv tez bo'lishi uchun)
CREATE INDEX IF NOT EXISTS applications_last_name_idx
  ON public.applications USING gin (to_tsvector('simple', last_name));
