// assets/app.js
// Minimal helper: loads JSON, renders common header/footer, i18n, and utilities.

const FORM_ENDPOINT = ""; // Optional: e.g. "https://formspree.io/f/xxxxxxx"

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
function fmtEUR(v){ return new Intl.NumberFormat(undefined,{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v); }

function getLang(){
  const url = new URL(location.href);
  const param = url.searchParams.get("lang");
  return (param === "pt" ? "pt" : "en");
}

async function loadData(){
  const res = await fetch("./data/site.json", { cache:"no-store" });
  return res.json();
}

function renderHeader(d, t){
  const navItems = i18n[t].nav;
  const paths = ["index.html","solution.html","gtm.html","financials.html","incentives.html","timeline.html","dataroom.html","contact.html"];
  const langToggle = t === "pt" ? "EN" : "PT";
  const other = t === "pt" ? "en" : "pt";
  return `
  <header class="border-b bg-white/80 backdrop-blur">
    <nav class="container flex items-center gap-4 py-3" aria-label="Main">
      <a href="index.html?lang=${t}" class="font-semibold flex items-center gap-2">
        <img src="${d.brand?.logoUrl || ""}" alt="${d.brand?.name||"Logo"}" class="h-8 w-auto"/>
        <span>${d.brand?.name||"Company"}</span>
      </a>
      <div class="flex-1 flex flex-wrap gap-3">
        ${navItems.map((label, i)=>{
          const href = paths[i];
          const active = location.pathname.endsWith(href) || (i===0 && location.pathname.endsWith("/"));
          return `<a class="${active?"underline font-medium":""}" href="${href}?lang=${t}">${label}</a>`;
        }).join("")}
      </div>
      <a class="text-sm underline" href="${location.pathname}?lang=${other}" aria-label="Toggle language">${langToggle}</a>
    </nav>
  </header>`;
}

function renderFooter(d){
  const now = new Date().toISOString().slice(0,10);
  return `
  <footer class="border-t mt-8 py-6 text-sm text-slate-600 print:block">
    <div class="container flex flex-wrap gap-2">
      <span>© ${new Date().getFullYear()} ${d.brand?.name||""}</span>
      <span class="ml-auto">Printed: ${now} · ${location.href}</span>
    </div>
  </footer>`;
}

function lockBadge(d, t){
  if(!d.brand?.confidential) return "";
  return `<span class="no-print inline-flex items-center text-xs rounded-full border px-2 py-0.5 bg-slate-900 text-white" aria-label="${i18n[t].confidential}">🔒 ${i18n[t].confidential}</span>`;
}

function dataNeeded(s){ return `<span class="badge" title="Fill this in data/site.json">${s||"Data needed"}</span>`; }

function ensure(arr){ return Array.isArray(arr) ? arr : []; }

function gateUnlocked(){
  return localStorage.getItem("np_dataroom_ok")==="1";
}

function unlockGate(){ localStorage.setItem("np_dataroom_ok","1"); }

async function initCommon(){
  const t = getLang();
  const d = await loadData();

  // header & footer
  qs("#site-header").innerHTML = renderHeader(d, t);
  qs("#site-footer").innerHTML = renderFooter(d);

  // hero (if present)
  const hero = qs("#hero");
  if (hero){
    hero.innerHTML = `
      <div class="relative rounded-2xl p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex items-center gap-3">
          <img src="${d.brand?.logoUrl||""}" alt="${d.brand?.name||"Logo"}" class="h-10 w-auto"/>
          <h1 class="text-2xl font-semibold">${d.brand?.name || dataNeeded()}</h1>
          <span class="ml-auto">${lockBadge(d, t)}</span>
        </div>
        <p class="mt-4 text-lg">${d.brand?.tagline || dataNeeded()}</p>
      </div>`;
  }

  return { d, t };
}

// Pages

async function initHome(){
  const { d } = await initCommon();
  // Problem section
  const pb = qs("#problem");
  if(pb){
    const bullets = ensure(d.problem?.bullets).map(b=>`<li>${b}</li>`).join("");
    pb.innerHTML = `
      <h2 class="text-xl font-semibold mb-3">Market Pain & Oportunidade</h2>
      <ul class="list-disc pl-5 space-y-1">${bullets || `<li>${dataNeeded()}</li>`}</ul>
      <blockquote class="border-l-4 pl-3 mt-3 text-slate-600">${d.problem?.narrative || dataNeeded()}</blockquote>
    `;
  }

  const callout = qs("#cash-callout");
  if (callout){
    const v = d.financials?.cashTroughEur;
    callout.innerHTML = `
      <div class="rounded-2xl border p-4 bg-slate-50">
        <div class="text-sm text-slate-600">Cash trough</div>
        <div class="text-xl font-semibold">${typeof v==="number" ? fmtEUR(v) : dataNeeded()}</div>
        <div class="text-sm text-slate-600">Funding ask should comfortably bridge trough + risk buffer.</div>
      </div>`;
  }

  // Logos (simple names)
  const logoCloud = qs("#logo-cloud");
  if (logoCloud){
    const items = [
      ...ensure(d.gtm?.segments?.tier2_private).map(name=>({name})),
      ...ensure(d.gtm?.segments?.alliances).map(name=>({name}))
    ];
    logoCloud.innerHTML = `
      <div class="rounded-2xl border p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        ${items.map(i=>`<div class="text-sm text-slate-700">${i.name}</div>`).join("")}
      </div>
    `;
  }
}

async function initSolution(){
  const { d } = await initCommon();
  qs("#solution").innerHTML = `
    <h1 class="text-2xl font-semibold mb-2">Modelo & Diferenciação</h1>
    <p class="mb-2"><strong>Resumo do Modelo:</strong> ${d.model?.summary || dataNeeded()}</p>
    <p class="mb-2"><strong>Lanes:</strong> ${ensure(d.model?.lanes).join(", ") || dataNeeded()}</p>
    <p class="mb-2"><strong>USP:</strong> ${d.model?.usp || dataNeeded()}</p>
  `;
}

async function initGTM(){
  const { d } = await initCommon();
  qs("#gtm").innerHTML = `
    <h1 class="text-2xl font-semibold mb-2">Go-to-Market</h1>
    <ul class="space-y-1 mb-4">
      <li><strong>Público Tier 1:</strong> ${ensure(d.gtm?.segments?.tier1_public).join(", ") || dataNeeded()}</li>
      <li><strong>Privado Tier 2:</strong> ${ensure(d.gtm?.segments?.tier2_private).join(", ") || dataNeeded()}</li>
      <li><strong>Alianças:</strong> ${ensure(d.gtm?.segments?.alliances).join(", ") || dataNeeded()}</li>
    </ul>
    <p><strong>Estratégia:</strong> ${ensure(d.gtm?.strategy).join(" • ") || dataNeeded()}</p>
  `;
}

async function initFinancials(){
  const { d } = await initCommon();
  // Chart.js
  const rev = ensure(d.financials?.revenue).map(r=>({x:`Y${r.year}`, y:r.eur}));
  const ebt = ensure(d.financials?.ebitda).map(r=>({x:`Y${r.year}`, y:r.eur}));
  const gm  = ensure(d.financials?.gmPct).map(r=>({x:`Y${r.year}`, y:r.pct}));

  const ctx1 = qs("#chart-rev");
  const ctx2 = qs("#chart-ebitda");
  const ctx3 = qs("#chart-gm");

  if (ctx1 && rev.length){
    new Chart(ctx1, {
      type: "line",
      data: { labels: rev.map(r=>r.x), datasets: [{ label: "Revenue (EUR)", data: rev.map(r=>r.y) }] },
      options: { responsive:true, maintainAspectRatio:false }
    });
  }
  if (ctx2 && ebt.length){
    new Chart(ctx2, {
      type: "line",
      data: { labels: ebt.map(r=>r.x), datasets: [{ label: "EBITDA (EUR)", data: ebt.map(r=>r.y), fill: true }] },
      options: { responsive:true, maintainAspectRatio:false }
    });
  }
  if (ctx3 && gm.length){
    new Chart(ctx3, {
      type: "line",
      data: { labels: gm.map(r=>r.x), datasets: [{ label: "GM %", data: gm.map(r=>r.y) }] },
      options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0, max:100 } } }
    });
  }

  const trough = qs("#cash-trough");
  if(trough){
    const v = d.financials?.cashTroughEur;
    trough.textContent = typeof v==="number" ? fmtEUR(v) : "—";
  }
}

async function initIncentives(){
  const { d } = await initCommon();
  const box = qs("#incentives");
  box.innerHTML = ensure(d.incentives).map((i,idx)=>`
    <details class="border rounded-lg p-4">
      <summary class="font-medium">${i}</summary>
      <p class="mt-2 text-sm text-slate-600">Elegibilidade: adaptar conforme aviso. (Placeholder)</p>
    </details>`).join("") || dataNeeded();
}

async function initTimeline(){
  const { d } = await initCommon();
  const items = ensure(d.timeline90);
  qs("#timeline").innerHTML = items.map((label,i)=>`
    <span class="px-3 py-1 rounded-full border bg-slate-50 inline-block mr-2 mb-2"
      style="animation:fadeIn .3s ease ${i*50}ms both">${label}</span>
  `).join("");
  const btn = qs("#btn-print");
  if(btn){ btn.addEventListener("click", ()=>window.print()); }
}

async function initDataroom(){
  const { d, t } = await initCommon();
  const form = qs("#gate-form");
  const list = qs("#dataroom-links");

  function renderLinks(){
    list.innerHTML = ensure(d.dataroom).map(x=>`
      <a class="border rounded-lg p-4 hover:bg-slate-50 block" href="${x.href}" target="_blank" rel="noreferrer">
        <strong>${x.label}</strong>
        <div class="text-sm text-slate-500">${x.href}</div>
      </a>
    `).join("") || dataNeeded();
  }

  if (gateUnlocked()){
    qs("#gate").classList.add("hidden");
    renderLinks();
  } else {
    form?.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const email = (qs("#email").value || "").trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert("Invalid email"); return; }
      if (FORM_ENDPOINT){
        try{
          await fetch(FORM_ENDPOINT, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email }) });
        }catch{}
      }
      unlockGate();
      location.reload();
    });
  }
}

async function initContact(){
  const { d } = await initCommon();
  qs("#contact-card").innerHTML = `
    <div class="kpi"><div class="text-2xl font-semibold">${d.contacts?.email || dataNeeded()}</div><div class="text-sm text-slate-600">Email</div></div>
    <div class="kpi"><div class="text-2xl font-semibold">${d.contacts?.phone || dataNeeded()}</div><div class="text-sm text-slate-600">Phone</div></div>
  `;
}

async function initDisclaimer(){
  const { d } = await initCommon();
  qs("#disc").innerHTML = `
    <p><strong>Jurisdiction:</strong> ${d.legal?.jurisdiction || dataNeeded()}</p>
    <p>${d.legal?.disclaimer || dataNeeded()}</p>
    <p class="text-sm text-slate-500">© ${new Date().getFullYear()} ${d.brand?.name||""}</p>
  `;
}

// Router
const PAGE_BOOT = {
  "/": initHome,
  "/index.html": initHome,
  "/solution.html": initSolution,
  "/gtm.html": initGTM,
  "/financials.html": initFinancials,
  "/incentives.html": initIncentives,
  "/timeline.html": initTimeline,
  "/dataroom.html": initDataroom,
  "/contact.html": initContact,
  "/disclaimer.html": initDisclaimer
};

window.addEventListener("DOMContentLoaded", ()=>{
  const p = location.pathname.endsWith("/")?"/":location.pathname;
  const boot = PAGE_BOOT[p] || (()=>{});
  boot();
});
