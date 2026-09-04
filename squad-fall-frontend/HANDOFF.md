# HANDOFF — Squad Fall

## Estado atual (2026-09-04)

### Mundo 1 completo (1-1 a 1-6)

- **Fase 1-1**: Extração simples
- **Fase 1-2**: Tiro ao alvo (8 alvos bullseye, kill_then_extract)
- **Fase 1-3**: Floresta (cobertura de parede, tiros bloqueados)
- **Fase 1-4**: Minas terrestres (7 minas, 3 de dano ao pisar)
- **Fase 1-5**: Reféns (3 reféns, seguem o esquadrão após resgate)
- **Fase 1-6**: Boss General Gorila (veículo blindado 2x2, HP bar, spawna ondas de soldados)

### Mecânicas implementadas

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

- Contrato Anchor experimental, `anchor test` nunca executado
- `stake_vault` pode ter incompatibilidade PDA vs ATA no teste
- Não fazer deploy na Solana, não corrigir stake_vault, não adicionar testes Web3
- Prioridade: jogo sem blockchain

### Próxima tarefa clara

1. Validar runtime no navegador (ciclo completo das fases)
2. Corrigir bugs de gameplay
3. Criar fases 2-1 a 2-4 (Mundo 2)
4. Melhorar placeholders principais
5. Preparar build para hospedagem

### Antes de declarar uma fase concluída

Consultar `../docs/DEFINICAO-JOGO-REAL.md`. Configurações de fase e build aprovado não substituem validação no navegador.

### Cronograma oficial

`../docs/CRONOGRAMA.md`: primeira versão terá 10 fases completas (até 2-4).

## GitHub

- Repositório: `https://github.com/0073dls0093-lgtm/squadfall`
- Branch: `main`
- Último commit: `9cfe9e8` — boss General Gorila (fase 1-6)
