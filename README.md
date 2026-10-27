# Site Ameritex – ameritex.com.br

Site institucional e catálogo online da **Ameritex Comércio, Importação e Exportação Ltda.**, importadora de tecidos e plásticos fundada em 1989. Substitui o site anterior em WordPress por um site estático, rápido e otimizado para buscadores, com todo o conteúdo do **Catálogo 2026**.

[![CI](https://github.com/rerosolen-png/ameritex-site/actions/workflows/ci.yml/badge.svg)](https://github.com/rerosolen-png/ameritex-site/actions/workflows/ci.yml)
[![Deploy](https://github.com/rerosolen-png/ameritex-site/actions/workflows/deploy.yml/badge.svg)](https://github.com/rerosolen-png/ameritex-site/actions/workflows/deploy.yml)

## Visão geral

| | |
|---|---|
| **Páginas** | Início · Produtos (9 linhas, 140 variantes) · Guias (5 artigos) · Sobre · Contato · Catálogo PDF · Política de privacidade · 404 |
| **Stack** | HTML + CSS + JavaScript puros, gerados por um build em Node.js **sem dependências externas** (`scripts/build.mjs`) |
| **Conteúdo** | JSON (`src/data/`) e Markdown (`src/content/`) – editável sem conhecimento de programação |
| **Hospedagem** | GitHub Pages com domínio próprio, deploy automático via GitHub Actions a cada push em `main`. Até o DNS ser trocado, a prévia fica em `rerosolen-png.github.io/ameritex-site/` (o build detecta o caminho base automaticamente) |
| **Qualidade** | `scripts/check.mjs` valida SEO, links, imagens e dados estruturados em todo build (bloqueia o deploy se houver erro) |

### Por que um site estático sem framework

- **Velocidade e Core Web Vitals:** nenhuma dependência de JavaScript no cliente além de ~4 KB para menu, filtros e lightbox. Imagens com `width`/`height` e `loading="lazy"`.
- **Segurança e custo zero:** sem banco de dados, sem plugins para atualizar, sem painel para invadir. GitHub Pages é gratuito.
- **Manutenção simples:** o conteúdo vive em arquivos de texto versionados. Cada alteração passa por pull request, validação automática e fica registrada no histórico.
- **Sem lock-in:** a pasta `dist/` é um site HTML comum e pode ser hospedada em qualquer servidor (Netlify, Vercel, Cloudflare Pages, hospedagem compartilhada via FTP).

## Estrutura do projeto

```
.
├── .github/              # CI, deploy, templates de issue/PR, Dependabot, CODEOWNERS
├── docs/                 # Documentação: conteúdo, deploy, SEO
├── public/               # Copiado como está para a raiz do site (favicons, CNAME, downloads/)
├── scripts/
│   ├── build.mjs         # Gera o site em dist/
│   ├── check.mjs         # Valida o site gerado (SEO, links, imagens, JSON-LD)
│   ├── serve.mjs         # Servidor local de desenvolvimento (com --watch)
│   └── setup-github.ps1  # Cria o repositório no GitHub e faz o primeiro push
├── src/
│   ├── assets/img/       # Imagens otimizadas (produtos, categorias, marca)
│   ├── content/
│   │   ├── produtos/     # Texto longo de cada linha de produto (Markdown)
│   │   └── guias/        # Artigos do blog "Guias" (Markdown com front matter)
│   ├── data/
│   │   ├── site.json     # Dados da empresa: contatos, endereços, navegação
│   │   ├── produtos.json # Linhas, especificações e variantes (códigos, nomes, imagens)
│   │   ├── faq.json      # Perguntas frequentes da página inicial
│   │   └── redirects.json# URLs do site antigo → novas
│   ├── lib/              # Utilitários: html seguro, markdown, imagens, carregamento de conteúdo
│   ├── scripts/main.js   # JavaScript do site
│   ├── styles/main.css   # Folha de estilo (tokens de marca em :root)
│   └── templates/        # Templates de página (layout, componentes, páginas)
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (recomendado: 22 LTS, ver `.nvmrc`)
- [Git](https://git-scm.com/) e, para o setup inicial, o [GitHub CLI](https://cli.github.com/)

No Windows, com o [winget](https://learn.microsoft.com/windows/package-manager/):

```powershell
winget install OpenJS.NodeJS.LTS Git.Git GitHub.cli
```

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm run build` | Gera o site em `dist/`. A variável `SITE_URL` sobrescreve a URL pública (o deploy usa isso para publicar em `usuario.github.io/repo` antes do domínio próprio) |
| `npm run check` | Valida `dist/` (títulos, descrições, canonical, Open Graph, `alt`, links internos, sitemap, JSON-LD) |
| `npm test` | `build` + `check` – é o que o CI executa |
| `npm run dev` | Build + servidor em http://localhost:8080 com rebuild automático ao salvar |
| `npm run serve` | Apenas serve o `dist/` existente |
| `npm run clean` | Remove `dist/` |

O projeto **não tem dependências npm**; `npm install` não é necessário.

## Como editar o conteúdo

Guia completo em [`docs/CONTEUDO.md`](docs/CONTEUDO.md). Resumo:

- **Telefones, WhatsApp, e-mail, endereços, redes sociais:** `src/data/site.json`.
- **Produtos, códigos, medidas, estampas e cores:** `src/data/produtos.json` (dados) e `src/content/produtos/<slug>.md` (texto).
- **Guias (artigos):** crie um arquivo em `src/content/guias/` com o cabeçalho `title`, `description`, `date`, `image`, `imageAlt` e `category`.
- **Imagens:** coloque em `src/assets/img/...` (JPEG ≤ 350 KB, largura 800–1200 px) e referencie pelo caminho relativo.
- **Catálogo PDF:** substitua `public/downloads/catalogo-ameritex-2026.pdf` e, se o ano mudar, ajuste `catalogYear` e `catalogFile` em `site.json`.

Toda alteração é validada por `npm test`. Se algo estiver inconsistente (imagem inexistente, título longo demais, link quebrado), o build falha com uma mensagem clara e o deploy não acontece.

## Deploy

O site é publicado automaticamente no **GitHub Pages** a cada push em `main` (workflow [`deploy.yml`](.github/workflows/deploy.yml)). Passo a passo da configuração inicial, do domínio `ameritex.com.br` (DNS) e das alternativas de hospedagem em [`docs/DEPLOY.md`](docs/DEPLOY.md).

## SEO

O que está implementado e o checklist pós-lançamento (Search Console, redirecionamentos do site antigo, Google Business Profile) estão em [`docs/SEO.md`](docs/SEO.md).

## Fluxo de trabalho

Branches, Conventional Commits, pull requests e versionamento em [`CONTRIBUTING.md`](CONTRIBUTING.md). Histórico de versões em [`CHANGELOG.md`](CHANGELOG.md).

## Licença

Código e conteúdo proprietários da Ameritex Comércio, Importação e Exportação Ltda. Ver [`LICENSE`](LICENSE).
