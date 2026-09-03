# Squad Fall — Instalação Completa (Windows)

# 1. Instalar Rust
Write-Host "===== PASSO 1: Rust =====" -ForegroundColor Green
Write-Host "Abrindo https://rustup.rs no navegador..."
Start-Process "https://rustup.rs"
Write-Host "Baixe rustup-init.exe e execute. Opção 1 (default)."
Write-Host "Depois feche e reabra este terminal."
Pause

# 2. Instalar Node.js
Write-Host "===== PASSO 2: Node.js =====" -ForegroundColor Green
Write-Host "Verificando Node..."
node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node nao encontrado. Baixando..."
    Start-Process "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    Write-Host "Instale o Node.js e reabra este terminal."
    Pause
} else {
    Write-Host "Node OK: $(node --version)"
}

# 3. Instalar Solana CLI
Write-Host "===== PASSO 3: Solana CLI =====" -ForegroundColor Green
solana --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Baixando instalador do Solana..."
    Start-Process "https://github.com/anza-xyz/agave/releases/download/v1.18.18/solana-release-x86_64-pc-windows-msvc.tar.bz2"
    Write-Host "Extraia o arquivo e adicione a pasta bin/ ao PATH do Windows."
    Write-Host "Tutorial: https://solana.com/pt/docs/intro/installation"
    Pause
} else {
    Write-Host "Solana OK: $(solana --version)"
}

# 4. Instalar Anchor
Write-Host "===== PASSO 4: Anchor CLI =====" -ForegroundColor Green
anchor --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalando Anchor (5-10 min)..."
    cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
} else {
    Write-Host "Anchor OK: $(anchor --version)"
}

# 5. Configurar carteira Solana
Write-Host "===== PASSO 5: Carteira de Deploy =====" -ForegroundColor Green
if (-not (Test-Path "$env:USERPROFILE\.config\solana\id.json")) {
    Write-Host "Gerando nova carteira..."
    solana-keygen new --outfile "$env:USERPROFILE\.config\solana\id.json"
    Write-Host "GUARDE AS 12 PALAVRAS ACIMA! ANOTE!"
    Pause
}

# 6. Pegar SOL na Devnet
Write-Host "===== PASSO 6: SOL na Devnet =====" -ForegroundColor Green
solana config set --url devnet
solana airdrop 5
solana balance

Write-Host "===== PRONTO! =====" -ForegroundColor Cyan
Write-Host "Agora rode: cd squad-fall && anchor test"