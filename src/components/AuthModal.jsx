import React, { useEffect, useId, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { getAuthCallbackUrl, getOAuthRedirectPath, getOAuthRedirectUrl } from '../auth/oauthRedirect.js';
import { supabase } from '../lib/supabaseClient.js';
import { navigateTo } from '../routes/router.js';
import Avatar from './Avatar.jsx';
import Icon from './Icons.jsx';
import Logo from './Logo.jsx';

function getAuthErrorMessage(error) {
  if (!error) return '';
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

function isInvalidCredentialsError(error) {
  const message = error?.message?.toLowerCase() ?? '';
  return error?.code === 'invalid_credentials' || message.includes('invalid login credentials') || message.includes('invalid credentials');
}

function isExistingAccountError(error) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('already registered') || message.includes('already exists') || message.includes('user already');
}

function logAuthDevelopmentError(label, details) {
  if (!import.meta.env.DEV || !details) return;
  console.error(`[auth] ${label}:`, details);
}

function didSignUpSendConfirmation(data) {
  if (!data?.user) return false;
  if (data.session) return true;

  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return false;
  }

  return true;
}

function getDisplayName(profile, user) {
  const metadata = user?.user_metadata ?? {};
  const firstName = profile?.first_name?.trim?.();
  const lastName = profile?.last_name?.trim?.();
  const profileName = profile?.full_name?.trim?.();
  const metadataName = metadata.full_name?.trim?.() || metadata.name?.trim?.();
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profileName || metadataName;

  return displayName && !displayName.includes('@') ? displayName : null;
}

export default function AuthModal() {
  const { closeAuthModal, isAuthModalOpen, isSupabaseConfigured, profile, signOut, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [canCreateAccount, setCanCreateAccount] = useState(false);
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isAuthModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAuthModal, isAuthModalOpen]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setError('');
      setMessage('');
      setCanCreateAccount(false);
      setCanResendConfirmation(false);
      setPassword('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setCanCreateAccount(false);
    setCanResendConfirmation(false);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    // TODO: Add email auto-create only if the backend explicitly supports a unified email/password access flow.
    const response = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (response.error) {
      logAuthDevelopmentError('Email sign-in failed', response.error);

      if (isInvalidCredentialsError(response.error)) {
        setError("We couldn't sign you in. Check your password, or create a new account with this email.");
        setCanCreateAccount(true);
        return;
      }

      setError(getAuthErrorMessage(response.error));
      return;
    }

    setPassword('');
    closeAuthModal();
    navigateTo(getOAuthRedirectPath());
  };

  const handleCreateAccount = async () => {
    setError('');
    setMessage('');
    setCanResendConfirmation(false);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      logAuthDevelopmentError('Email sign-up failed', signUpError);

      if (isExistingAccountError(signUpError)) {
        setError('An account may already exist with this email. Try Forgot password.');
        setCanCreateAccount(false);
        setCanResendConfirmation(true);
        return;
      }

      setError(getAuthErrorMessage(signUpError));
      return;
    }

    setCanCreateAccount(false);

    if (data?.session) {
      setPassword('');
      closeAuthModal();
      navigateTo(getOAuthRedirectPath());
      return;
    }

    if (!didSignUpSendConfirmation(data)) {
      logAuthDevelopmentError('Email sign-up returned no session and no new identity', data);
      setError('We could not send a confirmation email right now. Please try again in a few minutes or contact support.');
      setCanResendConfirmation(true);
      return;
    }

    setPassword('');
    setMessage('Check your email to confirm your account.');
  };

  const handleResendConfirmation = async () => {
    setError('');
    setMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (!email) {
      setError('Enter your email address.');
      return;
    }

    setIsSubmitting(true);

    const { data: resendData, error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setIsSubmitting(false);

    if (resendError) {
      logAuthDevelopmentError('Confirmation resend failed', resendError);
      setError(getAuthErrorMessage(resendError));
      return;
    }

    setCanCreateAccount(false);
    setCanResendConfirmation(false);
    setMessage('Check your email to confirm your account.');
  };

  const handleSignOut = async () => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await signOut();
      closeAuthModal();
    } catch (signOutError) {
      setError(getAuthErrorMessage(signOutError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setCanCreateAccount(false);
    setCanResendConfirmation(false);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setIsSubmitting(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectUrl(),
      },
    });

    if (oauthError) {
      logAuthDevelopmentError('Google sign-in failed', oauthError);
      setError(getAuthErrorMessage(oauthError));
      setIsSubmitting(false);
    }
  };

  const displayName = user ? getDisplayName(profile, user) : null;
  const dialogLabel = user ? 'Close logout dialog' : 'Close sign in dialog';

  return (
    <div className="auth-modal-layer" role="presentation">
      <button className="auth-modal-backdrop" type="button" aria-label={dialogLabel} onClick={closeAuthModal} />
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className="auth-modal-close" type="button" aria-label={dialogLabel} onClick={closeAuthModal}>
          <Icon name="ico-cross-large" size={24} />
        </button>

        <div className="auth-modal-header">
          {!user && <Logo className="auth-modal-logo" />}
          <h2 id={titleId}>{user ? 'Log out?' : 'Welcome to LYG'}</h2>
          <p>
            {user
              ? "You're about to log out of this account."
              : 'Access your account or create one.'}
          </p>
        </div>

        {user ? (
          <>
            <div className="auth-user-state auth-logout-state">
              <div className="auth-logout-user">
                <Avatar
                  ariaLabel="Signed-in account"
                  className="auth-logout-avatar"
                  fallbackName={displayName || user.email || 'User'}
                  profile={profile}
                  user={user}
                />
                <div>
                  {displayName && <strong>{displayName}</strong>}
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="auth-logout-actions">
                <button className="button button-ghost auth-submit" type="button" onClick={closeAuthModal} disabled={isSubmitting}>
                  Cancel
                </button>
                <button className="button button-outline auth-submit auth-logout-button" type="button" onClick={handleSignOut} disabled={isSubmitting}>
                  {isSubmitting ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </div>
            {error && <p className="auth-alert auth-alert-error">{error}</p>}
            {message && <p className="auth-alert auth-alert-success">{message}</p>}
          </>
        ) : (
          <>
            <div className="auth-oauth auth-oauth-primary">
              <button className="button button-ghost auth-google-button" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                <Icon name="ico-google" size={24} />
                Continue with Google
              </button>
            </div>

            <p className="auth-email-divider">or sign in with email</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <input
                  autoComplete="email"
                  inputMode="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setCanCreateAccount(false);
                    setCanResendConfirmation(false);
                  }}
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                />
              </label>

              <div className="auth-password-field">
                <label>
                  <span>Password</span>
                  <input
                    autoComplete="current-password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setCanCreateAccount(false);
                      setCanResendConfirmation(false);
                    }}
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                  />
                </label>

                <a className="auth-helper-link" href="#" onClick={(event) => event.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : 'Continue'}
              </button>
            </form>

            {error && <p className="auth-alert auth-alert-error">{error}</p>}
            {message && <p className="auth-alert auth-alert-success">{message}</p>}

            {canCreateAccount && (
              <button className="button auth-submit auth-create-account" type="button" onClick={handleCreateAccount} disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create a new account'}
              </button>
            )}

            {canResendConfirmation && (
              <button className="button button-outline auth-submit auth-resend-confirmation" type="button" onClick={handleResendConfirmation} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}

            <a className="auth-help-link" href="#" onClick={(event) => event.preventDefault()}>
              Need help?
            </a>
          </>
        )}
      </section>
    </div>
  );
}
