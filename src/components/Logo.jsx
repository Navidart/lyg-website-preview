import React from 'react';

export const officialLogoSrc = '/assets/brand/lyg-logo.svg';

export default function Logo({ className = '', alt = 'Luxury Yacht Group' }) {
  return <img className={className} src={officialLogoSrc} alt={alt} />;
}
