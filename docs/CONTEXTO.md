# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04 (pós-boss 1-6)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4). Fases 11–30 posteriores.
**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real.

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

A integração Solana/Web3 está **temporariamente congelada**. O contrato Anchor permanece **experimental** e `anchor test` **não foi executado** por falta do ambiente necessário (Rust, Solana CLI, Anchor CLI não disponíveis neste ambiente).

**Não fazer:** deploy na Solana, corrigir o stake_vault, adicionar testes Web3, revisar o contrato.

**Prioridade agora:**
1. Validar as fases existentes no navegador
2. ~~Concluir a fase 1-6~~ ✅ Boss General Gorila pushed (commit 9cfe9e8)
3. Criar as fases 2-1 até 2-4
4. Testar vitória, derrota, reinício e progressão
5. Corrigir bugs de gameplay
6. Melhorar os placeholders principais
7. Preparar o build para hospedagem

Recompensas são **simuladas localmente** (mock em Zustand). Nenhuma transação real na Solana.

---

## 1. Estado Factual do Projeto

### Smart Contract (Anchor Program) — CONGELADO

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Token $SQUAD | ✅ | ✅ | ❌ |
| Recompensas por fase | ✅ | ✅ | ❌ |
| Staking | ✅ | ✅ | ❌ |
| Anti-farming | ✅ | ✅ | ❌ |
| Co-assinatura servidor | ✅ | ✅ | ❌ |
| Validação de params | ✅ | ✅ | ❌ |
| Constraints de contas | ✅ | ✅ | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Auditoria | ✅ | ❌ (parcial) | ❌ |

### Front-end (Next.js + Phaser) — PRIORIDADE

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider | ✅ | ✅ | ✅ Build |
| HUD (saldo, vidas, fase, mundo, objetivo) | ✅ | ✅ | ⚠️ |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build |
| GameScene (tiro, inimigos, extração) | ✅ | ✅ | ✅ Build |
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

### Back-end — CONGELADO

Tudo ❌. Não iniciar.

---

## 2. O Que Existe de Verdade

### Mecânicas implementadas (código existe no GitHub)

- **Fase 1-1**: Extração simples (objetivo: extract)
- **Fase 1-2**: Tiro ao alvo — 8 alvos bullseye, kill_then_extract
- **Fase 1-3**: Floresta — cobertura de parede (movimento + tiros bloqueados)
- **Fase 1-4**: Minas terrestres — 7 minas, detonação ao pisar, 3 de dano
- **Fase 1-5**: Reféns — 3 reféns, seguem o esquadrão após resgate
- **Fase 1-6**: Boss General Gorila — veículo blindado 2x2, HP bar, spawna ondas de soldados, hitBoss()
- **Fogo inimigo**: inimigos soldado/elite atiram no soldado mais próximo
- **Colisão de parede**: moveSquad com slide, tiros bloqueados
- **Morte de soldado**: lápide com nome, sangue, audio
- **Tela de falha**: esquadrão eliminado → phaseFailed()
- **Tela de vitória**: estrelas, tempo, kills, sobreviventes, reward mock
- **Áudio procedural**: shoot, hit, explosion, victory, soldierHit, soldierDeath

### O que NÃO existe

- Token $SQUAD não deployado (CONGELADO)
- Testes Anchor nunca executados (CONGELADO)
- Recompensas on-chain (CONGELADO)
- Sprites/texturas: placeholders (retângulos/círculos)
- Sem mobile/touch
- **Runtime não validado**: jogo não foi executado no navegador nesta sessão

---

## 3. Próxima Tarefa Clara

1. **Validar runtime no navegador** — executar o jogo, testar ciclo completo: iniciar, mover, atirar, receber dano, perder soldados, cumprir objetivo, extrair, vencer, perder, reiniciar, avançar
2. **Corrigir bugs de gameplay** encontrados durante a validação
3. **Criar fases 2-1 a 2-4** (Mundo 2) com mecânicas básicas
4. **Melhorar placeholders principais**
5. **Preparar build para hospedagem**

---

## 4. Economia do Token (SIMULADA)

- Supply: 500M $SQUAD — planejado, não deployado
- Pool de recompensas: 40% (200M) — planejado, não deployado
- **Atualmente:** saldo mockado em Zustand, recompensas simuladas localmente

---

## 5. Decisões Tomadas

- Solana sobre BSC, Rust + Anchor, Phaser.js, Zustand
- Mock rewards: saldo local em Zustand
- Áudio procedural: Web Audio API
- Objetivo kill_then_extract: matar todos antes de extrair
- Alvos de treino como bullseye: visual distinto
- Lápide com nome: soldado morto vira cruz + nome
- Colisão de parede: slide, tiros bloqueados
- Minas visíveis: mounds com luz vermelha, 3 de dano
- Fogo inimigo bidirecional: atiram no soldado mais próximo
- Boss General Gorila: veículo blindado, spawna ondas, hitBoss()
- Cronograma de 10 fases: primeira versão até 2-4
- Web3 CONGELADO: prioridade é jogo sem blockchain

---

## 6. Ideias Futuras (não implementadas)

| Ideia | Benefício | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo | Retenção | Alto | Médio | Backlog |
| Torneios PvP | Competitividade | Médio | Baixo | Backlog |
| Solana Mobile | Touch UI | Médio | Baixo | Backlog |
| DAO de governança | Comunidade | Baixo | Médio | Backlog |
| Skin NFT marketplace | Receita | Médio | Baixo | Backlog |
