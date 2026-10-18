/* ===== COLLECTION PAGE ===== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  /* Perfumes ka data: naya perfume add karna ho to bas yahan ek line barha dein */
  const products = [
    { id:'rose-blush',    name:'Rose Blush',    cat:'Women',  notes:['Rose','Peony','Musk'],            img:'images/rose-blush.jpg',    desc:'A soft, romantic bouquet of fresh rose petals wrapped in creamy musk.' },
    { id:'golden-hour',   name:'Golden Hour',   cat:'Women',  notes:['Citrus','Amber','Wood'],          img:'images/golden-hour.jpg',   desc:'Sparkling citrus melting into warm amber, like sunlight at the end of the day.' },
    { id:'velvet-noir',   name:'Velvet Noir',   cat:'Women',  notes:['Patchouli','Leather','Musk'],     img:'images/velvet-noir.jpg',   desc:'Deep, sensual and mysterious, made for evenings that linger.' },
    { id:'midnight-wood', name:'Midnight Wood', cat:'Men',    notes:['Sandalwood','Vetiver','Amber'],   img:'images/midnight-wood.jpg', desc:'Smooth woods and earthy vetiver with a confident amber finish.' },
    { id:'luminous',      name:'Luminous',      cat:'Unisex', notes:['Bergamot','Jasmine','Musk'],      img:'images/luminous.jpg',      desc:'Bright, clean and radiant, a fragrance that suits every mood.' },
    { id:'blush-dream',   name:'Blush Dream',   cat:'Women',  notes:['Floral','Vanilla','Amber'],       img:'images/blush-dream.jpg',   desc:'Powdery florals sweetened with vanilla for a dreamy, gentle trail.' }
  ];

  const grid = $('#grid'), found = $('#found');
  let filter = 'All', query = '';

  /* Cards render */
  grid.innerHTML = products.map(p => `
    <article class="card" data-id="${p.id}">
      <a class="thumb" href="#${p.id}" data-open="${p.id}" aria-label="View ${p.name}">
        <img src="${p.img}" alt="${p.name} perfume bottle" loading="lazy" onerror="this.style.display='none'">
      </a>
      <span class="cat">${p.cat.toUpperCase()}</span>
      <h3>${p.name}</h3>
      <p class="notes">${p.notes.join(' · ')}</p>
      <button class="more" data-open="${p.id}">View Details <span>→</span></button>
    </article>`).join('') + '<p class="empty" id="empty" hidden>No fragrances match your search.</p>';
  const cards = [...grid.querySelectorAll('.card')];

  /* Filter + search */
  const apply = () => {
    let n = 0;
    cards.forEach(c => {
      const p = products.find(x => x.id === c.dataset.id);
      const okCat = filter === 'All' || p.cat === filter;
      const okQ = !query || (p.name + ' ' + p.notes.join(' ') + ' ' + p.cat).toLowerCase().includes(query);
      const show = okCat && okQ;
      c.classList.toggle('out', !show);
      if (show) { n++; c.classList.remove('in'); void c.offsetWidth; setTimeout(() => c.classList.add('in'), 60 * n); }
    });
    found.textContent = `${n} fragrance${n === 1 ? '' : 's'}`;
    $('#empty').hidden = n > 0;
  };
  const setPills = f => document.querySelectorAll('.pill').forEach(x => x.setAttribute('aria-pressed', x.dataset.filter === f));
  document.querySelectorAll('.pill').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter; setPills(filter);
    history.replaceState(null, '', filter === 'All' ? location.pathname : `?filter=${filter}`);
    apply();
  }));
  const fromUrl = new URLSearchParams(location.search).get('filter');
  if (['Women', 'Men', 'Unisex'].includes(fromUrl)) { filter = fromUrl; setPills(fromUrl); }
  addEventListener('nav-search', e => { query = e.detail.toLowerCase(); apply(); grid.scrollIntoView({ behavior:'smooth', block:'start' }); });
  $('#searchInput')?.addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); apply(); });
  apply();

  /* Quick view dialog */
  const dlg = $('#qv'), qvBody = $('#qvBody');
  const openQV = id => {
    const p = products.find(x => x.id === id); if (!p) return;
    qvBody.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"></div>
      <div class="qv-body"><span class="label">${p.cat.toUpperCase()}</span><h2>${p.name}</h2><p>${p.desc}</p>
        <div class="chips">${p.notes.map(n => `<span>${n}</span>`).join('')}</div>
        <button class="btn" data-close>Close</button></div>`;
    dlg.showModal();
  };
  grid.addEventListener('click', e => { const t = e.target.closest('[data-open]'); if (t) { e.preventDefault(); openQV(t.dataset.open); } });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

  /* Ripple on buttons */
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement('span');
    d.className = 'ripple'; Object.assign(d.style, { width:s+'px', height:s+'px', left:e.clientX-r.left-s/2+'px', top:e.clientY-r.top-s/2+'px' });
    b.appendChild(d); setTimeout(() => d.remove(), 600);
  });

  /* Theme toggle (light default, yaad rakhta hai) */
  const root = document.documentElement, tbtn = $('#theme');
  const get = () => { try { return localStorage.getItem('rose-theme'); } catch { return null; } };
  const setTheme = t => { root.dataset.theme = t; tbtn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode'; };
  setTheme(get() || 'light');
  tbtn.addEventListener('click', () => { const n = root.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(n); try { localStorage.setItem('rose-theme', n); } catch {} });
  $('#year').textContent = new Date().getFullYear();
})();

/* ===== NAVBAR ===== */
(() => {
  const $ = s => document.querySelector(s);
  const nav = $('#nav'), menuBtn = $('#menuBtn'), drawer = $('#drawer'), scrim = $('#scrim'),
        closeBtn = $('#closeBtn'), searchBtn = $('#searchBtn'), searchBar = $('#searchBar'), searchInput = $('#searchInput');

  /* 1. Scroll: shadow lagao, neeche scroll par hide, upar scroll par wapas show */
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      nav.classList.toggle('scrolled', y > 10);
      const lock = drawer.classList.contains('open') || !searchBar.hidden;
      nav.classList.toggle('hide', !lock && y > lastY && y > 160);
      lastY = y; ticking = false;
    });
  }, { passive: true });

  /* 2. Drawer (menu) */
  const openMenu = () => {
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('show'));
    menuBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const closeMenu = () => {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('show'); setTimeout(() => (scrim.hidden = true), 300);
    menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    menuBtn.focus();
  };
  menuBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  scrim.addEventListener('click', closeMenu);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* 3. Search bar */
  const toggleSearch = show => {
    searchBar.hidden = !show; searchBtn.setAttribute('aria-expanded', show);
    if (show) searchInput.focus(); else searchBtn.focus();
  };
  searchBtn.addEventListener('click', () => toggleSearch(searchBar.hidden));
  searchBar.addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) window.dispatchEvent(new CustomEvent('nav-search', { detail: q }));
  });

  /* 4. Esc se band karein + outside click se search band */
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (drawer.classList.contains('open')) closeMenu();
    else if (!searchBar.hidden) toggleSearch(false);
  });
  document.addEventListener('click', e => {
    if (!searchBar.hidden && !nav.contains(e.target)) toggleSearch(false);
  });

  /* 5. Active link khud highlight (current page ke naam se) */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .drawer a').forEach(a => {
    a.toggleAttribute('aria-current', a.getAttribute('href') === page);
  });
})();
