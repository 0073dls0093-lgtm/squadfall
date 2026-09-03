# HANDOFF — Squad Fall

## Estado atual (verificado em 2026-09-03)

### Implementado e funcional
- **GDD** (`outputs/last-squad-gdd.pdf`): 11 páginas, 30 fases, tokenomics, arquitetura, roadmap.
- **Anchor Program** (`squad-fall/programs/squad-fall/src/lib.rs`): 580 linhas Rust — token mint, recompensas por fase, staking, anti-farming, cooldown, validação de assinatura de servidor.
- **Testes** (`squad-fall/tests/squad-fall.ts`): 16 cenários cobrindo init, stake, complete phase, cooldown, edge cases.
- **Front-end** (`squad-fall-frontend/`): Next.js 14 + Phaser 3 + Phantom Wallet + Zustand.
  - WalletProvider, HUD, GameScene (movimento, tiro, inimigos, extração, vitória), page.tsx (menu/jogo/vitória), store, layout, globals.css.
  - 3 fases jogáveis (1-1, 1-2, 1-3) das 30 planejadas.

### NÃO implementado / bloqueado
- **Token $SQUAD não deployado on-chain** — código pronto, mas `anchor deploy` requer Solana CLI + Anchor CLI instalados na máquina local.
- **Testes nunca executados** — mesma razão (precisa de `anchor test` local).
- **Recompensas on-chain não integradas ao cliente** — o jogo atualiza um saldo mockado em Zustand. A integração real exige: (1) deploy do contrato, (2) servidor de validação que assina o payload da fase, (3) chamada `completePhase` no programa a partir do front-end.
- **Fases 4-30**: não construídas no `PHASES` do GameScene.
- **Sem áudio, sem sprites** — soldados e inimigos são retângulos coloridos.
- **Sem mobile/touch** — só WASD + mouse.
- **Sem auditoria** do programa Anchor.

## Continuidade — próxima tarefa

Antes de declarar uma fase ou sistema concluído, consultar `../docs/DEFINICAO-JOGO-REAL.md`. Configurações de fases e build aprovado não substituem validação no navegador; placeholders devem continuar identificados como placeholders.

**Regra de execução:** a IA que estiver trabalhando nesta sessão é a responsável principal. Ela deve continuar automaticamente enquanto houver crédito/capacidade disponível, dividir o trabalho em partes pequenas e, ao concluir cada parte, testar, atualizar `docs/CONTEXTO.md`, fazer commit e executar `git push` imediatamente. Não deve pedir ao usuário para chamar outra IA nem deixar o push para depois. Outra IA só entra quando o usuário informar explicitamente que esta sessão terminou, ficou sem crédito ou está bloqueada.

1. **Instalar ferramentas locais** (Solana CLI, Anchor CLI, Node.js) — ver README.md.
2. **`anchor test`** em `squad-fall/` para validar os 16 cenários.
3. **`anchor deploy --provider.cluster devnet`** para subir o contrato e criar o token $SQUAD de verdade.
4. **Integrar recompensa on-chain no GameScene**: após `phaseComplete()`, enviar payload ao servidor de validação, receber prova assinada, chamar `program.methods.completePhase(...)` via `@coral-xyz/anchor` no front-end.
5. **Construir fases 4-30** no objeto `PHASES` do GameScene (dados estão no GDD).
6. **Adicionar sprites, áudio, FX**.
7. **Mobile/touch**.
8. **Auditoria de segurança** antes do Mainnet.

## Economia do token

- Supply: 500.000.000 $SQUAD (9 decimais)
- Pool de recompensas: 40% (200M)
- Staking obrigatório para Mundo 3+ (100/250/500 SQUAD acumulado)
- Cooldown de 30 min entre replays
- Replay paga 10% do base
- Queima: renomear soldado, skins, taxas de torneio

## Preservação do trabalho

- Todo o código-fonte está no repositório GitHub `0073dls0093-lgtm/squadfall`.
- O GDD está em `outputs/last-squad-gdd.pdf` (link de download ativo).
- Não há segredos, chaves privadas, ou mnemonics em nenhum arquivo.
- Para outra IA continuar: ler README.md, este HANDOFF.md, e o GDD. O estado é auto-contido.

## Novas ideias (não implementadas)

| Ideia | Benefício | Custo | Risco | Status |
|-------|-----------|-------|------|--------|
| Modo cooperativo online | Retenção, social | Alto (servidor de jogo) | Médio | Backlog |
| Torneios PvP sazonais | Competitividade, queima | Médio | Baixo | Backlog |
| Solana Mobile (Saga) | Touch UI nativa | Médio | Baixo | Backlog |
| DAO de governança | Comunidade decide balanceamento | Baixo | Médio | Backlog |
| Skin NFT marketplace | Receita, utilidade do token | Médio | Baixo | Backlog |

## GitHub

- Repositório: `https://github.com/0073dls0093-lgtm/squadfall`
- Commit inicial: `checkpoint: anchor program + frontend + GDD + docs`
- Branch: `main`
