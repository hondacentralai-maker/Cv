import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  callPhoneAuthEndpoint,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';

const GUEST_SESSION_KEY = 'basma_guest_session_v1';

interface AuthActionResult {
  error: string | null;
  message?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  isSupabaseConfigured: boolean;
  continueAsGuest: () => void;
  signInWithPhone: (e164Phone: string, password: string) => Promise<AuthActionResult>;
  signUpWithPhone: (
    e164Phone: string,
    password: string,
    pin: string,
    fullName?: string
  ) => Promise<AuthActionResult>;
  resetPasswordWithPin: (
    e164Phone: string,
    pin: string,
    newPassword: string
  ) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readGuestFlag(): boolean {
  try {
    return window.sessionStorage.getItem(GUEST_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeGuestFlag(enabled: boolean): void {
  try {
    if (enabled) {
      window.sessionStorage.setItem(GUEST_SESSION_KEY, '1');
    } else {
      window.sessionStorage.removeItem(GUEST_SESSION_KEY);
    }
  } catch {
    // Ignore restricted sessionStorage
  }
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'رقم الهاتف أو كلمة المرور غير صحيحة.';
  }
  if (lower.includes('phone logins are disabled')) {
    return 'تسجيل الدخول برقم الهاتف غير مفعّل في إعدادات Supabase.';
  }
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'رقم الهاتف مسجل مسبقاً — يمكنك تسجيل الدخول مباشرة أو استعادة كلمة المرور.';
  }
  if (lower.includes('password should be at least')) {
    return 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'تم إرسال عدة طلبات متتالية — انتظر قليلاً ثم أعد المحاولة.';
  }
  return message || 'تعذّر إتمام العملية. يرجى المحاولة مرة أخرى.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() =>
    !isSupabaseConfigured ? true : readGuestFlag()
  );
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          writeGuestFlag(false);
          setIsGuest(false);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        writeGuestFlag(false);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const continueAsGuest = useCallback(() => {
    writeGuestFlag(true);
    setIsGuest(true);
  }, []);

  const signInWithPhone = useCallback(
    async (e164Phone: string, password: string): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }
      const { error } = await supabase.auth.signInWithPassword({
        phone: e164Phone,
        password,
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      return { error: null };
    },
    []
  );

  const signUpWithPhone = useCallback(
    async (
      e164Phone: string,
      password: string,
      pin: string,
      fullName?: string
    ): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }

      try {
        const res = await callPhoneAuthEndpoint({
          action: 'signup',
          phone: e164Phone,
          password,
          pin,
          fullName: fullName?.trim() ?? '',
        });

        if (!res.ok) {
          return {
            error:
              (typeof res.data.error === 'string' && res.data.error) ||
              'تعذّر إنشاء الحساب.',
          };
        }

        const { error: signInErr } = await supabase.auth.signInWithPassword({
          phone: e164Phone,
          password,
        });
        if (signInErr) {
          return { error: translateAuthError(signInErr.message) };
        }
        return { error: null, message: 'تم إنشاء الحساب وتسجيل الدخول بنجاح.' };
      } catch {
        return { error: 'تعذّر الاتصال بخادم المصادقة — تحقق من اتصالك بالإنترنت.' };
      }
    },
    []
  );

  const resetPasswordWithPin = useCallback(
    async (
      e164Phone: string,
      pin: string,
      newPassword: string
    ): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }

      try {
        const res = await callPhoneAuthEndpoint({
          action: 'reset-password',
          phone: e164Phone,
          pin,
          newPassword,
        });

        if (!res.ok) {
          return {
            error:
              (typeof res.data.error === 'string' && res.data.error) ||
              'رقم الهاتف أو رمز PIN غير صحيح.',
          };
        }

        const { error: signInErr } = await supabase.auth.signInWithPassword({
          phone: e164Phone,
          password: newPassword,
        });
        if (signInErr) {
          return {
            error: null,
            message: 'تم تحديث كلمة المرور بنجاح — يمكنك تسجيل الدخول الآن.',
          };
        }

        return {
          error: null,
          message: 'تمت استعادة الحساب وتحديث كلمة المرور بنجاح.',
        };
      } catch {
        return { error: 'تعذّر الاتصال بخادم المصادقة — تحقق من اتصالك بالإنترنت.' };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    writeGuestFlag(false);
    setIsGuest(!isSupabaseConfigured);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isGuest,
        loading,
        isSupabaseConfigured,
        continueAsGuest,
        signInWithPhone,
        signUpWithPhone,
        resetPasswordWithPin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
