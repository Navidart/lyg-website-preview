function firstStringValue(values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() ?? null;
}

function getIdentityData(user) {
  return Array.isArray(user?.identities)
    ? user.identities.map((identity) => identity?.identity_data ?? identity?.identityData ?? {}).filter(Boolean)
    : [];
}

export function getAvatarCandidates({ profile, user } = {}) {
  const metadata = user?.user_metadata ?? {};
  const identities = getIdentityData(user);
  const providerAvatarUrl = firstStringValue(identities.map((identityData) => identityData.avatar_url));
  const providerPicture = firstStringValue(identities.map((identityData) => identityData.picture));

  return [
    { source: 'user.user_metadata.avatar_url', url: metadata.avatar_url },
    { source: 'user.user_metadata.picture', url: metadata.picture },
    { source: 'user.identities.identity_data.avatar_url', url: providerAvatarUrl },
    { source: 'user.identities.identity_data.picture', url: providerPicture },
    { source: 'user.auth_avatar_url', url: user?.auth_avatar_url },
    { source: 'profile.avatar_url', url: profile?.avatar_url },
  ]
    .map((candidate) => ({
      ...candidate,
      url: typeof candidate.url === 'string' ? candidate.url.trim() : candidate.url,
    }))
    .filter((candidate) => Boolean(candidate.url));
}

export function resolveAvatarUrl({ failedUrls = new Set(), profile, user } = {}) {
  return getAvatarCandidates({ profile, user }).find((candidate) => !failedUrls.has(candidate.url))?.url ?? null;
}

export function getAvatarDisplayName({ fallbackName = 'User', profile, user } = {}) {
  const metadata = user?.user_metadata ?? {};
  const identities = getIdentityData(user);

  const displayName = firstStringValue([
    metadata.full_name,
    metadata.name,
    firstStringValue(identities.map((identityData) => identityData.full_name)),
    firstStringValue(identities.map((identityData) => identityData.name)),
    profile?.full_name,
    profile?.email,
    user?.email,
  ]);

  return (displayName || fallbackName) ?? 'User';
}
