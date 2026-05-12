import React from "react";
import { motion } from 'framer-motion';
import { services } from '../data.js';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase, stagger } from '../motion.js';
import MotionSection from './MotionSection.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function SupportSection() {
  return (
    <MotionSection className="section support-section">
      <SectionHeader
        eyebrow="Yacht Support Services"
        title="Operational Support for Owners, Captains, and Crew"
        subtitle="Focused services for financial, payroll, logistical, and administrative needs."
      />
      <motion.div className="service-grid" variants={stagger}>
        {services.map((service) => (
          <motion.a
            href="#"
            className="service-card"
            key={service}
            variants={cardReveal}
            whileHover={{ y: -5, transition: { duration: 0.42, ease: luxuryEase } }}
          >
            <Icon name={service === 'Document Library' ? 'document' : 'support'} size={24} />
            {service}
          </motion.a>
        ))}
      </motion.div>
    </MotionSection>
  );
}
