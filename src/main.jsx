import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const games=[
  {name:"American Millions",jackpot:"$125M",price:"$2",draw:"Saturday",featured:true},
  {name:"Star 7",jackpot:"$25M",price:"$1",draw:"Wednesday"},
  {name:"Cash 5",jackpot:"$5M",price:"$1",draw:"Daily"}
];

const winners=[
  {name:"Michael R.",state:"Texas",amount:"$2,450,000"},
  {name:"Sarah W.",state:"California",amount:"$750,000"},
  {name:"James T.",state:"Florida",amount:"$125,000"},
  {name:"Angela M.",state:"New York",amount:"$50,000"}
];

function App(){
  return <div className="app">
    <header className="nav">
      <a className="brand" href="/">AMERICAN<span>LOTTERY</span></a>
      <nav>
        <a href="#games">Games</a><a href="#winners">Winners</a><a href="#results">Results</a><a href="#how">How It Works</a>
      </nav>
      <div className="nav-actions"><a className="signin" href="#signin">Sign In</a><a className="button button-small" href="#play">Play Now</a></div>
      <button className="menu" aria-label="Open menu">☰</button>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"></span> Next drawing · Saturday 10:00 PM ET</div>
          <h1>Your numbers.<br/><em>Your chance.</em></h1>
          <p>Play simple, exciting lottery games and check winning numbers in one trusted place.</p>
          <div className="hero-actions"><a className="button" href="#play">Play Now <span>→</span></a><a className="text-link" href="#results">View winning numbers</a></div>
        </div>
        <div className="jackpot-card">
          <span className="label">Estimated Jackpot</span>
          <strong>$125<span>M</span></strong>
          <div className="divider"></div>
          <div className="countdown"><div><b>02</b><small>Days</small></div><i>:</i><div><b>14</b><small>Hours</small></div><i>:</i><div><b>32</b><small>Min</small></div></div>
          <p>American Millions · Draw #004821</p>
        </div>
      </section>

      <section id="games" className="section">
        <div className="section-head"><div><span className="kicker">Featured games</span><h2>Pick your game.</h2></div><a href="#games">View all games →</a></div>
        <div className="game-grid">{games.map(g=><article className={"game-card "+(g.featured?"featured":"")} key={g.name}>
          <div className="game-top"><span className="game-mark">★</span><span className="draw-tag">{g.draw}</span></div>
          <h3>{g.name}</h3><div className="game-jackpot">{g.jackpot}</div><p>Estimated jackpot</p>
          <div className="game-footer"><span>{g.price} / play</span><a href="#play">Play →</a></div>
        </article>)}</div>
      </section>

      <section id="results" className="results section">
        <div className="result-copy"><span className="kicker">Latest result</span><h2>Did your numbers come up?</h2><p>Check the latest American Millions drawing and compare your ticket.</p><a className="button button-dark" href="#results">View all results</a></div>
        <div className="numbers-card"><div className="result-meta"><span>American Millions</span><span>Draw #004820</span></div><div className="balls">{[8,14,22,31,42,48].map(n=><b key={n}>{String(n).padStart(2,"0")}</b>)}</div><div className="bonus"><span>Bonus</span><b>17</b></div><small>September 30, 2026</small></div>
      </section>

      <section id="winners" className="section winners">
        <div className="section-head"><div><span className="kicker">Real winners</span><h2>Someone wins. It could be you.</h2></div><a href="#winners">View all winners →</a></div>
        <div className="winner-grid">{winners.map(w=><article className="winner-card" key={w.name}><div className="avatar">{w.name[0]}</div><div><h3>{w.name}</h3><p>{w.state}</p></div><strong>{w.amount}</strong></article>)}</div>
      </section>

      <section id="how" className="how section">
        <div><span className="kicker">How it works</span><h2>Four simple steps.</h2></div>
        <div className="steps">{["Choose your numbers","Buy your ticket","Watch the draw","Check your win"].map((s,i)=><div className="step" key={s}><span>0{i+1}</span><h3>{s}</h3><p>Simple, clear and easy to follow.</p></div>)}</div>
      </section>

      <section className="cta"><span className="kicker">The next draw is waiting</span><h2>Ready to try your luck?</h2><a className="button button-light" href="#play">Play Now →</a></section>
    </main>

    <footer><div className="brand">AMERICAN<span>LOTTERY</span></div><p>Lottery platform prototype. Not an official U.S. state lottery.</p><div><a href="#responsible">Responsible Play</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></footer>
  </div>
}

createRoot(document.getElementById("root")).render(<App />);