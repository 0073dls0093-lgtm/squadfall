# Squad Fall — Game Design Document v1.0

## Visão Geral

Squad Fall é um jogo play-to-earn de ação tática top-down para Web3, construído sobre a blockchain Solana. Inspirado nos clássicos shooters táticos dos anos 90, o jogador comanda um esquadrão de soldados por 30 fases distribuídas em 5 mundos temáticos, cada uma com mecânicas únicas, culminando em batalhas épicas contra chefes. A cada fase concluída, o jogador ganha tokens $SQUAD diretamente na sua carteira Phantom. O jogo é gratuito para começar — a carteira é o login, e a habilidade é a única barreira.

## Pilares do Jogo

- **Jogabilidade tática acessível**: controle por mouse/teclado ou toque, estilo top-down, tiros precisos. Curva de aprendizado suave com teto de habilidade alto.
- **Propriedade real via Solana**: cada fase concluída emite tokens $SQUAD on-chain. A Phantom Wallet é a única porta de entrada — sem cadastro, sem e-mail, sem senha.
- **Progressão com significado**: 30 fases em 5 mundos temáticos, cada qual introduz uma nova mecânica. Derrotar um chefão desbloqueia o próximo mundo.
- **Economia circular**: tokens ganhos podem ser usados para comprar skins, equipamentos NFT e boosts dentro do jogo, retornando valor ao ecossistema.

## Plataforma e Rede

- Blockchain: Solana Mainnet
- Token: $SQUAD (SPL Token)
- Carteira: Phantom (@solana/wallet-adapter)
- Engine: Phaser.js 3 (renderização 2D)
- Front-end: React + Next.js com integração Web3
- Programa on-chain: Rust + Anchor Framework

## Mecânicas de Jogo

### Controles e Câmera

O jogo adota visão top-down isométrica com câmera que segue o esquadrão. O jogador clica com o botão esquerdo para mover o esquadrão até o ponto desejado e com o botão direito para atirar na direção do cursor. Em dispositivos móveis, toque para mover e toque longo para mirar e disparar. A interface é mínima: barra de vida de cada soldado no canto, contador de munição e minimapa no canto superior direito.

### O Esquadrão

O jogador começa cada fase com um esquadrão de 4 a 6 soldados. Cada soldado tem nome próprio gerado aleatoriamente de uma lista de codinomes militares. Quando um soldado morre, uma lápide com seu nome aparece no local da morte e permanece pelo resto da fase — uma homenagem aos clássicos do gênero. Soldados sobreviventes continuam na próxima fase. Entre fases, novos recrutas substituem os caídos automaticamente, cada um com nome único. O jogador pode renomear soldados gastando tokens $SQUAD.

### Armas e Equipamentos

- **Rifle de Assalto** (padrão): dano médio, cadência equilibrada, alcance longo. Disponível desde o início.
- **Escopeta**: dano alto em curta distância, dispersão em cone. Eficaz contra grupos próximos.
- **Bazuca**: dano massivo em área, mas apenas 2 tiros por fase. Essencial contra chefes e veículos.
- **Granadas de Fragmentação**: arremessáveis em parábola, explodem após 2 segundos. Limitadas a 3 por fase.
- **Kit Médico**: recupera 50% da vida de um soldado. 1 uso por fase.
- **Detector de Minas**: revela minas terrestres próximas por 10 segundos.

Equipamentos avançados (lança-chamas, rifle de precisão, drone de reconhecimento) são desbloqueados como NFTs ao completar mundos específicos ou adquiridos no mercado interno com tokens $SQUAD.

### Sistema de Pontuação

Cada fase é avaliada de 1 a 3 estrelas com base em três critérios:

- **Tempo de conclusão**: completar a fase dentro do tempo-alvo (ouro, prata, bronze).
- **Soldados sobreviventes**: quanto mais soldados chegarem vivos ao final, melhor.
- **Inimigos eliminados**: percentual de inimigos neutralizados na fase (matar todos garante bônus).

A recompensa base em $SQUAD é multiplicada pelo número de estrelas: 1 estrela = recompensa base, 2 estrelas = 1.5×, 3 estrelas = 2×. Apenas a primeira conclusão de cada fase paga recompensa; repetições pagam 10% do valor base para evitar farming abusivo.

### Sistema Anti-Farming

- Cooldown de 30 minutos entre repetições da mesma fase para ganho de tokens.
- Limite diário de 50 fases concluídas por carteira.
- Verificação de integridade: o cliente envia um hash criptográfico do resultado da fase (tempo + kills + soldados vivos) que é validado por um serviço off-chain antes da transação on-chain.
- Staking mínimo de 100 $SQUAD para desbloquear fases a partir do Mundo 3, garantindo compromisso do jogador com o ecossistema.

## As 30 Fases

### Mundo 1: Recruta — "Boot Camp Tropical"

Um arquipélago tropical usado como campo de treinamento. As fases introduzem os controles básicos e preparam o jogador para os desafios futuros. Vegetação densa oferece cobertura, mas também esconde emboscadas. Recompensa: 10 $SQUAD por fase (base 1 estrela).

| # | Fase | Objetivo | Mecânicas |
|---|------|----------|----------|
| 1-1 | Acorda, Soldado! | Chegar ao helicóptero de extração | Movimentação básica. Sem inimigos. Tutoriais na tela. |
| 1-2 | Tiro ao Alvo | Eliminar 8 alvos de treino | Primeiros inimigos estáticos. Munição infinita para prática. |
| 1-3 | Floresta Silenciosa | Atravessar a selva até o posto avançado | Inimigos escondidos atrás de árvores. Introdução à cobertura. |
| 1-4 | Não Me Pise! | Atravessar campo minado até o bunker | Minas terrestres visíveis como pequenos montes. Uso do Detector de Minas. |
| 1-5 | Resgate na Selva | Resgatar 3 reféns e levá-los à extração | Reféns seguem o esquadrão. Inimigos atiram nos reféns também. |
| 1-6 | General Gorila | Derrotar o chefão: blindado + ondas | Veículo blindado que solta soldados. 3 hits de bazuca necessários. |

### Mundo 2: Cabo — "Tempestade no Deserto"

O esquadrão é enviado a uma zona de conflito no deserto. Inimigos agora patrulham ativamente, usam cobertura e coordenam ataques. A tempestade de areia reduz a visibilidade em algumas fases, exigindo uso do minimapa. Recompensa: 25 $SQUAD por fase.

| # | Fase | Objetivo | Mecânicas |
|---|------|----------|----------|
| 2-1 | Areias Ardentes | Atravessar o deserto sob tempestade | Visibilidade reduzida. Inimigos com patrulha em rotas fixas. |
| 2-2 | Comboio Blindado | Defender um jipe em movimento | Jipe automático percorre rota. Esquadrão abordo atirando. Inimigos em emboscada. |
| 2-3 | Oasis Sangrento | Capturar o poço de água | Munição escassa. Drops de inimigos caídos são essenciais. |
| 2-4 | Torres Gêmeas | Neutralizar snipers em 2 torres | Torres altas com linha de visão ampla. Escalar com cobertura. |
| 2-5 | Campo Minado | Levar engenheiro ao centro do campo | Minas invisíveis sem detector. Engenheiro não pode morrer. |
| 2-6 | Sultão dos Mísseis | Derrotar helicóptero de ataque | Helicóptero lança mísseis teleguiados. Abater com bazuca em 4 hits. |

### Mundo 3: Sargento — "Frente Gelada"

Uma cadeia de montanhas congeladas onde as condições climáticas se tornam um inimigo adicional. O gelo afeta o movimento do esquadrão e dos inimigos igualmente. Lagos congelados podem quebrar sob fogo pesado. Recompensa: 50 $SQUAD por fase. Requer staking de 100 $SQUAD para acessar.

| # | Fase | Objetivo | Mecânicas |
|---|------|----------|----------|
| 3-1 | Nevasca | Alcançar a base aliada na montanha | Visibilidade muito reduzida. Movimento lento na neve profunda. |
| 3-2 | Lagos Congelados | Atravessar 3 lagos até o complexo | Gelo quebra com explosões. Rotas limitadas — planejar caminho. |
| 3-3 | Base Subterrânea | Limpar o complexo subterrâneo | Fase indoor. Corredores estreitos. Emboscadas em salas escuras. |
| 3-4 | Avalanche | Escapar da avalanche até o topo | Timer progressivo. Avalanche sobe pela tela, forçando avanço rápido. |
| 3-5 | Sinais de Fumaça | Ativar 3 torres de rádio | Comunicação cortada. Torres distantes entre si. Reforços chegam após cada torre. |
| 3-6 | O Colosso de Gelo | Derrotar tanque sobre lago congelado | Tanque pesado destrói o gelo ao se mover. Criar armadilhas de gelo quebradiço. |

### Mundo 4: Tenente — "Inferno Vulcânico"

Um arquipélago vulcânico onde o terreno é tão perigoso quanto os inimigos. Rios de lava bloqueiam caminhos, pontes desabam após o uso, e o esquadrão enfrenta inimigos de elite com equipamento superior. Dificuldade elevada. Recompensa: 100 $SQUAD por fase. Requer staking acumulado de 250 $SQUAD.

| # | Fase | Objetivo | Mecânicas |
|---|------|----------|----------|
| 4-1 | Rios de Lava | Atravessar o campo vulcânico | Pontes que desabam após passar. Lava causa morte instantânea. |
| 4-2 | Prisão da Montanha | Libertar 5 prisioneiros | Cada prisioneiro liberto vira soldado jogável. Cela trancada requer explosivo. |
| 4-3 | Emboscada no Desfiladeiro | Sobreviver à emboscada | Inimigos surgem por trás em 4 ondas. Sem rota de fuga — lutar ou morrer. |
| 4-4 | Arsenal Secreto | Roubar os planos de guerra | Item único carregado por um soldado. Se ele morrer, pegar o item do chão. |
| 4-5 | A Horda | Sobreviver por 3 minutos | Onda infinita de inimigos. Munição e kits médicos dropados periodicamente. |
| 4-6 | General Magma | Destruir fortaleza do chefão | 4 torres de defesa + chefe que cospe fogo. Destruir torres antes de atacar o chefe. |

### Mundo 5: Comandante — "A Fortaleza Final"

A fortaleza do Alto Comando inimigo. As 6 fases mais difíceis do jogo, reservadas para os melhores jogadores. Mecânicas complexas, chefes múltiplos e a batalha final que define o legado do esquadrão. Recompensa: 250 $SQUAD por fase. Requer staking de 500 $SQUAD e conclusão dos 4 mundos anteriores.

| # | Fase | Objetivo | Mecânicas |
|---|------|----------|----------|
| 5-1 | Muralhas do Inimigo | Invadir a fortaleza | Morteiros caindo aleatoriamente. Muralhas com torres de metralhadora. |
| 5-2 | Labirinto | Encontrar a saída do labirinto | Mapa muda a cada tentativa. Bússola indica direção geral da saída. |
| 5-3 | Traição | Identificar e neutralizar o espião | Um soldado do esquadrão é infiltrado. Observar comportamento suspeito. |
| 5-4 | Carga Explosiva | Plantar C4 e escapar | 4 pontos de demolição. Timer de 2 minutos após plantar o primeiro. |
| 5-5 | Última Resistência | Derrotar todos os inimigos | Inimigos de todos os mundos anteriores. Arena aberta. Sem cobertura. |
| 5-6 | O Alto Comando | Derrotar o chefão final em 3 fases | Fase 1: escudos e soldados. Fase 2: mísseis e lasers. Fase 3: berserk sem escudo. |

## Tokenomics — $SQUAD

### Visão Geral do Token

$SQUAD é um token SPL na blockchain Solana, projetado para sustentar a economia do jogo Squad Fall. Ele serve como recompensa por habilidade, meio de troca no ecossistema e mecanismo de governança para os jogadores mais dedicados.

### Ficha Técnica do Token

- Nome: Squad Fall Token
- Símbolo: $SQUAD
- Tipo: SPL Token (Solana Program Library)
- Decimais: 9
- Supply Total: 500.000.000 $SQUAD
- Rede: Solana Mainnet
- Programa: Rust + Anchor Framework

### Distribuição do Supply

| Alocação | Pct | Total $SQUAD | Vesting / Liberação |
|----------|-----|--------------|---------------------|
| Pool de Recompensas (P2E) | 40% | 200.000.000 | Liberação linear por fase concluída on-chain |
| Staking & Liquidez | 15% | 75.000.000 | Pool em DEX Solana (Raydium/Orca) + recompensas de staking |
| Time & Desenvolvimento | 15% | 75.000.000 | Vesting de 36 meses, cliff de 12 meses |
| Ecossistema & Parcerias | 12% | 60.000.000 | Grants para criadores, torneios, parcerias estratégicas |
| Marketing & Comunidade | 10% | 50.000.000 | Airdrops iniciais, eventos, embaixadores |
| Reserva Estratégica | 8% | 40.000.000 | Reserva para emergências e oportunidades futuras |

### Economia de Recompensas

| Mundo | Base (1★) | 2★ | 3★ | Staking Exigido |
|-------|-----------|-----|-----|-----------------|
| Mundo 1: Recruta | 10 $SQUAD | 15 $SQUAD | 20 $SQUAD | 0 $SQUAD |
| Mundo 2: Cabo | 25 $SQUAD | 37.5 $SQUAD | 50 $SQUAD | 0 $SQUAD |
| Mundo 3: Sargento | 50 $SQUAD | 75 $SQUAD | 100 $SQUAD | 100 $SQUAD |
| Mundo 4: Tenente | 100 $SQUAD | 150 $SQUAD | 200 $SQUAD | 250 $SQUAD |
| Mundo 5: Comandante | 250 $SQUAD | 375 $SQUAD | 500 $SQUAD | 500 $SQUAD |

Jogador que conquistar 3 estrelas em todas as 30 fases ganha o título NFT "Squad Fall Commander" e acesso a um baú lendário com 5.000 $SQUAD e equipamentos exclusivos.

### Mecanismos de Queima e Utilidade

- Renomear soldados: 5 $SQUAD por soldado (queimados).
- Skins de esquadrão: compra de skins temáticas no marketplace interno. 50% queimados, 50% para o tesouro.
- Equipamentos NFT: bazucas, lança-chamas, rifles de precisão são NFTs que podem ser comprados com $SQUAD no marketplace.
- Boost de XP: 20 $SQUAD ativa 2× recompensa por 1 hora (queimados).
- Governança: jogadores com mais de 10.000 $SQUAD em staking podem votar em novas fases e ajustes de balanceamento.
- Torneios: inscrição em torneios sazonais com premiação em $SQUAD. Taxa de inscrição queimada.

### Sustentabilidade

O modelo econômico foi projetado para manter a pressão deflacionária. Com 40% do supply alocado para recompensas (200 milhões de tokens) e um total máximo de 1.000 $SQUAD possíveis de ganhar por jogador no total das 30 fases (considerando 3 estrelas em todas), o pool suporta até 200.000 jogadores completando o jogo inteiro — um número significativamente acima de qualquer projeção realista de curto e médio prazo. Além disso, os mecanismos de queima, staking e taxas de torneio retiram tokens de circulação continuamente.

## Arquitetura Técnica

### Front-end

- Framework: Next.js 14+ com App Router para performance e SEO.
- Engine de jogo: Phaser.js 3.80+ renderizando em WebGL com fallback para Canvas.
- Integração Web3: @solana/wallet-adapter-react + @solana/web3.js para conexão Phantom.
- UI: TailwindCSS + shadcn/ui para componentes de interface (menus, HUD, inventário).
- Estado: Zustand para gerenciamento de estado do jogo e da carteira.

### Back-end e Validação

- Servidor de validação: Node.js + TypeScript validando hashes de completação de fase.
- API: REST + WebSocket para comunicação em tempo real (leaderboard, torneios).
- Banco de dados: PostgreSQL para dados off-chain (perfis, pontuações, histórico).
- Cache: Redis para sessões de jogo e cooldowns.
- Infraestrutura: deploy em AWS/GCP com escalonamento automático.

### Programa On-Chain (Anchor)

O coração do Squad Fall na Solana consiste em programas Anchor escritos em Rust:

- Programa de Token ($SQUAD): SPL Token padrão com metadados on-chain via Metaplex. Funções de mint controladas apenas pelo programa de recompensas.
- Programa de Recompensas (game_rewards): gerencia a emissão de tokens por fase. Cada fase tem um identificador único e um cooldown por carteira. O programa mantém registros de quais fases cada carteira já completou e em qual nível de estrelas.
- Programa de Staking: os jogadores fazem staking de $SQUAD para desbloquear mundos superiores. Tokens em staking contam para governança. Retirada tem período de 7 dias.
- Conta PDA (Program Derived Address): armazena o estado de progresso de cada jogador on-chain, incluindo fases completadas, estrelas e total de tokens ganhos.

### Fluxo de Recompensa

1. Jogador completa a fase no cliente Phaser.js. O jogo gera um payload assinado: { wallet, phase_id, time, kills, soldiers_alive, stars, timestamp, nonce }.
2. O payload é enviado ao servidor de validação, que verifica: se a fase é válida para a carteira, se o tempo é plausível (não pode ser menor que o recorde teórico mínimo), se o cooldown da fase foi respeitado, e se o nonce é único.
3. Validado, o servidor assina o payload com sua chave privada e retorna uma prova ao cliente.
4. O cliente envia a transação ao programa Anchor game_rewards com a prova assinada. O programa verifica a assinatura do servidor e emite os tokens $SQUAD.
5. Os tokens aparecem na carteira Phantom do jogador em menos de 1 segundo (confirmação Solana ~400ms).

## Roadmap

| Fase | Mês | Entregas |
|------|-----|---------|
| Fase 1: Fundação | Mês 1–2 | Game Design Document finalizado. Protótipo jogável com Mundo 1. Anchor Program do token $SQUAD. Testes no Solana Devnet. |
| Fase 2: Alpha | Mês 3–4 | Mundos 1 ao 3 completos. Integração Phantom funcional. Programa de recompensas deployado na Devnet. Testes internos de jogabilidade. |
| Fase 3: Beta Fechada | Mês 5–6 | Todos os 5 mundos completos. Leaderboard on-chain. Marketplace de NFTs de equipamentos. Beta com 1.000 jogadores convidados. Auditoria de segurança do programa Anchor. |
| Fase 4: Lançamento | Mês 7 | Deploy na Solana Mainnet. Evento de lançamento com pool de recompensas em dobro por 7 dias. Listagem em DEX (Raydium). Campanha de marketing global. |
| Fase 5: Expansão | Mês 8+ | Novos mundos sazonais. Torneios PvP (esquadrão vs esquadrão). Integração com Solana Mobile (Saga). Modo cooperativo online. DAO de governança ativada. |