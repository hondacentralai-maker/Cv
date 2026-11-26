import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { normalizePhoneNumber, PHONE_COUNTRY_CODES } from '../lib/supabase';

type AuthMode = 'login' | 'signup' | 'reset';

const PIN_RE = /^\d{4,8}$/;

export const AuthPage: React.FC = () => {
  const {
    user,
    isSupabaseConfigured,
    continueAsGuest,
    signInWithPhone,
    signUpWithPhone,
    resetPasswordWithPin,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [countryCode, setCountryCode] = useState('+20');
  const [phoneInput, setPhoneInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/workspace', { replace: true });
    }
  }, [user, navigate]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setPassword('');
    setPin('');
  };

  const resolvePhoneOrError = (): string | null => {
    const normalized = normalizePhoneNumber(phoneInput, countryCode);
    if (!normalized) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح (مثال: 01012345678 أو +201012345678).');
      return null;
    }
    return normalized;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    const e164 = resolvePhoneOrError();
    if (!e164) return;

    setSubmitting(true);
    const res = await signInWithPhone(e164, password);
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    navigate('/workspace');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    const e164 = resolvePhoneOrError();
    if (!e164) return;

    const cleanPin = pin.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).trim();
    if (!PIN_RE.test(cleanPin)) {
      setErrorMsg('رمز PIN يجب أن يتكون من 4 إلى 8 أرقام فقط.');
      return;
    }

    setSubmitting(true);
    const res = await signUpWithPhone(e164, password, cleanPin, fullName);
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    navigate('/workspace');
  };

  const handleResetWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    const e164 = resolvePhoneOrError();
    if (!e164) return;

    const cleanPin = pin.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).trim();
    if (!PIN_RE.test(cleanPin)) {
      setErrorMsg('أدخل رمز PIN المكوّن من 4 إلى 8 أرقام.');
      return;
    }

    setSubmitting(true);
    const res = await resetPasswordWithPin(e164, cleanPin, password);
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    if (res.message) setInfoMsg(res.message);
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/workspace');
  };

  const renderPhoneInputGroup = (idPrefix: string) => (
    <div className="space-y-1">
      <label htmlFor={`${idPrefix}-phone`} className="block text-xs font-semibold text-slate-700">
        رقم الهاتف
      </label>
      <div className="flex gap-2" dir="ltr">
        <select
          aria-label="مفتاح الدولة"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="px-2.5 py-2.5 rounded-xl border border-line bg-slate-50 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 shrink-0"
        >
          {PHONE_COUNTRY_CODES.map((c) => (
            <option key={c.label} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          required
          autoComplete="tel"
          spellCheck={false}
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="01012345678"
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-10 px-4 sm:px-6">
      <main className="max-w-md w-full mx-auto space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a9 9 0 0 0-9 9c0 3.2 1.2 6.2 3.3 8.5" />
              <path d="M12 6a5 5 0 0 0-5 5c0 2.6.9 5 2.5 7" />
              <path d="M12 10a1 1 0 0 0-1 1c0 2.5.8 4.8 2.2 6.8" />
              <path d="M16.5 19.5c1.6-2 2.5-4.7 2.5-8.5a7 7 0 0 0-7-7" />
              <path d="M15 15c.6-1.2 1-2.5 1-4a4 4 0 0 0-4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink">بصمة | Basma</h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            دخول سريع برقم الهاتف وكلمة المرور دون رسائل تأكيد — مع رمز PIN لاسترجاع الحساب
          </p>
        </div>

        {/* Local Dev Notice when .env keys are missing */}
        {!isSupabaseConfigured && (
          <div
            role="status"
            className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1"
          >
            <div className="font-bold">وضع المعاينة المحلية (بدون مفاتيح Supabase)</div>
            <p>
              لم يتم ضبط <code className="px-1 bg-white rounded">VITE_SUPABASE_URL</code> و{' '}
              <code className="px-1 bg-white rounded">VITE_SUPABASE_ANON_KEY</code> في{' '}
              <code className="px-1 bg-white rounded">.env</code>. يمكنك المتابعة فوراً كضيف محلي
              بكامل المزايا.
            </p>
          </div>
        )}

        <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                mode === 'login' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              {renderPhoneInputGroup('login')}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-[11px] font-semibold hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    نسيت كلمة المرور؟ (رمز PIN)
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={6}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pl-16 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                  <button
                    type="button"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 left-2 px-2 text-[11px] font-semibold text-slate-500 hover:text-ink"
                  >
                    {showPassword ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!isSupabaseConfigured || submitting}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1">
                <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-700">
                  الاسم الكامل (اختياري)
                </label>
                <input
                  id="signup-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: طارق العتيبي"
                  className="w-full px-3 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              {renderPhoneInputGroup('signup')}

              <div className="space-y-1">
                <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700">
                  كلمة المرور (6 أحرف على الأقل)
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pl-16 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                  <button
                    type="button"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 left-2 px-2 text-[11px] font-semibold text-slate-500 hover:text-ink"
                  >
                    {showPassword ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signup-pin" className="block text-xs font-semibold text-slate-700">
                  رمز PIN لاسترجاع كلمة المرور (4 إلى 8 أرقام)
                </label>
                <span id="signup-pin-hint" className="block text-[11px] text-amber-800">
                  احفظ هذا الرمز؛ ستحتاجه لتغيير كلمة المرور عند نسيانها دون الحاجة لرسائل SMS.
                </span>
                <div className="relative">
                  <input
                    id="signup-pin"
                    name="pin"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    dir="ltr"
                    required
                    minLength={4}
                    maxLength={8}
                    pattern="[0-9٠-٩]{4,8}"
                    autoComplete="off"
                    aria-describedby="signup-pin-hint"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2.5 pl-16 rounded-xl border border-line text-sm text-left tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                  <button
                    type="button"
                    aria-pressed={showPin}
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute inset-y-0 left-2 px-2 text-[11px] font-semibold text-slate-500 hover:text-ink"
                  >
                    {showPin ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!isSupabaseConfigured || submitting}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {submitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والدخول فوراً'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetWithPin} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">استعادة كلمة المرور برمز PIN</h2>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-500 hover:text-ink"
                >
                  العودة للدخول
                </button>
              </div>

              {renderPhoneInputGroup('reset')}

              <div className="space-y-1">
                <label htmlFor="reset-pin" className="block text-xs font-semibold text-slate-700">
                  رمز PIN الخاص بالحساب (4 إلى 8 أرقام)
                </label>
                <div className="relative">
                  <input
                    id="reset-pin"
                    name="pin"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    dir="ltr"
                    required
                    minLength={4}
                    maxLength={8}
                    pattern="[0-9٠-٩]{4,8}"
                    autoComplete="off"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2.5 pl-16 rounded-xl border border-line text-sm text-left tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                  <button
                    type="button"
                    aria-pressed={showPin}
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute inset-y-0 left-2 px-2 text-[11px] font-semibold text-slate-500 hover:text-ink"
                  >
                    {showPin ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="reset-new-password" className="block text-xs font-semibold text-slate-700">
                  كلمة المرور الجديدة (6 أحرف على الأقل)
                </label>
                <div className="relative">
                  <input
                    id="reset-new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pl-16 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                  <button
                    type="button"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 left-2 px-2 text-[11px] font-semibold text-slate-500 hover:text-ink"
                  >
                    {showPassword ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}
              {infoMsg && (
                <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  {infoMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!isSupabaseConfigured || submitting}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {submitting ? 'جاري التحقق والتحديث...' : 'تغيير كلمة المرور والدخول'}
              </button>
            </form>
          )}

          {/* Guest Quick Try Option */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              المتابعة كضيف للتجربة الفورية ←
            </button>
            <p className="text-[11px] text-center text-muted leading-relaxed">
              تُحفظ مسودتك محلياً على جهازك، وإذا سجلت الدخول لاحقاً تُنقل مسودتك تلقائياً لحسابك.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
