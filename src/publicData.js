export const previewRaffles = [
  { id:"grand", name:"The Grand Prize Raffle", prize:"$125,000", ticket:"$2", draw:"Saturday · 10:00 PM ET", frequency:"Weekly draw", tag:"Featured", c:"g1", description:"Our featured draw with one headline prize and additional cash awards." },
  { id:"community", name:"Community Cash Raffle", prize:"$25,000", ticket:"$1", draw:"Wednesday · 8:00 PM ET", frequency:"Midweek draw", tag:"Midweek", c:"g2", description:"A smaller weekly raffle with a straightforward entry price." },
  { id:"daily", name:"Daily Bonus Raffle", prize:"$5,000", ticket:"$1", draw:"Daily · 7:00 PM ET", frequency:"Daily draw", tag:"Daily", c:"g3", description:"A simple daily draw for people who prefer a smaller prize pool." }
];

export const previewTicketPackages = [
  { id:"one", qty:"1 ticket", price:"$2", each:"$2.00 per ticket", featured:false },
  { id:"five", qty:"5 tickets", price:"$9", each:"$1.80 per ticket", featured:false },
  { id:"ten", qty:"10 tickets", price:"$16", each:"$1.60 per ticket", featured:true },
  { id:"twenty-five", qty:"25 tickets", price:"$35", each:"$1.40 per ticket", featured:false }
];

export async function getRaffleCatalog() {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  try {
    const responses = await Promise.all([
      fetch(base + "/api/raffles", { headers: { Accept: "application/json" } }),
      fetch(base + "/api/ticket-packages", { headers: { Accept: "application/json" } })
    ]);
    if (!responses[0].ok || !responses[1].ok) throw new Error("Catalogue API unavailable");
    const data = await Promise.all([responses[0].json(), responses[1].json()]);
    if (!Array.isArray(data[0]) || !Array.isArray(data[1])) throw new Error("Invalid catalogue response");
    return { raffles: data[0], ticketPackages: data[1], connected: true };
  } catch {
    return { raffles: previewRaffles, ticketPackages: previewTicketPackages, connected: false };
  }
}

export const mockWinners = [
  { id:"w-1001", name:"Michael R.", state:"Texas", amount:"$2,450,000", game:"American Millions", date:"Oct 04, 2026" },
  { id:"w-1002", name:"Sarah W.", state:"California", amount:"$750,000", game:"American Millions", date:"Oct 02, 2026" },
  { id:"w-1003", name:"James T.", state:"Florida", amount:"$125,000", game:"Star 7", date:"Sep 30, 2026" },
  { id:"w-1004", name:"Angela M.", state:"New York", amount:"$50,000", game:"Cash 5", date:"Sep 29, 2026" },
  { id:"w-1005", name:"David K.", state:"Illinois", amount:"$25,000", game:"Star 7", date:"Sep 28, 2026" },
  { id:"w-1006", name:"Lisa P.", state:"Arizona", amount:"$10,000", game:"Cash 5", date:"Sep 27, 2026" }
];

export const mockWithdrawals = [
  { id:"wd-2001", name:"J. Carter", state:"Georgia", amount:"$18,500", status:"Paid", time:"2 min ago" },
  { id:"wd-2002", name:"M. Davis", state:"Ohio", amount:"$7,250", status:"Paid", time:"8 min ago" },
  { id:"wd-2003", name:"A. Wilson", state:"Nevada", amount:"$4,800", status:"Paid", time:"14 min ago" },
  { id:"wd-2004", name:"R. Brown", state:"Colorado", amount:"$2,150", status:"Paid", time:"21 min ago" },
  { id:"wd-2005", name:"T. Miller", state:"Virginia", amount:"$1,000", status:"Paid", time:"31 min ago" }
];

export const mockTestimonials = [
  { id:"t-3001", name:"Rachel M.", state:"California", text:"The results are easy to follow and the whole experience feels simple." },
  { id:"t-3002", name:"Kevin D.", state:"Texas", text:"I like being able to see recent winners and draw information in one place." },
  { id:"t-3003", name:"Monica S.", state:"Florida", text:"Clean, straightforward and easy to understand." }
];

async function loadCollection(path, fallback) {
  const base = import.meta.env.VITE_API_URL;
  if (!base) return fallback;
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}${path}`);
    if (!response.ok) throw new Error("API request failed");
    const payload = await response.json();
    return Array.isArray(payload) ? payload : (payload.data || fallback);
  } catch {
    return fallback;
  }
}

export const getPublicWinners = () => loadCollection("/api/public/winners", mockWinners);
export const getPublicWithdrawals = () => loadCollection("/api/public/withdrawals", mockWithdrawals);
export const getPublicTestimonials = () => loadCollection("/api/public/testimonials", mockTestimonials);
