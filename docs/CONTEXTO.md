# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04 (validação estática + bloqueio de navegador)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4). Fases 11–30 posteriores.
**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real.

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

A integração Solana/Web3 está **temporariamente congelada**. O contrato Anchor permanece **experimental** e `anchor test` **não foi executado** por falta do ambiente necessário.

**Não fazer:** deploy na Solana, corrigir o stake_vault, adicionar testes Web3, revisar o contrato.

**Prioridade agora:**
1. ~~Concluir a fase 1-6~~ ✅ Boss General Gorila pushed (commit 9cfe9e8)
2. **Validar runtime no navegador** — BLOQUEADO: este ambiente não tem Node.js/npm nem navegador
3. Criar as fases 2-1 até 2-4 (Mundo 2)
4. Testar vitória, derrota, reinício e progressão
5. Corrigir bugs de gameplay
6. Melhorar os placeholders principais
7. Preparar o build para hospedagem

Recompensas são **simuladas localmente** (mock em Zustand).

---

## 1. Estado Factual do Projeto

### Smart Contract (Anchor Program) — CONGELADO

Tudo implementado no código mas não testado. Não iniciar.

### Front-end (Next.js + Phaser) — PRIORIDADE

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider | ✅ | ✅ | ✅ Build anterior |
| HUD (saldo, vidas, fase, mundo, objetivo) | ✅ | ✅ | ⚠️ |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build anterior |
| GameScene (tiro, inimigos, extração) | ✅ | ✅ | ✅ Build anterior |
| Tela de vitória com estrelas | ✅ | ✅ | ⚠️ |
| Tela de falha | ✅ | ✅ | ⚠️ |
| Objetivo kill_then_extract | ✅ | ✅ | ⚠️ |
| Alvos de treino (bullseye) | ✅ | ✅ | ⚠️ |
| Inimigos por tipo (target/soldier/elite) | ✅ | ✅ | ⚠️ |
| Barra de vida soldados | ✅ | ✅ | ⚠️ |
| Barra de vida inimigos | ✅ | ✅ | ⚠️ |
| Morte de soldado com lápide | ✅ | ✅ | ⚠️ |
| Fogo inimigo bidirecional | ✅ | ✅ | ❌ |
| Colisão de parede (cobertura) | ✅ | ✅ | ❌ |
| Minas terrestres (1-4) | ✅ | ✅ | ❌ |
| Reféns que seguem o esquadrão (1-5) | ✅ | ✅ | ❌ |
| Boss General Gorila (1-6) | ✅ | ✅ | ❌ |
| Áudio procedural | ✅ | ✅ | ⚠️ |
| 30 configs de fase | ✅ | ✅ | ⚠️ |
| Fases 2-1 a 2-4 (Mundo 2) | ✅ | ⚠️ (configs, sem mecânicas) | ❌ |
| Recompensas simuladas (mock Zustand) | ✅ | ✅ | ✅ |
| Integração on-chain | ✅ | ❌ (CONGELADO) | ❌ |
| Sprites / texturas | ✅ | ❌ (placeholders) | ❌ |
| Mobile/touch | ✅ | ❌ | ❌ |

---

## 2. Validação de Runtime

### BLOQUEIO REAL

Este ambiente de código não possui:
- Node.js / npm (não pode rodar `npm install`, `npm run build`, `npm run dev`)
- Navegador headless (não pode executar Phaser em runtime)
- Solana CLI / Anchor CLI (não pode rodar `anchor test`)

**O que foi feito:**
- Validação estática do código TypeScript: sem erros de sintaxe detectados na leitura
- Build Next.js aprovado anteriormente (03/09/2026) em sessão que tinha npm

**O que NÃO foi feito:**
- `npm run build` com o GameScene atual (com boss, minas, reféns)
- Validação interativa no navegador (iniciar, mover, atirar, dano, morte, objetivo, extração, vitória, derrota, reinício, progressão)

**Próxima IA ou usuário deve:**
1. Rodar `cd squad-fall-frontend && npm install && npm run build` em ambiente com Node.js
2. Rodar `npm run dev` e abrir `http://localhost:3000` no navegador
3. Conectar Phantom (ou usar modo dev sem carteira se configurado)
4. Testar cada fase 1-1 a 1-6 manualmente
5. Reportar bugs encontrados

---

## 3. Mundo 1 — Completo no Código

- **1-1**: Extração simples (objetivo: extract)
- **1-2**: Tiro ao alvo (8 alvos bullseye, kill_then_extract)
- **1-3**: Floresta (cobertura de parede, tiros bloqueados)
- **1-4**: Minas terrestres (7 minas, 3 de dano ao pisar)
- **1-5**: Reféns (3 reféns, seguem o esquadrão após resgate)
- **1-6**: Boss General Gorila (veículo blindado 2x2, HP bar, spawna ondas, hitBoss)

---

## 4. Próxima Tarefa Clara

1. **Validar runtime no navegador** — BLOQUEADO neste ambiente
2. **Criar fases 2-1 a 2-4** (Mundo 2) — pode prosseguir sem validação de navegador
3. Corrigir bugs de gameplay (após validação)
4. Melhorar placeholders
5. Preparar build para hospedagem

---

## 5. Decisões Tomadas

- Solana sobre BSC, Rust + Anchor, Phaser.js, Zustand
- Mock rewards: saldo local em Zustand
- Áudio procedural: Web Audio API
- Boss General Gorila: veículo blindado, spawna ondas, hitBoss()
- Web3 CONGELADO: prioridade é jogo sem blockchain
- Validação de navegador BLOQUEADA: ambiente sem Node.js/npm

---

## 6. Ideias Futuras (não implementadas)

| Ideia | Benefício | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo | Retenção | Alto | Médio | Backlog |
| Torneios PvP | Competitividade | Médio | Baixo | Backlog |
| Solana Mobile | Touch UI | Médio | Baixo | Backlog |
| DAO de governança | Comunidade | Baixo | Médio | Backlog |
| Skin NFT marketplace | Receita | Médio | Baixo | Backlog |
