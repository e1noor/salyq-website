const body = document.body;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const menuLinks = Array.from(document.querySelectorAll('[data-nav-menu] a'));
const anchorLinks = Array.from(document.querySelectorAll('[data-nav-menu] a[href^="#"]'));
const sections = anchorLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const speakerPhoto = document.querySelector('[data-speaker-photo]');
const photoCard = document.querySelector('[data-photo-card]');

const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.classList.remove('is-active');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Мәзірді ашу');
  navMenu.classList.remove('is-open');
  body.classList.remove('nav-open');
};

const openMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.classList.add('is-active');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Мәзірді жабу');
  navMenu.classList.add('is-open');
  body.classList.add('nav-open');
};

navToggle?.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

menuLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const updateHeaderShadow = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 8);
};

updateHeaderShadow();
window.addEventListener('scroll', updateHeaderShadow, { passive: true });

const setActiveLink = (id) => {
  anchorLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
};

if ('IntersectionObserver' in window && sections.length > 0) {
  const visibleSections = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target.id, entry.boundingClientRect.top);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      if (visibleSections.size === 0) return;

      const activeId = Array.from(visibleSections.entries())
        .sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))[0][0];

      setActiveLink(activeId);
    },
    {
      rootMargin: '-18% 0px -64% 0px',
      threshold: [0, 0.15, 0.35],
    },
  );

  sections.forEach((section) => observer.observe(section));
} else if (sections.length > 0) {
  const updateActiveByScroll = () => {
    const activationPoint = window.scrollY + window.innerHeight * 0.32;
    let activeId = sections[0]?.id;

    sections.forEach((section) => {
      if (section.offsetTop <= activationPoint) activeId = section.id;
    });

    if (activeId) setActiveLink(activeId);
  };

  updateActiveByScroll();
  window.addEventListener('scroll', updateActiveByScroll, { passive: true });
}

if (speakerPhoto && photoCard) {
  const markMissing = () => {
    photoCard.classList.add('is-missing');
  };

  if (speakerPhoto.complete && speakerPhoto.naturalWidth === 0) {
    markMissing();
  }

  speakerPhoto.addEventListener('error', markMissing, { once: true });
}
