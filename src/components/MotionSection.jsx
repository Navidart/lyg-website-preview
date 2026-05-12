import React from "react";
import { motion } from 'framer-motion';
import { reveal } from '../motion.js';

export default function MotionSection({ className, children }) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      variants={reveal}
    >
      {children}
    </motion.section>
  );
}
