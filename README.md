# بصمة | Basma — منشئ البورتفوليو والسيرة الذاتية ATS

تطبيق ويب إنتاجي يعمل بنموذج **Local-First & Zero-Storage-Cost**:
- **استضافة ثابتة 100% (Static SPA)** على Cloudflare Pages دون الحاجة لأي دوال خلفية (`Functions`).
- **Supabase Auth فقط** للمصادقة (رقم الهاتف + كلمة المرور بدون تأكيد + رمز PIN لاستعادة كلمة المرور عبر Edge Function `phone-auth`، مع **صفر جداول محتوى عامة وصفر Storage Buckets**).
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

## 2. تفعيل Supabase Auth (رقم الهاتف + كلمة المرور + PIN)

1. أنشئ مشروعاً مجانياً في [Supabase](https://supabase.com/).
2. لا تقم بإنشاء أي جداول للمحتوى أو Storage Buckets.
3. من **Authentication → Providers**: فعّل **Phone** (دون الحاجة لمزود SMS مدفوع).
4. طبّق الترحيل `supabase/migrations/20261126000001_private_auth_pins.sql` (جدول `private.auth_pins` معزول تماماً عن `public` ومغلق على `service_role` فقط لتخزين hash رمز PIN عبر PBKDF2-SHA256).
5. انشر دالة المصادقة السحابية:
   ```bash
   supabase functions deploy phone-auth --no-verify-jwt --use-api
   ```
6. انسخ `Project URL` و`Publishable key` من **Project Settings → API** إلى ملف `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
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
