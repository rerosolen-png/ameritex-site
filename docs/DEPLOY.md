# Deploy e hospedagem

O site é estático: o build gera a pasta `dist/` e qualquer servidor de arquivos consegue publicá-la. A configuração padrão usa **GitHub Pages** com deploy automático via GitHub Actions.

## 1. Primeira publicação (GitHub Pages)

### 1.1 Criar o repositório

Com Git e GitHub CLI instalados e autenticados (`gh auth login`), rode na raiz do projeto:

```powershell
.\scripts\setup-github.ps1 -Owner SEU_USUARIO_OU_ORG -Repo ameritex-site -Visibility private
```

O script inicializa o Git, faz o primeiro commit, cria o repositório, envia o código, ativa o GitHub Pages com fonte "GitHub Actions" e protege a branch `main`. Se preferir fazer manualmente:

```bash
git init -b main
git add .
git commit -m "feat: site inicial com catálogo 2026"
gh repo create SEU_USUARIO/ameritex-site --private --source . --push
```

### 1.2 Ativar o GitHub Pages

No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**. O workflow `deploy.yml` já está configurado; o primeiro push em `main` publica o site em `https://SEU_USUARIO.github.io/ameritex-site/` (até o domínio próprio ser configurado).

> Repositórios privados precisam de plano GitHub Pro/Team para usar Pages. Em conta gratuita, torne o repositório público (o código não contém segredos) ou use uma das alternativas na seção 3.

### 1.3 Prévia antes do domínio

Enquanto o domínio não está configurado, o site fica em `https://rerosolen-png.github.io/ameritex-site/`. O workflow de deploy descobre essa URL (`actions/configure-pages`) e passa para o build pela variável `SITE_URL`; o build então prefixa todos os links com `/ameritex-site`. Quando o domínio próprio for ativado em Settings → Pages, a mesma etapa passa a devolver `https://ameritex.com.br` e o prefixo desaparece sozinho. Nada precisa ser alterado no código.

### 1.4 Domínio próprio (ameritex.com.br)

1. Em deploys feitos por GitHub Actions, o arquivo `CNAME` é ignorado: o domínio é definido em **Settings → Pages → Custom domain** (ou via API: `gh api -X PUT repos/rerosolen-png/ameritex-site/pages -f cname=ameritex.com.br`). O arquivo `public/CNAME` fica no repositório apenas como documentação da intenção.
2. No painel de DNS do domínio (Registro.br ou o provedor atual), crie:

   | Tipo | Nome | Valor |
   |------|------|-------|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `rerosolen-png.github.io.` |

   Remova os registros A/CNAME antigos que apontavam para a hospedagem do WordPress.
3. Em **Settings → Pages → Custom domain**, informe `ameritex.com.br`, aguarde a verificação do DNS e marque **Enforce HTTPS**.
4. Verifique também o domínio na conta/organização (**Settings → Pages → Verified domains**) para impedir que terceiros o utilizem.

A propagação do DNS leva de minutos a 24 h. Durante a troca, mantenha o site antigo no ar.

## 2. Fluxo contínuo

- Push em `main` → workflow **Deploy** (build + validação + publicação). Leva cerca de 1 minuto.
- Pull request → workflow **CI** (build + validação) e artefato `site-dist` para conferência.
- Se a validação falhar, nada é publicado. Corrija e envie novamente.
- Para republicar sem alteração (por exemplo, após mudar o DNS): **Actions → Deploy → Run workflow**.

## 3. Alternativas de hospedagem

A pasta `dist/` funciona em qualquer lugar. Pontos de atenção por plataforma:

| Plataforma | Como publicar | Redirecionamentos 301 |
|------------|---------------|------------------------|
| **Netlify** | Conectar o repositório; build command `node scripts/build.mjs`; publish directory `dist` | Lê `dist/_redirects` (gerado pelo build) |
| **Cloudflare Pages** | Idem (build `node scripts/build.mjs`, output `dist`) | Lê `dist/_redirects` |
| **Vercel** | Conectar o repositório; output `dist` | Converter `_redirects` em `vercel.json` |
| **Hospedagem compartilhada (FTP)** | Rodar `npm run build` e enviar o conteúdo de `dist/` para `public_html/` | Configurar no `.htaccess` (Apache) usando a lista de `src/data/redirects.json` |

No GitHub Pages não existem redirecionamentos de servidor; por isso o build gera páginas com `meta refresh` para as URLs antigas (ver `docs/SEO.md`).

## 4. Formulário de contato

O formulário não envia e-mail: ele abre o WhatsApp com a mensagem formatada, o que dispensa servidor e evita spam. Se um dia for necessário receber por e-mail, as opções sem backend são Formspree, Netlify Forms ou Cloudflare Workers; basta trocar o `action` do formulário em `src/templates/pages/institucional.mjs`.

## 5. Checklist de lançamento

- [ ] `npm test` passando localmente e no CI
- [ ] `siteUrl` em `src/data/site.json` igual ao domínio final
- [ ] DNS apontado e HTTPS ativo
- [ ] Site antigo desligado somente após o novo responder no domínio
- [ ] Propriedade criada no Google Search Console e sitemap enviado (`/sitemap.xml`)
- [ ] Redirecionamentos testados (abrir `ameritex.com.br/sobre-nos/` deve levar a `/sobre/`)
- [ ] Links do WhatsApp e telefone testados em um celular
