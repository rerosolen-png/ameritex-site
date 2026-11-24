# Deploy e hospedagem

O site é estático: o build gera a pasta `dist/` e qualquer servidor de arquivos consegue publicá-la. Cada merge na branch `main` publica em dois destinos:

| Ambiente | Endereço | Workflow | Aparece no Google |
|----------|----------|----------|-------------------|
| **Produção** | `https://ameritex.com.br` (HostGator, Apache) | [`deploy-hostgator.yml`](../.github/workflows/deploy-hostgator.yml), envio por FTPS | Sim |
| **Prévia** | `https://rerosolen-png.github.io/ameritex-site/` (GitHub Pages) | [`deploy.yml`](../.github/workflows/deploy.yml) | Não (`noindex`) |

A prévia serve para conferir e compartilhar o site sem depender da hospedagem. Como o endereço dela é diferente do de produção (`siteUrl` em `src/data/site.json`), o build a marca como `noindex` automaticamente, para não concorrer com o domínio oficial.

## 1. Produção na HostGator

### 1.1 Como funciona

1. O workflow faz o build com a URL de produção e roda a validação (`scripts/check.mjs`). Se algo falhar, nada é enviado.
2. A pasta `dist/` é sincronizada com a pasta do site na HostGator por **FTPS** (FTP com criptografia). Só sobem arquivos novos ou alterados.
3. O sincronizador guarda no servidor o arquivo `.ftp-deploy-sync-state.json` com a lista do que ele enviou. Ele só apaga arquivos dessa lista; **nunca remove arquivos que não foram enviados por ele**.
4. Um teste pós-deploy confere página inicial, CSS da versão, sitemap, um redirecionamento antigo (301), a página 404 e o bloqueio de arquivos ocultos.

As credenciais ficam somente em **GitHub Secrets**. Elas não aparecem no código, nos logs nem no histórico.

### 1.2 Configuração inicial (uma única vez)

**a) Descobrir a pasta do site.** No cPanel, abra **Domínios** e veja a "Raiz do documento" de `ameritex.com.br`. Em geral é `public_html`. Se for uma subpasta, use-a nos passos seguintes.

**b) Guardar o WordPress antigo.** No **Gerenciador de Arquivos**, crie a pasta `backup-wordpress-AAAA-MM-DD` na raiz da conta (ao lado de `public_html`, **fora** dela, para não ficar acessível pela internet) e mova para lá todo o conteúdo da pasta do site, exceto a pasta `.well-known` e a `cgi-bin`. O banco de dados MySQL não é alterado. Se preferir uma cópia extra, gere um backup completo em **Backup → Download de um backup completo da conta**.

> Se houver outros sites em subpastas de `public_html` (domínios adicionais), deixe essas subpastas onde estão.

**c) Criar uma conta FTP só para o deploy.** No cPanel, em **Contas de FTP**:

- Login: `deploy` (fica `deploy@ameritex.com.br`)
- Senha: use o gerador do cPanel
- Diretório: a pasta do site do passo (a), por exemplo `public_html`

Com o diretório apontando para a pasta do site, a conta não enxerga mais nada da hospedagem.

**d) Cadastrar no GitHub.** Em **Settings → Secrets and variables → Actions**:

| Tipo | Nome | Valor |
|------|------|-------|
| Secret | `FTP_SERVER` | Servidor FTP mostrado no cPanel (ex.: `ftp.ameritex.com.br` ou o nome do servidor, `brNNN.hostgator.com.br`) |
| Secret | `FTP_USERNAME` | `deploy@ameritex.com.br` |
| Secret | `FTP_PASSWORD` | A senha criada no passo (c) |
| Variable | `FTP_SERVER_DIR` | Pasta do site **vista pela conta FTP**, terminando com `/`. Com a conta dedicada do passo (c): `./`. Com a conta principal do cPanel: `public_html/` |
| Variable | `HOSTGATOR_DEPLOY` | `true` (liga o deploy automático) |
| Variable (opcional) | `FTP_SECURITY` | `strict` para validar o certificado; exige usar em `FTP_SERVER` o nome do servidor da HostGator. Padrão: `loose` |

Pelo terminal, os mesmos cadastros (o `gh` pede o valor do secret sem exibi-lo na tela):

```bash
gh secret set FTP_SERVER
gh secret set FTP_USERNAME
gh secret set FTP_PASSWORD
gh variable set FTP_SERVER_DIR --body "./"
gh variable set HOSTGATOR_DEPLOY --body "true"
```

**e) Simular.** Em **Actions → Produção (HostGator) → Run workflow**, marque **Simulação** e execute. O log lista o que seria enviado, sem alterar o servidor. Confira se a pasta de destino está certa.

**f) Publicar.** Rode o workflow de novo sem a simulação (ou faça um merge em `main`). O primeiro envio leva alguns minutos por causa do catálogo em PDF. Ao final, o teste pós-deploy precisa passar.

### 1.3 O que o `.htaccess` faz

O arquivo é gerado pelo build (`src/lib/htaccess.mjs`) e enviado junto com o site. **Não o edite no servidor**: ele é substituído a cada deploy.

- Força HTTPS e redireciona `www.ameritex.com.br` para `ameritex.com.br`.
- Redireciona com **301** as URLs do site antigo listadas em `src/data/redirects.json`, incluindo os prefixos `/produto/…` e `/categoria-produto/…` do WooCommerce.
- Entrega `404.html` para páginas inexistentes e desliga a listagem de pastas.
- Define cache longo para CSS/JS (têm hash no nome), revalidação para HTML e compressão de texto.
- Bloqueia arquivos ocultos, exceto `/.well-known/` (usado na renovação do certificado SSL).

Todas as regras de domínio valem apenas para `ameritex.com.br`, para não interferir em outros domínios da mesma conta.

### 1.4 Como voltar atrás

- **Desfazer uma alteração do site:** reverta o pull request no GitHub (botão **Revert**) e mescle. O deploy republica a versão anterior.
- **Pausar a publicação:** mude a variável `HOSTGATOR_DEPLOY` para `false`.
- **Restaurar o WordPress:** pause a publicação, apague da pasta do site os arquivos do site novo e mova de volta o conteúdo de `backup-wordpress-AAAA-MM-DD`.

### 1.5 Cuidados

- Toda alteração entra pelo repositório. Arquivos editados direto no servidor são sobrescritos no deploy seguinte.
- Não apague `.ftp-deploy-sync-state.json` do servidor: sem ele, o próximo deploy reenvia tudo.
- O e-mail `@ameritex.com.br` usa os servidores do Google (registros MX). O deploy não toca em DNS nem em e-mail.
- Se a senha FTP for trocada no cPanel, atualize o secret `FTP_PASSWORD`.
- Depois de algumas semanas sem problemas, a pasta de backup do WordPress pode ser baixada para o computador e removida da hospedagem.

## 2. Prévia no GitHub Pages

- Ativação (já feita): **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- O workflow descobre a URL pública (`actions/configure-pages`) e a passa ao build pela variável `SITE_URL`. O build prefixa os links com `/ameritex-site` e aplica `noindex`.
- Repositórios privados precisam de plano pago do GitHub para usar Pages.

## 3. Fluxo contínuo

- **Pull request** → workflow **CI** (build + validação) e artefato `site-dist` para conferência.
- **Merge em `main`** → **Prévia (GitHub Pages)** e **Produção (HostGator)** rodam em paralelo.
- Se a validação falhar, nada é publicado. Corrija e envie novamente.
- Para republicar sem alteração: **Actions → (workflow) → Run workflow**.

## 4. Alternativas de hospedagem

A pasta `dist/` funciona em qualquer lugar.

| Plataforma | Como publicar | Redirecionamentos 301 |
|------------|---------------|------------------------|
| **GitHub Pages com domínio próprio** | Ver abaixo | Não há 301 de servidor; valem as páginas de redirecionamento geradas pelo build |
| **Netlify / Cloudflare Pages** | Conectar o repositório; build `node scripts/build.mjs`; saída `dist` | Leem `dist/_redirects` (gerado pelo build) |
| **Outra hospedagem Apache** | Mesmo workflow FTPS, trocando os secrets | `dist/.htaccess` (gerado pelo build) |

### GitHub Pages com domínio próprio

Caso um dia a produção saia da HostGator: defina `ameritex.com.br` em **Settings → Pages → Custom domain** (em deploys por Actions o arquivo `public/CNAME` é ignorado), desligue `HOSTGATOR_DEPLOY` e, no DNS do domínio, troque o registro A atual por:

| Tipo | Nome | Valor |
|------|------|-------|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `rerosolen-png.github.io.` |

Não altere os registros MX. Com o domínio ativo no Pages, o endereço passa a coincidir com o de produção e o `noindex` da prévia deixa de ser aplicado.

## 5. Formulário de contato

O formulário não envia e-mail: ele abre o WhatsApp com a mensagem formatada, o que dispensa servidor e evita spam. Se um dia for necessário receber por e-mail, as opções sem backend são Formspree, Netlify Forms ou Cloudflare Workers; basta trocar o `action` do formulário em `src/templates/pages/institucional.mjs`.

## 6. Checklist de lançamento

- [ ] `npm test` passando localmente e no CI
- [ ] `siteUrl` em `src/data/site.json` igual ao domínio final
- [ ] WordPress antigo guardado fora da pasta do site
- [ ] Secrets e variables cadastrados; simulação conferida
- [ ] Deploy de produção concluído e teste pós-deploy verde
- [ ] `https://ameritex.com.br/sobre-nos/` leva a `/sobre/`
- [ ] Links do WhatsApp e telefone testados em um celular
- [ ] Propriedade criada no Google Search Console e sitemap enviado (`/sitemap.xml`)
