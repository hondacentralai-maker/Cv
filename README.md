# بصمة | Basma — منشئ البورتفوليو والسيرة الذاتية ATS

تطبيق ويب إنتاجي يعمل بنموذج **Local-First & Zero-Storage-Cost**:
- **استضافة ثابتة 100% (Static SPA)** على Cloudflare Pages دون الحاجة لأي دوال خلفية (`Functions`).
- **Supabase Auth فقط** للمصادقة (البريد الإلكتروني وكلمة المرور + Google OAuth + استعادة كلمة المرور)، مع **صفر جداول قاعدة بيانات وصفر Storage Buckets**.
- **تخزين محلي معزول في المتصفح** عبر `IndexedDB` (مع fallback تلقائي لـ `localStorage`) تحت مفتاح معزول لكل مستخدم (`basma_vault_user_<userId>` أو `basma_vault_guest`) ودعم حتى **3 نسخ محلية مختلفة** من السيرة والبورتفوليو.
- **مخرجات إنتاجية حقيقية**: ورقة A4 أحادية العمود متوافقة مع ATS، فاحص جودة السيرة ومطابقة وصف الوظيفة (JD Matcher)، بطاقة أعمال رقمية مع **QR Code حقيقي بصيغة vCard 3.0**، وتصدير ملف **HTML مستقل** يعمل أوفلاين بدون CDN.

---

## 1. التشغيل المحلي (Local Development)

```bash
npm install
cp .env.example .env
npm run dev
```

> **ملاحظة:** في حال عدم ضبط متغيرات `.env` أثناء التطوير، يعمل التطبيق تلقائياً في **وضع الضيف المحلي** دون الحاجة لإعداد Supabase فوراً.

---

## 2. تفعيل Supabase Auth (Email + Google)

1. أنشئ مشروعاً مجانياً في [Supabase](https://supabase.com/).
2. لا تقم بإنشاء أي جداول قاعدة بيانات أو Storage Buckets — التطبيق يعتمد على `Auth` فقط.
3. من **Authentication → Providers**:
   - فعّل **Email** (مع تفعيل استعادة كلمة المرور).
   - فعّل **Google** وأضف `Client ID` و `Client Secret` من Google Cloud Console.
4. من **Authentication → URL Configuration**:
   - اضبط **Site URL** على رابط موقعك الإنتاجي (مثال: `https://basma.pages.dev`).
   - أضف روابط التوجيه المسموحة في **Redirect URLs**:
     - `http://localhost:5173/workspace`
     - `http://localhost:5173/auth`
     - `https://your-domain.pages.dev/workspace`
     - `https://your-domain.pages.dev/auth`
5. انسخ `Project URL` و `anon public key` من **Project Settings → API** إلى ملف `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

---

## 3. النشر المباشر على Cloudflare Pages

1. اربط مستودع Git بـ **Cloudflare Pages** (أو ارفع مجلد `dist` مباشرة).
2. إعدادات البناء:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. أضف متغيرات البيئة في **Settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. يتضمن المشروع ملف `public/_redirects` بالمحتوى `/* /index.html 200` لدعم مسارات SPA (`/auth`, `/workspace`) مباشرة.

---

## 4. التحقق من البناء والأنواع

```bash
npx tsc --noEmit
npm run build
```
