# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-áudio)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** d939b86 — audio procedural no GameScene

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

### Front-end (Next.js + Phaser)

| Item | Planejado (GDD) | Implementado (codigo) | Testado |
|------|:---:|:---:|:---:|
| Layout + WalletProvider (Phantom) | ✅ | ✅ | ✅ Build Next.js validado |
| HUD (saldo, vidas, fase, mundo) | ✅ | ✅ | ⚠️ Não executado |
| GameScene (movimento WASD + clique) | ✅ | ✅ | ✅ Build Next.js validado |
| GameScene (tiro, inimigos, extracao) | ✅ | ✅ | ✅ Build Next.js validado |
| Tela de vitoria com estrelas | ✅ | ✅ | ⚠️ Não executado |
| Integracao on-chain de recompensas | ✅ | ❌ (mock em Zustand) | ❌ |
| 30 fases no objeto PHASES | ✅ | ✅ (30 fases, 5 mundos) | ⚠️ Não executado |
| Áudio (shoot, hit, explosion, victory) | ✅ | ✅ (Web Audio API procedural) | ⚠️ Não executado |
| Sprites / texturas (ainda retângulos) | ✅ | ❌ (retângulos coloridos) | ❌ |
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
├── Anchor.toml
├── Cargo.toml
├── package.json
└── install-windows.ps1

squad-fall-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Layout + WalletProvider + HUD
│   │   ├── page.tsx                ← Menu / jogo / vitoria
│   │   └── globals.css
│   ├── components/
│   │   ├── WalletProvider.tsx      ← Phantom + Solana wallet adapter
│   │   └── HUD.tsx                  ← Overlay (saldo, vidas, fase)
│   ├── game/
│   │   └── GameScene.ts            ← Phaser (30 fases, movimento, tiro, inimigos, extracao, vitoria, AUDIO PROCEDURAL)
│   └── store/
│       └── useGameStore.ts         ← Zustand (estado global)
├── package.json
├── tsconfig.json
├── next.config.js
├── README.md
└── HANDOFF.md

docs/
├── CONTEXTO.md          ← Este arquivo
├── GDD.md               ← Game Design Document completo
├── GUIA-GENERICO.md     ← Regras de continuidade entre IAs
└── TRANSICAO-IMEDIATA.md ← Instrucoes de checkpoint
```

### O que NAO existe

- Token $SQUAD nao esta na blockchain (codigo pronto, nunca deployado)
- Testes nunca foram executados (precisa de Anchor CLI local)
- Recompensas on-chain nao integradas ao cliente (saldo mockado em Zustand)
- Sem sprites/texturas (tudo retângulo colorido)
- Sem servidor de validacao
- Sem mobile/touch
- Sem auditoria

### Verificação técnica recente

- O build inicial falhou por import incompatível do Phaser (`default export`) e conflito JSX dos providers Solana.
- Correções aplicadas: import namespace do Phaser, carregamento dinâmico do Phaser no navegador para evitar `window` no SSR e compatibilidade de tipos nos providers.
- `npm run build` aprovado em 03/09/2026; páginas `/` e `/_not-found` foram prerenderizadas.
- **30 fases** implementadas no objeto `PHASES` do GameScene (commit 08e4552). Nomes, timeTarget, enemyCount e extração por fase conforme GDD. Inimigos posicionados via LCG determinístico.
- **Áudio procedural** adicionado (commit d939b86): classe AudioFX usando Web Audio API — shoot, hit, explosion e victory. Sem assets binários.
- `docs/GUIA-GENERICO.md`, `docs/TRANSICAO-IMEDIATA.md` e `squad-fall-frontend/HANDOFF.md` determinam que a IA principal continue sem delegar ao usuário, trabalhe por partes e faça `git push` imediatamente após cada tarefa concluída.
- Documento `docs/DEFINICAO-JOGO-REAL.md` criado com critérios de aceite: build não equivale a runtime, configuração não equivale a fase completa, e a vertical slice 1-2 deve ser validada no navegador antes da expansão superficial.

---

## 3. Proxima Tarefa Clara

1. **Instalar ferramentas locais** (Solana CLI, Anchor CLI, Node.js) — ver `squad-fall-frontend/README.md`
2. **`anchor test`** em `squad-fall/` para validar os 16 cenarios
3. **`anchor deploy --provider.cluster devnet`** para subir o contrato e criar o token $SQUAD de verdade
4. **Integrar recompensa on-chain no GameScene**: apos `phaseComplete()`, enviar payload ao servidor de validacao, receber prova assinada, chamar `program.methods.completePhase(...)` via `@coral-xyz/anchor` no front-end
5. **Adicionar sprites/texturas** ao GameScene para substituir retângulos coloridos
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

- **Solana sobre BSC**: Velocidade (~0.4s), custo (~$0.00001), Phantom UX, ecossistema gaming (MagicBlock, Sonic SVM)
- **Rust + Anchor**: Framework nativo Solana, curva mais ingreme mas melhor tooling para SPL tokens
- **Phaser.js**: Engine 2D maduro, integra com React via refs
- **Zustand**: Estado leve, sincroniza Phaser + React sem overhead de Redux
- **Mock rewards**: Jogo atualiza saldo local em Zustand; mint real exige contrato deployado + servidor de assinatura
- **Áudio procedural**: Web Audio API gera sons em runtime (sem assets binários) — shoot, hit, explosion, victory

---

## 6. Ideias Futuras (nao implementadas)

| Ideia | Beneficio | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retencao, social | Alto (servidor de jogo) | Medio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Medio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Medio | Baixo | Backlog |
| DAO de governanca | Comunidade decide balanceamento | Baixo | Medio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Medio | Baixo | Backlog |
