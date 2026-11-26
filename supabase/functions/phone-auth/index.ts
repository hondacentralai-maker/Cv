import { createClient } from 'npm:@supabase/supabase-js@2';
import postgres from 'npm:postgres@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const E164_RE = /^\+[1-9]\d{7,14}$/;
const PIN_RE = /^\d{4,8}$/;
const MAX_PIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derivePinHash(pin: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(derived));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function normalizeE164(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const cleaned = raw
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[\s\-().]/g, '')
    .replace(/^00/, '+');
  return E164_RE.test(cleaned) ? cleaned : '';
}

function getAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS');
  let adminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (secretKeysRaw) {
    try {
      const parsed = JSON.parse(secretKeysRaw) as Record<string, string>;
      if (parsed.default) adminKey = parsed.default;
    } catch {
      // Fallback to SUPABASE_SERVICE_ROLE_KEY
    }
  }
  if (!supabaseUrl || !adminKey) {
    throw new Error('Missing Supabase server credentials.');
  }
  return createClient(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getSqlClient() {
  const dbUrl = Deno.env.get('SUPABASE_DB_URL');
  if (!dbUrl) {
    throw new Error('Missing SUPABASE_DB_URL.');
  }
  return postgres(dbUrl, { max: 1, prepare: false });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'طريقة الطلب غير مدعومة.' }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'بيانات الطلب غير صالحة.' }, 400);
  }

  const action = String(payload.action ?? '').trim();
  const sql = getSqlClient();

  try {
    const supabaseAdmin = getAdminClient();

    if (action === 'signup') {
      const phone = normalizeE164(payload.phone);
      const password = typeof payload.password === 'string' ? payload.password : '';
      const pin = typeof payload.pin === 'string' ? payload.pin.trim() : '';
      const fullName =
        typeof payload.fullName === 'string' ? payload.fullName.trim().slice(0, 100) : '';

      if (!phone) {
        return jsonResponse({ error: 'صيغة رقم الهاتف غير صالحة.' }, 400);
      }
      if (password.length < 6) {
        return jsonResponse({ error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' }, 400);
      }
      if (!PIN_RE.test(pin)) {
        return jsonResponse({ error: 'رمز PIN يجب أن يتكون من 4 إلى 8 أرقام فقط.' }, 400);
      }

      const existing = await sql<{ user_id: string }[]>`
        SELECT user_id FROM private.auth_pins WHERE phone = ${phone} LIMIT 1
      `;
      if (existing.length > 0) {
        return jsonResponse(
          { error: 'رقم الهاتف مسجل بالفعل — يمكنك تسجيل الدخول أو استعادة كلمة المرور.' },
          409
        );
      }

      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        phone,
        password,
        phone_confirm: true,
        user_metadata: {
          phone,
          ...(fullName ? { full_name: fullName } : {}),
        },
      });

      if (createErr || !created.user) {
        const msg = (createErr?.message ?? '').toLowerCase();
        if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
          return jsonResponse(
            { error: 'رقم الهاتف مسجل بالفعل — يمكنك تسجيل الدخول مباشرة.' },
            409
          );
        }
        return jsonResponse(
          { error: createErr?.message || 'تعذّر إنشاء الحساب حالياً.' },
          400
        );
      }

      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const pinSalt = bytesToHex(saltBytes);
      const pinHash = await derivePinHash(pin, pinSalt);

      try {
        await sql`
          INSERT INTO private.auth_pins (user_id, phone, pin_salt, pin_hash)
          VALUES (${created.user.id}, ${phone}, ${pinSalt}, ${pinHash})
        `;
      } catch (dbErr) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id);
        throw dbErr;
      }

      return jsonResponse({ ok: true, userId: created.user.id }, 201);
    }

    if (action === 'reset-password') {
      const phone = normalizeE164(payload.phone);
      const pin = typeof payload.pin === 'string' ? payload.pin.trim() : '';
      const newPassword =
        typeof payload.newPassword === 'string' ? payload.newPassword : '';

      if (!phone || !PIN_RE.test(pin)) {
        return jsonResponse({ error: 'تحقق من رقم الهاتف وصيغة رمز PIN (4–8 أرقام).' }, 400);
      }
      if (newPassword.length < 6) {
        return jsonResponse(
          { error: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' },
          400
        );
      }

      const rows = await sql<
        {
          user_id: string;
          pin_salt: string;
          pin_hash: string;
          failed_attempts: number;
          locked_until: string | null;
        }[]
      >`
        SELECT user_id, pin_salt, pin_hash, failed_attempts, locked_until
        FROM private.auth_pins
        WHERE phone = ${phone}
        LIMIT 1
      `;

      const row = rows[0];
      if (!row) {
        return jsonResponse({ error: 'رقم الهاتف أو رمز PIN غير صحيح.' }, 401);
      }

      if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
        return jsonResponse(
          {
            error:
              'تم إيقاف محاولات الاستعادة مؤقتاً لمدة 15 دقيقة بسبب تكرار إدخال رمز PIN خاطئ.',
          },
          429
        );
      }

      const candidateHash = await derivePinHash(pin, row.pin_salt);
      if (!constantTimeEqual(candidateHash, row.pin_hash)) {
        const nextAttempts = row.failed_attempts + 1;
        const shouldLock = nextAttempts >= MAX_PIN_ATTEMPTS;
        await sql`
          UPDATE private.auth_pins
          SET
            failed_attempts = ${shouldLock ? 0 : nextAttempts},
            locked_until = ${
              shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null
            },
            updated_at = now()
          WHERE user_id = ${row.user_id}
        `;
        return jsonResponse(
          {
            error: shouldLock
              ? 'تم إدخال رمز PIN بشكل خاطئ 5 مرات — تم القفل لمدة 15 دقيقة.'
              : 'رقم الهاتف أو رمز PIN غير صحيح.',
          },
          shouldLock ? 429 : 401
        );
      }

      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
        password: newPassword,
      });

      if (updErr) {
        return jsonResponse({ error: 'تعذّر تحديث كلمة المرور — حاول مرة أخرى.' }, 500);
      }

      await sql`
        UPDATE private.auth_pins
        SET failed_attempts = 0, locked_until = NULL, updated_at = now()
        WHERE user_id = ${row.user_id}
      `;

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: 'إجراء غير معروف.' }, 400);
  } catch (err) {
    console.error('phone-auth error:', err);
    return jsonResponse({ error: 'حدث خطأ داخلي في الخادم.' }, 500);
  } finally {
    await sql.end({ timeout: 2 });
  }
});
