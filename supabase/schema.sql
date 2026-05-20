-- ============================================
-- HR Registratsiya — Database sxemasi
-- ============================================
-- Supabase SQL Editor'da bu butun faylni nusxalab yopishtiring va Run bosing.
-- Mavjud jadvallar bo'lsa avval o'chiriladi.

-- ----- Tozalash (qaytadan o'rnatish uchun) -----
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TYPE IF EXISTS public.application_status CASCADE;

-- ----- Status enum -----
CREATE TYPE public.application_status AS ENUM (
  'pending',
  'reviewing',
  'accepted',
  'rejected'
);

-- ----- positions jadvali -----
CREATE TABLE public.positions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX positions_active_idx ON public.positions (active);

-- ----- applications jadvali -----
CREATE TABLE public.applications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_number    text NOT NULL UNIQUE,
  full_name          text NOT NULL,
  email              text NOT NULL,
  phone              text NOT NULL,
  birth_date         date NOT NULL,
  position_id        uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  position_title     text NOT NULL,
  about              text NOT NULL,
  cv_url             text,
  passport_scan_url  text,
  diploma_url        text,
  photo_url          text,
  status             public.application_status NOT NULL DEFAULT 'pending',
  hr_note            text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_format CHECK (passport_number ~ '^[A-Z]{2}[0-9]{7}$')
);

CREATE INDEX applications_status_idx       ON public.applications (status);
CREATE INDEX applications_position_id_idx  ON public.applications (position_id);
CREATE INDEX applications_created_at_idx   ON public.applications (created_at DESC);
CREATE INDEX applications_full_name_idx    ON public.applications USING gin (to_tsvector('simple', full_name));

-- ----- updated_at avtomatik yangilanishi -----
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_set_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- RLS (Row Level Security) politikalari
-- ============================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions    ENABLE ROW LEVEL SECURITY;

-- positions: hamma faol lavozimlarni o'qiy oladi
CREATE POLICY positions_select_public ON public.positions
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- positions: faqat authenticated foydalanuvchilar (adminlar) yarata/yangilashi mumkin
CREATE POLICY positions_all_authenticated ON public.positions
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- applications:
-- Anon foydalanuvchilar HECH NIMA o'qiy olmaydi (server-side service role tekshiradi).
-- Anon foydalanuvchilar API orqali (service role) ariza topshira oladi.
-- Authenticated (adminlar) hammasini ko'ra va boshqarishi mumkin.
CREATE POLICY applications_select_authenticated ON public.applications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY applications_update_authenticated ON public.applications
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY applications_delete_authenticated ON public.applications
  FOR DELETE TO authenticated
  USING (true);

-- Anon va authenticated INSERT — frontendan to'g'ridan-to'g'ri ishlatilmaydi,
-- biz API orqali service role bilan yozamiz. Lekin himoya uchun yopiq qoldiramiz.
-- (Hech qanday INSERT policy yo'q = anon insert qila olmaydi)

-- ============================================
-- Boshlang'ich lavozimlar (siz o'zgartira olasiz)
-- ============================================
INSERT INTO public.positions (title, description, active) VALUES
  ('Dasturchi', 'Frontend yoki backend dasturchi vakansiyasi', true),
  ('Buxgalter', 'Buxgalteriya va moliyaviy hisobot', true),
  ('Marketing menejer', 'Marketing va sotuv', true),
  ('Operator', 'Mijozlar bilan ishlash', true);

-- ============================================
-- Admin foydalanuvchisini yaratish
-- ============================================
-- Supabase Dashboard → Authentication → Users → Add user
-- (yoki) ushbu SQL'ni ishlating (parolni o'zgartiring):
--
-- SELECT * FROM auth.users WHERE email = 'admin@yourcompany.com';
-- (Agar yo'q bo'lsa, Supabase Dashboard'dan qo'shing — bu xavfsizroq.)
