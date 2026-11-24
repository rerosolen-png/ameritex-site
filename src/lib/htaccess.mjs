/**
 * Gera o .htaccess para hospedagens Apache (HostGator / cPanel).
 *
 * O arquivo é escrito pelo build em dist/.htaccess e enviado junto com o site.
 * Não edite a cópia que está no servidor: ela é substituída a cada deploy.
 * Para mudar redirecionamentos, edite src/data/redirects.json.
 *
 * Todas as regras de host são restritas ao domínio do site, para não afetar
 * outros domínios (addon domains) que morem em subpastas da mesma conta.
 */

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "/sobre-nos/" → "^sobre-nos/?$" (padrão de RewriteRule em contexto de diretório, sem a barra inicial) */
const exactPattern = (from) => `^${escapeRe(from.replace(/^\//, '').replace(/\/$/, ''))}/?$`;
const prefixPattern = (from) => `^${escapeRe(from.replace(/^\//, ''))}`;

export function renderHtaccess({ siteUrl, redirects = {}, prefixes = {} }) {
  const { protocol, host } = new URL(siteUrl);
  const origin = `${protocol}//${host}`;
  const hostRe = escapeRe(host);
  const https = protocol === 'https:';

  // cada regra vale só para o domínio do site (com ou sem www)
  const hostCond = `  RewriteCond %{HTTP_HOST} ^(www\\.)?${hostRe}$ [NC]`;
  const redirectRules = [
    ...Object.entries(redirects).map(([from, to]) => `${hostCond}\n  RewriteRule ${exactPattern(from)} ${origin}${to} [R=301,L,QSD]`),
    ...Object.entries(prefixes).map(([from, to]) => `${hostCond}\n  RewriteRule ${prefixPattern(from)} ${origin}${to} [R=301,L,QSD]`),
  ];

  const httpsRule = https
    ? `
  # HTTP → HTTPS (apenas para este domínio; não entra em loop atrás de proxy)
  RewriteCond %{REQUEST_URI} !^/\\.well-known/
  RewriteCond %{HTTP_HOST} ^${hostRe}$ [NC]
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^ ${origin}%{REQUEST_URI} [R=301,L]
`
    : '';

  return `# =====================================================================
# ${host} – gerado automaticamente por scripts/build.mjs
# NÃO EDITE NO SERVIDOR: este arquivo é substituído a cada deploy.
# Redirecionamentos: src/data/redirects.json · Regras: src/lib/htaccess.mjs
# =====================================================================

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset UTF-8
AddType application/manifest+json .webmanifest

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Bloqueia arquivos ocultos (.build-meta.json, estado do deploy etc.), exceto /.well-known/ (SSL)
  RewriteRule (^|/)\\.(?!well-known/) - [F]

  # URLs do site antigo (WordPress) → páginas novas, com 301 definitivo
${redirectRules.join('\n')}

  # www → domínio sem www
  RewriteCond %{REQUEST_URI} !^/\\.well-known/
  RewriteCond %{HTTP_HOST} ^www\\.${hostRe}$ [NC]
  RewriteRule ^ ${origin}%{REQUEST_URI} [R=301,L]
${httpsRule}</IfModule>

# Cache: HTML sempre revalidado; CSS/JS têm hash no nome e podem ficar 1 ano
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/x-icon "access plus 30 days"
  ExpiresByType application/pdf "access plus 1 day"
  ExpiresByType application/xml "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.[0-9a-f]{8}\\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
</IfModule>

# Compressão de texto
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/javascript application/javascript application/json application/xml application/manifest+json image/svg+xml
</IfModule>
`;
}
