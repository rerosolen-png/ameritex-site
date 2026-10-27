# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

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
