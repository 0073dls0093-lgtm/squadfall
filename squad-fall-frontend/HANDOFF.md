# HANDOFF — Squad Fall

## Estado atual (2026-09-06)

### 10 fases implementadas com mecanicas reais (NÃO validadas no navegador)

- **1-1**: Extração simples
- **1-2**: Tiro ao alvo (8 alvos bullseye)
- **1-3**: Floresta (cobertura de parede, tiros bloqueados)
- **1-4**: Minas terrestres (7 minas, 3 de dano ao pisar)
- **1-5**: Reféns (3 reféns, seguem o esquadrão após resgate)
- **1-6**: Boss General Gorila (veículo blindado 2x2, HP bar, spawna ondas de soldados)
- **2-1**: Areias Ardentes (patrulha de inimigos em rotas circulares + tempestade de areia com overlay visual)
- **2-2**: Comboio Blindado (jipe automático percorre rota de 5 pontos, esquadrão defende)
- **2-3**: Oásis Sangrento (munição escassa, limite de tiros, drops de caixas de munição ao matar inimigos)
- **2-4**: Torres Gêmeas (2 torres de sniper, dano 2, alcance longo, cadência 3.5s, destrutíveis pelo jogador)

### Sprites melhorados (v0.6)

- Soldados: torso elíptico (uniforme verde), cabeça circular (tom de pele), capacete (arco), braços, pernas, rifle com cano
- Inimigos: mesmo estilo detalhado, coloridos por tipo (soldado vermelho, elite vermelho escuro)
- Alvos de treino: bullseye (anis concêntricos)
- Minas: caixa externa escura + disco interno + 4 raios de pressão + luz vermelha piscante
- Reféns: civil com torso branco, cabeça, cabelo, braços erguidos (rendição), pernas
- Torres de sniper: base de concreto, pilar, ninho, atirador, cano do rifle, glint vermelho
- Lápide: arco no topo + cruz + nome do soldado
- Boss General Gorila: casco elíptico, esteiras laterais, torreta hexagonal, canhão
- Jipe: chassis, cabine, rodas, antena

### Mecânicas globais

- Movimento WASD + clique, tiro com clique direito
- Fogo inimigo bidirecional (soldado/elite atiram no jogador)
- Colisão de parede com slide
- Morte de soldado com lápide + sangue + áudio
- Tela de vitória (estrelas, tempo, kills, sobreviventes, reward mock)
- Tela de falha (esquadrão eliminado)
- Áudio procedural (shoot, hit, explosion, victory, soldierHit, soldierDeath)
- Barra de vida em soldados e inimigos
- Recompensas simuladas localmente (mock em Zustand)

### Web3 CONGELADO

- Contrato Anchor experimental, anchor test nunca executado
- Não fazer deploy, não corrigir stake_vault, não adicionar testes Web3
- Prioridade: jogo sem blockchain

### Próxima tarefa clara

1. Validar no navegador (precisa de npm install + npm run dev local)
2. Corrigir bugs de gameplay encontrados
3. Preparar build para hospedagem

### Cronograma oficial

`../docs/CRONOGRAMA.md`: primeira versão terá 10 fases completas (até 2-4).

## GitHub

- Repositório: `https://github.com/0073dls0093-lgtm/squadfall`
- Branch: `main`
- Último commit: `e6075ed` — fix: GameScene.ts v0.6 — conteúdo real substitui placeholder
