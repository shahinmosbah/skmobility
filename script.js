/* ==============================
   PRELOADER
============================== */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => { pre.classList.add('hidden'); setTimeout(() => pre.remove(), 600); }, 700);
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
  document.querySelectorAll('a, button, input, select, textarea, .vehicle-card, .event-card, .airport-card, .autocomplete-item').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorEl.classList.add('cursor-hover'); cursorOut.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { cursorEl.classList.remove('cursor-hover'); cursorOut.classList.remove('cursor-hover'); });
  });
}

/* ==============================
   NOTIFICATION TOAST
============================== */
const toast = document.getElementById('notifToast');
const toastClose = document.getElementById('notifClose');
if (toast) {
  setTimeout(() => toast.classList.add('show'), 2500);
  toastClose?.addEventListener('click', () => { toast.style.transform = 'translateX(-120%)'; setTimeout(() => toast.remove(), 500); });
  setTimeout(() => { if (toast.parentNode) { toast.style.transform = 'translateX(-120%)'; setTimeout(() => toast.remove(), 500); } }, 9000);
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
   PARALLAX TESTIMONIAL
============================== */
const testSec = document.querySelector('.section-testimonial');
const testImg = document.querySelector('.testimonial-img');
if (testSec && testImg) {
  window.addEventListener('scroll', () => {
    const r = testSec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    testImg.style.transform = `translateY(${(r.top / window.innerHeight) * 55}px) scale(1.05)`;
  }, { passive: true });
}

/* ==============================
   MISC
============================== */
const siEl = document.querySelector('.scroll-indicator');
if (siEl) window.addEventListener('scroll', () => { siEl.style.opacity = window.scrollY > 80 ? '0' : '1'; }, { passive: true });

const headerEl = document.querySelector('header');
if (headerEl) window.addEventListener('scroll', () => { headerEl.style.boxShadow = window.scrollY > 60 ? '0 4px 40px rgba(0,0,0,.14)' : '0 2px 20px rgba(0,0,0,.05)'; }, { passive: true });

const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.onerror = () => { heroVideo.style.display = 'none'; const fb = document.querySelector('.hero-img-fallback'); if (fb) fb.style.display = 'block'; };
}

/* ==============================
   CARTE LEAFLET
============================== */
let map = null;
let routePolyline = null;
let departMarker = null;
let arriveeMarker = null;

function initMap() {
  if (map) return;
  const container = document.getElementById('simMap');
  if (!container) return;

  // Assure que le container a une hauteur avant l'init
  container.style.height = '420px';

  map = L.map('simMap', {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true
  });

  // OSM standard (fiable partout, y compris en local)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  map.setView([50.1764, 3.2336], 10);

  // Forcer le recalcul de la taille après le rendu
  setTimeout(() => { map.invalidateSize(true); }, 100);
  setTimeout(() => { map.invalidateSize(true); }, 500);
}

function makeIcon(type) {
  const color = type === 'depart' ? '#3b82f6' : '#c9a460';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 28 16 28S32 27 32 16C32 7.163 24.837 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: `<div style="width:32px;height:44px">${svg}</div>`,
    iconSize: [32, 44], iconAnchor: [16, 44], popupAnchor: [0, -44],
    className: ''
  });
}

function setMarker(type, lat, lon, label) {
  if (!map) initMap();
  if (type === 'depart') {
    if (departMarker) map.removeLayer(departMarker);
    departMarker = L.marker([lat, lon], { icon: makeIcon('depart') }).addTo(map).bindPopup(`<strong>Départ</strong><br>${label}`);
  } else {
    if (arriveeMarker) map.removeLayer(arriveeMarker);
    arriveeMarker = L.marker([lat, lon], { icon: makeIcon('arrivee') }).addTo(map).bindPopup(`<strong>Arrivée</strong><br>${label}`);
  }
}

function fitMapToMarkers() {
  if (!map) return;
  const pts = [];
  if (departMarker)  pts.push(departMarker.getLatLng());
  if (arriveeMarker) pts.push(arriveeMarker.getLatLng());
  if (pts.length === 1) map.setView(pts[0], 13);
  if (pts.length === 2) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
}

async function calculateRoute(lat1, lon1, lat2, lon2) {
  const loadEl = document.getElementById('mapLoading');
  if (loadEl) loadEl.style.display = 'flex';

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route');

    const route    = data.routes[0];
    const distKm   = Math.ceil(route.distance / 1000);
    const durMin   = Math.round(route.duration / 60);
    const durHours = Math.floor(durMin / 60);
    const durRest  = durMin % 60;
    const durLabel = durHours > 0 ? `${durHours}h ${durRest}min` : `${durMin} min`;

    // Update km (champ caché)
    const simKmEl = document.getElementById('simKm');
    if (simKmEl) simKmEl.value = distKm;
    renderPrice();

    // Dessin du trajet
    if (routePolyline) map.removeLayer(routePolyline);
    routePolyline = L.geoJSON(route.geometry, {
      style: { color: '#c9a460', weight: 5, opacity: .9, lineCap: 'round', lineJoin: 'round' }
    }).addTo(map);
    map.fitBounds(routePolyline.getBounds(), { padding: [60, 60] });

    // Barre d'info
    const fromEl = document.getElementById('routeFrom');
    const toEl   = document.getElementById('routeTo');
    const distEl = document.getElementById('routeDistance');
    const durEl  = document.getElementById('routeDuration');
    if (distEl) distEl.textContent = `${distKm} km`;
    if (durEl)  durEl.textContent  = durLabel;
    if (fromEl) fromEl.textContent = document.getElementById('simDepart')?.value?.split(',')[0]  || 'Départ';
    if (toEl)   toEl.textContent   = document.getElementById('simArrivee')?.value?.split(',')[0] || 'Arrivée';

  } catch {
    // Silently fail — km stays manual
  } finally {
    if (loadEl) loadEl.style.display = 'none';
  }
}

/* ==============================
   AUTOCOMPLETE (Nominatim OSM)
============================== */
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

class Autocomplete {
  constructor({ inputId, dropdownId, onSelect }) {
    this.input    = document.getElementById(inputId);
    this.dropdown = document.getElementById(dropdownId);
    this.onSelect = onSelect;
    this.activeIdx = -1;
    if (!this.input || !this.dropdown) return;
    this.search = debounce(this._fetch.bind(this), 350);
    this.input.addEventListener('input',   () => this.search());
    this.input.addEventListener('keydown', e  => this._keydown(e));
    this.input.addEventListener('focus',   () => { if (this.input.value.length >= 3) this.search(); });
    document.addEventListener('click', e => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) this._close();
    });
  }

  async _fetch() {
    const q = this.input.value.trim();
    if (q.length < 3) { this._close(); return; }
    this.dropdown.innerHTML = '<div class="autocomplete-loading"><div class="preloader-spinner" style="width:18px;height:18px;border-width:2px"></div> Recherche…</div>';
    this.dropdown.style.display = 'block';
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=7&countrycodes=fr,be,lu&addressdetails=1&accept-language=fr`,
        { headers: { 'User-Agent': 'Skmobility-VTC/1.0' } }
      );
      const data = await r.json();
      this._render(data, q);
    } catch { this._close(); }
  }

  _render(results, query) {
    if (!results.length) {
      this.dropdown.innerHTML = '<div class="autocomplete-loading">Aucun résultat trouvé</div>';
      return;
    }
    this.activeIdx = -1;
    this.dropdown.innerHTML = results.map((r, i) => {
      const name    = this._format(r);
      const short   = name.split(',')[0];
      const rest    = name.split(',').slice(1).join(',').trim();
      const icon    = this._icon(r.type || r.class || r.category || '');
      const marked  = short.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
      return `<div class="autocomplete-item" data-idx="${i}" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${name.replace(/"/g, '&quot;')}">
        <i class="fa-solid ${icon}"></i>
        <div><strong>${marked}</strong><span>${rest}</span></div>
      </div>`;
    }).join('');
    this.dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => this._select(item.dataset.name, parseFloat(item.dataset.lat), parseFloat(item.dataset.lon)));
      item.addEventListener('mouseenter', () => {
        this.dropdown.querySelectorAll('.autocomplete-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeIdx = parseInt(item.dataset.idx);
      });
    });
    this.dropdown.style.display = 'block';
  }

  _format(r) {
    const a = r.address || {};
    const parts = [
      a.road, a.house_number,
      a.village || a.town || a.city || a.municipality || a.county,
      a.postcode, a.country
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : r.display_name;
  }

  _icon(type) {
    const m = { aerodrome:'fa-plane', airport:'fa-plane', train_station:'fa-train', station:'fa-train', hotel:'fa-hotel', hospital:'fa-hospital', city:'fa-city', town:'fa-city', village:'fa-house', hamlet:'fa-house', suburb:'fa-map-pin' };
    return m[type] || 'fa-location-dot';
  }

  _keydown(e) {
    const items = [...this.dropdown.querySelectorAll('.autocomplete-item')];
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.activeIdx = Math.min(this.activeIdx + 1, items.length - 1); this._highlight(items); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.activeIdx = Math.max(this.activeIdx - 1, 0); this._highlight(items); }
    else if (e.key === 'Enter' && this.activeIdx >= 0) { e.preventDefault(); items[this.activeIdx].click(); }
    else if (e.key === 'Escape') this._close();
  }

  _highlight(items) { items.forEach((el, i) => el.classList.toggle('active', i === this.activeIdx)); }

  _select(name, lat, lon) {
    this.input.value = name;
    this._close();
    if (this.onSelect) this.onSelect({ lat, lon, name });
  }

  _close() { this.dropdown.style.display = 'none'; this.dropdown.innerHTML = ''; this.activeIdx = -1; }
}

/* ==============================
   ÉTAT GPS
============================== */
let departCoords  = null;
let arriveeCoords = null;

function tryCalculateRoute() {
  if (!departCoords || !arriveeCoords) return;
  if (!map) initMap();
  calculateRoute(departCoords.lat, departCoords.lon, arriveeCoords.lat, arriveeCoords.lon);
}

// Initialiser autocomplete départ
new Autocomplete({
  inputId: 'simDepart', dropdownId: 'departDropdown',
  onSelect({ lat, lon, name }) {
    departCoords = { lat, lon };
    setMarker('depart', lat, lon, name);
    fitMapToMarkers();
    tryCalculateRoute();
  }
});

// Initialiser autocomplete arrivée
new Autocomplete({
  inputId: 'simArrivee', dropdownId: 'arriveeDropdown',
  onSelect({ lat, lon, name }) {
    arriveeCoords = { lat, lon };
    setMarker('arrivee', lat, lon, name);
    fitMapToMarkers();
    tryCalculateRoute();
  }
});

/* ==============================
   GÉOLOCALISATION (bouton)
============================== */
document.getElementById('geolocBtn')?.addEventListener('click', async () => {
  if (!navigator.geolocation) { alert('Géolocalisation non supportée par votre navigateur.'); return; }
  const btn = document.getElementById('geolocBtn');
  btn.classList.add('loading');
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    try {
      const r    = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`);
      const data = await r.json();
      const name = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      document.getElementById('simDepart').value = name;
      departCoords = { lat, lon };
      if (!map) initMap();
      setMarker('depart', lat, lon, name);
      fitMapToMarkers();
      tryCalculateRoute();
    } catch {
      document.getElementById('simDepart').value = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      departCoords = { lat, lon };
    }
    btn.classList.remove('loading');
  }, () => { btn.classList.remove('loading'); alert('Impossible d\'obtenir votre position. Vérifiez les autorisations.'); });
});

/* ==============================
   BOUTONS PRESET AÉROPORT
============================== */
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dest = btn.dataset.dest;
    const lat  = parseFloat(btn.dataset.lat);
    const lon  = parseFloat(btn.dataset.lon);
    const inp  = document.getElementById('simArrivee');
    if (inp) inp.value = dest;
    arriveeCoords = { lat, lon };
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (!map) initMap();
    setMarker('arrivee', lat, lon, dest);
    fitMapToMarkers();
    tryCalculateRoute();
  });
});

/* ==============================
   SIMULATEUR DE TARIF
============================== */
const RATES = {
  standard: { perKm: 1.80, min: 20, label: 'VTC Confort' },
  xl:       { perKm: 2.30, min: 28, label: 'VTC Spacieux' }
};

function computePrice() {
  const km      = parseFloat(document.getElementById('simKm')?.value) || 0;
  const vehicle = document.getElementById('simVehicule')?.value || 'standard';
  const bebe    = document.getElementById('optBebe')?.checked;
  const eau     = document.getElementById('optEau')?.checked;
  const r       = RATES[vehicle];
  const base    = Math.max(km * r.perKm, r.min);
  const addBebe = bebe ? 10 : 0;
  const addEau  = eau  ? 2  : 0;
  return { km, vehicle, r, base, addBebe, addEau, total: base + addBebe + addEau };
}

function renderPrice() {
  const p       = computePrice();
  const totalEl = document.getElementById('simTotal');
  const breakEl = document.getElementById('simBreakdown');
  if (!totalEl || !breakEl) return;
  totalEl.textContent = p.total.toFixed(2) + ' €';
  let html = `<div class="sim-breakdown-line"><span>Base (${p.km} km — ${p.r.label})</span><span>${p.base.toFixed(2)} €</span></div>`;
  if (p.addBebe) html += `<div class="sim-breakdown-line"><span>🪑 Siège bébé</span><span>+${p.addBebe.toFixed(2)} €</span></div>`;
  if (p.addEau)  html += `<div class="sim-breakdown-line"><span>💧 Eau minérale</span><span>+${p.addEau.toFixed(2)} €</span></div>`;
  html += `<div class="sim-breakdown-line total"><span>Total estimé</span><span>${p.total.toFixed(2)} €</span></div>`;
  breakEl.innerHTML = html;
  updateWALink(p);
}

function updateWALink(p) {
  const btn     = document.getElementById('btnWhatsApp');
  if (!btn) return;
  const depart  = document.getElementById('simDepart')?.value  || 'Non précisé';
  const arrivee = document.getElementById('simArrivee')?.value || 'Non précisé';
  const opts = [p.addBebe ? '🪑 Siège bébé (+10€)' : '', p.addEau ? '💧 Eau (+2€)' : ''].filter(Boolean).join('\n') || 'Aucune';
  const msg = encodeURIComponent(`Bonjour Skmobility ! Je souhaite un devis.\n\n📍 Départ : ${depart}\n📍 Arrivée : ${arrivee}\n📏 Distance : ${p.km} km\n🚗 Véhicule : ${p.r.label}\nOptions :\n${opts}\n\n💰 Estimation : ${p.total.toFixed(2)} €\n\nMerci de confirmer la disponibilité et le tarif.`);
  btn.href = `https://wa.me/33759630937?text=${msg}`;
}

['simVehicule', 'optBebe', 'optEau'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', renderPrice);
});

renderPrice();

/* ==============================
   INIT CARTE — dès que le DOM est prêt
============================== */
// Init immédiate (pas d'IntersectionObserver — évite le problème de hauteur 0)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

// Réinit si la fenêtre est redimensionnée
window.addEventListener('resize', () => { if (map) map.invalidateSize(true); }, { passive: true });

/* ==============================
   CARROUSEL AVIS GOOGLE
============================== */
(function initReviewsCarousel() {
  const track   = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track) return;

  const cards = [...track.children];
  let current  = 0;
  let autoTimer = null;
  let startX = 0;

  function getVisible() {
    if (window.innerWidth >= 900) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }

  function maxIndex() { return Math.max(0, cards.length - getVisible()); }

  function go(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    const pct = current * (100 / getVisible());
    track.style.transform = `translateX(-${pct}%)`;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIndex();
    updateDots();
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Avis ${i + 1}`);
      d.addEventListener('click', () => { stopAuto(); go(i); startAuto(); });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      go(current >= maxIndex() ? 0 : current + 1);
    }, 5000);
  }

  function stopAuto() { clearInterval(autoTimer); }

  prevBtn?.addEventListener('click', () => { stopAuto(); go(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { stopAuto(); go(current + 1); startAuto(); });

  // Touch / swipe
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(dx < 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  // Pause on hover
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => { buildDots(); go(Math.min(current, maxIndex())); });

  buildDots();
  go(0);
  startAuto();
})();

/* ==============================
   FORMULAIRE → WHATSAPP
============================== */
document.getElementById('bookingForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value || '';
  const text = encodeURIComponent(
`Bonjour Skmobility ! Je souhaite réserver un trajet.

👤 Nom : ${g('bkPrenom')} ${g('bkNom')}
📞 Téléphone : ${g('bkTel')}
✉️ Email : ${g('bkEmail')}
🎂 Âge : ${g('bkAge') || 'Non précisé'}
👥 Passagers : ${g('bkPassagers')}
📅 Date : ${g('bkDate')}
🕐 Heure : ${g('bkHeure')}

📋 Informations complémentaires :
${g('bkMessage') || 'Aucune'}

J'attends votre confirmation. Merci !`
  );
  window.open(`https://wa.me/33759630937?text=${text}`, '_blank');
  showConfirmToast();
});

function showConfirmToast() {
  const div = document.createElement('div');
  div.className = 'notif-toast show';
  div.style.cssText = 'bottom:28px;left:28px;border-left-color:#c9a460';
  div.innerHTML = `<div class="notif-icon" style="color:#c9a460"><i class="fa-solid fa-circle-check"></i></div><div class="notif-body"><strong>Demande envoyée !</strong><span>Notre chauffeur reviendra vers vous pour confirmer votre réservation.</span></div>`;
  document.body.appendChild(div);
  setTimeout(() => { div.style.transform = 'translateX(-120%)'; setTimeout(() => div.remove(), 500); }, 7000);
}
