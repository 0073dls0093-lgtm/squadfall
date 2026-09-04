# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04 (pós-fase 2-1)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

Web3 CONGELADO. Recompensas simuladas localmente (mock Zustand).

**Prioridade:**
1. ~~Validar fases no navegador~~ ⛔ Bloqueado (sem Node.js/npm/navegador neste ambiente)
2. ~~Concluir fase 1-6~~ ✅ Boss General Gorila pushed
3. ~~Criar fase 2-1~~ ✅ Areias Ardentes (patrulha + tempestade de areia) implementada
4. Criar fases 2-2 a 2-4
5. Corrigir bugs de gameplay (após validação no navegador)
6. Melhorar placeholders
7. Preparar build para hospedagem

---

## 1. Estado Factual

### Fases implementadas (código existe no GitHub)

| Fase | Mundo | Mecânica | Implementada | Validada no navegador |
|------|-------|---------|:---:|:---:|
| 1-1 | Recruta | Extração simples | ✅ | ❌ |
| 1-2 | Recruta | Tiro ao alvo (8 bullseye) | ✅ | ❌ |
| 1-3 | Recruta | Cobertura de parede | ✅ | ❌ |
| 1-4 | Recruta | Minas terrestres (7 minas) | ✅ | ❌ |
| 1-5 | Recruta | Reféns (3, seguem esquadrão) | ✅ | ❌ |
| 1-6 | Recruta | Boss General Gorila | ✅ | ❌ |
| 2-1 | Cabo | Patrulha + tempestade de areia | ✅ | ❌ |
| 2-2 | Cabo | Comboio blindado | ❌ | ❌ |
| 2-3 | Cabo | Oásis (munição escassa) | ❌ | ❌ |
| 2-4 | Cabo | Torres gêmeas (snipers) | ❌ | ❌ |

### Mecânicas globais implementadas

- Movimento WASD + clique, tiro com clique direito
- Fogo inimigo bidirecional (soldado/elite atiram no jogador)
- Colisão de parede com slide
- Morte de soldado com lápide + sangue + áudio
- Tela de vitória (estrelas, tempo, kills, sobreviventes, reward mock)
- Tela de falha (esquadrão eliminado)
- Áudio procedural (shoot, hit, explosion, victory, soldierHit, soldierDeath)
- Barra de vida em soldados e inimigos
- Boss com HP bar e spawn de ondas
- Patrulha de inimigos (movimento circular)
- Tempestade de areia (overlay visual com alpha pulsante)
- Recompensas simuladas localmente (mock em Zustand)

### Web3 CONGELADO

- Contrato Anchor experimental, anchor test nunca executado
- stake_vault pode ter incompatibilidade PDA vs ATA
- Não fazer deploy, não corrigir stake_vault, não adicionar testes Web3

---

## 2. Próxima Tarefa Clara

1. **Criar fase 2-2** (Comboio Blindado) — jipe automático que percorre rota, esquadrão defende
2. **Criar fase 2-3** (Oásis Sangrento) — munição escassa, drops de inimigos
3. **Criar fase 2-4** (Torres Gêmeas) — duas torres com snipers
4. **Validar no navegador** (quando ambiente disponível)
5. **Corrigir bugs** encontrados
6. **Melhorar placeholders**
7. **Preparar build para hospedagem**

---

## 3. Decisões Tomadas

- Solana, Rust + Anchor, Phaser.js, Zustand
- Mock rewards: saldo local em Zustand
- Áudio procedural: Web Audio API
- kill_then_extract: matar todos antes de extrair
- Alvos de treino como bullseye
- Lápide com nome
- Colisão de parede com slide
- Minas visíveis com luz vermelha
- Fogo inimigo bidirecional
- Boss General Gorila: veículo blindado, spawna ondas
- Patrulha: inimigos circulam posição base
- Tempestade de areia: overlay amarelo com alpha pulsante
- Cronograma de 10 fases (até 2-4)
- Web3 CONGELADO

---

## 4. Economia (SIMULADA)

- Supply: 500M $SQUAD — planejado, não deployado
- Pool de recompensas: 40% (200M) — planejado, não deployado
- Atualmente: saldo mockado em Zustand
