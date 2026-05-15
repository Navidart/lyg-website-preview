const env = import.meta.env ?? {};
const configuredOAuthRedirectUrl = env.VITE_AUTH_REDIRECT_URL ?? env.VITE_SITE_URL ?? env.VITE_APP_URL;

function getOriginFromUrl(url) {
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function getOAuthRedirectUrl() {
  const configuredOrigin = getOriginFromUrl(configuredOAuthRedirectUrl);
  if (configuredOrigin) return configuredOrigin;

  if (typeof window === 'undefined') return undefined;

  return window.location.origin;
}

export function getOAuthRedirectPath() {
  const redirectUrl = getOAuthRedirectUrl();
  if (!redirectUrl || typeof window === 'undefined') return '/';

  try {
    const url = new URL(redirectUrl, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return '/';
  }
}

export function getAuthCallbackUrl() {
  const redirectUrl = getOAuthRedirectUrl();
  if (!redirectUrl) return undefined;

  return `${redirectUrl.replace(/\/+$/, '')}/auth/callback`;
}
