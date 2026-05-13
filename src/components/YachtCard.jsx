import React from "react";
import { motion } from 'framer-motion';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase } from '../motion.js';

export default function YachtCard({ yacht, dark = false, className = '' }) {
  const [name, specs, price, image, ctaLabel = 'View Details'] = Array.isArray(yacht)
    ? yacht
    : [
        yacht.name,
        `${yacht.size} • ${yacht.builder} • ${yacht.year}`,
        yacht.price,
        yacht.image,
        yacht.ctaLabel,
      ];
  const cardClass = name === 'M/Y LADY L' ? 'lady-l-card' : '';

  return (
    <motion.article
      className={`yacht-card ${dark ? 'dark-card' : ''} ${className} ${cardClass}`}
      variants={cardReveal}
      whileHover={{ y: -4, transition: { duration: 0.42, ease: luxuryEase } }}
    >
      <img src={image} alt={`${name} yacht`} />
      <div className="yacht-card-body">
        <h3>{name}</h3>
        <p>{specs}</p>
        <p className="yacht-card__price">{price}</p>
        <a href="#">{ctaLabel} <Icon name="arrowRight" size={14} /></a>
      </div>
    </motion.article>
  );
}
