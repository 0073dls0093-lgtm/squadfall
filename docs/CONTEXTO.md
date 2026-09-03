# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-áudio)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** d939b86 — audio procedural no GameScene

**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real, vertical slice, fase implementada, placeholder e integração Solana.

**Cronograma oficial:** `docs/CRONOGRAMA.md` define a primeira versão com 10 fases completas e a expansão posterior das fases 11–30.

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
- Documento `docs/CRONOGRAMA.md` criado: a versão 1.0 terá 10 fases completas; as fases 11–30 serão atualizações posteriores.

---

## 3. Proxima Tarefa Clara

1. **Completar a vertical slice real da fase 1-2** — ver `docs/DEFINICAO-JOGO-REAL.md` e `docs/CRONOGRAMA.md`
2. **Implementar e testar as mecânicas específicas das fases 1-1 e 1-3**
3. **Implementar fases 1-4 a 1-6**, incluindo minas, detector, reféns, chefe e veículo
4. **Implementar e testar as fases 2-1 a 2-4** para fechar as 10 fases da versão 1.0
5. **Adicionar sprites/texturas, mobile/touch e refinamentos de áudio/FX**
6. **Instalar ferramentas locais e executar `anchor test`** em `squad-fall/`
7. **Publicar na Devnet e integrar recompensas/compras on-chain** somente após servidor de validação e revisão de segurança

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
