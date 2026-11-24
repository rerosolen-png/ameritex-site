# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado

- Medição com consentimento (LGPD): aviso de cookies com escolha por categoria e `src/scripts/tracking.js`, que carrega Google Analytics 4, Google Ads (Consent Mode v2) e Meta Pixel só depois da autorização. IDs nos blocos `tracking` e `verification` de `site.json`, com validação de formato no build.
- Eventos de conversão: clique no WhatsApp, telefone e e-mail, envio do formulário de orçamento, download do catálogo e visualização de produto.
- Política de privacidade passa a listar automaticamente as ferramentas de medição ligadas; link "Preferências de cookies" no rodapé.
- Meta tags de verificação de propriedade (Google, Bing e Meta) e guia `docs/MARKETING.md`.
- Deploy de produção para a HostGator por FTPS (`.github/workflows/deploy-hostgator.yml`), com simulação (dry run), conferência de configuração e teste pós-deploy. Ativado pela variável `HOSTGATOR_DEPLOY`.
- `.htaccess` gerado pelo build (`src/lib/htaccess.mjs`): HTTPS, www → sem www, redirecionamentos 301 das URLs antigas, página 404, cache, compressão e bloqueio de arquivos ocultos.
- Redirecionamentos por prefixo (`_prefixos` em `redirects.json`) para `/produto/…`, `/categoria-produto/…` e `/produto-tag/…`, além das páginas do WooCommerce (`/loja/`, `/carrinho/`, `/finalizar-compra/`, `/minha-conta/`).
- Validação dos destinos do `.htaccess` em `scripts/check.mjs`.

### Alterado

- A prévia no GitHub Pages passa a ser marcada como `noindex` quando o endereço difere do de produção, para não concorrer com `ameritex.com.br` nos buscadores.
- `docs/DEPLOY.md` reescrito: produção na HostGator, prévia no GitHub Pages, backup do WordPress e como voltar atrás.

## [1.0.0] – 2026-10-27

### Adicionado

- Site estático completo gerado por build em Node.js sem dependências (`scripts/build.mjs`).
- Página inicial com linhas de produto, diferenciais, público-alvo, passo a passo de compra, guias e FAQ.
- Nove páginas de produto com dados do Catálogo 2026: passadeiras de PVC (45 cm e 65 cm), toalhas de mesa com forro, toalhas dupla face, plástico cristal, carpete para eventos, forro para gavetas e armários, grama artificial, papel de parede de PVC e placa adesiva de PVC — 140 variantes com código, nome, grupo e imagem.
- Cinco guias (artigos) para SEO e apoio à venda.
- Páginas Sobre, Contato (formulário que abre o WhatsApp formatado), Catálogo PDF, Política de privacidade (LGPD) e 404.
- SEO: títulos e descrições únicos, canonical, Open Graph/Twitter, JSON-LD (Organization, WebSite, BreadcrumbList, Product, FAQPage, Article, LocalBusiness, ContactPage, AboutPage, DigitalDocument), sitemap.xml, robots.txt, manifest, favicons.
- Redirecionamentos das URLs do site antigo (WordPress) para as novas, com página de meta refresh e arquivo `_redirects`.
- Validação automática do site gerado (`scripts/check.mjs`): lang, meta tags, h1 único, `alt` e dimensões de imagens, links internos, sitemap, JSON-LD.
- Servidor de desenvolvimento com rebuild automático (`scripts/serve.mjs --watch`).
- CI (build + validação em PRs) e deploy automático para GitHub Pages com domínio próprio.
- Templates de issue e pull request, CODEOWNERS, Dependabot, `.editorconfig`, `.gitattributes`.
- Documentação: README, CONTRIBUTING, docs/CONTEUDO, docs/DEPLOY, docs/SEO.

[Unreleased]: https://github.com/rerosolen-png/ameritex-site/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rerosolen-png/ameritex-site/releases/tag/v1.0.0
