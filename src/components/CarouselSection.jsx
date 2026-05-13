import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { cardReveal, stagger } from '../motion.js';
import CarouselControls from './CarouselControls.jsx';

export default function CarouselSection({ ariaLabel, className = '', ctaHref = '#', ctaLabel, items, renderItem, variant = 'cards-5' }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    duration: 34,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateControls = useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return undefined;

    updateControls(emblaApi);
    emblaApi
      .on('select', updateControls)
      .on('reInit', updateControls);

    return () => {
      emblaApi
        .off('select', updateControls)
        .off('reInit', updateControls);
    };
  }, [emblaApi, updateControls]);

  return (
    <div className={`carousel-section carousel-section-${variant} ${className}`} aria-label={ariaLabel}>
      <div className="carousel-container">
        <div className="carousel-viewport" ref={emblaRef}>
          <motion.div className="carousel-track" variants={stagger}>
            {items.map((item, index) => (
              <motion.div className="carousel-slide" key={item.id ?? item.name ?? index} variants={cardReveal}>
                {renderItem(item)}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <CarouselControls
          ariaLabel={ariaLabel}
          canScrollNext={canScrollNext}
          canScrollPrev={canScrollPrev}
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          onNext={scrollNext}
          onPrev={scrollPrev}
        />
      </div>
    </div>
  );
}
