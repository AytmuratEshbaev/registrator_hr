-- ============================================
-- Migratsiya: positions jadvaliga ko'p tilli tavsif (talablar)
-- ============================================
-- Har bir lavozim tavsifi 3 tilda saqlanadi: o'zbekcha, qoraqalpoqcha, ruscha.
-- Ariza topshirish oynasida foydalanuvchi tanlagan tildagi tavsif ko'rsatiladi.
-- Supabase SQL Editor'da ishga tushiring.

ALTER TABLE public.positions
  ADD COLUMN IF NOT EXISTS description_uz text,
  ADD COLUMN IF NOT EXISTS description_qq text,
  ADD COLUMN IF NOT EXISTS description_ru text;

-- Eski yagona `description` ustunidagi matnni uchala tilga ko'chiramiz (ma'lumot yo'qolmasligi uchun).
UPDATE public.positions
SET description_uz = COALESCE(description_uz, description),
    description_qq = COALESCE(description_qq, description),
    description_ru = COALESCE(description_ru, description)
WHERE description IS NOT NULL;
