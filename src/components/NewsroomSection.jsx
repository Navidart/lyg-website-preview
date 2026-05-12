import React from "react";
import { motion } from 'framer-motion';
import { articles } from '../data.js';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase, stagger } from '../motion.js';
import MotionSection from './MotionSection.jsx';

export default function NewsroomSection() {
  return (
    <MotionSection className="section newsroom-section">
      <div className="news-heading">
        <div>
          <p className="eyebrow">Newsroom</p>
          <h2>Latest Insights from LYG</h2>
        </div>
        <a className="text-link icon-link" href="#">View All News <Icon name="arrowRight" size={14} /></a>
      </div>
      <motion.div className="news-grid" variants={stagger}>
        {articles.map(([category, title, date, image]) => (
          <motion.article
            className="article-card"
            key={title}
            variants={cardReveal}
            whileHover={{ y: -5, transition: { duration: 0.42, ease: luxuryEase } }}
          >
            <div className="article-image">
              <img src={image} alt="" />
              <span>{category}</span>
            </div>
            <div>
              <h3>{title}</h3>
              <time>{date}</time>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </MotionSection>
  );
}
