# CONTEXTO — Squad Fall

**Ultima atualização:** 2026-09-03 (pós-revisão de segurança round 2)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit:** 2597161 — testes de segurança atualizados

**Cronograma oficial:** `docs/CRONOGRAMA.md` — primeira versão terá 10 fases completas (até 2-4).
**Critério oficial de produto:** `docs/DEFINICAO-JOGO-REAL.md`

---

## 1. Estado Factual — Revisão de Segurança do Contrato

### Correções implementadas no `lib.rs` (commits f9eadb7, 6747f5e)

| # | Vulnerabilidade | Correção | Status |
|---|---|---|:---:|
| 1 | `server_signature` recebida e ignorada | Removida. `server_authority: Signer` obrigatório em `complete_phase` — servidor co-assina | ✅ Código |
| 2 | Sem validação de `time_seconds`, `kills`, `soldiers_alive` | Adicionado: time 1..3600, kills ≤100, soldiers ≤4 | ✅ Código |
| 3 | Sem enforce de `REWARD_POOL_TOTAL` | `require!(new_total <= REWARD_POOL_TOTAL, RewardPoolExhausted)` antes do mint | ✅ Código |
| 4 | Cooldown da primeira repetição não respeitado | `last_replay_at` inicializado no first completion | ✅ Código |
| 5 | `player_token_account` sem constraint de owner/mint | `constraint = owner == player.key()` e `mint == game_state.squad_mint` | ✅ Código |
| 6 | `squad_mint` sem constraint | `constraint = squad_mint.key() == game_state.squad_mint` | ✅ Código |
| 7 | `stake_vault` sem PDA seeds nem mint constraint | `seeds = [b"stake-vault", stake_account.key()]` + `stake_vault.mint == game_state.squad_mint` | ✅ Código |
| 8 | `stake_account.owner` não verificado | `constraint = stake_account.owner == player.key()` em RequestUnstake e WithdrawUnstaked | ✅ Código |
| 9 | `amount = 0` em stake_tokens | `require!(amount > 0, InvalidAmount)` | ✅ Código |
| 10 | Seeds do CPI `mint_to` usavam `game_state.key().to_bytes()` | Corrigido para `[b"game-state", &[bump]]` (canônico, sem redundância) | ✅ Código |
| 11 | `initialize_game` não verificava mint authority | Adicionado: `squad_mint.mint_authority == game_state.key()` | ✅ Código |
| 12 | `stake_vault` no `StakeTokens` sem `squad_mint` e `game_state` | `squad_mint` e `game_state` adicionados como contas com constraints | ✅ Código |

### Testes (commit 2597161)

| Teste | Tipo | Status |
|---|---|:---:|
| Completa fase 1-1 com server co-signing | Positivo | ❌ Não executado |
| Autoridade errada rejeitada | Negativo | ❌ Não executado |
| Replay antes do cooldown rejeitado | Negativo | ❌ Não executado |
| Phase ID 0 rejeitado | Negativo | ❌ Não executado |
| Stars 4 rejeitado | Negativo | ❌ Não executado |
| time_seconds 0 rejeitado | Negativo | ❌ Não executado |
| kills 101 rejeitado | Negativo | ❌ Não executado |
| soldiers_alive 5 rejeitado | Negativo | ❌ Não executado |
| Mint errado rejeitado | Negativo | ❌ Não executado |
| Withdraw antes do unlock rejeitado | Negativo | ❌ Não executado |

### Bloqueio real

`anchor test` **não foi executado**. Requer:
- Anchor CLI (`anchor-cli` 0.30+)
- Solana CLI (v1.18+)
- Rust toolchain
- Node.js 20+

Nenhuma dessas ferramentas está disponível neste ambiente. Os testes estão escritos e atualizados, mas **não podem ser declarados como aprovados**.

---

## 2. Próxima Tarefa Clara

1. **Instalar Anchor CLI + Solana CLI localmente** e executar `anchor test` — confirmar que os 10 cenários de teste passam
2. Se algum teste falhar, corrigir o `lib.rs` e re-testar
3. Após testes aprovados, a revisão de segurança está concluída
4. Continuar com as mecânicas de gameplay (boss General Gorila na fase 1-6)

---

## 3. Decisões de Arquitetura (revisão de segurança)

- **`server_signature` removida**: A co-assinatura via `Signer` substitui a verificação de assinatura criptográfica. O servidor deve co-assinar a transação, o que é mais simples e seguro do que verificar uma assinatura ed25519 on-chain.
- **`stake_vault` como PDA**: `seeds = [b"stake-vault", stake_account.key().as_ref()]` — a autoridade do token account é o PDA `stake_account`, e o CPI usa essas mesmas seeds.
- **Mint authority check em `initialize_game`**: Garante que o programa pode mintar tokens via CPI.
