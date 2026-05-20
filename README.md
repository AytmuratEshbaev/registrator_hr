# HR Registratsiya Platformasi

Yaqinda ochilgan firma uchun nomzodlardan ariza qabul qilish va HR adminlari uchun ularni boshqarish platformasi. 1 oylik qisqa muddatli loyiha, ~200 nomzod uchun mo'ljallangan. Barcha xizmatlar bepul tarifda ishlaydi.

## Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Frontend/Backend | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Database + Auth | Supabase (PostgreSQL) |
| Fayl saqlash | Cloudflare R2 (S3-compatible) |
| Forma | React Hook Form + Zod |
| Eksport | xlsx (SheetJS) |
| Hosting | Vercel |

## Tezkor boshlash

```bash
# 1. Bog'liqliklarni o'rnatish
npm install

# 2. .env.local yaratish (.env.example'dan nusxa olib, kalitlarni to'ldiring)
cp .env.example .env.local

# 3. Supabase va R2'ni sozlash (quyida batafsil)

# 4. Development serverni ishga tushirish
npm run dev
```

Lokal manzil: http://localhost:3000

## To'liq sozlash qo'llanmasi

### 1. Supabase
Batafsil: [`supabase/README.md`](supabase/README.md)

Qisqa:
1. https://supabase.com da yangi loyiha yarating
2. **SQL Editor** → `supabase/schema.sql` faylini ishga tushiring (jadvallar, RLS, dastlabki lavozimlar)
3. **Authentication → Users** → admin foydalanuvchi qo'shing (email + parol)
4. **Authentication → Providers → Email** → "Enable Email Signups" ni o'chiring
5. **Project Settings → API** dan URL va kalitlarni nusxalab `.env.local` ga yozing

### 2. Cloudflare R2
1. https://dash.cloudflare.com → R2 → "Create bucket" (masalan: `hr-registrator-files`)
2. **Manage R2 API Tokens** → "Create API Token" → "Admin Read & Write" → faqat shu bucket uchun → nusxalang
3. Bucket sozlamalarida CORS qo'shing (R2 → Bucket → Settings → CORS Policy):
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://your-vercel-domain.vercel.app"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. `.env.local` ga `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT` yozing

### 3. Vercel'ga deploy
1. https://vercel.com → "Add new project" → GitHub'dan loyihani import qiling
2. Framework: Next.js (avtomatik aniqlanadi)
3. Environment Variables qismida `.env.example` dagi barcha o'zgaruvchilarni qo'shing (haqiqiy production qiymatlari bilan)
4. Deploy bosing
5. Vercel domeni R2 CORS sozlamalariga qo'shilganini tekshiring

## Loyiha tuzilishi

```
registrator/
├── app/
│   ├── (public)/          # Nomzod sahifalari
│   │   ├── page.tsx       # Bosh sahifa
│   │   └── apply/         # Ariza topshirish oqimi
│   ├── admin/             # HR admin paneli
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── applications/
│   │   └── positions/
│   ├── api/               # API endpoints
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── public/            # Nomzod UI komponentlari
│   ├── admin/             # Admin UI komponentlari
│   └── forms/             # Forma komponentlari
├── lib/
│   ├── supabase/          # Supabase clients (browser/server/admin/middleware)
│   ├── r2/                # R2 storage qatlami
│   ├── validations/       # Zod sxemalari
│   ├── constants.ts       # FILE_LIMITS, STATUSES, REGEXES
│   ├── utils.ts           # cn, formatDate, formatPhone, ...
│   └── rate-limit.ts      # In-memory rate limiting
├── supabase/
│   ├── schema.sql         # Database sxemasi
│   └── README.md          # Supabase setup qo'llanmasi
├── middleware.ts          # /admin yo'llarini himoya qiladi
├── .env.example
└── package.json
```

## Asosiy oqimlar

### Nomzod oqimi
1. `/` — bosh sahifa, lavozimlar ro'yxati, "Ariza topshirish"
2. `/apply` — pasport raqamini kiritish + Turnstile → backend tekshiradi (duplicate?)
3. `/apply/form?passport=AA1234567` — to'liq forma, hujjatlar yuklash (R2'ga presigned URL bilan)
4. `/apply/success` — muvaffaqiyat tasdig'i

### Admin oqimi (himoyalangan)
1. `/admin/login` — email + parol
2. `/admin/dashboard` — statistika
3. `/admin/applications` — arizalar ro'yxati (filtr, qidiruv, eksport)
4. `/admin/applications/[id]` — bitta ariza tafsilotlari, hujjatlar (signed URL bilan yuklab olish), status o'zgartirish, HR izohi
5. `/admin/positions` — lavozimlar CRUD

## Xavfsizlik
- **HTTPS**: Vercel avtomatik ta'minlaydi
- **RLS**: Supabase tomonida — anon foydalanuvchi `applications` jadvalini o'qiy olmaydi
- **Service Role**: faqat server-side API'da ishlatiladi, hech qachon clientga chiqarilmaydi
- **Rate limit**: `/api/check-passport` va `/api/applications` — IP'ga daqiqasiga 5 ta urinish (`lib/rate-limit.ts`)
- **Fayl validatsiya**: MIME va hajm backend'da Zod orqali tekshiriladi
- **Signed URL'lar**: R2 fayllari faqat 10 daqiqalik signed URL orqali yuklab olinadi (admin)
- **UNIQUE pasport constraint**: database darajasida — bir pasport bilan ikki marta yozish mumkin emas
- **Middleware**: `/admin/*` autentifikatsiyasiz `/admin/login` ga redirect qiladi

## Skriptlar

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run start    # Production serverni ishga tushirish
npm run lint     # ESLint
```

## Cheklovlar va e'tiborga oligan jihatlar
- **Bepul tariflar**: Vercel 100GB/oy bandwidth, Supabase 500MB DB, R2 10GB. 200 nomzod ~ 8MB hujjat har biri = ~1.6GB. Yetarli.
- **Rate limiting in-memory**: Vercel serverless'da har funksiya invokatsiyasi alohida xotira. Production'da Upstash Redis kerak bo'lishi mumkin. Hozircha yetarli.
- **Email yuborilmaydi**: spec'da yo'q. Keyinroq Resend qo'shish mumkin.
- **Audit log yo'q**: HR amallari tarixi yozilmaydi.
- **Bot himoyasi yo'q**: Turnstile olib tashlangan. Spam paydo bo'lsa qayta qo'shish mumkin.

## Litsenziya
Internal — qisqa muddatli loyiha. Litsenziya yo'q.
