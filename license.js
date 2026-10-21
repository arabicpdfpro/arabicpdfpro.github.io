/* Arabic PDF Pro — الحساب، التجربة 10 أيام، التفعيل، وربط الأجهزة (3 أجهزة: ويب + ويندوز + موبايل) */
(function () {
  const CFG = {
    apiKey: "AIzaSyC5PLz8XIzVceMMTVkHNc5WIWEBtvYOCOA",
    authDomain: "arabic-pdf-pro.firebaseapp.com",
    projectId: "arabic-pdf-pro",
    storageBucket: "arabic-pdf-pro.firebasestorage.app",
    messagingSenderId: "733975544831",
    appId: "1:733975544831:web:4c1500e67bd489f1611dca"
  };
  const TRIAL_DAYS = 10, OFFLINE_DAYS = 7, DAY = 86400000;
  const PLAT = /Electron/i.test(navigator.userAgent) ? 'win' : (window.Android && window.Android.version) ? 'mobile' : 'web';
  const PLAT_FIELD = { web: 'devWeb', win: 'devWin', mobile: 'devMobile' }[PLAT];
  const PLAT_NAME = { web: 'متصفح', win: 'كمبيوتر', mobile: 'موبايل' }[PLAT];

  firebase.initializeApp(CFG);
  const auth = firebase.auth(), db = firebase.firestore();
  auth.languageCode = 'ar';
  const TS = firebase.firestore.FieldValue.serverTimestamp;

  const LIC = window.LIC = { state: null, user: null, info: null, needsWatermark: () => LIC.state === 'expired' };
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } }, del: k => { try { localStorage.removeItem(k); } catch (e) { } } };

  /* ---------- هوية الجهاز ---------- */
  function deviceId() {
    let id = ls.get('apdf_dev');
    if (!id) { const m = document.cookie.match(/apdf_dev=([\w-]+)/); id = m && m[1]; }
    if (!id) { const a = new Uint8Array(12); crypto.getRandomValues(a); id = 'd' + Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); }
    ls.set('apdf_dev', id); document.cookie = `apdf_dev=${id}; max-age=${60 * 60 * 24 * 3650}; path=/; SameSite=Lax`;
    return id;
  }
  async function fingerprint() {
    const parts = [navigator.platform, navigator.language, (navigator.languages || []).join(','), screen.width + 'x' + screen.height, screen.colorDepth, devicePixelRatio,
      Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.hardwareConcurrency, navigator.deviceMemory, navigator.maxTouchPoints,
      (navigator.userAgent.match(/\(([^)]+)\)/) || [])[1]];
    try {
      const c = document.createElement('canvas'); c.width = 240; c.height = 60; const x = c.getContext('2d');
      x.textBaseline = 'top'; x.font = '16px Arial'; x.fillStyle = '#f60'; x.fillRect(100, 1, 62, 20); x.fillStyle = '#069'; x.fillText('Arabic PDF Pro عربي 😀', 2, 15);
      x.fillStyle = 'rgba(102,204,0,.7)'; x.fillText('Arabic PDF Pro عربي 😀', 4, 17); parts.push(c.toDataURL());
    } catch (e) { }
    try { const g = document.createElement('canvas').getContext('webgl'); const d = g.getExtension('WEBGL_debug_renderer_info'); parts.push(g.getParameter(d.UNMASKED_RENDERER_WEBGL), g.getParameter(d.UNMASKED_VENDOR_WEBGL)); } catch (e) { }
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('|')));
    return 'f' + Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
  }

  /* ---------- حساب الحالة ---------- */
  const ms = t => t && t.toMillis ? t.toMillis() : (typeof t === 'number' ? t : 0);
  function compute(u) {
    const now = Date.now();
    if (u.status === 'blocked') return { state: 'blocked' };
    let until = ms(u.activeUntil);
    if (!until && u.activatedAt) until = (u.activeDays || 0) >= 36500 ? Infinity : ms(u.activatedAt) + (u.activeDays || 0) * DAY;
    if (until && until > now) return { state: 'active', until };
    const trialEnd = ms(u.trialEnd) || (ms(u.createdAt) + TRIAL_DAYS * DAY);
    if (trialEnd > now) return { state: 'trial', daysLeft: Math.ceil((trialEnd - now) / DAY), trialEnd };
    return { state: 'expired', trialEnd };
  }

  /* ---------- الواجهة ---------- */
  const css = `
  #lic{position:fixed;inset:0;z-index:9999;background:linear-gradient(160deg,#123a3a,#0d2b2b);color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;font-family:Cairo,Tajawal,system-ui,sans-serif;direction:rtl}
  #lic.hidden{display:none}
  #lic .card{width:100%;max-width:380px;background:#fff;color:#1d2b2b;border-radius:20px;padding:24px 20px;box-shadow:0 10px 40px rgba(0,0,0,.35)}
  #lic h2{margin:0 0 4px;font-size:22px;text-align:center;direction:ltr;color:#123a3a}
  #lic .sub{text-align:center;color:#5c6f6f;font-size:13.5px;margin:0 0 16px}
  #lic .tabs{display:flex;background:#eef3f3;border-radius:12px;padding:4px;margin-bottom:14px}
  #lic .tabs button{flex:1;border:0;background:none;padding:9px;border-radius:9px;font:inherit;font-weight:700;color:#5c6f6f}
  #lic .tabs button.on{background:#fff;color:#123a3a;box-shadow:0 1px 4px rgba(0,0,0,.12)}
  #lic label{display:block;font-size:13px;color:#5c6f6f;margin:10px 2px 4px}
  #lic input{width:100%;box-sizing:border-box;border:1.5px solid #d6e0e0;border-radius:12px;padding:12px;font:inherit;font-size:16px;direction:ltr;text-align:left}
  #lic input:focus{outline:none;border-color:#e88c28}
  #lic .btn{display:block;width:100%;margin-top:16px;border:0;border-radius:12px;padding:13px;font:inherit;font-weight:800;font-size:16px;background:#e88c28;color:#fff}
  #lic .btn.sec{background:#eef3f3;color:#123a3a;margin-top:10px}
  #lic .btn:disabled{opacity:.6}
  #lic .link{background:none;border:0;color:#1a7f8f;font:inherit;font-size:13.5px;margin-top:12px;display:block;width:100%;text-align:center;text-decoration:underline}
  #lic .msg{min-height:20px;margin-top:10px;font-size:13.5px;text-align:center;color:#c0392b}
  #lic .msg.ok{color:#1e8449}
  #lic .big{font-size:44px;text-align:center;margin:4px 0}
  #lic p{font-size:14.5px;line-height:1.7;text-align:center}
  #licBar{margin:10px auto 0;max-width:420px;border-radius:14px;padding:10px 14px;font-size:13.5px;line-height:1.6;display:flex;align-items:center;gap:10px;direction:rtl}
  #licBar.trial{background:#fff4e5;color:#8a5a00}
  #licBar.expired{background:#fdecea;color:#a3271b}
  #licBar.active{background:#e8f6ee;color:#1e6b3f}
  #licBar b{font-weight:800}
  #licBar .sp{flex:1}
  #licBar button{border:0;border-radius:10px;padding:7px 12px;font:inherit;font-weight:800;background:#e88c28;color:#fff;white-space:nowrap}
  .lic-acc{margin-top:8px;font-size:12.5px;opacity:.85;direction:ltr}
  .lic-acc button{background:none;border:0;color:inherit;text-decoration:underline;font:inherit;margin-left:6px}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const gate = document.createElement('div'); gate.id = 'lic'; document.body.appendChild(gate);
  const $l = s => gate.querySelector(s);
  const head = `<h2>Arabic PDF Pro</h2>`;
  const busyBtn = (b, on, t) => { b.disabled = on; if (t) b.textContent = t; };
  const msg = (t, ok) => { const m = $l('.msg'); if (m) { m.textContent = t || ''; m.classList.toggle('ok', !!ok); } };
  const show = html => { gate.innerHTML = `<div class="card">${head}${html}</div>`; gate.classList.remove('hidden'); };
  const hide = () => gate.classList.add('hidden');

  const ERR = {
    'auth/invalid-email': 'الإيميل مكتوب غلط', 'auth/missing-password': 'اكتب كلمة السر', 'auth/weak-password': 'كلمة السر لازم تكون 6 حروف أو أرقام على الأقل',
    'auth/email-already-in-use': 'الإيميل ده عنده حساب بالفعل — ادخل من "دخول"', 'auth/invalid-credential': 'الإيميل أو كلمة السر غلط',
    'auth/wrong-password': 'كلمة السر غلط', 'auth/user-not-found': 'مفيش حساب بالإيميل ده', 'auth/too-many-requests': 'محاولات كتير — استنى شوية وجرب تاني',
    'auth/network-request-failed': 'مفيش نت — اتأكد من الاتصال', 'auth/user-disabled': 'الحساب ده موقوف'
  };
  const errText = e => ERR[e && e.code] || (e && /offline|network|unavailable/i.test(e.message || e.code) ? 'مفيش نت — اتأكد من الاتصال' : 'حصلت مشكلة: ' + ((e && (e.code || e.message)) || ''));

  function loginView(tab = 'in') {
    show(`<p class="sub">${tab === 'in' ? 'ادخل بحسابك' : 'اعمل حساب وجرّب البرنامج <b>10 أيام مجاناً</b>'}</p>
      <div class="tabs"><button data-t="in" class="${tab === 'in' ? 'on' : ''}">دخول</button><button data-t="up" class="${tab === 'up' ? 'on' : ''}">حساب جديد</button></div>
      <label>الإيميل</label><input id="lEm" type="email" autocomplete="email" inputmode="email" placeholder="name@example.com">
      <label>كلمة السر</label><input id="lPw" type="password" autocomplete="${tab === 'in' ? 'current-password' : 'new-password'}" placeholder="••••••">
      ${tab === 'up' ? '<label>أكّد كلمة السر</label><input id="lPw2" type="password" autocomplete="new-password" placeholder="••••••">' : ''}
      <button class="btn" id="lGo">${tab === 'in' ? 'دخول' : 'إنشاء الحساب'}</button>
      ${tab === 'in' ? '<button class="link" id="lForgot">نسيت كلمة السر؟</button>' : ''}
      <div class="msg"></div>`);
    gate.querySelectorAll('.tabs button').forEach(b => b.onclick = () => loginView(b.dataset.t));
    const em = ls.get('apdf_email'); if (em) $l('#lEm').value = em;
    const go = async () => {
      const e = $l('#lEm').value.trim(), p = $l('#lPw').value, b = $l('#lGo');
      if (!e) return msg('اكتب الإيميل');
      if (tab === 'up' && p !== $l('#lPw2').value) return msg('كلمتين السر مش زي بعض');
      busyBtn(b, true, 'لحظة…'); msg('');
      try {
        ls.set('apdf_email', e);
        if (tab === 'up') { const r = await auth.createUserWithEmailAndPassword(e, p); await r.user.sendEmailVerification(); }
        else await auth.signInWithEmailAndPassword(e, p);
        // onAuthStateChanged يكمل
      } catch (err) { busyBtn(b, false, tab === 'in' ? 'دخول' : 'إنشاء الحساب'); msg(errText(err)); }
    };
    $l('#lGo').onclick = go;
    gate.querySelectorAll('input').forEach(i => i.onkeydown = ev => { if (ev.key === 'Enter') go(); });
    const f = $l('#lForgot'); if (f) f.onclick = async () => {
      const e = $l('#lEm').value.trim(); if (!e) return msg('اكتب إيميلك فوق الأول');
      try { await auth.sendPasswordResetEmail(e); msg('بعتنالك إيميل فيه رابط تغيير كلمة السر — شوف الـ Inbox أو الـ Spam', true); } catch (err) { msg(errText(err)); }
    };
  }

  function verifyView(u) {
    show(`<div class="big">📧</div><p>بعتنالك إيميل تأكيد على<br><b dir="ltr">${u.email}</b><br>افتحه ودوس على الرابط اللي فيه، وبعدين ارجع هنا.</p>
      <p style="font-size:12.5px;color:#7a8a8a">لو مش لاقيه، دوّر في <b>Spam</b> أو <b>Junk</b></p>
      <button class="btn" id="vDone">أكّدت ✓</button><button class="btn sec" id="vAgain">ابعت الإيميل تاني</button>
      <button class="link" id="vOut">دخول بإيميل تاني</button><div class="msg"></div>`);
    $l('#vDone').onclick = async () => {
      const b = $l('#vDone'); busyBtn(b, true, 'بنتأكد…');
      try { await u.reload(); await u.getIdToken(true); } catch (e) { }
      if (auth.currentUser && auth.currentUser.emailVerified) { busyBtn(b, false, 'أكّدت ✓'); afterLogin(auth.currentUser); }
      else { busyBtn(b, false, 'أكّدت ✓'); msg('لسه الإيميل ما اتأكدش — افتح الرابط اللي في الإيميل الأول'); }
    };
    $l('#vAgain').onclick = async () => { try { await u.sendEmailVerification(); msg('اتبعت تاني ✓', true); } catch (e) { msg(errText(e)); } };
    $l('#vOut').onclick = () => auth.signOut();
  }

  function stopView(icon, title, text, withOut = true) {
    show(`<div class="big">${icon}</div><p><b>${title}</b><br>${text}</p>
      <button class="btn sec" id="sContact">✉ تواصل مع المطور</button>
      ${withOut ? '<button class="link" id="sOut">خروج / دخول بحساب تاني</button>' : ''}<button class="link" id="sRetry">حاول تاني</button>`);
    $l('#sContact').onclick = () => { hide(); if (window.openContact) openContact(); setTimeout(() => { const obs = setInterval(() => { if ($('#sheet') && $('#sheet').classList.contains('hidden')) { clearInterval(obs); gate.classList.remove('hidden'); } }, 500); }, 300); };
    const o = $l('#sOut'); if (o) o.onclick = () => auth.signOut();
    $l('#sRetry').onclick = () => location.reload();
  }

  /* ---------- بعد الدخول: الحساب + الجهاز ---------- */
  const withTimeout = (p, t = 9000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(Object.assign(new Error('timeout'), { code: 'unavailable' })), t))]);
  async function afterLogin(u) {
    if (!u.emailVerified) return verifyView(u);
    show(`<div class="big">⏳</div><p>لحظة…</p>`);
    const dev = deviceId(); let fp = ''; try { fp = await fingerprint(); } catch (e) { }
    try {
      const uref = db.collection('users').doc(u.uid);
      let snap = await withTimeout(uref.get({ source: 'server' }));
      if (!snap.exists) { await withTimeout(uref.set({ email: u.email, createdAt: TS(), status: 'trial' })); snap = await uref.get({ source: 'server' }); }
      let data = snap.data();
      if (data.status === 'blocked') { cacheSave(u, data); return stopView('⛔', 'الحساب ده موقوف', 'تواصل مع المطور لو فيه مشكلة'); }
      // الجهاز ده مربوط بحساب تاني؟
      const dsnap = await withTimeout(db.collection('devices').doc(dev).get());
      if (dsnap.exists && dsnap.data().uid !== u.uid) return stopView('📵', 'الجهاز ده مسجل بحساب تاني', 'كل جهاز بيشتغل بحساب واحد بس. ادخل بالحساب الأصلي، أو تواصل مع المطور.');
      if (!dsnap.exists && fp) {
        const fsnap = await withTimeout(db.collection('fps').doc(fp).get());
        if (fsnap.exists && fsnap.data().uid !== u.uid) return stopView('📵', 'الجهاز ده اتسجل قبل كده بحساب تاني', 'الفترة التجريبية بتتاخد مرة واحدة على كل جهاز. ادخل بالحساب الأصلي، أو تواصل مع المطور للتفعيل.');
      }
      // الحساب مربوط بجهاز تاني من نفس النوع؟
      const mine = data[PLAT_FIELD];
      if (mine && mine !== dev) return stopView('📱', `حسابك شغال على ${PLAT_NAME} تاني`, `كل حساب بيشتغل على ${PLAT_NAME} واحد بس (ومعاه كمبيوتر وموبايل). لو غيّرت جهازك، تواصل مع المطور ينقلك.`);
      if (!mine) {
        const b = db.batch();
        b.set(db.collection('devices').doc(dev), { uid: u.uid, platform: PLAT, fp: fp || '', at: TS(), ua: navigator.userAgent.slice(0, 200) });
        b.update(uref, { [PLAT_FIELD]: dev });
        await withTimeout(b.commit());
        if (fp) { try { const fr = db.collection('fps').doc(fp); if (!(await fr.get()).exists) await fr.set({ uid: u.uid }); } catch (e) { } }
        data[PLAT_FIELD] = dev;
      } else if (fp) { try { const fr = db.collection('fps').doc(fp); if (!(await fr.get()).exists) await fr.set({ uid: u.uid }); } catch (e) { } }
      cacheSave(u, data);
      apply(u, data);
    } catch (e) {
      console.warn('lic', e);
      const c = cacheLoad(u);
      if (c) return apply(u, c.data, true);
      stopView('📶', 'محتاجين نت', 'أول مرة لازم يبقى فيه نت علشان نتأكد من حسابك. ' + errText(e), true);
    }
  }
  function cacheSave(u, data) {
    const d = {}; Object.keys(data).forEach(k => { const v = data[k]; d[k] = v && v.toMillis ? v.toMillis() : v; });
    ls.set('apdf_lic', JSON.stringify({ uid: u.uid, at: Date.now(), data: d }));
  }
  function cacheLoad(u) {
    try { const c = JSON.parse(ls.get('apdf_lic')); if (c && c.uid === u.uid && Date.now() - c.at < OFFLINE_DAYS * DAY) return c; } catch (e) { }
    return null;
  }

  function apply(u, data, offline) {
    const r = compute(data);
    LIC.user = u; LIC.info = r; LIC.state = r.state; LIC.data = data;
    if (r.state === 'blocked') return stopView('⛔', 'الحساب ده موقوف', 'تواصل مع المطور لو فيه مشكلة');
    hide(); renderBar();
  }

  function renderBar() {
    let bar = document.getElementById('licBar');
    if (!bar) { bar = document.createElement('div'); bar.id = 'licBar'; const hs = document.querySelector('.home-actions'); hs.parentNode.insertBefore(bar, hs.nextSibling); }
    const r = LIC.info;
    if (r.state === 'trial') bar.innerHTML = `<span>🎁 فترة تجريبية — باقي <b>${r.daysLeft}</b> ${r.daysLeft === 1 ? 'يوم' : r.daysLeft <= 10 ? 'أيام' : 'يوم'}</span><span class="sp"></span><button id="licAct">فعّل</button>`;
    else if (r.state === 'expired') bar.innerHTML = `<span>⏰ <b>التجربة خلصت</b><br>الملفات بتتحفظ بعلامة مائية</span><span class="sp"></span><button id="licAct">فعّل</button>`;
    else bar.innerHTML = `<span>✅ <b>البرنامج مفعّل</b>${r.until !== Infinity ? ' لحد ' + new Date(r.until).toLocaleDateString('ar-EG') : ''}</span>`;
    bar.className = r.state;
    const a = document.getElementById('licAct'); if (a) a.onclick = activateSheet;
    const foot = document.querySelector('.home-foot'); let acc = document.querySelector('.lic-acc');
    if (!acc) { acc = document.createElement('div'); acc.className = 'lic-acc'; foot.appendChild(acc); }
    acc.innerHTML = `${LIC.user.email}<button id="licOut">خروج</button>`;
    document.getElementById('licOut').onclick = () => { if (confirm('تسجيل خروج من الحساب؟')) auth.signOut(); };
  }

  /* ---------- كود التفعيل ---------- */
  function activateSheet() {
    const body = openSheet(`<div class="sh-head"><h3>تفعيل البرنامج</h3></div>
      <p style="font-size:14px;color:var(--muted);margin:0 0 8px">اكتب كود التفعيل اللي وصلك من المطور</p>
      <input class="field" id="acCode" dir="ltr" placeholder="APDF-XXXX-XXXX" style="text-transform:uppercase;letter-spacing:1px;font-size:18px;text-align:center" autocomplete="off">
      <div class="row"><button class="btn pri" id="acGo" style="flex:1">تفعيل</button></div>
      <div id="acMsg" style="text-align:center;font-size:13.5px;min-height:20px;color:#c0392b"></div>
      <button class="btn" id="acContact" style="width:100%;margin-top:6px">✉ مش معاك كود؟ تواصل مع المطور</button>`);
    const m = t => { $('#acMsg', body).textContent = t; };
    $('#acContact', body).onclick = () => openContact();
    $('#acGo', body).onclick = async () => {
      const code = $('#acCode', body).value.trim().toUpperCase().replace(/\s+/g, '');
      if (!code) return m('اكتب الكود');
      const b = $('#acGo', body); b.disabled = true; b.textContent = 'لحظة…'; m('');
      try {
        const u = auth.currentUser, cref = db.collection('codes').doc(code), uref = db.collection('users').doc(u.uid);
        const c = await withTimeout(cref.get());
        if (!c.exists) throw { msg: 'الكود ده مش صحيح' };
        const cd = c.data();
        if (cd.uid) throw { msg: cd.uid === u.uid ? 'الكود ده اتفعّل على حسابك قبل كده' : 'الكود ده اتستخدم قبل كده' };
        if (cd.email && cd.email.toLowerCase() !== u.email.toLowerCase()) throw { msg: 'الكود ده مخصوص لإيميل تاني' };
        const bt = db.batch();
        bt.update(cref, { uid: u.uid, usedAt: TS(), usedEmail: u.email });
        bt.update(uref, { code, activatedAt: TS(), activeDays: cd.days, status: 'active', activeUntil: firebase.firestore.FieldValue.delete() });
        await withTimeout(bt.commit());
        const snap = await uref.get({ source: 'server' }); cacheSave(u, snap.data()); apply(u, snap.data());
        closeSheet(true); toast('✅ تم تفعيل البرنامج — شكراً ليك');
      } catch (e) { b.disabled = false; b.textContent = 'تفعيل'; m(e.msg || errText(e)); }
    };
    setTimeout(() => $('#acCode', body).focus(), 250);
  }
  LIC.activate = activateSheet;

  /* ---------- البداية ---------- */
  show(`<div class="big">⏳</div><p>لحظة…</p>`);
  let first = true;
  auth.onAuthStateChanged(u => {
    if (!u) { LIC.state = null; ls.del('apdf_lic'); const bar = document.getElementById('licBar'); if (bar) bar.remove(); loginView(first && !ls.get('apdf_email') ? 'up' : 'in'); first = false; return; }
    first = false;
    // من غير نت: افتح بالحالة المحفوظة
    if (!navigator.onLine) { const c = cacheLoad(u); if (c) return apply(u, c.data, true); }
    afterLogin(u);
  });
})();
