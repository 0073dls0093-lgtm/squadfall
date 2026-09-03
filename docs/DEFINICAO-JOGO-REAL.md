# SquadFall — Definição de Jogo Real e Critérios de Aceite

**Versão:** 1.0  
**Data:** 03/09/2026  
**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

## 1. Regra central

O SquadFall deve ser desenvolvido como um **jogo jogável de verdade**, inspirado na experiência de *Cannon Fodder*. Código que apenas compila, uma configuração de fase ou um placeholder visual não constitui uma funcionalidade concluída.

> Uma funcionalidade só pode ser marcada como implementada quando aparece no jogo executado no navegador, pode ser acionada pelo jogador, produz o comportamento esperado e foi verificada em runtime.

O projeto usa Phaser para a jogabilidade, Next.js para a aplicação e Solana para a economia planejada. A economia on-chain não pode ser declarada como real enquanto o programa não estiver publicado, testado e integrado com segurança.

## 2. O que o jogo precisa entregar

O jogador deve controlar um esquadrão em mapas top-down, cumprir objetivos, enfrentar vilões, usar armas e alcançar a extração. O jogo deve ter progressão por fases e mundos, feedback visual e sonoro, tela de vitória e persistência de estado compatível com a etapa do projeto.

| Sistema | Critério mínimo de jogo real |
|---|---|
| Soldados | Personagens visíveis, distinguíveis e controláveis, com estado de vida e morte observável. |
| Vilões | Inimigos visíveis no mapa, com comportamento, dano, reação a tiros e morte. |
| Armas | Pelo menos rifle funcional na primeira vertical slice; armas adicionais devem ter comportamento e feedback próprios. |
| Combate | Mira, disparo, colisão, dano, impacto, eliminação e resposta audiovisual. |
| Mapas | Cenários jogáveis com obstáculos e limites que influenciem o caminho e o combate. |
| Objetivos | Cada fase deve possuir objetivo verificável, condição de falha e condição de conclusão. |
| Extração | O jogador deve alcançar uma área de extração e receber confirmação de conclusão. |
| Progressão | A próxima fase deve ser desbloqueada de forma coerente após a conclusão. |
| Interface | HUD com fase, mundo, vidas, munição, objetivo e estado da missão. |
| Feedback | Efeitos visuais e áudio para tiro, dano, morte, explosão, vitória e falha quando aplicável. |
| Economia | Compras e recompensas só podem ser chamadas de reais depois da integração on-chain testada. |

## 3. Placeholder não é entrega final

Retângulos, círculos, cores e textos temporários podem ser usados para validar mecânicas. Eles devem ser marcados como **placeholder** no contexto. A presença de um retângulo no lugar de um soldado, vilão, veículo ou arma não prova que o asset foi produzido.

Uma fase com apenas nome, quantidade de inimigos, coordenadas e ponto de extração é uma **configuração de fase**. Ela não é uma fase completa se suas mecânicas específicas não funcionarem no jogo.

## 4. Vertical slice obrigatória

Antes de declarar as 30 fases completas, o projeto deve concluir uma vertical slice jogável da fase 1-2, “Tiro ao Alvo”. Ela deve demonstrar o ciclo real de jogo:

1. entrar na missão;
2. visualizar o esquadrão e os vilões;
3. movimentar o esquadrão;
4. mirar e disparar o rifle;
5. acertar alvos e produzir dano;
6. eliminar os oito alvos;
7. receber feedback visual e sonoro;
8. alcançar a extração;
9. receber estrelas, tempo e eliminações;
10. voltar ao menu e identificar a próxima fase.

A vertical slice deve ser executada no navegador. O build sozinho não é suficiente para aprová-la.

## 5. Critérios por fase

Uma fase é considerada **implementada** somente quando todos os itens aplicáveis abaixo funcionarem durante uma execução real:

| Verificação | Pergunta de aceite |
|---|---|
| Entrada | O jogador consegue iniciar a fase? |
| Controle | O esquadrão responde aos controles previstos? |
| Ambiente | O mapa e seus obstáculos aparecem e afetam o jogo? |
| Inimigos | Os inimigos aparecem, atacam ou reagem conforme o objetivo? |
| Mecânica | A mecânica específica da fase está funcional, e não apenas nomeada? |
| Combate | Os disparos, colisões, dano e mortes funcionam? |
| Objetivo | O objetivo pode ser concluído e também falhar quando aplicável? |
| Extração | A zona de extração funciona após o objetivo? |
| Resultado | A tela de vitória mostra tempo, estrelas, eliminações e sobreviventes? |
| Repetição | A fase pode ser reiniciada sem estado quebrado? |
| Runtime | A execução no navegador não apresenta erro bloqueante no console? |

## 6. Ordem de construção

A ordem deve priorizar profundidade jogável antes de quantidade superficial:

| Etapa | Entrega |
|---|---|
| 1 | Corrigir e validar build e runtime do frontend. |
| 2 | Completar a vertical slice da fase 1-2 com assets placeholder identificados. |
| 3 | Adicionar arte própria ou assets licenciados para soldados, vilões, armas e ambiente. |
| 4 | Implementar as mecânicas específicas de 1-3 a 1-6. |
| 5 | Expandir mundos e fases somente após as fases-modelo passarem pelos critérios de aceite. |
| 6 | Implementar inventário, loja e equipamentos como recursos mockados antes da integração financeira. |
| 7 | Publicar e testar o programa Solana na Devnet. |
| 8 | Integrar recompensas e compras on-chain com servidor de validação e revisão de segurança. |

## 7. Solana e token `$SQUAD`

O jogo será planejado para rodar na rede Solana. O token `$SQUAD` será usado, conforme o GDD, para recompensas, armamentos, veículos, skins, equipamentos e outras utilidades. Durante o protótipo, saldo, compras e recompensas podem ser simulados apenas se estiverem rotulados como **mock** ou **demonstração**.

Nenhuma transação real deve ser criada antes de o contrato ser publicado na Devnet, os testes Anchor serem executados, o servidor de validação existir e a integração passar por revisão de segurança. Nenhuma chave privada ou mnemonic deve ser armazenada no projeto.

## 8. Registro obrigatório de andamento

Ao final de cada tarefa pequena, a IA deve registrar quatro estados separadamente no `docs/CONTEXTO.md`: **implementado**, **testado**, **placeholder/mockado** e **planejado/bloqueado**. Deve registrar também a próxima tarefa clara.

A sequência operacional é obrigatória: implementar uma parte, executar o teste proporcional, executar o jogo no navegador quando houver mudança de gameplay, atualizar o contexto, fazer commit, fazer push imediatamente e iniciar a próxima parte. A IA não deve transferir a execução para outra IA enquanto ainda tiver crédito ou capacidade disponível.

## 9. Estado conhecido na criação deste documento

O repositório possui um protótipo Phaser com 30 configurações de fase e build Next.js aprovado. O jogo ainda usa retângulos coloridos como personagens e inimigos, não possui todas as mecânicas específicas das fases, mantém recompensas mockadas e não possui integração on-chain concluída. Portanto, as 30 configurações não devem ser descritas como 30 fases completas.

## Referências

[1]: https://github.com/0073dls0093-lgtm/squadfall "Repositório oficial do SquadFall"
[2]: https://en.wikipedia.org/wiki/Cannon_Fodder "Cannon Fodder — referência de estilo de jogo"
