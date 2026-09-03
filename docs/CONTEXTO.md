# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-fogo inimigo)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** 0315bb9 — fogo inimigo bidirecional

**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real.
**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4), não 30.

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
| Validacao de assinatura do servidor | ✅ | ⚠️ Mockado (comentado) | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Deploy na Mainnet | ✅ | ❌ | ❌ |
| Auditoria de seguranca | ✅ | ❌ | ❌ |

### Front-end (Next.js + Phaser) — Vertical Slice 1-2

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider (Phantom) | ✅ | ✅ | ✅ Build validado |
| HUD (saldo, vidas, fase, mundo, objetivo) | ✅ | ✅ | ⚠️ Nao executado |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build validado |
| GameScene (tiro, inimigos, extracao) | ✅ | ✅ | ✅ Build validado |
| Tela de vitoria com estrelas, tempo, kills, vivos | ✅ | ✅ | ⚠️ Nao executado |
| Tela de falha (esquadrão eliminado) | ✅ | ✅ | ⚠️ Nao executado |
| Objetivo obrigatório (kill_then_extract) | ✅ | ✅ | ⚠️ Nao executado |
| Alvos de treino (bullseye) distintos de inimigos | ✅ | ✅ (placeholder visual) | ⚠️ Nao executado |
| Inimigos por tipo (target/soldier/elite) | ✅ | ✅ (placeholder visual) | ⚠️ Nao executado |
| Barra de vida nos soldados | ✅ | ✅ | ⚠️ Nao executado |
| Barra de vida nos inimigos | ✅ | ✅ | ⚠️ Nao executado |
| Morte de soldado com lápide e sangue | ✅ | ✅ | ⚠️ Nao executado |
| **Fogo inimigo bidirecional** | ✅ | ✅ (enemyShoot + damageSoldier) | ⚠️ Nao executado |
| Áudio (shoot, hit, explosion, victory, soldierHit, soldierDeath) | ✅ | ✅ (Web Audio API) | ⚠️ Nao executado |
| 30 configs de fase no objeto PHASES | ✅ | ✅ (30 configs, 5 mundos) | ⚠️ Nao executado |
| **10 fases completas (cronograma)** | ✅ | ❌ (configs, nao fases completas) | ❌ |
| Integracao on-chain de recompensas | ✅ | ❌ (mock em Zustand) | ❌ |
| Sprites / texturas (ainda placeholders) | ✅ | ❌ (retângulos e círculos) | ❌ |
| Controles mobile/touch | ✅ | ❌ | ❌ |
| Mecânicas específicas das fases 1-3 a 1-6 | ✅ | ❌ | ❌ |
| NFT marketplace | ✅ | ❌ | ❌ |
| Leaderboard on-chain | ✅ | ❌ | ❌ |

### Back-end (servidor de validacao)

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Servidor Node.js + TypeScript | ✅ | ❌ | ❌ |
| API REST + WebSocket | ✅ | ❌ | ❌ |
| PostgreSQL (perfis, pontuacoes) | ✅ | ❌ | ❌ |
| Redis (sessoes, cooldowns) | ✅ | ❌ | ❌ |

---

## 2. O Que Existe de Verdade

### Arquivos de codigo confirmados no GitHub

```
squad-fall/
├── programs/squad-fall/src/lib.rs   ← 580 linhas Rust (token, rewards, staking, anti-farming)
├── tests/squad-fall.ts              ← 16 cenarios de teste (NUNCA executados)
├── scripts/deploy.ts                ← Script de deploy Devnet
├── Anchor.toml · Cargo.toml · package.json · install-windows.ps1

squad-fall-frontend/
├── src/
│   ├── app/ (layout.tsx, page.tsx, globals.css)
│   ├── components/ (WalletProvider.tsx, HUD.tsx)
│   ├── game/GameScene.ts            ← 694 linhas (vertical slice 1-2 + fogo inimigo + 30 configs)
│   └── store/useGameStore.ts
├── package.json · tsconfig.json · next.config.js
├── README.md · HANDOFF.md

docs/
├── CONTEXTO.md · GDD.md · GUIA-GENERICO.md · TRANSICAO-IMEDIATA.md
├── DEFINICAO-JOGO-REAL.md           ← Critérios de aceite
└── CRONOGRAMA.md                    ← Primeira versão: 10 fases completas
```

### O que NAO existe

- Token $SQUAD nao esta na blockchain (codigo pronto, nunca deployado)
- Testes nunca foram executados (precisa de Anchor CLI local)
- Recompensas on-chain nao integradas ao cliente (saldo mockado em Zustand)
- Sprites/texturas: soldados e inimigos ainda são retângulos/círculos (placeholder)
- **Runtime nao validado**: o jogo não foi executado no navegador nesta sessão
- Sem servidor de validacao
- Sem mobile/touch
- Sem auditoria
- **Mecânicas específicas das fases 1-3 a 1-6 nao implementadas** (floresta, minas, reféns, chefe)
- **As 30 configs nao sao 30 fases completas** — sao configurações (CRONOGRAMA: meta é 10 completas)

### Estado da vertical slice 1-2 (segundo DEFINICAO-JOGO-REAL.md)

O GameScene implementa o ciclo real de jogo da fase 1-2:
1. ✅ Entrar na missão
2. ✅ Visualizar esquadrão (4 soldados com nome, capacete, arma) e alvos (bullseye)
3. ✅ Movimentar esquadrão (WASD + clique)
4. ✅ Mirar e disparar rifle (clique direito → bullet + muzzle flash + audio.shoot)
5. ✅ Acertar alvos e produzir dano (hitEnemy → hp-- → flash branco + audio.hit)
6. ✅ Eliminar os oito alvos (audio.explosion + partículas + ring effect)
7. ✅ Receber feedback visual e sonoro
8. ✅ Alcançar extração (após objetivo completo → extractionActive → phaseComplete)
9. ✅ Receber estrelas, tempo, kills e sobreviventes (tela de vitória)
10. ✅ Voltar ao menu e identificar próxima fase (M → menu, ENTER/N → nextPhase)

**Fogo inimigo (commit 0315bb9):** inimigos soldado/elite atiram no soldado vivo mais próximo. fireRate: soldier 2500ms, elite 1800ms. Alcance: 10 tiles. damageSoldier() é chamado por IA inimiga. Tela de falha agora é acionável.

**Placeholder ainda ativo:** soldados, alvos e inimigos são retângulos/círculos coloridos (não sprites).

**Runtime não validado:** o jogo não foi executado no navegador nesta sessão.

---

## 3. Proxima Tarefa Clara

1. **Validar runtime da vertical slice 1-2 no navegador** — executar o jogo e confirmar que o ciclo completo funciona sem erros no console
2. **Substituir placeholders por sprites** — soldados, alvos, inimigos, lápide
3. **Implementar mecânicas específicas das fases 1-3 a 1-6** (floresta com cobertura, minas, resgate de reféns, chefão)
4. **Instalar ferramentas locais** e fazer `anchor test` + `anchor deploy --provider.cluster devnet`
5. **Integrar recompensa on-chain** no GameScene
6. **Mobile/touch**
7. **Auditoria de seguranca** antes do Mainnet

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
- **Fogo inimigo bidirecional**: Inimigos soldado/elite atiram de volta; alvos de treino não atiram
- **Cronograma oficial**: 10 fases completas na primeira versão, nao 30

---

## 6. Ideias Futuras (nao implementadas)

| Ideia | Beneficio | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retencao, social | Alto | Medio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Medio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Medio | Baixo | Backlog |
| DAO de governanca | Comunidade decide balanceamento | Baixo | Medio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Medio | Baixo | Backlog |
