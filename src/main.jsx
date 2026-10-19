import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import"./styles.css";
import{getPublicWinners,getPublicWithdrawals,getPublicTestimonials,getRaffleCatalog,previewRaffles,previewTicketPackages,mockWinners,mockWithdrawals,mockTestimonials}from"./publicData";
import{imageConfig,imageUrlOr}from"./imageConfig";

const U=(id,w=600,h=600)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=${w}&h=${h}&q=80`;
const faces=[
"photo-1507003211169-0a1dd7228f2d","photo-1494790108377-be9c29b29330","photo-1500648767791-00dcc994a43e",
"photo-1438761681033-6461ffad8d80","photo-1472099645785-5658abf4ff4e","photo-1544005313-94ddf0286df2"];
const HERO_FALLBACK=U("photo-1529156069898-49953e39b3ac",1400,1000);
const statsLabels=[["$125K","Featured raffle prize"],["","Next draw in"],["2.4M","Tickets this draw"],["18,420","Winners this month"]];
const steps=[["Browse","Review the available raffle details and advertised prize."],["Compare","Check ticket pricing, draw timing and eligibility before entering."],["Follow","Use official operator notices for draw timing and rule changes."],["Results","Official results integration will be added before this becomes a live service."]];

function App(){
const[winners,setW]=useState(mockWinners),[pay,setP]=useState(mockWithdrawals),[tests,setT]=useState(mockTestimonials),[raffles,setRaffles]=useState(previewRaffles),[ticketPackages,setTicketPackages]=useState(previewTicketPackages),[catalogStatus,setCatalogStatus]=useState("checking"),[menu,setMenu]=useState(false),[toast,setToast]=useState("");
const [countdown,setCountdown]=useState("02:14:32");
const [entryRaffle,setEntryRaffle]=useState(null),[entryName,setEntryName]=useState(""),[entryEmail,setEntryEmail]=useState(""),[entryCount,setEntryCount]=useState(1),[entryBusy,setEntryBusy]=useState(false),[entryResult,setEntryResult]=useState(null);
const heroSlides=(Array.isArray(imageConfig.homepageHeroSlides)&&imageConfig.homepageHeroSlides.length?imageConfig.homepageHeroSlides:[imageConfig.homepageHero]).filter(url=>typeof url==="string"&&/^https?:\/\//i.test(url.trim()));
const [heroIndex,setHeroIndex]=useState(0);
const heroImage=imageUrlOr(heroSlides[heroIndex]||imageConfig.homepageHero,HERO_FALLBACK);
useEffect(()=>{
  const tick=()=>{const now=new Date(), target=new Date(now); target.setHours(22,0,0,0); if(target<=now) target.setDate(target.getDate()+1); const ms=target-now; const h=Math.floor(ms/36e5), m=Math.floor(ms%36e5/6e4), s=Math.floor(ms%6e4/1e3); setCountdown([h,m,s].map((v,i)=>i===0?String(v).padStart(2,"0"):String(v).padStart(2,"0")).join(":"))};
  tick(); const id=setInterval(tick,1000); return()=>clearInterval(id);
},[]);
useEffect(()=>{Promise.all([getPublicWinners(),getPublicWithdrawals(),getPublicTestimonials()]).then(([w,p,t])=>{setW(w);setP(p);setT(t)});getRaffleCatalog().then(({raffles:items,ticketPackages:packages,connected})=>{setRaffles(items);setTicketPackages(packages);setCatalogStatus(connected?"connected":"preview")})},[]);
useEffect(()=>{if(heroSlides.length<2)return;const id=setInterval(()=>setHeroIndex(i=>(i+1)%heroSlides.length),5000);return()=>clearInterval(id)},[heroSlides.length]);
const notify=m=>{setToast(m);clearTimeout(window.__t);window.__t=setTimeout(()=>setToast(""),2500)};
const stats=statsLabels.map(([v,l])=>[l==="Next draw in"?countdown:v,l]);
const go=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});

return<div className="app">
<div className="demo-bar">Live database entries · Payment processing is not enabled · Check official rules and eligibility before participating</div>
<header className="nav"><a className="brand" href="/">American<span>Lucky Draw</span></a>
<nav>{["raffles","results","winners","how"].map(i=><a key={i} href={"#"+i}>{i==="how"?"How it works":i==="raffles"?"Raffles":i[0].toUpperCase()+i.slice(1)}</a>)}</nav>
<div className="nav-actions"><button className="ghost" onClick={()=>notify("Sign in is not connected in this demo.")}>Sign in</button><button className="btn sm" onClick={()=>go("raffles")}>Play now</button></div>
<button className="burger" aria-label="Menu" onClick={()=>setMenu(v=>!v)}>☰</button></header>
{menu&&<div className="mobile">{["raffles","results","winners","how"].map(i=><a key={i} href={"#"+i} onClick={()=>setMenu(false)}>{i==="how"?"How it works":i==="raffles"?"Raffles":i[0].toUpperCase()+i.slice(1)}</a>)}</div>}

<section className="hero"><div className="wrap hero-grid">
<div><span className="pill"><i/>THE HOUSE OF CLASSIC RAFFLES</span>
<h1>Step into the<br/><em>Lucky Lounge.</em></h1>
<p>Discover featured prize draws, compare ticket bundles, and explore the latest results in a classic casino-inspired setting.</p>
<div className="row"><button className="btn" onClick={()=>go("raffles")}>Explore the tables →</button><a className="link" href="#results">Latest results</a></div>
<div className="proof"><div className="stack">{faces.slice(0,4).map((f,i)=><img key={f} src={imageUrlOr(imageConfig.playerAvatars[i],U(f,96,96))} alt=""/>)}</div><span><b>18K+</b> sample community figure</span></div></div>
<div className="hero-card">
<img className="hero-slide-image" src={heroImage} alt="Older adults enjoying life together" key={heroImage}/><div className="shade"/>{heroSlides.length>1&&<div className="hero-dots" aria-label="Choose hero slide">{heroSlides.map((src,i)=><button key={src} className={i===heroIndex?"active":""} aria-label={"Show hero image "+(i+1)} aria-pressed={i===heroIndex} onClick={()=>setHeroIndex(i)}/>)}</div>}
<div className="jack"><small>TONIGHT’S FEATURED DRAW · DEMO</small><strong>$125<span>K</span></strong><button className="btn light" onClick={()=>go("raffles")}>See the prize board</button></div></div>
</div></section>

<section className="stats"><div className="wrap stats-grid">{stats.map(([v,l])=><div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div></section>

<section id="raffles" className="sec raffle-section"><div className="wrap">
<div className="section-top"><div className="head"><span className="kick">THE RAFFLE ROOM</span><h2>Choose your lucky draw</h2><p className="lead">Big prize displays, clear draw times, and ticket prices at a glance.</p></div><span className={"official-note "+(catalogStatus==="connected"?"catalog-connected":"")}><i/>{catalogStatus==="connected"?"DATABASE CONNECTED":catalogStatus==="checking"?"CHECKING CATALOGUE":"PREVIEW DATA · DATABASE OFFLINE"}</span></div>
<div className="raffle-layout"><div className="raffle-list">{raffles.map((r,i)=><article key={r.id} className={"raffle-row "+r.c}>
<div className="raffle-mark"><span>{String(i+1).padStart(2,"0")}</span><div className="raffle-ticket-art"><i/><i/><i/></div></div>
<div className="raffle-info"><span className="raffle-tag">{r.tag}</span><h3>{r.name}</h3><p>{r.description}</p><div className="raffle-meta"><span><b>Draw:</b> {r.draw}</span><span><b>Type:</b> {r.frequency}</span></div></div>
<div className="raffle-prize"><small>Advertised prize</small><strong>{r.prize}</strong><span>Ticket from <b>{r.ticket}</b></span><button onClick={()=>{setEntryRaffle(r);setEntryCount(1);setEntryResult(null)}}>Enter raffle →</button></div>
</article>)}</div>
<aside className="price-panel" id="ticket-prices"><div className="price-heading"><span className="kick">THE TICKET WINDOW</span><h3>Ticket price list</h3><p>Displayed prices are catalogue information only. Checkout is not enabled.</p></div>
<div className="price-list">{ticketPackages.map((pkg,i)=><div key={pkg.qty} className={"price-item "+(pkg.featured?"recommended":"")}><div className="price-qty">{pkg.qty}{pkg.featured&&<span>POPULAR</span>}<small>{pkg.each}</small></div><strong>{pkg.price}</strong><button aria-label={"Select "+pkg.qty} onClick={()=>{setEntryRaffle(raffles[0]||null);setEntryCount(pkg.quantity||1);setEntryResult(null)}}>Enter</button></div>)}</div>
<div className="price-foot"><span>ⓘ</span><p>Demo prices only. No tickets can be purchased on this site. Actual raffle prices, rules and eligibility must be published by the authorized operator.</p></div>
</aside></div>
</div></section>

<section id="results" className="sec alt"><div className="wrap split">
<div><span className="kick">Latest result</span><h2>Did your numbers come up?</h2><p className="lead">Results are published here only after a draw is recorded in the live database. No result is currently verified by an independent authority.</p>
<div className="result"><div className="meta"><span>Latest recorded result</span><span>Live results API</span></div>
<div className="balls"><b>Results</b><b>are</b><b>loaded</b><b>from</b><b>the</b><b>database</b></div></div>
<button className="btn dark" onClick={()=>fetch("/api/results").then(r=>r.json()).then(data=>notify(Array.isArray(data)&&data.length?data.map(d=>`${d.raffleName}: ${d.winner} (${d.reference})`).join(" · "):"No recorded draws yet.")).catch(()=>notify("Could not load results."))}>Check recorded results →</button></div>
<div className="how-list">{steps.map(([t,d],i)=><div className="step" key={t} id={i===0?"how":undefined}><span>0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div>
</div></section>

<section id="winners" className="sec"><div className="wrap"><div className="head"><span className="kick">The winners’ gallery</span><h2>Recent winners</h2><p className="note">Illustrative stock photos and sample names for design demonstration. Not real winners.</p></div>
<div className="winners">{winners.slice(0,6).map((w,i)=><article key={w.id||w.name} className="winner">
<img src={imageUrlOr(w.imageUrl,imageUrlOr(imageConfig.winnerFallbacks[i],U(faces[i%faces.length],240,240)))} alt={"Photo of "+w.name} loading="lazy"/><div><h3>{w.name}</h3><p>{w.state} · {w.game}</p></div><strong>{w.amount}</strong></article>)}</div></div></section>

<section className="sec alt"><div className="wrap split">
<div className="panel"><div className="ph"><b>Recent payouts</b><span><i/>Sample feed</span></div>
{pay.slice(0,5).map(p=><div className="prow" key={p.id||p.name}><div className="chk">✓</div><div><b>{p.name}</b><small>{p.state} · {p.time}</small></div><strong>{p.amount}</strong></div>)}</div>
<div className="quotes"><span className="kick">Player stories</span>{tests.slice(0,3).map((t,i)=><blockquote key={t.id||t.name}>
<img src={imageUrlOr(imageConfig.testimonials[i],U(faces[(i+3)%faces.length],96,96))} alt=""/><div><p>“{t.text}”</p><footer>{t.name}, {t.state}</footer></div></blockquote>)}</div>
</div></section>

<section className="cta"><div className="wrap"><h2>Your next favourite draw<br/><em>is on the board.</em></h2><button className="btn light" onClick={()=>go("raffles")}>Explore raffle room →</button></div></section>
<footer><div className="wrap foot-grid"><div><div className="brand light">American<span>Lottery</span></div><p>Design demonstration. Not an official U.S. state lottery.</p></div><div className="fl"><a href="#">Responsible play</a><a href="#">Privacy</a><a href="#">Terms</a></div></div></footer>
{entryRaffle&&<div role="dialog" aria-modal="true" aria-label="Enter raffle" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,12,18,.78)",display:"grid",placeItems:"center",padding:20}}><form onSubmit={async e=>{e.preventDefault();setEntryBusy(true);setEntryResult(null);try{const response=await fetch("/api/entries",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({raffleId:entryRaffle.id,displayName:entryName,email:entryEmail,ticketCount:Number(entryCount)})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not save entry");setEntryResult({ok:true,message:"Entry saved. Keep this reference: "+data.entry.reference+" · "+data.entry.ticketCount+" ticket(s). This confirms database registration only, not payment."});}catch(error){setEntryResult({ok:false,message:error.message})}finally{setEntryBusy(false)}}} style={{background:"#fff",color:"#17202c",padding:28,borderRadius:18,width:"min(100%,480px)",display:"grid",gap:14,boxShadow:"0 20px 80px #0007"}}><button type="button" onClick={()=>setEntryRaffle(null)} style={{justifySelf:"end",border:0,background:"transparent",fontSize:22,cursor:"pointer"}} aria-label="Close">×</button><span className="kick">LIVE ENTRY</span><h2 style={{margin:0}}>Enter {entryRaffle.name}</h2><p style={{margin:0}}>Your details are saved to the live database. This form does not take payment or verify lottery eligibility.</p><label>Display name<input required minLength={2} maxLength={60} value={entryName} onChange={e=>setEntryName(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6,border:"1px solid #ccd2d8",borderRadius:8}}/></label><label>Email address<input type="email" required maxLength={254} value={entryEmail} onChange={e=>setEntryEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6,border:"1px solid #ccd2d8",borderRadius:8}}/></label><label>Number of entries<input type="number" min="1" max="100" required value={entryCount} onChange={e=>setEntryCount(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6,border:"1px solid #ccd2d8",borderRadius:8}}/></label>{entryResult&&<p role="status" style={{padding:12,borderRadius:8,background:entryResult.ok?"#e8f6ee":"#fff0ee",overflowWrap:"anywhere"}}>{entryResult.message}</p>}<button className="btn" type="submit" disabled={entryBusy}>{entryBusy?"Saving entry…":"Submit entry"}</button><button type="button" onClick={()=>setEntryRaffle(null)} style={{padding:10,background:"transparent",border:0,cursor:"pointer"}}>Close</button></form></div>}{toast&&<div className="toast">{toast}</div>}
</div>}
createRoot(document.getElementById("root")).render(<App/>);
