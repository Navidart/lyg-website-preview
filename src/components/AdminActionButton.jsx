import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function AdminActionButton({ children, label, ...buttonProps }) {
  const buttonRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const showTooltip = () => {
    if (buttonProps.disabled || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setTooltipPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - 8,
    });
  };

  const hideTooltip = () => setTooltipPosition(null);

  return (
    <>
      <button
        {...buttonProps}
        aria-label={label}
        onBlur={(event) => {
          hideTooltip();
          buttonProps.onBlur?.(event);
        }}
        onFocus={(event) => {
          showTooltip();
          buttonProps.onFocus?.(event);
        }}
        onMouseEnter={(event) => {
          showTooltip();
          buttonProps.onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          hideTooltip();
          buttonProps.onMouseLeave?.(event);
        }}
        ref={buttonRef}
      >
        {children}
      </button>
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
