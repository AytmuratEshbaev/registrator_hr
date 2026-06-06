-- ============================================
-- [LEGACY / ESKIRGAN] O'quvchi Registratsiyasi — Alohida Database sxemasi
-- ============================================
-- ⚠️ BU FAYLNI ISHGA TUSHIRMANG. `schema.sql` endi `student_applications` jadvalini
--    (preschool_prep ustuni bilan birga) to'liq o'z ichiga oladi. Bu faylni `schema.sql`
--    bilan birga ishga tushirsangiz "trigger/policy already exists" xatosi chiqadi.
--    Faqat tarixiy ma'lumot uchun saqlangan.

-- ----- student_applications jadvali -----
CREATE TABLE IF NOT EXISTS public.student_applications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_number    text NOT NULL UNIQUE,
  first_name         text NOT NULL,
  last_name          text NOT NULL,
  middle_name        text NOT NULL, -- O'quvchi sharifi (Otasining ismi)
  phone              text NOT NULL, -- Asosiy telefon
  phone_secondary    text,          -- Qo'shimcha telefon
  grade              text NOT NULL, -- Qabul qilinadigan sinf (masalan: 1-sinf)
  preschool_prep     text NOT NULL DEFAULT 'no', -- Maktabdan oldingi tayyorgarlik darslari (faqat 1-sinf): 'yes' | 'no'
  status             public.application_status NOT NULL DEFAULT 'pending',
  hr_note            text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_passport_format CHECK (passport_number ~* '^[A-Z0-9 -]{5,20}$')
);

-- Indekslar
CREATE INDEX IF NOT EXISTS student_apps_status_idx ON public.student_applications (status);
CREATE INDEX IF NOT EXISTS student_apps_created_at_idx ON public.student_applications (created_at DESC);

-- trigger updated_at avtomatik yangilanishi
CREATE TRIGGER student_applications_set_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS faollashtirish
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- Politikalari (RLS Policies)
CREATE POLICY student_apps_select_authenticated ON public.student_applications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY student_apps_update_authenticated ON public.student_applications
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY student_apps_delete_authenticated ON public.student_applications
  FOR DELETE TO authenticated
  USING (true);
