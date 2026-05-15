import React, { useState } from 'react';
import { getAvatarDisplayName, resolveAvatarUrl } from '../auth/avatar.js';

export default function Avatar({ ariaLabel, className, fallbackName = 'User', profile, user }) {
  const [failedUrls, setFailedUrls] = useState(new Set());
  const imageUrl = resolveAvatarUrl({ failedUrls, profile, user });
  const displayName = getAvatarDisplayName({ fallbackName, profile, user });
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const handleImageError = () => {
    if (imageUrl) {
      setFailedUrls((prev) => new Set([...prev, imageUrl]));
    }
  };

  return (
    <span className={className} aria-label={ariaLabel}>
      {imageUrl ? (
        <img src={imageUrl} alt="" onError={handleImageError} />
      ) : (
        <span>{initial}</span>
      )}
    </span>
  );
}
