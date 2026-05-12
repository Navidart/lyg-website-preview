import React from "react";
import { motion } from 'framer-motion';
import { saleYachts } from '../data.js';
import Icon from './Icons.jsx';
import { stagger } from '../motion.js';
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
      <motion.div className="card-row" variants={stagger}>
        {saleYachts.map((yacht) => <YachtCard yacht={yacht} key={yacht[0]} />)}
      </motion.div>
      <a className="text-link icon-link centered" href="#">View All Yachts For Sale <Icon name="arrowRight" size={14} /></a>
    </MotionSection>
  );
}
