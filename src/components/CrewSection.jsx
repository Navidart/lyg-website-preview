import React from "react";
import { motion } from 'framer-motion';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase, stagger } from '../motion.js';

const crewCards = [
  ['For Employers', 'Hire Top Yacht Crew', 'Access our global network of qualified professionals for every yacht position.', 'Find Crew', '/assets/images/image-find-crew.jpg', 'crew-card-employers'],
  ['For Crew Members', 'Find Your Next Job', 'Discover exciting opportunities and take the next step in your yachting career.', 'Find Work', '/assets/images/image-find-work.jpg', 'crew-card-members'],
];

export default function CrewSection() {
  return (
    <motion.section
      className="crew-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger}
    >
      {crewCards.map(([eyebrow, title, copy, cta, image, cropClass]) => (
        <motion.article
          className={`crew-card ${cropClass}`}
          key={title}
          variants={cardReveal}
          whileHover={{ y: -4, transition: { duration: 0.45, ease: luxuryEase } }}
        >
          <img className="crew-card-image" src={image} alt="" />
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{copy}</p>
            <a className="button button-outline" href="#">{cta} <Icon name="arrowRight" size={18} /></a>
          </div>
        </motion.article>
      ))}
    </motion.section>
  );
}
