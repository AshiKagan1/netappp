'use strict';
/* ==========================================================
   نت‌استور — فروشگاه تجهیزات شبکه (HTML + CSS + JS خالص)
   ذخیره‌سازی: LocalStorage | بدون Backend | آماده برای Capacitor
   ========================================================== */
(function () {

  /* ---------- ذخیره‌سازی ---------- */
  const K = { P: 'ns_products', C: 'ns_cart', W: 'ns_wish', O: 'ns_orders', U: 'ns_user', T: 'ns_theme', PIN: 'ns_pin' };
  const LS = {
    get(k, d) {
      try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { toast('حافظه دستگاه پر است یا در دسترس نیست', 'error'); return false; }
    }
  };
  const arr = v => (Array.isArray(v) ? v : []);

  /* ---------- ابزارها ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const faDigits = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const toEn = s => String(s == null ? '' : s)
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const num = n => faDigits(String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
  const price = n => num(n) + ' تومان';
  const norm = s => toEn(s).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  const dateFa = ts => {
    try { const d = new Date(ts); return d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return new Date(ts).toISOString().slice(0, 16).replace('T', ' '); }
  };
  const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  /* ---------- داده‌ها ---------- */
  const CATS = [
    { id: 'router', name: 'روتر' }, { id: 'switch', name: 'سوئیچ' }, { id: 'firewall', name: 'فایروال' },
    { id: 'wireless', name: 'وایرلس' }, { id: 'cable', name: 'کابل و فیبر نوری' }, { id: 'rack', name: 'رک و پچ پنل' },
    { id: 'nic', name: 'کارت شبکه و مودم' }, { id: 'server', name: 'سرور' }
  ];
  const catName = id => (CATS.find(c => c.id === id) || { name: 'سایر' }).name;
  const STATUSES = ['در حال بررسی', 'تأیید شده', 'ارسال شده', 'تحویل شده', 'لغو شده'];

  const ICONS = {
    router: '<rect x="14" y="62" width="92" height="30" rx="8"/><path d="M34 62L26 28M86 62L94 28"/><circle cx="34" cy="77" r="2.5" fill="currentColor"/><circle cx="46" cy="77" r="2.5" fill="currentColor"/><circle cx="58" cy="77" r="2.5" fill="currentColor"/>',
    switch: '<rect x="10" y="44" width="100" height="32" rx="6"/><path d="M24 56h8v10h-8zM38 56h8v10h-8zM52 56h8v10h-8zM66 56h8v10h-8zM80 56h8v10h-8z"/>',
    firewall: '<path d="M60 14L100 30V62C100 86 80 102 60 108C40 102 20 86 20 62V30Z"/><path d="M44 60l12 12 22-24"/>',
    wireless: '<path d="M20 52C42 30 78 30 100 52"/><path d="M34 66C48 52 72 52 86 66"/><path d="M48 80C55 73 65 73 72 80"/><circle cx="60" cy="94" r="4" fill="currentColor"/>',
    cable: '<circle cx="60" cy="60" r="38"/><circle cx="60" cy="60" r="24"/><circle cx="60" cy="60" r="10"/><path d="M98 60H112"/>',
    rack: '<rect x="28" y="12" width="64" height="96" rx="6"/><path d="M28 36h64M28 60h64M28 84h64"/><circle cx="40" cy="24" r="2.5" fill="currentColor"/><circle cx="40" cy="48" r="2.5" fill="currentColor"/><circle cx="40" cy="72" r="2.5" fill="currentColor"/>',
    nic: '<rect x="12" y="38" width="96" height="44" rx="5"/><path d="M24 82v14M36 82v14M48 82v14M60 82v14"/><rect x="82" y="48" width="18" height="16" rx="2"/>',
    server: '<rect x="16" y="22" width="88" height="30" rx="6"/><rect x="16" y="64" width="88" height="30" rx="6"/><circle cx="32" cy="37" r="3" fill="currentColor"/><circle cx="32" cy="79" r="3" fill="currentColor"/><path d="M50 37h40M50 79h40"/>'
  };

  const P = (id, brand, name, cat, priceV, stock, rating, desc, specs) => ({ id, brand, name, cat, price: priceV, stock, rating, desc, specs, img: '' });
  const SEED = () => [
    P(1, 'MikroTik', 'روتر وایرلس MikroTik hAP ax³', 'router', 6800000, 14, 4.6,
      'روتر Wi-Fi 6 دو باندی با پردازنده چهار هسته‌ای، مناسب منزل و دفاتر کوچک. با RouterOS v7 امکانات حرفه‌ای فایروال، VPN و QoS را در اختیار شما می‌گذارد.',
      { 'پردازنده': 'IPQ-6010 چهار هسته‌ای ۱٫۸GHz', 'حافظه RAM': '۱ گیگابایت', 'پورت‌ها': '۴ × گیگابیت + ۱ × ۲٫۵ گیگابیت', 'وای‌فای': 'AX3000 دو باندی', 'سیستم‌عامل': 'RouterOS v7' }),
    P(2, 'MikroTik', 'روتر MikroTik RB4011iGS+5HacQ2HnD-IN', 'router', 12400000, 9, 4.7,
      'روتر قدرتمند با ۱۰ پورت گیگابیت و یک پورت SFP+ ده گیگابیت، مناسب شرکت‌ها و ISPهای کوچک.',
      { 'پردازنده': 'AL21400 چهار هسته‌ای ۱٫۴GHz', 'حافظه RAM': '۱ گیگابایت', 'پورت‌ها': '۱۰ × گیگابیت', 'SFP+': '۱ × ۱۰ گیگابیت', 'وای‌فای': '۸۰۲٫۱۱ac/n' }),
    P(3, 'MikroTik', 'سوئیچ MikroTik CRS326-24G-2S+RM', 'switch', 11500000, 11, 4.5,
      'سوئیچ مدیریتی ۲۴ پورت گیگابیت با دو پورت SFP+ برای رک ۱U، با پشتیبانی از SwOS و RouterOS.',
      { 'پورت‌ها': '۲۴ × گیگابیت', 'SFP+': '۲ × ۱۰ گیگابیت', 'پردازنده': '98DX3236 — ۸۰۰MHz', 'حافظه RAM': '۵۱۲ مگابایت', 'نصب': 'رک ۱U' }),
    P(4, 'Cisco', 'سوئیچ Cisco Catalyst 2960-X (WS-C2960X-24TS-L)', 'switch', 52000000, 5, 4.8,
      'سوئیچ لایه ۲ سازمانی سیسکو با ۲۴ پورت گیگابیت و ۴ پورت SFP، مناسب شبکه‌های شرکتی.',
      { 'پورت‌ها': '۲۴ × گیگابیت', 'آپلینک': '۴ × SFP', 'نوع': 'مدیریتی لایه ۲ (LAN Base)', 'نصب': 'رک ۱U', 'گارانتی': 'نمونه — ۱۲ ماه' }),
    P(5, 'Cisco', 'روتر Cisco ISR 1100-8P (C1111-8P)', 'router', 78000000, 3, 4.6,
      'روتر شعبه سری ISR 1100 با ۸ پورت LAN و ۲ پورت WAN گیگابیت برای اتصال امن شعبه‌ها.',
      { 'پورت LAN': '۸ × گیگابیت', 'پورت WAN': '۲ × گیگابیت', 'رده': 'روتر شعبه (ISR 1100)', 'سیستم‌عامل': 'Cisco IOS XE', 'نصب': 'رومیزی / رک' }),
    P(6, 'Fortinet', 'فایروال FortiGate 60F', 'firewall', 85000000, 6, 4.8,
      'فایروال نسل جدید برای شعب و دفاتر کوچک و متوسط، با امنیت یکپارچه و SD-WAN.',
      { 'توان فایروال': '۱۰ Gbps', 'IPS': '۱٫۴ Gbps', 'NGFW': '۱ Gbps', 'Threat Protection': '۷۰۰ Mbps', 'پورت‌ها': '۱۰ × گیگابیت RJ45' }),
    P(7, 'Fortinet', 'فایروال FortiGate 100F', 'firewall', 195000000, 2, 4.9,
      'فایروال سازمانی با پورت‌های SFP+ و توان بالا برای شبکه‌های متوسط تا بزرگ.',
      { 'توان فایروال': '۲۰ Gbps', 'IPS': '۲٫۶ Gbps', 'NGFW': '۱٫۶ Gbps', 'Threat Protection': '۱ Gbps', 'نصب': 'رک ۱U' }),
    P(8, 'Ubiquiti', 'اکسس پوینت Ubiquiti UniFi U6-Lite', 'wireless', 5900000, 18, 4.5,
      'اکسس پوینت سقفی Wi-Fi 6 با طراحی مینیمال و مدیریت متمرکز UniFi.',
      { 'استاندارد': 'Wi-Fi 6 (AX1500)', 'آنتن': '۲×۲ MIMO در هر دو باند', 'تغذیه': 'PoE 802.3af', 'ظرفیت': '۳۰۰+ کلاینت', 'مدیریت': 'UniFi Network' }),
    P(9, 'Ubiquiti', 'اکسس پوینت Ubiquiti UniFi U6 Pro', 'wireless', 9400000, 10, 4.7,
      'اکسس پوینت Wi-Fi 6 با توان بالا برای فضاهای پرتراکم مانند دفاتر و رستوران.',
      { 'استاندارد': 'Wi-Fi 6 (AX5400)', 'باند ۵GHz': '۴×۴ MIMO', 'باند ۲٫۴GHz': '۲×۲ MIMO', 'تغذیه': 'PoE 802.3af', 'پورت': '۱ × گیگابیت' }),
    P(10, 'Ubiquiti', 'رادیو Ubiquiti LiteBeam 5AC Gen2', 'wireless', 4300000, 12, 4.4,
      'رادیو نقطه‌به‌نقطه ۵ گیگاهرتز برای لینک‌های بی‌سیم مسافت‌بلند با آنتن داخلی پرقدرت.',
      { 'فرکانس': '۵ گیگاهرتز airMAX AC', 'گین آنتن': '۲۳ dBi', 'سرعت': 'تا ۴۵۰+ Mbps', 'پورت': '۱ × گیگابیت', 'برد': 'تا ۳۰+ کیلومتر' }),
    P(11, 'D-Link', 'کابل شبکه Cat6 UTP دی‌لینک (رول ۳۰۵ متری)', 'cable', 4800000, 40, 4.5,
      'کابل شبکه Cat6 با هادی مسی و روکش PVC، مناسب شبکه‌های گیگابیت و پروژه‌های کابل‌کشی.',
      { 'دسته': 'Cat6 UTP', 'هادی': 'مس ۲۳AWG', 'طول': '۳۰۵ متر', 'روکش': 'PVC', 'سرعت': 'گیگابیت (تا ۱۰G در ۵۵ متر)' }),
    P(12, 'Belden', 'کابل فیبر نوری سینگل‌مود ۴ کور (۱۰۰ متر)', 'cable', 3200000, 20, 4.3,
      'کابل فیبر نوری تک‌مود برای لینک‌های مسافت‌بلند و ارتباط بین ساختمانی.',
      { 'نوع': 'سینگل‌مود OS2', 'تعداد کور': '۴', 'طول': '۱۰۰ متر', 'کاربرد': 'داخلی/خارجی', 'کانکتور': 'بدون کانکتور' }),
    P(13, 'D-Link', 'پچ پنل ۲۴ پورت Cat6 دی‌لینک', 'rack', 2950000, 25, 4.4,
      'پچ پنل ۲۴ پورت Cat6 با نصب آسان در رک ۱۹ اینچ و برچسب‌گذاری پورت‌ها.',
      { 'تعداد پورت': '۲۴', 'دسته': 'Cat6 UTP', 'ارتفاع': '۱U', 'عرض': '۱۹ اینچ', 'رنگ': 'مشکی' }),
    P(14, 'Netrack', 'رک ایستاده ۴۲ یونیت ۶۰×۱۰۰', 'rack', 28000000, 4, 4.5,
      'رک ایستاده ۴۲U با درب شیشه‌ای و تهویه مناسب برای اتاق سرور.',
      { 'ظرفیت': '۴۲U', 'ابعاد': '۶۰ × ۱۰۰ سانتی‌متر', 'درب جلو': 'شیشه‌ای قفل‌دار', 'رنگ': 'مشکی', 'تهویه': 'سقف قابل نصب فن' }),
    P(15, 'Intel', 'کارت شبکه Intel X520-DA2 دو پورت ۱۰ گیگابیت', 'nic', 14500000, 7, 4.7,
      'کارت شبکه سرور با دو پورت SFP+ ده گیگابیت، مناسب مجازی‌سازی و ذخیره‌سازی.',
      { 'پورت': '۲ × SFP+', 'سرعت': '۱۰ Gbps', 'رابط': 'PCIe 2.0 x8', 'چیپ': '82599ES', 'کاربرد': 'سرور / مجازی‌سازی' }),
    P(16, 'TP-Link', 'مودم ADSL2+ وای‌فای TP-Link TD-W8961N', 'nic', 1250000, 30, 4.2,
      'مودم روتر ADSL2+ با وای‌فای N300 و چهار پورت LAN برای اینترنت خانگی.',
      { 'استاندارد': 'ADSL2+', 'وای‌فای': '۳۰۰ Mbps (N300)', 'پورت LAN': '۴ × ۱۰/۱۰۰', 'آنتن': '۲ عدد ثابت', 'کاربرد': 'منزل / دفتر کوچک' }),
    P(17, 'HPE', 'سرور HPE ProLiant DL380 Gen10', 'server', 420000000, 2, 4.9,
      'سرور رک ۲U پرکاربرد برای مجازی‌سازی و پایگاه داده (کانفیگ نمونه قابل سفارشی‌سازی).',
      { 'پردازنده': 'Xeon Silver 4210 — ۱۰ هسته', 'حافظه RAM': '۳۲ گیگابایت DDR4', 'ذخیره‌سازی': '۲ × ۴۸۰GB SSD', 'منبع تغذیه': '۸۰۰ وات', 'نصب': 'رک ۲U' }),
    P(18, 'TP-Link', 'کارت شبکه PCIe گیگابیت TP-Link TG-3468', 'nic', 650000, 35, 4.3,
      'کارت شبکه ارزان PCIe با سرعت گیگابیت برای کامپیوترهای رومیزی.',
      { 'پورت': '۱ × RJ45', 'سرعت': '۱۰/۱۰۰/۱۰۰۰ Mbps', 'رابط': 'PCI Express', 'پشتیبانی': 'ویندوز و لینوکس', 'براکت': 'Low-Profile همراه' })
  ];

  /* ---------- وضعیت ---------- */
  let products = LS.get(K.P, null);
  if (!Array.isArray(products) || !products.length) { products = SEED(); LS.set(K.P, products); }
  let cart = arr(LS.get(K.C, []));
  let wish = arr(LS.get(K.W, []));
  let orders = arr(LS.get(K.O, []));
  let user = LS.get(K.U, {}) || {};
  const F = { q: '', cat: 'all', sort: 'def' };       // فیلتر جستجو
  let noAnim = false;

  const getP = id => products.find(p => p.id === id);
  const saveCart = () => { LS.set(K.C, cart); refreshBadges(); };
  const saveWish = () => { LS.set(K.W, wish); refreshBadges(); };
  const saveOrders = () => LS.set(K.O, orders);
  const saveProducts = () => {
    if (LS.set(K.P, products)) return true;
    products = arr(LS.get(K.P, [])); return false;
  };
  const cartCount = () => cart.reduce((s, c) => s + (getP(c.id) ? c.qty : 0), 0);

  /* ---------- تم ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#0a0a0f' : '#ff6a00');
    const b = $('#themeBtn'); if (b) b.textContent = t === 'dark' ? '☀️' : '🌙';
  }
  function initTheme() {
    let t = LS.get(K.T, null);
    if (t !== 'dark' && t !== 'light') {
      t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    applyTheme(t);
  }
  function toggleTheme() {
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(t); LS.set(K.T, t);
  }

  /* ---------- پیام و مودال ---------- */
  function toast(msg, type) {
    const box = $('#toasts'); if (!box) return;
    const t = document.createElement('div');
    t.className = 'toast ' + (type || ''); t.textContent = msg; box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 2200);
    while (box.children.length > 3) box.firstChild.remove();
  }
  let modalTimer = null, askRes = null;
  function openModal(html) {
    clearTimeout(modalTimer);
    const m = $('#modal'); $('#sheet').innerHTML = html; m.hidden = false;
    requestAnimationFrame(() => m.classList.add('open'));
    document.body.classList.add('lock');
  }
  function closeModal() {
    if (askRes) { const r = askRes; askRes = null; r(false); }
    const m = $('#modal'); m.classList.remove('open'); document.body.classList.remove('lock');
    clearTimeout(modalTimer);
    modalTimer = setTimeout(() => { m.hidden = true; $('#sheet').innerHTML = ''; }, 220);
  }
  function ask(msg, okText) {
    return new Promise(res => {
      askRes = res;
      openModal(`<h3>تأیید</h3><p>${esc(msg)}</p>
        <div class="actions"><button class="btn danger" data-act="ask-yes">${esc(okText || 'بله، انجام شود')}</button><button class="btn" data-act="close">انصراف</button></div>`);
    });
  }

  /* ---------- اجزای مشترک UI ---------- */
  function imgBox(p, cls) {
    if (p.img) return `<div class="pimg ${cls || ''}"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"></div>`;
    return `<div class="pimg ${cls || ''}"><svg class="pico" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[p.cat] || ICONS.router}</svg><span class="pbrand">${esc(p.brand)}</span></div>`;
  }
  function card(p) {
    const on = wish.includes(p.id);
    const out = p.stock <= 0;
    return `<article class="card" data-go="#/product/${p.id}">
      <button class="fav ${on ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-label="علاقه‌مندی">♥</button>
      ${out ? '<span class="stock-badge">ناموجود</span>' : ''}
      ${imgBox(p)}
      <div class="cbody"><span class="brand">${esc(p.brand)}</span><h3>${esc(p.name)}</h3>
        <div class="crow"><span class="price">${num(p.price)} <small>تومان</small></span>
        <button class="btn-add" data-act="add" data-id="${p.id}" aria-label="افزودن به سبد" ${out ? 'disabled' : ''}>+</button></div></div>
    </article>`;
  }
  const backBtn = () => `<button class="icon-btn" data-act="back" aria-label="بازگشت"><svg class="i" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`;
  const emptyState = (ico, title, text, btn, go) => `<div class="empty"><div class="big">${ico}</div><h2>${esc(title)}</h2><p>${esc(text)}</p>${btn ? `<button class="btn primary" data-go="${go}">${esc(btn)}</button>` : ''}</div>`;

  function mount(html) {
    const v = $('#view'); v.innerHTML = html;
    if (!noAnim) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); window.scrollTo(0, 0); }
  }
  function rerender() { noAnim = true; try { route(); } finally { noAnim = false; } }

  function refreshBadges() {
    const c = cartCount(), w = wish.filter(id => getP(id)).length;
    const cb = $('#cartBadge'), wb = $('#wishBadge');
    if (cb) { cb.hidden = c === 0; cb.textContent = faDigits(c); }
    if (wb) { wb.hidden = w === 0; wb.textContent = faDigits(w); }
  }
  function bump() { const b = $('#cartBadge'); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }

  /* ---------- عملیات سبد و علاقه‌مندی ---------- */
  function addToCart(id, q) {
    q = q || 1;
    const p = getP(id);
    if (!p || p.stock <= 0) { toast('این محصول ناموجود است', 'error'); return false; }
    const it = cart.find(c => c.id === id);
    const cur = it ? it.qty : 0;
    if (cur + q > p.stock) { toast('حداکثر موجودی: ' + num(p.stock) + ' عدد', 'error'); return false; }
    if (it) it.qty += q; else cart.push({ id, qty: q });
    saveCart(); bump(); toast('به سبد خرید اضافه شد', 'ok');
    return true;
  }
  function toggleFav(id) {
    const i = wish.indexOf(id);
    if (i >= 0) { wish.splice(i, 1); toast('از علاقه‌مندی‌ها حذف شد'); } else { wish.push(id); toast('به علاقه‌مندی‌ها اضافه شد', 'ok'); }
    saveWish();
    $$(`.fav[data-id="${id}"]`).forEach(b => b.classList.toggle('on', wish.includes(id)));
    if (currentPath() === 'wishlist') rerender();
  }
  function cartDetail() {
    cart = cart.filter(c => getP(c.id) && c.qty > 0);
    cart.forEach(c => { const p = getP(c.id); if (c.qty > p.stock) c.qty = Math.max(p.stock, 0); });
    cart = cart.filter(c => c.qty > 0);
    const lines = cart.map(c => ({ p: getP(c.id), qty: c.qty }));
    const sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
    const shipping = sub === 0 ? 0 : (sub >= 5000000 ? 0 : 150000);
    const vat = Math.round(sub * 0.10);
    return { lines, sub, shipping, vat, total: sub + shipping + vat, count: lines.reduce((s, l) => s + l.qty, 0) };
  }

  /* ---------- مسیریابی ---------- */
  function currentPath() { return (location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0]) || ''; }
  function route() {
    const h = location.hash.replace(/^#/, '') || '/';
    const parts = h.split('?')[0].split('/').filter(Boolean);
    try {
      switch (parts[0]) {
        case undefined: vHome(); break;
        case 'search': vSearch(); break;
        case 'product': vProduct(parseInt(parts[1], 10)); break;
        case 'cart': vCart(); break;
        case 'wishlist': vWish(); break;
        case 'profile': vProfile(); break;
        case 'checkout': vCheckout(); break;
        case 'order': vOrderDone(parts[1]); break;
        case 'admin': vAdmin(); break;
        default: vError('صفحه‌ای که دنبالش هستید پیدا نشد.', 'ERR_404');
      }
    } catch (err) {
      console.error(err); vError('در نمایش این صفحه مشکلی پیش آمد.', String(err && err.message || err));
    }
    const tab = { '': 'home', search: 'search', product: 'home', wishlist: 'wishlist', cart: 'cart', checkout: 'cart', order: 'profile', profile: 'profile', admin: 'profile' }[parts[0] || ''] || '';
    $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    refreshBadges();
  }

  /* ---------- صفحه خطا ---------- */
  function vError(msg, code) {
    mount(`<div class="empty"><div class="big">⚠️</div><h2>خطا</h2><p>${esc(msg)}</p>
      <span class="code">${esc(code || '')}</span>
      <div class="actions"><button class="btn primary" data-act="retry">تلاش دوباره</button><button class="btn" data-go="#/">صفحه اصلی</button></div></div>`);
  }

  /* ---------- کاتالوگ: جستجو + دسته‌بندی ---------- */
  function catalogUI() {
    const chip = (id, name) => `<button class="chip ${F.cat === id ? 'on' : ''}" data-act="chip" data-cat="${id}">${esc(name)}</button>`;
    return `<div class="searchbar"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input id="q" type="search" placeholder="جستجوی محصول، برند یا مدل..." value="${esc(F.q)}" autocomplete="off"></div>
      <div class="chips" id="chips">${chip('all', 'همه')}${CATS.map(c => chip(c.id, c.name)).join('')}</div>
      <div class="toolbar"><span class="muted" id="count"></span>
        <select id="sort" data-change="sort" aria-label="مرتب‌سازی">
          <option value="def">پیش‌فرض</option><option value="new">جدیدترین</option><option value="cheap">ارزان‌ترین</option>
          <option value="exp">گران‌ترین</option><option value="rate">محبوب‌ترین</option></select></div>
      <div class="grid" id="grid"></div>`;
  }
  function filtered() {
    const q = norm(F.q);
    let l = products.filter(p => (F.cat === 'all' || p.cat === F.cat) &&
      (!q || norm([p.name, p.brand, p.desc, catName(p.cat)].join(' ')).includes(q)));
    const s = {
      def: (a, b) => a.id - b.id, new: (a, b) => b.id - a.id, cheap: (a, b) => a.price - b.price,
      exp: (a, b) => b.price - a.price, rate: (a, b) => (b.rating || 0) - (a.rating || 0)
    }[F.sort] || ((a, b) => b.id - a.id);
    return l.sort(s);
  }
  function renderGrid() {
    const g = $('#grid'); if (!g) return;
    const l = filtered();
    $('#count').textContent = num(l.length) + ' محصول';
    g.innerHTML = l.length ? l.map(card).join('') :
      `<div style="grid-column:1/-1">${emptyState('🔍', 'محصولی پیدا نشد', 'عبارت دیگری را جستجو کنید یا دسته‌بندی را تغییر دهید.', '', '')}</div>`;
  }
  function bindCatalog(focus) {
    $('#sort').value = F.sort;
    $('#q').addEventListener('input', e => { F.q = e.target.value; renderGrid(); });
    renderGrid();
    if (focus) setTimeout(() => { const q = $('#q'); if (q) q.focus(); }, 60);
  }

  function vHome() {
    mount(`<section class="hero"><div><h1>تجهیزات شبکه و کامپیوتر</h1>
      <p>مایکروتیک، سیسکو، یوبیکوئیتی، فورتی‌گیت و ... با ضمانت اصالت و ارسال سریع</p>
      <button class="btn light" data-go="#/search">شروع خرید</button></div>
      <svg class="hero-ico" viewBox="0 0 120 120" aria-hidden="true">${ICONS.router}</svg></section>${catalogUI()}`);
    bindCatalog(false);
  }
  function vSearch() {
    mount(`<div class="page-head">${backBtn()}<h2>جستجو و دسته‌بندی</h2></div>${catalogUI()}`);
    bindCatalog(true);
  }

  /* ---------- جزئیات محصول ---------- */
  function vProduct(id) {
    const p = getP(id);
    if (!p) return vError('این محصول وجود ندارد یا حذف شده است.', 'ERR_PRODUCT_NOT_FOUND');
    const on = wish.includes(p.id), out = p.stock <= 0;
    const rel = products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 6);
    const specs = Object.entries(p.specs || {});
    mount(`<div class="page-head">${backBtn()}<h2>جزئیات محصول</h2></div>
    <div class="detail">
      <div>${imgBox(p, 'big')}</div>
      <div class="dinfo">
        <span class="brand">${esc(p.brand)} · ${esc(catName(p.cat))}</span>
        <h1>${esc(p.name)}</h1>
        <div><span class="stars">${stars(p.rating || 0)}</span> <span class="muted">${faDigits((p.rating || 0).toFixed(1)).replace('.', '٫')}</span></div>
        <div class="dprice">${price(p.price)}</div>
        <div>${out ? '<span class="tag bad">ناموجود</span>' : `<span class="tag ok">موجود در انبار (${num(p.stock)} عدد)</span>`}</div>
        <p class="muted" style="font-size:.92rem">${esc(p.desc)}</p>
        <div class="actions">
          <div class="qty"><button data-act="pq" data-d="1" aria-label="افزایش">+</button><output id="pq">1</output><button data-act="pq" data-d="-1" aria-label="کاهش">−</button></div>
          <button class="btn primary" style="flex:1" data-act="addq" data-id="${p.id}" ${out ? 'disabled' : ''}>افزودن به سبد</button>
          <button class="icon-btn fav-inline fav ${on ? 'on' : ''}" style="position:static" data-act="fav" data-id="${p.id}" aria-label="علاقه‌مندی">♥</button>
        </div>
      </div>
    </div>
    ${specs.length ? `<div class="panel" style="margin-top:16px"><h3>مشخصات فنی</h3><table class="specs">${specs.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>` : ''}
    ${rel.length ? `<h3 class="section-title">محصولات مرتبط</h3><div class="hscroll">${rel.map(card).join('')}</div>` : ''}`);
  }

  /* ---------- سبد خرید ---------- */
  function vCart() {
    const d = cartDetail();
    if (!d.lines.length) { return mount(`<div class="page-head"><h2>سبد خرید</h2></div>` + emptyState('🛒', 'سبد خرید شما خالی است', 'هنوز محصولی به سبد اضافه نکرده‌اید.', 'مشاهده محصولات', '#/')); }
    const line = l => `<div class="line">${imgBox(l.p)}
      <div class="linfo"><b>${esc(l.p.name)}</b><span class="muted">${price(l.p.price)}</span>
        <div class="lbottom"><div class="qty"><button data-act="cinc" data-id="${l.p.id}" aria-label="افزایش">+</button><span>${num(l.qty)}</span><button data-act="cdec" data-id="${l.p.id}" aria-label="کاهش">−</button></div>
        <b class="price">${price(l.p.price * l.qty)}</b></div></div>
      <button class="icon-btn danger" data-act="cdel" data-id="${l.p.id}" aria-label="حذف">🗑</button></div>`;
    mount(`<div class="page-head"><h2>سبد خرید</h2><span class="muted">${num(d.count)} کالا</span></div>
      <div class="cart-wrap"><div class="lines">${d.lines.map(line).join('')}
        <button class="btn danger sm" style="align-self:flex-start" data-act="cclear">خالی کردن سبد</button></div>
      <aside class="panel"><h3>خلاصه سفارش</h3>
        <div class="srow"><span>جمع کالاها</span><span>${price(d.sub)}</span></div>
        <div class="srow"><span>مالیات بر ارزش افزوده (۱۰٪)</span><span>${price(d.vat)}</span></div>
        <div class="srow"><span>هزینه ارسال</span><span class="${d.shipping ? '' : 'free'}">${d.shipping ? price(d.shipping) : 'رایگان'}</span></div>
        <p class="hint">${d.shipping ? 'ارسال برای خرید بالای ۵٬۰۰۰٬۰۰۰ تومان رایگان است.' : ''}</p>
        <div class="srow total"><span>مبلغ قابل پرداخت</span><span>${price(d.total)}</span></div>
        <button class="btn primary block" style="margin-top:12px" data-go="#/checkout">ادامه و ثبت سفارش</button></aside></div>`);
  }

  /* ---------- علاقه‌مندی‌ها ---------- */
  function vWish() {
    const l = wish.map(getP).filter(Boolean);
    if (!l.length) return mount(`<div class="page-head"><h2>علاقه‌مندی‌ها</h2></div>` + emptyState('💜', 'لیست علاقه‌مندی خالی است', 'روی قلب محصولات بزنید تا اینجا ذخیره شوند.', 'مشاهده محصولات', '#/'));
    mount(`<div class="page-head"><h2>علاقه‌مندی‌ها</h2><span class="muted">${num(l.length)} محصول</span></div><div class="grid">${l.map(card).join('')}</div>`);
  }

  /* ---------- فرم‌ها: ابزار اعتبارسنجی ---------- */
  function fld(label, name, val, opts) {
    opts = opts || {};
    const tag = opts.textarea ? `<textarea name="${name}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''}>${esc(val)}</textarea>`
      : `<input name="${name}" type="${opts.type || 'text'}" value="${esc(val)}" ${opts.mode ? `inputmode="${opts.mode}"` : ''} ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''} autocomplete="off">`;
    return `<label class="fld"><span>${esc(label)}</span>${tag}<small class="err"></small></label>`;
  }
  function showErrors(form, errs) {
    $$('.fld', form).forEach(f => { f.classList.remove('bad'); const e = $('.err', f); if (e) e.textContent = ''; });
    const keys = Object.keys(errs);
    keys.forEach(k => {
      const el = form.elements[k]; const f = el && el.closest ? el.closest('.fld') : null;
      if (f) { f.classList.add('bad'); $('.err', f).textContent = errs[k]; }
    });
    if (keys.length) { const el = form.elements[keys[0]]; if (el && el.focus) el.focus(); }
    return keys.length === 0;
  }
  const val = (form, n) => (form.elements[n] ? String(form.elements[n].value).trim() : '');
  const phoneOk = s => /^09\d{9}$/.test(toEn(s));
  const postalOk = s => /^\d{10}$/.test(toEn(s));

  /* ---------- ثبت سفارش ---------- */
  function vCheckout() {
    const d = cartDetail();
    if (!d.lines.length) { location.hash = '#/cart'; return; }
    mount(`<div class="page-head">${backBtn()}<h2>ثبت سفارش</h2></div>
    <div class="cart-wrap"><form class="form panel" data-form="checkout" novalidate>
      <h3>اطلاعات گیرنده</h3>
      <div class="row2">${fld('نام و نام خانوادگی', 'name', user.name || '')}${fld('شماره موبایل', 'phone', user.phone || '', { type: 'tel', mode: 'numeric', ph: '09123456789' })}</div>
      <div class="row2">${fld('شهر', 'city', user.city || '')}${fld('کد پستی (۱۰ رقم)', 'postal', user.postal || '', { mode: 'numeric' })}</div>
      ${fld('آدرس کامل', 'address', user.address || '', { textarea: true })}
      ${fld('توضیحات (اختیاری)', 'note', '', { textarea: true })}
      <h3>روش پرداخت</h3>
      <div class="radio-row"><label><input type="radio" name="pay" value="پرداخت در محل" checked> پرداخت در محل</label>
        <label><input type="radio" name="pay" value="کارت به کارت"> کارت به کارت</label></div>
      <button class="btn primary block" type="submit">تأیید و ثبت نهایی سفارش</button></form>
    <aside class="panel"><h3>سفارش شما</h3>${d.lines.map(l => `<div class="srow"><span>${esc(l.p.name)} × ${num(l.qty)}</span><span>${price(l.p.price * l.qty)}</span></div>`).join('')}
      <div class="srow"><span>مالیات (۱۰٪)</span><span>${price(d.vat)}</span></div>
      <div class="srow"><span>ارسال</span><span>${d.shipping ? price(d.shipping) : 'رایگان'}</span></div>
      <div class="srow total"><span>مبلغ نهایی</span><span>${price(d.total)}</span></div></aside></div>`);
  }
  function submitCheckout(form) {
    const errs = {};
    if (val(form, 'name').length < 3) errs.name = 'نام را کامل وارد کنید.';
    if (!phoneOk(val(form, 'phone'))) errs.phone = 'شماره موبایل معتبر نیست (مثال: 09123456789).';
    if (val(form, 'city').length < 2) errs.city = 'شهر را وارد کنید.';
    if (!postalOk(val(form, 'postal'))) errs.postal = 'کد پستی باید ۱۰ رقم باشد.';
    if (val(form, 'address').length < 10) errs.address = 'آدرس را کامل‌تر بنویسید.';
    if (!showErrors(form, errs)) return;

    const d = cartDetail();
    if (!d.lines.length) { toast('سبد خرید خالی است', 'error'); location.hash = '#/cart'; return; }
    const checked = form.querySelector('input[name="pay"]:checked');
    const order = {
      id: 'NS-' + Date.now().toString(36).toUpperCase(),
      ts: Date.now(), status: STATUSES[0],
      customer: { name: val(form, 'name'), phone: toEn(val(form, 'phone')), city: val(form, 'city'), postal: toEn(val(form, 'postal')), address: val(form, 'address'), note: val(form, 'note') },
      pay: checked ? checked.value : 'پرداخت در محل',
      items: d.lines.map(l => ({ id: l.p.id, name: l.p.name, brand: l.p.brand, price: l.p.price, qty: l.qty })),
      sub: d.sub, shipping: d.shipping, vat: d.vat, total: d.total
    };
    d.lines.forEach(l => { const p = getP(l.p.id); if (p) p.stock = Math.max(0, p.stock - l.qty); });
    orders.unshift(order);
    user = Object.assign({}, user, { name: order.customer.name, phone: order.customer.phone, city: order.customer.city, postal: order.customer.postal, address: order.customer.address });
    cart = [];
    if (!saveOrders()) { orders.shift(); products = arr(LS.get(K.P, products)); toast('ثبت سفارش انجام نشد', 'error'); return; }
    saveProducts(); LS.set(K.U, user); saveCart();
    location.hash = '#/order/' + order.id;
  }
  function vOrderDone(id) {
    const o = orders.find(x => x.id === id);
    if (!o) return vError('سفارشی با این شناسه یافت نشد.', 'ERR_ORDER_NOT_FOUND');
    mount(`<div class="empty"><div class="big">✅</div><h2>سفارش شما ثبت شد</h2>
      <p>کد پیگیری: <b>${esc(o.id)}</b><br>مبلغ کل: ${price(o.total)}</p>
      <div class="actions"><button class="btn primary" data-go="#/profile">پیگیری سفارش‌ها</button><button class="btn" data-go="#/">ادامه خرید</button></div></div>`);
  }

  /* ---------- پروفایل ---------- */
  function orderHTML(o, admin) {
    const cancel = o.status === 'لغو شده';
    return `<div class="order"><header><b>${esc(o.id)}</b><span class="status ${cancel ? 'cancel' : ''}">${esc(o.status)}</span></header>
      <span class="muted">${dateFa(o.ts)} · ${esc(o.pay)}</span>
      <ul>${o.items.map(i => `<li>${esc(i.name)} × ${num(i.qty)}</li>`).join('')}</ul>
      ${admin ? `<span class="muted">${esc(o.customer.name)} · ${esc(o.customer.phone)} · ${esc(o.customer.city)}</span>` : ''}
      <div class="lbottom"><b class="price">${price(o.total)}</b>
      ${admin ? `<select data-change="ostatus" data-id="${esc(o.id)}" ${cancel ? 'disabled' : ''}>${STATUSES.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>`
        : (o.status === STATUSES[0] ? `<button class="btn danger sm" data-act="ocancel" data-id="${esc(o.id)}">لغو سفارش</button>` : '')}</div></div>`;
  }
  function vProfile() {
    const initial = (user.name || 'م').trim().charAt(0);
    mount(`<div class="user-card"><div class="avatar">${esc(initial)}</div><div><b>${esc(user.name || 'کاربر مهمان')}</b><br><small>${esc(user.phone ? faDigits(user.phone) : 'اطلاعات خود را تکمیل کنید')}</small></div></div>
    <div class="stack">
      <form class="form panel" data-form="profile" novalidate><h3>اطلاعات کاربری</h3>
        <div class="row2">${fld('نام و نام خانوادگی', 'name', user.name || '')}${fld('شماره موبایل', 'phone', user.phone || '', { type: 'tel', mode: 'numeric' })}</div>
        <div class="row2">${fld('ایمیل (اختیاری)', 'email', user.email || '', { type: 'email' })}${fld('شهر', 'city', user.city || '')}</div>
        ${fld('کد پستی', 'postal', user.postal || '', { mode: 'numeric' })}${fld('آدرس', 'address', user.address || '', { textarea: true })}
        <button class="btn primary" type="submit">ذخیره اطلاعات</button></form>
      <div class="panel"><h3>سفارش‌های من (${num(orders.length)})</h3>
        <div class="stack">${orders.length ? orders.map(o => orderHTML(o, false)).join('') : '<p class="muted">هنوز سفارشی ثبت نکرده‌اید.</p>'}</div></div>
      <button class="list-btn" data-act="theme"><span>تغییر تم (روز / شب)</span><span>🌗</span></button>
      <button class="list-btn" data-go="#/admin"><span>پنل مدیر</span><span>⚙️</span></button>
      <button class="list-btn" data-act="wipe" style="color:var(--danger)"><span>پاک کردن همه داده‌های برنامه</span><span>🧹</span></button>
    </div>`);
  }
  function submitProfile(form) {
    const errs = {};
    if (val(form, 'name').length < 3) errs.name = 'نام را کامل وارد کنید.';
    if (val(form, 'phone') && !phoneOk(val(form, 'phone'))) errs.phone = 'شماره موبایل معتبر نیست.';
    if (val(form, 'postal') && !postalOk(val(form, 'postal'))) errs.postal = 'کد پستی باید ۱۰ رقم باشد.';
    const em = val(form, 'email'); if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errs.email = 'ایمیل معتبر نیست.';
    if (!showErrors(form, errs)) return;
    user = { name: val(form, 'name'), phone: toEn(val(form, 'phone')), email: em, city: val(form, 'city'), postal: toEn(val(form, 'postal')), address: val(form, 'address') };
    if (LS.set(K.U, user)) { toast('اطلاعات ذخیره شد', 'ok'); rerender(); }
  }
  function cancelOrder(id) {
    const o = orders.find(x => x.id === id); if (!o || o.status === 'لغو شده') return;
    o.status = 'لغو شده';
    o.items.forEach(i => { const p = getP(i.id); if (p) p.stock += i.qty; });
    saveOrders(); saveProducts();
  }

  /* ---------- پنل مدیر ---------- */
  const isAdmin = () => { try { return sessionStorage.getItem('ns_admin') === '1'; } catch (e) { return false; } };
  function vAdmin() {
    if (!isAdmin()) {
      return mount(`<div class="page-head">${backBtn()}<h2>پنل مدیر</h2></div>
      <form class="form panel pin-box" data-form="pin" novalidate><div class="big" style="font-size:3rem">🔐</div>
        <h3>ورود مدیر</h3>${fld('رمز عبور', 'pin', '', { type: 'password', mode: 'numeric', ph: 'رمز پیش‌فرض: 1234' })}
        <button class="btn primary" type="submit">ورود</button></form>`);
    }
    const revenue = orders.filter(o => o.status !== 'لغو شده').reduce((s, o) => s + o.total, 0);
    mount(`<div class="page-head">${backBtn()}<h2>پنل مدیر</h2><button class="btn sm" data-act="lock">خروج</button></div>
      <div class="stats"><div class="stat"><b>${num(products.length)}</b><span>محصول</span></div><div class="stat"><b>${num(orders.length)}</b><span>سفارش</span></div><div class="stat"><b>${num(revenue / 1000000)}M</b><span>فروش (میلیون تومان)</span></div></div>
      <div class="toolrow"><button class="btn primary" data-act="padd">＋ افزودن محصول</button><button class="btn" data-act="setpin">تغییر رمز</button><button class="btn danger" data-act="reseed">بازنشانی نمونه‌ها</button></div>
      <h3 class="section-title">محصولات</h3>
      <div class="stack">${products.length ? products.map(p => `<div class="arow">${imgBox(p, 'sm')}<div class="ainfo"><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${price(p.price)} · موجودی ${num(p.stock)}</small></div>
        <div class="abtns"><button class="icon-btn" data-act="pedit" data-id="${p.id}" aria-label="ویرایش">✎</button><button class="icon-btn danger" data-act="pdel" data-id="${p.id}" aria-label="حذف">🗑</button></div></div>`).join('') : '<p class="muted">محصولی وجود ندارد.</p>'}</div>
      <h3 class="section-title">سفارش‌ها</h3>
      <div class="stack">${orders.length ? orders.map(o => orderHTML(o, true)).join('') : '<p class="muted">سفارشی ثبت نشده است.</p>'}</div>`);
  }

  let formImg = '';
  function openProductForm(id) {
    const p = id ? getP(id) : null; const x = p || { name: '', brand: '', cat: 'router', price: '', stock: '', desc: '', specs: {}, img: '', rating: 4.5 };
    formImg = x.img || '';
    const specsText = Object.entries(x.specs || {}).map(([k, v]) => k + ': ' + v).join('\n');
    openModal(`<h3>${p ? 'ویرایش محصول' : 'افزودن محصول'}</h3>
      <form class="form" data-form="product" novalidate><input type="hidden" name="id" value="${p ? p.id : ''}">
        ${fld('نام محصول', 'name', x.name)}
        <div class="row2">${fld('برند', 'brand', x.brand)}
          <label class="fld"><span>دسته‌بندی</span><select name="cat">${CATS.map(c => `<option value="${c.id}" ${c.id === x.cat ? 'selected' : ''}>${c.name}</option>`).join('')}</select><small class="err"></small></label></div>
        <div class="row2">${fld('قیمت (تومان)', 'price', x.price, { mode: 'numeric' })}${fld('موجودی', 'stock', x.stock, { mode: 'numeric' })}</div>
        ${fld('توضیحات', 'desc', x.desc, { textarea: true })}
        ${fld('مشخصات (هر خط: عنوان: مقدار)', 'specs', specsText, { textarea: true, ph: 'پورت‌ها: ۸ × گیگابیت' })}
        <label class="fld"><span>عکس محصول (اختیاری)</span><input type="file" accept="image/*" data-change="pimg"><small class="err"></small></label>
        <div id="imgPrev">${formImg ? `<img class="preview" src="${esc(formImg)}" alt=""> <button type="button" class="btn sm danger" data-act="pimgdel">حذف عکس</button>` : ''}</div>
        <div class="actions"><button class="btn primary" type="submit" style="flex:1">ذخیره</button><button class="btn" type="button" data-act="close">انصراف</button></div></form>`);
  }
  function handleImage(input) {
    const f = input.files && input.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { toast('فقط فایل تصویری مجاز است', 'error'); input.value = ''; return; }
    const fr = new FileReader();
    fr.onerror = () => toast('خواندن تصویر ناموفق بود', 'error');
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => toast('تصویر نامعتبر است', 'error');
      im.onload = () => {
        const max = 640, r = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        formImg = c.toDataURL('image/jpeg', 0.8);
        const pv = $('#imgPrev'); if (pv) pv.innerHTML = `<img class="preview" src="${formImg}" alt=""> <button type="button" class="btn sm danger" data-act="pimgdel">حذف عکس</button>`;
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(f);
  }
  function submitProduct(form) {
    const errs = {}, priceV = parseInt(toEn(val(form, 'price')).replace(/[^\d]/g, ''), 10), stockV = parseInt(toEn(val(form, 'stock')).replace(/[^\d]/g, ''), 10);
    if (val(form, 'name').length < 3) errs.name = 'نام محصول را وارد کنید.';
    if (!val(form, 'brand')) errs.brand = 'برند را وارد کنید.';
    if (!(priceV > 0)) errs.price = 'قیمت معتبر وارد کنید.';
    if (!(stockV >= 0)) errs.stock = 'موجودی معتبر وارد کنید.';
    if (!showErrors(form, errs)) return;
    const specs = {};
    val(form, 'specs').split('\n').forEach(line => {
      const m = line.match(/^\s*([^:：]+)[:：](.*)$/); if (m && m[1].trim() && m[2].trim()) specs[m[1].trim()] = m[2].trim();
    });
    const id = parseInt(val(form, 'id'), 10);
    const data = { name: val(form, 'name'), brand: val(form, 'brand'), cat: val(form, 'cat'), price: priceV, stock: stockV, desc: val(form, 'desc'), specs, img: formImg };
    if (id && getP(id)) Object.assign(getP(id), data);
    else products.push(Object.assign({ id: products.reduce((m, p) => Math.max(m, p.id), 0) + 1, rating: 4.5 }, data));
    if (saveProducts()) { toast('محصول ذخیره شد', 'ok'); closeModal(); rerender(); }
    else { toast('ذخیره ناموفق بود (احتمالاً حجم عکس زیاد است)', 'error'); }
  }
  async function deleteProduct(id) {
    const p = getP(id); if (!p) return;
    if (!(await ask('محصول «' + p.name + '» حذف شود؟'))) return;
    products = products.filter(x => x.id !== id);
    cart = cart.filter(c => c.id !== id); wish = wish.filter(w => w !== id);
    saveProducts(); saveCart(); saveWish(); toast('محصول حذف شد', 'ok'); rerender();
  }

  /* ---------- رویدادها ---------- */
  const ACT = {
    theme: toggleTheme,
    retry: () => rerender(),
    close: closeModal,
    back: () => { if (history.length > 1) history.back(); else location.hash = '#/'; },
    'ask-yes': () => { const r = askRes; askRes = null; closeModal(); if (r) r(true); },
    fav: el => toggleFav(+el.dataset.id),
    add: el => addToCart(+el.dataset.id),
    pq: el => {
      const o = $('#pq'); if (!o) return;
      const m = (getP(currentId()) || {}).stock || 1;
      o.textContent = String(Math.min(Math.max(1, (parseInt(o.textContent, 10) || 1) + (+el.dataset.d)), Math.max(m, 1)));
    },
    addq: el => addToCart(+el.dataset.id, parseInt($('#pq').textContent, 10) || 1),
    cinc: el => { const c = cart.find(x => x.id === +el.dataset.id); if (c && addToCart(c.id, 1)) { /* toast already */ } rerender(); },
    cdec: el => { const c = cart.find(x => x.id === +el.dataset.id); if (!c) return; c.qty -= 1; if (c.qty <= 0) cart = cart.filter(x => x !== c); saveCart(); rerender(); },
    cdel: el => { cart = cart.filter(x => x.id !== +el.dataset.id); saveCart(); rerender(); },
    cclear: async () => { if (await ask('همه کالاها از سبد حذف شوند؟')) { cart = []; saveCart(); rerender(); } },
    chip: el => { F.cat = el.dataset.cat; $$('#chips .chip').forEach(c => c.classList.toggle('on', c === el)); renderGrid(); },
    ocancel: async el => { if (await ask('این سفارش لغو شود؟', 'لغو سفارش')) { cancelOrder(el.dataset.id); toast('سفارش لغو شد', 'ok'); rerender(); } },
    wipe: async () => {
      if (!(await ask('همه اطلاعات (سبد، سفارش‌ها، علاقه‌مندی‌ها و محصولات افزوده‌شده) پاک شود؟', 'پاک کردن'))) return;
      Object.values(K).forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
      products = SEED(); LS.set(K.P, products); cart = []; wish = []; orders = []; user = {};
      initTheme(); refreshBadges(); toast('داده‌ها پاک شد', 'ok'); rerender();
    },
    lock: () => { try { sessionStorage.removeItem('ns_admin'); } catch (e) { /* ignore */ } rerender(); },
    padd: () => openProductForm(0),
    pedit: el => openProductForm(+el.dataset.id),
    pdel: el => deleteProduct(+el.dataset.id),
    pimgdel: () => { formImg = ''; const pv = $('#imgPrev'); if (pv) pv.innerHTML = ''; },
    reseed: async () => { if (await ask('محصولات به ۱۸ نمونه اولیه بازنشانی شوند؟ (محصولات افزوده‌شده حذف می‌شوند)', 'بازنشانی')) { products = SEED(); saveProducts(); rerender(); toast('بازنشانی شد', 'ok'); } },
    setpin: () => openModal(`<h3>تغییر رمز مدیر</h3><form class="form" data-form="newpin" novalidate>${fld('رمز جدید (حداقل ۴ رقم)', 'pin', '', { type: 'password', mode: 'numeric' })}<div class="actions"><button class="btn primary" type="submit">ذخیره</button><button class="btn" type="button" data-act="close">انصراف</button></div></form>`)
  };
  const CHG = {
    sort: el => { F.sort = el.value; renderGrid(); },
    pimg: handleImage,
    ostatus: el => {
      const o = orders.find(x => x.id === el.dataset.id); if (!o) return;
      if (el.value === 'لغو شده') cancelOrder(o.id); else { o.status = el.value; saveOrders(); }
      toast('وضعیت سفارش به‌روز شد', 'ok'); rerender();
    }
  };
  const FORMS = {
    checkout: submitCheckout, profile: submitProfile, product: submitProduct,
    pin: form => {
      if (toEn(val(form, 'pin')) === String(LS.get(K.PIN, '1234'))) { try { sessionStorage.setItem('ns_admin', '1'); } catch (e) { /* ignore */ } rerender(); }
      else showErrors(form, { pin: 'رمز اشتباه است.' });
    },
    newpin: form => {
      const p = toEn(val(form, 'pin'));
      if (!/^\d{4,}$/.test(p)) return showErrors(form, { pin: 'حداقل ۴ رقم (فقط عدد).' });
      if (LS.set(K.PIN, p)) { toast('رمز تغییر کرد', 'ok'); closeModal(); }
    }
  };
  function currentId() { const m = location.hash.match(/product\/(\d+)/); return m ? +m[1] : 0; }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a); return; }
    if (e.target.id === 'modal') { closeModal(); return; }
    const g = e.target.closest('[data-go]');
    if (g) { if (!$('#modal').hidden) closeModal(); location.hash = g.dataset.go; }
  });
  document.addEventListener('change', e => { const t = e.target.closest('[data-change]'); if (t && CHG[t.dataset.change]) CHG[t.dataset.change](t); });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-form]'); if (!f) return;
    e.preventDefault(); if (FORMS[f.dataset.form]) FORMS[f.dataset.form](f);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  window.addEventListener('hashchange', () => { if (!$('#modal').hidden) closeModal(); route(); });
  window.addEventListener('error', () => toast('خطای غیرمنتظره رخ داد', 'error'));
  window.addEventListener('unhandledrejection', () => toast('خطای غیرمنتظره رخ داد', 'error'));

  /* ---------- شروع ---------- */
  initTheme();
  route();
})();
