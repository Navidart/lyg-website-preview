import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { getOAuthRedirectPath } from '../auth/oauthRedirect.js';
import { supabase } from '../lib/supabaseClient.js';
import { RouteLoadingState } from '../routes/ProtectedRoute.jsx';

const expiredConfirmationMessage =
  'This confirmation link has expired or was already used. Please sign in or request a new confirmation email.';
let callbackExchangePromise = null;

function getAuthParams() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  hashParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });

  return params;
}

function getCallbackError(params) {
  const errorCode = params.get('error_code') ?? params.get('error');
  if (!errorCode) return null;

  if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
    return expiredConfirmationMessage;
  }

  return params.get('error_description') ?? expiredConfirmationMessage;
}

function replaceTo(path) {
  window.history.replaceState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function AuthCallbackPage() {
  const { authCallbackError, closeAuthModal, isAuthLoading, openAuthModal, user } = useAuth();
  const [callbackError, setCallbackError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setCallbackError('Authentication is not configured.');
      setIsProcessing(false);
      return;
    }

    if (hasProcessedRef.current) return;

    hasProcessedRef.current = true;

    const processCallback = async () => {
      const params = getAuthParams();
      const urlError = getCallbackError(params);
      const code = params.get('code');
      const redirectPath = getOAuthRedirectPath();

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session && !urlError) {
        closeAuthModal();
        replaceTo(redirectPath);
        return;
      }

      if (urlError) {
        setCallbackError(urlError);
        setIsProcessing(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (!code) {
        setCallbackError(expiredConfirmationMessage);
        setIsProcessing(false);
        return;
      }

      callbackExchangePromise =
        callbackExchangePromise ??
        supabase.auth.exchangeCodeForSession(code).finally(() => {
          callbackExchangePromise = null;
        });

      const { error } = await callbackExchangePromise;
      if (!error) {
        closeAuthModal();
        replaceTo(redirectPath);
        return;
      }

      const { data: retrySessionData } = await supabase.auth.getSession();
      if (retrySessionData.session) {
        closeAuthModal();
        replaceTo(redirectPath);
        return;
      }

      setCallbackError(expiredConfirmationMessage);
      setIsProcessing(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    processCallback();
  }, [closeAuthModal]);

  useEffect(() => {
    if (isProcessing || isAuthLoading || authCallbackError || callbackError) return;

    if (user) {
      replaceTo(getOAuthRedirectPath());
    }
  }, [authCallbackError, callbackError, isAuthLoading, isProcessing, user]);

  if (isProcessing || isAuthLoading) {
    return <RouteLoadingState label="Confirming your account..." />;
  }

  if (authCallbackError || callbackError) {
    return (
      <main className="route-loading auth-callback-state">
        <p className="auth-alert auth-alert-error">{authCallbackError || callbackError}</p>
        <button className="button button-primary" type="button" onClick={openAuthModal}>
          Sign in
        </button>
      </main>
    );
  }

  return <RouteLoadingState label="Taking you to your account..." />;
}
