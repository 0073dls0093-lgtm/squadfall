# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-minas 1-4)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** 1794675 — minas terrestres na fase 1-4

**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4). Fases 11–30 posteriores.
**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real.

---

## 1. Estado Factual do Projeto

> Regra: NÃO declarar como concluido algo que apenas esta no GDD.
> Separar planejamento, implementação, testes e hipoteses.

### Smart Contract (Anchor Program)

| Item | Planejado (GDD) | Implementado (codigo) | Testado |
|------|:---:|:---:|:---:|
| Token $SQUAD (SPL, 9 decimais, 500M supply) | ✅ | ✅ (`lib.rs`) | ❌ |
| Programa de recompensas por fase | ✅ | ✅ (`complete_phase`) | ❌ |
| Staking (Mundo 3+) | ✅ | ✅ | ❌ |
| Anti-farming (cooldown 30min, limite diario 50) | ✅ | ✅ | ❌ |
| Validacao de assinatura do servidor | ✅ | ⚠️ Mockado | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Deploy na Mainnet | ✅ | ❌ | ❌ |
| Auditoria de segurança | ✅ | ❌ | ❌ |

### Front-end (Next.js + Phaser) — Vertical Slice 1-4

| Item | Planejado (GDD) | Implementado (codigo) | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider (Phantom) | ✅ | ✅ | ✅ Build Next.js |
| HUD (saldo, vidas, fase, mundo, objetivo) | ✅ | ✅ | ⚠️ Não executado |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build Next.js |
| GameScene (tiro, inimigos, extracao) | ✅ | ✅ | ✅ Build Next.js |
| Tela de vitoria com estrelas, tempo, kills, vivos | ✅ | ✅ | ⚠️ Não executado |
| Tela de falha (esquadrão eliminado) | ✅ | ✅ | ⚠️ Não executado |
| Objetivo obrigatório (kill_then_extract) | ✅ | ✅ | ⚠️ Não executado |
| Alvos de treino (bullseye) distintos de inimigos | ✅ | ✅ (placeholder visual) | ⚠️ Não executado |
| Inimigos por tipo (target/soldier/elite) | ✅ | ✅ (placeholder visual) | ⚠️ Não executado |
| Barra de vida nos soldados | ✅ | ✅ | ⚠️ Não executado |
| Barra de vida nos inimigos | ✅ | ✅ | ⚠️ Não executado |
| Morte de soldado com lápide e sangue | ✅ | ✅ | ⚠️ Não executado |
| Fogo inimigo bidirecional (enemyShoot) | ✅ | ✅ | ❌ Não executado |
| damageSoldier() acionado por IA inimiga | ✅ | ✅ | ❌ |
| Colisão de parede (cobertura) | ✅ | ✅ | ❌ |
| Minas terrestres (fase 1-4) | ✅ | ✅ | ❌ |
| Áudio (shoot, hit, explosion, victory, soldierHit, soldierDeath) | ✅ | ✅ (Web Audio API) | ⚠️ Não executado |
| 30 configs de fase no objeto PHASES | ✅ | ✅ (30 configs, 5 mundos) | ⚠️ Não executado |
| Integracao on-chain de recompensas | ✅ | ❌ (mock em Zustand) | ❌ |
| Sprites / texturas (ainda placeholders) | ✅ | ❌ (retângulos e círculos) | ❌ |
| Controles mobile/touch | ✅ | ❌ | ❌ |
| NFT marketplace | ✅ | ❌ | ❌ |
| Leaderboard on-chain | ✅ | ❌ | ❌ |
| Multiplayer / cooperativo | ✅ | ❌ | ❌ |

### Back-end (servidor de validacao)

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Servidor Node.js + TypeScript | ✅ | ❌ | ❌ |
| API REST + WebSocket | ✅ | ❌ | ❌ |
| PostgreSQL | ✅ | ❌ | ❌ |
| Redis | ✅ | ❌ | ❌ |

---

## 2. O Que Existe de Verdade

### Mecânicas implementadas (codigo existe)

- **Fase 1-1**: Extração simples (objetivo: extract)
- **Fase 1-2**: Tiro ao alvo — 8 alvos bullseye, kill_then_extract
- **Fase 1-3**: Floresta — cobertura de parede (movimento + tiros bloqueados por paredes)
- **Fase 1-4**: Minas terrestres — 7 minas visíveis, detonação ao pisar, 3 de dano
- **Fogo inimigo**: inimigos soldado/elite atiram no soldado vivo mais próximo
- **Colisão de parede**: moveSquad com slide, shoot e enemyShoot bloqueados por paredes
- **Morte de soldado**: lápide com nome, sangue, audio.soldierDeath()
- **Tela de falha**: esquadrão eliminado → phaseFailed()
- **Tela de vitória**: estrelas, tempo, kills, sobreviventes, reward $SQUAD
- **Áudio procedural**: shoot, hit, explosion, victory, soldierHit, soldierDeath

### O que NAO existe

- Token $SQUAD nao deployado on-chain
- Testes Anchor nunca executados
- Recompensas on-chain não integradas ao cliente (mock em Zustand)
- Sprites/texturas: soldados e inimigos ainda são retângulos/círculos (placeholder)
- Sem servidor de validacao
- Sem mobile/touch
- Sem auditoria
- **Runtime não validado**: o jogo não foi executado no navegador nesta sessão

---

## 3. Proxima Tarefa Clara

1. **Validar runtime no navegador** — executar o jogo e confirmar que o ciclo completo funciona sem erros no console
2. **Implementar resgate de reféns para fase 1-5** — reféns que seguem o esquadrão, inimigos atiram nos reféns
3. **Implementar chefão General Gorila para fase 1-6** — veículo blindado que solta soldados, 3 hits de bazuca
4. **Substituir placeholders por sprites** — soldados, alvos, inimigos, lápide, minas
5. **Instalar ferramentas locais** e fazer `anchor test` + `anchor deploy --provider.cluster devnet`
6. **Integrar recompensa on-chain** no GameScene
7. **Mobile/touch**
8. **Auditoria de seguranca** antes do Mainnet

---

## 4. Economia do Token

- Supply: 500.000.000 $SQUAD (9 decimais)
- Pool de recompensas: 40% (200M)
- Staking obrigatorio para Mundo 3+ (100/250/500 SQUAD acumulado)
- Cooldown de 30 min entre replays
- Replay paga 10% do base
- Queima: renomear soldado, skins, taxas de torneio

---

## 5. Decisoes Tomadas

- **Solana sobre BSC**: Velocidade (~0.4s), custo (~$0.00001), Phantom UX
- **Rust + Anchor**: Framework nativo Solana
- **Phaser.js**: Engine 2D maduro, integra com React via refs
- **Zustand**: Estado leve, sincroniza Phaser + React
- **Mock rewards**: Saldo local em Zustand; mint real exige contrato deployado
- **Áudio procedural**: Web Audio API gera sons em runtime (sem assets binários)
- **Objetivo kill_then_extract**: Fase 1-2 requer matar todos os alvos ANTES de extrair
- **Alvos de treino como bullseye**: Visual distinto de inimigos reais
- **Lápide com nome**: Soldado morto vira cruz + nome no chão
- **Colisão de parede**: moveSquad com slide, tiros bloqueados por paredes (cobertura)
- **Minas visíveis**: Mounds marrons com luz vermelha piscante, 3 de dano ao pisar
- **Fogo inimigo bidirecional**: Inimigos soldado/elite atiram no soldado mais próximo
- **Cronograma de 10 fases**: Primeira versão terá 10 fases completas (até 2-4), não 30

---

## 6. Ideias Futuras (nao implementadas)

| Ideia | Beneficio | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retencao, social | Alto | Medio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Medio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Medio | Baixo | Backlog |
| DAO de governanca | Comunidade decide balanceamento | Baixo | Medio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Medio | Baixo | Backlog |
