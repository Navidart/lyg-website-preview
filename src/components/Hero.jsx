import React from "react";
import { motion } from 'framer-motion';
import { assets } from '../data.js';
import Icon from './Icons.jsx';
import { luxuryEase, stagger } from '../motion.js';

const links = [
  ['Buy a Yacht', 'buy'],
  ['Sell a Yacht', 'sell'],
  ['Charter a Yacht', 'charter'],
  ['Find Crew', 'crew'],
  ['Find Work', 'work'],
  ['Estimate Costs', 'calculator'],
];

const quickIconAssets = {
  buy: "ico-yacht-buy",
  sell: "ico-yacht-sell",
  charter: "ico-charter",
  crew: "ico-find-crew",
  work: "ico-find-wrok",
  calculator: "ico-estimate",
};

function ModuleQuickIcon({ name }) {
  return (
    <span className="quick-icon module-quick-icon" aria-hidden="true">
      <Icon name={quickIconAssets[name]} size={32} />
    </span>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <motion.img
        animate={{ scale: 1, x: 0 }}
        className="hero-media"
        initial={{ scale: 1.04, x: -10 }}
        src={assets.hero}
        alt=""
        transition={{ duration: 4.8, ease: luxuryEase }}
      />
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-shade" />
      <motion.div
        animate="visible"
        className="hero-content"
        initial="hidden"
        variants={stagger}
      >
        <motion.h1 variants={heroReveal}>Your Partner in<br />Yachting <em>Excellence</em></motion.h1>
        <motion.p variants={heroReveal}>Global expertise in sales, charter, crew, payroll, and yacht support-delivered with discretion, integrity, and passion.</motion.p>
        <motion.div className="hero-actions" variants={heroReveal}>
          <a className="button button-primary" href="#">Start an Inquiry <Icon className="icon-on-brand-primary" name="arrowRight" size={16} /></a>
          <a className="button button-outline" href="#">Explore Yachts</a>
        </motion.div>
      </motion.div>
      <motion.div
        animate="visible"
        aria-label="Quick links"
        className="quick-links"
        initial="hidden"
        variants={stagger}
      >
        {links.map(([link, icon]) => (
          <motion.a href="#" key={link} variants={quickReveal}>
            <ModuleQuickIcon name={icon} />
            <span>{link}</span>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}

const heroReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: luxuryEase },
  },
};

const quickReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: luxuryEase },
  },
};
