-- Migration: applications jadvalidan `address` ustunini olib tashlash
-- Sanasi: 2026-05-20
-- Sabab: forma'da manzil maydoni kerak emas

ALTER TABLE public.applications DROP COLUMN IF EXISTS address;
