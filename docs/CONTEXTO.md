# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4). Fases 11–30 posteriores.
**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real.

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

A integração Solana/Web3 está **temporariamente congelada**. O contrato Anchor permanece **experimental** e `anchor test` **não foi executado** por falta do ambiente necessário (Rust, Solana CLI, Anchor CLI não disponíveis neste ambiente).

**Não fazer:** deploy na Solana, corrigir o stake_vault agora, adicionar testes Web3 agora, revisar repetidamente o contrato.

**Prioridade agora:**
1. Validar as fases existentes no navegador
2. Concluir a fase 1-6
3. Criar as fases 2-1 até 2-4
4. Testar vitória, derrota, reinício e progressão
5. Corrigir bugs de gameplay
6. Melhorar os placeholders principais
7. Preparar o build para hospedagem

Recompensas devem ser **simuladas localmente** (mock em Zustand). Nenhuma transação real na Solana.

---

## 1. Estado Factual do Projeto

> Regra: NÃO declarar como concluído algo que apenas está no GDD.
> Separar planejamento, implementação, testos e hipóteses.

### Smart Contract (Anchor Program) — CONGELADO

| Item | Planejado (GDD) | Implementado (código) | Testado |
|------|:---:|:---:|:---:|
| Token $SQUAD (SPL, 9 decimais, 500M supply) | ✅ | ✅ (`lib.rs`) | ❌ |
| Programa de recompensas por fase | ✅ | ✅ (`complete_phase`) | ❌ |
| Staking (Mundo 3+) | ✅ | ✅ | ❌ |
| Anti-farming (cooldown 30min, limite diário 50) | ✅ | ✅ | ❌ |
| Co-assinatura do servidor (server_authority: Signer) | ✅ | ✅ | ❌ |
| Validação de time_seconds, kills, soldiers_alive | ✅ | ✅ | ❌ |
| Enforce REWARD_POOL_TOTAL | ✅ | ✅ | ❌ |
| Constraints de player_token_account, squad_mint, stake_vault | ✅ | ✅ | ❌ |
| Verificação de mint authority em initialize_game | ✅ | ✅ | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Deploy na Mainnet | ✅ | ❌ | ❌ |
| Auditoria de segurança | ✅ | ❌ (parcial) | ❌ |

**Bloqueio real:** `anchor test` nunca foi executado. As correções de segurança foram aplicadas no código mas **não validadas em runtime**. O `stake_vault` pode ter incompatibilidade entre PDA e ATA no teste — precisa ser corrigido quando o ambiente estiver disponível.

### Front-end (Next.js + Phaser) — PRIORIDADE

| Item | Planejado (GDD) | Implementado (código) | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider (Phantom) | ✅ | ✅ | ✅ Build Next.js |
| HUD (saldo, vidas, fase, mundo, objetivo) | ✅ | ✅ | ⚠️ Não executado |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build Next.js |
| GameScene (tiro, inimigos, extracao) | ✅ | ✅ | ✅ Build Next.js |
| Tela de vitoria com estrelas, tempo, kills, vivos | ✅ | ✅ | ⚠️ Não executado |
| Tela de falha (esquadrão eliminado) | ✅ | ✅ | ⚠️ Não executado |
| Objetivo obrigatório (kill_then_extract) | ✅ | ✅ | ⚠️ Não executado |
| Objetivo rescue_then_extract (fase 1-5) | ✅ | ✅ | ⚠️ Não executado |
| Alvos de treino (bullseye) | ✅ | ✅ (placeholder) | ⚠️ Não executado |
| Inimigos por tipo (target/soldier/elite) | ✅ | ✅ (placeholder) | ⚠️ Não executado |
| Barra de vida nos soldados | ✅ | ✅ | ⚠️ Não executado |
| Barra de vida nos inimigos | ✅ | ✅ | ⚠️ Não executado |
| Morte de soldado com lápide e sangue | ✅ | ✅ | ⚠️ Não executado |
| Fogo inimigo bidirecional (enemyShoot) | ✅ | ✅ | ❌ Não executado |
| Colisão de parede (cobertura) | ✅ | ✅ | ❌ |
| Minas terrestres (fase 1-4) | ✅ | ✅ | ❌ |
| Reféns que seguem o esquadrão (fase 1-5) | ✅ | ✅ | ❌ |
| Morte de refém = falha da missão | ✅ | ✅ | ❌ |
| Boss General Gorila (fase 1-6) | ✅ | ⚠️ (código local, não pushado) | ❌ |
| Áudio (shoot, hit, explosion, victory, soldierHit, soldierDeath) | ✅ | ✅ (Web Audio API) | ⚠️ Não executado |
| 30 configs de fase no objeto PHASES | ✅ | ✅ (30 configs, 5 mundos) | ⚠️ Não executado |
| Fases 2-1 a 2-4 (Mundo 2) | ✅ | ⚠️ (configs, sem mecânicas) | ❌ |
| Recompensas simuladas localmente (mock Zustand) | ✅ | ✅ | ✅ |
| Integracao on-chain de recompensas | ✅ | ❌ (CONGELADO) | ❌ |
| Sprites / texturas (ainda placeholders) | ✅ | ❌ (retângulos e círculos) | ❌ |
| Controles mobile/touch | ✅ | ❌ | ❌ |

### Back-end (servidor de validação) — CONGELADO

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Servidor Node.js + TypeScript | ✅ | ❌ | ❌ |
| API REST + WebSocket | ✅ | ❌ | ❌ |
| PostgreSQL | ✅ | ❌ | ❌ |
| Redis | ✅ | ❌ | ❌ |

---

## 2. O Que Existe de Verdade

### Mecânicas implementadas (código existe)

- **Fase 1-1**: Extração simples (objetivo: extract)
- **Fase 1-2**: Tiro ao alvo — 8 alvos bullseye, kill_then_extract
- **Fase 1-3**: Floresta — cobertura de parede (movimento + tiros bloqueados por paredes)
- **Fase 1-4**: Minas terrestres — 7 minas visíveis, detonação ao pisar, 3 de dano
- **Fase 1-5**: Resgate de reféns — 3 reféns, rescue_then_extract, morte de refém = falha
- **Fase 1-6**: Boss General Gorila — código local pronto, precisa ser pushado
- **Fogo inimigo**: inimigos soldado/elite atiram no soldado vivo mais próximo
- **Colisão de parede**: moveSquad com slide, shoot e enemyShoot bloqueados por paredes
- **Morte de soldado**: lápide com nome, sangue, audio.soldierDeath()
- **Tela de falha**: esquadrão eliminado → phaseFailed()
- **Tela de vitória**: estrelas, tempo, kills, sobreviventes, reward $SQUAD (mock)
- **Áudio procedural**: shoot, hit, explosion, victory, soldierHit, soldierDeath

### O que NÃO existe

- Token $SQUAD não deployado on-chain (CONGELADO)
- Testes Anchor nunca executados (CONGELADO)
- Recompensas on-chain não integradas (CONGELADO — mock em Zustand)
- Sprites/texturas: soldados e inimigos ainda são retângulos/círculos (placeholder)
- Sem servidor de validação (CONGELADO)
- Sem mobile/touch
- Sem auditoria concluída (CONGELADO)
- **Runtime não validado**: o jogo não foi executado no navegador nesta sessão
- **Boss 1-6**: código existe localmente mas não foi pushado ao GitHub

---

## 3. Próxima Tarefa Clara

1. **Pushar o boss General Gorila** (fase 1-6) que está localmente pronto
2. **Validar runtime no navegador** — executar o jogo e confirmar que o ciclo completo funciona
3. **Criar fases 2-1 a 2-4** (Mundo 2) com mecânicas básicas
4. **Testar vitória, derrota, reinício e progressão** entre fases
5. **Corrigir bugs de gameplay** encontrados durante a validação
6. **Melhorar placeholders principais** (soldados, inimigos, lápide)
7. **Preparar build para hospedagem**

**Não iniciar:** integração Solana, correção de stake_vault, testes Web3, deploy na Devnet.

---

## 4. Economia do Token (SIMULADA)

- Supply: 500.000.000 $SQUAD (9 decimais) — planejado, não deployado
- Pool de recompensas: 40% (200M) — planejado, não deployado
- Staking obrigatório para Mundo 3+ (100/250/500 SQUAD acumulado) — planejado, não implementado no cliente
- Cooldown de 30 min entre replays — planejado, não implementado no cliente
- **Atualmente:** saldo mockado em Zustand, recompensas simuladas localmente

---

## 5. Decisões Tomadas

- **Solana sobre BSC**: Velocidade (~0.4s), custo (~$0.00001), Phantom UX
- **Rust + Anchor**: Framework nativo Solana
- **Phaser.js**: Engine 2D maduro, integra com React via refs
- **Zustand**: Estado leve, sincroniza Phaser + React
- **Mock rewards**: Saldo local em Zustand; mint real exige contrato deployado
- **Áudio procedural**: Web Audio API gera sons em runtime (sem assets binários)
- **Objetivo kill_then_extract**: Fase requer matar todos os alvos ANTES de extrair
- **Objetivo rescue_then_extract**: Fase 1-5 requer resgatar reféns; morte de refém = falha
- **Alvos de treino como bullseye**: Visual distinto de inimigos reais
- **Lápide com nome**: Soldado morto vira cruz + nome no chão
- **Colisão de parede**: moveSquad com slide, tiros bloqueados por paredes (cobertura)
- **Minas visíveis**: Mounds marrons com luz vermelha piscante, 3 de dano ao pisar
- **Fogo inimigo bidirecional**: Inimigos soldado/elite atiram no soldado mais próximo
- **Cronograma de 10 fases**: Primeira versão terá 10 fases completas (até 2-4), não 30
- **Web3 CONGELADO**: Integração Solana pausada por falta de ambiente; prioridade é jogo sem blockchain

---

## 6. Ideias Futuras (não implementadas)

| Ideia | Benefício | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retenção, social | Alto | Médio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Médio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Médio | Baixo | Backlog |
| DAO de governança | Comunidade decide balanceamento | Baixo | Médio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Médio | Baixo | Backlog |

---

## 7. Histórico de Validação de Runtime

### 2026-09-03
- `npm install` e `npm run build` aprovados
- Navegador headless HTTP 200 sem erros de console
- Validação interativa Phaser não concluída (navegador não alcança localhost)

### 2026-09-04
- Web3 CONGELADO por falta de ambiente Anchor/Solana
- Prioridade mudou para gameplay sem blockchain
- Boss General Gorila pronto localmente, precisa ser pushado
