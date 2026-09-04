# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-revisão de segurança)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** 6747f5e — 7 correções de segurança no lib.rs

**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4).
**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md` define o que conta como jogo real.

---

## 1. Revisão de Segurança (2026-09-03)

### Corrigido (código)

| # | Vulnerabilidade | Correção | Commit |
|---|---|---|---|
| 1 | `complete_phase` aceitava `server_signature` e ignorava — qualquer jogador podia mintar recompensas | `server_authority: Signer` obrigatório + `require!(server_authority == game_state.authority)` | 6747f5e |
| 2 | `time_seconds`, `kills`, `soldiers_alive` sem validação | `require!(time_seconds >= 1 && <= 3600)`, `kills <= 100`, `soldiers_alive <= 4` | 6747f5e |
| 3 | `total_rewards_claimed` não verificava `REWARD_POOL_TOTAL` | `require!(new_total <= REWARD_POOL_TOTAL)` antes do `mint_to` | 6747f5e |
| 4 | `last_replay_at` = 0 no first completion — primeira repetição ignorava cooldown | `phase.last_replay_at = clock.unix_timestamp` no first completion | 6747f5e |
| 5 | `player_token_account` era `AccountInfo` sem constraints | `Account<TokenAccount>` + `constraint owner == player.key()` + `constraint mint == game_state.squad_mint` | 6747f5e |
| 6 | `stake_account` não verificava `owner == player` em unstake/withdraw | `constraint = stake_account.owner == player.key()` em `RequestUnstake` e `WithdrawUnstaked` | 6747f5e |
| 7 | `stake_tokens` aceitava `amount = 0` | `require!(amount > 0)` | 6747f5e |

### Mudança de arquitetura

**`complete_phase` agora requer `server_authority: Signer`** — o servidor deve co-assinar cada transação de recompensa. Sem isso, o jogador não pode mintar tokens. Isso muda o fluxo: o servidor off-chain valida o resultado da fase e co-assina a transação on-chain.

- Benefício: impede mint de recompensas sem autenticação do servidor
- Custo: servidor precisa estar online para resgates
- Risco: se servidor cair, jogadores não resgatam (aceitável para P2E)
- Alternativa: verificação ed25519 on-chain (mais complexa, mesma segurança)

### Testado

- ❌ `anchor test` não executado — requer Anchor CLI + Solana CLI instalados localmente
- O contrato não foi compilado nem testado em Devnet nesta sessão
- Os testes existentes (`squad-fall.ts`) precisam ser atualizados para incluir `server_authority` como Signer adicional

### Planejado/bloqueado

- Atualizar `squad-fall/tests/squad-fall.ts` para incluir `server_authority` em todos os testes de `complete_phase`
- Executar `anchor test` localmente após instalar as ferramentas
- Executar `anchor deploy --provider.cluster devnet` e testar em runtime
- Não fazer deploy em Mainnet antes de auditoria externa

---

## 2. Estado Factual do Projeto

### Smart Contract (Anchor Program)

| Item | Planejado | Implementado | Testado |
|------|:---:|:---:|:---:|
| Token $SQUAD (SPL) | ✅ | ✅ | ❌ |
| Programa de recompensas | ✅ | ✅ (com server_authority) | ❌ |
| Staking (Mundo 3+) | ✅ | ✅ | ❌ |
| Anti-farming (cooldown, daily limit) | ✅ | ✅ | ❌ |
| Validação de parâmetros | ✅ | ✅ (time, kills, soldiers) | ❌ |
| Reward pool limit | ✅ | ✅ (REWARD_POOL_TOTAL) | ❌ |
| Constraints de contas (owner, mint, PDA) | ✅ | ✅ | ❌ |
| Server co-signer | ✅ | ✅ (server_authority: Signer) | ❌ |
| Deploy na Devnet | ✅ | ❌ | ❌ |
| Auditoria externa | ✅ | ❌ | ❌ |

### Front-end (Next.js + Phaser)

| Item | Implementado | Testado |
|------|:---:|:---:|
| GameScene (movimento, tiro, extração) | ✅ | ⚠️ Build OK, runtime não validado |
| Fase 1-1 (extração) | ✅ | ❌ |
| Fase 1-2 (tiro ao alvo) | ✅ | ❌ |
| Fase 1-3 (cobertura/colisão) | ✅ | ❌ |
| Fase 1-4 (minas) | ✅ | ❌ |
| Fase 1-5 (reféns rescue_then_extract) | ✅ | ❌ |
| Fase 1-6 (boss General Gorila) | ❌ (pendente) | ❌ |
| Fogo inimigo bidirecional | ✅ | ❌ |
| Áudio procedural | ✅ | ❌ |
| 30 configs de fase | ✅ | ⚠️ |
| Sprites/texturas | ❌ (placeholders) | ❌ |
| Mobile/touch | ❌ | ❌ |
| Integração on-chain | ❌ (mock Zustand) | ❌ |

---

## 3. Próxima Tarefa Clara

1. **Atualizar testes** para incluir `server_authority` como Signer em `complete_phase`
2. **Executar `anchor test`** localmente após instalar Solana CLI + Anchor CLI
3. **Deploy na Devnet** e testar em runtime
4. **Implementar boss General Gorila** (fase 1-6) — sincronizar versão local com GitHub
5. **Validar runtime** das fases 1-1 a 1-6 no navegador
6. **Implementar fases 2-1 a 2-4** (Mundo 2) para fechar v1.0 com 10 fases
7. **Substituir placeholders por sprites**
8. **Mobile/touch**

---

## 4. Economia do Token

- Supply: 500.000.000 $SQUAD (9 decimais)
- Pool de recompensas: 40% (200M) — enforce on-chain
- Staking obrigatório para Mundo 3+ (100/250/500 SQUAD)
- Cooldown de 30 min entre replays (respeitado desde o first completion)
- Replay paga 10% do base
- Queima: renomear soldado, skins, taxas de torneio

---

## 5. Decisões Tomadas

- **Solana sobre BSC**: Velocidade, custo, Phantom UX
- **Rust + Anchor**: Framework nativo Solana
- **Phaser.js**: Engine 2D maduro
- **Zustand**: Estado leve
- **Mock rewards**: Saldo local; mint real exige contrato deployado + server co-signer
- **Áudio procedural**: Web Audio API
- **Server co-signer**: `complete_phase` requer `server_authority: Signer` — servidor valida resultado off-chain e co-assina
- **Cronograma de 10 fases**: Primeira versão terá 10 fases completas
- **Constraints rigorosas**: player_token_account, squad_mint, stake_vault com verificação de owner, mint e PDA seeds

---

## 6. Ideias Futuras (não implementadas)

| Ideia | Benefício | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo | Retenção | Alto | Médio | Backlog |
| Torneios PvP | Competitividade | Médio | Baixo | Backlog |
| Solana Mobile | Touch UI | Médio | Baixo | Backlog |
| DAO de governança | Comunidade | Baixo | Médio | Backlog |
| NFT marketplace | Receita | Médio | Baixo | Backlog |
