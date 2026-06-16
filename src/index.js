const body = document.body;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
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

navLinks.forEach((link) => {
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
  navLinks.forEach((link) => {
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
      threshold: [0, 0.12, 0.28],
    },
  );

  sections.forEach((section) => observer.observe(section));
} else {
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

const whatsappPhone = '77020897021';
const whatsappMessage = 'Сәлеметсіз бе! НДС және ОУР онлайн курсы туралы ақпарат алғым келеді.';
const whatsappText = encodeURIComponent(whatsappMessage);
const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${whatsappText}`;
const whatsappAppUrl = `whatsapp://send?phone=${whatsappPhone}&text=${whatsappText}`;
const whatsappIntentUrl = `intent://send?phone=${whatsappPhone}&text=${whatsappText}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(whatsappWebUrl)};end`;
const isAndroidDevice = /Android/i.test(navigator.userAgent);
const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
  link.setAttribute('href', whatsappWebUrl);
  link.setAttribute('rel', 'noopener');

  if (!isMobileDevice) {
    link.setAttribute('target', '_blank');
    return;
  }

  link.removeAttribute('target');

  link.addEventListener('click', (event) => {
    event.preventDefault();

    let leftPage = false;
    let fallbackTimer;

    const cleanup = () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('pagehide', markLeftPage);
      window.removeEventListener('blur', markLeftPage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    const openFallback = () => {
      cleanup();
      if (!leftPage && document.visibilityState === 'visible') {
        window.location.href = whatsappWebUrl;
      }
    };

    function markLeftPage() {
      leftPage = true;
      cleanup();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        markLeftPage();
      }
    }

    window.addEventListener('pagehide', markLeftPage, { once: true });
    window.addEventListener('blur', markLeftPage, { once: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    fallbackTimer = window.setTimeout(openFallback, 1200);
    window.location.href = isAndroidDevice ? whatsappIntentUrl : whatsappAppUrl;
  });
});
