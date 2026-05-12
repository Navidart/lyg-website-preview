import React from "react";

export default function SectionHeader({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`section-header ${align === 'left' ? 'align-left' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
