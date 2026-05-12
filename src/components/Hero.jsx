import React from "react";
import { motion } from 'framer-motion';
import { assets } from '../data.js';
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
  buy: [
    ['icon-fill buy-fill', 'https://www.figma.com/api/mcp/asset/0792fe66-8971-4c57-bc5c-dfe8ef2a6411'],
    ['icon-fill buy-badge', 'https://www.figma.com/api/mcp/asset/8e93bab1-6019-4e05-8d77-c0c2a90514a4'],
  ],
  sell: [
    ['icon-fill buy-fill', 'https://www.figma.com/api/mcp/asset/dbefbda8-4e10-4725-bf1a-8fd8788312c6'],
    ['icon-fill sell-badge', 'https://www.figma.com/api/mcp/asset/ad8781ec-dcfa-4482-a961-cf430dd49d72'],
  ],
  charter: [
    ['icon-fill charter-fill', 'https://www.figma.com/api/mcp/asset/09cae91e-5ed9-4a20-8536-6654a22862c2'],
    ['icon-fill charter-badge', 'https://www.figma.com/api/mcp/asset/8e11710e-c769-4e28-840d-baeae8d7ac6e'],
  ],
  crew: [
    ['icon-fill full', 'https://www.figma.com/api/mcp/asset/1eea2669-cc96-4e87-809a-9e09f061c503'],
    ['icon-fill crew-badge', 'https://www.figma.com/api/mcp/asset/fb55a7f4-35e4-4ca6-a8d3-734da9352b03'],
    ['icon-fill crew-person', 'https://www.figma.com/api/mcp/asset/0e126baf-148a-4b84-9c58-7e4a174837aa'],
  ],
  work: [
    ['icon-fill work-fill', 'https://www.figma.com/api/mcp/asset/b6ffed16-9680-4894-b3e1-8c31e80a42d8'],
    ['icon-fill work-dot work-dot-one', 'https://www.figma.com/api/mcp/asset/3fc615e3-37e3-4608-a91c-4b3dcbf5253c'],
    ['icon-fill work-dot work-dot-two', 'https://www.figma.com/api/mcp/asset/3fc615e3-37e3-4608-a91c-4b3dcbf5253c'],
    ['icon-fill work-dot work-dot-three', 'https://www.figma.com/api/mcp/asset/d83ed5c4-350c-432d-8039-415fabb6867a'],
    ['icon-fill work-group', 'https://www.figma.com/api/mcp/asset/fe296935-463a-4045-8b65-473a6db7f211'],
  ],
  calculator: [
    ['icon-fill calculator-fill', 'https://www.figma.com/api/mcp/asset/f37844ca-6922-49a0-a620-52935d95a95c'],
  ],
};

function FigmaQuickIcon({ name }) {
  return (
    <span className="quick-icon figma-quick-icon" aria-hidden="true">
      {quickIconAssets[name].map(([className, src], index) => (
        <span
          className={className}
          key={`${name}-${index}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
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
          <a className="button button-primary" href="#">Start an Inquiry <span>→</span></a>
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
            <FigmaQuickIcon name={icon} />
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
