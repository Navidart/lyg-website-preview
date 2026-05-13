import React from "react";
import { motion } from 'framer-motion';
import { assets } from '../data.js';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase, stagger } from '../motion.js';
import MotionSection from './MotionSection.jsx';

const stats = [['42%', 'Crew Payroll'], ['26%', 'Maintenance'], ['18%', 'Fuel'], ['14%', 'Admin']];
const trust = [
  ['Global Presence', 'Offices in key yachting hubs around the world.', 'globe'],
  ['Industry Expertise', 'Decades of experience across all areas of yachting.', 'medal'],
  ['Discreet & Professional', 'Trusted by owners, captains, and industry leaders.', 'shield'],
  ['End-to-End Solutions', 'Everything you need, all under one trusted partner.', 'support'],
];

export default function CalculatorTrustSection() {
  return (
    <MotionSection className="section calculator-trust">
      <motion.article
        className="calculator-card"
        style={{ '--calculator-bg': `url(${assets.blueprint})` }}
        variants={cardReveal}
      >
        <p className="eyebrow">Cost Calculator</p>
        <h2>Estimate Yacht Ownership Costs</h2>
        <p>Understand annual operating costs, crew expenses, and more with our advanced yacht cost calculator.</p>
        <div className="stat-grid">
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <a className="button button-primary" href="#">Open Calculator <span>→</span></a>
      </motion.article>
      <motion.article
        className="trust-card"
        variants={cardReveal}
      >
        <p className="eyebrow">Why Luxury Yacht Group</p>
        <h2>Trusted Worldwide For Over 20 Years</h2>
        <motion.div className="trust-grid" variants={stagger}>
          {trust.map(([title, copy, icon]) => (
            <motion.div key={title} variants={cardReveal}>
              <Icon name={icon} size={24} className="trust-icon" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.article>
    </MotionSection>
  );
}
