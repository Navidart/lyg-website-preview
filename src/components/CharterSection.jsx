import React from "react";
import { motion } from 'framer-motion';
import { charterYachts, destinations } from '../data.js';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase, stagger } from '../motion.js';
import MotionSection from './MotionSection.jsx';
import SectionHeader from './SectionHeader.jsx';
import YachtCard from './YachtCard.jsx';

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
        <a className="text-link icon-link" href="#">Request Availability <Icon name="arrowRight" size={14} /></a>
      </div>
      <div className="section-row-title">
        <span>Featured Charter Yachts</span>
        <a href="#">View All <Icon name="arrowRight" size={14} /></a>
      </div>
      <motion.div className="card-row" variants={stagger}>
        {charterYachts.map((yacht, index) => <YachtCard yacht={yacht} dark key={`${yacht[0]}-${index}`} />)}
      </motion.div>
      <div className="section-row-title">
        <span>Featured Destinations</span>
        <a href="#">View All <Icon name="arrowRight" size={14} /></a>
      </div>
      <motion.div className="destination-grid" variants={stagger}>
        {destinations.map(([name, image]) => (
          <motion.a
            className="destination-card"
            href="#"
            key={name}
            variants={cardReveal}
            whileHover={{ y: -5, transition: { duration: 0.42, ease: luxuryEase } }}
          >
            <img src={image} alt={name} />
            <span>{name}</span>
            <small>View Guide <Icon name="arrowRight" size={12} /></small>
          </motion.a>
        ))}
      </motion.div>
    </MotionSection>
  );
}
