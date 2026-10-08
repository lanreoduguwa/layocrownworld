/* Everything below is loaded from your server: products and videos from the admin page,
   bank details, WhatsApp number and owner name from your .env settings. */
const OWNER_PHOTO = "/owner.png";   // file must be at public/owner.png
let CFG = { name: "Layocrowns", ownerName: "", whatsapp: "", bank: { bank: "", accountName: "", accountNumber: "" } };
let PRODUCTS = [], VIDEOS = [];
const getJSON = u => fetch(u).then(r => r.ok ? r.json() : Promise.reject());

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const naira = n => "₦" + Number(n).toLocaleString();
const wa = text => `https://wa.me/${CFG.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
const toast = t => { const e = $("toast"); e.textContent = t; e.classList.add("s"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("s"), 2400); };

function bottle(cat) {
  const body = {
    "Perfume": '<rect x="68" y="92" width="64" height="72" rx="12" fill="url(#g)"/><rect x="90" y="66" width="20" height="26" fill="#470a1c"/><rect x="80" y="54" width="40" height="14" rx="4" fill="#2a1218"/>',
    "Perfume Oil": '<rect x="78" y="100" width="44" height="64" rx="8" fill="url(#g)"/><rect x="92" y="76" width="16" height="24" fill="#470a1c"/><circle cx="100" cy="68" r="11" fill="#2a1218"/>',
    "Body Mist": '<rect x="76" y="76" width="48" height="88" rx="16" fill="url(#g)"/><rect x="88" y="58" width="24" height="18" fill="#470a1c"/><rect x="84" y="50" width="32" height="8" rx="3" fill="#2a1218"/>',
    "Body Spray": '<rect x="82" y="66" width="36" height="98" rx="8" fill="url(#g)"/><rect x="91" y="50" width="18" height="16" fill="#470a1c"/><rect x="96" y="42" width="20" height="8" rx="2" fill="#2a1218"/>',
    "Diffuser": '<path d="M64 104h72l-8 60H72z" fill="url(#g)"/><rect x="88" y="94" width="24" height="10" fill="#470a1c"/><path d="M96 94L80 44M100 94l2-52M104 94l20-50" stroke="#2a1218" stroke-width="3"/>'
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3294e"/><stop offset="1" stop-color="#6d0f2b"/></linearGradient></defs><rect width="200" height="200" fill="#fbf4f5"/>${body[cat] || body.Perfume}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const pic = p => p.img || bottle(p.cat);
document.addEventListener("error", e => {
  const i = e.target;
  if (i.tagName === "IMG" && i.dataset.cat && !i.dataset.f) { i.dataset.f = 1; i.src = bottle(i.dataset.cat); }
}, true);

/* ---------- Cart ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("lc_cart")) || {}; } catch {}
const save = () => { try { localStorage.setItem("lc_cart", JSON.stringify(cart)); } catch {} };
const find = id => PRODUCTS.find(p => p.id === id);

function lines() { return Object.entries(cart).map(([id, q]) => ({ p: find(id), q })).filter(l => l.p); }
const total = () => lines().reduce((s, l) => s + l.p.price * l.q, 0);

function renderCart() {
  const L = lines();
  $("cc").textContent = L.reduce((s, l) => s + l.q, 0);
  $("items").innerHTML = L.length ? L.map(({ p, q }) => `<div class="ci"><img src="${esc(pic(p))}" data-cat="${esc(p.cat)}" alt=""><div class="n">${esc(p.name)}<small>${naira(p.price)}</small></div><div class="qty"><button data-d="${p.id}" aria-label="Less">−</button><span>${q}</span><button data-i="${p.id}" aria-label="More">+</button></div></div>`).join("")
    : `<p style="color:var(--mut)">Your cart is empty. <a href="#shop" style="color:var(--b);font-weight:600">Browse the collection</a></p>`;
  $("total").textContent = $("amt").textContent = naira(total());
  $("send").disabled = !L.length;
  save();
}
$("items").onclick = e => {
  const d = e.target.dataset, id = d.i || d.d; if (!id) return;
  cart[id] = (cart[id] || 0) + (d.i ? 1 : -1);
  if (cart[id] < 1) delete cart[id]; else if (cart[id] > 20) cart[id] = 20;
  renderCart();
};

/* a small crown-coloured dot flies from the button to the cart */
function fly(from) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect(), b = $("cartBtn").getBoundingClientRect();
  const d = document.createElement("div");
  d.style.cssText = `position:fixed;left:${a.left + a.width / 2 - 9}px;top:${a.top + a.height / 2 - 9}px;width:18px;height:18px;border-radius:50%;background:#6d0f2b;z-index:70;pointer-events:none`;
  document.body.appendChild(d);
  d.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.3)`, opacity: .4 }], { duration: 650, easing: "cubic-bezier(.5,0,.2,1)" }).onfinish = () => {
    d.remove(); $("cartBtn").classList.remove("bump"); void $("cartBtn").offsetWidth; $("cartBtn").classList.add("bump");
  };
}

/* ---------- Collection ---------- */
let filter = "All", query = "";
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 }) : null;

function renderShop() {
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.cat))];
  $("chips").innerHTML = cats.map(c => `<button class="chip ${c === filter ? "on" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const list = PRODUCTS.filter(p => (filter === "All" || p.cat === filter) && words.every(w => `${p.name} ${p.cat} ${p.desc}`.toLowerCase().includes(w)));
  $("count").textContent = words.length && list.length ? `${list.length} item${list.length > 1 ? "s" : ""} found` : "";
  $("grid").innerHTML = list.length ? list.map((p, i) => `<article class="card" style="--d:${(i % 4) * 90}ms">${p.inStock ? "" : '<span class="sold">Sold out</span>'}<div class="pic"><img loading="lazy" decoding="async" src="${esc(pic(p))}" data-cat="${esc(p.cat)}" alt="${esc(p.name)}"></div><div class="b"><div class="tag">${esc(p.cat)}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="row"><span class="price">${naira(p.price)}</span><button class="btn" data-add="${p.id}" ${p.inStock ? "" : "disabled"}>Add to cart</button></div></div></article>`).join("")
    : `<p class="empty">${words.length ? `Nothing matches “${esc(query.trim())}”. Try another name, or choose All.` : "No products in this category yet."}</p>`;
  document.querySelectorAll("#grid .card").forEach(c => io ? io.observe(c) : c.classList.add("in"));
}
$("chips").onclick = e => { if (e.target.dataset.c) { filter = e.target.dataset.c; renderShop(); } };
$("q").oninput = () => { query = $("q").value; renderShop(); };
$("sf").onsubmit = e => { e.preventDefault(); query = $("q").value; renderShop(); document.activeElement.blur(); $("grid").scrollIntoView({ behavior: "smooth", block: "nearest" }); };
$("grid").onclick = e => {
  const id = e.target.dataset.add; if (!id) return;
  cart[id] = Math.min(20, (cart[id] || 0) + 1);
  renderCart(); fly(e.target); toast("Added to cart");
};

/* ---------- Videos ---------- */
function renderVideos() {
  $("vids").innerHTML = VIDEOS.length
    ? VIDEOS.map(v => `<div class="vid" tabindex="0" role="button" aria-label="Play ${esc(v.title)}"><video src="${esc(v.src)}" ${v.poster ? `poster="${esc(v.poster)}"` : ""} playsinline loop preload="metadata"></video><span class="play"></span><span class="cap">${esc(v.title)}</span></div>`).join("")
    : [1, 2, 3].map(() => `<div class="vid ph"><div>Your video goes here<small>Videos you post will appear here</small></div></div>`).join("");
}
function toggleVid(box) {
  const v = box.querySelector("video"); if (!v) return;
  document.querySelectorAll(".vid video").forEach(o => { if (o !== v) { o.pause(); o.parentNode.classList.remove("playing"); } });
  if (v.paused) { v.play(); box.classList.add("playing"); } else { v.pause(); box.classList.remove("playing"); }
}
$("vids").onclick = e => { const b = e.target.closest(".vid"); if (b) toggleVid(b); };
$("vids").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { const b = e.target.closest(".vid"); if (b) { e.preventDefault(); toggleVid(b); } } };

/* ---------- Order + payment ---------- */
let ref = "";
const newRef = () => ref || (ref = "LC" + Math.random().toString(36).slice(2, 7).toUpperCase());
function bankHTML() {
  const b = CFG.bank;
  return [["Bank", b.bank], ["Account name", b.accountName], ["Account number", b.accountNumber]]
    .map(([l, v], i) => `<div class="r"><span>${l}</span><b>${esc(v)}</b>${i === 2 ? `<button type="button" class="copy" data-copy="${esc(v)}">Copy</button>` : ""}</div>`).join("");
}
$("bank").onclick = e => {
  const v = e.target.dataset.copy; if (!v) return;
  (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast("Account number copied"), () => toast("Copy not available. Please select the number."));
};
$("of").onsubmit = e => {
  e.preventDefault(); $("err").textContent = "";
  const name = $("on").value.trim(), phone = $("op").value.trim(), addr = $("oa").value.trim();
  if (!lines().length) return $("err").textContent = "Your cart is empty. Add a product first.";
  if (!name || !phone || !addr) return $("err").textContent = "Please fill in your name, phone number and delivery address.";
  const items = lines().map(l => `• ${l.p.name} x${l.q} = ${naira(l.p.price * l.q)}`).join("\n");
  const msg = `Hello ${CFG.name}, I want to place an order (${newRef()}):\n${items}\nTotal: ${naira(total())}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${addr}\n\nI will pay by bank transfer and send my screenshot.`;
  window.open(wa(msg), "_blank", "noopener");
  toast("Order opened in WhatsApp. Now make your payment.");
};
$("proof").onclick = () => { $("proof").href = wa(`Hello ${CFG.name}, I have paid ${naira(total())} for order ${newRef()}. My payment screenshot is attached.`); };

/* ---------- Page switching (home / cart) ---------- */
function route() {
  const cartPage = location.hash === "#/cart";
  $("home").hidden = cartPage; $("cartView").hidden = !cartPage;
  if (cartPage) { renderCart(); scrollTo(0, 0); }
  else if (location.hash.length > 2) setTimeout(() => { const t = document.querySelector(location.hash); t && t.scrollIntoView(); }, 30);
  else scrollTo(0, 0);
}
addEventListener("hashchange", route);

/* ---------- Init ---------- */
(async () => {
  try { Object.assign(CFG, await getJSON("/api/config")); } catch {}
  try { PRODUCTS = (await getJSON("/api/products")).map(p => ({ id: p._id, name: p.name, cat: p.category, price: p.price, desc: p.description || "", img: p.image || "", inStock: p.inStock })); }
  catch { toast("Could not load products. Please refresh the page."); }
  try { VIDEOS = (await getJSON("/api/videos")).map(v => ({ src: v.url, title: v.title, poster: v.poster })); } catch {}
  Object.keys(cart).forEach(id => { const p = find(id); if (!p || !p.inStock) delete cart[id]; });
  document.title = `${CFG.name} | Perfumes`;
  $("ownerName").textContent = CFG.ownerName || "Funmilayo Adetulubo";
  $("mono").textContent = CFG.name.charAt(0);

  /* Owner photo: always loaded from public/owner.png */
  const oi = $("ownerImg");
  oi.onload = () => { oi.hidden = false; $("mono").hidden = true; };
  oi.onerror = () => { oi.hidden = true; $("mono").hidden = false; };
  oi.src = OWNER_PHOTO;

  ["waHero", "waFoot", "waFloat"].forEach(id => $(id).href = wa(`Hello ${CFG.name}, I would like to ask about your perfumes.`));
  $("strip").innerHTML = Array(8).fill('<span>Perfume</span><span>Body mist</span><span>Body spray</span><span>Perfume oil</span><span>Diffuser</span>').join("");
  $("bank").innerHTML = bankHTML();
  $("y").textContent = new Date().getFullYear();
  renderShop(); renderVideos(); renderCart(); route();
})();