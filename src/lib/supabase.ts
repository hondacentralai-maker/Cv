import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
export const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-public-anon-key')
);

/**
 * Auth-only Supabase client. Never used for portfolio database tables or storage buckets.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const PHONE_COUNTRY_CODES: { code: string; label: string }[] = [
  { code: '+20', label: 'مصر (+20)' },
  { code: '+966', label: 'السعودية (+966)' },
  { code: '+971', label: 'الإمارات (+971)' },
  { code: '+965', label: 'الكويت (+965)' },
  { code: '+974', label: 'قطر (+974)' },
  { code: '+973', label: 'البحرين (+973)' },
  { code: '+968', label: 'عُمان (+968)' },
  { code: '+962', label: 'الأردن (+962)' },
  { code: '+964', label: 'العراق (+964)' },
  { code: '+212', label: 'المغرب (+212)' },
  { code: '+213', label: 'الجزائر (+213)' },
  { code: '+216', label: 'تونس (+216)' },
  { code: '', label: 'دولي (+...)' },
];

const E164_RE = /^\+[1-9]\d{7,14}$/;

/**
 * Normalizes a local or international phone input (supporting Arabic/Persian digits)
 * into canonical E.164 format (+<country><number>), or returns '' if invalid.
 */
export function normalizePhoneNumber(rawInput: string, countryCode = '+20'): string {
  const ascii = rawInput
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[\s\-().]/g, '');

  if (!ascii) return '';

  let candidate = ascii;
  if (candidate.startsWith('00')) {
    candidate = `+${candidate.slice(2)}`;
  } else if (!candidate.startsWith('+')) {
    if (!countryCode) {
      candidate = `+${candidate.replace(/^0+/, '')}`;
    } else {
      const localDigits = candidate.replace(/^0+/, '');
      candidate = `${countryCode}${localDigits}`;
    }
  }

  return E164_RE.test(candidate) ? candidate : '';
}

export function formatPhoneDisplay(rawPhone: string | undefined | null): string {
  const val = String(rawPhone ?? '').trim();
  if (!val) return '';
  return val.startsWith('+') ? val : `+${val}`;
}

export async function callPhoneAuthEndpoint(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      status: 500,
      data: { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' },
    };
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/phone-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(payload),
  });

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return { ok: res.ok, status: res.status, data };
}
