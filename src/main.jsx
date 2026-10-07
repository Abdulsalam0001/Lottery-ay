import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import"./styles.css";
import{getPublicWinners,getPublicWithdrawals,getPublicTestimonials,mockWinners,mockWithdrawals,mockTestimonials}from"./publicData";

const U=(id,w=600,h=600)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=${w}&h=${h}&q=80`;
const faces=[
"photo-1507003211169-0a1dd7228f2d","photo-1494790108377-be9c29b29330","photo-1500648767791-00dcc994a43e",
"photo-1438761681033-6461ffad8d80","photo-1472099645785-5658abf4ff4e","photo-1544005313-94ddf0286df2"];
const HERO=U("photo-1529156069898-49953e39b3ac",1400,1000);
const games=[
{name:"American Millions",jackpot:"$125M",price:"$2",draw:"Sat · 10:00 PM ET",tag:"Jackpot",c:"g1"},
{name:"Star 7",jackpot:"$25M",price:"$1",draw:"Wed · 10:00 PM ET",tag:"Popular",c:"g2"},
{name:"Cash 5",jackpot:"$5M",price:"$1",draw:"Daily · 10:00 PM ET",tag:"Daily",c:"g3"}];
const stats=[["$125M","Tonight's jackpot"],["02:14:32","Next draw in"],["2.4M","Tickets this draw"],["18,420","Winners this month"]];
const steps=[["Choose","Pick your numbers or let us quick-pick."],["Secure","Tickets are stored in your account."],["Watch","Follow the verified live draw."],["Collect","Get notified the moment you win."]];

function App(){
const[winners,setW]=useState(mockWinners),[pay,setP]=useState(mockWithdrawals),[tests,setT]=useState(mockTestimonials),[menu,setMenu]=useState(false),[toast,setToast]=useState("");
useEffect(()=>{Promise.all([getPublicWinners(),getPublicWithdrawals(),getPublicTestimonials()]).then(([w,p,t])=>{setW(w);setP(p);setT(t)})},[]);
const notify=m=>{setToast(m);clearTimeout(window.__t);window.__t=setTimeout(()=>setToast(""),2500)};
const go=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
const fade={initial:{opacity:0,y:24},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{duration:.55}};
return<div className="app">
<div className="demo-bar">Design demo · Illustrative photos and sample data only · Not a real lottery</div>
<header className="nav"><a className="brand" href="/">American<span>Lottery</span></a>
<nav>{["games","results","winners","how"].map(i=><a key={i} href={"#"+i}>{i==="how"?"How it works":i[0].toUpperCase()+i.slice(1)}</a>)}</nav>
<div className="nav-actions"><button className="ghost" onClick={()=>notify("Sign in is not connected in this demo.")}>Sign in</button><button className="btn sm" onClick={()=>go("games")}>Play now</button></div>
<button className="burger" aria-label="Menu" onClick={()=>setMenu(v=>!v)}>☰</button></header>
{menu&&<div className="mobile">{["games","results","winners","how"].map(i=><a key={i} href={"#"+i} onClick={()=>setMenu(false)}>{i==="how"?"How it works":i[0].toUpperCase()+i.slice(1)}</a>)}</div>}

<section className="hero"><div className="wrap hero-grid">
<div><span className="pill"><i/>Next draw · Saturday 10:00 PM ET</span>
<h1>Your numbers.<br/><em>Your moment.</em></motion.h1>
<p>Follow live draws, explore the biggest jackpots and see verified results in one clean, trusted place.</p>
<div className="row"><button className="btn" onClick={()=>go("games")}>Explore games →</button><a className="link" href="#results">Latest results</a></div>
<div className="proof"><div className="stack">{faces.slice(0,4).map(f=><img key={f} src={U(f,96,96)} alt=""/>)}</div><span><b>18K+</b> players celebrated this month</span></div></div>
<div className="hero-card">
<img src={HERO} alt="Friends celebrating together"/><div className="shade"/>
<div className="jack"><small>Estimated jackpot</small><strong>$125<span>M</span></strong><button className="btn light" onClick={()=>notify("Ticket flow is not part of this demo.")}>Play $2</button></div></div>
</div></section>

<section className="stats"><div className="wrap stats-grid">{stats.map(([v,l])=><div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div></section>

<section id="games" className="sec"><div className="wrap"><div {...fade} className="head"><span className="kick">Featured games</span><h2>Choose your game</h2></div>
<div className="cards">{games.map((g,i)=><article key={g.name} {...fade} className={"game "+g.c}>
<span className="tag">{g.tag}</span><div className="orbs"><i/><i/><i/></div><h3>{g.name}</h3><div className="amt">{g.jackpot}</div><p>{g.draw}</p>
<div className="foot"><span>{g.price} per play</span><button onClick={()=>notify(g.name+" selected (demo).")}>Play →</button></div></article>)}</div></div></section>

<section id="results" className="sec alt"><div className="wrap split">
<div {...fade}><span className="kick">Latest result</span><h2>Did your numbers come up?</h2><p className="lead">Compare your ticket with the verified American Millions draw.</p>
<div className="result"><div className="meta"><span>American Millions · Draw #004820</span><span>Sep 30, 2026</span></div>
<div className="balls">{[8,14,22,31,42,48].map(n=><b key={n}>{String(n).padStart(2,"0")}</b>)}<b className="bonus">17</b></div></div>
<button className="btn dark" onClick={()=>notify("Results archive is not connected in this demo.")}>View all results →</button></div>
<div {...fade} className="how-list">{steps.map(([t,d],i)=><div className="step" key={t} id={i===0?"how":undefined}><span>0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div>
</div></section>

<section id="winners" className="sec"><div className="wrap"><div {...fade} className="head"><span className="kick">Celebrating players</span><h2>Recent winners</h2><p className="note">Illustrative stock photos and sample names for design demonstration. Not real winners.</p></div>
<div className="winners">{winners.slice(0,6).map((w,i)=><article key={w.id||w.name} {...fade} className="winner">
<img src={U(faces[i%faces.length],240,240)} alt="" loading="lazy"/><div><h3>{w.name}</h3><p>{w.state} · {w.game}</p></div><strong>{w.amount}</strong></article>)}</div></div></section>

<section className="sec alt"><div className="wrap split">
<div {...fade} className="panel"><div className="ph"><b>Recent payouts</b><span><i/>Sample feed</span></div>
{pay.slice(0,5).map(p=><div className="prow" key={p.id||p.name}><div className="chk">✓</div><div><b>{p.name}</b><small>{p.state} · {p.time}</small></div><strong>{p.amount}</strong></div>)}</div>
<div className="quotes"><span className="kick">Player stories</span>{tests.slice(0,3).map((t,i)=><blockquote key={t.id||t.name} {...fade}>
<img src={U(faces[(i+3)%faces.length],96,96)} alt=""/><div><p>“{t.text}”</p><footer>{t.name}, {t.state}</footer></div></blockquote>)}</div>
</div></section>

<section className="cta"><div className="wrap"><h2>The next big moment<br/><em>could be yours.</em></h2><button className="btn light" onClick={()=>go("games")}>Explore games →</button></div></section>
<footer><div className="wrap foot-grid"><div><div className="brand light">American<span>Lottery</span></div><p>Design demonstration. Not an official U.S. state lottery.</p></div><div className="fl"><a href="#">Responsible play</a><a href="#">Privacy</a><a href="#">Terms</a></div></div></footer>
{toast&&<div className="toast">{toast}</div>}
</div>}
createRoot(document.getElementById("root")).render(<App/>);
