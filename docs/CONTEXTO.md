# CONTEXTO — Squad Fall

**Última atualização:** 2026-09-06 (fix setFillColor → setFillStyle, build blocker)
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall
**Último commit GameScene.ts:** `e48ea49` (SHA do arquivo: `dcd91e4`)

---

## 0. PRIORIDADE ATUAL — FAZER O BUILD PASSAR

Web3 CONGELADO. Recompensas simuladas localmente (mock Zustand).

**Estado real do build:**
1. `npm install` — passou (com 106 vulnerabilidades, 1 crítica — não rodar `npm audit fix --force` agora)
2. `npm run build` — FALHOU inicialmente com erro TypeScript:
   - `./src/game/GameScene.ts:328:11`
   - `Property 'setFillColor' does not exist on type 'Rectangle'`
3. **Correção aplicada e publicada na main** (commit `e48ea49`):
   - `bar.setFillColor(cor)` → `bar.setFillStyle(cor, 1)` nas barras de vida dos soldados
   - Verificado diretamente no GitHub: 0 ocorrências de `setFillColor`, 5 de `setFillStyle`
   - Todas as 10 mecânicas intactas (patrol, sandstorm, convoy, lowAmmo, sniperTowers, boss, mines, hostages, 30 fases, 6 áudios)
4. **Build precisa ser reexecutado externamente** — este ambiente não tem Node.js/npm

**Próximas prioridades:**
1. Reexecutar `cd squad-fall-frontend && npm run build` em ambiente local
2. Se houver outros erros TypeScript, corrigir
3. Validar no navegador (`npm run dev`)
4. Preparar build para hospedagem

---

## 1. Estado Factual

### 10 fases implementadas com mecânicas reais (código verificado, NÃO validadas no navegador)

| Fase | Mundo | Mecânica | Config | Lógica create() | Lógica update() | Validada |
|------|-------|---------|:---:|:---:|:---:|:---:|
| 1-1 | Recruta | Extração simples | ✅ | ✅ | ✅ | ❌ |
| 1-2 | Recruta | Tiro ao alvo (8 bullseye) | ✅ | ✅ | ✅ | ❌ |
| 1-3 | Recruta | Cobertura de paredes | ✅ | ✅ | ✅ | ❌ |
| 1-4 | Recruta | Minas terrestres (7 minas) | ✅ | ✅ | ✅ | ❌ |
| 1-5 | Recruta | Reféns (3, seguem esquadrão) | ✅ | ✅ | ✅ | ❌ |
| 1-6 | Recruta | Boss General Gorila | ✅ | ✅ | ✅ | ❌ |
| 2-1 | Cabo | Patrulha + tempestade de areia | ✅ | ✅ | ✅ | ❌ |
| 2-2 | Cabo | Comboio blindado (jipe automático) | ✅ | ✅ | ✅ | ❌ |
| 2-3 | Cabo | Munição escassa + drops | ✅ | ✅ | ✅ | ❌ |
| 2-4 | Cabo | Torres gêmeas (snipers, dano 2) | ✅ | ✅ | ✅ | ❌ |

### Verificação objetiva das mecânicas 2-1 a 2-4

Confirmado por inspeção direta do código (GameScene.ts, 633 linhas):
- **2-1 Patrulha**: `patrol: true` na config → inimigos recebem `baseX/baseY/patrolAngle/patrolRadius` no create() → movimento circular a cada frame no update()
- **2-1 Tempestade**: `sandstorm: true` na config → overlay amarelo com alpha pulsante criado no create()
- **2-2 Comboio**: `convoy: { route, speed }` na config → jipe criado no create() → jipe percorre rota interpolando entre pontos no update()
- **2-3 Munição**: `lowAmmo: true` na config → ammoCount limita tiros no shoot() → caixas de munição dropam ao matar inimigos → coleta por proximidade no update()
- **2-4 Snipers**: `sniperTowers: [{x,y,hp}]` na config → torres criadas com scope piscante no create() → atiram no soldado mais próximo, dano 2, cadência 3.5s no update() → jogador destrói atirando

### Observação sobre contagem de linhas

O GameScene.ts atual tem 633 linhas (49.5 KB). Referências anteriores a "1079 linhas" eram de uma cópia local mais verbosa, funcionalmente equivalente — a versão atual usa formatação condensada (múltiplas declarações por linha) mas **nenhuma mecânica foi perdida**. Todas as 10 mecânicas de fase + boss + 30 configs + 6 métodos de áudio estão presentes e verificadas.

### Sprites detalhados (v0.6 — todos os elementos)

- **Soldados**: torso elíptico (uniforme verde), cabeça circular (tom de pele), capacete (arco), braços, pernas, rifle com cano
- **Inimigos**: mesmo estilo detalhado, coloridos por tipo (soldado vermelho, elite vermelho escuro)
- **Alvos de treino**: bullseye (anis concêntricos)
- **Minas**: caixa externa escura + disco interno elevado + 4 raios de pressão + luz vermelha piscante central
- **Reféns**: civil com torso branco, cabeça (tom de pele), cabelo, braços erguidos (rendição), pernas
- **Torres de sniper**: base de concreto larga, pilar, ninho no topo, atirador, cano do rifle, glint vermelho do scope
- **Lápide**: arco no topo + base retangular + cruz + nome do soldado
- **Boss General Gorila**: casco elíptico, esteiras laterais, torreta hexagonal, canhão com boca
- **Jipe**: chassis elíptico, cabine, duas rodas, antena

### Mecânicas globais implementadas

- Movimento WASD + clique, tiro com clique direito
- Fogo inimigo bidirecional (soldado/elite atiram no jogador)
- Colisão de parede com slide
- Morte de soldado com lápide + sangue + áudio
- Tela de vitória (estrelas, tempo, kills, sobreviventes, reward mock)
- Tela de falha (esquadrão eliminado)
- Áudio procedural (shoot, hit, explosion, victory, soldierHit, soldierDeath)
- Barra de vida em soldados e inimigos (usando `setFillStyle` — API compatível com Phaser)
- Boss com HP bar e spawn de ondas
- Patrulha de inimigos (movimento circular)
- Tempestade de areia (overlay visual com alpha pulsante)
- Comboio (jipe percorre rota automaticamente)
- Munição escassa + drops de inimigos (caixas azuis)
- Torres de sniper (dano 2, alcance longo, cadência lenta 3.5s, destrutíveis)
- Recompensas simuladas localmente (mock em Zustand)

### Web3 CONGELADO

- Contrato Anchor experimental, anchor test nunca executado
- stake_vault pode ter incompatibilidade PDA vs ATA
- Não fazer deploy, não corrigir stake_vault, não adicionar testes Web3
- Sem alterações em Solana, Anchor, Phantom ou qualquer código Web3

---

## 2. Próxima Tarefa Clara

1. **Reexecutar `npm run build`** externamente e reportar o resultado real (não declarar aprovado sem o output do comando)
2. **Validar no navegador** — `npm run dev` em ambiente local
3. **Corrigir bugs** encontrados durante a validação
4. **Preparar build para hospedagem**

---

## 3. Decisões Tomadas

- Solana, Rust + Anchor, Phaser.js, Zustand
- Mock rewards: saldo local em Zustand
- Áudio procedural: Web Audio API
- kill_then_extract: matar todos antes de extrair
- Alvos de treino como bullseye
- Lápide com nome (v0.6: arco no topo)
- Colisão de parede com slide
- Minas visíveis com luz vermelha (v0.6: disco + raios de pressão)
- Fogo inimigo bidirecional
- Boss General Gorila: veículo blindado, spawna ondas (v0.6: casco + esteiras + torreta hexagonal)
- Patrulha: inimigos circulam posição base
- Tempestade de areia: overlay amarelo com alpha pulsante
- Comboio: jipe percorre rota automaticamente (v0.6: chassis + cabine + rodas + antena)
- Munição escassa: limite de tiros + drops de inimigos
- Torres de sniper: dano 2, alcance longo, cadência 3.5s, destrutíveis (v0.6: base de concreto + ninho + atirador + rifle)
- Reféns: civis com braços erguidos (v0.6: torso branco + cabelo + pose de rendição)
- Cronograma de 10 fases (até 2-4)
- Web3 CONGELADO
- Todos os sprites agora são figuras detalhadas (não mais quadrados/círculos simples)
- Não considerar pronto para o público até validar no navegador
- API Phaser: usar `setFillStyle(cor, alpha)` em vez de `setFillColor(cor)` (este último não existe no tipo `Rectangle`)

---

## 4. Economia (SIMULADA)

- Supply: 500M $SQUAD — planejado, não deployado
- Pool de recompensas: 40% (200M) — planejado, não deployado
- Atualmente: saldo mockado em Zustand

---

## 5. Build — Histórico Real

- **2026-09-06**: `npm install` passou (106 vulnerabilidades, 1 crítica — NÃO rodar `npm audit fix --force`)
- **2026-09-06**: `npm run build` FALHOU — `Property 'setFillColor' does not exist on type 'Rectangle'` (linha 328)
- **2026-09-06**: Correção publicada na main (commit `e48ea49`) — `setFillColor` → `setFillStyle(cor, 1)`
- **2026-09-06**: Verificação direta no GitHub confirma 0 `setFillColor`, 5 `setFillStyle`, todas as mecânicas intactas
- **PENDENTE**: reexecutar `npm run build` externamente para confirmar que o erro sumiu (este ambiente não tem Node.js)
