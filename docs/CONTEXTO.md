# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (commit 08e4552)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

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
| Tela de vitoria com estrelas + kills | ✅ | ✅ | ⚠️ Não executado |
| 30 fases no objeto PHASES | ✅ | ✅ (30/30) | ⚠️ Não executado |
| Integracao on-chain de recompensas | ✅ | ❌ (mock em Zustand) | ❌ |
| Sprites / audio / FX | ✅ | ❌ (retângulos coloridos) | ❌ |
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
│   │   └── GameScene.ts            ← Phaser — 30 fases (5 mundos × 6), movimento, tiro, inimigos, extracao, vitoria
│   └── store/
│       └── useGameStore.ts         ← Zustand (estado global)
├── package.json
├── tsconfig.json
├── next.config.js
├── README.md
└── HANDOFF.md
```

### O que NAO existe

- Token $SQUAD nao esta na blockchain (codigo pronto, nunca deployado)
- Testes nunca foram executados (precisa de Anchor CLI local)
- Recompensas on-chain nao integradas ao cliente (saldo mockado em Zustand)
- Sem sprites, audio, FX (tudo retângulo colorido)
- Sem servidor de validacao
- Sem mobile/touch
- Sem auditoria

### Verificação técnica recente

- O build inicial falhou por import incompatível do Phaser (`default export`) e conflito JSX dos providers Solana.
- Correções aplicadas: import namespace do Phaser, carregamento dinâmico do Phaser no navegador para evitar `window` no SSR e compatibilidade de tipos nos providers.
- `npm run build` aprovado em 03/09/2026; páginas `/` e `/_not-found` foram prerenderizadas.
- `docs/GUIA-GENERICO.md`, `docs/TRANSICAO-IMEDIATA.md` e `squad-fall-frontend/HANDOFF.md` agora determinam que a IA principal continue sem delegar ao usuário, trabalhe por partes e faça `git push` imediatamente após cada tarefa concluída.
- **08/09 commit `08e4552`**: objeto PHASES expandido de 3 para 30 fases (5 mundos × 6). Nomes, timeTarget, enemyCount, extraction por fase conforme GDD. Inimigos via LCG determinístico (mesmo seed = mesmo layout). Padrões de parede por mundo (cor + arranjo) para variedade visual. HUD mostra nome do mundo + staking para Mundos 3+. Tela de vitória com kills e jogo-completo na fase 30.

---

## 3. Proxima Tarefa Clara

1. **Instalar ferramentas locais** (Solana CLI, Anchor CLI, Node.js) — ver `squad-fall-frontend/README.md`
2. **`anchor test`** em `squad-fall/` para validar os 16 cenarios
3. **`anchor deploy --provider.cluster devnet`** para subir o contrato e criar o token $SQUAD de verdade
4. **Integrar recompensa on-chain no GameScene**: apos `phaseComplete()`, enviar payload ao servidor de validacao, receber prova assinada, chamar `program.methods.completePhase(...)` via `@coral-xyz/anchor` no front-end
5. **Adicionar sprites, audio, FX** (GameScene ainda usa retângulos)
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
- **LCG deterministico para inimigos**: Mesmo seed gera mesmo layout — reproducibilidade para teste/audit e dificuldade previsivel

---

## 6. Ideias Futuras (nao implementadas)

| Ideia | Beneficio | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retencao, social | Alto (servidor de jogo) | Medio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Medio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Medio | Baixo | Backlog |
| DAO de governanca | Comunidade decide balanceamento | Baixo | Medio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Medio | Baixo | Backlog |
