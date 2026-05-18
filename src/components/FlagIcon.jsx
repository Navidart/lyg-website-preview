import React from 'react';
import { getFlagIcon } from '../utils/phoneFlags.js';

export default function FlagIcon({
  alt = '',
  className = '',
  countryCode,
  decorative = true,
  src,
}) {
  const flagSrc = src ?? getFlagIcon(countryCode);
  if (!flagSrc) return null;

  const classes = ['flag-icon', className].filter(Boolean).join(' ');

  return (
    <img
      aria-hidden={decorative ? 'true' : undefined}
      alt={decorative ? '' : alt}
      className={classes}
      src={flagSrc}
    />
  );
}
