# Supabase sozlash

## 1. Loyihani yaratish
1. https://supabase.com → "New project"
2. Loyiha nomi, parol, region (Frankfurt yoki Singapore)
3. Loyihani yaratganingizdan keyin **Project Settings → API** dan quyidagilarni nusxalang:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (bu maxfiy, hech qachon frontend'ga chiqarmang!)

## 2. Database sxemasini o'rnatish
1. Supabase Dashboard → **SQL Editor** → "New query"
2. `supabase/schema.sql` faylini ochib, butun matnini nusxalang
3. Yopishtiring va **Run** tugmasini bosing
4. Natijada `applications` va `positions` jadvallari yaratiladi, RLS yoqiladi, dastlabki lavozimlar qo'shiladi

## 3. Admin foydalanuvchisini yaratish
1. Supabase Dashboard → **Authentication → Users → Add user**
2. "Send invite" emas, **"Create new user"** ni tanlang
3. Email va parolni kiriting
4. "Auto Confirm User?" ni yoqing (email tasdiqlashsiz)
5. **"Create user"** bosing

Endi shu email/parol bilan `/admin/login` sahifasidan kirishingiz mumkin.

## 4. Ochiq ro'yxatdan o'tishni o'chirish
**Authentication → Providers → Email** sahifasida:
- "Enable Email Signups" ni **o'chiring** (faqat dashboard orqali admin qo'shiladi)

## 5. Tekshirish
SQL Editor'da quyidagilarni ishga tushiring:
```sql
SELECT COUNT(*) FROM public.positions; -- 4 chiqishi kerak
SELECT COUNT(*) FROM public.applications; -- 0
SELECT email FROM auth.users; -- siz yaratgan admin email
```
