import React from "react";
import CarouselArrow from './CarouselArrow.jsx';

export default function CarouselControls({ ariaLabel, canScrollNext, canScrollPrev, ctaHref = '#', ctaLabel, onNext, onPrev }) {
  return (
    <div className="carousel-controls" aria-label={`${ariaLabel} carousel controls`}>
      <CarouselArrow direction="previous" disabled={!canScrollPrev} onClick={onPrev} />
      <a className="text-link carousel-link" href={ctaHref}>{ctaLabel}</a>
      <CarouselArrow direction="next" disabled={!canScrollNext} onClick={onNext} />
    </div>
  );
}
