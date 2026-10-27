/**
 * Casca do documento: <head> com todas as meta tags de SEO, cabeçalho,
 * rodapé, botão flutuante do WhatsApp e dados estruturados (JSON-LD).
 */

import { html, raw, jsonForScript } from '../lib/html.mjs';
import { siteHeader, siteFooter, whatsappFloat, lightbox } from './components.mjs';

export function organizationLd(ctx) {
  const { site } = ctx;
  const primary = site.addresses.find((a) => a.primary) || site.addresses[0];
  const sameAs = Object.values(site.social || {}).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.siteUrl}/#organization`,
    name: site.brand,
    legalName: site.legalName,
    url: `${site.siteUrl}/`,
    logo: `${site.siteUrl}${ctx.img(site.logo.dark).src}`,
    image: `${site.siteUrl}${ctx.img(site.ogImage).src}`,
    description: site.description,
    foundingDate: String(site.foundedYear),
    taxID: site.cnpj,
    email: site.email,
    telephone: site.phone.e164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: primary.street,
      addressLocality: primary.city,
      addressRegion: primary.state,
      postalCode: primary.postalCode,
      addressCountry: 'BR',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: site.phone.e164,
        contactType: 'sales',
        areaServed: 'BR',
        availableLanguage: ['Portuguese'],
      },
      {
        '@type': 'ContactPoint',
        telephone: site.whatsapp.e164,
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: ['Portuguese'],
      },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function breadcrumbLd(ctx, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${ctx.site.siteUrl}${it.url}`,
    })),
  };
}

/**
 * @param {object} ctx  contexto do build
 * @param {object} page { url, title, description, ogImage?, ogType?, jsonLd?, noindex?, bodyClass?, active? }
 * @param {RawHtml} body conteúdo de <main>
 */
export function layout(ctx, page, body) {
  const { site, assets } = ctx;
  const canonical = `${site.siteUrl}${page.url}`;
  const og = ctx.img(page.ogImage || site.ogImage);
  const ogAbs = `${site.siteUrl}${og.src}`;
  const ld = [organizationLd(ctx), ...(page.jsonLd || [])];
  const fullTitle = page.title;

  const doc = html`<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${page.description}">
${page.noindex ? html`<meta name="robots" content="noindex,follow">` : html`<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">`}
<link rel="canonical" href="${canonical}">
<meta name="author" content="${site.brand}">
<meta name="theme-color" content="#2d2c4d">
<meta property="og:locale" content="pt_BR">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${site.brand}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogAbs}">
<meta property="og:image:width" content="${og.width}">
<meta property="og:image:height" content="${og.height}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${ogAbs}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="${assets.css}">
${ld.map((obj) => html`<script type="application/ld+json">${jsonForScript(obj)}</script>`)}
</head>
<body class="${page.bodyClass || ''}">
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
${siteHeader(ctx, page)}
<main id="conteudo">
${body}
</main>
${siteFooter(ctx)}
${whatsappFloat(ctx)}
${lightbox()}
<script src="${assets.js}" defer></script>
</body>
</html>
`;
  return `<!doctype html>\n${String(doc)}`;
}
