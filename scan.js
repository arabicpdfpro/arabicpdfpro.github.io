/* السكان (مسح ضوئي): كاميرا ← قص 4 أركان وتعديل الميل ← فلتر ← صفحات ← PDF */
'use strict';
const SC = { pages: [], cur: null, mode: 'crop', insertInto: false };

/* ---------- كشف حواف الورقة تلقائياً ---------- */
function scanDetect(img) {
  const k = 480 / Math.max(img.width, img.height), w = Math.round(img.width * k), h = Math.round(img.height * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.filter = 'blur(2px)'; ctx.drawImage(img, 0, 0, w, h); ctx.filter = 'none';
  const d = ctx.getImageData(0, 0, w, h).data, n = w * h, g = new Uint8Array(n);
  for (let i = 0; i < n; i++) g[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) | 0;
  // Otsu threshold
  const hist = new Array(256).fill(0); g.forEach(v => hist[v]++);
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sB = 0, wB = 0, best = 0, thr = 128, darkMean = 60;
  for (let t = 0; t < 256; t++) { wB += hist[t]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) ** 2; if (v > best) { best = v; thr = t; darkMean = mB; } }
  thr = Math.round(thr * 0.6 + darkMean * 0.4);   // أكثر تسامحاً مع الظل على الورقة
  // أكبر منطقة فاتحة (الورقة)
  const lab = new Int32Array(n).fill(-1); let bestArea = 0, bestId = -1, id = 0; const stack = new Int32Array(n);
  for (let s0 = 0; s0 < n; s0++) {
    if (lab[s0] !== -1 || g[s0] <= thr) continue;
    let sp = 0, area = 0; stack[sp++] = s0; lab[s0] = id;
    while (sp) { const p = stack[--sp]; area++; const x = p % w, y = (p / w) | 0;
      if (x > 0 && lab[p - 1] === -1 && g[p - 1] > thr) { lab[p - 1] = id; stack[sp++] = p - 1; }
      if (x < w - 1 && lab[p + 1] === -1 && g[p + 1] > thr) { lab[p + 1] = id; stack[sp++] = p + 1; }
      if (y > 0 && lab[p - w] === -1 && g[p - w] > thr) { lab[p - w] = id; stack[sp++] = p - w; }
      if (y < h - 1 && lab[p + w] === -1 && g[p + w] > thr) { lab[p + w] = id; stack[sp++] = p + w; } }
    if (area > bestArea) { bestArea = area; bestId = id; } id++;
  }
  if (bestId < 0 || bestArea < n * 0.12 || bestArea > n * 0.985) return null;
  let tl = [0, 0, 1e9], tr = [0, 0, -1e9], br = [0, 0, -1e9], bl = [0, 0, 1e9];
  for (let p = 0; p < n; p++) { if (lab[p] !== bestId) continue; const x = p % w, y = (p / w) | 0, s = x + y, df = x - y;
    if (s < tl[2]) tl = [x, y, s]; if (s > br[2]) br = [x, y, s]; if (df > tr[2]) tr = [x, y, df]; if (df < bl[2]) bl = [x, y, df]; }
  const q = [tl, tr, br, bl].map(([x, y]) => [x / k, y / k]);
  // لازم الشكل يكون رباعي معقول
  const area = Math.abs(q.reduce((a, p, i) => { const r = q[(i + 1) % 4]; return a + p[0] * r[1] - r[0] * p[1]; }, 0) / 2);
  if (area < img.width * img.height * 0.1) return null;
  return q;
}
function scanFullQuad(img, inset = 0) { const ix = img.width * inset, iy = img.height * inset; return [[ix, iy], [img.width - ix, iy], [img.width - ix, img.height - iy], [ix, img.height - iy]]; }

/* ---------- تعديل المنظور (homography) ---------- */
function solveH(src, dst) {   // يوجد مصفوفة تحول نقاط dst -> src
  const A = [], b = [];
  for (let i = 0; i < 4; i++) { const [x, y] = dst[i], [u, v] = src[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  for (let c = 0; c < 8; c++) { let piv = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
    for (let r = 0; r < 8; r++) { if (r === c) continue; const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } }
  return b.map((v, i) => v / A[i][i]).concat(1);
}
function scanWarp(img, q, maxSide = 2600) {
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  let W = Math.max(dist(q[0], q[1]), dist(q[3], q[2])), H = Math.max(dist(q[0], q[3]), dist(q[1], q[2]));
  const sc = Math.min(1.25, maxSide / Math.max(W, H)); W = Math.round(W * sc); H = Math.round(H * sc);
  const sk = Math.min(1, 3200 / Math.max(img.width, img.height));
  const sc2 = document.createElement('canvas'); sc2.width = Math.round(img.width * sk); sc2.height = Math.round(img.height * sk);
  const sctx = sc2.getContext('2d'); sctx.drawImage(img, 0, 0, sc2.width, sc2.height);
  const S = sctx.getImageData(0, 0, sc2.width, sc2.height), sd = S.data, sw = sc2.width, sh = sc2.height;
  const M = solveH(q.map(([x, y]) => [x * sk, y * sk]), [[0, 0], [W, 0], [W, H], [0, H]]);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const octx = out.getContext('2d'), O = octx.createImageData(W, H), od = O.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const z = M[6] * x + M[7] * y + 1, u = (M[0] * x + M[1] * y + M[2]) / z, v = (M[3] * x + M[4] * y + M[5]) / z;
      const x0 = Math.max(0, Math.min(sw - 2, u | 0)), y0 = Math.max(0, Math.min(sh - 2, v | 0)), fx = Math.min(1, Math.max(0, u - x0)), fy = Math.min(1, Math.max(0, v - y0));
      const i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4, o = (y * W + x) * 4;
      for (let ch = 0; ch < 3; ch++) od[o + ch] = (sd[i00 + ch] * (1 - fx) + sd[i10 + ch] * fx) * (1 - fy) + (sd[i01 + ch] * (1 - fx) + sd[i11 + ch] * fx) * fy;
      od[o + 3] = 255;
    }
  }
  octx.putImageData(O, 0, 0);
  return out;
}

/* ---------- الفلاتر ---------- */
function scanFilter(src, f) {
  const W = src.width, H = src.height, c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); ctx.drawImage(src, 0, 0);
  if (f === 'orig') return c;
  const D = ctx.getImageData(0, 0, W, H), d = D.data;
  // تقدير لون خلفية الورقة (الإضاءة) عشان نبيضها
  const bw = Math.max(8, Math.round(W / 24)), bh = Math.max(8, Math.round(H / 24));
  const b1 = document.createElement('canvas'); b1.width = bw; b1.height = bh; const b1x = b1.getContext('2d'); b1x.drawImage(src, 0, 0, bw, bh);
  const bd = b1x.getImageData(0, 0, bw, bh); const bdd = bd.data, mx = new Uint8ClampedArray(bdd.length);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) for (let ch = 0; ch < 3; ch++) { let m = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = Math.min(bw - 1, Math.max(0, x + dx)), yy = Math.min(bh - 1, Math.max(0, y + dy)); m = Math.max(m, bdd[(yy * bw + xx) * 4 + ch]); } mx[(y * bw + x) * 4 + ch] = m; }
  for (let i = 0; i < mx.length; i += 4) mx[i + 3] = 255;
  b1x.putImageData(new ImageData(mx, bw, bh), 0, 0);
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H; const bgx = bg.getContext('2d'); bgx.imageSmoothingQuality = 'high'; bgx.filter = 'blur(6px)'; bgx.drawImage(b1, 0, 0, W, H);
  const B = bgx.getImageData(0, 0, W, H).data;
  for (let i = 0; i < d.length; i += 4) {
    if (f === 'enh') {
      for (let ch = 0; ch < 3; ch++) { let v = d[i + ch] / Math.max(40, B[i + ch]); v = Math.min(1, v * 1.04); v = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v); d[i + ch] = v * 255; }   // تبييض + تباين
    } else {
      const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114, blum = B[i] * 0.299 + B[i + 1] * 0.587 + B[i + 2] * 0.114;
      const r = Math.min(1, lum / Math.max(40, blum));
      if (f === 'gray') { let v = Math.min(1, r * 1.05); v = Math.pow(v, 1.6); d[i] = d[i + 1] = d[i + 2] = v * 255; }
      else { const v = r > 0.78 ? 255 : (r < 0.6 ? 0 : (r - 0.6) / 0.18 * 255); d[i] = d[i + 1] = d[i + 2] = v; }   // أبيض وأسود
    }
  }
  ctx.putImageData(D, 0, 0);
  return c;
}
function scanRotate(canvas, deg) {
  const c = document.createElement('canvas'), sw = deg % 180 !== 0; c.width = sw ? canvas.height : canvas.width; c.height = sw ? canvas.width : canvas.height;
  const ctx = c.getContext('2d'); ctx.translate(c.width / 2, c.height / 2); ctx.rotate(deg * Math.PI / 180); ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2); return c;
}

/* ---------- الواجهة ---------- */
function scanStart(insertInto) {
  SC.insertInto = !!insertInto; SC.pages = [];
  scanCapture();
}
async function scanCapture(fromGallery) {
  const f = await pickFile(fromGallery ? 'fImg' : 'fCam'); if (!f) { if (!SC.pages.length) scanExit(); return; }
  busy(true, 'جاري تجهيز الصورة…');
  try {
    const img = await loadImg(await normalizeImage(f, 4000));
    const q = scanDetect(img) || scanFullQuad(img, 0.04);
    SC.cur = { img, q, filter: 'enh', rot: 0, warped: null };
    showScreen('scanner'); scanCropMode();
  } catch (e) { console.error(e); toast('تعذر قراءة الصورة'); } finally { busy(false); }
}
function scanExit() { showScreen(SC.insertInto ? 'organizer' : (S.pdf ? 'editor' : 'home')); }

function scanCropMode() {
  SC.mode = 'crop';
  const st = $('#scStage'); st.innerHTML = '<canvas id="scCv"></canvas><canvas id="scLoupe" class="sc-loupe hidden" width="220" height="220"></canvas>';
  $('#scTitle').textContent = `صفحة ${SC.pages.length + 1} — حدد أركان الورقة`;
  $('#scBar').innerHTML = `
    <button class="tool" id="scAuto">${icon('select')}<b>تلقائي</b></button>
    <button class="tool" id="scAll">${icon('grid')}<b>كل الصورة</b></button>
    <button class="tool" id="scRe">${icon('image')}<b>إعادة التصوير</b></button>
    <button class="tool sc-go" id="scNext">${icon('left')}<b>التالي</b></button>`;
  const cv = $('#scCv'), img = SC.cur.img;
  const fit = () => { const r = st.getBoundingClientRect(); const k = Math.min((r.width - 24) / img.width, (r.height - 24) / img.height); cv.width = Math.round(img.width * k * DPR()); cv.height = Math.round(img.height * k * DPR()); cv.style.width = img.width * k + 'px'; cv.style.height = img.height * k + 'px'; return k; };
  let k = fit();
  const draw = () => {
    const ctx = cv.getContext('2d'), s = k * DPR(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const q = SC.cur.q.map(([x, y]) => [x * s, y * s]);
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.rect(0, 0, cv.width, cv.height); ctx.moveTo(q[0][0], q[0][1]); for (let i = 3; i >= 0; i--) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath(); ctx.fill('evenodd');
    ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 2.5 * DPR(); ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke();
    q.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 13 * DPR(), 0, 7); ctx.fillStyle = 'rgba(46,204,113,.35)'; ctx.fill(); ctx.lineWidth = 3 * DPR(); ctx.strokeStyle = '#fff'; ctx.stroke(); });
  };
  draw();
  let drag = -1;
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
  const loupe = (p, e) => {
    const L = $('#scLoupe'); L.classList.remove('hidden'); const lx = L.getContext('2d'), z = 2.5, R = 110;
    lx.clearRect(0, 0, 220, 220); lx.save(); lx.beginPath(); lx.arc(R, R, R, 0, 7); lx.clip();
    lx.drawImage(img, p[0] - R / (k * z) , p[1] - R / (k * z), 2 * R / (k * z), 2 * R / (k * z), 0, 0, 220, 220);
    lx.strokeStyle = '#2ecc71'; lx.lineWidth = 2; lx.beginPath(); lx.moveTo(R - 14, R); lx.lineTo(R + 14, R); lx.moveTo(R, R - 14); lx.lineTo(R, R + 14); lx.stroke(); lx.restore();
    const r = $('#scStage').getBoundingClientRect(); L.style.left = (e.clientX - r.left < r.width / 2 ? r.width - 130 : 10) + 'px'; L.style.top = '10px';
  };
  cv.onpointerdown = e => { const p = pt(e); let bd = 1e9; SC.cur.q.forEach((c, i) => { const dd = Math.hypot(c[0] - p[0], c[1] - p[1]) * k; if (dd < bd) { bd = dd; drag = i; } }); if (bd > 60) { drag = -1; return; } cv.setPointerCapture(e.pointerId); loupe(SC.cur.q[drag], e); };
  cv.onpointermove = e => { if (drag < 0) return; const p = pt(e); p[0] = clamp(p[0], 0, img.width); p[1] = clamp(p[1], 0, img.height); SC.cur.q[drag] = p; draw(); loupe(p, e); };
  cv.onpointerup = cv.onpointercancel = () => { drag = -1; $('#scLoupe').classList.add('hidden'); };
  $('#scAuto').onclick = () => { const q = scanDetect(img); if (q) { SC.cur.q = q; draw(); } else toast('مقدرتش ألاقي حواف الورقة — حرّك الأركان بإيدك'); };
  $('#scAll').onclick = () => { SC.cur.q = scanFullQuad(img); draw(); };
  $('#scRe').onclick = () => scanCapture();
  $('#scNext').onclick = async () => { busy(true, 'جاري تعديل الصفحة…'); await new Promise(r => setTimeout(r, 30)); try { SC.cur.warped = scanWarp(img, SC.cur.q); } finally { busy(false); } scanFilterMode(); };
  SC.onResize = () => { k = fit(); draw(); };
}
function scanFilterMode() {
  SC.mode = 'filter';
  $('#scTitle').textContent = `صفحة ${SC.pages.length + 1} — اختار الشكل`;
  const st = $('#scStage'); st.innerHTML = '<img id="scRes" class="sc-res">';
  const FILTERS = [['orig', 'الأصلي'], ['enh', 'محسّن'], ['gray', 'رمادي'], ['bw', 'أبيض وأسود']];
  $('#scBar').innerHTML = `<div class="sc-filters">${FILTERS.map(([k, n]) => `<button class="chip" data-f="${k}">${n}</button>`).join('')}</div>
    <div class="sc-row"><button class="tool" id="scBack">${icon('right')}<b>القص</b></button><button class="tool" id="scRot">${icon('rotate')}<b>تدوير</b></button><button class="tool sc-go" id="scOk">${icon('save')}<b>تم</b></button></div>`;
  const render = () => {
    busy(true, 'جاري التطبيق…');
    setTimeout(() => { try { let c = scanFilter(SC.cur.warped, SC.cur.filter); if (SC.cur.rot) c = scanRotate(c, SC.cur.rot); SC.cur.out = c; $('#scRes').src = c.toDataURL('image/jpeg', 0.8); } finally { busy(false); } $$('.sc-filters .chip').forEach(b => b.classList.toggle('on', b.dataset.f === SC.cur.filter)); }, 30);
  };
  $$('.sc-filters .chip').forEach(b => b.onclick = () => { SC.cur.filter = b.dataset.f; render(); });
  $('#scBack').onclick = () => scanCropMode();
  $('#scRot').onclick = () => { SC.cur.rot = (SC.cur.rot + 90) % 360; render(); };
  $('#scOk').onclick = () => { SC.pages.push({ src: SC.cur.out.toDataURL('image/jpeg', 0.92), w: SC.cur.out.width, h: SC.cur.out.height }); SC.cur = null; scanSessionMode(); };
  SC.onResize = null;
  render();
}
function scanSessionMode() {
  SC.mode = 'session';
  $('#scTitle').textContent = `${SC.pages.length} صفحة متصورة`;
  const st = $('#scStage'); st.innerHTML = '<div class="sc-grid" id="scGrid"></div>';
  SC.pages.forEach((pg, i) => {
    const d = document.createElement('div'); d.className = 'sc-th'; d.innerHTML = `<img src="${pg.src}"><span class="n">${i + 1}</span><button class="x">×</button>`;
    d.querySelector('.x').onclick = () => { SC.pages.splice(i, 1); if (!SC.pages.length) scanCapture(); else scanSessionMode(); };
    $('#scGrid').appendChild(d);
  });
  $('#scBar').innerHTML = `
    <button class="tool" id="scAddCam">${icon('plus')}<b>صفحة جديدة</b></button>
    <button class="tool" id="scAddGal">${icon('image')}<b>من المعرض</b></button>
    <button class="tool sc-go" id="scSave">${icon('save')}<b>${SC.insertInto ? 'إضافة للملف' : 'حفظ PDF'}</b></button>`;
  $('#scAddCam').onclick = () => scanCapture();
  $('#scAddGal').onclick = () => scanCapture(true);
  $('#scSave').onclick = scanFinish;
}
async function scanPagesInto(doc, pos) {
  let k = 0;
  for (const pg of SC.pages) {
    const im = await doc.embedJpg(await dataUrlToBytes(pg.src));
    // مقاس الصفحة: عرض A4 والطول حسب الورقة المتصورة
    const W = 595.28, H = W * pg.h / pg.w;
    const page = pos == null ? doc.addPage([W, H]) : doc.insertPage(pos + k, [W, H]);
    page.drawImage(im, { x: 0, y: 0, width: W, height: H }); k++;
  }
  return k;
}
async function scanFinish() {
  busy(true, 'جاري عمل الـ PDF…');
  try {
    if (SC.insertInto) {
      const doc = await loadLib(); const pos = insertPos(); const k = await scanPagesInto(doc, pos);
      const ids = S.pageIds.slice(); ids.splice(pos, 0, ...Array.from({ length: k }, uid));
      showScreen('organizer'); await applyStructure(doc, ids); toast(`تمت إضافة ${k} صفحة`);
    } else {
      const doc = await PDFDocument.create(); await scanPagesInto(doc);
      const d = new Date(), nm = `سكان ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.pdf`;
      if (N) N.newDocument();
      await openDocument(await doc.save(), nm); S.dirty = true;
      busy(false); saveDoc(false);   // اسأله يحفظه فين
    }
    SC.pages = [];
  } catch (e) { console.error(e); toast('حدث خطأ'); } finally { busy(false); }
}
window.addEventListener('resize', () => { if (SC.onResize && curScreen() === 'scanner') setTimeout(SC.onResize, 120); });
