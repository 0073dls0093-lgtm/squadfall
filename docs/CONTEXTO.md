# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-04 (verificação objetiva das 10 fases)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

---

## 0. PRIORIDADE ATUAL — JOGO SEM BLOCKCHAIN

Web3 CONGELADO. Recompensas simuladas localmente (mock Zustand).

**Próximas prioridades:**
1. Validar no navegador (bloqueado — sem Node.js/npm/navegador neste ambiente)
2. Corrigir bugs de gameplay (após validação)
3. Substituir placeholders por sprites progressivamente
4. Preparar build para hospedagem

---

## 1. Estado Factual

### 10 fases implementadas com mecânicas reais (código verificado, NÃO validadas no navegador)

| Fase | Mundo | Mecânica | Config | Lógica create() | Lógica update() | Validada |
|------|-------|---------|:---:|:---:|:---:|:---:|
| 1-1 | Recruta | Extração simples | ✅ | ✅ | ✅ | ❌ |
| 1-2 | Recruta | Tiro ao alvo (8 bullseye) | ✅ | ✅ | ✅ | ❌ |
| 1-3 | Recruta | Cobertura de parede | ✅ | ✅ | ✅ | ❌ |
| 1-4 | Recruta | Minas terrestres (7 minas) | ✅ | ✅ | ✅ | ❌ |
| 1-5 | Recruta | Reféns (3, seguem esquadrão) | ✅ | ✅ | ✅ | ❌ |
| 1-6 | Recruta | Boss General Gorila | ✅ | ✅ | ✅ | ❌ |
| 2-1 | Cabo | Patrulha + tempestade de areia | ✅ | ✅ | ✅ | ❌ |
| 2-2 | Cabo | Comboio blindado (jipe automático) | ✅ | ✅ | ✅ | ❌ |
| 2-3 | Cabo | Munição escassa + drops | ✅ | ✅ | ✅ | ❌ |
| 2-4 | Cabo | Torres gêmeas (snipers, dano 2) | ✅ | ✅ | ✅ | ❌ |

### Verificação objetiva das mecânicas 2-1 a 2-4

Confirmado por inspeção direta do código (GameScene.ts):
- **2-1 Patrulha**: `patrol: true` na config → inimigos recebem `baseX/baseY/patrolAngle/patrolRadius` no create() → movimento circular a cada frame no update() (linha 568)
- **2-1 Tempestade**: `sandstorm: true` na config → overlay amarelo com alpha pulsante criado no create() (linha 337)
- **2-2 Comboio**: `convoy: { route, speed }` na config → jipe criado no create() (linha 345) → jipe percorre rota interpolando entre pontos no update() (linha 687)
- **2-3 Munição**: `lowAmmo: true` na config → ammoCount limita tiros no shoot() (linha 845) → caixas de munição dropam ao matar inimigos (linha 928) → coleta por proximidade no update() (linha 746)
- **2-4 Snipers**: `sniperTowers: [{x,y,hp}]` na config → torres criadas com scope piscante no create() (linha 355) → atiram no soldado mais próximo, dano 2, cadência 3.5s no update() (linha 655) → jogador destrói atirando (linha 869)

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
- Comboio (jipe percorre rota automaticamente)
- Munição escassa + drops de inimigos (caixas azuis)
- Torres de sniper (dano 2, alcance longo, cadência lenta 3.5s, destrutíveis)
- Recompensas simuladas localmente (mock em Zustand)
- Todos os elementos são placeholders (retângulos/círculos/textos)

### Web3 CONGELADO

- Contrato Anchor experimental, anchor test nunca executado
- stake_vault pode ter incompatibilidade PDA vs ATA
- Não fazer deploy, não corrigir stake_vault, não adicionar testes Web3

---

## 2. Próxima Tarefa Clara

1. **Validar no navegador** — precisa de `npm install && npm run dev` em ambiente local
2. **Corrigir bugs** encontrados durante a validação
3. **Substituir placeholders por sprites** — soldados, inimigos, boss, veículos, cenários, efeitos
4. **Preparar build para hospedagem**

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
- Comboio: jipe percorre rota automaticamente
- Munição escassa: limite de tiros + drops de inimigos
- Torres de sniper: dano 2, alcance longo, cadência 3.5s, destrutíveis
- Cronograma de 10 fases (até 2-4)
- Web3 CONGELADO
- Placeholders ativos: quadrados/círculos para todos os elementos visuais
- Não considerar pronto para o público enquanto placeholders estiverem ativos

---

## 4. Economia (SIMULADA)

- Supply: 500M $SQUAD — planejado, não deployado
- Pool de recompensas: 40% (200M) — planejado, não deployado
- Atualmente: saldo mockado em Zustand
