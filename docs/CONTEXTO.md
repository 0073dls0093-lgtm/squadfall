# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04 (pós-fase 2-3)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

Web3 CONGELADO. Recompensas simuladas localmente (mock Zustand).

**Prioridade:**
1. ~~Fase 1-6~~ ✅ Boss General Gorila
2. ~~Fase 2-1~~ ✅ Areias Ardentes (patrulha + tempestade de areia)
3. ~~Fase 2-2~~ ✅ Comboio Blindado (jipe automático com rota)
4. ~~Fase 2-3~~ ✅ Oásis Sangrento (munição escassa + drops)
5. ~~Criar fase 2-4~~ Torres Gêmeas (snipers) — EM ANDAMENTO
6. Validar no navegador (bloqueado)
7. Corrigir bugs, melhorar placeholders, preparar build

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
| 2-4 | Cabo | Torres gêmeas (snipers) | ❌ | ❌ |

### Mecânicas globais

Movimento WASD+clique, tiro clique direito, fogo inimigo bidirecional, colisão de parede com slide, morte com lápide+sangue+áudio, tela de vitória/falha, áudio procedural, barras de vida, boss com HP bar+spawn de ondas, patrulha circular, tempestade de areia, comboio com rota, munição limitada com drops, recompensas mock em Zustand.

### Web3 CONGELADO

Contrato experimental, anchor test não executado, stake_vault não corrigido. Não fazer deploy, não corrigir Anchor, não adicionar testes Web3.

---

## 2. Próxima tarefa

1. **Fase 2-4** (Torres Gêmeas) — duas torres com snipers, escalar com cobertura
2. Validar no navegador (quando ambiente disponível)
3. Corrigir bugs, melhorar placeholders, preparar build

---

## 3. Economia (SIMULADA)

500M $SQUAD planejado, não deployado. Saldo mockado em Zustand.
