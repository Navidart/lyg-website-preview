import React from "react";
import { charterYachts, destinations } from '../data.js';
import Icon from './Icons.jsx';
import CarouselSection from './CarouselSection.jsx';
import CharterYachtCard from './CharterYachtCard.jsx';
import DestinationCard from './DestinationCard.jsx';
import MotionSection from './MotionSection.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function CharterSection() {
  return (
    <MotionSection className="section charter-section">
      <SectionHeader
        eyebrow="Charter Yachts"
        title="Extraordinary Yachts. Unforgettable Destinations."
        subtitle="Handpicked charter yachts and breathtaking destinations, designed around you."
      />
      <div className="center-actions">
        <a className="button button-primary" href="#">Plan a Charter <Icon name="arrowRight" size={16} /></a>
        <a className="button button-outlined-luxury" href="#">Request Availability <Icon name="arrowRight" size={16} /></a>
      </div>
      <div className="carousel-container">
        <div className="section-row-title">
          <span>Featured Charter Yachts</span>
        </div>
      </div>
      <CarouselSection
        ariaLabel="Featured Charter Yachts"
        className="charter-carousel"
        ctaLabel="View All Charter Yachts"
        items={charterYachts}
        renderItem={(yacht) => <CharterYachtCard yacht={yacht} />}
        variant="cards-5"
      />
      <div className="carousel-container">
        <div className="section-row-title">
          <span>Featured Destinations</span>
        </div>
      </div>
      <CarouselSection
        ariaLabel="Featured Destinations"
        className="destinations-carousel"
        ctaLabel="View All Destinations"
        items={destinations}
        renderItem={(destination) => <DestinationCard destination={destination} />}
        variant="destinations"
      />
    </MotionSection>
  );
}
