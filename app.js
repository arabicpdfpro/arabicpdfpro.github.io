/* Arabic PDF Pro (by MOHENDI) — تطبيق تعديل ملفات PDF بدعم كامل للعربية */
'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
const { PDFDocument, degrees } = PDFLib;
const N = window.Android || null;   // جسر أندرويد (غير موجود في المتصفح)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const DPR = () => Math.min(window.devicePixelRatio || 1, 3);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- أيقونات ---------------- */
const ICONS = {
  back: '<path d="M9 5l7 7-7 7"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="5"/>',
  select: '<path d="M6 3l12 9-5.5 1.2L15 19l-2.4 1.2-2.6-5.6L6 18z"/>',
  text: '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/>',
  pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  highlight: '<path d="M4 20h7"/><path d="M8 16l-2-2 9-9 4 4-9 9z"/><path d="M6 14l-2 4 4-2"/>',
  shapes: '<rect x="3.5" y="10" width="9" height="9" rx="1"/><circle cx="16" cy="8" r="4.5"/>',
  eraser: '<path d="M8 20h12"/><path d="M4 15l9-9 6 6-7 7H8z"/><path d="M9 10l6 6"/>',
  sign: '<path d="M3 16c2.5-5 4.5-8 6-6.5S7 16 9 16.5s3-5 5-4.5 1 4 3 3.5 2-2 4-2"/><path d="M3 20h18"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3 3-2.5 4 3.5"/>',
  stamp: '<path d="M9 3.5h6l-.8 6.5h3.8a2 2 0 012 2V15H5v-3a2 2 0 012-2h3.8z"/><path d="M5 19h14"/>',
  note: '<path d="M4 4h16v12H10l-6 4z"/><path d="M8 9h8M8 12h5"/>',
  date: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  filePlus: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14h6"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  share: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7h14v-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  rotate: '<path d="M20 12a8 8 0 11-2.3-5.7"/><path d="M20 4v5h-5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  goto: '<path d="M5 12h12"/><path d="M13 7l5 5-5 5"/><path d="M4 4v16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  style: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1.2"/><circle cx="14" cy="9" r="1.2"/><circle cx="15.5" cy="13" r="1.2"/>',
  front: '<rect x="8" y="8" width="11" height="11" rx="1.5"/><path d="M5 15V5h10"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
  alignR: '<path d="M4 6h16M10 10h10M6 14h14M12 18h8"/>', alignC: '<path d="M4 6h16M7 10h10M5 14h14M8 18h8"/>', alignL: '<path d="M4 6h16M4 10h10M4 14h14M4 18h8"/>',
  bold: '<path d="M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
  extract: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M12 10v7M9 14l3 3 3-3"/>',
  merge: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 14h6M12 11v6"/>',
  blank: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
  discard: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11l4 4M14 11l-4 4"/>',
  scan: '<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/><path d="M4 12h16"/>',
  hf: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 7.5h16M4 16.5h16"/><path d="M7 5.3h6M7 18.7h6"/>',
};
function icon(n) { return `<span class="ic"><svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg></span>`; }
function fillIcons(root = document) { $$('[data-ic]', root).forEach(e => { e.outerHTML = icon(e.dataset.ic); }); }

/* ---------------- ثوابت ---------------- */
const FONTS = [{"f": "Sub TNR", "n": "Times New Roman", "sub": "Tinos + نسخ", "col": "both"}, {"f": "Sub DIN Light", "n": "DIN Next Arabic فاتح", "sub": "Tajawal", "col": "both"}, {"f": "Sub DIN Bold", "n": "DIN Next Arabic عريض", "sub": "Tajawal", "col": "both"}, {"f": "Sub Arial", "n": "Arial", "sub": "Arimo + Noto Sans", "col": "both"}, {"f": "Sub Calibri", "n": "Calibri", "sub": "Carlito", "col": "en"}, {"f": "Sub Agency", "n": "Agency FB", "sub": "Antonio", "col": "en"}, {"f": "Cairo", "n": "القاهرة", "g": "عصري", "col": "ar"}, {"f": "Tajawal", "n": "تجوال", "g": "عصري", "col": "ar"}, {"f": "Almarai", "n": "المراعي", "g": "عصري", "col": "ar"}, {"f": "IBM Plex Sans Arabic", "n": "بلكس", "g": "عصري", "col": "ar"}, {"f": "Noto Sans Arabic", "n": "نوتو سانس", "g": "عصري", "col": "ar"}, {"f": "Readex Pro", "n": "ريدكس", "g": "عصري", "col": "ar"}, {"f": "Alexandria", "n": "الإسكندرية", "g": "عصري", "col": "ar"}, {"f": "Vazirmatn", "n": "وزير", "g": "عصري", "col": "ar"}, {"f": "Rubik", "n": "روبيك", "g": "عصري", "col": "ar"}, {"f": "Mada", "n": "مدى", "g": "عصري", "col": "ar"}, {"f": "Zain", "n": "زين", "g": "عصري", "col": "ar"}, {"f": "Baloo Bhaijaan 2", "n": "بالو", "g": "عصري", "col": "ar"}, {"f": "Changa", "n": "تشانجا", "g": "عصري", "col": "ar"}, {"f": "El Messiri", "n": "المسيري", "g": "عصري", "col": "ar"}, {"f": "Lemonada", "n": "ليمونادة", "g": "عصري", "col": "ar"}, {"f": "Harmattan", "n": "هرمتان", "g": "عصري", "col": "ar"}, {"f": "Amiri", "n": "أميري", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Noto Naskh Arabic", "n": "نسخ", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Scheherazade New", "n": "شهرزاد", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Markazi Text", "n": "مركزي", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Lateef", "n": "لطيف", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Mirza", "n": "ميرزا", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Noto Nastaliq Urdu", "n": "نستعليق", "g": "نسخ وتقليدي", "col": "ar"}, {"f": "Aref Ruqaa", "n": "رقعة", "g": "رقعة وخط يد", "col": "ar"}, {"f": "Alkalami", "n": "القلمي", "g": "رقعة وخط يد", "col": "ar"}, {"f": "Gulzar", "n": "جلزار", "g": "رقعة وخط يد", "col": "ar"}, {"f": "Noto Kufi Arabic", "n": "كوفي", "g": "كوفي", "col": "ar"}, {"f": "Reem Kufi", "n": "ريم كوفي", "g": "كوفي", "col": "ar"}, {"f": "Reem Kufi Fun", "n": "ريم كوفي فن", "g": "كوفي", "col": "ar"}, {"f": "Kufam", "n": "كوفام", "g": "كوفي", "col": "ar"}, {"f": "Lalezar", "n": "لاله‌زار", "g": "عناوين وزخرفي", "col": "ar"}, {"f": "Rakkas", "n": "ركاس", "g": "عناوين وزخرفي", "col": "ar"}, {"f": "Jomhuria", "n": "جمهورية", "g": "عناوين وزخرفي", "col": "ar"}, {"f": "Katibeh", "n": "كاتبة", "g": "عناوين وزخرفي", "col": "ar"}, {"f": "Marhey", "n": "مرحي", "g": "رقعة وخط يد", "col": "ar"}, {"f": "Vibes", "n": "فايبز", "g": "عناوين وزخرفي", "col": "ar"}, {"f": "Blaka", "n": "بلاكا", "g": "عناوين وزخرفي", "col": "ar"}, {"f": "Playpen Sans Arabic", "n": "بلاي بن", "g": "عصري", "col": "ar"}, {"f": "Cousine", "n": "Courier (Cousine)", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Gelasio", "n": "Georgia (Gelasio)", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Roboto", "n": "Roboto", "g": "إنجليزي عصري", "col": "en"}, {"f": "Open Sans", "n": "Open Sans", "g": "إنجليزي عصري", "col": "en"}, {"f": "Lato", "n": "Lato", "g": "إنجليزي عصري", "col": "en"}, {"f": "Montserrat", "n": "Montserrat", "g": "إنجليزي عصري", "col": "en"}, {"f": "Poppins", "n": "Poppins", "g": "إنجليزي عصري", "col": "en"}, {"f": "Inter", "n": "Inter", "g": "إنجليزي عصري", "col": "en"}, {"f": "Nunito", "n": "Nunito", "g": "إنجليزي عصري", "col": "en"}, {"f": "Oswald", "n": "Oswald", "g": "إنجليزي عصري", "col": "en"}, {"f": "Raleway", "n": "Raleway", "g": "إنجليزي عصري", "col": "en"}, {"f": "Ubuntu", "n": "Ubuntu", "g": "إنجليزي عصري", "col": "en"}, {"f": "Merriweather", "n": "Merriweather", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Playfair Display", "n": "Playfair Display", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "EB Garamond", "n": "Garamond", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Libre Baskerville", "n": "Baskerville", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "PT Serif", "n": "PT Serif", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Crimson Text", "n": "Crimson Text", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Roboto Mono", "n": "Roboto Mono", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Courier Prime", "n": "Courier Prime", "g": "إنجليزي كلاسيكي", "col": "en"}, {"f": "Dancing Script", "n": "Dancing Script", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Great Vibes", "n": "Great Vibes", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Pacifico", "n": "Pacifico", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Caveat", "n": "Caveat", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Lobster", "n": "Lobster", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Satisfy", "n": "Satisfy", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Allura", "n": "Allura", "g": "إنجليزي يدوي", "col": "en"}, {"f": "Sacramento", "n": "Sacramento", "g": "إنجليزي يدوي", "col": "en"}];
const FONT_GROUPS = ["عصري", "نسخ وتقليدي", "رقعة وخط يد", "كوفي", "عناوين وزخرفي", "إنجليزي عصري", "إنجليزي كلاسيكي", "إنجليزي يدوي"];
const fontReady = f => document.fonts.load(`400 20px "${f}"`, "أبجد abc").then(() => document.fonts.load(`700 20px "${f}"`, "أبجد abc")).catch(() => {});
const COLORS = ['#000000', '#1f3a93', '#c0392b', '#0e7c61', '#7d3c98', '#d35400', '#7f8c8d', '#ffffff'];
const HL_COLORS = ['#ffeb3b', '#a5d64c', '#4fc3f7', '#f48fb1', '#ffb74d'];
const STAMP_COLORS = ['#1f3a93', '#c0392b', '#0e7c61', '#000000', '#7d3c98'];

/* ---------------- الحالة ---------------- */
const S = {
  bytes: null, pdf: null, name: 'مستند.pdf', pageIds: [], pages: [], annots: {}, assets: {}, imgs: {},
  zoom: 1, tool: 'select', sel: null, dirty: false, undo: [], redo: [], cur: 0,
  pen: { color: '#1f3a93', width: 2.5, opacity: 1 },
  hl: { color: '#ffeb3b' },
  shape: { kind: 'rect', color: '#c0392b', width: 2, fill: null },
  text: { font: 'Sub TNR', size: 16, color: '#000000', bg: null, align: 'right', bold: false, opacity: 1 },
  textCache: {}, search: { results: [], i: -1, q: '' },
};

/* ---------------- أدوات مساعدة ---------------- */
let toastT;
function toast(m, ms = 2200) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms); }
function busy(on, txt) { $('#busy').classList.toggle('hidden', !on); if (txt) $('#busyText').textContent = txt; }
function bytesToB64(u8) { let s = ''; const C = 0x8000; for (let i = 0; i < u8.length; i += C) s += String.fromCharCode.apply(null, u8.subarray(i, i + C)); return btoa(s); }
async function dataUrlToBytes(d) { return new Uint8Array(await (await fetch(d)).arrayBuffer()); }
function readFile(f, asData) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(asData ? r.result : new Uint8Array(r.result)); r.onerror = rej; asData ? r.readAsDataURL(f) : r.readAsArrayBuffer(f); }); }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function pickFile(id, multiple) {
  return new Promise(res => {
    const inp = $('#' + id); inp.value = '';
    const h = () => { inp.removeEventListener('change', h); res(multiple ? Array.from(inp.files) : inp.files[0]); };
    inp.addEventListener('change', h); inp.click();
  });
}
const isRTL = s => /[֐-ࣿיִ-ﻼ]/.test(s) && (s.match(/[֐-ࣿיִ-ﻼ]/g) || []).length >= (s.match(/[A-Za-z]/g) || []).length;
function baseName(n) { return n.replace(/\.pdf$/i, ''); }
function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' م.ب' : Math.round(b / 1024) + ' ك.ب'; }
function todayStr(kind) {
  const d = new Date(), y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate();
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const ar = s => String(s).replace(/\d/g, c => '٠١٢٣٤٥٦٧٨٩'[c]);
  if (kind === 'ar') return ar(`${dd}/${m}/${y}`);
  if (kind === 'long') return `${dd} ${months[m - 1]} ${y}`;
  return `${y}/${String(m).padStart(2, '0')}/${String(dd).padStart(2, '0')}`;
}

/* ---------------- المكتبة (تواقيع وأختام) ---------------- */
const Lib = {
  get() { try { return JSON.parse(localStorage.getItem('lib') || '[]'); } catch (e) { return []; } },
  set(a) { try { localStorage.setItem('lib', JSON.stringify(a)); return true; } catch (e) { toast('مساحة الحفظ ممتلئة'); return false; } },
  add(type, src) { const a = this.get(); a.unshift({ id: uid(), type, src }); this.set(a); },
  del(id) { this.set(this.get().filter(x => x.id !== id)); },
};

/* ================= تحميل المستند ================= */
async function openDocument(bytes, name) {
  busy(true, 'جاري فتح الملف…');
  try {
    const pdf = await pdfjsLib.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
    if (S.pdf) S.pdf.destroy();
    Object.assign(S, { bytes, pdf, name: name || 'مستند.pdf', annots: {}, assets: {}, imgs: {}, undo: [], redo: [], dirty: false, sel: null, zoom: 1, textCache: {}, cur: 0 });
    S.pageIds = Array.from({ length: pdf.numPages }, uid);
    showScreen('editor');
    $('#docTitle').textContent = S.name;
    setTool('select');
    await buildPages();
    $('#viewer').scrollTop = 0;
    updateUndo();
  } catch (e) {
    console.error(e);
    toast(e && e.name === 'PasswordException' ? 'الملف محمي بكلمة مرور — غير مدعوم حالياً' : 'تعذر فتح الملف');
  } finally { busy(false); }
}

async function reloadBytes(bytes, keepScroll = true) {
  const st = $('#viewer').scrollTop;
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
  if (S.pdf) S.pdf.destroy();
  S.pdf = pdf; S.bytes = bytes; S.textCache = {};
  await buildPages();
  if (keepScroll) $('#viewer').scrollTop = st;
}

let observer;
async function buildPages() {
  S.pages = [];
  for (let i = 0; i < S.pdf.numPages; i++) {
    const pg = await S.pdf.getPage(i + 1);
    const vp = pg.getViewport({ scale: 1 });
    S.pages.push({ id: S.pageIds[i], index: i, w: vp.width, h: vp.height, el: null, rs: 0 });
  }
  layout();
}

function baseScale() {
  const vw = Math.min($('#viewer').clientWidth - 16, 980);   // على الشاشات الكبيرة متكبرش الصفحة زيادة
  const maxW = Math.max(...S.pages.map(p => p.w), 1);
  return vw / maxW;
}
function scale() { return baseScale() * S.zoom; }

function layout() {
  const box = $('#pages'); box.innerHTML = '';
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) renderPage(S.pages[+en.target.dataset.i]); }), { root: $('#viewer'), rootMargin: '600px 0px' });
  const s = scale();
  S.pages.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'page'; d.dataset.i = i;
    d.style.width = p.w * s + 'px'; d.style.height = p.h * s + 'px';
    d.innerHTML = `<div class="overlay"></div>`;
    p.el = d; p.rs = 0;
    box.appendChild(d);
    bindOverlay(p);
    renderOverlay(p);
    observer.observe(d);
  });
  updateBadge();
}

async function renderPage(p) {
  const s = scale();
  if (!p || p.rs === s) return;
  p.rs = s;
  const pg = await S.pdf.getPage(p.index + 1);
  let rs = s * DPR();
  const maxPx = 1e7;
  if (p.w * p.h * rs * rs > maxPx) rs = Math.sqrt(maxPx / (p.w * p.h));
  const vp = pg.getViewport({ scale: rs });
  const c = document.createElement('canvas');
  c.className = 'pdfc'; c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
  try {
    await pg.render({ canvasContext: c.getContext('2d'), viewport: vp, annotationMode: pdfjsLib.AnnotationMode.ENABLE_FORMS }).promise;
  } catch (e) { console.warn(e); return; }
  if (p.rs !== s || !p.el) return;
  const old = p.el.querySelector('canvas.pdfc');
  if (old) old.replaceWith(c); else p.el.insertBefore(c, p.el.firstChild);
}

function updateBadge() {
  const v = $('#viewer'), mid = v.scrollTop + v.clientHeight / 3;
  let cur = 0;
  S.pages.forEach((p, i) => { if (p.el && p.el.offsetTop * S.pz <= mid) cur = i; });
  S.cur = cur;
  const b = $('#pageBadge');
  b.textContent = `${cur + 1} من ${S.pages.length}`;
  b.style.opacity = 1; clearTimeout(b._t); b._t = setTimeout(() => b.style.opacity = .35, 1500);
}
S.pz = 1;

/* ================= العناصر (الشروح) ================= */
const mctx = document.createElement('canvas').getContext('2d');
function fontStr(o, size) { return `${o.bold ? 700 : 400} ${size}px "${o.font}", "Cairo"`; }
function lineH(o) { return o.size * (/Nastaliq/.test(o.font) ? 2.0 : /Sub TNR|Amiri|Lateef|Naskh|Scheherazade|Markazi|Mirza|Aref|Gulzar|Alkalami|Harmattan/.test(o.font) ? 1.55 : 1.35); }
// ارتفاع الحروف الفعلي للخط (من غير المسافات الفاضية اللي فوق وتحت الخط) — عشان الصندوق يبقى على قد الكلام
const INK = {};
function inkOf(o) {
  const key = o.font + '|' + (o.bold ? 1 : 0);
  if (INK[key]) return INK[key];
  mctx.font = fontStr({ font: o.font, bold: o.bold }, 100);
  const m = mctx.measureText('Hdgjlpyأإلجيبك');
  let v;
  if (m.actualBoundingBoxAscent == null) v = { a: 0.95, d: 0.35, fa: 1.1, fd: 0.4 };
  else v = { a: Math.max(0.7, m.actualBoundingBoxAscent / 100), d: Math.max(0.2, m.actualBoundingBoxDescent / 100), fa: (m.fontBoundingBoxAscent || 110) / 100, fd: (m.fontBoundingBoxDescent || 40) / 100 };
  try { if (document.fonts.check(mctx.font)) INK[key] = v; } catch (e) { INK[key] = v; }
  return v;
}
// لو الكلام بقى أكبر من الصندوق، كبّر الصندوق بدل ما يتقص الكلام
function fitBox(o) {
  if (o.type !== 'text' || !o.text || !o.text.trim()) return;
  const m = textMetrics(o);
  if (o.bw != null && m.nw > o.bw + 0.01) {
    const grow = m.nw - o.bw;
    if (o.align === 'left') { } else if (o.align === 'center') o.x -= grow / 2; else o.x -= grow;
    o.bw = m.nw;
  }
  // الارتفاع يزيد بس لو فيه سطور زيادة — عشان المربع ما يغطيش السطر اللي فوق واللي تحت
  if (o.bh != null && m.lines.length > 1 && m.nh > o.bh + 0.01) { o.y -= (m.nh - o.bh) / 2; o.bh = m.nh; }
}
function textMetrics(o) {
  const ink = inkOf(o);
  mctx.font = fontStr(o, o.size);
  const lines = (o.text || ' ').split('\n');
  const padX = o.bg ? o.size * 0.15 : o.size * 0.08, padY = o.size * 0.04;
  let asc = ink.a * o.size, des = ink.d * o.size, w = 0;
  lines.forEach(l => {
    const mm = mctx.measureText(l || ' '); w = Math.max(w, mm.width);
    if (l.trim() && mm.actualBoundingBoxAscent != null) { asc = Math.max(asc, mm.actualBoundingBoxAscent); des = Math.max(des, mm.actualBoundingBoxDescent); }
  });
  const lh = lineH(o);
  const nw = Math.max(w + padX * 2, o.size * 0.5), nh = asc + des + (lines.length - 1) * lh + padY * 2;
  return { lines, pad: padX, padX, padY, asc, des, lh, ink, nw, nh, w: o.bw != null ? Math.max(o.bw, 1) : nw, h: o.bh != null ? Math.max(o.bh, 1) : nh };
}
function bbox(o) {
  switch (o.type) {
    case 'text': { const m = textMetrics(o); return { x: o.x, y: o.y, w: m.w, h: m.h }; }
    case 'ink': {
      let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
      o.pts.forEach(([x, y]) => { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); });
      const p = o.width / 2 + 1; return { x: x1 - p, y: y1 - p, w: x2 - x1 + 2 * p, h: y2 - y1 + 2 * p };
    }
    case 'shape': if (o.kind === 'line' || o.kind === 'arrow') {
      const p = o.width * 3 + 2, x1 = Math.min(o.x, o.x + o.w), y1 = Math.min(o.y, o.y + o.h);
      return { x: x1 - p, y: y1 - p, w: Math.abs(o.w) + 2 * p, h: Math.abs(o.h) + 2 * p };
    } return { x: o.x, y: o.y, w: o.w, h: o.h };
    case 'note': return { x: o.x, y: o.y, w: 22, h: 22 };
    default: return { x: o.x, y: o.y, w: o.w, h: o.h };
  }
}

function drawObj(ctx, o, noText) {
  ctx.save();
  ctx.globalAlpha = o.opacity == null ? 1 : o.opacity;
  if (o.type === 'text') {
    const m = textMetrics(o), lh = m.lh;
    if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(o.x, o.y, m.w, m.h); }
    if (noText) { ctx.restore(); return; }
    ctx.beginPath(); ctx.rect(o.x, o.y, m.w, m.h); ctx.clip();
    const oy = (m.h - m.nh) / 2;   // توسيط النص رأسياً داخل الصندوق
    ctx.fillStyle = o.color; ctx.font = fontStr(o, o.size); ctx.textBaseline = 'alphabetic';
    m.lines.forEach((l, i) => {
      const rtl = isRTL(l) || (!/[A-Za-z0-9]/.test(l));
      ctx.direction = rtl ? 'rtl' : 'ltr';
      const al = o.align;
      let x;
      if (al === 'center') { ctx.textAlign = 'center'; x = o.x + m.w / 2; }
      else if (al === 'left') { ctx.textAlign = rtl ? 'end' : 'start'; x = o.x + m.pad; }
      else { ctx.textAlign = rtl ? 'start' : 'end'; x = o.x + m.w - m.pad; }
      ctx.fillText(l, x, o.y + oy + m.padY + m.asc + lh * i);
    });
  } else if (o.type === 'ink') {
    ctx.strokeStyle = o.color; ctx.lineWidth = o.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = o.pts; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    if (p.length === 1) ctx.lineTo(p[0][0] + 0.01, p[0][1]);
    for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my); }
    if (p.length > 1) ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
    ctx.stroke();
  } else if (o.type === 'hl') {
    ctx.globalAlpha = 0.38; ctx.fillStyle = o.color; ctx.fillRect(o.x, o.y, o.w, o.h);
  } else if (o.type === 'shape') {
    ctx.strokeStyle = o.color; ctx.lineWidth = o.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.kind === 'rect') { if (o.fill) { ctx.fillStyle = o.fill; ctx.fillRect(o.x, o.y, o.w, o.h); } if (o.width > 0 && o.color) ctx.strokeRect(o.x + o.width / 2, o.y + o.width / 2, o.w - o.width, o.h - o.width); }
    else if (o.kind === 'ellipse') { ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, Math.max(1, o.w / 2 - o.width / 2), Math.max(1, o.h / 2 - o.width / 2), 0, 0, 7); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } ctx.stroke(); }
    else {
      const x2 = o.x + o.w, y2 = o.y + o.h;
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(x2, y2); ctx.stroke();
      if (o.kind === 'arrow') {
        const a = Math.atan2(o.h, o.w), L = 6 + o.width * 3;
        ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45));
        ctx.moveTo(x2, y2); ctx.lineTo(x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45)); ctx.stroke();
      }
    }
  } else if (o.type === 'note') {
    ctx.fillStyle = o.color || '#ffc107'; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(o.x + 2, o.y + 2); ctx.lineTo(o.x + 20, o.y + 2); ctx.lineTo(o.x + 20, o.y + 15); ctx.lineTo(o.x + 9, o.y + 15); ctx.lineTo(o.x + 4, o.y + 20); ctx.lineTo(o.x + 4, o.y + 15); ctx.lineTo(o.x + 2, o.y + 15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.moveTo(o.x + 6, o.y + 7); ctx.lineTo(o.x + 16, o.y + 7); ctx.moveTo(o.x + 6, o.y + 10.5); ctx.lineTo(o.x + 13, o.y + 10.5); ctx.stroke();
  }
  ctx.restore();
}

function objCanvas(o, k, noText) {
  const b = bbox(o);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(b.w * k)); c.height = Math.max(1, Math.ceil(b.h * k));
  const ctx = c.getContext('2d');
  ctx.scale(c.width / b.w, c.height / b.h); ctx.translate(-b.x, -b.y);
  drawObj(ctx, o, noText);
  return c;
}

const annotsOf = id => (S.annots[id] = S.annots[id] || []);
function findObj(pid, oid) { return annotsOf(pid).find(o => o.id === oid); }

function renderOverlay(p) {
  if (!p.el) return;
  const ov = p.el.querySelector('.overlay');
  $$('.obj', ov).forEach(e => e.remove());
  annotsOf(p.id).forEach(o => ov.appendChild(makeObjEl(p, o)));
}

function makeObjEl(p, o) {
  const s = scale(), b = bbox(o);
  const el = document.createElement('div');
  el.className = 'obj'; el.dataset.id = o.id;
  Object.assign(el.style, { left: b.x * s + 'px', top: b.y * s + 'px', width: b.w * s + 'px', height: b.h * s + 'px' });
  if (o.type === 'image') {
    const im = document.createElement('img'); im.src = S.assets[o.asset]; im.style.opacity = o.opacity == null ? 1 : o.opacity; el.appendChild(im);
  } else el.appendChild(objCanvas(o, s * DPR(), S.editingId === o.id));
  if (S.editingId === o.id) { el.style.pointerEvents = 'none'; el.classList.add('editing'); }
  const isSel = S.sel && S.sel.oid === o.id;
  if (isSel) {
    el.classList.add('sel');
    if (o.type !== 'note') { const h = document.createElement('div'); h.className = 'handle'; el.appendChild(h); bindResize(p, o, el, h); }
    if (o.type === 'text' || o.type === 'hl' || (o.type === 'shape' && (o.kind === 'rect' || o.kind === 'ellipse')) || o.type === 'image') ['w', 'h'].forEach(ax => { const h = document.createElement('div'); h.className = 'handle edge-' + ax; el.appendChild(h); bindEdge(p, o, el, h, ax); });
  }
  bindObjDrag(p, o, el);
  return el;
}

/* ---------------- التراجع ---------------- */
function snapshot() { return JSON.stringify(S.annots); }
function pushUndo() { S.undo.push(snapshot()); if (S.undo.length > 60) S.undo.shift(); S.redo = []; S.dirty = true; updateUndo(); }
function updateUndo() { $('#tbUndo').disabled = !S.undo.length; $('#tbRedo').disabled = !S.redo.length; }
function undo() { if (!S.undo.length) return; S.redo.push(snapshot()); S.annots = JSON.parse(S.undo.pop()); afterHistory(); }
function redo() { if (!S.redo.length) return; S.undo.push(snapshot()); S.annots = JSON.parse(S.redo.pop()); afterHistory(); }
function afterHistory() { S.sel = null; S.dirty = true; S.pages.forEach(renderOverlay); updateSelbar(); updateUndo(); }

/* ---------------- التحديد ---------------- */
function select(pid, oid) {
  const prev = S.sel; S.sel = oid ? { pid, oid } : null;
  if (prev && prev.pid !== pid) { const pp = S.pages.find(x => x.id === prev.pid); if (pp) renderOverlay(pp); }
  const p = S.pages.find(x => x.id === pid); if (p) renderOverlay(p);
  updateSelbar();
}
function deselect() { if (!S.sel) return; const pid = S.sel.pid; S.sel = null; const p = S.pages.find(x => x.id === pid); if (p) renderOverlay(p); updateSelbar(); }
function selObj() { return S.sel ? findObj(S.sel.pid, S.sel.oid) : null; }
function selPage() { return S.sel ? S.pages.find(p => p.id === S.sel.pid) : null; }

function updateSelbar() {
  const bar = $('#selbar'), o = selObj();
  if (!o) { bar.classList.add('hidden'); return; }
  const btns = [];
  if (o.type === 'text') btns.push(['edit', 'تحرير', () => openTextSheet(o, selPage())]);
  if (o.type === 'note') btns.push(['edit', 'تحرير', () => openNoteSheet(o, selPage())]);
  if (['text', 'ink', 'shape', 'hl', 'image', 'note'].includes(o.type)) btns.push(['style', 'النمط', () => openStyleSheet(o)]);
  btns.push(['copy', 'نسخ', () => { S.clip = { json: JSON.stringify(o), asset: o.asset ? S.assets[o.asset] : null }; toast('تم النسخ — اضغط على أي مكان واختر لصق'); }]);
  btns.push(['plus', 'تكرار', duplicateSel]);
  btns.push(['front', 'للأمام', () => reorderSel(1)]);
  if (o.type === 'image') btns.push(['stamp', 'حفظ', () => { Lib.add('sig', S.assets[o.asset]); toast('تم الحفظ في المكتبة'); }]);
  if (S.pages.length > 1 && o.type !== 'text') btns.push(['copy', 'كل الصفحات', copyToAllPages]);
  btns.push(['trash', 'حذف', deleteSel, 'danger']);
  bar.innerHTML = '';
  btns.forEach(([ic, t, fn, cls]) => { const b = document.createElement('button'); b.innerHTML = icon(ic) + t; if (cls) b.className = cls; b.onclick = fn; bar.appendChild(b); });
  bar.classList.remove('hidden');
}
function deleteSel() { const o = selObj(); if (!o) return; pushUndo(); const arr = annotsOf(S.sel.pid); arr.splice(arr.indexOf(o), 1); const p = selPage(); S.sel = null; renderOverlay(p); updateSelbar(); }
function duplicateSel() {
  const o = selObj(); if (!o) return; pushUndo();
  const c = JSON.parse(JSON.stringify(o)); c.id = uid(); moveObj(c, 12, 12);
  annotsOf(S.sel.pid).push(c); select(S.sel.pid, c.id);
}
function reorderSel(d) { const o = selObj(); if (!o) return; pushUndo(); const a = annotsOf(S.sel.pid); a.splice(a.indexOf(o), 1); d > 0 ? a.push(o) : a.unshift(o); renderOverlay(selPage()); toast(d > 0 ? 'تم النقل للأمام' : 'تم النقل للخلف'); }

function moveObj(o, dx, dy) {
  if (o.type === 'ink') o.pts = o.pts.map(([x, y]) => [x + dx, y + dy]);
  else { o.x += dx; o.y += dy; }
}

function bindObjDrag(p, o, el) {
  el.addEventListener('pointerdown', e => {
    if (S.tool === 'eraser') { if (o.type === 'ink') { e.stopPropagation(); } return; }
    if (!['select', 'text'].includes(S.tool)) return;
    if (e.target.classList.contains('handle')) return;
    e.stopPropagation(); e.preventDefault();
    const s = scale(), sx = e.clientX, sy = e.clientY, l0 = parseFloat(el.style.left), t0 = parseFloat(el.style.top);
    let moved = false;
    el.setPointerCapture(e.pointerId);
    p.el.style.zIndex = 6;   // يفضل ظاهر فوق الصفحات التانية وإنت بتسحبه
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) { moved = true; if (!(S.sel && S.sel.oid === o.id)) { S.sel = { pid: p.id, oid: o.id }; el.classList.add('sel'); } }
      el.style.left = l0 + dx + 'px'; el.style.top = t0 + dy + 'px';
    };
    const up = ev => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      p.el.style.zIndex = '';
      if (moved) {
        pushUndo();
        // لو اتساب فوق صفحة تانية، انقله للصفحة دي
        const er = el.getBoundingClientRect(), cx = er.left + er.width / 2, cy = er.top + er.height / 2;
        const tp = S.pages.find(q => { if (!q.el || q === p) return false; const r = q.el.getBoundingClientRect(); return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom; });
        if (tp) {
          const tr = tp.el.getBoundingClientRect(), ts = tr.width / tp.w, b = bbox(o);
          moveObj(o, (er.left - tr.left) / ts - b.x, (er.top - tr.top) / ts - b.y);
          const arr = annotsOf(p.id); arr.splice(arr.indexOf(o), 1); annotsOf(tp.id).push(o);
          renderOverlay(p); select(tp.id, o.id);
        } else { moveObj(o, (ev.clientX - sx) / s, (ev.clientY - sy) / s); select(p.id, o.id); }
      } else {
        const already = S.sel && S.sel.oid === o.id;
        if (already && o.type === 'text') openTextSheet(o, p);
        else if (already && o.type === 'note') openNoteSheet(o, p);
        else select(p.id, o.id);
      }
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}

function bindResize(p, o, el, h) {
  h.addEventListener('pointerdown', e => {
    e.stopPropagation(); e.preventDefault();
    h.setPointerCapture(e.pointerId);
    const s = scale(), b = bbox(o), sx = e.clientX, sy = e.clientY;
    const W0 = b.w * s, H0 = b.h * s, L0 = b.x * s;
    const keepAspect = ['text', 'image', 'ink'].includes(o.type);
    let nw = W0, nh = H0;
    const mv = ev => {
      const dx = sx - ev.clientX, dy = ev.clientY - sy;  // المقبض في الركن الأيسر السفلي
      nw = Math.max(3, W0 + dx); nh = keepAspect ? nw * H0 / W0 : Math.max(3, H0 + dy);
      el.style.width = nw + 'px'; el.style.height = nh + 'px'; el.style.left = (L0 + W0 - nw) + 'px';
    };
    const up = () => {
      h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      if (Math.abs(nw - W0) < 1 && Math.abs(nh - H0) < 1) return;
      pushUndo();
      const f = nw / W0, right = b.x + b.w;
      if (o.type === 'text') { const f2 = clamp(o.size * f, 1, 400) / o.size; o.size *= f2; if (o.bw != null) o.bw *= f2; if (o.bh != null) o.bh *= f2; const nb = bbox(o); o.x = right - nb.w; o.y = b.y; }
      else if (o.type === 'image') { o.w = nw / s; o.h = nh / s; o.x = right - o.w; }
      else if (o.type === 'ink') { o.pts = o.pts.map(([x, y]) => [right - (right - x) * f, b.y + (y - b.y) * f]); o.width *= f; }
      else if (o.type === 'shape' && (o.kind === 'line' || o.kind === 'arrow')) { o.w *= f; o.h *= nh / H0; }
      else { o.w = nw / s; o.h = nh / s; o.x = right - o.w; }
      renderOverlay(p);
    };
    h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  });
}

// مقابض الطول والعرض لصندوق النص (بدون تغيير حجم الخط)
function bindEdge(p, o, el, h, ax) {
  h.addEventListener('pointerdown', e => {
    e.stopPropagation(); e.preventDefault(); h.setPointerCapture(e.pointerId);
    const s = scale(), b = bbox(o), sx = e.clientX, sy = e.clientY, W0 = b.w * s, H0 = b.h * s, L0 = b.x * s;
    let nw = W0, nh = H0;
    // صندوق فيه كلام: أي مقبض بيكبّر/يصغّر الخط مع الصندوق بنفس النسبة. صندوق فاضي/أشكال: مط حر
    const prop = o.type === 'text' && o.text && o.text.trim();
    const mv = ev => {
      if (prop) {
        let f = ax === 'w' ? (W0 + (sx - ev.clientX)) / W0 : (H0 + (ev.clientY - sy)) / H0;
        f = Math.max(f, 1 / o.size, 3 / Math.min(W0, H0));
        nw = W0 * f; nh = H0 * f;
        el.style.width = nw + 'px'; el.style.height = nh + 'px'; el.style.left = (L0 + W0 - nw) + 'px';
        return;
      }
      if (ax === 'w') { nw = Math.max(2, W0 + (sx - ev.clientX)); el.style.width = nw + 'px'; el.style.left = (L0 + W0 - nw) + 'px'; }
      else { nh = Math.max(2, H0 + (ev.clientY - sy)); el.style.height = nh + 'px'; }
    };
    const up = () => {
      h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      if (Math.abs(nw - W0) < 1 && Math.abs(nh - H0) < 1) return;
      pushUndo();
      const right = b.x + b.w;
      if (prop) {
        const f = clamp(o.size * nw / W0, 1, 400) / o.size;
        o.size *= f; if (o.bw != null) o.bw *= f; if (o.bh != null) o.bh *= f;
        const nb = bbox(o); o.x = right - nb.w; o.y = b.y;
      } else if (o.type === 'text') {
        if (o.bh == null) o.bh = b.h; if (o.bw == null) o.bw = b.w;
        if (ax === 'w') { o.bw = Math.max(nw / s, 1); o.x = right - o.bw; } else o.bh = Math.max(nh / s, 1);
      } else {
        if (ax === 'w') { o.w = Math.max(nw / s, 1); o.x = right - o.w; } else o.h = Math.max(nh / s, 1);
      }
      renderOverlay(p);
    };
    h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  });
}

/* ---------------- تفاعل الصفحة حسب الأداة ---------------- */
function ptFromEvent(p, e) { const r = p.el.getBoundingClientRect(), s = r.width / p.w; return [(e.clientX - r.left) / s, (e.clientY - r.top) / s]; }

function bindOverlay(p) {
  const ov = p.el.querySelector('.overlay');
  ov.addEventListener('pointerdown', e => {
    if (pinch.active) return;
    const t = S.tool;
    if (e.button > 0) return;   // كليك يمين بيتعامل معاه contextmenu
    if (t === 'select' || t === 'text' || t === 'note') {
      if (e.target !== ov) return;
      if (t === 'select' && S.sel) { deselect(); tapState.suppress = Date.now(); return; }
      const [x, y] = ptFromEvent(p, e), sx = e.clientX, sy = e.clientY;
      const fire = (cx, cy, long) => {
        if (tapState.done) return; tapState.done = true; tapState.last = Date.now();
        if (t === 'select') long ? showTapMenu(p, x, y, cx, cy) : pdfTextTap(p, x, y, cx, cy);
        else if (t === 'text') openTextSheet(null, p, x, y);
        else openNoteSheet(null, p, x, y);
      };
      tapState.done = false; tapState.ctx = { p, x, y }; clearTimeout(tapState.timer);
      tapState.timer = setTimeout(() => { if (!pinch.active) { if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) { } fire(sx, sy, true); } }, 450);   // ضغطة مطولة
      const mv = ev => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 18) cleanup(); };
      const up = ev => { const ok = !tapState.done && Math.hypot(ev.clientX - sx, ev.clientY - sy) <= 18 && !pinch.active; cleanup(); if (ok) fire(ev.clientX, ev.clientY, false); };
      const cleanup = () => { clearTimeout(tapState.timer); ov.removeEventListener('pointermove', mv); ov.removeEventListener('pointerup', up); ov.removeEventListener('pointercancel', cleanup); };
      ov.addEventListener('pointermove', mv); ov.addEventListener('pointerup', up); ov.addEventListener('pointercancel', cleanup);
      return;
    }
    if (['pen', 'hl', 'shape', 'eraser'].includes(t)) { e.preventDefault(); startStroke(p, e); }
  });
  // احتياطي: لو المتصفح لغى الـ pointer events، نعتمد على click
  ov.addEventListener('click', e => {
    if (e.target !== ov || S.tool !== 'select' || S.sel) return;
    if (Date.now() - (tapState.last || 0) < 700 || Date.now() - (tapState.suppress || 0) < 700 || $('#tapmenu')) return;
    const [x, y] = ptFromEvent(p, e); tapState.last = Date.now(); pdfTextTap(p, x, y, e.clientX, e.clientY);
  });
  // الضغطة المطولة على أندرويد ممكن تيجي كـ contextmenu
  ov.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (e.target !== ov || S.tool !== 'select') return;
    if ($('#tapmenu') && !$('#tapmenu').classList.contains('txbar')) return;   // القائمة ظاهرة بالفعل من الضغطة المطولة
    if (S.sel) deselect();
    tapState.done = true; tapState.last = Date.now(); clearTimeout(tapState.timer);
    const [x, y] = ptFromEvent(p, e); showTapMenu(p, x, y, e.clientX, e.clientY);
  });
}
const tapState = {};

function startStroke(p, e) {
  const ov = p.el.querySelector('.overlay');
  ov.setPointerCapture(e.pointerId);
  const t = S.tool, s = scale();
  const live = document.createElement('canvas'); live.className = 'live';
  live.width = Math.ceil(p.w * s * DPR()); live.height = Math.ceil(p.h * s * DPR());
  ov.appendChild(live);
  const ctx = live.getContext('2d'); ctx.scale(live.width / p.w, live.height / p.h);
  const start = ptFromEvent(p, e);
  let pts = [start], cancelled = false, erased = false;
  const pid = e.pointerId;
  const preview = cur => {
    ctx.clearRect(0, 0, p.w, p.h);
    if (t === 'pen') drawObj(ctx, { type: 'ink', pts, color: S.pen.color, width: S.pen.width, opacity: S.pen.opacity });
    else if (t === 'hl' || t === 'shape') {
      const o = tmpRectObj(t, start, cur); if (o) drawObj(ctx, o);
    }
  };
  const eraseAt = ([x, y]) => {
    const arr = annotsOf(p.id), r = 8;
    for (let i = arr.length - 1; i >= 0; i--) {
      const o = arr[i]; let hit = false;
      if (o.type === 'ink') hit = o.pts.some(([a, b]) => Math.hypot(a - x, b - y) < r + o.width);
      else if (o.type === 'hl' || o.type === 'shape') { const b = bbox(o); hit = x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
      if (hit) { if (!erased) { pushUndo(); erased = true; } arr.splice(i, 1); renderOverlay(p); ov.appendChild(live); }
    }
  };
  if (t === 'eraser') eraseAt(start);
  const mv = ev => {
    if (ev.pointerId !== pid) return;
    if (pinch.active) { cancelled = true; return; }
    const evs = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev];
    evs.forEach(ce => pts.push(ptFromEvent(p, ce)));
    const cur = pts[pts.length - 1];
    if (t === 'eraser') eraseAt(cur); else preview(cur);
  };
  const up = ev => {
    if (ev.pointerId !== pid) return;
    ov.removeEventListener('pointermove', mv); ov.removeEventListener('pointerup', up); ov.removeEventListener('pointercancel', up);
    live.remove();
    if (cancelled || t === 'eraser') return;
    const end = pts[pts.length - 1];
    let o = null;
    if (t === 'pen') { if (pts.length > 1 || true) o = { type: 'ink', pts: simplify(pts), color: S.pen.color, width: S.pen.width, opacity: S.pen.opacity }; }
    else o = tmpRectObj(t, start, end, true);
    if (o) { o.id = uid(); pushUndo(); annotsOf(p.id).push(o); renderOverlay(p); }
  };
  ov.addEventListener('pointermove', mv); ov.addEventListener('pointerup', up); ov.addEventListener('pointercancel', up);
}

function tmpRectObj(t, a, b, final) {
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(a[0] - b[0]), h = Math.abs(a[1] - b[1]);
  if (t === 'hl') { if (final && (w < 4 || h < 3)) return null; return { type: 'hl', x, y, w, h, color: S.hl.color }; }
  const k = S.shape.kind;
  if (k === 'line' || k === 'arrow') { if (final && Math.hypot(w, h) < 6) return null; return { type: 'shape', kind: k, x: a[0], y: a[1], w: b[0] - a[0], h: b[1] - a[1], color: S.shape.color, width: S.shape.width, fill: null }; }
  if (final && (w < 6 || h < 6)) return null;
  return { type: 'shape', kind: k, x, y, w, h, color: S.shape.color, width: S.shape.width, fill: S.shape.fill };
}

function simplify(pts) {
  if (pts.length < 3) return pts.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { const l = out[out.length - 1]; if (Math.hypot(pts[i][0] - l[0], pts[i][1] - l[1]) > 0.8 || i === pts.length - 1) out.push(pts[i]); }
  return out.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
}

/* ---------------- التكبير ---------------- */
const pinch = { active: false };
function setZoom(z, cx, cy) {
  const v = $('#viewer'); const old = S.zoom; z = clamp(z, 0.5, 5); if (Math.abs(z - old) < 0.01) return;
  cx = cx == null ? v.clientWidth / 2 : cx; cy = cy == null ? v.clientHeight / 2 : cy;
  const fx = (v.scrollLeft + cx) / old, fy = (v.scrollTop + cy) / old;
  S.zoom = z; layout();
  v.scrollLeft = fx * z - cx; v.scrollTop = fy * z - cy;
}
function bindPinch() {
  const v = $('#viewer'), pages = $('#pages');
  let d0 = 0, mid = null;
  v.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      pinch.active = true; const [a, b] = e.touches;
      d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const r = v.getBoundingClientRect(); mid = [(a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top];
      pages.style.transformOrigin = `${v.scrollLeft + mid[0]}px ${v.scrollTop + mid[1]}px`;
    }
  }, { passive: true });
  v.addEventListener('touchmove', e => {
    if (!pinch.active || e.touches.length !== 2) return;
    e.preventDefault();
    const [a, b] = e.touches; pinch.f = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / d0;
    pages.style.transform = `scale(${pinch.f})`;
  }, { passive: false });
  v.addEventListener('touchend', e => {
    if (!pinch.active || e.touches.length) { return; }
    pinch.active = false; pages.style.transform = '';
    if (pinch.f) setZoom(S.zoom * pinch.f, mid[0], mid[1]);
    pinch.f = 0;
  });
  v.addEventListener('scroll', () => { updateBadge(); hideTapMenu(); });
}

/* ================= شريط الأدوات ================= */
const TOOLS = [
  ['select', 'select', 'تحديد'], ['text', 'text', 'نص'], ['pen', 'pen', 'قلم'], ['hl', 'highlight', 'تظليل'],
  ['sign', 'sign', 'توقيع', () => openSignSheet()], ['stamp', 'stamp', 'ختم', () => openStampSheet()], ['hf', 'hf', 'هيدر وفوتر', () => openHFSheet()],
  ['image', 'image', 'صورة', () => insertImageFlow()], ['shape', 'shapes', 'أشكال'], ['note', 'note', 'ملاحظة'],
  ['date', 'date', 'التاريخ', () => openDateSheet()], ['eraser', 'eraser', 'ممحاة'],
];
function buildToolbar() {
  const tb = $('#toolbar'); tb.innerHTML = '';
  TOOLS.forEach(([id, ic, label, act]) => {
    const b = document.createElement('button'); b.className = 'tool'; b.dataset.tool = id;
    b.innerHTML = icon(ic) + `<b>${label}</b>`;
    b.onclick = () => { S.insertAt = null; hideTapMenu(); act ? act() : setTool(id); };
    tb.appendChild(b);
  });
}
function setTool(t) {
  S.tool = t;
  $$('#toolbar .tool').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  $('#viewer').classList.toggle('drawing', ['pen', 'hl', 'shape', 'eraser'].includes(t));
  if (t !== 'select' && t !== 'text') deselect();
  buildToolOpts();
}
function swatches(colors, cur, onPick, opts = {}) {
  const frag = document.createDocumentFragment();
  if (opts.none) { const n = document.createElement('button'); n.className = 'swatch none' + (cur == null ? ' on' : ''); n.title = 'بدون'; n.onclick = () => onPick(null); frag.appendChild(n); }
  colors.forEach(c => { const b = document.createElement('button'); b.className = 'swatch' + (c === cur ? ' on' : ''); b.style.background = c; b.onclick = () => onPick(c); frag.appendChild(b); });
  const cu = document.createElement('label'); cu.className = 'swatch custom'; cu.title = 'لون مخصص';
  const inp = document.createElement('input'); inp.type = 'color'; inp.value = cur || '#000000'; inp.oninput = () => onPick(inp.value); cu.appendChild(inp); frag.appendChild(cu);
  return frag;
}
function buildToolOpts() {
  const box = $('#toolopts'), t = S.tool; box.innerHTML = '';
  const add = h => { const s = document.createElement('span'); s.className = 'lbl'; s.textContent = h; box.appendChild(s); };
  if (t === 'pen') {
    box.appendChild(swatches(COLORS, S.pen.color, c => { S.pen.color = c; buildToolOpts(); }));
    add('السُمك'); const r = document.createElement('input'); r.type = 'range'; r.min = .8; r.max = 14; r.step = .2; r.value = S.pen.width; r.oninput = () => S.pen.width = +r.value; box.appendChild(r);
    add('الشفافية'); const r2 = document.createElement('input'); r2.type = 'range'; r2.min = .15; r2.max = 1; r2.step = .05; r2.value = S.pen.opacity; r2.oninput = () => S.pen.opacity = +r2.value; box.appendChild(r2);
  } else if (t === 'hl') {
    add('اسحب على النص لتظليله'); box.appendChild(swatches(HL_COLORS, S.hl.color, c => { S.hl.color = c; buildToolOpts(); }));
  } else if (t === 'shape') {
    [['rect', 'مستطيل'], ['ellipse', 'دائرة'], ['line', 'خط'], ['arrow', 'سهم']].forEach(([k, n]) => {
      const c = document.createElement('button'); c.className = 'chip' + (S.shape.kind === k ? ' on' : ''); c.textContent = n; c.onclick = () => { S.shape.kind = k; buildToolOpts(); }; box.appendChild(c);
    });
    box.appendChild(swatches(COLORS, S.shape.color, c => { S.shape.color = c; buildToolOpts(); }));
    add('السُمك'); const r = document.createElement('input'); r.type = 'range'; r.min = .8; r.max = 10; r.step = .2; r.value = S.shape.width; r.oninput = () => S.shape.width = +r.value; box.appendChild(r);
  } else if (t === 'text') add('اضغط على أي مكان في الصفحة لإضافة نص');
  else if (t === 'note') add('اضغط على مكان في الصفحة لإضافة ملاحظة');
  else if (t === 'eraser') add('امسح على خطوط القلم أو التظليل أو الأشكال لحذفها');
  box.classList.toggle('hidden', !box.children.length);
}

/* ================= الأوراق السفلية ================= */
let sheetClose = null;
function openSheet(html, onClose) {
  closeSheet(true);
  $('#sheetBody').innerHTML = ''; if (typeof html === 'string') $('#sheetBody').innerHTML = html; else $('#sheetBody').appendChild(html);
  fillIcons($('#sheetBody'));
  $('#sheet').classList.remove('hidden', 'compact'); $('#backdrop').classList.remove('hidden');
  $('#sheetBody').scrollTop = 0;
  sheetClose = onClose || null;
  return $('#sheetBody');
}
function closeSheet(silent) {
  const pn = $('#txPanel'); if (pn) { pn.remove(); if (!silent) return true; }
  if ($('#sheet').classList.contains('hidden')) return false;
  $('#sheet').classList.remove('compact');
  $('#sheet').classList.add('hidden'); $('#backdrop').classList.add('hidden');
  const f = sheetClose; sheetClose = null; if (f && !silent) f();
  return true;
}
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); fillIcons(d); return d.firstElementChild; }

/* ---------------- قائمة الضغط على الصفحة ---------------- */
function hideTapMenu() { const m = $('#tapmenu'); if (m) { if (m._dot) m._dot.remove(); m.remove(); } }
function showTapMenu(p, x, y, cx, cy) {
  hideTapMenu();
  const m = document.createElement('div'); m.id = 'tapmenu';
  const items = [
    ['text', 'نص', () => openTextSheet(null, p, x, y)],
    ['image', 'صورة', () => { S.insertAt = { p, x, y }; insertImageFlow(); }],
    ['sign', 'توقيع', () => { S.insertAt = { p, x, y }; openSignSheet(); }],
    ['stamp', 'ختم', () => { S.insertAt = { p, x, y }; openStampSheet(); }],
    ['hf', 'هيدر/فوتر', () => { S.hfPage = p; openHFSheet(); }],
    ['note', 'ملاحظة', () => openNoteSheet(null, p, x, y)],
    ['date', 'التاريخ', () => { S.insertAt = { p, x, y }; openDateSheet(); }],
    ['blank', 'مربع إخفاء', () => addWhiteBox(p, x - 60, y - 14, 120, 28)],
  ];
  if (S.clip) items.push(['copy', 'لصق', () => pasteAt(p, x, y)]);
  items.forEach(([ic, t, fn]) => { const b = document.createElement('button'); b.innerHTML = icon(ic) + `<span>${t}</span>`; b.onclick = ev => { ev.stopPropagation(); hideTapMenu(); fn(); }; m.appendChild(b); });
  document.body.appendChild(m);
  const r = { width: m.offsetWidth, height: m.offsetHeight }, W = window.innerWidth, H = window.innerHeight;
  let left = clamp(cx - r.width / 2, 8, W - r.width - 8), top = cy - r.height - 14;
  if (top < 70) top = cy + 18;
  if (top + r.height > H - 8) top = H - r.height - 8;
  m.style.left = left + 'px'; m.style.top = top + 'px';
  // نقطة توضح مكان الإدراج
  const dot = document.createElement('div'); dot.className = 'tapdot'; dot.style.left = x * scale() + 'px'; dot.style.top = y * scale() + 'px';
  p.el.querySelector('.overlay').appendChild(dot); m._dot = dot;
}
function addWhiteBox(p, x, y, w, h) {
  const o = { type: 'shape', kind: 'rect', id: uid(), x: clamp(x, 0, p.w - w), y: clamp(y, 0, p.h - h), w, h, color: null, width: 0, fill: '#ffffff' };
  pushUndo(); annotsOf(p.id).push(o); setTool('select'); select(p.id, o.id); return o;
}

/* ---------------- تحديد نص الـ PDF بضغطة سريعة ---------------- */
async function pageLines(i) {
  const t = await pageText(i); if (t.lines) return t.lines;
  const pg = await S.pdf.getPage(i + 1);
  const vp = pg.getViewport({ scale: 1 });
  const realFont = id => { try { if (!S.fontNames) S.fontNames = {}; if (S.fontNames[id]) return S.fontNames[id]; const f = pg.commonObjs.has(id) && pg.commonObjs.get(id); const n = (f && f.name || '').replace(/^[A-Z]{6}\+/, ''); if (n) S.fontNames[id] = n; return n; } catch (e) { return ''; } };
  const boxes = [];
  t.items.forEach(it => {
    if (!it.str || !it.str.trim()) return;
    const tx = pdfjsLib.Util.transform(vp.transform, it.transform);
    const h = Math.hypot(tx[2], tx[3]) || 10, w = it.width * vp.scale;
    boxes.push({ x1: Math.min(tx[4], tx[4] + w), x2: Math.max(tx[4], tx[4] + w), y1: tx[5] - h * 0.95, y2: tx[5] + h * 0.25, h, cy: tx[5] - h * 0.35, str: it.str, font: realFont(it.fontName) });
  });
  boxes.sort((a, b) => a.cy - b.cy || a.x1 - b.x1);
  const lines = [];
  for (const b of boxes) {
    const L = lines.find(l => { const hh = Math.max(l.h, b.h); return Math.abs(l.cy - b.cy) < hh * 0.5 && b.x1 <= l.x2 + hh * 1.3 && b.x2 >= l.x1 - hh * 1.3; });
    if (L) { L.items.push(b); L.x1 = Math.min(L.x1, b.x1); L.x2 = Math.max(L.x2, b.x2); L.y1 = Math.min(L.y1, b.y1); L.y2 = Math.max(L.y2, b.y2); L.h = Math.max(L.h, b.h); }
    else lines.push({ cy: b.cy, h: b.h, x1: b.x1, x2: b.x2, y1: b.y1, y2: b.y2, items: [b] });
  }
  lines.forEach(l => {
    const its = l.items.sort((a, b) => a.x1 - b.x1);
    const all = its.map(i => i.str).join('');
    const rtl = (all.match(/[\u0600-\u06FF\uFB50-\uFEFC]/g) || []).length >= (all.match(/[A-Za-z]/g) || []).length;
    const charMode = its.filter(i => [...i.str].length === 1).length > its.length * 0.6;
    let vis = '';
    its.forEach((it, k) => { if (k && it.x1 - its[k - 1].x2 > l.h * 0.22) vis += ' '; vis += charMode ? it.str : (rtl ? '\u0001' + it.str + '\u0001' : it.str); });
    let txt;
    if (!rtl) txt = vis;
    else if (charMode) txt = [...vis].reverse().join('').replace(/[A-Za-z0-9.,:\/\-+%@#]+/g, m => [...m].reverse().join(''));
    else txt = vis.split('\u0001').filter(x => x !== '').reverse().join('');
    txt = txt.normalize('NFKC').replace(/\s+/g, ' ').trim();
    if (rtl && looksReversed(txt)) {
      txt = [...txt].reverse().join('').replace(/[A-Za-z0-9.,:\/\-+%@#]+/g, m => [...m].reverse().join('')).trim();
      let lead = ''; const pm = txt.match(/^([.،,:؛]+)\s*/); if (pm) { lead = pm[1]; txt = txt.slice(pm[0].length); }
      const num = txt.match(/^(.*?)\s*-?(\d{1,3})-?$/); if (num && num[1]) txt = `${num[2]}- ${num[1]}`;   // رقم البند في أولها
      txt += lead;                                                                // النقطة مكانها آخر الجملة
    }
    l.text = txt; l.rtl = rtl;
    const fc = {}; its.forEach(it => { if (it.font) fc[it.font] = (fc[it.font] || 0) + [...it.str].length; });
    l.font = Object.keys(fc).sort((a, b) => fc[b] - fc[a])[0] || '';
  });
  return (t.lines = lines);
}
// هل النص العربي متخزن بالمقلوب في الملف؟ (كلمات بتخلص بـ "لا" وبتبدأ بـ "ة")
function looksReversed(t) {
  const w = t.split(/[\s.,،:؛()\-]+/).filter(x => /[\u0600-\u06FF]/.test(x) && x.length > 1);
  let fwd = 0, rev = 0;
  w.forEach(x => { if (/^ال/.test(x)) fwd++; if (/[ةى]$/.test(x)) fwd++; if (/لا$/.test(x)) rev++; if (/^[ةى]/.test(x)) rev++; });
  return rev > fwd && rev >= 2;
}
// اسم خط الـ PDF الأصلي -> أقرب خط عندنا
function mapPdfFont(name) {
  const n = (name || '').toLowerCase().replace(/[\s_-]/g, '');
  const bold = /bold|black|heavy|semibold|demi/.test(n);
  const table = [[/dinnext.*(arabic|w23)?.*(bold|medium|black|heavy)/, 'Sub DIN Bold'], [/dinnext/, 'Sub DIN Light'], [/timesnewroman|times/, 'Sub TNR'], [/arial|helvetica/, 'Sub Arial'],
    [/calibri/, 'Sub Calibri'], [/agency/, 'Sub Agency'], [/amiri/, 'Amiri'], [/tajawal/, 'Tajawal'], [/cairo/, 'Cairo'], [/almarai/, 'Almarai'], [/notonaskh/, 'Noto Naskh Arabic'],
    [/notokufi/, 'Noto Kufi Arabic'], [/notosansarabic/, 'Noto Sans Arabic'], [/ibmplexsansarabic|plexarabic/, 'IBM Plex Sans Arabic'], [/scheherazade/, 'Scheherazade New'], [/lateef/, 'Lateef'],
    [/arefruqaa/, 'Aref Ruqaa'], [/elmessiri/, 'El Messiri'], [/changa/, 'Changa'], [/roboto/, 'Roboto'], [/opensans/, 'Open Sans'], [/montserrat/, 'Montserrat'], [/poppins/, 'Poppins'],
    [/georgia/, 'Gelasio'], [/courier/, 'Cousine'], [/garamond/, 'EB Garamond'], [/lato/, 'Lato']];
  const hit = table.find(([re]) => re.test(n));
  return { font: hit ? hit[1] : null, bold: bold && !(hit && /Bold$/.test(hit[1])) };
}
async function pdfTextTap(p, x, y, cx, cy) {
  hideTapMenu();
  if (!S.pdf) return;
  const lines = await pageLines(p.index);
  const hit = lines.filter(l => x >= l.x1 - 3 && x <= l.x2 + 3 && y >= l.y1 - 3 && y <= l.y2 + 3).sort((a, b) => (a.x2 - a.x1) - (b.x2 - b.x1))[0];
  if (!hit) return;
  const s = scale();
  const m = document.createElement('div'); m.id = 'tapmenu'; m.className = 'txbar';
  const sel = document.createElement('div'); sel.className = 'txsel';
  Object.assign(sel.style, { left: hit.x1 * s + 'px', top: hit.y1 * s + 'px', width: (hit.x2 - hit.x1) * s + 'px', height: (hit.y2 - hit.y1) * s + 'px' });
  p.el.querySelector('.overlay').appendChild(sel); m._dot = sel;
  const pad = 1.5, R = { x: hit.x1 - pad, y: hit.y1 - pad, w: hit.x2 - hit.x1 + pad * 2, h: hit.y2 - hit.y1 + pad * 2 };
  const items = [
    ['copy', 'نسخ', () => copyText(hit.text)],
    ['highlight', 'تظليل', () => { const o = { type: 'hl', id: uid(), ...R, color: S.hl.color }; pushUndo(); annotsOf(p.id).push(o); renderOverlay(p); }],
    ['blank', 'إخفاء', () => addWhiteBox(p, R.x, R.y, R.w, R.h)],
    ['edit', 'تعديل', () => editPdfLine(p, hit, R)],
  ];
  items.forEach(([ic, t, fn]) => { const b = document.createElement('button'); b.innerHTML = icon(ic) + `<span>${t}</span>`; b.onclick = ev => { ev.stopPropagation(); hideTapMenu(); fn(); }; m.appendChild(b); });
  document.body.appendChild(m);
  const r = sel.getBoundingClientRect(), W = window.innerWidth;
  let top = r.top - m.offsetHeight - 10; if (top < 70) top = r.bottom + 10;
  m.style.left = clamp(r.left + r.width / 2 - m.offsetWidth / 2, 8, W - m.offsetWidth - 8) + 'px'; m.style.top = top + 'px';
}
function copyText(t) {
  if (N && N.copy) { N.copy(t); toast('تم نسخ النص'); return; }
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('تم نسخ النص'), () => toast(t));
  else toast(t);
}
function editPdfLine(p, line, R) {
  pushUndo();
  const size = Math.max(4, Math.round(line.h * 2) / 2);   // نفس حجم الخط الأصلي (مايصغرش بعد التعديل)
  const mf = mapPdfFont(line.font);
  const o = { type: 'text', id: uid(), x: R.x, y: R.y, text: line.text, font: mf.font || 'Sub TNR', size, color: '#000000', bg: '#ffffff', align: line.rtl ? 'right' : 'left', bold: mf.bold, opacity: 1, fromPdf: true };
  if (line.font && !mf.font) toast(`خط الملف الأصلي "${line.font}" مش موجود عندنا — استخدمت Times New Roman`, 4000);
  const nat = textMetrics(o);
  o.bw = Math.max(R.w, nat.nw); o.bh = R.h;
  if (line.rtl) o.x = R.x + R.w - o.bw;
  annotsOf(p.id).push(o);
  S.sel = { pid: p.id, oid: o.id }; renderOverlay(p); updateSelbar();
  fontReady(o.font).then(() => { fitBox(o); renderOverlay(p); });
  openTextSheet(o, p);
}

function pasteAt(p, x, y) {
  const c = JSON.parse(S.clip.json); c.id = uid();
  if (S.clip.asset) S.assets[c.asset] = S.clip.asset;
  const b = bbox(c); moveObj(c, x - b.x - b.w / 2, y - b.y - b.h / 2);
  pushUndo(); annotsOf(p.id).push(c); select(p.id, c.id);
}

/* ---------------- ورقة النص ---------------- */
function openTextSheet(obj, p, x, y) {
  const isNew = !obj;
  const o = isNew ? { type: 'text', id: uid(), x: x || 40, y: y || 40, ...S.text, text: '' } : obj;
  let pushed = false;
  const ensureUndo = () => { if (!isNew && !pushed) { pushUndo(); pushed = true; } };
  const body = openSheet(`
    <div class="tx-bar">
      <button class="tx-font" id="tFontBtn"><span id="tFontName" dir="auto"></span><span class="car">▾</span></button>
      <div class="tx-size"><button id="tMinus">−</button><span id="tSize"></span><button id="tPlus">+</button></div>
      <button class="tx-b" id="tBold">B</button>
      <button class="tx-b" id="tAlign"></button>
      <button class="tx-col" id="tColBtn"><span class="d1"></span><span class="d2"></span></button>
      <button class="tx-done" id="tDone">تم</button>
    </div>`, () => commit());
  $('#sheet').classList.add('compact'); $('#backdrop').classList.add('hidden');
  // الكتابة مباشرة على الصفحة في المكان اللي اتضغط عليه
  const ta = document.createElement('textarea'); ta.id = 'tTxt'; ta.className = 'inline-ta'; ta.dir = 'auto'; ta.spellcheck = false;
  ta.setAttribute('autocomplete', 'off'); ta.value = o.text || '';
  p.el.querySelector('.overlay').appendChild(ta);
  const anchor = isNew ? { x: o.x, align: o.align } : null;
  if (isNew) { const m0 = textMetrics({ ...o, text: 'x' }); o.y = Math.max(0, o.y - m0.nh / 2); }
  else { S.editingId = o.id; renderOverlay(p); }
  // إطار المعاينة على قد الكلام بالظبط (نفس الصندوق اللي هيتحفظ)
  const box = document.createElement('div'); box.className = 'inline-box';
  p.el.querySelector('.overlay').appendChild(box);
  const posTA = () => {
    const s = scale(), tmp = { ...o, text: ta.value || ' ' }; if (isNew) { delete tmp.bw; delete tmp.bh; }
    const m = textMetrics(tmp);
    const bw = isNew ? Math.max(m.nw, o.size * 0.8) : m.w, bh = m.h;
    let x = o.x;
    if (isNew) { x = anchor.align === 'left' ? anchor.x : anchor.align === 'center' ? anchor.x - bw / 2 : anchor.x - bw; x = clamp(x, 0, Math.max(0, p.w - bw)); o.x = x; }
    Object.assign(box.style, { left: x * s + 'px', top: o.y * s + 'px', width: bw * s + 'px', height: bh * s + 'px', background: isNew ? (o.bg || 'rgba(30,136,229,.05)') : 'transparent' });
    // نحط سطر الكتابة بحيث خط الكتابة (baseline) ييجي في نفس مكانه في الصندوق
    const L = m.lh, base0 = o.y + (bh - m.nh) / 2 + m.padY + m.asc;
    const fa = m.ink.fa * o.size, fd = m.ink.fd * o.size, off = (L - fa - fd) / 2 + fa;
    const extra = o.size * 0.3, n = m.lines.length;
    Object.assign(ta.style, { left: (x - (o.align === 'left' ? 0 : o.align === 'center' ? extra / 2 : extra)) * s + 'px', top: (base0 - off) * s + 'px', width: (bw + extra) * s + 'px', height: (n * L) * s + 'px',
      fontSize: o.size * s + 'px', lineHeight: L * s + 'px',
      padding: `0 ${m.padX * s}px`,
      fontFamily: `"${o.font}", "Cairo"`, fontWeight: o.bold ? 700 : 400, color: o.color, textAlign: o.align,
      background: 'transparent', opacity: o.opacity == null ? 1 : o.opacity });
  };
  // ضغطة بره = تم
  const outside = e => { if (e.target === ta || e.target.closest('#sheet') || e.target.closest('#txPanel')) return; e.stopPropagation(); e.preventDefault(); const pn = $('#txPanel'); if (pn) pn.remove(); closeSheet(); };
  document.addEventListener('pointerdown', outside, true);
  const fontInfo = () => FONTS.find(f => f.f === o.font) || { n: o.font };
  const alignIc = { right: 'alignR', center: 'alignC', left: 'alignL' };
  const refresh = () => {
    $('#tSize', body).textContent = +o.size.toFixed(1);
    $('#tBold', body).classList.toggle('on', !!o.bold);
    $('#tAlign', body).innerHTML = icon(alignIc[o.align] || 'alignR');
    const fn = $('#tFontName', body); fn.textContent = fontInfo().n; fn.style.fontFamily = `"${o.font}", "Cairo"`;
    $('#tColBtn .d1', body).style.background = o.color;
    const d2 = $('#tColBtn .d2', body); d2.style.background = o.bg || ''; d2.classList.toggle('none', !o.bg);
    if (anchor) anchor.align = o.align;
    posTA();
    const pn = $('#txPanel'); if (pn && pn.dataset.kind === 'font') $$('.fl-row', pn).forEach(r => r.classList.toggle('on', r.dataset.f === o.font));
  };
  const live = () => { fitBox(o); refresh(); if (!isNew) { const pp = S.pages.find(q => q.id === S.sel?.pid) || p; renderOverlay(pp); } };
  // ---- لوحة منبثقة فوق الشريط (خطوط / ألوان)
  const panel = kind => {
    const old = $('#txPanel'); if (old) { const k = old.dataset.kind; old.remove(); if (k === kind) return null; }
    const pn = document.createElement('div'); pn.id = 'txPanel'; pn.dataset.kind = kind;
    document.body.appendChild(pn);
    placePanel();
    return pn;
  };
  $('#tFontBtn', body).onclick = () => {
    const pn = panel('font'); if (!pn) return;
    pn.innerHTML = `<div class="fl-cols"><div class="fl-col" id="flAr"><div class="fl-h">عربي</div></div><div class="fl-col" id="flEn"><div class="fl-h">English</div></div></div>`;
    const add = (col, f) => {
      const r = document.createElement('button'); r.className = 'fl-row' + (f.f === o.font ? ' on' : ''); r.dataset.f = f.f;
      r.innerHTML = `<span class="nm" style="font-family:'${f.f}','Cairo'">${f.n}</span>${f.sub ? `<span class="sb">${f.sub}</span>` : ''}`;
      r.onclick = async () => { ensureUndo(); o.font = f.f; await fontReady(f.f); live(); };
      $(col, pn).appendChild(r);
    };
    FONTS.filter(f => f.col !== 'en').forEach(f => add('#flAr', f));
    FONTS.filter(f => f.col !== 'ar').forEach(f => add('#flEn', f));
    const cur = $('.fl-row.on', pn); if (cur) cur.scrollIntoView({ block: 'center' });
  };
  $('#tColBtn', body).onclick = () => {
    const pn = panel('color'); if (!pn) return;
    pn.innerHTML = `<div class="cp"><div class="cp-r"><span class="k">اللون</span><span id="cpT"></span></div>
      <div class="cp-r"><span class="k">التعبئة</span><span id="cpB"></span></div>
      <div class="cp-r"><span class="k">التعتيم</span><input type="range" id="cpO" min="0.1" max="1" step="0.05"><span id="cpOV"></span></div></div>`;
    const paint = () => {
      const t = $('#cpT', pn); t.innerHTML = ''; t.appendChild(swatches(COLORS, o.color, c => { ensureUndo(); o.color = c; live(); paint(); }));
      const b = $('#cpB', pn); b.innerHTML = ''; b.appendChild(swatches(['#ffffff', '#fff59d', '#c8e6c9', '#bbdefb', '#ffcdd2', '#000000'], o.bg, c => { ensureUndo(); o.bg = c; live(); paint(); }, { none: true }));
      $('#cpO', pn).value = o.opacity; $('#cpOV', pn).textContent = Math.round(o.opacity * 100) + '%';
    };
    $('#cpO', pn).oninput = e => { ensureUndo(); o.opacity = +e.target.value; $('#cpOV', pn).textContent = Math.round(o.opacity * 100) + '%'; live(); };
    paint();
  };
  const stepSize = d => { ensureUndo(); const st = o.size < 12 ? 0.5 : 1; const ns = clamp(Math.round((o.size + d * st) / st) * st, 1, 400); const f = ns / o.size; if (o.bw != null) o.bw *= f; if (o.bh != null) o.bh *= f; o.size = ns; live(); };
  $('#tMinus', body).onclick = () => stepSize(-1);
  $('#tPlus', body).onclick = () => stepSize(1);
  $('#tSize', body).onclick = () => { const v = prompt('حجم الخط', Math.round(o.size)); if (v && +v > 0) { ensureUndo(); const ns = clamp(+v, 1, 400), f = ns / o.size; if (o.bw != null) o.bw *= f; if (o.bh != null) o.bh *= f; o.size = ns; live(); } };
  $('#tBold', body).onclick = () => { ensureUndo(); o.bold = !o.bold; live(); };
  $('#tAlign', body).onclick = () => { ensureUndo(); o.align = { right: 'center', center: 'left', left: 'right' }[o.align] || 'right'; live(); };
  ta.oninput = () => { if (!isNew) { ensureUndo(); o.text = ta.value; live(); } else posTA(); };
  let done = false;
  function commit() {
    if (done) return; done = true;
    document.removeEventListener('pointerdown', outside, true);
    ta.remove(); box.remove(); S.editingId = null;
    let txt = ta.value.replace(/\s+$/, '');
    if (!txt && ta.value.length) {   // مسافات فقط = مربع فاضي للإخفاء
      if (isNew) { const n = ta.value.replace(/\n/g, '').length; txt = ' '.repeat(Math.max(7, n)); o.text = txt; const m0 = textMetrics(o); o.bw = Math.max(120, m0.nw); o.bh = Math.max(30, Math.min(m0.nh, 40)); }
      else txt = ta.value.replace(/\n+$/, '') || ' ';
      if (!o.bg) o.bg = '#ffffff';
    }   // مسافات فقط = مربع فاضي للإخفاء
    // الخلفية البيضا بتاعة تعديل سطر من الملف ماتتنقلش للكتابة الجديدة
    Object.assign(S.text, { font: o.font, size: o.size, color: o.color, align: o.align, bold: o.bold, opacity: o.opacity }, o.fromPdf || /^ +$/.test(txt) ? {} : { bg: o.bg });
    if (isNew) {
      if (!txt) return;
      o.text = txt;
      const b = bbox(o);
      o.x = anchor.align === 'left' ? anchor.x : anchor.align === 'center' ? anchor.x - b.w / 2 : anchor.x - b.w;   // يفضل في نفس مكان الكتابة
      o.x = clamp(o.x, 0, Math.max(0, p.w - b.w)); o.y = clamp(o.y, 0, Math.max(0, p.h - b.h));
      pushUndo(); annotsOf(p.id).push(o); setTool('select'); select(p.id, o.id);
    } else {
      if (!txt) { S.sel = { pid: p.id, oid: o.id }; deleteSel(); renderOverlay(p); return; }
      if (o.text !== txt) { ensureUndo(); o.text = txt; }
      fitBox(o); renderOverlay(p); updateSelbar();
    }
  }
  $('#tDone', body).onclick = () => { const pn = $('#txPanel'); if (pn) pn.remove(); closeSheet(); };
  refresh();
  setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 120);
  setTimeout(() => { try { ta.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { } }, 450);   // بعد ما الكيبورد يفتح
}
function placePanel() {
  const pn = $('#txPanel'), sh = $('#sheet'); if (!pn || sh.classList.contains('hidden')) return;
  const top = sh.getBoundingClientRect().top;
  pn.style.bottom = (window.innerHeight - top + 6) + 'px';
  const h = Math.max(150, Math.min(top - 70, window.innerHeight * 0.48));
  if (pn.dataset.kind === 'font') pn.style.height = h + 'px'; else pn.style.maxHeight = h + 'px';
}

/* ---------------- ورقة الملاحظة ---------------- */
function openNoteSheet(obj, p, x, y) {
  const isNew = !obj;
  const body = openSheet(`
    <div class="sh-head"><h3>ملاحظة</h3><button class="btn pri" id="nDone">تم</button></div>
    <textarea class="field" id="nTxt" dir="auto" placeholder="اكتب الملاحظة… تظهر كتعليق في ملف PDF"></textarea>
    <div class="row"><span class="k">اللون</span><span id="nCol" style="display:flex;gap:8px"></span></div>`, () => commit());
  let color = obj ? obj.color : '#ffc107';
  const paint = () => { const c = $('#nCol', body); c.innerHTML = ''; c.appendChild(swatches(['#ffc107', '#ff8a65', '#81c784', '#64b5f6', '#ba68c8'], color, v => { color = v; paint(); })); };
  paint();
  $('#nTxt', body).value = obj ? obj.text : '';
  let done = false;
  function commit() {
    if (done) return; done = true;
    const t = $('#nTxt', body).value.trim();
    if (isNew) { if (!t) return; const o = { type: 'note', id: uid(), x: x - 11, y: y - 11, text: t, color }; pushUndo(); annotsOf(p.id).push(o); setTool('select'); select(p.id, o.id); }
    else { pushUndo(); if (!t) { deleteSel(); return; } obj.text = t; obj.color = color; renderOverlay(p); }
  }
  $('#nDone', body).onclick = () => closeSheet();
  setTimeout(() => $('#nTxt', body).focus(), 250);
}

/* ---------------- ورقة النمط (للعناصر غير النصية) ---------------- */
function openStyleSheet(o) {
  if (o.type === 'text') return openTextSheet(o, selPage());
  const p = selPage(); pushUndo();
  const body = openSheet(`<div class="sh-head"><h3>النمط</h3><button class="btn pri" id="sDone">تم</button></div><div id="sBody"></div>`);
  const sb = $('#sBody', body);
  const rr = () => renderOverlay(p);
  const row = (k, node) => { const r = document.createElement('div'); r.className = 'row scroll'; r.innerHTML = `<span class="k">${k}</span>`; r.appendChild(node); sb.appendChild(r); };
  const sw = (cols, key, opts) => { const s = document.createElement('span'); s.style.cssText = 'display:flex;gap:8px'; const paint = () => { s.innerHTML = ''; s.appendChild(swatches(cols, o[key], c => { o[key] = c; paint(); rr(); }, opts)); }; paint(); return s; };
  const range = (key, min, max, step) => { const r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = o[key] == null ? 1 : o[key]; r.style.flex = 1; r.oninput = () => { o[key] = +r.value; rr(); }; return r; };
  if (o.type === 'ink' || o.type === 'shape') { row('اللون', sw(COLORS, 'color')); row('السُمك', range('width', .5, 16, .25)); }
  if (o.type === 'shape' && (o.kind === 'rect' || o.kind === 'ellipse')) row('التعبئة', sw(['#ffffff', '#fff59d', '#c8e6c9', '#bbdefb', '#ffcdd2', '#000000'], 'fill', { none: true }));
  if (o.type === 'hl') row('اللون', sw(HL_COLORS, 'color'));
  if (o.type === 'note') row('اللون', sw(['#ffc107', '#ff8a65', '#81c784', '#64b5f6', '#ba68c8'], 'color'));
  if (o.type !== 'hl' && o.type !== 'note') row('التعتيم', range('opacity', .1, 1, .05));
  $('#sDone', body).onclick = () => closeSheet();
}

/* ---------------- إدراج صورة/توقيع/ختم ---------------- */
// الصفحة اللي في نص الشاشة (مش اللي أولها ظاهر فوق)
function visiblePage() {
  const v = $('#viewer'), mid = v.scrollTop + v.clientHeight / 2; let best = S.pages[S.cur] || S.pages[0], bd = 1e9;
  S.pages.forEach(p => { if (!p.el) return; const t = p.el.offsetTop, b = t + p.el.offsetHeight; const d = mid < t ? t - mid : mid > b ? mid - b : 0; if (d < bd) { bd = d; best = p; } });
  return best;
}
async function addImageObj(src, opts = {}) {
  const img = await loadImg(src);
  const at = S.insertAt; S.insertAt = null;
  const p = at ? at.p : visiblePage(); const v = $('#viewer'), s = scale();
  const aid = uid(); S.assets[aid] = src;
  let w = opts.w || p.w * 0.4; let h = w * img.height / img.width;
  if (h > p.h * 0.5) { h = p.h * 0.5; w = h * img.width / img.height; }
  let x, y;
  if (at) { x = clamp(at.x - w / 2, 0, Math.max(0, p.w - w)); y = clamp(at.y - h / 2, 0, Math.max(0, p.h - h)); }
  else { const viewMid = (v.scrollTop + v.clientHeight / 2 - p.el.offsetTop) / s; x = (p.w - w) / 2; y = clamp(viewMid - h / 2, 0, Math.max(0, p.h - h)); }
  const o = { type: 'image', id: uid(), asset: aid, x, y, w, h, opacity: 1, kind: opts.kind || 'image' };
  pushUndo(); annotsOf(p.id).push(o); setTool('select'); select(p.id, o.id);
}
async function normalizeImage(file, maxSide = 6000) {
  const src = await readFile(file, true);
  const img = await loadImg(src);
  const isJpg = /jpe?g/i.test(file.type);
  const sc = Math.min(1, maxSide / Math.max(img.width, img.height));
  const ori = isJpg ? jpegOrientation(await dataUrlToBytes(src)) : 1;
  if (sc === 1 && ori === 1 && (isJpg || /png/i.test(file.type))) return src;   // الأصل كما هو بدون أي ضغط
  const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return isJpg ? c.toDataURL('image/jpeg', 0.97) : c.toDataURL('image/png');
}
async function insertImageFlow() {
  const f = await pickFile('fImg'); if (!f) return;
  busy(true, 'جاري تجهيز الصورة…');
  try { await addImageObj(await normalizeImage(f)); } catch (e) { toast('تعذر قراءة الصورة'); } finally { busy(false); }
}

function removeWhite(img, thr) {
  const c = document.createElement('canvas'); const sc = Math.min(1, 1600 / Math.max(img.width, img.height));
  c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    const l = (a[i] + a[i + 1] + a[i + 2]) / 3;
    if (l >= thr) a[i + 3] = 0; else if (l > thr - 40) a[i + 3] = Math.round(a[i + 3] * (thr - l) / 40);
  }
  ctx.putImageData(d, 0, 0);
  return trimCanvas(c);
}
function trimCanvas(c) {
  const ctx = c.getContext('2d'), d = ctx.getImageData(0, 0, c.width, c.height).data;
  let x1 = c.width, y1 = c.height, x2 = -1, y2 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y; }
  if (x2 < 0) return null;
  const p = 6, o = document.createElement('canvas'); o.width = x2 - x1 + 1 + 2 * p; o.height = y2 - y1 + 1 + 2 * p;
  o.getContext('2d').drawImage(c, x1 - p, y1 - p, o.width, o.height, 0, 0, o.width, o.height);
  return o;
}

/* صورة -> توقيع/ختم بخلفية شفافة */
async function importTransparent(type) {
  const f = await pickFile('fImg'); if (!f) return;
  const img = await loadImg(await normalizeImage(f, 2000));
  let thr = 215, out = null;
  const body = openSheet(`
    <div class="sh-head"><h3>${type === 'stamp' ? 'ختم من صورة' : 'توقيع من صورة'}</h3></div>
    <div class="preview-box" id="ipv"></div>
    <div class="row"><span class="k">إزالة الخلفية</span><input type="range" id="ithr" min="140" max="255" step="1" style="flex:1"></div>
    <p style="font-size:12.5px;color:var(--muted);margin:0">حرّك المؤشر حتى تختفي الخلفية البيضاء ويبقى الختم/التوقيع واضح.</p>
    <div class="row"><button class="btn pri" id="iSave" style="flex:1">حفظ وإدراج</button><button class="btn" id="iIns">إدراج فقط</button></div>`);
  const paint = () => { out = thr >= 255 ? (() => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c; })() : removeWhite(img, thr); const pv = $('#ipv', body); pv.innerHTML = ''; if (out) pv.appendChild(out); };
  $('#ithr', body).value = thr; $('#ithr', body).oninput = e => { thr = +e.target.value; paint(); };
  paint();
  const go = save => { if (!out) return; const src = out.toDataURL('image/png'); if (save) Lib.add(type, src); closeSheet(); (type === 'stamp' ? placeStampDialog : addImageObj)(src, { kind: type, w: type === 'stamp' ? 130 : 150 }); };
  $('#iSave', body).onclick = () => go(true); $('#iIns', body).onclick = () => go(false);
}

/* ================= الهيدر والفوتر ================= */
const HF = { kind: 'header' };
function openHFSheet() {
  const k = HF.kind, nm = k === 'header' ? 'هيدر' : 'فوتر';
  const body = openSheet(`
    <div class="sh-head"><h3>الهيدر والفوتر</h3></div>
    <div class="seg hfseg" style="margin-bottom:8px"><button data-k="header">هيدر (أعلى الصفحة)</button><button data-k="footer">فوتر (أسفل الصفحة)</button></div>
    <div class="sec-title">المحفوظ عندك</div>
    <div id="hfList"></div>
    <div class="row" style="flex-wrap:wrap">
      <button class="btn pri" id="hfPage" style="flex:1 1 100%">${icon('copy')} خد ال${nm} من الصفحة الحالية</button>
      <button class="btn" id="hfDesign" style="flex:1">${icon('edit')} تصميم ${nm}</button>
      <button class="btn" id="hfImg" style="flex:1">${icon('image')} ${nm} من صورة</button>
    </div>`);
  $$('.hfseg button', body).forEach(b => { b.classList.toggle('on', b.dataset.k === k); b.onclick = () => { HF.kind = b.dataset.k; openHFSheet(); }; });
  const fill = () => { const l = $('#hfList', body); l.innerHTML = ''; const g = libGrid(k, src => applyHFDialog(src, k), fill); g.classList.add('wide'); if (g.classList.contains('lib-empty')) g.textContent = `لا يوجد ${nm} محفوظ بعد`; l.appendChild(g); };
  fill();
  $('#hfPage', body).onclick = () => hfFromPage(k);
  $('#hfDesign', body).onclick = () => hfDesigner(k);
  $('#hfImg', body).onclick = () => hfFromImage(k);
}
function applyHFDialog(src, k) {
  if (!S.pdf || curScreen() !== 'editor') { toast('اتحفظ في المكتبة — افتح ملف عشان تضيفه'); closeSheet(true); return; }
  const nm = k === 'header' ? 'الهيدر' : 'الفوتر';
  const body = openSheet(`
    <div class="sh-head"><h3>إضافة ${nm}</h3></div>
    <div class="hf-prev"><div class="hf-page" id="hfPg"><img id="hfIm" src="${src}"></div></div>
    <div class="row"><span class="k">الحجم</span><input type="range" id="hfSz" min="15" max="100" step="1" value="100" style="flex:1"><span id="hfSzV" style="min-width:40px">100%</span></div>
    <div class="row"><span class="k">${k === 'header' ? 'ينزل لتحت' : 'يطلع لفوق'}</span><input type="range" id="hfOf" min="0" max="50" step="0.5" value="0" style="flex:1"><span id="hfOfV" style="min-width:40px">0%</span></div>
    <div class="row"><span class="k">يمين/شمال</span><input type="range" id="hfX" dir="ltr" min="-100" max="100" step="1" value="0" style="flex:1"><span id="hfXV" style="min-width:40px">نص</span></div>
    <div class="menu-list" style="margin-top:6px">
      <label class="hfopt"><input type="radio" name="hfw" value="all" checked> كل الصفحات (${S.pages.length})</label>
      <label class="hfopt"><input type="radio" name="hfw" value="cur"> الصفحة دي بس</label>
      <label class="hfopt"><input type="radio" name="hfw" value="rest"> من الصفحة دي لآخر الملف</label>
      <label class="hfopt"><input type="checkbox" id="hfCover" checked> غطّي ${nm} القديم اللي في الملف (مربع أبيض تحته)</label>
    </div>
    <div class="row"><button class="btn pri" id="hfGo" style="flex:1">إضافة</button></div>`);
  const cur0 = S.hfPage || visiblePage();
  pageThumb(cur0, $('#hfPg', body));
  let ar = 0.15; loadImg(src).then(im => { ar = im.height / im.width; pv(); });
  const pv = () => {
    const sz = +$('#hfSz', body).value, of = +$('#hfOf', body).value, hx = +$('#hfX', body).value, pg = $('#hfPg', body), im = $('#hfIm', body);
    const pw = 170, ph = pw * cur0.h / cur0.w; pg.style.width = pw + 'px'; pg.style.height = ph + 'px';
    const W = pw * sz / 100, H = W * ar, x = (pw - W) / 2 * (1 + hx / 100), y = k === 'header' ? ph * of / 100 : ph - H - ph * of / 100;
    Object.assign(im.style, { width: W + 'px', left: x + 'px', top: y + 'px', bottom: '' });
    $('#hfSzV', body).textContent = sz + '%'; $('#hfOfV', body).textContent = of + '%';
    $('#hfXV', body).textContent = hx === 0 ? 'نص' : hx < 0 ? 'شمال' : 'يمين';
  };
  ['#hfSz', '#hfOf', '#hfX'].forEach(id => $(id, body).oninput = pv); pv();
  $('#hfGo', body).onclick = async () => {
    const w = $('input[name=hfw]:checked', body).value, cover = $('#hfCover', body).checked;
    const sz = +$('#hfSz', body).value / 100, of = +$('#hfOf', body).value / 100, hx = +$('#hfX', body).value / 100;
    closeSheet(true);
    const cur = S.hfPage || visiblePage(); S.hfPage = null;
    const pages = w === 'all' ? S.pages : w === 'rest' ? S.pages.slice(cur.index) : [cur];
    const img = await loadImg(src); const aid = uid(); S.assets[aid] = src;
    pushUndo();
    let last = null;
    pages.forEach(p => {
      const W = p.w * sz, H = W * img.height / img.width, x = (p.w - W) / 2 * (1 + hx), oy = p.h * of, y = k === 'header' ? oy : p.h - H - oy;
      if (cover) {
        // في مكانه الطبيعي: يغطي من حافة الصفحة لحد آخره. لو اتحرك: يغطي تحته بس
        const atEdge = of < 0.02 && Math.abs(hx) < 0.01;
        const r = atEdge ? { x: 0, y: k === 'header' ? 0 : y, w: p.w, h: k === 'header' ? y + H : p.h - y } : { x, y, w: W, h: H };
        annotsOf(p.id).unshift({ type: 'shape', kind: 'rect', id: uid(), ...r, color: null, width: 0, fill: '#ffffff' });
      }
      last = { type: 'image', id: uid(), asset: aid, x, y, w: W, h: H, opacity: 1, kind: k };
      annotsOf(p.id).push(last);
      renderOverlay(p);
    });
    setTool('select'); deselect();
    // اعرض المكان اللي اتحط فيه: أعلى الصفحة للهيدر وأسفلها للفوتر
    const v = $('#viewer'), sc = scale(), first = pages[0];
    v.scrollTop = k === 'header' ? Math.max(0, first.el.offsetTop - 10) : Math.max(0, first.el.offsetTop + first.h * sc - v.clientHeight + 20);
    toast(`تمت إضافة ${nm} على ${pages.length} صفحة`);
  };
}
// صورة مصغرة للصفحة الحالية كخلفية للمعاينة
function pageThumb(p, el) {
  try {
    const cv = p.el && p.el.querySelector('canvas.pdfc'); if (!cv || !cv.width) return;
    const t = document.createElement('canvas'), k = 340 / cv.width; t.width = 340; t.height = Math.round(cv.height * k);
    t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height);
    Object.assign(el.style, { backgroundImage: `url(${t.toDataURL('image/jpeg', 0.7)})`, backgroundSize: '100% 100%' });
  } catch (e) { }
}
/* ---------- مكان الختم: الحجم + يمين/شمال + فوق/تحت + كل الصفحات ---------- */
const STP = { w: 0.22, hx: 0.12, vy: 0.85, where: 'cur' };
async function placeStampDialog(src, opts = {}) {
  if (!S.pdf || curScreen() !== 'editor' || S.insertAt) return addImageObj(src, opts);
  const kind = opts.kind || 'stamp';
  const img = await loadImg(src), ar = img.height / img.width;
  const cur0 = visiblePage();
  const body = openSheet(`
    <div class="sh-head"><h3>${kind === 'sig' ? 'مكان التوقيع' : 'مكان الختم'}</h3></div>
    <div class="hf-prev"><div class="hf-page" id="spPg"><img id="spIm" src="${src}"></div></div>
    <div class="row"><span class="k">الحجم</span><input type="range" id="spSz" min="5" max="70" step="0.5" style="flex:1"><span id="spSzV" style="min-width:40px"></span></div>
    <div class="row"><span class="k">يمين/شمال</span><input type="range" id="spX" dir="ltr" min="0" max="100" step="0.5" style="flex:1"></div>
    <div class="row"><span class="k">فوق/تحت</span><input type="range" id="spY" dir="ltr" min="0" max="100" step="0.5" style="flex:1"></div>
    <div class="menu-list" style="margin-top:6px">
      <label class="hfopt"><input type="radio" name="spw" value="cur"> الصفحة دي بس</label>
      <label class="hfopt"><input type="radio" name="spw" value="all"> كل الصفحات (${S.pages.length})</label>
      <label class="hfopt"><input type="radio" name="spw" value="rest"> من الصفحة دي لآخر الملف</label>
    </div>
    <div class="row"><button class="btn pri" id="spGo" style="flex:1">إضافة</button></div>`);
  pageThumb(cur0, $('#spPg', body));
  $('#spSz', body).value = STP.w * 100; $('#spX', body).value = STP.hx * 100; $('#spY', body).value = STP.vy * 100;
  const r = $(`input[name=spw][value=${STP.where}]`, body); if (r) r.checked = true;
  const geo = p => {
    const W = p.w * +$('#spSz', body).value / 100, H = W * ar;
    return { W, H, x: (p.w - W) * +$('#spX', body).value / 100, y: Math.max(0, p.h - H) * +$('#spY', body).value / 100 };
  };
  const pv = () => {
    const pw = 170, ph = pw * cur0.h / cur0.w, pg = $('#spPg', body), im = $('#spIm', body);
    pg.style.width = pw + 'px'; pg.style.height = ph + 'px';
    const g = geo(cur0), k = pw / cur0.w;
    Object.assign(im.style, { width: g.W * k + 'px', left: g.x * k + 'px', top: g.y * k + 'px' });
    $('#spSzV', body).textContent = Math.round(+$('#spSz', body).value) + '%';
  };
  ['#spSz', '#spX', '#spY'].forEach(id => $(id, body).oninput = pv); pv();
  $('#spGo', body).onclick = () => {
    const where = $('input[name=spw]:checked', body).value;
    Object.assign(STP, { w: +$('#spSz', body).value / 100, hx: +$('#spX', body).value / 100, vy: +$('#spY', body).value / 100, where });
    closeSheet(true);
    const pages = where === 'all' ? S.pages : where === 'rest' ? S.pages.slice(cur0.index) : [cur0];
    const aid = uid(); S.assets[aid] = src;
    pushUndo();
    let sel = null;
    pages.forEach(p => {
      const g = geo(p), o = { type: 'image', id: uid(), asset: aid, x: g.x, y: g.y, w: g.W, h: g.H, opacity: 1, kind };
      annotsOf(p.id).push(o); renderOverlay(p);
      if (p === cur0) sel = o;
    });
    setTool('select');
    if (sel) select(cur0.id, sel.id);
    if (pages.length > 1) toast(`اتحط على ${pages.length} صفحة`);
  };
}
// كرر العنصر المحدد بنفس مكانه على كل الصفحات
function copyToAllPages() {
  const o = selObj(); if (!o) return; const p0 = selPage();
  pushUndo(); let n = 0;
  S.pages.forEach(p => {
    if (p === p0) return;
    const c = JSON.parse(JSON.stringify(o)); c.id = uid();
    if (c.x != null && p.w !== p0.w) { c.x *= p.w / p0.w; c.y *= p.h / p0.h; }
    annotsOf(p.id).push(c); renderOverlay(p); n++;
  });
  toast(n ? `اتكرر على ${n} صفحة تانية بنفس المكان` : 'الملف صفحة واحدة بس');
}
// قص الهيدر/الفوتر من الصفحة الحالية بدقة عالية
async function hfFromPage(k) {
  if (!S.pdf || curScreen() !== 'editor') { toast('افتح ملف PDF الأول'); return; }
  const p = S.hfPage || visiblePage(); let pct = k === 'header' ? 14 : 10, out = null;
  const pg = await S.pdf.getPage(p.index + 1);
  const sc = 2480 / p.w, vp = pg.getViewport({ scale: sc });
  const full = document.createElement('canvas'); full.width = Math.round(vp.width); full.height = Math.round(vp.height);
  busy(true, 'جاري التجهيز…');
  try { await pg.render({ canvasContext: full.getContext('2d'), viewport: vp, annotationMode: pdfjsLib.AnnotationMode.ENABLE_FORMS }).promise; } finally { busy(false); }
  const body = openSheet(`
    <div class="sh-head"><h3>${k === 'header' ? 'هيدر' : 'فوتر'} من صفحة ${p.index + 1}</h3></div>
    <div class="preview-box" id="hpv" style="min-height:0;padding:6px"></div>
    <div class="row"><span class="k">الارتفاع</span><input type="range" id="hpct" min="3" max="40" step="0.5" style="flex:1"><span id="hpctv"></span></div>
    <p style="font-size:12.5px;color:var(--muted);margin:0">حرّك المؤشر لحد ما ال${k === 'header' ? 'هيدر' : 'فوتر'} كله يبان في المعاينة.</p>
    <div class="row"><button class="btn pri" id="hSave" style="flex:1">حفظ في المكتبة</button><button class="btn" id="hUse">حفظ وإضافة</button></div>`);
  const paint = () => {
    const h = Math.round(full.height * pct / 100), y = k === 'header' ? 0 : full.height - h;
    out = document.createElement('canvas'); out.width = full.width; out.height = h;
    const ctx = out.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, out.width, h); ctx.drawImage(full, 0, y, full.width, h, 0, 0, full.width, h);
    const pv = $('#hpv', body); pv.innerHTML = ''; const c = out; c.style.width = '100%'; c.style.maxHeight = '160px'; c.style.objectFit = 'contain'; pv.appendChild(c);
    $('#hpctv', body).textContent = pct + '%';
  };
  $('#hpct', body).value = pct; $('#hpct', body).oninput = e => { pct = +e.target.value; paint(); };
  paint();
  const save = use => { const src = out.toDataURL('image/jpeg', 0.93); Lib.add(k, src); toast('تم الحفظ في المكتبة'); if (use) { S.hfPage = p; applyHFDialog(src, k); } else openHFSheet(); };
  $('#hSave', body).onclick = () => save(false); $('#hUse', body).onclick = () => save(true);
}
async function hfFromImage(k) {
  const f = await pickFile('fImg'); if (!f) return;
  const src = await normalizeImage(f, 4000);   // الصورة زي ما هي من غير قص (القص كان بيقطع سن اللوجو)
  Lib.add(k, src); toast('تم الحفظ في المكتبة'); applyHFDialog(src, k);
}
function hfDesigner(k) {
  const isH = k === 'header';
  const cfg = Object.assign({ ar: 'شركة مصاعد الفلك التجارية', ar2: '', en: 'AL FALAK ELEVATORS COMPANY', en2: '', mid: '', mid2: '', color: '#8a6d2b', txt: '#222222', line: true, logo: null },
    isH ? {} : { ar: '', en: '', mid: 'المملكة العربية السعودية — الرياض', mid2: 'Kingdom of Saudi Arabia — Riyadh', color: '#8a6d2b' });
  const body = openSheet(`
    <div class="sh-head"><h3>تصميم ${isH ? 'هيدر' : 'فوتر'}</h3></div>
    <div class="preview-box" id="hdPv" style="min-height:0;padding:6px"></div>
    <div class="hdgrid">
      <input class="field" id="hd_ar" placeholder="عربي (يمين)" dir="rtl"><input class="field" id="hd_en" placeholder="English (left)" dir="ltr">
      <input class="field" id="hd_ar2" placeholder="سطر عربي تاني" dir="rtl"><input class="field" id="hd_en2" placeholder="Second line" dir="ltr">
      <input class="field" id="hd_mid" placeholder="في النص (اختياري)" dir="auto" style="grid-column:1/-1"><input class="field" id="hd_mid2" placeholder="سطر تاني في النص" dir="auto" style="grid-column:1/-1">
    </div>
    <div class="row"><button class="chip" id="hdLogo">${icon('image')} لوجو في النص</button><label class="chip"><input type="checkbox" id="hdLine"> خط فاصل</label></div>
    <div class="row scroll"><span class="k">لون الخط الفاصل والعناوين</span><span id="hdCol" style="display:flex;gap:8px"></span></div>
    <div class="row"><button class="btn pri" id="hdSave" style="flex:1">حفظ وإضافة</button><button class="btn" id="hdOnly">حفظ فقط</button></div>`);
  const draw = () => {
    const W = 2480, H = isH ? 330 : 240, c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'), m = 120;
    if (cfg.line) { ctx.fillStyle = cfg.color; ctx.fillRect(m, isH ? H - 14 : 8, W - 2 * m, 6); }
    const top = isH ? 40 : 40, bot = isH ? H - 40 : H - 24, mid = (top + bot) / 2;
    const two = (a, b) => b ? [mid - 34, mid + 42] : [mid, mid];
    ctx.textBaseline = 'middle';
    const put = (t, x, y, al, sz, bold, col, dir) => { if (!t) return; ctx.font = `${bold ? 700 : 400} ${sz}px "Sub DIN ${bold ? 'Bold' : 'Light'}", "Cairo"`; ctx.fillStyle = col; ctx.textAlign = al; ctx.direction = dir; ctx.fillText(t, x, y); };
    let [y1, y2] = two(cfg.ar, cfg.ar2); put(cfg.ar, W - m, y1, 'right', 64, true, cfg.color, 'rtl'); put(cfg.ar2, W - m, y2, 'right', 42, false, cfg.txt, 'rtl');
    [y1, y2] = two(cfg.en, cfg.en2); put(cfg.en, m, y1, 'left', 58, true, cfg.color, 'ltr'); put(cfg.en2, m, y2, 'left', 40, false, cfg.txt, 'ltr');
    [y1, y2] = two(cfg.mid, cfg.mid2); put(cfg.mid, W / 2, y1, 'center', 46, false, cfg.txt, isRTL(cfg.mid) ? 'rtl' : 'ltr'); put(cfg.mid2, W / 2, y2, 'center', 40, false, cfg.txt, isRTL(cfg.mid2) ? 'rtl' : 'ltr');
    if (cfg.logo) { const lh = H - 70, lw = lh * cfg.logo.width / cfg.logo.height; ctx.drawImage(cfg.logo, W / 2 - lw / 2, (H - lh) / 2 - (isH ? 6 : -4), lw, lh); }
    return c;
  };
  const paint = () => {
    const pv = $('#hdPv', body); pv.innerHTML = ''; const c = draw(); c.style.width = '100%'; pv.appendChild(c);
    const cc = $('#hdCol', body); cc.innerHTML = ''; cc.appendChild(swatches(['#8a6d2b', '#123a3a', '#1f3a93', '#c0392b', '#000000'], cfg.color, v => { cfg.color = v; paint(); }));
  };
  ['ar', 'en', 'ar2', 'en2', 'mid', 'mid2'].forEach(key => { const i = $('#hd_' + key, body); i.value = cfg[key]; i.oninput = () => { cfg[key] = i.value; paint(); }; });
  $('#hdLine', body).checked = cfg.line; $('#hdLine', body).onchange = e => { cfg.line = e.target.checked; paint(); };
  $('#hdLogo', body).onclick = async () => { const f = await pickFile('fImg'); if (!f) return; const el = await loadImg(await normalizeImage(f, 1600)); const cb = trimBox(el); if (cb) { const c = document.createElement('canvas'); c.width = cb.W; c.height = cb.H; c.getContext('2d').drawImage(el, cb.X, cb.Y, cb.W, cb.H, 0, 0, cb.W, cb.H); cfg.logo = await loadImg(c.toDataURL()); } else cfg.logo = el; paint(); };
  Promise.all([fontReady('Sub DIN Bold'), fontReady('Sub DIN Light')]).then(paint);
  paint();
  const save = use => { const src = draw().toDataURL('image/png'); Lib.add(k, src); toast('تم الحفظ في المكتبة'); if (use) applyHFDialog(src, k); else openHFSheet(); };
  $('#hdSave', body).onclick = () => save(true); $('#hdOnly', body).onclick = () => save(false);
}

function libGrid(type, onPick, refresh) {
  const items = Lib.get().filter(x => x.type === type);
  const g = document.createElement('div');
  if (!items.length) { g.className = 'lib-empty'; g.textContent = type === 'sig' ? 'لا توجد تواقيع محفوظة بعد' : 'لا توجد أختام محفوظة بعد'; return g; }
  g.className = 'lib-grid';
  items.forEach(it => {
    const d = document.createElement('div'); d.className = 'lib-item';
    d.innerHTML = `<img src="${it.src}"><button class="x">×</button>`;
    d.onclick = e => { if (e.target.classList.contains('x')) { Lib.del(it.id); refresh(); return; } onPick(it.src); };
    g.appendChild(d);
  });
  return g;
}

/* ---------------- التوقيع ---------------- */
function openSignSheet(manage) {
  const body = openSheet(`
    <div class="sh-head"><h3>التوقيعات</h3></div>
    <div id="sgList"></div>
    <div class="row"><button class="btn pri" id="sgNew" style="flex:1">${icon('pen')} توقيع جديد</button><button class="btn" id="sgImg">${icon('image')} من صورة</button></div>`);
  const fill = () => { const l = $('#sgList', body); l.innerHTML = ''; l.appendChild(libGrid('sig', src => { closeSheet(); if (!manage) addImageObj(src, { kind: 'sig', w: 150 }); }, fill)); };
  fill();
  $('#sgNew', body).onclick = () => openSignPad(manage);
  $('#sgImg', body).onclick = () => importTransparent('sig');
}
function openSignPad(manage) {
  let color = '#1f3a93', width = 3.2;
  const body = openSheet(`
    <div class="sh-head"><h3>ارسم توقيعك</h3><button class="btn" id="spClear">مسح</button></div>
    <canvas class="sigpad" id="sp"></canvas>
    <div class="row"><span class="k">اللون</span><span id="spCol" style="display:flex;gap:8px"></span></div>
    <div class="row"><span class="k">السُمك</span><input type="range" id="spW" min="1.5" max="8" step=".25" style="flex:1"></div>
    <div class="row"><button class="btn pri" id="spSave" style="flex:1">حفظ ${manage ? '' : 'وإدراج'}</button><button class="btn" id="spOnce">${manage ? 'إلغاء' : 'إدراج بدون حفظ'}</button></div>`);
  const cv = $('#sp', body);
  const r = cv.getBoundingClientRect(); const k = 2;
  cv.width = r.width * k; cv.height = r.height * k;
  const ctx = cv.getContext('2d'); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const strokes = []; let curS = null;
  const redraw = () => { ctx.clearRect(0, 0, cv.width, cv.height); strokes.forEach(s => drawObj(ctx, { type: 'ink', pts: s.pts, color: s.color, width: s.width })); };
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); curS = { pts: [pos(e)], color, width }; strokes.push(curS); redraw(); };
  cv.onpointermove = e => { if (!curS) return; (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(ce => curS.pts.push(pos(ce))); redraw(); };
  cv.onpointerup = cv.onpointercancel = () => { curS = null; };
  const paint = () => { const c = $('#spCol', body); c.innerHTML = ''; c.appendChild(swatches(['#000000', '#1f3a93', '#0d47a1', '#c0392b'], color, v => { color = v; strokes.forEach(s => s.color = v); redraw(); paint(); })); };
  paint();
  $('#spW', body).value = width; $('#spW', body).oninput = e => { width = +e.target.value; strokes.forEach(s => s.width = width); redraw(); };
  $('#spClear', body).onclick = () => { strokes.length = 0; redraw(); };
  const finish = save => {
    if (!strokes.length) { toast('ارسم التوقيع أولاً'); return; }
    const t = trimCanvas(cv); if (!t) return;
    const src = t.toDataURL('image/png');
    if (save) Lib.add('sig', src);
    closeSheet(); if (!manage) addImageObj(src, { kind: 'sig', w: 150 }); else { toast('تم حفظ التوقيع'); }
  };
  $('#spSave', body).onclick = () => finish(true);
  $('#spOnce', body).onclick = () => manage ? closeSheet() : finish(false);
}

/* ---------------- الأختام ---------------- */
function drawStamp(cfg) {
  const lines = cfg.lines.filter(Boolean);
  const col = cfg.color, round = cfg.shape === 'circle';
  const W = round ? 600 : 900, H = round ? 600 : (cfg.date ? 360 : 300);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.globalAlpha = 0.92;
  if (round) {
    ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(300, 300, 284, 0, 7); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(300, 300, 252, 0, 7); ctx.stroke();
  } else {
    ctx.lineWidth = 14; roundRect(ctx, 10, 10, W - 20, H - 20, 26); ctx.stroke();
    ctx.lineWidth = 5; roundRect(ctx, 32, 32, W - 64, H - 64, 16); ctx.stroke();
  }
  const all = lines.slice(); if (cfg.date) all.push(todayStr());
  const n = all.length || 1;
  const area = round ? 330 : H - 110, maxW = round ? 400 : W - 120;
  let fs = Math.min(round ? 90 : 96, area / n / 1.35);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  all.forEach((l, i) => {
    let f = (i === 0 ? fs * 1.08 : (cfg.date && i === all.length - 1 ? fs * 0.75 : fs));
    ctx.font = `700 ${f}px "${cfg.font || 'Cairo'}"`; ctx.direction = isRTL(l) ? 'rtl' : 'ltr';
    while (ctx.measureText(l).width > maxW && f > 12) { f -= 2; ctx.font = `700 ${f}px "${cfg.font || 'Cairo'}"`; }
    const y = H / 2 + (i - (n - 1) / 2) * fs * 1.35;
    ctx.fillText(l, W / 2, y);
  });
  if (round && n <= 2) { ctx.font = '50px Cairo'; ctx.fillText('★', 300, 300 - 150); ctx.fillText('★', 300, 300 + 150); }
  return c;
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function openStampSheet(manage) {
  const presets = [['معتمد', '#0e7c61'], ['تمت المراجعة', '#1f3a93'], ['مدفوع', '#0e7c61'], ['مرفوض', '#c0392b'], ['نسخة', '#7f8c8d'], ['سري', '#c0392b'], ['عاجل', '#d35400'], ['APPROVED', '#0e7c61']];
  const body = openSheet(`
    <div class="sh-head"><h3>الأختام</h3></div>
    <div class="sec-title">أختام سريعة (مع التاريخ)</div>
    <div class="row scroll" id="stPre"></div>
    <div class="sec-title">أختامك المحفوظة</div>
    <div id="stList"></div>
    <div class="row"><button class="btn pri" id="stNew" style="flex:1">${icon('stamp')} تصميم ختم</button><button class="btn" id="stImg">${icon('image')} ختم من صورة</button></div>`);
  presets.forEach(([t, c]) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = t; b.style.color = c; b.style.borderColor = c; b.onclick = () => { const cv = drawStamp({ shape: 'rect', lines: [t], color: c, date: true }); closeSheet(); if (!manage) placeStampDialog(cv.toDataURL('image/png'), { kind: 'stamp', w: 130 }); }; $('#stPre', body).appendChild(b); });
  const fill = () => { const l = $('#stList', body); l.innerHTML = ''; l.appendChild(libGrid('stamp', src => { closeSheet(); if (!manage) placeStampDialog(src, { kind: 'stamp', w: 120 }); }, fill)); };
  fill();
  $('#stNew', body).onclick = () => openStampBuilder(manage);
  $('#stImg', body).onclick = () => importTransparent('stamp');
}
function openStampBuilder(manage) {
  const cfg = { shape: 'circle', lines: ['مصاعد الفلك', 'للتجارة', ''], color: '#1f3a93', date: false, font: 'Cairo' };
  const body = openSheet(`
    <div class="sh-head"><h3>تصميم ختم</h3></div>
    <div class="preview-box" id="sbPv"></div>
    <div class="row"><div class="seg" id="sbShape"><button data-s="circle" style="padding:7px 16px">دائري</button><button data-s="rect" style="padding:7px 16px">مستطيل</button></div>
      <label class="chip"><input type="checkbox" id="sbDate"> التاريخ</label></div>
    <input class="field" id="sb0" placeholder="السطر الأول" dir="auto" style="margin-bottom:8px">
    <input class="field" id="sb1" placeholder="السطر الثاني" dir="auto" style="margin-bottom:8px">
    <input class="field" id="sb2" placeholder="السطر الثالث (اختياري)" dir="auto">
    <div class="row"><span class="k">اللون</span><span id="sbCol" style="display:flex;gap:8px"></span></div>
    <div class="row"><button class="btn pri" id="sbSave" style="flex:1">حفظ ${manage ? '' : 'وإدراج'}</button></div>`);
  const paint = () => {
    const pv = $('#sbPv', body); pv.innerHTML = ''; const c = drawStamp(cfg); c.style.maxHeight = '170px'; pv.appendChild(c);
    $$('#sbShape button', body).forEach(b => b.classList.toggle('on', b.dataset.s === cfg.shape));
    const sc = $('#sbCol', body); sc.innerHTML = ''; sc.appendChild(swatches(STAMP_COLORS, cfg.color, v => { cfg.color = v; paint(); }));
  };
  [0, 1, 2].forEach(i => { const inp = $('#sb' + i, body); inp.value = cfg.lines[i]; inp.oninput = () => { cfg.lines[i] = inp.value; paint(); }; });
  $$('#sbShape button', body).forEach(b => b.onclick = () => { cfg.shape = b.dataset.s; paint(); });
  $('#sbDate', body).onchange = e => { cfg.date = e.target.checked; paint(); };
  paint();
  $('#sbSave', body).onclick = () => { const src = drawStamp(cfg).toDataURL('image/png'); Lib.add('stamp', src); closeSheet(); if (!manage) placeStampDialog(src, { kind: 'stamp', w: cfg.shape === 'circle' ? 110 : 140 }); else toast('تم حفظ الختم'); };
}

/* ---------------- التاريخ ---------------- */
function openDateSheet() {
  const body = openSheet(`<div class="sh-head"><h3>إدراج التاريخ</h3></div><div class="menu-list" id="dl"></div>`);
  ['iso', 'ar', 'long'].forEach(k => {
    const b = document.createElement('button'); b.innerHTML = icon('date') + todayStr(k);
    b.onclick = () => { closeSheet(true); const at = S.insertAt; S.insertAt = null; const p = at ? at.p : visiblePage(), v = $('#viewer'), s = scale(); const y = at ? at.y : (v.scrollTop + v.clientHeight / 2 - p.el.offsetTop) / s; openTextSheet(null, p, at ? at.x : p.w / 2, clamp(y, 10, p.h - 10)); const t = $('#tTxt'); t.value = todayStr(k); t.dispatchEvent(new Event('input')); };
    $('#dl', body).appendChild(b);
  });
}

/* ================= التصدير (بناء ملف PDF النهائي) ================= */
async function rasterPng(o) {
  const b = bbox(o), k = clamp(4, 1, 3000 / Math.max(b.w, b.h));
  const c = objCanvas(o, k);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}
async function buildFinal(bytes = S.bytes, annots = S.annots, pageIds = S.pageIds, pdf = S.pdf) {
  const used = new Set(); Object.values(annots).forEach(l => (l || []).forEach(o => o.type === 'text' && used.add(o.font)));
  await Promise.all([...used].map(fontReady));
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = doc.getPages();
  const embedCache = {};
  for (let i = 0; i < pages.length; i++) {
    const list = annots[pageIds[i]];
    if (!list || !list.length) continue;
    const page = pages[i];
    const vp = (await pdf.getPage(i + 1)).getViewport({ scale: 1 });
    const place = (b) => {
      const P = vp.convertToPdfPoint(b.x, b.y + b.h), Q = vp.convertToPdfPoint(b.x + b.w, b.y + b.h);
      return { x: P[0], y: P[1], rot: Math.atan2(Q[1] - P[1], Q[0] - P[0]) * 180 / Math.PI };
    };
    for (const o of list) {
      const b = bbox(o);
      if (o.type === 'note') {
        addNoteAnnot(doc, page, vp, o); continue;
      }
      let img;
      if (o.type === 'image') {
        const src = S.assets[o.asset];
        if (!embedCache[o.asset]) { const by = await dataUrlToBytes(src); embedCache[o.asset] = /^data:image\/jpe?g/i.test(src) ? await doc.embedJpg(by) : await doc.embedPng(by); }
        img = embedCache[o.asset];
      } else img = await doc.embedPng(await rasterPng(o));
      const pl = place(b);
      page.drawImage(img, { x: pl.x, y: pl.y, width: b.w, height: b.h, rotate: degrees(pl.rot), opacity: o.type === 'image' ? (o.opacity == null ? 1 : o.opacity) : 1 });
    }
  }
  doc.setProducer('Arabic PDF Pro — by MOHENDI'); doc.setModificationDate(new Date());
  return await doc.save();
}
function addNoteAnnot(doc, page, vp, o) {
  try {
    const P = vp.convertToPdfPoint(o.x, o.y + 22), Q = vp.convertToPdfPoint(o.x + 22, o.y);
    const x1 = Math.min(P[0], Q[0]), y1 = Math.min(P[1], Q[1]), x2 = Math.max(P[0], Q[0]), y2 = Math.max(P[1], Q[1]);
    const hex = o.color.replace('#', ''); const C = [0, 2, 4].map(i => parseInt(hex.substr(i, 2), 16) / 255);
    const ctx = doc.context;
    const ops = [PDFLib.pushGraphicsState(), PDFLib.setFillingRgbColor(C[0], C[1], C[2]), PDFLib.setStrokingRgbColor(0.3, 0.3, 0.3), PDFLib.setLineWidth(0.8),
      PDFLib.moveTo(1, 7), PDFLib.lineTo(19, 7), PDFLib.lineTo(19, 21), PDFLib.lineTo(1, 21), PDFLib.closePath(), PDFLib.fillAndStroke(),
      PDFLib.moveTo(4, 7), PDFLib.lineTo(4, 2), PDFLib.lineTo(9, 7), PDFLib.closePath(), PDFLib.fillAndStroke(), PDFLib.popGraphicsState()];
    const ap = ctx.formXObject(ops, { BBox: [0, 0, 20, 22], Matrix: [1, 0, 0, 1, 0, 0] });
    const apRef = ctx.register(ap);
    const annot = ctx.obj({ Type: 'Annot', Subtype: 'Text', Rect: [x1, y1, x2, y2], Contents: PDFLib.PDFHexString.fromText(o.text), T: PDFLib.PDFHexString.fromText('ملاحظة'), Name: 'Comment', C, F: 4, Open: false, AP: { N: apRef } });
    const ref = ctx.register(annot);
    page.node.addAnnot(ref);
  } catch (e) { console.warn('note', e); }
}

/* ---------------- الحفظ والمشاركة ---------------- */
let saveCb = null;
window.nativeCallback = (type, ok, msg) => {
  if (type === 'saved') {
    busy(false);
    if (ok) { S.dirty = false; if (msg && msg !== 'cancel') { S.name = msg; $('#docTitle').textContent = msg; } toast('تم الحفظ ✓'); }
    else if (msg !== 'cancel') toast(msg || 'تعذر الحفظ');
    const f = saveCb; saveCb = null; if (f) f(ok);
  }
};
async function finalBytes() { busy(true, 'جاري تجهيز الملف…'); try { return await buildFinal(); } finally { busy(false); } }
function downloadBlob(bytes, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
async function saveDoc(asNew, cb) {
  deselect();
  let bytes; try { bytes = await finalBytes(); } catch (e) { console.error(e); toast('حدث خطأ أثناء تجهيز الملف'); return; }
  saveCb = cb || null;
  if (N) {
    busy(true, 'جاري الحفظ…');
    const b64 = bytesToB64(bytes);
    if (!asNew && N.canSaveOriginal()) N.saveOriginal(b64);
    else N.saveAs(b64, asNew ? baseName(S.name) + ' - معدل.pdf' : S.name);
  } else {
    const name = asNew ? baseName(S.name) + ' - معدل.pdf' : S.name;
    // آيفون/موبايل من المتصفح: قائمة المشاركة (حفظ في الملفات، واتساب…)
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
    const f = typeof File !== 'undefined' ? new File([bytes], name, { type: 'application/pdf' }) : null;
    if (mobile && f && navigator.canShare && navigator.canShare({ files: [f] })) {
      try { await navigator.share({ files: [f], title: name }); window.nativeCallback('saved', true, 'cancel'); }
      catch (e) { if (e && e.name !== 'AbortError') downloadBlob(bytes, name); window.nativeCallback('saved', false, 'cancel'); }
    } else { downloadBlob(bytes, name); window.nativeCallback('saved', true, 'cancel'); }
  }
}
async function shareDoc() {
  deselect();
  const bytes = await finalBytes();
  if (N) N.share(bytesToB64(bytes), S.name);
  else if (navigator.share && navigator.canShare) { const f = new File([bytes], S.name, { type: 'application/pdf' }); try { await navigator.share({ files: [f] }); } catch (e) { } }
  else downloadBlob(bytes, S.name);
}

/* ---------------- قائمة المزيد ---------------- */
function openMoreMenu() {
  const body = openSheet(`<div class="menu-list" id="ml"></div>`);
  const items = [
    ['save', 'حفظ', () => saveDoc(false)], ['copy', 'حفظ باسم… (نسخة جديدة)', () => saveDoc(true)], ['share', 'مشاركة', shareDoc],
    ['search', 'بحث في المستند', openSearch], ['goto', 'انتقال إلى صفحة', openGoto], ['grid', 'تنظيم الصفحات', openOrganizer],
    ['edit', 'إعادة تسمية الملف', openRename], ['stamp', 'التواقيع والأختام المحفوظة', openLibManager], ['info', 'معلومات الملف', openInfo], ['info', 'عن التطبيق', openAbout],
    ['discard', 'تجاهل كل التعديلات', discardAll, 'danger'],
  ];
  items.forEach(([ic, t, fn, cls]) => { const b = document.createElement('button'); b.innerHTML = icon(ic) + t; if (cls) b.className = cls; b.onclick = () => { closeSheet(true); fn(); }; $('#ml', body).appendChild(b); });
}
function discardAll() {
  if (!S.dirty && !Object.values(S.annots).some(a => a.length)) { toast('لا توجد تعديلات'); return; }
  confirmSheet('تجاهل كل التعديلات غير المحفوظة؟', 'تجاهل', () => { pushUndo(); S.annots = {}; S.sel = null; S.pages.forEach(renderOverlay); updateSelbar(); toast('تم — يمكنك التراجع'); }, true);
}
function confirmSheet(msg, okText, fn, danger) {
  const body = openSheet(`<div class="sh-head"><h3>${msg}</h3></div><div class="row"><button class="btn ${danger ? 'danger' : 'pri'}" id="cOk" style="flex:1">${okText}</button><button class="btn" id="cNo" style="flex:1">إلغاء</button></div>`);
  $('#cOk', body).onclick = () => { closeSheet(true); fn(); }; $('#cNo', body).onclick = () => closeSheet(true);
}
function openGoto() {
  const body = openSheet(`<div class="sh-head"><h3>انتقال إلى صفحة</h3></div><div class="row"><input class="field" id="gN" type="number" min="1" max="${S.pages.length}" placeholder="1 - ${S.pages.length}" style="flex:1"><button class="btn pri" id="gGo">انتقال</button></div>`);
  const go = () => { const n = clamp(parseInt($('#gN', body).value) || 1, 1, S.pages.length); closeSheet(true); scrollToPage(n - 1); };
  $('#gGo', body).onclick = go; $('#gN', body).onkeydown = e => { if (e.key === 'Enter') go(); };
  setTimeout(() => $('#gN', body).focus(), 250);
}
function scrollToPage(i, yPt) { const p = S.pages[i]; if (!p) return; const v = $('#viewer'); v.scrollTop = p.el.offsetTop - 10 + (yPt ? yPt * scale() - v.clientHeight / 3 : 0); }
function openRename() {
  const body = openSheet(`<div class="sh-head"><h3>اسم الملف</h3></div><div class="row"><input class="field" id="rn" dir="auto" style="flex:1"><button class="btn pri" id="rOk">تم</button></div>`);
  $('#rn', body).value = baseName(S.name);
  $('#rOk', body).onclick = () => { const v = $('#rn', body).value.trim(); if (v) { S.name = v + '.pdf'; $('#docTitle').textContent = S.name; } closeSheet(true); };
}
async function openInfo() {
  let meta = {}; try { meta = (await S.pdf.getMetadata()).info || {}; } catch (e) { }
  const p = S.pages[0]; const mm = v => Math.round(v * 25.4 / 72);
  const cnt = Object.values(S.annots).reduce((a, l) => a + l.length, 0);
  openSheet(`<div class="sh-head"><h3>معلومات الملف</h3></div><table class="info-table">
    <tr><td>الاسم</td><td dir="auto">${S.name}</td></tr><tr><td>عدد الصفحات</td><td>${S.pages.length}</td></tr>
    <tr><td>الحجم</td><td>${fmtSize(S.bytes.length)}</td></tr><tr><td>مقاس الصفحة</td><td dir="ltr" style="text-align:right">${mm(p.w)} × ${mm(p.h)} mm</td></tr>
    <tr><td>العنوان</td><td dir="auto">${meta.Title || '—'}</td></tr><tr><td>المؤلف</td><td dir="auto">${meta.Author || '—'}</td></tr>
    <tr><td>البرنامج المنشئ</td><td dir="auto">${meta.Creator || meta.Producer || '—'}</td></tr><tr><td>عدد الإضافات</td><td>${cnt}</td></tr></table>`);
}
function openAbout() {
  openSheet(`<div class="about" dir="ltr">
    <div class="logo"><svg viewBox="0 0 48 48"><rect x="10" y="6" width="28" height="36" rx="3" fill="#fff"/><path d="M30 6h8v8z" fill="#9fc0c0"/><rect x="15" y="15" width="18" height="2.4" rx="1.2" fill="#9fb3b3"/><rect x="15" y="21" width="14" height="2.4" rx="1.2" fill="#9fb3b3"/><path d="M24 38l12-12 3 3-12 12-4 1z" fill="#e88c28"/></svg></div>
    <h2>Arabic PDF Pro</h2><p>Version 0.21</p><p dir="rtl">تعديل ملفات PDF بالعربي والإنجليزي</p>
    <p class="by">Created by <b>MOHENDI</b></p><button class="contact-btn" id="abContact">✉ تواصل مع المطور</button></div>`);
  $('#abContact').onclick = () => openContact();
}
/* ---------- تواصل مع المطور: الرسالة بتتبعت للإيميل من غير ما يظهر للمستخدم ---------- */
const DEV_KEY = '2540ff401ed06a3e0d1e423ef2be8ae5';   // العنوان السري من FormSubmit
const DEV_BOX = 'YWJvbW9zYTFAeWFob28uY29t';
const nativeWaits = {};
window.nativePostDone = (id, status, body) => { const f = nativeWaits[id]; delete nativeWaits[id]; if (f) f({ status, body }); };
function nativePost(url, json) { return new Promise(res => { const id = uid(); nativeWaits[id] = res; N.postJson(id, url, json); setTimeout(() => { if (nativeWaits[id]) { delete nativeWaits[id]; res({ status: 0, body: '{"message":"انتهت المهلة — النت بطيء"}' }); } }, 25000); }); }
function openContact() {
  const types = [['اقتراح', 'اقتراح'], ['مشكلة', 'مشكلة في التطبيق'], ['استفسار', 'استفسار']];
  let type = types[0][0];
  const body = openSheet(`
    <div class="sh-head"><h3>تواصل مع المطور</h3></div>
    <p style="margin:0 0 8px;color:var(--muted);font-size:13px">اكتب اقتراحك أو المشكلة اللي قابلتك، والرسالة هتوصل للمطور مباشرة.</p>
    <div class="row" id="ctTypes" style="margin:6px 0"></div>
    <textarea class="field" id="ctMsg" dir="auto" placeholder="اكتب رسالتك هنا…" style="min-height:120px;font-size:16px"></textarea>
    <input class="field" id="ctName" dir="auto" placeholder="اسمك (اختياري)" style="margin-top:8px">
    <input class="field" id="ctBack" dir="auto" placeholder="إيميلك أو رقمك عشان نرد عليك (اختياري)" style="margin-top:8px">
    <div class="row"><button class="btn pri" id="ctSend" style="flex:1">إرسال</button></div>`);
  const paint = () => { const r = $('#ctTypes', body); r.innerHTML = ''; types.forEach(([k, n]) => { const c = document.createElement('button'); c.className = 'chip' + (k === type ? ' on' : ''); c.textContent = n; c.onclick = () => { type = k; paint(); }; r.appendChild(c); }); };
  paint();
  setTimeout(() => $('#ctMsg', body).focus(), 250);
  $('#ctSend', body).onclick = async () => {
    const msg = $('#ctMsg', body).value.trim();
    if (!msg) { toast('اكتب الرسالة الأول'); return; }
    if (!navigator.onLine) { toast('مفيش إنترنت — اتصل بالنت وجرب تاني'); return; }
    const btn = $('#ctSend', body); btn.disabled = true; btn.textContent = 'جاري الإرسال…';
    try {
      const payload = JSON.stringify({ _subject: `Arabic PDF Pro — ${type}`, _template: 'table', _captcha: 'false',
          'النوع': type, 'الرسالة': msg, 'الاسم': $('#ctName', body).value.trim() || '—', 'للرد': $('#ctBack', body).value.trim() || '—',
          'التطبيق': 'Arabic PDF Pro ' + (document.querySelector('.home-foot') ? document.querySelector('.home-foot').textContent.match(/Version [\d.]+/)?.[0] || '' : ''),
          'الجهاز': navigator.userAgent });
      // العنوان السري الأول، ولو فشل لأي سبب نجرب العنوان الأصلي
      const send = async key => {
        const url = 'https://formsubmit.co/ajax/' + key;
        let status = 0, text = '';
        if (N && N.postJson) { const res = await nativePost(url, payload); status = res.status; text = res.body; }   // الإرسال من أندرويد نفسه
        else { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: payload }); status = r.status; text = await r.text(); }
        let j = {}; try { j = JSON.parse(text); } catch (e) { }
        return { status, j };
      };
      let { status, j } = await send(DEV_KEY);
      if (!(status >= 200 && status < 300 && String(j.success) !== 'false')) ({ status, j } = await send(atob(DEV_BOX)));
      const m = String(j.message || '');
      if ((status >= 200 && status < 300 && String(j.success) !== 'false') || /activat/i.test(m)) { closeSheet(true); toast('تم إرسال رسالتك — شكراً ليك 🌷', 3000); }
      else throw new Error(m || ('HTTP ' + status));
    } catch (e) { console.warn(e); btn.disabled = false; btn.textContent = 'إرسال'; toast('تعذر الإرسال: ' + (e.message || 'تأكد من النت'), 5000); }
  };
}
function openLibManager() {
  const body = openSheet(`<div class="sh-head"><h3>التواقيع والأختام</h3></div>
    <div class="menu-list"><button id="lmS">${icon('sign')} التوقيعات</button><button id="lmT">${icon('stamp')} الأختام</button><button id="lmH">${icon('hf')} الهيدر والفوتر</button></div>`);
  $('#lmH', body).onclick = () => { if (curScreen() !== 'editor') { toast('افتح ملف الأول عشان تضيف هيدر أو فوتر'); } openHFSheet(); };
  $('#lmS', body).onclick = () => openSignSheet(true); $('#lmT', body).onclick = () => openStampSheet(true);
}

/* ---------------- البحث ---------------- */
const normAr = s => s.normalize('NFKC').replace(/[ً-ْـ‌-‏]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
function openSearch() { $('#searchbar').classList.remove('hidden'); setTimeout(() => $('#searchInput').focus(), 100); }
function closeSearch() { $('#searchbar').classList.add('hidden'); S.search = { results: [], i: -1, q: '' }; $('#searchCount').textContent = ''; $$('.flash').forEach(e => e.remove()); }
async function pageText(i) {
  if (S.textCache[i]) return S.textCache[i];
  const pg = await S.pdf.getPage(i + 1); const tc = await pg.getTextContent();
  const items = tc.items.filter(it => it.str != null);
  // نص الصفحة مُطبَّع مع خريطة من كل حرف إلى العنصر الذي جاء منه
  let text = '', map = [];
  items.forEach((it, k) => {
    const n = normAr(it.str || '');
    for (const ch of n) { text += ch; map.push(k); }
    if (it.hasEOL) { text += '\n'; map.push(-1); }
  });
  return (S.textCache[i] = { items, text, map });
}
async function runSearch() {
  const q = normAr($('#searchInput').value.trim()); if (!q) return;
  if (q === S.search.q && S.search.results.length) return stepSearch(1);
  $('#searchCount').textContent = '…';
  const qr = [...q].reverse().join('');
  const res = [];
  for (let i = 0; i < S.pages.length; i++) {
    const t = await pageText(i);
    const seen = new Set();
    for (const needle of (qr !== q ? [q, qr] : [q])) {
      let pos = t.text.indexOf(needle);
      while (pos >= 0) {
        if (!seen.has(pos)) { seen.add(pos); const ks = new Set(t.map.slice(pos, pos + needle.length).filter(k => k >= 0)); res.push({ i, pos, ks: [...ks] }); }
        pos = t.text.indexOf(needle, pos + 1);
      }
    }
  }
  res.sort((a, b) => a.i - b.i || a.pos - b.pos);
  S.search = { results: res, i: -1, q };
  if (!res.length) { $('#searchCount').textContent = '0'; toast('لا توجد نتائج'); return; }
  stepSearch(1);
}
async function stepSearch(d) {
  const r = S.search; if (!r.results.length) return;
  r.i = (r.i + d + r.results.length) % r.results.length;
  $('#searchCount').textContent = `${r.i + 1}/${r.results.length}`;
  const { i, ks } = r.results[r.i]; const p = S.pages[i];
  const t = await pageText(i);
  const vp = (await S.pdf.getPage(i + 1)).getViewport({ scale: 1 });
  let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
  ks.forEach(k => {
    const it = t.items[k]; const tx = pdfjsLib.Util.transform(vp.transform, it.transform);
    const fh = Math.hypot(tx[2], tx[3]) || 10, w = it.width * vp.scale;
    x1 = Math.min(x1, tx[4]); x2 = Math.max(x2, tx[4] + w); y1 = Math.min(y1, tx[5] - fh); y2 = Math.max(y2, tx[5] + fh * 0.25);
  });
  const s = scale();
  $$('.flash').forEach(e => e.remove());
  const f = document.createElement('div'); f.className = 'flash';
  Object.assign(f.style, { left: x1 * s + 'px', top: y1 * s + 'px', width: Math.max(x2 - x1, 6) * s + 'px', height: (y2 - y1) * s + 'px' });
  p.el.querySelector('.overlay').appendChild(f);
  scrollToPage(i, y1);
}

/* ================= منظم الصفحات ================= */
const ORG = { sel: new Set() };
async function openOrganizer() {
  deselect(); showScreen('organizer'); ORG.sel.clear(); await renderOrg();
}
async function renderOrg() {
  const g = $('#orgGrid'); g.innerHTML = '';
  for (let i = 0; i < S.pages.length; i++) {
    const p = S.pages[i];
    const d = document.createElement('div'); d.className = 'thumb' + (ORG.sel.has(i) ? ' on' : '');
    d.innerHTML = `<span class="chk"></span><span class="n">${i + 1}</span>`;
    d.dataset.i = i;
    d.onclick = () => { if (ORG.justDragged) return; ORG.sel.has(i) ? ORG.sel.delete(i) : ORG.sel.add(i); d.classList.toggle('on'); updateOrgBar(); };
    bindThumbDrag(d, i);
    g.appendChild(d);
    (async () => {
      const pg = await S.pdf.getPage(i + 1); const sc = 260 / Math.max(p.w, p.h);
      const vp = pg.getViewport({ scale: sc }); const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
      await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      // ارسم الإضافات فوق المصغرة
      const ctx = c.getContext('2d'); ctx.save(); ctx.scale(sc, sc);
      for (const o of annotsOf(p.id)) { if (o.type === 'image') { try { ctx.drawImage(await loadImg(S.assets[o.asset]), o.x, o.y, o.w, o.h); } catch (e) { } } else drawObj(ctx, o); }
      ctx.restore();
      d.insertBefore(c, d.firstChild);
    })();
  }
  updateOrgBar();
}
/* ---------- ترتيب الصفحات بالسحب والإفلات ---------- */
function bindThumbDrag(d, i) {
  d.addEventListener('pointerdown', e => {
    if (ORG.drag) return;
    const sx = e.clientX, sy = e.clientY; let started = false;
    const timer = setTimeout(() => { started = true; startThumbDrag(d, i, e.clientX, e.clientY, e.pointerId); }, 380);
    const mv = ev => { if (!started && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10) cancel(); };
    const cancel = () => { clearTimeout(timer); d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', cancel); d.removeEventListener('pointercancel', cancel); };
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', cancel); d.addEventListener('pointercancel', cancel);
  });
  d.addEventListener('contextmenu', e => e.preventDefault());
}
function startThumbDrag(d, i, cx, cy, pid) {
  if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) { }
  // لو الصفحة متحددة اسحب كل المتحدد، غير كده اسحب الصفحة دي بس
  const moving = ORG.sel.has(i) ? [...ORG.sel].sort((a, b) => a - b) : [i];
  const g = $('#orgGrid');
  const ghost = document.createElement('div'); ghost.className = 'drag-ghost';
  const cv = d.querySelector('canvas'); if (cv) { const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; c2.getContext('2d').drawImage(cv, 0, 0); ghost.appendChild(c2); }
  if (moving.length > 1) { const b = document.createElement('span'); b.className = 'cnt'; b.textContent = moving.length; ghost.appendChild(b); }
  document.body.appendChild(ghost);
  const bar = document.createElement('div'); bar.className = 'drop-bar'; g.appendChild(bar);
  moving.forEach(k => { const t = g.querySelector(`.thumb[data-i="${k}"]`); if (t) t.classList.add('dragging'); });
  ORG.drag = { moving, target: null, ghost, bar, wasSel: ORG.sel.has(i) };
  const place = (x, y) => {
    ghost.style.left = x + 'px'; ghost.style.top = y + 'px';
    const thumbs = $$('.thumb', g); let best = null, bd = 1e9;
    thumbs.forEach(t => { const r = t.getBoundingClientRect(); const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2); const dist = Math.hypot(dx, dy * 1.4); if (dist < bd) { bd = dist; best = { t, r }; } });
    if (!best) return;
    const idx = +best.t.dataset.i, rtl = getComputedStyle(g).direction === 'rtl';
    const after = rtl ? x < best.r.left + best.r.width / 2 : x > best.r.left + best.r.width / 2;
    ORG.drag.target = idx + (after ? 1 : 0);
    const gr = g.getBoundingClientRect(), edgeX = (after !== rtl) ? best.r.right + 6 : best.r.left - 8;
    Object.assign(bar.style, { left: (edgeX - gr.left + g.scrollLeft) + 'px', top: (best.r.top - gr.top + g.scrollTop) + 'px', height: best.r.height + 'px' });
    // تمرير تلقائي لما تقرب من الحافة
    ORG.drag.auto = y < gr.top + 60 ? -1 : y > gr.bottom - 60 ? 1 : 0;
  };
  place(cx, cy);
  const tick = () => { if (!ORG.drag) return; if (ORG.drag.auto) { g.scrollTop += ORG.drag.auto * 12; } ORG.drag.raf = requestAnimationFrame(tick); };
  tick();
  const mv = ev => { ev.preventDefault(); place(ev.clientX, ev.clientY); ORG.drag.lx = ev.clientX; ORG.drag.ly = ev.clientY; };
  const tmv = ev => { if (ORG.drag) ev.preventDefault(); };   // يمنع السكرول وإحنا بنسحب
  const up = async () => {
    window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    document.removeEventListener('touchmove', tmv);
    const dr = ORG.drag; ORG.drag = null; cancelAnimationFrame(dr.raf);
    ghost.remove(); bar.remove(); $$('.thumb.dragging').forEach(t => t.classList.remove('dragging'));
    ORG.justDragged = true; setTimeout(() => ORG.justDragged = false, 350);
    if (dr.target == null) return;
    const n = S.pages.length, M = new Set(dr.moving);
    const rest = [...Array(n).keys()].filter(k => !M.has(k));
    const pos = rest.filter(k => k < dr.target).length;
    const order = [...rest.slice(0, pos), ...dr.moving, ...rest.slice(pos)];
    if (order.every((v, k) => v === k)) return;
    busy(true, 'جاري الترتيب…');
    try {
      const doc = await rebuildOrder(order); const ids = order.map(k => S.pageIds[k]);
      ORG.sel = dr.wasSel ? new Set(dr.moving.map((_, j) => pos + j)) : new Set();
      await applyStructure(doc, ids);
    } catch (e) { console.error(e); toast('حدث خطأ'); } finally { busy(false); }
  };
  window.addEventListener('pointermove', mv, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  document.addEventListener('touchmove', tmv, { passive: false });
}
const ORG_ACTIONS = [
  ['rotate', 'rotate', 'تدوير', true, () => orgRotate()], ['copy', 'copy', 'تكرار', true, () => orgDuplicate()],
  ['blank', 'blank', 'صفحة فارغة', false, () => orgBlank()], ['merge', 'merge', 'إدراج PDF', false, () => orgInsertPdf()],
  ['image', 'image', 'صورة كصفحة', false, () => orgInsertImages()], ['scan', 'scan', 'Scan · مسح', false, () => { busy(false); scanStart(true); }], ['extract', 'extract', 'استخراج', true, () => orgExtract()],
  ['trash', 'trash', 'حذف', true, () => orgDelete()],
];
function updateOrgBar() {
  const bar = $('#orgBar');
  if (!bar.children.length) ORG_ACTIONS.forEach(([id, ic, t, need, fn]) => { const b = document.createElement('button'); b.className = 'tool'; b.dataset.need = need ? 1 : ''; b.innerHTML = icon(ic) + `<b>${t}</b>`; b.onclick = async () => { busy(true, 'جاري التنفيذ…'); try { await fn(); } catch (e) { console.error(e); toast('حدث خطأ'); } finally { busy(false); } }; bar.appendChild(b); });
  $$('#orgBar .tool').forEach(b => b.disabled = b.dataset.need && !ORG.sel.size);
  $('#orgAll').textContent = ORG.sel.size === S.pages.length ? 'إلغاء التحديد' : 'تحديد الكل';
}
async function applyStructure(doc, ids) {
  const bytes = await doc.save();
  S.pageIds = ids; S.undo = []; S.redo = []; S.dirty = true; updateUndo();
  await reloadBytes(bytes, false);
  await renderOrg();
}
const loadLib = (b = S.bytes) => PDFDocument.load(b, { ignoreEncryption: true });
const selIdx = () => [...ORG.sel].sort((a, b) => a - b);
async function orgRotate() {
  const idx = selIdx();
  // تثبيت الإضافات على الصفحات المحددة قبل التدوير
  const has = idx.some(i => (S.annots[S.pageIds[i]] || []).length);
  let bytes = S.bytes;
  if (has) { const sub = {}; idx.forEach(i => sub[S.pageIds[i]] = S.annots[S.pageIds[i]]); bytes = await buildFinal(S.bytes, sub); idx.forEach(i => delete S.annots[S.pageIds[i]]); toast('تم تثبيت الإضافات على الصفحات قبل التدوير'); }
  const doc = await loadLib(bytes);
  idx.forEach(i => { const pg = doc.getPage(i); pg.setRotation(degrees((pg.getRotation().angle + 90) % 360)); });
  await applyStructure(doc, S.pageIds.slice());
}
async function orgDelete() {
  const idx = selIdx();
  if (idx.length >= S.pages.length) { toast('لا يمكن حذف كل الصفحات'); return; }
  const doc = await loadLib(); const ids = S.pageIds.slice();
  idx.reverse().forEach(i => { doc.removePage(i); ids.splice(i, 1); });
  ORG.sel.clear(); await applyStructure(doc, ids);
}
async function orgDuplicate() {
  const idx = selIdx(); const doc = await loadLib(); const ids = S.pageIds.slice();
  for (const i of idx.reverse()) {
    const [cp] = await doc.copyPages(doc, [i]); doc.insertPage(i + 1, cp);
    const nid = uid(); ids.splice(i + 1, 0, nid);
    S.annots[nid] = JSON.parse(JSON.stringify(S.annots[S.pageIds[i]] || [])).map(o => ({ ...o, id: uid() }));
  }
  ORG.sel.clear(); await applyStructure(doc, ids);
}
async function rebuildOrder(order) {
  const src = await loadLib(); const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, order); pages.forEach(p => doc.addPage(p));
  return doc;
}
async function orgMove(d) {
  const idx = selIdx(); const n = S.pages.length; const order = [...Array(n).keys()];
  if (d < 0) { if (idx[0] === 0) return; idx.forEach(i => { [order[i - 1], order[i]] = [order[i], order[i - 1]]; }); }
  else { if (idx[idx.length - 1] === n - 1) return; idx.slice().reverse().forEach(i => { [order[i + 1], order[i]] = [order[i], order[i + 1]]; }); }
  const doc = await rebuildOrder(order); const ids = order.map(i => S.pageIds[i]);
  ORG.sel = new Set(idx.map(i => i + d)); await applyStructure(doc, ids);
}
function insertPos() { const idx = selIdx(); return idx.length ? idx[idx.length - 1] + 1 : S.pages.length; }
async function orgBlank() {
  const doc = await loadLib(); const pos = insertPos(); const ref = S.pages[Math.max(0, pos - 1)];
  doc.insertPage(pos, ref ? [ref.w, ref.h] : [595.28, 841.89]);
  const ids = S.pageIds.slice(); ids.splice(pos, 0, uid()); await applyStructure(doc, ids);
}
async function orgInsertPdf() {
  busy(false); const f = await pickFile('fPdfInsert'); if (!f) return; busy(true, 'جاري الدمج…');
  const ext = await PDFDocument.load(await readFile(f), { ignoreEncryption: true });
  const doc = await loadLib(); const pos = insertPos();
  const pages = await doc.copyPages(ext, ext.getPageIndices());
  pages.forEach((p, k) => doc.insertPage(pos + k, p));
  const ids = S.pageIds.slice(); ids.splice(pos, 0, ...pages.map(() => uid()));
  await applyStructure(doc, ids); toast(`تمت إضافة ${pages.length} صفحة`);
}
// يحدد مكان الصورة الفعلي لو حواليها حواف فاتحة (أبيض/رمادي فاتح) — بيرجع مستطيل القص بالبكسل أو null
function trimBox(img) {
  const k = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const light = (x, y) => { const i = (y * w + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2]; const mn = Math.min(r, g, b), mx = Math.max(r, g, b); return mn >= 196 && mx - mn <= 28; };
  let ring = 0, ringLight = 0;
  for (let x = 0; x < w; x += 3) { ring += 2; if (light(x, 0)) ringLight++; if (light(x, h - 1)) ringLight++; }
  for (let y = 0; y < h; y += 3) { ring += 2; if (light(0, y)) ringLight++; if (light(w - 1, y)) ringLight++; }
  if (ringLight < ring * 0.95) return null;
  const rowHas = y => { let n = 0; for (let x = 0; x < w; x += 2) if (!light(x, y)) n++; return n > Math.max(1, w / 2 * 0.003); };
  const colHas = (x, y1, y2) => { let n = 0; for (let y = y1; y <= y2; y += 2) if (!light(x, y)) n++; return n > Math.max(1, (y2 - y1 + 1) / 2 * 0.003); };
  let top = 0, bot = h - 1; while (top < bot && !rowHas(top)) top++; while (bot > top && !rowHas(bot)) bot--;
  let left = 0, right = w - 1; while (left < right && !colHas(left, top, bot)) left++; while (right > left && !colHas(right, top, bot)) right--;
  const cw = right - left + 1, ch = bot - top + 1;
  if (cw < w * 0.15 || ch < h * 0.15 || (cw > w - 4 && ch > h - 4)) return null;
  const X = Math.floor(left / k), Y = Math.floor(top / k);
  return { X, Y, W: Math.min(img.naturalWidth - X, Math.ceil(cw / k)), H: Math.min(img.naturalHeight - Y, Math.ceil(ch / k)) };
}
// اتجاه صورة JPEG من بيانات EXIF (صور الموبايل)
function jpegOrientation(u8) {
  try {
    const v = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    if (v.getUint16(0) !== 0xFFD8) return 1;
    let o = 2;
    while (o < v.byteLength - 4) {
      const m = v.getUint16(o); o += 2;
      if (m === 0xFFE1) {
        if (v.getUint32(o + 2) !== 0x45786966) return 1;
        const t = o + 8, le = v.getUint16(t) === 0x4949;
        const ifd = t + v.getUint32(t + 4, le), n = v.getUint16(ifd, le);
        for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; if (v.getUint16(e, le) === 0x0112) return v.getUint16(e + 8, le); }
        return 1;
      } else if ((m & 0xFF00) !== 0xFF00) break;
      else o += v.getUint16(o);
    }
  } catch (e) { }
  return 1;
}
// mode: 'fit' = الصفحة على قد الصورة بالظبط (بدون فراغ) ، 'a4' = الصورة متظبطة داخل صفحة A4
async function addImagesAsPages(doc, files, pos, mode = 'a4', trim = true) {
  let k = 0;
  for (const f of files) {
    let by = await readFile(f);
    const isJpg = by[0] === 0xFF && by[1] === 0xD8, isPng = by[0] === 0x89 && by[1] === 0x50;
    let ori = isJpg ? jpegOrientation(by) : 1;
    const url = URL.createObjectURL(new Blob([by], { type: f.type || (isPng ? 'image/png' : 'image/jpeg') }));
    const el = await loadImg(url);   // المتصفح بيطبق اتجاه الصورة تلقائياً
    let im;
    if ((!isJpg && !isPng) || [2, 4, 5, 7].includes(ori)) {
      // صيغة تانية (webp…) أو صورة معكوسة: نحولها PNG بنفس الدقة الكاملة (بدون فقد)
      const c = document.createElement('canvas'); c.width = el.naturalWidth; c.height = el.naturalHeight; c.getContext('2d').drawImage(el, 0, 0);
      by = new Uint8Array(await (await new Promise(r => c.toBlob(r, 'image/png'))).arrayBuffer());
      im = await doc.embedPng(by); ori = 1;
    } else im = isJpg ? await doc.embedJpg(by) : await doc.embedPng(by);
    const dispW = el.naturalWidth, dispH = el.naturalHeight;
    const cb = (trim && trimBox(el)) || { X: 0, Y: 0, W: dispW, H: dispH };
    URL.revokeObjectURL(url);
    let PW, PH, bx, by2, sc;
    if (mode === 'fit') { sc = 841.89 / Math.max(cb.W, cb.H); PW = cb.W * sc; PH = cb.H * sc; bx = 0; by2 = 0; }
    else {
      const land = cb.W > cb.H; PW = land ? 841.89 : 595.28; PH = land ? 595.28 : 841.89; const m = 28;
      sc = Math.min((PW - 2 * m) / cb.W, (PH - 2 * m) / cb.H); bx = (PW - cb.W * sc) / 2; by2 = (PH - cb.H * sc) / 2;
    }
    const pg = pos == null ? doc.addPage([PW, PH]) : doc.insertPage(pos + k, [PW, PH]);
    // الصورة كاملة بدقتها الأصلية، والقص مجرد إطار (clip) — مفيش إعادة ضغط
    const DW = dispW * sc, DH = dispH * sc, x0 = bx - cb.X * sc, y0 = by2 - (dispH - cb.Y - cb.H) * sc;
    pg.pushOperators(PDFLib.pushGraphicsState(), PDFLib.rectangle(bx, by2, cb.W * sc, cb.H * sc), PDFLib.clip(), PDFLib.endPath());
    if (ori === 3) pg.drawImage(im, { x: x0 + DW, y: y0 + DH, width: DW, height: DH, rotate: degrees(180) });
    else if (ori === 6) pg.drawImage(im, { x: x0, y: y0 + DH, width: DH, height: DW, rotate: degrees(-90) });
    else if (ori === 8) pg.drawImage(im, { x: x0 + DW, y: y0, width: DH, height: DW, rotate: degrees(90) });
    else pg.drawImage(im, { x: x0, y: y0, width: DW, height: DH });
    pg.pushOperators(PDFLib.popGraphicsState());
    k++;
  }
  return k;
}
function askImageMode() {
  return new Promise(res => {
    let picked = null;
    const body = openSheet(`<div class="sh-head"><h3>تحويل الصور إلى PDF</h3></div>
      <div class="imgmode">
        <button id="imFit"><span class="pv fit"><i></i></span><b>الصورة فقط</b><small>الصفحة على قد الصورة بالظبط — بدون أي فراغ أبيض</small></button>
        <button id="imA4"><span class="pv a4"><i></i></span><b>داخل صفحة A4</b><small>الصورة متظبطة في نص صفحة A4 بهوامش مرتبة</small></button>
      </div>
      <label class="chip" style="display:inline-flex;gap:6px;align-items:center;margin-bottom:6px"><input type="checkbox" id="imTrim" checked> قص الحواف البيضاء حوالين الصورة تلقائياً</label>`, () => res(picked && { mode: picked, trim: $('#imTrim', body).checked }));
    $('#imFit', body).onclick = () => { picked = 'fit'; closeSheet(); };
    $('#imA4', body).onclick = () => { picked = 'a4'; closeSheet(); };
  });
}
async function orgInsertImages() {
  busy(false); const ch = await askImageMode(); if (!ch) return;
  const files = await pickFile('fImgs', true); if (!files || !files.length) return; busy(true, 'جاري الإضافة…');
  const doc = await loadLib(); const pos = insertPos(); const k = await addImagesAsPages(doc, files, pos, ch.mode, ch.trim);
  const ids = S.pageIds.slice(); ids.splice(pos, 0, ...Array.from({ length: k }, uid)); await applyStructure(doc, ids);
}
async function orgExtract() {
  const idx = selIdx(); const full = await buildFinal();
  const src = await PDFDocument.load(full, { ignoreEncryption: true }); const doc = await PDFDocument.create();
  (await doc.copyPages(src, idx)).forEach(p => doc.addPage(p));
  const bytes = await doc.save(); const name = baseName(S.name) + ` - صفحات مستخرجة.pdf`;
  busy(false);
  if (N) { busy(true, 'جاري الحفظ…'); N.saveAs(bytesToB64(bytes), name); saveCb = () => { S.dirty = true; }; }
  else downloadBlob(bytes, name);
}

/* ================= التنقل بين الشاشات ================= */
function showScreen(id) { ['home', 'editor', 'organizer', 'scanner'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id)); }
function curScreen() { return ['home', 'editor', 'organizer', 'scanner'].find(s => !$('#' + s).classList.contains('hidden')); }
function leaveEditor() {
  const go = () => { showScreen('home'); if (N) N.newDocument(); };
  if (!S.dirty) return go();
  const body = openSheet(`<div class="sh-head"><h3>لديك تعديلات غير محفوظة</h3></div><div class="menu-list">
    <button id="lvS">${icon('save')} حفظ</button><button id="lvA">${icon('copy')} حفظ باسم…</button>
    <button id="lvD" class="danger">${icon('discard')} تجاهل التعديلات</button><button id="lvC">${icon('close')} إلغاء</button></div>`);
  $('#lvS', body).onclick = () => { closeSheet(true); saveDoc(false, ok => ok && go()); };
  $('#lvA', body).onclick = () => { closeSheet(true); saveDoc(true, ok => ok && go()); };
  $('#lvD', body).onclick = () => { closeSheet(true); S.dirty = false; go(); };
  $('#lvC', body).onclick = () => closeSheet(true);
}
window.onBack = () => {
  if ($('#tapmenu')) { hideTapMenu(); return true; }
  if (closeSheet()) return true;
  const sc = curScreen();
  if (sc === 'scanner') {
    if (SC.mode === 'filter') scanCropMode();
    else if (SC.mode === 'crop' && SC.pages.length) scanSessionMode();
    else if (SC.pages.length) confirmSheet(`تخرج وتلغي ${SC.pages.length} صفحة متصورة؟`, 'خروج', () => { SC.pages = []; scanExit(); }, true);
    else scanExit();
    return true;
  }
  if (sc === 'organizer') { showScreen('editor'); layout(); return true; }
  if (sc === 'editor') {
    if (!$('#searchbar').classList.contains('hidden')) { closeSearch(); return true; }
    if (S.sel) { deselect(); return true; }
    if (S.tool !== 'select') { setTool('select'); return true; }
    leaveEditor(); return true;
  }
  return false;
};

/* ================= فتح الملفات ================= */
async function openPdfFlow() {
  if (N) { N.openPdf(); return; }
  const f = await pickFile('fPdf'); if (!f) return;
  await openDocument(await readFile(f), f.name);
}
window.onNativeFile = async () => {
  if (!N || !N.hasPending()) return;
  const name = N.pendingName();
  busy(true, 'جاري فتح الملف…');
  try {
    const r = await fetch('/__pending?t=' + Date.now());
    if (!r.ok) throw new Error('fetch');
    const bytes = new Uint8Array(await r.arrayBuffer());
    N.clearPending();
    await openDocument(bytes, name);
  } catch (e) { console.error(e); busy(false); toast('تعذر قراءة الملف'); }
};
async function newBlank() {
  const doc = await PDFDocument.create(); doc.addPage([595.28, 841.89]);
  if (N) N.newDocument();
  await openDocument(await doc.save(), 'مستند جديد.pdf');
  S.dirty = true;
}
async function imagesToPdf() {
  const ch = await askImageMode(); if (!ch) return;
  const files = await pickFile('fImgs', true); if (!files || !files.length) return;
  busy(true, 'جاري التحويل…');
  try { const doc = await PDFDocument.create(); await addImagesAsPages(doc, files, null, ch.mode, ch.trim); if (N) N.newDocument(); await openDocument(await doc.save(), 'صور.pdf'); S.dirty = true; }
  catch (e) { console.error(e); toast('تعذر تحويل الصور'); busy(false); }
}

/* ================= اختصارات الكمبيوتر ================= */
window.isDirty = () => !!S.dirty && curScreen() !== 'home';
function bindDesktop() {
  const typing = () => { const a = document.activeElement; return a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT' || a.tagName === 'SELECT'); };
  document.addEventListener('keydown', e => {
    const ed = curScreen() === 'editor', k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 's' && ed) { e.preventDefault(); saveDoc(e.shiftKey); return; }
    if (mod && k === 'o') { e.preventDefault(); openPdfFlow(); return; }
    if (typing()) { if (e.key === 'Escape') { document.activeElement.blur(); } return; }
    if (!ed) return;
    if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    else if (mod && k === 'f') { e.preventDefault(); openSearch(); }
    else if (mod && k === 'c' && S.sel) { const o = selObj(); S.clip = { json: JSON.stringify(o), asset: o.asset ? S.assets[o.asset] : null }; toast('تم النسخ'); }
    else if (mod && k === 'v' && S.clip) { const p = visiblePage(), v = $('#viewer'), sc = scale(); pasteAt(p, p.w / 2, clamp((v.scrollTop + v.clientHeight / 2 - p.el.offsetTop) / sc, 20, p.h - 20)); }
    else if (mod && k === 'd' && S.sel) { e.preventDefault(); duplicateSel(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); deleteSel(); }
    else if (e.key === 'Escape') { if ($('#tapmenu')) hideTapMenu(); else if (!closeSheet()) { if (!$('#searchbar').classList.contains('hidden')) closeSearch(); else if (S.sel) deselect(); else if (S.tool !== 'select') setTool('select'); } }
    else if (S.sel && e.key.startsWith('Arrow')) {   // تحريك العنصر المحدد بالأسهم (Shift = خطوة أكبر)
      e.preventDefault(); const st = e.shiftKey ? 10 : 1, o = selObj();
      const d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (!S._arrowUndo || Date.now() - S._arrowUndo > 800) pushUndo(); S._arrowUndo = Date.now();
      moveObj(o, d[0], d[1]); renderOverlay(selPage());
    }
    else if (mod && (k === '=' || k === '+')) { e.preventDefault(); setZoom(S.zoom * 1.2); }
    else if (mod && k === '-') { e.preventDefault(); setZoom(S.zoom / 1.2); }
    else if (mod && k === '0') { e.preventDefault(); setZoom(1); }
  });
  // Ctrl + عجلة الماوس = تكبير وتصغير
  $('#viewer').addEventListener('wheel', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault(); const r = $('#viewer').getBoundingClientRect();
    setZoom(S.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  // سحب ملف PDF أو صورة وإفلاته على البرنامج
  document.addEventListener('dragover', e => { e.preventDefault(); });
  document.addEventListener('drop', async e => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []); if (!files.length) return;
    const pdf = files.find(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    if (pdf) { if (N && N.openFile) N.openFile(pdf); else openDocument(await readFile(pdf), pdf.name); return; }
    const img = files.find(f => /^image\//.test(f.type));
    if (img && curScreen() === 'editor') { busy(true, 'جاري تجهيز الصورة…'); try { await addImageObj(await normalizeImage(img)); } finally { busy(false); } }
  });
}

/* ================= التهيئة ================= */
async function init() {
  fillIcons();
  buildToolbar();
  $('#btnOpen').onclick = openPdfFlow;
  $('#btnBlank').onclick = newBlank;
  $('#btnImgs').onclick = imagesToPdf;
  $('#btnScan').onclick = () => scanStart(false);
  $('#btnContact').onclick = () => openContact();
  $('#scClose').onclick = () => window.onBack();
  $('#btnLib').onclick = openLibManager;
  $('#tbBack').onclick = leaveEditor;
  $('#tbUndo').onclick = undo; $('#tbRedo').onclick = redo;
  $('#tbSearch').onclick = () => $('#searchbar').classList.contains('hidden') ? openSearch() : closeSearch();
  $('#tbPages').onclick = openOrganizer;
  $('#tbSave').onclick = () => saveDoc(false);
  $('#tbMore').onclick = openMoreMenu;
  $('#docTitle').onclick = openRename;
  $('#backdrop').onclick = () => closeSheet();
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#tapmenu')) hideTapMenu(); }, true);
  $('#searchInput').onkeydown = e => { if (e.key === 'Enter') runSearch(); };
  $('#searchInput').oninput = () => { S.search.q = ''; };
  $('#searchNext').onclick = () => S.search.results.length ? stepSearch(1) : runSearch();
  $('#searchPrev').onclick = () => stepSearch(-1);
  $('#searchClose').onclick = closeSearch;
  $('#zoomIn').onclick = () => setZoom(S.zoom * 1.25);
  $('#zoomOut').onclick = () => setZoom(S.zoom / 1.25);
  $('#orgDone').onclick = () => { showScreen('editor'); layout(); };
  $('#orgAll').onclick = () => { if (ORG.sel.size === S.pages.length) ORG.sel.clear(); else S.pages.forEach((_, i) => ORG.sel.add(i)); renderOrg(); };
  bindPinch();
  bindDesktop();
  let rt, lastW = window.innerWidth; window.addEventListener('resize', () => { placePanel(); clearTimeout(rt); rt = setTimeout(() => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; if (curScreen() === 'editor' && S.pages.length) layout(); }, 200); });
  // تحميل الخطوط مسبقاً حتى يظهر العربي صحيحاً على الـ canvas
  try { await Promise.all(['Cairo', 'Tajawal', 'Amiri'].map(fontReady)); } catch (e) { }
  if (N && N.hasPending()) window.onNativeFile();
}
init();
