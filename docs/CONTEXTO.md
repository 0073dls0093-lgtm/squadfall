# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-vertical slice 1-2)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** 02b5b63 — vertical slice real da fase 1-2

**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real, vertical slice, fase implementada, placeholder e integração Solana.

---

## 1. Estado Factual do Projeto

> Regra: NÃO declarar como concluido algo que apenas esta no GDD.
> Separar planejamento, implementação, testes e hipoteses.

### Smart Contract (Anchor Program)

| Item | Planejado (GDD) | Implementado (codigo) | Testado |
|------|:---:|:---:|:---:|
| Token $SQUAD (SPL, 9 decimais, 500M supply) | ✅ | ✅ (`lib.rs`) | ❌ |
| Programa de recompensas por fase | ✅ | ✅ (`complete_phase`) | ❌ |
| Staking (Mundo 3+) | ✅ | ✅ (`stake_tokens`, `request_unstake`, `withdraw_unstaked`) | ❌ |
| Anti-farming (cooldown 30min, limite diario 50) | ✅ | ✅ | ❌ |
| Validacao de assinatura do servidor | ✅ | ⚠️ Mockado (comentado no codigo) | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Deploy na Mainnet | ✅ | ❌ | ❌ |
| Auditoria de segurança | ✅ | ❌ | ❌ |

### Front-end (Next.js + Phaser) — Vertical Slice 1-2

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
| damageSoldier() (pronto para fogo inimigo) | ✅ | ✅ | ❌ (sem fogo inimigo ainda) |
| Áudio (shoot, hit, explosion, victory, soldierHit, soldierDeath) | ✅ | ✅ (Web Audio API procedural) | ⚠️ Não executado |
| 30 fases no objeto PHASES | ✅ | ✅ (30 configs, 5 mundos) | ⚠️ Não executado |
| Integracao on-chain de recompensas | ✅ | ❌ (mock em Zustand) | ❌ |
| Sprites / texturas (ainda placeholders) | ✅ | ❌ (retângulos e círculos) | ❌ |
| Controles mobile/touch | ✅ | ❌ | ❌ |
| NFT marketplace | ✅ | ❌ | ❌ |
| Leaderboard on-chain | ✅ | ❌ | ❌ |
| Multiplayer / cooperativo | ✅ | ❌ | ❌ |

### Back-end (servidor de validacao)

| Item | Planejado (GDD) | Implementado | Testado |
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
│   ├── game/GameScene.ts            ← 652 linhas (vertical slice 1-2 + 30 configs)
│   └── store/useGameStore.ts
├── package.json · tsconfig.json · next.config.js
├── README.md · HANDOFF.md

docs/
├── CONTEXTO.md · GDD.md · GUIA-GENERICO.md · TRANSICAO-IMEDIATA.md
└── DEFINICAO-JOGO-REAL.md           ← Critérios de aceite
```

### O que NAO existe

- Token $SQUAD nao esta na blockchain (codigo pronto, nunca deployado)
- Testes nunca foram executados (precisa de Anchor CLI local)
- Recompensas on-chain nao integradas ao cliente (saldo mockado em Zustand)
- Sprites/texturas: soldados e inimigos ainda são retângulos/círculos (placeholder)
- Sem fogo inimigo (damageSoldier existe mas não é chamado por IA inimiga)
- Sem servidor de validacao
- Sem mobile/touch
- Sem auditoria

### Estado da vertical slice 1-2 (segundo DEFINICAO-JOGO-REAL.md)

O GameScene agora implementa o ciclo real de jogo da fase 1-2:
1. ✅ Entrar na missão (page.tsx → startGame → GameScene init)
2. ✅ Visualizar esquadrão (4 soldados com nome, capacete, arma) e alvos (bullseye)
3. ✅ Movimentar esquadrão (WASD + clique)
4. ✅ Mirar e disparar rifle (clique direito → bullet + muzzle flash + audio.shoot)
5. ✅ Acertar alvos e produzir dano (hitEnemy → hp-- → flash branco + audio.hit)
6. ✅ Eliminar os oito alvos (audio.explosion + partículas + ring effect)
7. ✅ Receber feedback visual e sonoro
8. ✅ Alcançar extração (após objetivo completo → extractionActive → phaseComplete)
9. ✅ Receber estrelas, tempo, kills e sobreviventes (tela de vitória)
10. ✅ Voltar ao menu e identificar próxima fase (M → menu, ENTER/N → nextPhase)

**Placeholder ainda ativo:** soldados, alvos e inimigos são retângulos/círculos coloridos (não sprites).

**Runtime não validado:** o jogo não foi executado no navegador nesta sessão. O build Next.js foi validado anteriormente, mas a execução com a nova lógica de objetivo/extração/morte não foi testada em runtime.

---

## 3. Proxima Tarefa Clara

1. **Validar runtime da vertical slice 1-2 no navegador** — executar o jogo e confirmar que o ciclo completo funciona sem erros no console
2. **Adicionar fogo inimigo** — inimigos soldado/elite atiram no esquadrão, chamando damageSoldier() — necessário para a tela de falha ser acionável
3. **Substituir placeholders por sprites** — soldados, alvos, inimigos, lápide
4. **Implementar mecânicas específicas das fases 1-3 a 1-6** (floresta com cobertura, minas, resgate de reféns, chefão)
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
- **Objetivo kill_then_extract**: Fase 1-2 requer matar todos os alvos ANTES de extrair — não basta chegar à extração
- **Alvos de treino como bullseye**: Visual distinto de inimigos reais, homenagem ao Cannon Fodder
- **Lápide com nome**: Soldado morto vira cruz + nome no chão, permanece pelo resto da fase

---

## 6. Ideias Futuras (nao implementadas)

| Ideia | Beneficio | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retencao, social | Alto | Medio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Medio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Medio | Baixo | Backlog |
| DAO de governanca | Comunidade decide | Baixo | Medio | Backlog |
| Skin NFT marketplace | Receita, utilidade | Medio | Baixo | Backlog |
