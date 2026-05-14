import React, { useEffect, useId, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';

function getAuthErrorMessage(error) {
  if (!error) return '';
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function AuthModal() {
  const { closeAuthModal, isAuthModalOpen, isSupabaseConfigured, signOut, user } = useAuth();
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
      setPassword('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    const response =
      mode === 'sign-up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (response.error) {
      setError(getAuthErrorMessage(response.error));
      return;
    }

    if (mode === 'sign-up' && !response.data.session) {
      setMessage('Check your email to confirm your account before signing in.');
      setPassword('');
      return;
    }

    setMessage(mode === 'sign-up' ? 'Account created. You are now signed in.' : 'Welcome back.');
    setPassword('');
  };

  const handleSignOut = async () => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await signOut();
      setMessage('You have been signed out.');
    } catch (signOutError) {
      setError(getAuthErrorMessage(signOutError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setIsSubmitting(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });

    if (oauthError) {
      setError(getAuthErrorMessage(oauthError));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-layer" role="presentation">
      <button className="auth-modal-backdrop" type="button" aria-label="Close sign in dialog" onClick={closeAuthModal} />
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className="auth-modal-close" type="button" aria-label="Close sign in dialog" onClick={closeAuthModal}>
          ×
        </button>

        <div className="auth-modal-header">
          <p className="auth-modal-eyebrow">Luxury Yacht Group</p>
          <h2 id={titleId}>{user ? 'Account' : mode === 'sign-up' ? 'Create your account' : 'Sign in'}</h2>
          <p>
            {user
              ? 'You are signed in with Supabase email authentication.'
              : 'Access your LYG account with email and password.'}
          </p>
        </div>

        {user ? (
          <div className="auth-user-state">
            <span>Signed in as</span>
            <strong>{user.email}</strong>
            <button className="button button-outline auth-submit" type="button" onClick={handleSignOut} disabled={isSubmitting}>
              {isSubmitting ? 'Signing out...' : 'Log out'}
            </button>
          </div>
        ) : (
          <>
            <div className="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
              <button
                className={mode === 'sign-in' ? 'is-active' : ''}
                type="button"
                onClick={() => {
                  setMode('sign-in');
                  setError('');
                  setMessage('');
                }}
              >
                Sign in
              </button>
              <button
                className={mode === 'sign-up' ? 'is-active' : ''}
                type="button"
                onClick={() => {
                  setMode('sign-up');
                  setError('');
                  setMessage('');
                }}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <input
                  autoComplete="email"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                />
              </label>

              <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="auth-oauth">
              <span>or</span>
              <button className="button button-ghost auth-google-button" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                Continue with Google
              </button>
            </div>
          </>
        )}

        {error && <p className="auth-alert auth-alert-error">{error}</p>}
        {message && <p className="auth-alert auth-alert-success">{message}</p>}
      </section>
    </div>
  );
}
