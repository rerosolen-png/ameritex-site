/* Ameritex – medição e marketing com consentimento (LGPD).
 *
 * Este arquivo só entra nas páginas quando há algum ID configurado no bloco
 * "tracking" de src/data/site.json. Nenhum script de terceiros é carregado e
 * nenhum cookie de medição é gravado antes de o visitante autorizar.
 *
 * Ferramentas: Google Analytics 4 e Google Ads (gtag.js com Consent Mode v2) e Meta Pixel.
 * Lista de eventos e como testar: docs/MARKETING.md.
 */
(function () {
  'use strict';

  var el = document.currentScript;
  if (!el) return;
  var data = el.dataset;
  var cfg = {
    ga4: data.ga4 || '',
    ads: data.ads || '',
    pixel: data.pixel || '',
    conv: {
      whatsapp: data.convWhatsapp || '',
      lead: data.convLead || '',
      phone: data.convPhone || '',
      catalog: data.convCatalog || ''
    }
  };
  var hasAnalytics = !!cfg.ga4;
  var hasMarketing = !!(cfg.ads || cfg.pixel);
  if (!hasAnalytics && !hasMarketing) return;

  // ---------------------------------------------------------------- consentimento salvo
  var KEY = 'ameritex-consent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000; // pergunta de novo depois de 12 meses

  function readConsent() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved || saved.v !== VERSION || !saved.ts || Date.now() - saved.ts > MAX_AGE) return null;
      return { analytics: !!saved.analytics, marketing: !!saved.marketing };
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, analytics: consent.analytics, marketing: consent.marketing, ts: Date.now() }));
    } catch (e) {
      /* navegação privada ou armazenamento bloqueado: a escolha vale só para esta página */
    }
  }

  // Remove os cookies próprios de medição quando o visitante revoga o consentimento.
  function clearCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.split('.').slice(-3).join('.'), '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl_|_fbp|_fbc)/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (domain ? '; domain=' + domain : '');
      });
    });
  }

  // ---------------------------------------------------------------- Google: gtag.js + Consent Mode v2
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  // Padrão: tudo negado até o visitante decidir.
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  var gtagLoaded = false;
  var configured = {};

  function loadGtag(state) {
    var useGa = state.analytics && cfg.ga4;
    var useAds = state.marketing && cfg.ads;
    if (!useGa && !useAds) return;
    if (!gtagLoaded) {
      gtagLoaded = true;
      gtag('js', new Date());
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(useGa ? cfg.ga4 : cfg.ads);
      document.head.appendChild(s);
    }
    if (useGa && !configured.ga4) {
      configured.ga4 = true;
      gtag('config', cfg.ga4);
    }
    if (useAds && !configured.ads) {
      configured.ads = true;
      gtag('config', cfg.ads);
    }
  }

  // ---------------------------------------------------------------- Meta Pixel
  var pixelLoaded = false;

  function loadPixel() {
    if (pixelLoaded || !cfg.pixel) return;
    pixelLoaded = true;
    var n = (window.fbq = function () {
      if (n.callMethod) n.callMethod.apply(n, arguments);
      else n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);

    window.fbq('init', cfg.pixel);
    window.fbq('track', 'PageView');
    if (/^\/produtos\/[^/]+\/$/.test(location.pathname)) {
      var h1 = document.querySelector('h1');
      window.fbq('track', 'ViewContent', { content_name: h1 ? h1.textContent.trim() : document.title, content_category: 'Produtos' });
    }
  }

  // ---------------------------------------------------------------- aplicar a escolha
  var state = { analytics: false, marketing: false };

  function apply(consent) {
    state = { analytics: !!consent.analytics && hasAnalytics, marketing: !!consent.marketing && hasMarketing };
    gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied'
    });
    loadGtag(state);
    if (state.marketing) loadPixel();
  }

  // ---------------------------------------------------------------- eventos
  function ga(name, params) {
    if (!state.analytics || !cfg.ga4) return;
    var payload = { send_to: cfg.ga4 };
    for (var k in params || {}) if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
    gtag('event', name, payload);
  }

  function adsConversion(key) {
    if (!state.marketing || !cfg.ads || !cfg.conv[key]) return;
    gtag('event', 'conversion', { send_to: cfg.conv[key] });
  }

  function meta(name, params, custom) {
    if (!state.marketing || !cfg.pixel || !window.fbq) return;
    window.fbq(custom ? 'trackCustom' : 'track', name, params || {});
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var where = location.pathname;
      if (/^https:\/\/wa\.me\//.test(href)) {
        ga('whatsapp_click', { link_location: where });
        meta('Contact', { method: 'whatsapp' });
        adsConversion('whatsapp');
      } else if (/^tel:/.test(href)) {
        ga('phone_click', { link_location: where });
        meta('Contact', { method: 'phone' });
        adsConversion('phone');
      } else if (/^mailto:/.test(href)) {
        ga('email_click', { link_location: where });
        meta('Contact', { method: 'email' });
      } else if (/\.pdf($|[?#])/i.test(href)) {
        ga('catalog_download', { file_name: href.split('/').pop(), link_location: where });
        meta('CatalogDownload', { file_name: href.split('/').pop() }, true);
        adsConversion('catalog');
      }
    },
    true
  );

  // Formulário de orçamento (disparado por main.js depois de validar os campos). Nenhum dado pessoal é enviado.
  document.addEventListener('ameritex:lead', function (e) {
    var detail = (e && e.detail) || {};
    ga('generate_lead', { method: 'whatsapp_form', product: detail.produto || '', business_type: detail.tipo || '' });
    meta('Lead', { content_name: detail.produto || '' });
    adsConversion('lead');
  });

  // ---------------------------------------------------------------- aviso de cookies
  var banner = document.querySelector('[data-consent]');
  var options = banner ? banner.querySelector('[data-consent-options]') : null;
  var boxAnalytics = banner ? banner.querySelector('[data-consent-analytics]') : null;
  var boxMarketing = banner ? banner.querySelector('[data-consent-marketing]') : null;
  var btnCustomize = banner ? banner.querySelector('[data-consent-customize]') : null;
  var btnSave = banner ? banner.querySelector('[data-consent-save]') : null;

  function showOptions(show) {
    if (!options) return;
    options.hidden = !show;
    if (btnSave) btnSave.hidden = !show;
    if (btnCustomize) {
      btnCustomize.hidden = show;
      btnCustomize.setAttribute('aria-expanded', String(show));
    }
  }

  function openBanner(current, withOptions) {
    if (!banner) return;
    if (boxAnalytics) boxAnalytics.checked = !!(current && current.analytics);
    if (boxMarketing) boxMarketing.checked = !!(current && current.marketing);
    showOptions(!!withOptions);
    banner.hidden = false;
  }

  function decide(consent) {
    var previous = readConsent();
    saveConsent(consent);
    if (banner) banner.hidden = true;
    var revoked = previous && ((previous.analytics && !consent.analytics) || (previous.marketing && !consent.marketing));
    if (revoked) {
      // scripts já carregados não podem ser descarregados: limpa os cookies e recarrega sem eles
      clearCookies();
      location.reload();
      return;
    }
    apply(consent);
  }

  if (banner) {
    banner.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!t) return;
      if (t.hasAttribute('data-consent-accept')) decide({ analytics: true, marketing: true });
      else if (t.hasAttribute('data-consent-reject')) decide({ analytics: false, marketing: false });
      else if (t.hasAttribute('data-consent-customize')) showOptions(true);
      else if (t.hasAttribute('data-consent-save')) decide({ analytics: !!(boxAnalytics && boxAnalytics.checked), marketing: !!(boxMarketing && boxMarketing.checked) });
    });
  }

  // "Preferências de cookies" no rodapé reabre o aviso com a escolha atual
  document.addEventListener('click', function (e) {
    var opener = e.target && e.target.closest ? e.target.closest('[data-consent-open]') : null;
    if (!opener) return;
    e.preventDefault();
    openBanner(readConsent(), true);
  });

  var saved = readConsent();
  if (saved) apply(saved);
  else openBanner(null, false);
})();
