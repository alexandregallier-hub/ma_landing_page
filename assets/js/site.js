/* Élise Garnier · site vitrine
   Aucun framework, aucune dépendance. Tout le texte est déjà dans le HTML :
   ce script ajoute les états, les animations et les interactions. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fmt = (n, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------------------------------------------------------- Navigation */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 0);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('.menu-btn') || document.createElement('button');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  // Lien actif dans la barre de navigation
  const navLinks = $$('.nav-links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------------------------------------------------------- Hero */
  const hero = $('.hero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('in')));

  /* Démo en boucle : une demande de devis traitée avec l'assistant.
     État final visible par défaut dans le HTML ; la boucle ne démarre qu'avec JS. */
  const demo = $('#demo');
  if (demo) {
    const askTxt = $('.ask-txt', demo);
    const full = askTxt.dataset.full;
    const rows = $$('.draft tbody tr', demo);
    const check = $('.check', demo);
    const timerNew = $('.timer strong', demo);
    const pauseBtn = $('.win-pause', demo);
    let timers = [];
    let paused = false;
    let visible = true;
    let running = false;

    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clear = () => { timers.forEach(clearTimeout); timers = []; };

    const showFinal = () => {
      askTxt.textContent = full;
      rows.forEach((r) => r.classList.add('on'));
      check.classList.add('on');
      timerNew.textContent = '24 min';
    };

    let first = true;
    const cycle = () => {
      clear();
      if (first) { first = false; showFinal(); running = true; later(cycle, 3200); return; }
      running = true;
      askTxt.textContent = '';
      rows.forEach((r) => r.classList.remove('on'));
      check.classList.remove('on');
      timerNew.textContent = '…';
      let i = 0;
      const type = () => {
        if (i <= full.length) { askTxt.textContent = full.slice(0, i); i += 2; later(type, 22); }
        else {
          rows.forEach((r, k) => later(() => r.classList.add('on'), 450 + k * 260));
          later(() => check.classList.add('on'), 450 + rows.length * 260 + 500);
          later(() => { timerNew.textContent = '24 min'; }, 450 + rows.length * 260 + 800);
          later(cycle, 450 + rows.length * 260 + 5200);
        }
      };
      later(type, 900);
    };

    const setPaused = (p) => {
      paused = p;
      pauseBtn.setAttribute('aria-pressed', String(p));
      $('span', pauseBtn).textContent = p ? 'Lecture' : 'Pause';
      $('use', pauseBtn).setAttribute('href', p ? '#i-play' : '#i-pause');
      if (p) { clear(); showFinal(); running = false; } else if (visible) cycle();
    };
    pauseBtn.addEventListener('click', () => setPaused(!paused));

    if (reduce.matches) { setPaused(true); }
    else {
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (!visible) { clear(); showFinal(); running = false; }
        else if (!paused && !running) cycle();
      }, { threshold: 0.25 }).observe(demo);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { clear(); showFinal(); running = false; }
        else if (!paused && visible && !running) cycle();
      });
    }
  }

  /* ---------------------------------------------------------- Révélations */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px 10% 0px' });
  $$('.rv').forEach((el) => io.observe(el));

  /* ---------------------------------------------------------- Compteurs (chiffres prouvés uniquement) */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const runCount = (el) => {
    const to = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const pre = el.dataset.pre || '';
    const unit = el.dataset.unit || '';
    const unitHTML = unit ? (el.querySelector('.u') ? `<span class="u">${unit}</span>` : unit.replace(/^ /, ' ')) : '';
    if (reduce.matches || to === 0) return;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 1100);
      el.innerHTML = pre + fmt(to * easeOut(t), dec) + unitHTML;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { runCount(en.target); countIO.unobserve(en.target); } });
  }, { threshold: 0.6 });
  const watchCounts = (root = document) => $$('[data-count]', root).forEach((el) => { if (!el.dataset.watched && el.offsetParent !== null) { el.dataset.watched = '1'; countIO.observe(el); } });
  watchCounts();

  /* ---------------------------------------------------------- Phrase qui s'allume */
  const lit = $('[data-lit]');
  if (lit) {
    const full = lit.textContent.trim();
    const words = full.split(/[ \n\t]+/);
    lit.innerHTML = `<span class="visually-hidden">${full}</span>` + words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    const spans = $$('.w', lit);
    if (reduce.matches) spans.forEach((s) => s.classList.add('on'));
    else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = lit.getBoundingClientRect();
        const vh = innerHeight;
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        const n = Math.round(p * spans.length);
        spans.forEach((s, i) => s.classList.toggle('on', i < n));
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  }

  /* ---------------------------------------------------------- Étapes : ligne de progression */
  const steps = $('#steps');
  if (steps) {
    const bar = $('.steps-progress', steps);
    const items = $$('.step', steps);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = steps.getBoundingClientRect();
      const mid = innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      bar.style.setProperty('--p', p.toFixed(3));
      items.forEach((it) => it.classList.toggle('on', it.getBoundingClientRect().top < mid));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------- Carte des tâches */
  const tmap = $('#tmap');
  if (tmap) {
    const data = [
      { n: 'Réception', b: 10, a: 5, d: "La demande arrive par mail ou par téléphone. Quelqu’un la recopie dans un tableau de suivi.", da: 'Les demandes de devis sont reconnues et classées automatiquement dans la messagerie. Reste à les ouvrir.' },
      { n: 'Lecture des cotes', b: 20, a: 2, d: 'Le chargé d’affaires ouvre le PDF, relève chaque dimension et les ressaisit à la main.', da: "L’assistant extrait les cotes du PDF et signale celles qui sortent des standards." },
      { n: 'Recherche des prix', b: 30, a: 1, d: 'Trois fichiers Excel et un ancien devis pour retrouver les tarifs. Il recopie à la main.', da: "L’assistant applique la grille tarifaire 2026 et cite la ligne utilisée pour chaque prix." },
      { n: "Saisie dans l’ERP", b: 30, a: 6, d: 'Chaque ligne est saisie une à une dans le logiciel de gestion.', da: "Le devis arrive pré-rempli dans l’ERP par un import. Il reste à vérifier." },
      { n: 'Relecture', b: 15, a: 7, d: 'Relecture du devis complet avant envoi.', da: "Toujours faite par un humain. C’est l’étape où on gagne le moins, et c’est voulu." },
      { n: 'Envoi et relance', b: 25, a: 3, d: "Mail d’accompagnement rédigé à la main. La relance à J+7 est oubliée une fois sur deux.", da: 'Le mail est proposé en brouillon, la relance part seule à J+7 si le client n’a pas répondu.' },
    ];
    const tb = data.reduce((s, x) => s + x.b, 0);
    const ta = data.reduce((s, x) => s + x.a, 0);
    const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
    const nodes = $$('.node', tmap);
    const hand = $('.hand', tmap);
    if (hand) hand.style.setProperty('--len', Math.ceil(hand.getTotalLength()));
    let view = 'before';
    let sel = 2;
    const render = () => {
      const x = data[sel];
      $('#tm-step').textContent = `Étape ${sel + 1} sur ${data.length}`;
      $('#tm-name').textContent = x.n;
      $('#tm-desc').textContent = view === 'before' ? x.d : x.da;
      $('#tm-b').textContent = hm(x.b);
      $('#tm-a').textContent = hm(x.a);
      $('#tm-bb').style.transform = `scaleX(${(x.b / 30).toFixed(3)})`;
      $('#tm-ab').style.transform = `scaleX(${Math.max(0.02, x.a / 30).toFixed(3)})`;
      $('#tm-total').textContent = view === 'before' ? hm(tb) : hm(ta);
      $('#tm-total-l').textContent = view === 'before' ? "par devis, en moyenne, avant l’accompagnement" : 'par devis au jour 90, relecture humaine comprise';
      nodes.forEach((g, i) => {
        g.classList.toggle('sel', i === sel);
        g.classList.toggle('ai', view === 'after' && data[i].a <= data[i].b / 3);
        g.setAttribute('aria-pressed', String(i === sel));
        g.setAttribute('aria-label', `${data[i].n} : ${hm(data[i].b)} avant, ${hm(data[i].a)} au jour 90`);
        const t = $('.t', g);
        t.textContent = view === 'before' ? t.dataset.b : t.dataset.a;
      });
      tmap.classList.toggle('after', view === 'after');
      items.forEach((b, i) => {
        b.setAttribute('aria-pressed', String(i === sel));
        b.classList.toggle('ai', view === 'after' && data[i].a <= data[i].b / 3);
        b.lastChild.textContent = hm(view === 'before' ? data[i].b : data[i].a);
      });
    };
    const list = $('.flow-list', tmap);
    const items = data.map((x, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<span>${x.n}</span><span></span>`;
      b.addEventListener('click', () => { sel = i; render(); });
      li.appendChild(b); list.appendChild(li);
      return b;
    });
    nodes.forEach((g) => {
      const pick = () => { sel = +g.dataset.k; render(); };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    $$('.seg button', tmap).forEach((b) => b.addEventListener('click', () => {
      view = b.dataset.view;
      $$('.seg button', tmap).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
    }));
    render();
  }

  /* ---------------------------------------------------------- Calculateur */
  const calc = $('#calc');
  if (calc) {
    const P = $('#c-people'), H = $('#c-hours'), C = $('#c-cost');
    const RATE = 0.25, WEEKS = 44, DAY = 7, GROUP = 2900, GROUP_SIZE = 10;
    const paint = (r) => { const v = ((r.value - r.min) / (r.max - r.min)) * 100; r.style.setProperty('--v', v + '%'); };
    const upd = () => {
      const p = +P.value, h = +H.value, c = +C.value;
      $('#o-people').textContent = p;
      $('#o-hours').textContent = h + ' h';
      $('#o-cost').textContent = c + ' €';
      const weekly = p * h * RATE;
      const year = Math.round(weekly * WEEKS);
      $('#r-hours').textContent = fmt(year);
      $('#r-days').textContent = fmt(Math.round(year / DAY)) + ' jours';
      $('#r-value').textContent = fmt(Math.round(year * c / 10) * 10) + ' €';
      const groups = Math.ceil(p / GROUP_SIZE);
      const cost = GROUP * groups;
      const weeks = cost / (weekly * c);
      const pl = $('#r-payback-l');
      if (pl) pl.textContent = `Formation de ${groups} groupe${groups > 1 ? 's' : ''} (${fmt(cost)}\u00a0€ HT) rentabilisée en`;
      $('#r-payback').textContent = weeks < 1 ? 'moins d’une semaine' : fmt(weeks, weeks < 10 ? 1 : 0) + ' semaine' + (weeks >= 2 ? 's' : '');
      [P, H, C].forEach(paint);
    };
    [P, H, C].forEach((r) => r.addEventListener('input', upd));
    upd();
  }

  /* ---------------------------------------------------------- Études de cas (onglets) */
  const tabs = $$('.case-tab');
  if (tabs.length) {
    const select = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        const panel = $('#' + x.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on) { if (!reduce.matches) { panel.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.25,1,.5,1)' }); } watchCounts(panel); }
      });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        let j = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % tabs.length;
        if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (k === 'Home') j = 0;
        if (k === 'End') j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j], true); }
      });
    });
  }

  /* ---------------------------------------------------------- Choix de l'outil */
  const pick = $('#toolpick');
  if (pick) {
    const out = $('#tool-res');
    const ic = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
    const R = {
      dust: {
        k: 'Première piste', t: 'Dust, branché sur vos logiciels',
        p: "Plateforme française qui connecte des modèles d’IA à vos outils internes. Vos équipes créent leurs assistants métier sans écrire de code.",
        l: ['Hébergement en Europe au choix', 'Vos données jamais utilisées pour entraîner les modèles', 'Connexion à la messagerie, au drive, au CRM'],
      },
      mistral: {
        k: 'Première piste', t: 'Mistral Vibe, offre Enterprise',
        p: "L’assistant de l’éditeur français Mistral (ex-Le Chat). En offre Enterprise, vos données sont exclues de l’entraînement par défaut, et l’outil peut tourner sur vos serveurs, dans un cloud privé ou chez Mistral avec résidence des données.",
        l: ['Exclusion de l’entraînement par défaut', 'Avenant de traitement des données (DPA)', 'Déploiement sur vos serveurs possible'],
      },
      copilot: {
        k: 'Première piste', t: 'Microsoft 365 Copilot, bien réglé',
        p: "Vous l’avez peut-être déjà. Il travaille dans votre environnement Microsoft 365 et respecte les droits d’accès existants de vos fichiers. Tout se joue sur le réglage et les habitudes.",
        l: ['Audit des partages de fichiers avant activation', 'Bibliothèque de requêtes partagée', 'Règles écrites sur les données clients'],
      },
      chat: {
        k: 'Première piste', t: 'Mistral Vibe, offre Team',
        p: "Un assistant généraliste d’un éditeur français, indépendant de votre suite bureautique. Simple à déployer sur une petite équipe, à une condition : désactiver l’entraînement sur vos données dans l’administration, car il est actif par défaut hors offre Enterprise.",
        l: ['Abonnement par utilisateur', 'Espace partagé avec console d’administration', 'Entraînement désactivé par l’administrateur'],
      },
    };
    const decide = () => {
      const f = new FormData($('form', pick));
      const suite = f.get('suite'), sens = f.get('sens'), agents = f.get('agents');
      if (agents === 'yes') return R.dust;
      if (sens === 'high') return R.mistral;
      if (suite === 'ms') return R.copilot;
      return R.chat;
    };
    let last = null;
    const show = () => {
      const r = decide();
      if (r === last) return;
      last = r;
      out.innerHTML = `<p class="t-mono">${r.k}</p><h3>${r.t}</h3><p>${r.p}</p><ul>${r.l.map((x) => `<li>${ic}<span>${x}</span></li>`).join('')}</ul><p class="t-small" style="margin-top:18px">Une orientation, pas une recommandation définitive : elle se décide pendant le diagnostic, contrats en main.</p>`;
      if (!reduce.matches) { out.classList.remove('swap'); void out.offsetWidth; out.classList.add('swap'); }
    };
    pick.addEventListener('change', show);
    show();
  }

  /* ---------------------------------------------------------- Tableau d'atelier dessiné */
  const board = $('#board');
  if (board) {
    $$('.draw', board).forEach((p, i) => {
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
      p.style.transitionDelay = (i * 70) + 'ms';
    });
    if (reduce.matches) board.classList.add('in');
    else new IntersectionObserver(([en], o) => { if (en.isIntersecting) { board.classList.add('in'); o.disconnect(); } }, { threshold: 0.35 }).observe(board);
  }

  /* ---------------------------------------------------------- Prise de rendez-vous */
  const sched = $('#sched');
  if (sched) {
    const daysEl = $('#days'), slotsEl = $('#slots'), toForm = $('#to-form');
    const live = $('#sched-live');
    const steps3 = $$('.sched-step', sched);
    const SLOTS = ['09:00', '09:30', '10:30', '11:00', '14:00', '14:30', '16:00', '17:00'];
    let offset = 0, day = null, slot = null;
    const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
    const longDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const monthOnly = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

    // Jours ouvrés à partir de demain (J+1), cinq par page
    const workdays = (() => {
      const out = [];
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1);
      while (out.length < 15) { if (d.getDay() % 6 !== 0) out.push(new Date(d)); d.setDate(d.getDate() + 1); }
      return out;
    })();
    // Créneaux indisponibles déterministes, pour un agenda crédible
    const taken = (d, s) => ((d.getDate() * 7 + SLOTS.indexOf(s) * 3 + d.getMonth()) % 5) === 0;

    const go = (n) => {
      steps3.forEach((s) => { s.hidden = s.dataset.step !== String(n); });
      const cur = steps3.find((s) => !s.hidden);
      if (n === 3) cur.focus();
    };
    const renderDays = () => {
      const page = workdays.slice(offset * 5, offset * 5 + 5);
      const a = page[0], z = page[page.length - 1];
      const dm = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
      $('#sched-month').textContent = 'Choisissez un jour, ' + (a.getMonth() === z.getMonth() ? `du ${a.getDate()} au ${dm.format(z)}` : `du ${dm.format(a)} au ${dm.format(z)}`);
      daysEl.innerHTML = '';
      page.forEach((d) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'day';
        b.setAttribute('aria-pressed', String(!!day && d.getTime() === day.getTime()));
        b.innerHTML = `<small>${dayName.format(d).replace('.', '')}</small><b>${d.getDate()}</b><span class="visually-hidden"> ${monthOnly.format(d)}</span>`;
        b.addEventListener('click', () => { day = d; slot = null; renderDays(); renderSlots(); live.textContent = longDate.format(d) + ' sélectionné. Choisissez un horaire.'; });
        daysEl.appendChild(b);
      });
      $('[data-nav="-1"]', sched).disabled = offset === 0;
      $('[data-nav="1"]', sched).disabled = offset >= 2;
    };
    const renderSlots = () => {
      slotsEl.innerHTML = '';
      if (!day) { slotsEl.innerHTML = '<p class="slots-hint">Sélectionnez d’abord un jour.</p>'; return; }
      SLOTS.filter((s) => !taken(day, s)).forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'slot'; b.textContent = s.replace(':', ' h ');
        b.setAttribute('aria-pressed', String(slot === s));
        b.addEventListener('click', () => { slot = s; renderSlots(); live.textContent = `Créneau de ${s.replace(':', ' h ')} sélectionné.`; });
        slotsEl.appendChild(b);
      });
    };
    $$('[data-nav]', sched).forEach((b) => b.addEventListener('click', () => { offset = Math.max(0, Math.min(2, offset + +b.dataset.nav)); renderDays(); }));
    const label = () => `${longDate.format(day)} à ${slot.replace(':', ' h ')}, 30 minutes en visio`;
    toForm.addEventListener('click', () => {
      if (!slot) {
        const msg = day ? 'Choisissez un horaire pour continuer.' : 'Choisissez un jour, puis un horaire.';
        let hint = $('.slots-hint', slotsEl);
        if (!hint) { hint = document.createElement('p'); hint.className = 'slots-hint'; slotsEl.appendChild(hint); }
        hint.textContent = msg; hint.classList.add('warn'); live.textContent = msg;
        return;
      }
      $('#picked-txt').textContent = label().replace(/^./, (c) => c.toUpperCase());
      go(2);
      $('#f-name').focus();
    });
    $('#back-slot').addEventListener('click', () => { go(1); toForm.focus(); });

    // Formulaire
    const form = $('#book-form');
    const fields = [
      { el: $('#f-name'), ok: (v) => v.trim().length >= 2 },
      { el: $('#f-email'), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
      { el: $('#f-org'), ok: (v) => v.trim().length >= 1 },
    ];
    const validate = (f) => {
      const ok = f.ok(f.el.value);
      const wrap = f.el.closest('.fld');
      wrap.classList.toggle('invalid', !ok);
      f.el.setAttribute('aria-invalid', String(!ok));
      const err = wrap.querySelector('.err');
      if (!ok) f.el.setAttribute('aria-describedby', err.id); else f.el.removeAttribute('aria-describedby');
      return ok;
    };
    fields.forEach((f) => f.el.addEventListener('blur', () => { if (f.el.value) validate(f); }));
    fields.forEach((f) => f.el.addEventListener('input', () => { if (f.el.closest('.fld').classList.contains('invalid')) validate(f); }));

    const ics = (start, name) => {
      const end = new Date(start.getTime() + 30 * 60000);
      const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      return [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elise Garnier Conseil//RDV//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT', `UID:${Date.now()}@elisegarnier.fr`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(start)}`, `DTEND:${z(end)}`,
        'SUMMARY:Appel découverte avec Élise Garnier',
        `DESCRIPTION:30 minutes pour parler de ${name}. Le lien de visio arrive par mail.`,
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = fields.filter((f) => !validate(f));
      if (bad.length) { bad[0].el.focus(); live.textContent = 'Le formulaire contient une erreur. ' + bad[0].el.closest('.fld').querySelector('.err').textContent; return; }
      const btn = $('button[type=submit]', form);
      btn.setAttribute('aria-busy', 'true');
      const [h, m] = slot.split(':').map(Number);
      const start = new Date(day); start.setHours(h, m, 0, 0);
      const payload = { name: $('#f-name').value.trim(), email: $('#f-email').value.trim(), organization: $('#f-org').value.trim(), start: start.toISOString() };
      // Brancher ici l'outil de réservation retenu (voir README) : data-endpoint sur #sched
      const endpoint = sched.dataset.endpoint;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(res.status);
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
        const blob = new Blob([ics(start, payload.organization)], { type: 'text/calendar;charset=utf-8' });
        $('#ics').href = URL.createObjectURL(blob);
        $('#done-txt').textContent = `Rendez-vous le ${label()}. Une confirmation part à ${payload.email} avec le lien de la visio.`;
        go(3);
        live.textContent = 'Rendez-vous confirmé.';
      } catch (err) {
        live.textContent = "L’envoi n’a pas abouti. Réessayez, ou écrivez à contact@elisegarnier.fr.";
        alert("L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez directement à contact@elisegarnier.fr.");
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
    $('#restart').addEventListener('click', () => { day = null; slot = null; offset = 0; form.reset(); renderDays(); renderSlots(); go(1); });

    renderDays();
    renderSlots();
  }

  /* ---------------------------------------------------------- Bouton d'appel mobile */
  const mcta = $('#mcta');
  if (mcta && $('#rdv') && $('.hero-actions')) {
    const rdv = $('#rdv');
    let pastHero = false, atRdv = false, atFoot = false;
    const set = () => mcta.classList.toggle('show', pastHero && !atRdv && !atFoot);
    new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting && en.boundingClientRect.top < 0; set(); }).observe($('.hero-actions'));
    new IntersectionObserver(([en]) => { atRdv = en.isIntersecting; set(); }, { rootMargin: '0px 0px -20% 0px' }).observe(rdv);
    new IntersectionObserver(([en]) => { atFoot = en.isIntersecting; set(); }).observe($('.foot'));
  }
})();
