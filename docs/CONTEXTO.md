# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04 (pós-fase 2-4 — 10 fases completas)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

Web3 CONGELADO. Recompensas simuladas localmente (mock Zustand).

**Status:** 10 fases implementadas no código (1-1 a 2-4). Nenhuma validada no navegador.

**Próximas tarefas:**
1. Validar no navegador (bloqueado — sem Node.js/npm/navegador neste ambiente)
2. Corrigir bugs de gameplay encontrados na validação
3. Melhorar placeholders principais (soldados, inimigos, lápide)
4. Preparar build para hospedagem

---

## 1. Fases implementadas

| Fase | Mundo | Mecânica | Implementada | Validada |
|------|-------|---------|:---:|:---:|
| 1-1 | Recruta | Extração simples | ✅ | ❌ |
| 1-2 | Recruta | Tiro ao alvo (8 bullseye) | ✅ | ❌ |
| 1-3 | Recruta | Cobertura de parede | ✅ | ❌ |
| 1-4 | Recruta | Minas terrestres (7 minas) | ✅ | ❌ |
| 1-5 | Recruta | Reféns (3, seguem esquadrão) | ✅ | ❌ |
| 1-6 | Recruta | Boss General Gorila | ✅ | ❌ |
| 2-1 | Cabo | Patrulha + tempestade de areia | ✅ | ❌ |
| 2-2 | Cabo | Comboio blindado (jipe automático) | ✅ | ❌ |
| 2-3 | Cabo | Oásis (munição escassa + drops) | ✅ | ❌ |
| 2-4 | Cabo | Torres gêmeas (snipers, dano 2) | ✅ | ❌ |

### Mecânicas globais

Movimento WASD+clique, tiro clique direito, fogo inimigo bidirecional, colisão de parede com slide, morte com lápide+sangue+áudio, tela de vitória/falha, áudio procedural, barras de vida, boss com HP bar+spawn de ondas, patrulha circular, tempestade de areia, comboio com rota, munição limitada com drops, torres de sniper com alcance longo e dano 2, recompensas mock em Zustand.

### Web3 CONGELADO

Contrato experimental, anchor test não executado, stake_vault não corrigido. Não fazer deploy, não corrigir Anchor, não adicionar testes Web3.

---

## 2. Economia (SIMULADA)

500M $SQUAD planejado, não deployado. Saldo mockado em Zustand.
