const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const naira = n => "₦" + Number(n).toLocaleString();

async function api(url, opts) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && !url.includes("login")) { showLogin(); throw new Error("Please log in again"); }
  if (!r.ok) throw new Error(j.error || "Something went wrong");
  return j;
}
// upload with a progress bar (fetch cannot report upload progress)
function upload(url, fd, bar) {
  return new Promise((ok, no) => {
    const x = new XMLHttpRequest();
    x.open("POST", url);
    bar.style.display = "block";
    x.upload.onprogress = e => { if (e.lengthComputable) bar.firstChild.style.width = Math.round(e.loaded / e.total * 100) + "%"; };
    x.onload = () => { bar.style.display = "none"; bar.firstChild.style.width = 0;
      let j = {}; try { j = JSON.parse(x.responseText); } catch {}
      x.status >= 200 && x.status < 300 ? ok(j) : no(new Error(x.status === 401 ? "Please log in again" : j.error || "Upload failed")); };
    x.onerror = () => { bar.style.display = "none"; no(new Error("Network problem. Check your connection and try again.")); };
    x.send(fd);
  });
}
document.addEventListener("error", e => { if (e.target.tagName === "IMG") e.target.style.visibility = "hidden"; }, true);
const say = (el, t, ok) => { el.textContent = t; el.className = "msg " + (ok ? "k" : "e"); };

function showLogin() { $("panel").hidden = true; $("login").hidden = false; }
function showPanel() { $("login").hidden = true; $("panel").hidden = false; loadProducts(); loadVideos(); loadOwner(); }

$("lf").onsubmit = async e => {
  e.preventDefault(); $("le").textContent = "";
  try { await api("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: $("u").value, password: $("p").value }) });
    $("p").value = ""; showPanel(); }
  catch (er) { $("le").textContent = er.message; }
};
$("out").onclick = async () => { await fetch("/api/admin/logout", { method: "POST" }); showLogin(); };
document.querySelector(".tabs").onclick = e => {
  const t = e.target.dataset.t; if (!t) return;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  ["prod", "vid", "own"].forEach(k => $(k).hidden = t !== k);
};

/* products */
async function loadProducts() {
  const list = await fetch("/api/products").then(r => r.json()).catch(() => []);
  $("plist").innerHTML = list.length ? list.map(p => `<div class="item"><img alt="" src="${esc(p.image || "")}"><div class="n">${esc(p.name)}<small>${esc(p.category)} · ${naira(p.price)} · ${p.inStock ? "In stock" : "Sold out"}</small></div><div class="acts"><button class="btn o s" data-stock="${p._id}">${p.inStock ? "Mark sold out" : "Mark in stock"}</button><button class="btn o s" data-delp="${p._id}">Delete</button></div></div>`).join("")
    : `<p class="empty">No products yet. Post your first one above.</p>`;
}
$("pf").onsubmit = async e => {
  e.preventDefault(); $("pb").disabled = true; say($("pm"), "Posting…", true);
  try {
    const fd = new FormData();
    fd.append("name", $("pn").value); fd.append("category", $("pc").value); fd.append("price", $("pp").value); fd.append("description", $("pd").value);
    if ($("pi").files[0]) fd.append("image", $("pi").files[0]);
    await upload("/api/admin/products", fd, $("pbar"));
    $("pf").reset(); say($("pm"), "Product posted. It is now on your website.", true); loadProducts();
  } catch (er) { say($("pm"), er.message, false); }
  $("pb").disabled = false;
};
$("plist").onclick = async e => {
  const d = e.target.dataset;
  try {
    if (d.stock) await api(`/api/admin/products/${d.stock}/stock`, { method: "PATCH" });
    else if (d.delp && confirm("Delete this product from your website?")) await api(`/api/admin/products/${d.delp}`, { method: "DELETE" });
    else return;
    loadProducts();
  } catch (er) { alert(er.message); }
};

/* videos */
async function loadVideos() {
  const list = await fetch("/api/videos").then(r => r.json()).catch(() => []);
  $("vlist").innerHTML = list.length ? list.map(v => `<div class="item"><video muted preload="metadata" src="${esc(v.url)}"></video><div class="n">${esc(v.title)}</div><div class="acts"><button class="btn o s" data-delv="${v._id}">Delete</button></div></div>`).join("")
    : `<p class="empty">No videos yet. Post your first one above.</p>`;
}
$("vf").onsubmit = async e => {
  e.preventDefault(); $("vb").disabled = true; say($("vm"), "Uploading… keep this page open until it finishes.", true);
  try {
    const fd = new FormData(); fd.append("title", $("vt").value); fd.append("video", $("vi").files[0]);
    await upload("/api/admin/videos", fd, $("vbar"));
    $("vf").reset(); say($("vm"), "Video posted. It is now on your website.", true); loadVideos();
  } catch (er) { say($("vm"), er.message, false); }
  $("vb").disabled = false;
};
$("vlist").onclick = async e => {
  const id = e.target.dataset.delv; if (!id || !confirm("Delete this video from your website?")) return;
  try { await api(`/api/admin/videos/${id}`, { method: "DELETE" }); loadVideos(); } catch (er) { alert(er.message); }
};

/* owner photo */
async function loadOwner() {
  const c = await fetch("/api/config").then(r => r.json()).catch(() => ({}));
  $("ownn").value = c.ownerName || "";
  $("ownpic").src = c.ownerPhoto || ""; $("ownpic").hidden = !c.ownerPhoto;
}
$("ownf").onsubmit = async e => {
  e.preventDefault(); $("ownb").disabled = true; say($("ownm"), "Saving…", true);
  try {
    const fd = new FormData(); fd.append("ownerName", $("ownn").value);
    if ($("owni").files[0]) fd.append("image", $("owni").files[0]);
    await upload("/api/admin/owner", fd, $("ownbar"));
    $("owni").value = ""; say($("ownm"), "Saved. Your landing page is updated.", true); loadOwner();
  } catch (er) { say($("ownm"), er.message, false); }
  $("ownb").disabled = false;
};

fetch("/api/admin/me").then(r => r.ok ? showPanel() : showLogin());
