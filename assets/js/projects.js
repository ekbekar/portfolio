// Work entries, in side-nav order. Asset heights are the Figma frame heights at 908px width.
// cover.type: "phone" = 600px card with hand/phone on the right; "screen" = 800px card with a screenshot below the info.
window.PROJECTS = [
  {
    id: "keysty", name: "Keysty", nav: "Keysty", status: "ongoing", category: "Real Estate",
    desc: "Keysty is the intelligent operating system behind real estate relationships, and business",
    descWidth: 259, iconShift: 28,
    cover: { type: "screen", img: "cover-keysty.webp", top: 310, rounded: true, imgStyle: "inset:0;width:100%;height:100%;object-fit:cover" },
    assets: [["keysty-01.webp", 600], ["keysty-02.webp", 600]],
  },
  {
    id: "paydas", name: "Paydas", nav: "Paydaş", status: "ongoing", category: "Fintech",
    desc: "Invest in rental income and capital appreciation of value-added properties with a low entry cost.",
    descWidth: 259, iconShift: 28,
    cover: { type: "phone", img: "cover-paydas.webp" },
    assets: [["paydas-01.webp", 600], ["paydas-02.webp", 404], ["paydas-03.webp", 600]],
  },
  {
    id: "duelyx", name: "Duelyx", nav: "Duelyx", status: "shipped", category: "Gaming",
    desc: "Multiplayer gaming platform for gamers",
    descWidth: 259, iconShift: 28,
    cover: { type: "phone", img: "cover-duelyx.webp" },
    assets: [["duelyx-01.webp", 600], ["duelyx-02.webp", 690]],
  },
  {
    id: "otopass", name: "Otopass", nav: "Otopass", status: "shipped", category: "Travel & Transportation",
    desc: "EV Charging and managment platform",
    descWidth: 259, iconShift: 28,
    cover: { type: "phone", img: "cover-otopass.webp" },
    assets: [["otopass-01.webp", 600], ["otopass-02.webp", 690]],
  },
  {
    id: "walk2", name: "Walk2", nav: "Walk2", status: "shipped", category: "Food & Drink",
    desc: "Digital ordering and payment platform that enables the management of the dining-out experience",
    descWidth: 400, iconShift: 28,
    cover: { type: "phone", img: "cover-walk2.webp" },
    assets: [["walk2-01.webp", 690], ["walk2-02.webp", 404], ["walk2-03.webp", 600]],
  },
  {
    id: "dfsk", name: "DFSK", nav: "DFSK", status: "shipped", category: "Travel & Transportation",
    desc: "Automotive company established in partnership with Dongfeng Motor Group and Seres Group.",
    descWidth: 400, iconShift: 42,
    cover: { type: "screen", img: "cover-dfsk.webp", top: 310, rounded: false, imgStyle: "left:0;top:-0.01%;width:100%;height:76.93%" },
    assets: [["dfsk-02.webp", 600], ["dfsk-03.webp", 533], ["dfsk-04.webp", 600]],
  },
  {
    id: "wisecare", name: "Wisecare AI", nav: "Wisecare MVP", status: "shipped", category: "Healthcare",
    desc: "Streamlines health insurance and healthcare service processes using artificial intelligence.",
    descWidth: 400, iconShift: 28,
    cover: { type: "screen", img: "cover-wisecare.webp", top: 310, rounded: true, border: true, imgStyle: "left:-15.33%;top:-15.81%;width:130.67%;height:100%" },
    assets: [["wisecare-01.webp", 600], ["wisecare-02.webp", 600], ["wisecare-03.webp", 600]],
  },
  {
    id: "custody", name: "Paribu Custody", nav: "Paribu Custody", status: "shipped", category: "Blockchain",
    desc: "End-to-end secure digital asset storage infrastructure designed for banks, financial institutions, and blockchain startups.",
    descWidth: 400, iconShift: 28,
    cover: { type: "screen", img: "cover-custody.webp", top: 332, rounded: true, border: true, imgStyle: "left:0;top:0.06%;width:100%;height:69.11%" },
    assets: [["custody-01.webp", 600], ["custody-02.webp", 600]],
  },
];
