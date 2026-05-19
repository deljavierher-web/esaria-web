/* ---- Número WhatsApp — cambiar aquí si cambia ---- */
const WA_PHONE = '34614918261';
const WA_DEFAULT_TEXT = encodeURIComponent('Hola, quiero información sobre automatización para mi negocio');

/* Actualiza todos los enlaces de WhatsApp a partir de WA_PHONE */
document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
  link.href = 'https://wa.me/' + WA_PHONE + '?text=' + WA_DEFAULT_TEXT;
});

/* ---- Mobile menu ---- */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('hamburger');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('open', open);
  btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

document.getElementById('hamburger').addEventListener('click', toggleMenu);
document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', e => {
  const header = document.querySelector('header');
  if (!header.contains(e.target)) closeMenu();
});

/* ---- Sector tabs ---- */
function showSector(id, btn) {
  document.querySelectorAll('.sector-content').forEach(el => {
    el.classList.remove('active', 'sector-entering');
  });
  document.querySelectorAll('.sector-tab').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-selected', 'false');
  });
  const panel = document.getElementById('sector-' + id);
  panel.classList.add('active', 'sector-entering');
  panel.addEventListener('animationend', () => panel.classList.remove('sector-entering'), { once: true });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
}

document.querySelectorAll('.sector-tab[data-sector]').forEach(btn => {
  btn.addEventListener('click', () => showSector(btn.dataset.sector, btn));
});

/* ---- Contact form ---- */
function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const business = document.getElementById('business').value;
  const message = document.getElementById('message').value.trim();

  if (!name) { document.getElementById('name').focus(); return; }
  if (!email) { document.getElementById('email').focus(); return; }
  if (!business) { document.getElementById('business').focus(); return; }
  if (!message) { document.getElementById('message').focus(); return; }

  const text = [
    'Hola, me llamo ' + name + ' y quiero un diagnóstico gratuito para mi negocio.',
    'Sector: ' + business,
    phone ? 'Teléfono: ' + phone : '',
    'Email: ' + email,
    'Cuello de botella: ' + message
  ].filter(Boolean).join('\n');

  window.open('https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text), '_blank', 'noopener');

  document.getElementById('contactForm').style.display = 'none';
  document.getElementById('formSuccess').classList.add('show');
}

document.getElementById('contactForm').addEventListener('submit', handleSubmit);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Scroll-reveal (elementos individuales no gestionados por stagger) ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

/* ---- Stagger reveal para grupos de cards ---- */
const staggeredEls = new Set();

if (!prefersReduced) {
  const staggerGroups = [
    { parent: '.grid-3', cards: '.problem-card.reveal' },
    { parent: '.solution-list', cards: '.solution-item.reveal' },
    { parent: '.steps-grid', cards: '.step.reveal' },
  ];

  const staggerObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.reveal').forEach((card, i) => {
        card.style.transitionDelay = (i * 100) + 'ms';
        card.classList.add('visible');
      });
      staggerObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  staggerGroups.forEach(({ parent, cards }) => {
    const parentEl = document.querySelector(parent);
    if (!parentEl) return;
    parentEl.querySelectorAll(cards).forEach(el => staggeredEls.add(el));
    staggerObserver.observe(parentEl);
  });
}

document.querySelectorAll('.reveal').forEach(el => {
  if (prefersReduced) {
    el.classList.add('visible');
  } else if (!staggeredEls.has(el)) {
    revealObserver.observe(el);
  }
});

/* ---- Metric bars (scaleX — solo compositor, sin layout recalc) ---- */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.metric-bar').forEach((bar, i) => {
        const target = (bar.dataset.w || 0) / 100;
        if (prefersReduced) {
          bar.style.transform = 'scaleX(' + target + ')';
        } else {
          setTimeout(() => {
            bar.style.transform = 'scaleX(' + target + ')';
          }, 150 + i * 80);
        }
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const visual = document.querySelector('.solution-visual');
if (visual) barObserver.observe(visual);

/* ---- Hide/show header on scroll + reading progress ---- */
let lastY = 0;
const siteHeader = document.getElementById('site-header');
const progressBar = document.getElementById('readingProgress');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  siteHeader.style.transform = (y > lastY && y > 80) ? 'translateY(-100%)' : 'translateY(0)';
  lastY = y;
  if (progressBar) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? Math.min((y / docHeight) * 100, 100) : 0) + '%';
  }
}, { passive: true });

/* ---- FAQ accordion ---- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
