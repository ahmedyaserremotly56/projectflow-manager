# ProjectFlow Manager 🚀

> **نظام إدارة المشاريع الاحترافي** - Full Stack Arabic RTL SaaS Application

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

---

## 📋 الوصف

نظام متكامل لإدارة المشاريع والعملاء وأعضاء الفريق، مبني بأحدث تقنيات الويب مع دعم كامل للغة العربية واتجاه RTL.

---

## ✅ الميزات

| الموديول | الوصف |
|---------|-------|
| 🏠 Dashboard | لوحة تحكم بإحصائيات وتقارير ورسوم بيانية |
| 📁 المشاريع | إدارة كاملة مع بحث وفلترة وترتيب |
| 💰 التسعير | سعر ثابت أو تسعير المهام مع حساب تلقائي |
| 👥 الفريق | إدارة أعضاء الفريق مع الحالة والصلاحيات |
| 🤝 العملاء | قاعدة بيانات عملاء كاملة |
| ✅ المهام | تتبع المهام مع نسبة إنجاز تلقائية |
| 🔔 الإشعارات | تنبيهات مواعيد التسليم التلقائية |
| 📊 التقارير | تقارير قابلة للتصدير لـ Excel |
| 🔐 الصلاحيات | نظام أدوار (Admin / Manager / Member) |

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 15** - App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI Components
- **Lucide Icons** - Icons
- **Recharts** - Charts

### Backend
- **Supabase** - BaaS (Backend as a Service)
- **PostgreSQL** - Database
- **Row Level Security** - Data Security

---

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب Supabase (مجاني)

---

### الخطوة 1: استنساخ المشروع

```bash
git clone <repository-url>
cd projectflow-manager
```

### الخطوة 2: تثبيت المكتبات

```bash
npm install
```

### الخطوة 3: إعداد Supabase

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. من **Project Settings → API** انسخ:
   - `Project URL`
   - `anon public key`
   - `service_role key`

### الخطوة 4: إعداد متغيرات البيئة

```bash
cp .env.example .env.local
```

افتح `.env.local` وأضف قيمك:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### الخطوة 5: إنشاء قاعدة البيانات

1. في Supabase Dashboard، اذهب إلى **SQL Editor**
2. انسخ محتوى `supabase/schema.sql` والصقه في المحرر
3. اضغط **Run**
4. كرر العملية مع `supabase/seed.sql` للبيانات التجريبية

### الخطوة 6: إنشاء مستخدم Admin

1. في Supabase Dashboard، اذهب إلى **Authentication → Users**
2. اضغط **Add user**:
   - Email: `admin@projectflow.com`
   - Password: `password123`
3. بعد الإنشاء، اذهب إلى **Table Editor → profiles**
4. غير `role` لهذا المستخدم إلى `admin`

### الخطوة 7: تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: **http://localhost:3000**

---

## 📁 هيكل المشروع

```
projectflow-manager/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # صفحات لوحة التحكم
│   │   │   ├── dashboard/        # الصفحة الرئيسية
│   │   │   ├── projects/         # المشاريع
│   │   │   │   ├── [id]/         # تفاصيل المشروع
│   │   │   │   └── new/          # مشروع جديد
│   │   │   ├── clients/          # العملاء
│   │   │   ├── team/             # الفريق
│   │   │   ├── notifications/    # الإشعارات
│   │   │   └── reports/          # التقارير
│   │   ├── auth/
│   │   │   ├── login/            # تسجيل الدخول
│   │   │   └── register/         # إنشاء حساب
│   │   ├── layout.tsx            # Layout الرئيسي
│   │   └── globals.css           # أنماط CSS
│   ├── components/
│   │   ├── ui/                   # مكونات Shadcn UI
│   │   ├── layout/               # Sidebar & Header
│   │   ├── dashboard/            # مكونات Dashboard
│   │   ├── projects/             # مكونات المشاريع
│   │   ├── clients/              # مكونات العملاء
│   │   ├── team/                 # مكونات الفريق
│   │   ├── notifications/        # مكونات الإشعارات
│   │   └── reports/              # مكونات التقارير
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase Client
│   │   │   └── server.ts         # Supabase Server
│   │   └── utils.ts              # Utility Functions
│   ├── types/
│   │   └── index.ts              # TypeScript Types
│   ├── hooks/
│   │   └── use-toast.ts          # Toast Hook
│   └── middleware.ts             # Auth Middleware
├── supabase/
│   ├── schema.sql                # Database Schema + Policies
│   └── seed.sql                  # Seed Data
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🔐 نظام الصلاحيات

| الصلاحية | Admin | Manager | Member |
|---------|-------|---------|--------|
| إدارة المشاريع | ✅ | ✅ | ❌ |
| عرض المشاريع | ✅ | ✅ | المكلف فقط |
| إدارة العملاء | ✅ | ✅ | ❌ |
| إدارة الفريق | ✅ | ✅ | ❌ |
| التقارير | ✅ | ✅ | ❌ |
| حذف البيانات | ✅ | ❌ | ❌ |

---

## 🏗️ البناء للنشر

```bash
npm run build
npm start
```

### النشر على Vercel

```bash
# ثبّت Vercel CLI
npm i -g vercel

# النشر
vercel --prod
```

تأكد من إضافة متغيرات البيئة في Vercel Dashboard.

---

## 📈 ممارسات الأمان المطبقة

- ✅ Row Level Security (RLS) في PostgreSQL
- ✅ Authentication عبر Supabase Auth
- ✅ Server-side session validation
- ✅ Role-based access control (RBAC)
- ✅ Input validation مع TypeScript
- ✅ Protected routes مع Middleware
- ✅ HTTPS-only cookies

---

## 📞 الدعم الفني

في حالة أي مشكلة، تحقق من:
1. متغيرات البيئة مضبوطة صحيحاً
2. schema.sql تم تشغيله بدون أخطاء
3. RLS policies مفعّلة

---

**بُني بـ ❤️ باستخدام Next.js 15 + Supabase**
