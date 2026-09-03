# SquadFall — Cronograma Oficial de Desenvolvimento

**Versão:** 1.0  
**Data:** 03/09/2026  
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

## Decisão principal

O SquadFall **não aguardará 30 fases para ter uma primeira versão jogável**. O objetivo da versão inicial é entregar **10 fases completas, funcionais e testadas no navegador**. As fases restantes serão acrescentadas posteriormente por atualizações, sem reescrever a base do jogo.

> Dez fases realmente jogáveis são preferíveis a trinta fases apenas configuradas, repetitivas ou incompletas.

## Definição de fase completa

Uma fase só entra em uma versão lançável quando soldados, inimigos, armas, mapa, objetivo, combate, dano, morte, extração, resultado e progressão funcionarem durante uma execução real no navegador. Uma entrada no objeto `PHASES`, um build aprovado ou um retângulo colorido não são suficientes.

Os critérios completos estão em [`DEFINICAO-JOGO-REAL.md`](./DEFINICAO-JOGO-REAL.md).

## Fases da primeira versão

| Fase | Mundo | Conteúdo esperado | Estado atual |
|---|---|---|---|
| 1-1 | Recruta | Tutorial e extração | Configurada; precisa validação real |
| 1-2 | Recruta | Tiro ao alvo e combate básico | Vertical slice prioritária |
| 1-3 | Recruta | Floresta, cobertura e emboscada | Configurada; mecânicas pendentes |
| 1-4 | Recruta | Campo minado e detector | Configurada; mecânicas pendentes |
| 1-5 | Recruta | Resgate de reféns | Configurada; mecânicas pendentes |
| 1-6 | Recruta | General Gorila e veículo blindado | Configurada; chefe pendente |
| 2-1 | Cabo | Deserto e tempestade de areia | Configurada; mecânicas pendentes |
| 2-2 | Cabo | Comboio blindado | Configurada; veículo pendente |
| 2-3 | Cabo | Oásis, munição escassa e drops | Configurada; mecânicas pendentes |
| 2-4 | Cabo | Torres e snipers | Configurada; mecânicas pendentes |

## Cronograma por versões

| Versão | Entrega | Critério de saída |
|---|---|---|
| 0.1 | Build estável e protótipo técnico | Build aprovado sem erro bloqueante |
| 0.2 | Vertical slice da fase 1-2 | Ciclo completo jogável no navegador |
| 0.3 | Mundo 1, fases 1-1 a 1-3 | Três fases testadas em runtime |
| 0.4 | Mundo 1 completo, fases 1-1 a 1-6 | Seis fases completas e progressão funcionando |
| 0.5 | Primeiros assets, áudio e efeitos refinados | Placeholders identificados e gameplay apresentável |
| 1.0 | Dez fases, até 2-4 | Dez fases completas, tutorial, progressão e salvamento local |
| 1.1 | Fases 2-5 e 2-6 | Mundo 2 completo e testado |
| 1.2 | Mundo 3, fases 3-1 a 3-6 | Mecânicas de gelo e requisito de staking mockado/testado |
| 2.0 | Mundos 4 e 5, fases 4-1 a 5-6 | Trinta fases completas ou escopo formalmente revisado |

## Ordem de execução imediata

1. Validar o build e o runtime do frontend.
2. Completar a vertical slice da fase 1-2 com soldados, vilões, rifle, dano, morte, efeitos, áudio, objetivo, extração e vitória.
3. Implementar e testar as mecânicas específicas de 1-1 e 1-3.
4. Implementar minas, detector, reféns, chefe e veículo nas fases 1-4 a 1-6.
5. Substituir placeholders prioritários por arte própria ou assets com licença compatível.
6. Criar e validar as quatro primeiras fases do Mundo 2.
7. Fechar a versão 1.0 somente após as dez fases passarem pelo aceite de runtime.

## Solana e economia

O jogo poderá usar o token `$SQUAD` para comprar armamentos, veículos, skins e equipamentos. Até o contrato ser publicado e testado na Devnet, o saldo, o inventário, a loja e as recompensas devem permanecer identificados como **mock** ou **demonstração**.

A integração real exige contrato publicado, testes Anchor executados, servidor de validação, proteção contra replay/farming, testes de compra e revisão de segurança. A existência de código Rust não prova que a economia on-chain está funcionando.

## Regra de continuidade

A IA deve ler este cronograma, `docs/DEFINICAO-JOGO-REAL.md` e `docs/CONTEXTO.md` antes de trabalhar. Ao concluir cada parte, deve implementar, testar proporcionalmente, executar o jogo no navegador quando houver gameplay, atualizar o contexto, fazer commit, fazer push imediato e iniciar a próxima tarefa registrada. Não deve pedir ao usuário para repetir o escopo nem transferir a tarefa para outra IA enquanto houver capacidade disponível.

## Referências

[1]: https://github.com/0073dls0093-lgtm/squadfall "Repositório oficial do SquadFall"
[2]: ./DEFINICAO-JOGO-REAL.md "Definição de jogo real e critérios de aceite"
[3]: ./GDD.md "Game Design Document do SquadFall"
