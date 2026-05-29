/* ==============================
   PRELOADER
============================== */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => {
    pre.classList.add('hidden');
    setTimeout(() => pre.remove(), 600);
  }, 700);
});

/* ==============================
   CUSTOM CURSOR
============================== */
const cursor = document.getElementById('cursor');
const cursorOutline = document.getElementById('cursorOutline');

if (cursor && cursorOutline && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    setTimeout(() => {
      cursorOutline.style.left = e.clientX + 'px';
      cursorOutline.style.top  = e.clientY + 'px';
    }, 80);
  });
  document.querySelectorAll('a, button, input, select, textarea, .vehicle-card, .event-card, .airport-card, .preset-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('cursor-hover'); cursorOutline.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('cursor-hover'); cursorOutline.classList.remove('cursor-hover'); });
  });
}

/* ==============================
   NOTIFICATION TOAST
============================== */
const toast = document.getElementById('notifToast');
const toastClose = document.getElementById('notifClose');

if (toast) {
  setTimeout(() => toast.classList.add('show'), 2500);
  if (toastClose) {
    toastClose.addEventListener('click', () => {
      toast.style.transform = 'translateX(-120%)';
      setTimeout(() => toast.remove(), 500);
    });
  }
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(-120%)';
      setTimeout(() => toast.remove(), 500);
    }
  }, 9000);
}

/* ==============================
   SCROLL REVEAL
============================== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

/* ==============================
   COUNTER ANIMATION
============================== */
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count);
    const inc = target / (1800 / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= target) { el.textContent = target; clearInterval(timer); }
      else el.textContent = Math.floor(cur);
    }, 16);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-count]').forEach(el => countObs.observe(el));

/* ==============================
   PARALLAX TESTIMONIAL
============================== */
const testSection = document.querySelector('.section-testimonial');
const testImg = document.querySelector('.testimonial-img');
if (testSection && testImg) {
  window.addEventListener('scroll', () => {
    const r = testSection.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    testImg.style.transform = `translateY(${(r.top / window.innerHeight) * 55}px) scale(1.05)`;
  }, { passive: true });
}

/* ==============================
   SCROLL REVEAL INDICATOR
============================== */
const si = document.querySelector('.scroll-indicator');
if (si) window.addEventListener('scroll', () => { si.style.opacity = window.scrollY > 80 ? '0' : '1'; }, { passive: true });

/* ==============================
   HEADER SHADOW ON SCROLL
============================== */
const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 60 ? '0 4px 40px rgba(0,0,0,.14)' : '0 2px 20px rgba(0,0,0,.05)';
  }, { passive: true });
}

/* ==============================
   SCROLL-TO-TOP BUTTON
============================== */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ==============================
   VIDEO FALLBACK
============================== */
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.addEventListener('error', () => {
    heroVideo.style.display = 'none';
    const fb = document.querySelector('.hero-img-fallback');
    if (fb) fb.style.display = 'block';
  });
  if (!heroVideo.src || heroVideo.src.endsWith('hero-video.mp4')) {
    heroVideo.addEventListener('emptied', () => {});
    heroVideo.onerror = () => {
      heroVideo.style.display = 'none';
      const fb = document.querySelector('.hero-img-fallback');
      if (fb) fb.style.display = 'block';
    };
  }
}

/* ==============================
   SIMULATEUR DE TARIF
============================== */
const RATES = {
  standard: { perKm: 1.80, min: 20,  label: 'Berline Standard' },
  premium:  { perKm: 2.30, min: 25,  label: 'Berline Haut de Gamme' },
  xl:       { perKm: 2.80, min: 35,  label: 'Van XL / Monospace' }
};

let bagCount = 1;

function computePrice() {
  const km       = parseFloat(document.getElementById('simKm')?.value) || 0;
  const vehicle  = document.getElementById('simVehicule')?.value || 'standard';
  const bebe     = document.getElementById('optBebe')?.checked;
  const eau      = document.getElementById('optEau')?.checked;
  const bagage   = document.getElementById('optBagage')?.checked;

  const r        = RATES[vehicle];
  const base     = Math.max(km * r.perKm, r.min);
  const addBebe  = bebe   ? 10 : 0;
  const addEau   = eau    ? 2  : 0;
  const addBag   = bagage ? bagCount * 5 : 0;
  const total    = base + addBebe + addEau + addBag;

  return { km, vehicle, r, base, addBebe, addEau, addBag, total, bagage };
}

function renderPrice() {
  const p = computePrice();
  const totalEl     = document.getElementById('simTotal');
  const breakdownEl = document.getElementById('simBreakdown');
  if (!totalEl || !breakdownEl) return;

  totalEl.textContent = p.total.toFixed(2) + ' €';

  let lines = `<div class="sim-breakdown-line"><span>Trajet de base (${p.km} km — ${p.r.label})</span><span>${p.base.toFixed(2)} €</span></div>`;
  if (p.addBebe)  lines += `<div class="sim-breakdown-line"><span>🪑 Siège bébé</span><span>+${p.addBebe.toFixed(2)} €</span></div>`;
  if (p.addEau)   lines += `<div class="sim-breakdown-line"><span>💧 Eau minérale</span><span>+${p.addEau.toFixed(2)} €</span></div>`;
  if (p.addBag)   lines += `<div class="sim-breakdown-line"><span>🧳 Bagages (×${bagCount})</span><span>+${p.addBag.toFixed(2)} €</span></div>`;
  lines += `<div class="sim-breakdown-line total"><span>Total estimé</span><span>${p.total.toFixed(2)} €</span></div>`;
  breakdownEl.innerHTML = lines;

  updateWhatsAppLink(p);
}

function updateWhatsAppLink(p) {
  const btn     = document.getElementById('btnWhatsApp');
  if (!btn) return;
  const depart  = document.getElementById('simDepart')?.value  || 'Non précisé';
  const arrivee = document.getElementById('simArrivee')?.value || 'Non précisé';

  const opts = [
    p.addBebe  ? '🪑 Siège bébé (+10€)'            : '',
    p.addEau   ? '💧 Eau minérale (+2€)'             : '',
    p.addBag   ? `🧳 ${bagCount} bagage(s) (+${p.addBag}€)` : '',
  ].filter(Boolean).join('\n') || 'Aucune option';

  const msg = encodeURIComponent(
`Bonjour Skmobility ! Je souhaite obtenir un devis.

📍 Départ : ${depart}
📍 Arrivée : ${arrivee}
📏 Distance : ${p.km} km
🚗 Véhicule : ${p.r.label}
Options :
${opts}

💰 Estimation simulée : ${p.total.toFixed(2)} €

Merci de me confirmer la disponibilité et le tarif définitif.`
  );
  btn.href = `https://wa.me/33759630937?text=${msg}`;
}

// Boutons preset aéroport
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const km = parseInt(btn.dataset.km);
    const simKm      = document.getElementById('simKm');
    const simKmRange = document.getElementById('simKmRange');
    if (simKm)      simKm.value = km;
    if (simKmRange) simKmRange.value = km;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPrice();
  });
});

// Slider km ↔ input sync
const simKm      = document.getElementById('simKm');
const simKmRange = document.getElementById('simKmRange');
if (simKm && simKmRange) {
  simKm.addEventListener('input', () => { simKmRange.value = simKm.value; renderPrice(); });
  simKmRange.addEventListener('input', () => { simKm.value = simKmRange.value; renderPrice(); });
}

// Boutons +/- km
document.getElementById('kmMinus')?.addEventListener('click', () => {
  const el = document.getElementById('simKm'); if (!el) return;
  el.value = Math.max(1, parseInt(el.value) - 5);
  if (simKmRange) simKmRange.value = el.value;
  renderPrice();
});
document.getElementById('kmPlus')?.addEventListener('click', () => {
  const el = document.getElementById('simKm'); if (!el) return;
  el.value = Math.min(1000, parseInt(el.value) + 5);
  if (simKmRange) simKmRange.value = el.value;
  renderPrice();
});

// Changement véhicule / options
['simVehicule','optBebe','optEau','optBagage'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', () => {
    const bagDiv = document.getElementById('bagageCount');
    if (id === 'optBagage' && bagDiv) {
      bagDiv.style.display = document.getElementById('optBagage').checked ? 'flex' : 'none';
    }
    renderPrice();
  });
});

// Boutons +/- bagages
document.getElementById('bagMinus')?.addEventListener('click', () => {
  bagCount = Math.max(1, bagCount - 1);
  document.getElementById('bagNum').textContent = bagCount;
  renderPrice();
});
document.getElementById('bagPlus')?.addEventListener('click', () => {
  bagCount = Math.min(10, bagCount + 1);
  document.getElementById('bagNum').textContent = bagCount;
  renderPrice();
});

// Départ / arrivée → update lien WA
document.getElementById('simDepart')?.addEventListener('input', renderPrice);
document.getElementById('simArrivee')?.addEventListener('input', renderPrice);

// Init
renderPrice();

/* ==============================
   FORMULAIRE → WHATSAPP
============================== */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const prenom    = document.getElementById('bkPrenom')?.value     || '';
    const nom       = document.getElementById('bkNom')?.value        || '';
    const tel       = document.getElementById('bkTel')?.value        || '';
    const email     = document.getElementById('bkEmail')?.value      || '';
    const age       = document.getElementById('bkAge')?.value        || 'Non précisé';
    const passagers = document.getElementById('bkPassagers')?.value  || '';
    const date      = document.getElementById('bkDate')?.value       || '';
    const heure     = document.getElementById('bkHeure')?.value      || '';
    const msg       = document.getElementById('bkMessage')?.value    || 'Aucune';

    const text = encodeURIComponent(
`Bonjour Skmobility ! Je souhaite réserver un trajet.

👤 Nom : ${prenom} ${nom}
📞 Téléphone : ${tel}
✉️ Email : ${email}
🎂 Âge : ${age}
👥 Passagers : ${passagers}
📅 Date : ${date}
🕐 Heure : ${heure}

📋 Informations complémentaires :
${msg}

J'attends votre confirmation. Merci !`
    );

    window.open(`https://wa.me/33759630937?text=${text}`, '_blank');

    // Toast de confirmation
    showConfirmToast();
  });
}

function showConfirmToast() {
  const div = document.createElement('div');
  div.className = 'notif-toast show';
  div.style.cssText = 'bottom:28px;left:28px;border-left-color:#c9a460';
  div.innerHTML = `
    <div class="notif-icon" style="color:#c9a460"><i class="fa-solid fa-circle-check"></i></div>
    <div class="notif-body">
      <strong>Demande envoyée !</strong>
      <span>Notre chauffeur reviendra vers vous pour confirmer votre réservation.</span>
    </div>`;
  document.body.appendChild(div);
  setTimeout(() => { div.style.transform = 'translateX(-120%)'; setTimeout(() => div.remove(), 500); }, 7000);
}
