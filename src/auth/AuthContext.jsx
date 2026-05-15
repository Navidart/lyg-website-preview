import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { navigateTo } from '../routes/router.js';
import { resolveAvatarUrl } from './avatar.js';
import { normalizeRole } from './roles.js';

const AuthContext = createContext(null);
let oauthExchangePromise = null;

const expiredConfirmationMessage =
  'This confirmation link has expired or was already used. Please sign in or request a new confirmation email.';

function getAuthParams() {
  if (typeof window === 'undefined') return new URLSearchParams();

  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  hashParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });

  return params;
}

function isAuthCallbackRoute() {
  return typeof window !== 'undefined' && window.location.pathname === '/auth/callback';
}

function getOAuthCode(params) {
  return params.get('code');
}

function getAuthCallbackError(params) {
  const errorCode = params.get('error_code') ?? params.get('error');
  if (!errorCode) return null;

  if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
    return expiredConfirmationMessage;
  }

  return params.get('error_description') ?? expiredConfirmationMessage;
}

function clearOAuthCallbackParams() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const params = getAuthParams();
  const hasAuthParams =
    params.has('code') ||
    params.has('access_token') ||
    params.has('refresh_token') ||
    params.has('error') ||
    params.has('error_code') ||
    params.has('error_description');

  if (!hasAuthParams) return;

  window.history.replaceState({}, document.title, url.pathname);
}

function getAuthAvatarUrl(user) {
  return resolveAvatarUrl({ user });
}

function cleanNameValue(value) {
  const normalized = value?.trim() ?? '';
  return normalized && !normalized.includes('@') ? normalized : null;
}

function splitDisplayName(value) {
  const normalized = cleanNameValue(value);
  if (!normalized) return { firstName: null, lastName: null };

  const [firstName, ...rest] = normalized.split(/\s+/);
  const lastName = rest.join(' ');

  return {
    firstName: cleanNameValue(firstName),
    lastName: cleanNameValue(lastName),
  };
}

function firstStringValue(values) {
  return values.find((value) => typeof value === 'string' && value.trim() && !value.includes('@'))?.trim() ?? null;
}

function getIdentityData(user) {
  return Array.isArray(user?.identities)
    ? user.identities.map((identity) => identity?.identity_data ?? identity?.identityData ?? {}).filter(Boolean)
    : [];
}

function getAuthDisplayName(user) {
  const metadata = user?.user_metadata ?? {};
  const identities = getIdentityData(user);

  return firstStringValue([
    metadata.full_name,
    metadata.name,
    firstStringValue(identities.map((identityData) => identityData.full_name)),
    firstStringValue(identities.map((identityData) => identityData.name)),
  ]);
}

async function syncProfileFromAuth(user, profile) {
  const authAvatarUrl = getAuthAvatarUrl(user);
  const hasAvatarColumn = profile && Object.prototype.hasOwnProperty.call(profile, 'avatar_url');
  const hasFirstNameColumn = profile && Object.prototype.hasOwnProperty.call(profile, 'first_name');
  const hasLastNameColumn = profile && Object.prototype.hasOwnProperty.call(profile, 'last_name');
  const updates = {};

  if (authAvatarUrl && hasAvatarColumn && !profile.avatar_url) {
    updates.avatar_url = authAvatarUrl;
  }

  if (
    hasFirstNameColumn &&
    hasLastNameColumn &&
    (!cleanNameValue(profile.first_name) || !cleanNameValue(profile.last_name))
  ) {
    const profileName = splitDisplayName(profile.full_name);
    const authName = splitDisplayName(getAuthDisplayName(user));
    const parsedName = {
      firstName: profileName.firstName || authName.firstName,
      lastName: profileName.lastName || authName.lastName,
    };

    if (!cleanNameValue(profile.first_name) && parsedName.firstName) {
      updates.first_name = parsedName.firstName;
    }

    if (!cleanNameValue(profile.last_name) && parsedName.lastName) {
      updates.last_name = parsedName.lastName;
    }
  }

  if (!profile || Object.keys(updates).length === 0) {
    return profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    return profile;
  }

  return data ?? { ...profile, ...updates };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authCallbackError, setAuthCallbackError] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const authProcessedRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    const restoreSession = async () => {
      try {
        const authParams = getAuthParams();
        const callbackError = getAuthCallbackError(authParams);
        const oauthCode = getOAuthCode(authParams);
        const hasTokenHash = authParams.has('access_token') || authParams.has('refresh_token');

        // Check for session first - if we already have one, the callback might have succeeded
        // in a previous run of this effect (common in React 18 StrictMode)
        const { data: initialSessionData } = await supabase.auth.getSession();
        const existingSession = initialSessionData.session;

        if (isMounted) {
          setSession(existingSession ?? null);
        }

        if (callbackError && !existingSession) {
          setAuthCallbackError(callbackError);
          clearOAuthCallbackParams();
        }

        if (oauthCode && !isAuthCallbackRoute() && !authProcessedRef.current) {
          authProcessedRef.current = true;
          
          oauthExchangePromise =
            oauthExchangePromise ??
            supabase.auth.exchangeCodeForSession(oauthCode).finally(() => {
              oauthExchangePromise = null;
            });

          const { data, error } = await oauthExchangePromise;
          
          if (error) {
            // If exchange fails but we now have a session, ignore the error (likely a race condition/double-processing)
            const { data: retrySessionData } = await supabase.auth.getSession();
            if (retrySessionData.session) {
              if (isMounted) {
                setAuthCallbackError(null);
                setSession(retrySessionData.session);
              }
            } else {
              console.error('Supabase OAuth session exchange failed:', error.message);
              if (isMounted) {
                setAuthCallbackError(expiredConfirmationMessage);
              }
            }
          } else if (isMounted) {
            setAuthCallbackError(null);
            setSession(data.session ?? null);
          }
          
          clearOAuthCallbackParams();
        } else if (hasTokenHash) {
          clearOAuthCallbackParams();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
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
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setProfileError(null);
        setProfileUserId(null);
        setIsProfileLoading(false);
      }

      if (nextSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        setIsProfileLoading(true);
      }

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setSession(nextSession);
      }
      if (event === 'SIGNED_IN') {
        setAuthCallbackError(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      setProfileError(null);
      setProfileUserId(null);
      setIsProfileLoading(false);
      return undefined;
    }

    let isMounted = true;
    const userId = session.user.id;

    const fetchProfile = async () => {
      if (!isMounted) return;
      setIsProfileLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('[auth] profile query error:', error);
          setProfile(null);
          setProfileError(error);
          setProfileUserId(userId);
        } else {
          const nextProfile = await syncProfileFromAuth(session.user, data);
          setProfile(nextProfile ?? null);
          setProfileError(null);
          setProfileUserId(userId);
        }
      } catch (err) {
        console.error('[auth] unexpected error during profile fetch:', err);
        if (isMounted) {
          setProfile(null);
          setProfileError(err);
          setProfileUserId(userId);
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const refreshProfile = useCallback(async () => {
    if (!supabase || !session?.user) return;
    
    const userId = session.user.id;
    setIsProfileLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('[auth] profile query error:', error);
      setProfileError(error);
      setProfileUserId(userId);
    } else {
      const nextProfile = await syncProfileFromAuth(session.user, data);
      setProfile(nextProfile ?? null);
      setProfileError(null);
      setProfileUserId(userId);
    }
    setIsProfileLoading(false);
  }, [session]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthModalOpen(false);
      setProfile(null);
      setProfileError(null);
      setProfileUserId(null);
      navigateTo('/');
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const user = session?.user ?? null;
  const normalizedRole = normalizeRole(profile?.role);
  const isProfileReady = !user || (profileUserId === user.id && !isProfileLoading);
  const effectiveProfileLoading = Boolean(user) && !isProfileReady;

  // Derive the effective role. 
  // If we have a user but the profile isn't loaded, return null (still loading).
  // If the profile is loaded but has no role, default to 'user'.
  const effectiveRole = useMemo(() => {
    if (!user) return null;
    if (!isProfileReady) return null;
    if (profileError) return null;
    return normalizedRole ?? 'user';
  }, [user, isProfileReady, profileError, normalizedRole]);

  const value = useMemo(
    () => ({
      closeAuthModal,
      isAuthLoading,
      isAuthModalOpen,
      authCallbackError,
      isProfileLoading: effectiveProfileLoading,
      isSupabaseConfigured,
      isSigningOut,
      openAuthModal,
      profile,
      profileError,
      refreshProfile,
      role: effectiveRole,
      session,
      signOut,
      user,
    }),
    [
      authCallbackError,
      closeAuthModal,
      effectiveProfileLoading,
      isAuthLoading,
      isAuthModalOpen,
      isProfileReady,
      isSupabaseConfigured,
      isSigningOut,
      effectiveRole,
      openAuthModal,
      profile,
      profileError,
      refreshProfile,
      session,
      signOut,
      user,
    ],
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
