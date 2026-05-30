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

-- ----- applications jadvali (Vakansiyalar uchun) -----
CREATE TABLE public.applications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_number    text NOT NULL UNIQUE,
  first_name         text NOT NULL,
  last_name          text NOT NULL,
  middle_name        text, -- Nomzod sharifi
  phone              text NOT NULL, -- Asosiy telefon
  phone_secondary    text, -- Qo'shimcha telefon
  birth_date         date NOT NULL, -- Ishchi yoshini tekshirish uchun majburiy
  position_id        uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  position_title     text NOT NULL,
  cv_url             text NOT NULL, -- Rezyume topshirish majburiy
  passport_scan_url  text,
  diploma_url        text,
  photo_url          text,
  status             public.application_status NOT NULL DEFAULT 'pending',
  hr_note            text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_format CHECK (passport_number ~* '^[A-Z0-9 -]{5,20}$')
);

-- ----- student_applications jadvali (O'quvchilar uchun) -----
CREATE TABLE public.student_applications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_number    text NOT NULL UNIQUE,
  first_name         text NOT NULL,
  last_name          text NOT NULL,
  middle_name        text NOT NULL, -- O'quvchi sharifi (Otasining ismi)
  phone              text NOT NULL, -- Asosiy telefon
  phone_secondary    text,          -- Qo'shimcha telefon
  grade              text NOT NULL, -- Qabul qilinadigan sinf
  status             public.application_status NOT NULL DEFAULT 'pending',
  hr_note            text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_passport_format CHECK (passport_number ~* '^[A-Z0-9 -]{5,20}$')
);

CREATE INDEX applications_status_idx       ON public.applications (status);
CREATE INDEX applications_position_id_idx  ON public.applications (position_id);
CREATE INDEX applications_created_at_idx   ON public.applications (created_at DESC);
CREATE INDEX applications_last_name_idx    ON public.applications USING gin (to_tsvector('simple', last_name));

CREATE INDEX student_apps_status_idx       ON public.student_applications (status);
CREATE INDEX student_apps_created_at_idx   ON public.student_applications (created_at DESC);

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

CREATE TRIGGER student_applications_set_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- RLS (Row Level Security) politikalari
-- ============================================
ALTER TABLE public.applications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions           ENABLE ROW LEVEL SECURITY;

-- positions: hamma faol lavozimlarni o'qiy oladi
CREATE POLICY positions_select_public ON public.positions
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- positions: faqat authenticated foydalanuvchilar (adminlar) yarata/yangilashi mumkin
CREATE POLICY positions_all_authenticated ON public.positions
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- applications (Vakansiyalar):
CREATE POLICY applications_select_authenticated ON public.applications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY applications_update_authenticated ON public.applications
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY applications_delete_authenticated ON public.applications
  FOR DELETE TO authenticated
  USING (true);

-- student_applications (O'quvchilar):
CREATE POLICY student_apps_select_authenticated ON public.student_applications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY student_apps_update_authenticated ON public.student_applications
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY student_apps_delete_authenticated ON public.student_applications
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
