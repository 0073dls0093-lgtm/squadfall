# Squadfall — Guia Genérico de Continuidade entre Múltiplas IAs

**Repositório:** https://github.com/0073dls0093-lgtm/squadfall

## 1. Objetivo

Este é um guia para qualquer IA que venha a trabalhar no Squadfall. A IA que recebeu a sessão é a responsável principal e deve continuar o desenvolvimento enquanto tiver crédito ou capacidade disponível. O usuário só passa o bastão quando informar explicitamente que a sessão terminou, ficou sem crédito ou está bloqueada.

O projeto pode ser compartilhado entre várias IAs, mas não deve ser editado simultaneamente. A IA não deve mandar o usuário pedir para outra IA fazer uma tarefa que ela própria ainda pode executar. Este guia orienta sem impedir ideias melhores, mas mudanças relevantes devem respeitar o escopo e ser registradas.

## 2. O Que Ler Primeiro

Ao iniciar, ler nesta ordem:

1. `docs/CONTEXTO.md` — estado factual do projeto (planejado vs implementado)
2. `docs/GDD.md` — visão completa do jogo
3. `README.md` — estrutura e visão geral
4. `squad-fall-frontend/README.md` — como instalar e rodar
5. `squad-fall/programs/squad-fall/src/lib.rs` — contrato inteligente
6. `squad-fall-frontend/src/game/GameScene.ts` — motor do jogo
7. `docs/DEFINICAO-JOGO-REAL.md` — definição obrigatória de implementação real e critérios de aceite

Não depender da memória de conversas anteriores. O GitHub é a fonte do código e os arquivos de contexto são a fonte do estado do projeto.

## 3. Estrutura Recomendada

```
squadfall/
├── squad-fall/              # Smart contract (Rust + Anchor)
├── squad-fall-frontend/     # Jogo (Next.js + Phaser.js)
├── docs/                    # Documentação para IAs
│   ├── CONTEXTO.md
│   ├── GDD.md
│   ├── GUIA-GENERICO.md
│   └── TRANSICAO-IMEDIATA.md
└── README.md
```

A IA pode adaptar a estrutura se houver justificativa técnica. Deve registrar a decisão e atualizar o README.

## 4. CONTEXTO.md

Atualizar o `docs/CONTEXTO.md` ao final de cada etapa relevante:

- O que foi planejado (do GDD)
- O que foi implementado de fato (codigo)
- O que foi testado
- O que falta
- Proxima tarefa clara

Não declarar como concluído algo que apenas está no GDD. Separar planejamento, implementação, testes e hipóteses.

## 5. Trabalho em Pequenas Etapas — Regra Operacional Obrigatória

Dividir tarefas grandes em partes concluíveis. A IA não deve executar apenas uma ação e parar se ainda existirem partes relacionadas dentro da tarefa atual. Deve avançar de forma dinâmica até concluir o escopo atual.

Ao terminar uma parte, a sequência obrigatória é: **testar → atualizar `docs/CONTEXTO.md` → fazer commit → fazer push para o GitHub → iniciar a próxima tarefa clara**. Não deixar o push para depois, não pedir ao usuário para repetir “continue” e não parar apenas porque uma parte foi concluída se já houver uma próxima tarefa registrada.

Não iniciar uma funcionalidade sem relação com o escopo atual. Porém, depois que o checkpoint da tarefa atual estiver publicado, começar automaticamente a próxima tarefa clara do contexto, sem exigir nova autorização do usuário.

## 6. Checkpoints Frequentes no GitHub

Salvar no GitHub **imediatamente após cada parte relevante**, antes de iniciar a próxima. Isso protege o trabalho se os créditos do dia acabarem, se a sessão for interrompida ou se outra IA assumir.

Se não houver acesso para fazer push, informar a limitação com clareza. Nunca afirmar que uma alteração está no GitHub se ela não foi enviada.

## 7. Economia de Créditos e Tempo

A IA deve ser econômica sem perder qualidade:

- Não revisar repetidamente o que já foi feito
- Não ficar "rodando em círculos" sobre código validado
- Não reanalisar o projeto inteiro sem necessidade
- Não repetir testes já executados, salvo mudança ou erro relevante
- Não refazer funcionalidades prontas
- Não gerar PDF, relatório, imagem ou vídeo sem solicitação
- Não enviar relatório longo a cada pequena ação
- Não ficar narrando repetidamente o que está fazendo
- Ler apenas os arquivos necessários
- Usar uma verificação objetiva e suficiente
- Salvar o checkpoint antes de continuar ou pausar

Quando a tarefa estiver implementada, os testes pertinentes passarem e o contexto estiver atualizado, encerrar a etapa. Se os créditos estiverem acabando, priorizar código, contexto e commit.

## 8. Ideias e Autonomia Responsável

Novas ideias são bem-vindas. A IA deve apresentá-las sem tratar este guia como uma lei. Para cada ideia relevante, informar benefício, complexidade, custo, riscos e alternativas. Mudanças que afetem arquitetura, escopo, segurança, custos ou comportamento do jogo devem aguardar decisão do usuário.

Melhorias pequenas, reversíveis e diretamente relacionadas podem ser implementadas quando forem claramente compatíveis, devendo ser registradas no contexto.

## 9. GDD e Realidade do Código

O GDD descreve a visão do jogo: esquadrão, fases, combate, armas, progressão e possíveis recursos Web3. Ele não prova que esses recursos existem. O contexto deve separar:

- **Planejado**: o que o GDD descreve
- **Implementado**: o que o codigo de fato faz
- **Testado**: o que foi executado e validado

Blockchain, tokens, NFTs ou carteira só devem ser tratados como implementados quando existirem de fato e tiverem sido testados com segurança. A primeira versão deve priorizar jogabilidade e permanecer sem operações financeiras reais, salvo decisão posterior do usuário.

## 10. Mensagem para Iniciar com Qualquer IA

"Leia o repositório https://github.com/0073dls0093-lgtm/squadfall, especificamente `docs/CONTEXTO.md`, `docs/GDD.md` e `docs/GUIA-GENERICO.md`. Continue o projeto do ponto onde a IA anterior parou."

## Resultado Esperado

Cada IA deve deixar uma versão recuperável do projeto, um contexto factual, um commit recente e uma próxima tarefa clara. Assim, o usuário poderá passar o bastão para outra IA sem perda de trabalho, repetição desnecessária ou dependência da conversa anterior.
