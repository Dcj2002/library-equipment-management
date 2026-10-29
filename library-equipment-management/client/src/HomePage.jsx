import React from 'react';
import './home.css';
import libraryHero from './assets/library-hero.png';

const features = [
  ['01', 'Explore the inventory', 'Find equipment by name, asset tag or location. Filter by category and check its current availability.'],
  ['02', 'Keep track of your loans', 'View equipment issued to your account and its due dates in My Borrowings.'],
  ['03', 'Manage with confidence', 'Library administrators maintain asset records and handle equipment issue and return.']
];
export default function HomePage({ user }) {
  return <div className="home-page" id="home-top">
    <a href="#home-content" className="home-skip">Skip to content</a><div className="home-topbar"><div><span>YOUR LIBRARY RESOURCES IN ONE PLACE</span><a href={user ? '#workspace' : '#login'}>{user ? 'My workspace' : 'Member login'} →</a></div></div>
    <nav className="home-nav" aria-label="Main navigation">
      <a className="home-brand" href="#home"><span className="logo">L</span><span>LIBRARY<span>Equipment management</span></span></a>
      <div className="home-nav-links"><a href="#home" aria-current="page">Home</a><a href="#equipment-categories">Categories</a><a href="#features">Features</a><a href="#how-it-works">How it works</a></div>
      <div className="home-nav-actions">{user ? <a className="home-button" href="#workspace">Open workspace <span aria-hidden="true">↗</span></a> : <><a className="home-login" href="#login">Log in</a><a className="home-button" href="#register">Create account <span aria-hidden="true">↗</span></a></>}</div>
    </nav>
    <main className="home-main" id="home-content">
      <section className="home-hero home-photo-hero" aria-labelledby="home-heading" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,25,18,.13) 0%, rgba(10,25,18,.4) 42%, rgba(10,25,18,.88) 100%), url(${libraryHero})` }}><div className="home-hero-copy"><div className="home-kicker">WELCOME TO YOUR LIBRARY WORKSPACE</div><h1 id="home-heading">Library Equipment<br/>Management</h1><blockquote>“Where knowledge meets<br/>the tools to create.”</blockquote><p>Explore library equipment, check availability and keep track of your borrowing. The resources for your next idea start here.</p><div className="home-hero-actions"><a className="home-button" href={user ? '#workspace' : '#register'}>{user ? 'Open workspace' : 'Get started'} <span aria-hidden="true">→</span></a><a className="home-text-link" href="#how-it-works">Discover more <span aria-hidden="true">↓</span></a></div></div></section>
      <section className="home-categories" id="equipment-categories" aria-label="Equipment categories"><span>EQUIPPED FOR EVERYDAY LEARNING</span><div>{['Computers', 'Projectors', 'Printers', 'Scanners', 'Audio equipment'].map(item => <span key={item}>{item}</span>)}</div></section>
      <section className="home-features" id="features" aria-labelledby="features-heading"><div className="home-section-intro"><div className="home-kicker">LESS SEARCHING. MORE DOING.</div><h2 id="features-heading">Everything in its place.</h2><p>A clear view of library equipment, from the shelf to the next borrower.</p></div><div className="home-feature-grid">{features.map(([number, title, description]) => <article key={number}><span className="home-feature-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="home-how" id="how-it-works" aria-labelledby="how-heading"><div><div className="home-kicker">GETTING STARTED</div><h2 id="how-heading">From sign-up<br/>to your next project.</h2><p>Create your account, explore what's available, and speak to your library administrator when you're ready to borrow.</p><a className="home-text-link" href={user ? '#workspace' : '#register'}>{user ? 'Open the inventory' : 'Create your account'} <span aria-hidden="true">→</span></a></div><ol>{[['Make it yours', 'Register with your name, email and student or staff ID.'], ['Find the right resource', 'Log in to browse equipment and check availability.'], ['Borrow and keep track', 'Ask an administrator to issue the item, then view the due date in My Borrowings. Return equipment through the library administrator.']].map(([title, text], i) => <li key={title}><span aria-hidden="true">{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
      <section className="home-cta"><div><div className="home-kicker">YOUR LIBRARY WORKSPACE</div><h2>Ready to get started?</h2><p>Keep your equipment and current borrowing in one place.</p></div><a className="home-button" href={user ? '#workspace' : '#register'}>{user ? 'Open workspace' : 'Create a free account'} <span aria-hidden="true">→</span></a></section>
    </main><footer className="home-footer"><span>Library Equipment Management</span><span>Library resources, organized.</span><a href="#home-top">Back to top ↑</a></footer>
  </div>;
}
