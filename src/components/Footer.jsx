import React from "react";
import { motion } from 'framer-motion';
import { assets, menus } from '../data.js';
import { reveal, stagger } from '../motion.js';

const footerColumns = {
  Sales: menus.Sales,
  Charter: ['Yacht Fleet', 'Charter Marketing', 'Destination Guides', 'Request Availability'],
  'Yacht Support': menus['Yacht Support'],
  Crew: menus.Crew,
  Tools: menus.Tools,
  Company: ['About Us', 'Newsroom', 'Contact', 'Our Offices', 'Sign In', 'Register'],
};

const socialIcons = [
  ['Instagram', 'https://www.figma.com/api/mcp/asset/16d69958-611a-4ad2-bbff-5e2f8cdcddb6', '15.75'],
  ['LinkedIn', 'https://www.figma.com/api/mcp/asset/d4fe4d4f-64ca-4435-9cf0-06478d12041d', '15.75'],
  ['YouTube', 'https://www.figma.com/api/mcp/asset/2d7e8f07-94bd-49a6-b7e5-a53525c34b7a', '20.25'],
];

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.14 }}
      variants={reveal}
    >
      <motion.div className="footer-grid" variants={stagger}>
        {Object.entries(footerColumns).map(([title, links]) => (
          <motion.div key={title} variants={reveal}>
            <h2>{title}</h2>
            {links.map((link) => <a href="#" key={link}>{link}</a>)}
          </motion.div>
        ))}
      </motion.div>
      <div className="footer-bottom">
        <img src={assets.logo} alt="Luxury Yacht Group" />
        <div className="socials">
          {socialIcons.map(([label, icon, width]) => (
            <a href="#" aria-label={label} key={label}>
              <img src={icon} alt="" style={{ width: `${width}px` }} />
            </a>
          ))}
        </div>
        <div className="legal">
          <a href="#">Terms of Use</a>
          <a href="#">Privacy Policy</a>
          <span>© 2026 Luxury Yacht Group. All Rights Reserved.</span>
        </div>
      </div>
    </motion.footer>
  );
}
