import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset';

export const AuthPage: React.FC = () => {
  const {
    user,
    isSupabaseConfigured,
    isPasswordRecovery,
    continueAsGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    updatePassword,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isPasswordRecovery) {
      navigate('/workspace', { replace: true });
    }
  }, [user, isPasswordRecovery, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await signInWithEmail(email, password);
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
    setSubmitting(true);
    const res = await signUpWithEmail(email, password, fullName);
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    if (res.message) setInfoMsg(res.message);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await sendPasswordReset(email);
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    if (res.message) setInfoMsg(res.message);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await updatePassword(newPassword);
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
      return;
    }
    navigate('/workspace');
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setSubmitting(false);
      setErrorMsg(res.error);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/workspace');
  };

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
            منشئ البورتفوليو والسيرة الذاتية المتوافقة مع ATS — خصوصية كاملة وتخزين محلي على جهازك
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
          {isPasswordRecovery ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-ink">تعيين كلمة مرور جديدة</h2>
                <p className="text-xs text-muted mt-0.5">
                  أدخل كلمة المرور الجديدة لإكمال استعادة حسابك
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="recovery-password" className="block text-xs font-semibold text-slate-700">
                  كلمة المرور الجديدة
                </label>
                <input
                  id="recovery-password"
                  name="new-password"
                  type="password"
                  dir="ltr"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  placeholder="••••••••"
                />
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {submitting ? 'جاري التحديث...' : 'حفظ كلمة المرور الجديدة'}
              </button>
            </form>
          ) : (
            <>
              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    mode === 'login' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    mode === 'signup' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
                  }`}
                >
                  إنشاء حساب
                </button>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                disabled={!isSupabaseConfigured || submitting}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-line bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>المتابعة بحساب Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <span className="h-px w-full bg-line" />
                <span className="px-3 text-[11px] font-medium text-slate-400 bg-white shrink-0">
                  أو بالبريد الإلكتروني
                </span>
                <span className="h-px w-full bg-line" />
              </div>

              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700">
                      البريد الإلكتروني
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      dir="ltr"
                      required
                      autoComplete="username"
                      spellCheck={false}
                      autoCapitalize="none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setErrorMsg(null);
                          setInfoMsg(null);
                        }}
                        className="text-[11px] font-semibold hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        نسيت كلمة المرور؟
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
                    {submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
                  </button>
                </form>
              )}

              {mode === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div className="space-y-1">
                    <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-700">
                      الاسم الكامل
                    </label>
                    <input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: طارق العتيبي"
                      className="w-full px-3 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700">
                      البريد الإلكتروني
                    </label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      dir="ltr"
                      required
                      autoComplete="username"
                      spellCheck={false}
                      autoCapitalize="none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                    />
                  </div>

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
                    {submitting ? 'جاري الإنشاء...' : 'إنشاء حساب جديد'}
                  </button>
                </form>
              )}

              {mode === 'reset' && (
                <form onSubmit={handleResetRequest} className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-ink">استعادة كلمة المرور</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-ink"
                    >
                      العودة للدخول
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700">
                      البريد الإلكتروني المسجل
                    </label>
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      dir="ltr"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      autoCapitalize="none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                    />
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
                    {submitting ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                  </button>
                </form>
              )}
            </>
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
