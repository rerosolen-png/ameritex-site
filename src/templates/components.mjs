/**
 * Componentes reutilizáveis (cabeçalho, rodapé, cards, grades de variantes,
 * tabelas de especificações, FAQ, CTAs, ícones).
 */

import { html, raw, slugify } from '../lib/html.mjs';

// ---------------------------------------------------------------- ícones (SVG inline, sem dependências)
export const icons = {
  whatsapp: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 1.67c4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24c-1.5 0-2.97-.41-4.25-1.18l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.35c0-4.54 3.7-8.24 8.3-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01"/></svg>',
  ),
  phone: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  ),
  mail: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  ),
  pin: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  ),
  download: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  ),
  arrow: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  ),
  check: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  ),
  menu: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  ),
  close: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  ),
  chevron: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  ),
  truck: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  ),
  globe: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  ),
  box: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>',
  ),
  award: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/></svg>',
  ),
  users: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  ),
  layers: raw(
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  ),
};

// ---------------------------------------------------------------- utilitários
export function waLink(ctx, message) {
  const text = encodeURIComponent(message || ctx.site.whatsapp.defaultMessage);
  return `https://wa.me/${ctx.site.whatsapp.digits}?text=${text}`;
}

export function img(ctx, rel, alt, opts = {}) {
  const meta = ctx.img(rel);
  const { loading = 'lazy', className = '', fetchpriority, sizes, decoding = 'async' } = opts;
  return html`<img src="${meta.src}" width="${meta.width}" height="${meta.height}" alt="${alt}" loading="${loading}" decoding="${decoding}"${className ? raw(` class="${className}"`) : ''}${fetchpriority ? raw(` fetchpriority="${fetchpriority}"`) : ''}${sizes ? raw(` sizes="${sizes}"`) : ''}>`;
}

export function formatAddress(a, { multiline = false } = {}) {
  const line1 = [a.street, a.district].filter(Boolean).join(' – ');
  const line2 = `${a.city} – ${a.state}${a.postalCode ? ` · CEP ${a.postalCode}` : ''}`;
  return multiline ? html`${line1}<br>${line2}` : `${line1}, ${line2}`;
}

export function mapsUrl(a) {
  const q = encodeURIComponent(`${a.street}, ${a.district ? `${a.district}, ` : ''}${a.city} - ${a.state}${a.postalCode ? `, ${a.postalCode}` : ''}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// ---------------------------------------------------------------- cabeçalho / rodapé
export function siteHeader(ctx, page) {
  const { site, produtos } = ctx;
  const isActive = (href) => (href === '/' ? page.url === '/' : page.url.startsWith(href));
  return html`<header class="site-header" id="topo">
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="${site.brand} – página inicial">
      ${img(ctx, site.logo.light, `${site.brand} – ${site.tagline}`, { loading: 'eager', className: 'brand__logo', fetchpriority: 'high' })}
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu-principal" data-nav-toggle>
      <span class="nav-toggle__open">${icons.menu}</span><span class="nav-toggle__close">${icons.close}</span>
      <span class="visually-hidden">Menu</span>
    </button>
    <nav class="site-nav" id="menu-principal" aria-label="Principal">
      <ul class="site-nav__list">
        ${site.nav.map((item) =>
          item.children
            ? html`<li class="site-nav__item has-submenu${isActive(item.href) ? ' is-active' : ''}">
          <a href="${item.href}"${isActive(item.href) ? raw(' aria-current="page"') : ''}>${item.label}</a>
          <button type="button" class="submenu-toggle" aria-expanded="false" aria-label="Abrir submenu de ${item.label}" data-submenu-toggle>${icons.chevron}</button>
          <ul class="submenu">
            ${produtos.map((c) => html`<li><a href="${c.url}">${c.shortName || c.name}</a></li>`)}
            <li class="submenu__all"><a href="/produtos/">Ver todos os produtos ${icons.arrow}</a></li>
          </ul>
        </li>`
            : html`<li class="site-nav__item${isActive(item.href) ? ' is-active' : ''}"><a href="${item.href}"${isActive(item.href) ? raw(' aria-current="page"') : ''}>${item.label}</a></li>`,
        )}
      </ul>
      <div class="site-nav__cta">
        <a class="btn btn--outline-light btn--sm" href="/catalogo/">${icons.download} Catálogo ${site.catalogYear}</a>
        <a class="btn btn--wa btn--sm" href="${waLink(ctx)}" target="_blank" rel="noopener">${icons.whatsapp} WhatsApp</a>
      </div>
    </nav>
  </div>
</header>`;
}

export function siteFooter(ctx) {
  const { site, produtos } = ctx;
  const year = ctx.buildDate.getFullYear();
  const shown = site.addresses.filter((a) => a.show);
  return html`<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      ${img(ctx, site.logo.light, `${site.brand}`, { className: 'site-footer__logo' })}
      <p>${site.tagline} desde ${site.foundedYear}. Atendimento a lojistas, distribuidores e fabricantes em todo o Brasil.</p>
      <a class="btn btn--wa" href="${waLink(ctx)}" target="_blank" rel="noopener">${icons.whatsapp} Falar no WhatsApp</a>
    </div>
    <nav aria-label="Produtos (rodapé)">
      <h2 class="site-footer__title">Produtos</h2>
      <ul class="site-footer__links">
        ${produtos.map((c) => html`<li><a href="${c.url}">${c.shortName || c.name}</a></li>`)}
      </ul>
    </nav>
    <nav aria-label="Institucional (rodapé)">
      <h2 class="site-footer__title">Institucional</h2>
      <ul class="site-footer__links">
        <li><a href="/sobre/">Sobre a ${site.brand}</a></li>
        <li><a href="/catalogo/">Catálogo ${site.catalogYear} (PDF)</a></li>
        <li><a href="/guias/">Guias e dicas</a></li>
        <li><a href="/contato/">Contato e orçamento</a></li>
        <li><a href="/politica-de-privacidade/">Política de privacidade</a></li>
      </ul>
    </nav>
    <div>
      <h2 class="site-footer__title">Contato</h2>
      <ul class="site-footer__contact">
        <li>${icons.whatsapp} <a href="${waLink(ctx)}" target="_blank" rel="noopener">${site.whatsapp.display}</a></li>
        <li>${icons.phone} <a href="tel:${site.phone.e164}">${site.phone.display}</a></li>
        <li>${icons.mail} <a href="mailto:${site.email}">${site.email}</a></li>
        ${shown.map((a) => html`<li>${icons.pin} <address><strong>${a.label}</strong><br>${formatAddress(a, { multiline: true })}</address></li>`)}
      </ul>
    </div>
  </div>
  <div class="site-footer__bottom">
    <div class="container">
      <p>© ${year} ${site.legalName} · CNPJ ${site.cnpj} · Todos os direitos reservados. AMERITEX® é marca registrada.</p>
    </div>
  </div>
</footer>`;
}

export function whatsappFloat(ctx) {
  return html`<a class="wa-float" href="${waLink(ctx)}" target="_blank" rel="noopener" aria-label="Conversar pelo WhatsApp">${icons.whatsapp}<span>Fale conosco</span></a>`;
}

export function lightbox() {
  return html`<dialog class="lightbox" data-lightbox aria-label="Imagem ampliada">
  <button type="button" class="lightbox__close" data-lightbox-close aria-label="Fechar">${icons.close}</button>
  <figure><img src="" alt="" width="1200" height="800" data-lightbox-img><figcaption data-lightbox-caption></figcaption></figure>
</dialog>`;
}

// ---------------------------------------------------------------- blocos de conteúdo
export function breadcrumbs(items) {
  return html`<nav class="breadcrumbs" aria-label="Você está em">
  <ol>
    ${items.map((it, i) =>
      i === items.length - 1
        ? html`<li aria-current="page">${it.name}</li>`
        : html`<li><a href="${it.url}">${it.name}</a></li>`,
    )}
  </ol>
</nav>`;
}

export function sectionHead({ eyebrow, title, text, level = 2, center = false }) {
  const tag = `h${level}`;
  return html`<div class="section-head${center ? ' section-head--center' : ''}">
  ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
  ${raw(`<${tag} class="section-head__title">`)}${title}${raw(`</${tag}>`)}
  ${text ? html`<p class="lead">${text}</p>` : ''}
</div>`;
}

export function categoryCard(ctx, cat, { headingLevel = 3 } = {}) {
  const tag = `h${headingLevel}`;
  const count = cat.variantCount;
  const meta = count > 1 ? `${count} ${cat.variantNoun || 'opções'}` : cat.lines.length > 1 ? `${cat.lines.length} linhas` : '';
  return html`<article class="card card--category">
  <a class="card__media" href="${cat.url}" tabindex="-1" aria-hidden="true">${img(ctx, cat.cardImage, '')}</a>
  <div class="card__body">
    ${raw(`<${tag} class="card__title">`)}<a href="${cat.url}">${cat.name}</a>${raw(`</${tag}>`)}
    <p>${cat.lead}</p>
    <div class="card__footer">
      ${meta ? html`<span class="card__meta">${meta}</span>` : ''}
      <span class="card__link">Ver produtos ${icons.arrow}</span>
    </div>
  </div>
</article>`;
}

export function guideCard(ctx, guia, { headingLevel = 3 } = {}) {
  const tag = `h${headingLevel}`;
  const date = new Date(`${guia.date}T12:00:00`);
  const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  return html`<article class="card card--guide">
  <a class="card__media" href="${guia.url}" tabindex="-1" aria-hidden="true">${img(ctx, guia.image, '')}</a>
  <div class="card__body">
    <p class="card__meta"><time datetime="${guia.date}">${dateLabel}</time> · ${guia.readingTime} min de leitura</p>
    ${raw(`<${tag} class="card__title">`)}<a href="${guia.url}">${guia.title}</a>${raw(`</${tag}>`)}
    <p>${guia.description}</p>
    <span class="card__link">Ler guia ${icons.arrow}</span>
  </div>
</article>`;
}

export function specsTable(specs, caption) {
  return html`<table class="specs">
  ${caption ? html`<caption>${caption}</caption>` : ''}
  <tbody>
    ${specs.map(([k, v]) => html`<tr><th scope="row">${k}</th><td>${v}</td></tr>`)}
  </tbody>
</table>`;
}

export function dataTable(table) {
  return html`<div class="table-wrap"><table class="data-table">
  ${table.caption ? html`<caption>${table.caption}</caption>` : ''}
  <thead><tr>${table.headers.map((h) => html`<th scope="col">${h}</th>`)}</tr></thead>
  <tbody>${table.rows.map((r) => html`<tr>${r.map((c, i) => (i === 0 ? html`<th scope="row">${c}</th>` : html`<td>${c}</td>`))}</tr>`)}</tbody>
</table></div>`;
}

/** Grade de variantes (estampas/cores) com filtro por grupo e lightbox. */
export function variantGrid(ctx, cat, line) {
  const variants = line.variants || [];
  if (!variants.length) return '';
  const groups = [...new Set(variants.map((v) => v.group).filter(Boolean))];
  const gridId = `variantes-${slugify(line.code)}`;
  const withImages = variants.some((v) => v.image);
  return html`<div class="variants" data-variants>
  ${groups.length > 1
    ? html`<div class="filter" role="group" aria-label="Filtrar ${line.variantLabel || 'variantes'}">
    <button type="button" class="chip is-active" data-filter="*" aria-pressed="true">Todas (${variants.length})</button>
    ${groups.map((g) => html`<button type="button" class="chip" data-filter="${slugify(g)}" aria-pressed="false">${g} (${variants.filter((v) => v.group === g).length})</button>`)}
  </div>`
    : ''}
  <ul class="${withImages ? 'swatches' : 'color-chips'}" id="${gridId}">
    ${variants.map((v) => {
      const altText = `${line.name} ${v.name} – código ${v.code}`;
      const groupAttr = v.group ? raw(` data-group="${slugify(v.group)}"`) : '';
      if (v.image) {
        const full = ctx.img(v.image);
        return html`<li class="swatch"${groupAttr}>
      <figure>
        <button type="button" class="swatch__btn" data-lightbox-src="${full.src}" data-lightbox-caption="${altText}" aria-label="Ampliar ${v.code}">
          ${img(ctx, v.image, altText, { className: 'swatch__img' })}
          ${v.backImage ? html`<span class="swatch__back">${img(ctx, v.backImage, `Verso xadrez – ${v.code}`)}</span>` : ''}
        </button>
        <figcaption><strong>${v.code}</strong><span>${v.name}</span></figcaption>
      </figure>
    </li>`;
      }
      return html`<li class="color-chip"${groupAttr}>
      ${v.color ? html`<span class="color-chip__dot" style="--c:${v.color}" aria-hidden="true"></span>` : ''}
      <strong>${v.code}</strong><span>${v.name}</span>
    </li>`;
    })}
  </ul>
</div>`;
}

export function faqList(faq, { headingLevel = 3 } = {}) {
  const tag = `h${headingLevel}`;
  return html`<div class="faq">
  ${faq.map((item) => html`<details class="faq__item">
    <summary>${raw(`<${tag}>`)}${item.q}${raw(`</${tag}>`)}${icons.chevron}</summary>
    <div class="faq__answer"><p>${item.a}</p></div>
  </details>`)}
</div>`;
}

export function faqLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function ctaBand(ctx, { title, text, message, secondary = true } = {}) {
  const { site } = ctx;
  return html`<section class="cta-band" aria-labelledby="cta-title">
  <div class="container cta-band__inner">
    <div>
      <h2 id="cta-title">${title || 'Solicite um orçamento para o seu negócio'}</h2>
      <p>${text || `Atendemos lojistas, distribuidores e fabricantes em todo o Brasil. Fale com um consultor da ${site.brand} e receba condições para pedidos no atacado.`}</p>
    </div>
    <div class="cta-band__actions">
      <a class="btn btn--wa btn--lg" href="${waLink(ctx, message)}" target="_blank" rel="noopener">${icons.whatsapp} Pedir orçamento no WhatsApp</a>
      ${secondary ? html`<a class="btn btn--outline-light btn--lg" href="/contato/">Outros canais de contato</a>` : ''}
    </div>
  </div>
</section>`;
}

export function highlightList(items) {
  return html`<ul class="highlights">${items.map((h) => html`<li>${icons.check}<span>${h}</span></li>`)}</ul>`;
}

export function featureGrid(features) {
  return html`<div class="features">
  ${features.map((f) => html`<div class="feature">
    <div class="feature__icon">${icons[f.icon] || icons.check}</div>
    <h3 class="feature__title">${f.title}</h3>
    <p>${f.text}</p>
  </div>`)}
</div>`;
}
