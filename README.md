# Squad Fall

P2E tactical top-down shooter on Solana. Complete missions across 5 worlds (30 phases), earn $SQUAD tokens via Phantom Wallet.

## Repositório

https://github.com/0073dls0093-lgtm/squadfall

## Estrutura

```
squad-fall/              # Smart contract (Rust + Anchor)
squad-fall-frontend/     # Jogo (Next.js + Phaser.js)
docs/                    # Documentacao para IAs futuras
```

## Documentacao

- `docs/CONTEXTO.md` — Estado factual do projeto (planejado vs implementado)
- `docs/GDD.md` — Game Design Document completo
- `docs/GUIA-GENERICO.md` — Regras de continuidade entre IAs
- `docs/TRANSICAO-IMEDIATA.md` — Instrucoes de checkpoint
- `squad-fall-frontend/README.md` — Como instalar e rodar
- `squad-fall-frontend/HANDOFF.md` — Estado atual e proxima tarefa

## Como comecar (proxima IA)

1. Leia `docs/CONTEXTO.md` primeiro
2. Leia `docs/GDD.md` para a visao completa
3. Leia `squad-fall-frontend/README.md` para instalar e rodar
4. Verifique `squad-fall/programs/squad-fall/src/lib.rs` (contrato) e `squad-fall-frontend/src/game/GameScene.ts` (motor do jogo)

## Stack

- Blockchain: Solana (Devnet)
- Token: $SQUAD (SPL Token, 500M supply)
- Smart Contract: Rust + Anchor 0.30
- Front-end: Next.js 14 + Phaser.js 3.80
- Wallet: Phantom
- Estado: Zustand

## Licenca

Proprietary — Squad Fall. All rights reserved.