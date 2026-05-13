import React from "react";
import { saleYachts } from '../data.js';
import CarouselSection from './CarouselSection.jsx';
import MotionSection from './MotionSection.jsx';
import SectionHeader from './SectionHeader.jsx';
import YachtCard from './YachtCard.jsx';

export default function YachtsSection() {
  return (
    <MotionSection className="section yachts-section">
      <SectionHeader
        eyebrow="Yachts for Sale"
        title="Exceptional Yachts. Expert Guidance."
        subtitle="Discover a curated selection of the world's finest yachts for sale and expert support at every step."
      />
      <CarouselSection
        ariaLabel="Yachts for Sale"
        className="yachts-carousel"
        ctaLabel="View All Yachts For Sale"
        items={saleYachts}
        renderItem={(yacht) => <YachtCard yacht={yacht} />}
        variant="cards-5"
      />
    </MotionSection>
  );
}
