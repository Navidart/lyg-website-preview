import React from "react";
import Icon from './Icons.jsx';

export default function CarouselArrow({ direction, disabled, onClick }) {
  const isPrevious = direction === 'previous';

  return (
    <button
      aria-label={isPrevious ? 'Previous yachts' : 'Next yachts'}
      className={`carousel-arrow ${isPrevious ? 'carousel-arrow-prev' : 'carousel-arrow-next'}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon name="arrowRight" size={16} />
    </button>
  );
}
