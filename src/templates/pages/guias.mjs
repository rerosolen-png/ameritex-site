import { html, raw } from '../../lib/html.mjs';
import { layout, breadcrumbLd } from '../layout.mjs';
import { img, icons, waLink, breadcrumbs, guideCard, categoryCard, sectionHead, ctaBand } from '../components.mjs';

export function renderGuiasIndex(ctx) {
  const { guias } = ctx;
  const url = '/guias/';
  const title = 'Guias e dicas sobre PVC, toalhas, passadeiras e revestimentos';
  const description = 'Guias práticos da Ameritex para lojistas: como escolher passadeira de PVC, toalha plástica, plástico cristal, carpete para eventos e revestimentos adesivos.';
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Guias', url },
  ];
  const body = html`
<section class="page-head">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <h1>Guias e dicas</h1>
    <p class="lead">Explicações diretas, escritas por quem importa e distribui esses produtos há décadas. Use os guias para orientar seus clientes, treinar a equipe de vendas e escolher o mix certo para a sua região.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="grid grid--3">
      ${guias.map((g) => guideCard(ctx, g, { headingLevel: 2 }))}
    </div>
  </div>
</section>
${ctaBand(ctx, {})}
`;
  const jsonLd = [
    breadcrumbLd(ctx, crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      url: `${ctx.site.siteUrl}${url}`,
      inLanguage: 'pt-BR',
    },
  ];
  return { url, html: layout(ctx, { url, title, description, jsonLd, bodyClass: 'page-guias' }, body) };
}

export function renderGuia(ctx, guia) {
  const { site, produtos, guias } = ctx;
  const url = guia.url;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Guias', url: '/guias/' },
    { name: guia.title, url },
  ];
  const related = guia.category ? produtos.find((p) => p.slug === guia.category) : null;
  const others = guias.filter((g) => g.slug !== guia.slug).slice(0, 3);
  const date = new Date(`${guia.date}T12:00:00`);
  const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const body = html`
<article class="article">
  <header class="page-head page-head--article">
    <div class="container container--narrow">
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">Guia ${related ? html`· <a href="${related.url}">${related.shortName || related.name}</a>` : ''}</p>
      <h1>${guia.title}</h1>
      <p class="lead">${guia.description}</p>
      <p class="article__meta">Publicado em <time datetime="${guia.date}">${dateLabel}</time> · ${guia.readingTime} min de leitura · Equipe ${site.brand}</p>
    </div>
  </header>
  <div class="container container--narrow">
    <figure class="article__hero">${img(ctx, guia.image, guia.imageAlt, { loading: 'eager', fetchpriority: 'high' })}</figure>
    ${guia.headings.filter((h) => h.level === 2).length > 2
      ? html`<nav class="toc toc--inline" aria-label="Neste guia"><h2 class="toc__title">Neste guia</h2><ol>${guia.headings.filter((h) => h.level === 2).map((h) => html`<li><a href="#${h.id}">${h.text}</a></li>`)}</ol></nav>`
      : ''}
    <div class="prose article__body">${raw(guia.bodyHtml)}</div>
    ${related
      ? html`<aside class="article__related" aria-labelledby="related-product">
      <h2 id="related-product">Produto relacionado</h2>
      <div class="grid grid--1">${categoryCard(ctx, related)}</div>
    </aside>`
      : ''}
  </div>
</article>
${others.length
  ? html`<section class="section section--alt" aria-labelledby="more-guides">
  <div class="container">
    ${sectionHead({ eyebrow: 'Continue lendo', title: 'Outros guias' })}
    <div class="grid grid--3">${others.map((g) => guideCard(ctx, g))}</div>
  </div>
</section>`
  : ''}
${ctaBand(ctx, {})}
`;

  const jsonLd = [
    breadcrumbLd(ctx, crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guia.title,
      description: guia.description,
      image: `${site.siteUrl}${ctx.img(guia.image).src}`,
      datePublished: guia.date,
      dateModified: guia.updated || guia.date,
      inLanguage: 'pt-BR',
      author: { '@type': 'Organization', name: site.brand, '@id': `${site.siteUrl}/#organization` },
      publisher: { '@id': `${site.siteUrl}/#organization` },
      mainEntityOfPage: `${site.siteUrl}${url}`,
      ...(related ? { about: { '@type': 'Thing', name: related.name, url: `${site.siteUrl}${related.url}` } } : {}),
    },
  ];

  return {
    url,
    lastmod: guia.updated || guia.date,
    html: layout(ctx, { url, title: guia.title, description: guia.description, ogImage: guia.image, ogType: 'article', jsonLd, bodyClass: 'page-guia' }, body),
  };
}
