const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Navbar scroll effect + back-to-top + progress bar =====
const nav = document.getElementById('nav');
const backToTop = document.getElementById('backToTop');
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.classList.toggle('show', window.scrollY > 600);

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = progress + '%';
}, { passive: true });

// Assigned by the smooth-scroll glide (bottom of file) when it's active,
// so programmatic scrolls don't fight the glide's rAF loop.
let glideTo = null;

backToTop.addEventListener('click', () => {
  if (glideTo) glideTo(0);
  else window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Cursor spotlight (mouse only) =====
const spotlight = document.getElementById('spotlight');
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', e => {
    spotlight.style.setProperty('--mx', e.clientX + 'px');
    spotlight.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
} else {
  spotlight.remove();
}

// ===== Typewriter effect =====
const typedEl = document.getElementById('typed');
const phrases = [
  'scalable REST APIs.',
  'multi-tenant SaaS platforms.',
  'AI-powered ad platforms.',
  'data-driven dashboards.',
  'cloud-native backends.',
  'things with Python & Django.'
];

if (prefersReducedMotion) {
  typedEl.textContent = phrases[phrases.length - 1];
} else {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      typedEl.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, 1500);
        return;
      }
      setTimeout(typeLoop, 32 + Math.random() * 24);
    } else {
      charIndex--;
      typedEl.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
      setTimeout(typeLoop, 16);
    }
  }
  setTimeout(typeLoop, 300);
}

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close menu when tapping outside of it
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

// ===== Scroll reveal =====
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Animated stat counters =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = Math.round(eased * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (prefersReducedMotion) {
          entry.target.textContent = entry.target.dataset.target + (entry.target.dataset.suffix || '');
        } else {
          animateCounter(entry.target);
        }
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

// ===== 3D tilt on cards (mouse only) =====
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      card.style.transition = 'transform 0.1s ease-out, border-color 0.25s ease, box-shadow 0.25s ease';
    });
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transition = 'transform 0.45s ease, border-color 0.25s ease, box-shadow 0.25s ease';
      card.style.transform = '';
    });
  });
}

// ===== Active nav link highlighting =====
const sections = document.querySelectorAll('section[id]');
const menuLinks = navLinks.querySelectorAll('a[href^="#"]');

const activeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        menuLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(section => activeObserver.observe(section));

// ===== Buttery smooth wheel scrolling (desktop only) =====
// Lerps the scroll position toward the wheel target each frame for an
// inertia-like glide. Touch, keyboard and anchor clicks stay native.
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let target = window.scrollY;
  let current = window.scrollY;
  let rafId = null;

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;

  function glide() {
    current += (target - current) * 0.09;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      rafId = null;
    } else {
      rafId = requestAnimationFrame(glide);
    }
    window.scrollTo({ top: current, behavior: 'instant' });
  }

  window.addEventListener('wheel', e => {
    if (e.ctrlKey) return; // pinch-zoom
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal scroll (e.g. code blocks)
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    target = Math.max(0, Math.min(target + delta, maxScroll()));
    if (!rafId) rafId = requestAnimationFrame(glide);
  }, { passive: false });

  // Stay in sync when scrolling happens outside the glide
  // (keyboard, scrollbar drag)
  window.addEventListener('scroll', () => {
    if (!rafId) {
      target = window.scrollY;
      current = window.scrollY;
    }
  }, { passive: true });

  // Programmatic scrolls go through the glide instead of fighting it
  glideTo = y => {
    current = window.scrollY;
    target = Math.max(0, Math.min(y, maxScroll()));
    if (!rafId) rafId = requestAnimationFrame(glide);
  };

  // Anchor links glide too (native smooth scroll would clash with the rAF loop)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      const el = hash.length > 1 && document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      glideTo(el.getBoundingClientRect().top + window.scrollY - (nav.offsetHeight + 16));
      history.pushState(null, '', hash);
    });
  });
}

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
