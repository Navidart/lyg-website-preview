import React from "react";
import { motion } from 'framer-motion';
import Icon from './Icons.jsx';
import { luxuryEase } from '../motion.js';

export default function DestinationCard({ destination }) {
  const [name, image] = Array.isArray(destination)
    ? destination
    : [destination.name, destination.image];

  return (
    <motion.a
      className="destination-card"
      href="#"
      whileHover={{ y: -4, transition: { duration: 0.42, ease: luxuryEase } }}
    >
      <img src={image} alt={name} />
      <span>{name}</span>
      <small>View Guide <Icon className="icon-brand-primary" name="arrowRight" size={12} /></small>
    </motion.a>
  );
}
