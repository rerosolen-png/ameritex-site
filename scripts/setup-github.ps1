<#
.SYNOPSIS
  Cria o repositório Git local, o repositório no GitHub e faz o primeiro push.

.DESCRIPTION
  Pré-requisitos: Git (git-scm.com) e GitHub CLI (cli.github.com) instalados e
  autenticados ("gh auth login"). Rode na raiz do projeto:

    .\scripts\setup-github.ps1 -Owner meu-usuario -Repo ameritex-site -Visibility private

  O script:
    1. inicializa o Git na branch main (se ainda não houver repositório)
    2. faz o commit inicial
    3. cria o repositório no GitHub e envia o código
    4. ativa o GitHub Pages com fonte "GitHub Actions"
    5. protege a branch main (PR obrigatório com CI verde)
    6. substitui OWNER pelos valores corretos no README, CHANGELOG, package.json e CODEOWNERS

.PARAMETER Owner
  Usuário ou organização do GitHub.

.PARAMETER Repo
  Nome do repositório (padrão: ameritex-site).

.PARAMETER Visibility
  public ou private (padrão: private). Atenção: GitHub Pages em repositório privado
  exige plano pago; em conta gratuita use -Visibility public.
#>
param(
    [Parameter(Mandatory = $true)][string]$Owner,
    [string]$Repo = 'ameritex-site',
    [ValidateSet('public', 'private')][string]$Visibility = 'private'
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

function Assert-Tool($name, $hint) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "'$name' não encontrado. $hint"
    }
}
Assert-Tool git 'Instale com: winget install Git.Git'
Assert-Tool gh 'Instale com: winget install GitHub.cli'
Assert-Tool node 'Instale com: winget install OpenJS.NodeJS.LTS'

Write-Host "== Verificando autenticação no GitHub" -ForegroundColor Cyan
gh auth status

Write-Host "== Substituindo OWNER por $Owner nos arquivos de documentação" -ForegroundColor Cyan
foreach ($file in @('README.md', 'CHANGELOG.md', 'package.json', '.github/CODEOWNERS')) {
    $path = Join-Path $root $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding utf8
        $content = $content -replace 'OWNER/ameritex-site', "$Owner/$Repo" -replace '@OWNER', "@$Owner"
        [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
    }
}

Write-Host "== Build e validação" -ForegroundColor Cyan
node scripts/build.mjs
node scripts/check.mjs

if (-not (Test-Path (Join-Path $root '.git'))) {
    Write-Host "== Inicializando repositório Git (branch main)" -ForegroundColor Cyan
    git init -b main
}

git add -A
if (git status --porcelain) {
    git commit -m "feat: site inicial com catálogo 2026" -m "Site estático gerado por build Node.js sem dependências, com 9 linhas de produto, 5 guias, SEO completo, CI e deploy para GitHub Pages."
}

Write-Host "== Criando repositório $Owner/$Repo ($Visibility) e enviando" -ForegroundColor Cyan
gh repo create "$Owner/$Repo" --$Visibility --source . --remote origin --push --description "Site institucional e catálogo da Ameritex (ameritex.com.br)"

Write-Host "== Ativando GitHub Pages (fonte: GitHub Actions)" -ForegroundColor Cyan
try {
    gh api -X POST "repos/$Owner/$Repo/pages" -f build_type=workflow | Out-Null
} catch {
    Write-Warning "Não foi possível ativar o Pages automaticamente ($($_.Exception.Message)). Ative em Settings > Pages > Source: GitHub Actions."
}

Write-Host "== Protegendo a branch main" -ForegroundColor Cyan
$protection = @{
    required_status_checks        = @{ strict = $true; contexts = @('Build e validação') }
    enforce_admins                = $false
    # 0 aprovações: PR e CI obrigatórios, mas um único mantenedor consegue mesclar. Suba para 1 quando houver equipe.
    required_pull_request_reviews = @{ required_approving_review_count = 0 }
    restrictions                  = $null
} | ConvertTo-Json -Depth 5
try {
    $protection | gh api -X PUT "repos/$Owner/$Repo/branches/main/protection" --input - | Out-Null
} catch {
    Write-Warning "Não foi possível proteger a branch ($($_.Exception.Message)). Configure em Settings > Branches."
}

Write-Host ""
Write-Host "Pronto. Repositório: https://github.com/$Owner/$Repo" -ForegroundColor Green
Write-Host "Acompanhe o deploy em https://github.com/$Owner/$Repo/actions"
Write-Host "Depois, configure o domínio em Settings > Pages (ver docs/DEPLOY.md)."
