# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-colisão de parede / cobertura)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** f7da09c — colisão de parede (cobertura real para fase 1-3)

**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real, vertical slice, fase implementada, placeholder e integração Solana.
**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4), não 30. As 30 configs atuais não são 30 fases completas.

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
| Validacao de assinatura do servidor | ✅ | ⚠️ Mockado (comentado no codigo) | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Auditoria de segurança | ✅ | ❌ | ❌ |

### Front-end (Next.js + Phaser) — Vertical Slice 1-2 + 1-3

| Item | Planejado (GDD) | Implementado (codigo) | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider (Phantom) | ✅ | ✅ | ✅ Build Next.js validado |
| HUD (saldo, vidas, fase, mundo, objetivo) | ✅ | ✅ | ⚠️ Não executado |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build Next.js validado |
| GameScene (tiro, inimigos, extracao) | ✅ | ✅ | ✅ Build Next.js validado |
| Tela de vitoria com estrelas, tempo, kills, vivos | ✅ | ✅ | ⚠️ Não executado |
| Tela de falha (esquadrão eliminado) | ✅ | ✅ | ⚠️ Não executado |
| Objetivo obrigatório (kill_then_extract) | ✅ | ✅ | ⚠️ Não executado |
| Alvos de treino (bullseye) distintos de inimigos | ✅ | ✅ (placeholder visual) | ⚠️ Não executado |
| Inimigos por tipo (target/soldier/elite) | ✅ | ✅ (placeholder visual) | ⚠️ Não executado |
| Barra de vida nos soldados | ✅ | ✅ | ⚠️ Não executado |
| Barra de vida nos inimigos | ✅ | ✅ | ⚠️ Não executado |
| Morte de soldado com lápide e sangue | ✅ | ✅ | ⚠️ Não executado |
| Fogo inimigo (inimigos atiram no esquadrão) | ✅ | ✅ (fireRate 2500/1800ms) | ⚠️ Não executado |
| **Colisão de parede (cobertura)** | ✅ | ✅ (moveSquad + shoot + enemyShoot) | ⚠️ Não executado |
| Áudio (shoot, hit, explosion, victory, soldierHit, soldierDeath) | ✅ | ✅ (Web Audio API procedural) | ⚠️ Não executado |
| 30 configs de fase no objeto PHASES | ✅ | ✅ (30 configs, 5 mundos) | ⚠️ Não executado |
| Integracao on-chain de recompensas | ✅ | ❌ (mock em Zustand) | ❌ |
| Sprites / texturas (ainda placeholders) | ✅ | ❌ (retângulos e círculos) | ❌ |
| Controles mobile/touch | ✅ | ❌ | ❌ |
| Mecânicas específicas 1-4 a 1-6 (minas, reféns, chefe) | ✅ | ❌ | ❌ |
| Mecânicas específicas 2-1 a 2-4 | ✅ | ❌ | ❌ |
| NFT marketplace | ✅ | ❌ | ❌ |
| Leaderboard on-chain | ✅ | ❌ | ❌ |
| Multiplayer / cooperativo | ✅ | ❌ | ❌ |

### Back-end (servidor de validacao)

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Servidor Node.js + TypeScript | ✅ | ❌ | ❌ |
| API REST + WebSocket | ✅ | ❌ | ❌ |
| PostgreSQL + Redis | ✅ | ❌ | ❌ |

---

## 2. O Que Existe de Verdade

### Arquivos de codigo confirmados no GitHub

```
squad-fall/
├── programs/squad-fall/src/lib.rs   ← 580 linhas Rust (token, rewards, staking, anti-farming)
├── tests/squad-fall.ts              ← 16 cenarios (NUNCA executados)
├── scripts/deploy.ts · Anchor.toml · Cargo.toml · package.json · install-windows.ps1

squad-fall-frontend/
├── src/
│   ├── app/ (layout.tsx, page.tsx, globals.css)
│   ├── components/ (WalletProvider.tsx, HUD.tsx)
│   ├── game/GameScene.ts            ← 714 linhas (vertical slice 1-2/1-3 + colisão + fogo inimigo)
│   └── store/useGameStore.ts
├── package.json · tsconfig.json · next.config.js · README.md · HANDOFF.md

docs/
├── CONTEXTO.md · GDD.md · GUIA-GENERICO.md · TRANSICAO-IMEDIATA.md
├── DEFINICAO-JOGO-REAL.md           ← Critérios de aceite
└── CRONOGRAMA.md                    ← 10 fases na primeira versão
```

### O que NAO existe

- Token $SQUAD nao esta na blockchain (codigo pronto, nunca deployado)
- Testes nunca foram executados (precisa de Anchor CLI local)
- Recompensas on-chain nao integradas ao cliente (saldo mockado em Zustand)
- Sprites/texturas: soldados e inimigos ainda são retângulos/círculos (placeholder)
- Sem servidor de validacao
- Sem mobile/touch
- Sem auditoria
- Mecânicas específicas de 1-4 a 1-6 e 2-1 a 2-4 não implementadas
- **Runtime da vertical slice não validado no navegador** (build validado, gameplay não)

### Estado da vertical slice 1-2 e 1-3 (segundo DEFINICAO-JOGO-REAL.md)

**Fase 1-2 (Tiro ao Alvo):** ciclo completo implementado — objetivo kill_then_extract, alvos bullseye, tiro, dano, morte, extração, vitória.

**Fase 1-3 (Floresta Silenciosa):** cobertura e colisão de parede agora funcionais — soldados não atravessam paredes (slide), tiros do jogador e inimigos bloqueados por paredes, inimigos atiram de volta.

**Placeholder ainda ativo:** soldados, alvos e inimigos são retângulos/círculos coloridos (não sprites).

**Runtime não validado:** o jogo não foi executado no navegador nesta sessão.

---

## 3. Proxima Tarefa Clara

1. **Validar runtime da vertical slice 1-2 e 1-3 no navegador** — executar o jogo e confirmar o ciclo completo + colisão sem erros no console
2. **Substituir placeholders por sprites** — soldados, alvos, inimigos, lápide (cronograma v0.5)
3. **Implementar mecânica de minas para fase 1-4** (Não Me Pise!)
4. **Implementar mecânica de reféns para fase 1-5** (Resgate na Selva)
5. **Implementar chefão para fase 1-6** (General Gorila)
6. **Implementar mecânicas 2-1 a 2-4** (deserto, comboio, oásis, torres)
7. **Instalar ferramentas locais** e fazer `anchor test` + `anchor deploy --provider.cluster devnet`
8. **Integrar recompensa on-chain** no GameScene
9. **Mobile/touch**
10. **Auditoria de seguranca** antes do Mainnet

---

## 4. Economia do Token

- Supply: 500.000.000 $SQUAD (9 decimais)
- Pool de recompensas: 40% (200M)
- Staking obrigatorio para Mundo 3+ (100/250/500 SQUAD acumulado)
- Cooldown de 30 min entre replays; replay paga 10% do base
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
- **Fogo inimigo bidirecional**: Inimigos soldado/elite atiram no soldado vivo mais próximo (fireRate 2500/1800ms, alcance 10 tiles)
- **Colisão de parede (slide)**: Soldados deslizam ao longo de paredes; tiros do jogador e inimigos bloqueados por paredes — cobertura tática real

---

## 6. Ideias Futuras (nao implementadas)

| Ideia | Beneficio | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retencao, social | Alto | Medio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Medio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Medio | Baixo | Backlog |
| DAO de governanca | Comunidade decide balanceamento | Baixo | Medio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Medio | Baixo | Backlog |
