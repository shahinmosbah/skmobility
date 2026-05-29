/* ==============================
   PRELOADER
============================== */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => { pre.classList.add('hidden'); setTimeout(() => pre.remove(), 600); }, 600);
});

/* ==============================
   CUSTOM CURSOR
============================== */
const cursorEl = document.getElementById('cursor');
const cursorOut = document.getElementById('cursorOutline');
if (cursorEl && cursorOut && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top  = e.clientY + 'px';
    setTimeout(() => { cursorOut.style.left = e.clientX + 'px'; cursorOut.style.top = e.clientY + 'px'; }, 80);
  });
  document.querySelectorAll('a, button, input, select, textarea, .spro-card, .icard, .why-item').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorEl.classList.add('cursor-hover'); cursorOut.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { cursorEl.classList.remove('cursor-hover'); cursorOut.classList.remove('cursor-hover'); });
  });
}

/* ==============================
   SCROLL REVEAL
============================== */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

/* ==============================
   COUNTER ANIMATION
============================== */
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = parseInt(el.dataset.count), inc = target / (1800 / 16);
    let cur = 0;
    const t = setInterval(() => { cur += inc; if (cur >= target) { el.textContent = target; clearInterval(t); } else el.textContent = Math.floor(cur); }, 16);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-count]').forEach(el => countObs.observe(el));

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
   SCROLL-TO-TOP
============================== */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ==============================
   FORMULAIRE PRO → WHATSAPP
============================== */
document.getElementById('proForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value || '';

  const text = encodeURIComponent(
`Bonjour Skmobility ! Demande de transport professionnel.

👤 Nom : ${g('proPrenom')} ${g('proNom')}
🏢 Société : ${g('proSociete')}
💼 Poste : ${g('proPoste') || 'Non précisé'}
📞 Téléphone : ${g('proTel')}
✉️ Email : ${g('proEmail')}

🚗 Prestation souhaitée : ${g('proService') || 'Non précisée'}
📅 Fréquence : ${g('proFrequence') || 'Non précisée'}

📋 Détails :
${g('proMessage')}

Merci de me recontacter pour confirmer.`
  );

  window.open(`https://wa.me/33759630937?text=${text}`, '_blank');

  // Toast confirmation
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;bottom:28px;left:28px;z-index:800;background:#1a1a1a;border:1px solid rgba(255,255,255,.08);border-left:4px solid #c9a460;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 12px 40px rgba(0,0,0,.35);max-width:340px;transform:translateX(-120%);transition:transform .45s cubic-bezier(.16,1,.3,1)';
  div.innerHTML = `<div style="font-size:28px;color:#c9a460"><i class="fa-solid fa-circle-check"></i></div><div><strong style="display:block;font-size:13px;color:#fff;font-family:Raleway,sans-serif">Demande envoyée !</strong><span style="font-size:12px;color:rgba(255,255,255,.55);font-family:Raleway,sans-serif">Nous vous recontacterons rapidement.</span></div>`;
  document.body.appendChild(div);
  setTimeout(() => { div.style.transform = 'none'; }, 50);
  setTimeout(() => { div.style.transform = 'translateX(-120%)'; setTimeout(() => div.remove(), 500); }, 7000);
});
