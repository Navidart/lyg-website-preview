import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function AdminActionButton({ children, label, ...buttonProps }) {
  const buttonRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const showTooltip = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setTooltipPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - 8,
    });
  };

  const hideTooltip = () => setTooltipPosition(null);

  return (
    <>
      <span
        className="admin-action-button-wrap"
        onBlur={hideTooltip}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        <button {...buttonProps} aria-label={label} ref={buttonRef}>
          {children}
        </button>
      </span>
      {tooltipPosition &&
        createPortal(
          <span
            className="admin-action-tooltip"
            role="tooltip"
            style={{
              left: `${tooltipPosition.left}px`,
              top: `${tooltipPosition.top}px`,
            }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
