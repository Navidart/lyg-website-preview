import React from "react";
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import YachtsSection from './components/YachtsSection.jsx';
import CharterSection from './components/CharterSection.jsx';
import CalculatorTrustSection from './components/CalculatorTrustSection.jsx';
import CrewSection from './components/CrewSection.jsx';
import SupportSection from './components/SupportSection.jsx';
import NewsroomSection from './components/NewsroomSection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <YachtsSection />
        <CharterSection />
        <CalculatorTrustSection />
        <CrewSection />
        <SupportSection />
        <NewsroomSection />
      </main>
      <Footer />
    </>
  );
}
