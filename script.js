/* ============================================
   MESTRE SINUQUEIRO — Quiz Engine
   Copy baseada no estudo de ICP
   Falar ao ID → Convencer o Ego → Neutralizar o Superego
   ============================================ */

(function () {
  'use strict';

  // ---- Facebook Pixel helper ----
  function track(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, params || {});
    }
  }
  function trackStandard(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('track', eventName, params || {});
    }
  }

  // ---- State ----
  let currentScreen = 0;
  const totalSteps = 8;

  // ---- DOM ----
  const landingPage = document.getElementById('landing-page');
  const startBtn = document.getElementById('btn-start'); // This might be removed soon if not needed

  // ---- Sales Notifications — nomes e cidades do ICP ----
  const salesData = [
    { name: 'Carlos', city: 'Campinas, SP' },
    { name: 'Marcelo', city: 'Uberlândia, MG' },
    { name: 'José Roberto', city: 'Goiânia, GO' },
    { name: 'Anderson', city: 'Campo Grande, MS' },
    { name: 'Reginaldo', city: 'Londrina, PR' },
    { name: 'Cláudio', city: 'Ribeirão Preto, SP' },
    { name: 'Edson', city: 'Juiz de Fora, MG' },
    { name: 'Wagner', city: 'Curitiba, PR' },
    { name: 'Ademir', city: 'Bauru, SP' },
    { name: 'Ronaldo', city: 'Aparecida de Goiânia, GO' },
    { name: 'Sérgio', city: 'Sorocaba, SP' },
    { name: 'Marcos', city: 'Contagem, MG' },
    { name: 'Gilberto', city: 'São José do Rio Preto, SP' },
    { name: 'Valdir', city: 'Dourados, MS' },
    { name: 'Luiz', city: 'Maringá, PR' },
    { name: 'Roberto', city: 'Uberaba, MG' },
  ];

  const notifEl = document.getElementById('sales-notification');
  const notifAvatar = notifEl.querySelector('.notif-avatar');
  const notifStrong = notifEl.querySelector('.notif-text strong');
  const notifTime = notifEl.querySelector('.notif-time');

  let notifTimer;
  function showSalesNotification() {
    const person = salesData[Math.floor(Math.random() * salesData.length)];
    const minutes = Math.floor(Math.random() * 15) + 1;
    notifAvatar.textContent = person.name.charAt(0);
    notifStrong.textContent = person.name + ' — ' + person.city;
    notifTime.textContent = 'há ' + minutes + ' min';
    notifEl.classList.add('show');
    setTimeout(() => notifEl.classList.remove('show'), 4000);
    const delay = (Math.floor(Math.random() * 8) + 8) * 1000;
    notifTimer = setTimeout(showSalesNotification, delay);
  }

  // ---- Global Event Delegation for Clicks ----
  document.addEventListener('click', (e) => {
    const target = e.target;

    // 1. CTA tracking
    const cta = target.closest('#btn-cta, #btn-anchor-vsl, #btn-back-discount');
    if (cta) {
      const isDiscount = cta.id === 'btn-back-discount';
      trackStandard(isDiscount ? 'DiscountCheckoutClick' : 'InitiateCheckout', {
        value: isDiscount ? 23.50 : 47,
        currency: 'BRL'
      });
    }

    // 2. FAQ accordion
    const faqBtn = target.closest('.faq-question');
    if (faqBtn) {
      const item = faqBtn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    }

    // 3. Smooth scroll for internal links (prevents hash changes in history)
    const scrollTarget = target.closest('a[href^="#"], [data-scroll]');
    if (scrollTarget) {
      const targetSelector = scrollTarget.getAttribute('data-scroll') || scrollTarget.getAttribute('href');
      if (targetSelector && targetSelector.startsWith('#') && targetSelector !== '#') {
        e.preventDefault();
        const targetEl = document.querySelector(targetSelector);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  // ---- Backredirect & Discount Popup ----
  function initBackredirect() {
    if (window.backredirectInitialized) return;
    window.backredirectInitialized = true;

    const popup = document.getElementById('back-popup');
    const closeBtn = document.getElementById('back-popup-close');
    const timerEl = document.getElementById('back-timer');
    let popupShown = false;

    // State-based history management (delay to ensure stability)
    setTimeout(() => {
      // Only push if not already in state
      if (!history.state || !history.state.isHome) {
        history.pushState({ isBack: true }, null, location.href);
        history.pushState({ isHome: true }, null, location.href);
      }
    }, 100);

    const showPopup = () => {
      if (popupShown) return;
      popup.classList.add('active');
      popupShown = true;
      startPopupTimer(600, timerEl); // 10 minutes
      track('ExitIntent_Popup_Shown');
    };

    // Capture back button with state check
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.isBack) {
        showPopup();
        // Push them forward again so the next 'back' still works
        history.pushState({ isHome: true }, null, location.href);
      }
    });

    // Exit intent (desktop)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0) showPopup();
    });

    closeBtn.addEventListener('click', () => {
      popup.classList.remove('active');
    });

    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.classList.remove('active');
    });
  }

  function startPopupTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      display.textContent = minutes + ':' + seconds;

      if (--timer < 0) {
        clearInterval(interval);
        display.textContent = '00:00';
      }
    }, 1000);
  }

  // ---- Anti-Cloning & Content Protection (Ads Hardening) ----
  function initAntiCloning() {
    // 1. Silent Mouse Block (Right-click & Select)
    document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
    document.addEventListener('selectstart', (e) => e.preventDefault(), false);

    // 2. Keyboard Shield (F12, Ctrl+U, Ctrl+Shift+I, Ctrl+S, Ctrl+C)
    document.addEventListener('keydown', (e) => {
      // Allow standard navigation (F5, etc.) but block developer/save shortcuts
      const isDevTools = (e.keyCode === 123) || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67));
      const isViewSource = (e.ctrlKey && e.keyCode === 85);
      const isSavePage = (e.ctrlKey && e.keyCode === 83);
      const isCopy = (e.ctrlKey && e.keyCode === 67);

      if (isDevTools || isViewSource || isSavePage || isCopy) {
        e.preventDefault();
        return false;
      }
    }, false);

    // 3. Simple Bot/Cloner Deterrence (navigator.webdriver check)
    // Most cloners/scrapers use headless browsers.
    if (navigator.webdriver) {
      document.body.style.display = 'none'; // Silent hide for automated environments
    }

    // 4. Console "Debugger" Trap (Subtle interdiction)
    // Only triggers if someone manually opens DevTools.
    // We use a self-invoking function to keep it silent.
    (function () {
      try {
        (function block() {
          if (
            window.outerHeight - window.innerHeight > 160 ||
            window.outerWidth - window.innerWidth > 160
          ) {
            // Optional: You could log something here, but user asked for silent.
            // A simple debugger statement is the most effective "fence".
            // debugger;
          }
          setTimeout(block, 1000);
        })();
      } catch (e) {}
    })();
  }

  // ---- Init ----
  function init() {
    // 1. Initialize global features
    initAntiCloning();
    initBackredirect();
    
    // 2. Initial Tracking (Direct Access)
    trackStandard('Lead');
    track('LandingPage_DirectAccess');

    // 3. Start sales notifications with delay
    setTimeout(showSalesNotification, 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
