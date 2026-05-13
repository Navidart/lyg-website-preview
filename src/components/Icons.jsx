import React from "react";

const iconPaths = {
  chevron: <path d="m6 9 6 6 6-6" />,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  yacht: (
    <>
      <path d="M3 15h13.5l3.5-4H11l-2-3H6.5L8 11H5.5L3 15Z" />
      <path d="M6 18h11" />
      <path d="M8 8V5h5l2 3" />
    </>
  ),
  sell: (
    <>
      <path d="M3 15h13.5l3.5-4H11l-2-3H6.5L8 11H5.5L3 15Z" />
      <path d="M6 18h11" />
      <circle cx="17" cy="7" r="3" />
      <path d="M17 5.5v3M15.8 7h2.4" />
    </>
  ),
  charter: (
    <>
      <path d="M4 16h13l3-4H9l-2-3H5l1.5 3H4l-1 4Z" />
      <path d="M7 19h10" />
      <circle cx="16.5" cy="7.5" r="2.5" />
      <path d="m18.3 5.7 1.4-1.4" />
    </>
  ),
  crew: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3.5 19c.9-3 2.7-4.5 5.4-4.5 2.2 0 3.7 1 4.6 2.9" />
      <path d="M12.5 16.3c.8-1.2 2-1.8 3.6-1.8 2.1 0 3.6 1.2 4.4 3.5" />
    </>
  ),
  work: (
    <>
      <rect x="4" y="7" width="16" height="11" rx="1.5" />
      <path d="M9 7V5h6v2M4 12h16M10 12v1.5h4V12" />
    </>
  ),
  calculator: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8M12 4c-2 2.2-3 4.8-3 8s1 5.8 3 8" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="M9.5 13 8 21l4-2 4 2-1.5-8" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.5 2.6 7.7 7 10 4.4-2.3 7-5.5 7-10V6l-7-3Z" />,
  support: (
    <>
      <path d="M12 3v4M12 17v4M4.2 7.5l3.5 2M16.3 14l3.5 2M4.2 16.5l3.5-2M16.3 10l3.5-2" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4M10 12h5M10 16h5" />
    </>
  ),
};

export default function Icon({ name, size = 24, className = "", strokeWidth = 1.45 }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name]}
    </svg>
  );
}
