import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

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
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  continueAsGuest: () => void;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  sendPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (newPassword: string) => Promise<AuthActionResult>;
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
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }
  if (lower.includes('email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك أولاً.';
  }
  if (lower.includes('user already registered')) {
    return 'هذا البريد الإلكتروني مسجل مسبقاً — يمكنك تسجيل الدخول مباشرة.';
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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

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

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

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

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      return { error: null };
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      fullName?: string
    ): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/workspace`,
          data: fullName?.trim() ? { full_name: fullName.trim() } : undefined,
        },
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      if (!data.session) {
        return {
          error: null,
          message: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتفعيل الدخول.',
        };
      }
      return { error: null, message: 'تم إنشاء حسابك وتسجيل الدخول بنجاح.' };
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    if (!supabase) {
      return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/workspace`,
      },
    });
    if (error) {
      return { error: translateAuthError(error.message) };
    }
    return { error: null };
  }, []);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      return {
        error: null,
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
      };
    },
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<AuthActionResult> => {
      if (!supabase) {
        return { error: 'مفاتيح Supabase غير مضبوطة في البيئة المحلية.' };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      setIsPasswordRecovery(false);
      return { error: null, message: 'تم تحديث كلمة المرور بنجاح.' };
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
        isPasswordRecovery,
        clearPasswordRecovery,
        continueAsGuest,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        updatePassword,
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
