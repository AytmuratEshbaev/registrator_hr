-- ============================================
-- HR va O'quvchi Registratsiyasi — Database sxemasi
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
  type               text NOT NULL CHECK (type IN ('student', 'vacancy')),
  passport_number    text NOT NULL UNIQUE,
  first_name         text NOT NULL,
  last_name          text NOT NULL,
  middle_name        text, -- O'quvchi sharifi / Nomzod sharifi
  phone              text NOT NULL, -- Asosiy telefon
  phone_secondary    text, -- Qo'shimcha telefon
  birth_date         date NOT NULL,
  parent_name        text, -- Eski maydon (Faqat o'quvchilar uchun ota-ona ismi)
  grade              text, -- Faqat o'quvchilar uchun (masalan: 1-sinf)
  position_id        uuid REFERENCES public.positions(id) ON DELETE SET NULL, -- Faqat vakansiyalar uchun
  position_title     text, -- Faqat vakansiyalar uchun
  cv_url             text,
  passport_scan_url  text,
  diploma_url        text,
  photo_url          text,
  status             public.application_status NOT NULL DEFAULT 'pending',
  hr_note            text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_format CHECK (passport_number ~* '^[A-Z0-9 -]{5,20}$')
);

CREATE INDEX applications_type_idx         ON public.applications (type);
CREATE INDEX applications_status_idx       ON public.applications (status);
CREATE INDEX applications_position_id_idx  ON public.applications (position_id);
CREATE INDEX applications_created_at_idx   ON public.applications (created_at DESC);
CREATE INDEX applications_last_name_idx    ON public.applications USING gin (to_tsvector('simple', last_name));

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

-- applications: adminlar tahrirlashi mumkin
CREATE POLICY applications_update_authenticated ON public.applications
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- applications: adminlar o'chirishi mumkin
CREATE POLICY applications_delete_authenticated ON public.applications
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- Boshlang'ich maktab vakansiyalari
-- ============================================
INSERT INTO public.positions (title, description, active) VALUES
  ('Matematika o''qituvchisi', 'Boshlang''ich yoki yuqori sinflar uchun matematika o''qituvchisi', true),
  ('Ingliz tili o''qituvchisi', 'Ingliz tili darslarini yuqori saviyada olib borish', true),
  ('Boshlang''ich sinf o''qituvchisi', 'Boshlang''ich sinf o''quvchilari uchun ta''lim-tarbiya', true),
  ('IT Mutaxassis', 'Maktab infratuzilmasi va kompyuter tizimlarini boshqarish', true),
  ('Maktab psixologi', 'O''quvchilar va jamoa bilan psixologik suhbatlar o''tkazish', true);

-- ============================================
-- Admin foydalanuvchisini yaratish
-- ============================================
--
-- SELECT * FROM auth.users WHERE email = 'admin@yourcompany.com';
-- (Agar yo'q bo'lsa, Supabase Dashboard'dan qo'shing — bu xavfsizroq.)
