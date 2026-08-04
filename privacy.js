(() => {
  const GA_ID = 'G-BPQHE2VG5X';
  const STORAGE_KEY = 'pedrosillo_cookie_consent';
  let analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }

  function showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = false;
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = true;
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
    hideBanner();
    if (value === 'accepted') loadAnalytics();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'accepted') {
      loadAnalytics();
    } else if (saved !== 'rejected') {
      showBanner();
    }

    document.getElementById('accept-cookies')?.addEventListener('click', () => setConsent('accepted'));
    document.getElementById('reject-cookies')?.addEventListener('click', () => setConsent('rejected'));
    document.getElementById('manage-cookies')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      showBanner();
    });
  });
})();
