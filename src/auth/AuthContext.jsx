import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);
let oauthExchangePromise = null;

function getOAuthCode() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('code');
}

function clearOAuthCallbackParams() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has('code')) return;

  url.searchParams.delete('code');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    const restoreSession = async () => {
      try {
        const oauthCode = getOAuthCode();

        if (oauthCode) {
          oauthExchangePromise =
            oauthExchangePromise ??
            supabase.auth.exchangeCodeForSession(oauthCode).finally(() => {
              oauthExchangePromise = null;
            });

          const { data, error } = await oauthExchangePromise;
          if (error) {
            console.error('Supabase OAuth session exchange failed:', error.message);
          } else if (isMounted) {
            setSession(data.session ?? null);
          }
          clearOAuthCallbackParams();
        }

        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session ?? null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setSession(nextSession);
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      closeAuthModal,
      isAuthLoading,
      isAuthModalOpen,
      isSupabaseConfigured,
      openAuthModal,
      session,
      signOut,
      user: session?.user ?? null,
    }),
    [closeAuthModal, isAuthLoading, isAuthModalOpen, openAuthModal, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

