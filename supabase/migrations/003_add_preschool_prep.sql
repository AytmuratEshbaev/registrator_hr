-- ============================================
-- Migratsiya: student_applications jadvaliga preschool_prep ustuni
-- ============================================
-- Maktabdan oldingi tayyorgarlik darslari kerakmi (faqat 1-sinf uchun ma'noli).
-- Qiymatlar: 'yes' | 'no'. Standart: 'no'.
-- Supabase SQL Editor'da ishga tushiring.

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS preschool_prep text NOT NULL DEFAULT 'no';
