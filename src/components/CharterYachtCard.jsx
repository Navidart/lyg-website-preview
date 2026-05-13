import React from "react";
import YachtCard from './YachtCard.jsx';

export default function CharterYachtCard({ yacht }) {
  return <YachtCard yacht={yacht} dark className="charter-card" />;
}
