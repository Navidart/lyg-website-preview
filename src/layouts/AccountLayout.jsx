import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function AccountLayout({ children }) {
  return (
    <>
      <Header />
      <main className="account-shell">
        <section className="account-shell-panel">{children}</section>
      </main>
      <Footer />
    </>
  );
}
