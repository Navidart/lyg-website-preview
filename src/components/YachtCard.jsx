import React from "react";
import { motion } from 'framer-motion';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase } from '../motion.js';

export default function YachtCard({ yacht, dark = false }) {
  const [name, specs, price, image] = yacht;
  const cardClass = name === 'M/Y LADY L' ? 'lady-l-card' : '';
  return (
    <motion.article
      className={`yacht-card ${dark ? 'dark-card' : ''} ${cardClass}`}
      variants={cardReveal}
      whileHover={{ y: -6, transition: { duration: 0.42, ease: luxuryEase } }}
    >
      <img src={image} alt={`${name} yacht`} />
      <div className="yacht-card-body">
        <h3>{name}</h3>
        <p>{specs}</p>
        <p>{price}</p>
        <a href="#">View Details <Icon name="arrowRight" size={14} /></a>
      </div>
    </motion.article>
  );
}
