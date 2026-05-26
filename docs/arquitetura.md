# Arquitetura do FestaLink

Este documento descreve a arquitetura do FestaLink no estado em que está sendo construído ao longo das quatro sprints da disciplina. Os diagramas que acompanham este texto estão em `docs/diagrams/rendered/`.

## Visão geral

O sistema é composto por três peças de software internas e um sistema externo.

As peças internas são dois aplicativos mobile em Flutter (um pra cliente, outro pra prestador) e um backend em Node.js dividido em dois processos independentes que conversam só pelo broker. O processo de API serve os dois apps via REST e mantém o banco em arquivo SQLite local. O processo de worker consome eventos do broker e empurra notificações em tempo real pro app do prestador via WebSocket. Os dois apps são executáveis separados: o cliente faz buscas e envia solicitações de reserva, o prestador recebe os pedidos e responde.

O sistema externo é o RabbitMQ, que atua como middleware orientado a mensagens (MOM). Pro ambiente de desenvolvimento e demonstração da disciplina, esse RabbitMQ é provido por um `docker-compose.yml` que sobe um container dedicado ao projeto, mas qualquer RabbitMQ acessível por URL atende. O broker transporta os eventos de domínio publicados pela API, mantém eles em filas duráveis com mensagens persistentes em disco, e entrega ao worker quando ele estiver online.

A comunicação dos apps com a API é HTTPS com JSON no corpo e JWT no header `Authorization`. A API conversa com o RabbitMQ via protocolo AMQP 0-9-1 (lib `amqplib`), e o worker faz o mesmo no sentido inverso. Adicionalmente, o app do prestador abre uma conexão WebSocket persistente com o worker (não com a API) pra receber as notificações de pedido novo sem precisar ficar fazendo polling, cumprindo o item 2.2 do enunciado da disciplina.

## A divisão em três processos

A separação física em três runtimes é o que garante a propriedade central do sistema: cada processo pode ser reiniciado sem afetar a disponibilidade dos outros, e mensagens publicadas durante a indisponibilidade do worker são entregues quando ele volta a subir.

| Processo | Porta | Função |
|---|---|---|
| `api` (`node src/api.js`) | 3000 | Express, rotas REST, SQLite, publisher de eventos |
| `rabbitmq` (container) | 5672 | broker AMQP — exchange topic durável + fila durável |
| `worker` (`node src/worker.js`) | 3001 (WS) | consumer da fila + servidor WebSocket pro app prestador |

A API nunca consome eventos. O worker nunca expõe rotas HTTP. Os dois compartilham o código de domínio, repositórios e serviços de infraestrutura, mas instanciam infra distinta no boot: a API instancia `RabbitMQEventPublisher`, o worker instancia `RabbitMQEventConsumer` e `WebSocketNotifier`. A composição mora em `backend/src/composition.js` em duas funções, `comporApi()` e `comporWorker()`, que cada entrypoint chama.

## Por que essa stack

Cada decisão tem uma justificativa simples:

- Node.js + Express porque eu já tinha familiaridade com JavaScript e porque o ecossistema atende bem REST e AMQP no mesmo runtime.
- SQLite em arquivo local porque o enunciado aceita SQLite e isso eliminou dependência externa na Sprint 1.
- RabbitMQ como MOM porque o sistema precisa que o worker possa cair e, ao voltar, receber as mensagens publicadas durante a sua ausência. RabbitMQ entrega isso de fábrica com filas duráveis e mensagens persistentes. Redis Pub/Sub não entrega, por ser fire-and-forget. A escolha do RabbitMQ é coberta em mais detalhe no relatório de integração (Sprint 2).
- Flutter pros dois apps mobile, conforme exigido no enunciado.
- JWT pra autenticação, com claim de papel (`cliente` ou `prestador`). Simples o bastante pra Sprint 1 e suficiente pra demonstrar a separação de responsabilidades.

## Comunicação e protocolos

Existem três caminhos principais de comunicação no sistema.

O primeiro é entre os apps e a API, via REST sobre HTTPS. Esse é o caminho de todos os fluxos síncronos: cadastro, login, listar salões, solicitar reserva, aprovar ou recusar pedido, postar avaliação. JSON no corpo das requisições e JWT no header `Authorization` pros endpoints protegidos.

O segundo é entre o worker e o app prestador, via WebSocket. O app prestador, ao abrir, estabelece uma conexão persistente com o worker (não com a API) e fica escutando. Quando chega uma mensagem do broker pro worker, ele invoca o `WebSocketNotifier`, que entrega o evento ao prestador correto.

O terceiro é entre os processos do backend e o RabbitMQ, via protocolo AMQP. A API é exclusivamente produtora: publica eventos quando o status de uma reserva muda (`ReservaSolicitada`, `ReservaAprovada`, `ReservaRecusada`) num exchange `topic` durável (`festalink.eventos`), com routing keys derivadas do tipo do evento. O worker é exclusivamente consumidor: declara uma fila durável (`festalink.worker`) bindada ao exchange pela routing key `reserva.#`, consome com `prefetch(1)` e ack manual, e em caso de erro de processamento faz `nack` com requeue pra que a mensagem seja reentregue.

O app cliente reflete mudanças de status (por exemplo, quando o prestador aprova uma reserva) via polling REST com intervalo curto. Esse caminho é aceito explicitamente no item 3.4 do enunciado pro app do cliente.

## Organização do código do backend

O backend segue Clean Architecture em quatro camadas, com a regra de dependência apontando sempre de fora pra dentro.

1. Frameworks e drivers, na camada mais externa: Express, lib `ws` pro WebSocket, `amqplib` pra conversar com o RabbitMQ, driver SQLite.
2. Adapters: controllers HTTP, repositórios SQL, publisher e consumer de eventos, notificador WebSocket.
3. Use cases (Application): regras de orquestração (criar reserva, aprovar, postar avaliação, responder avaliação) e portas (interfaces) que os adapters implementam.
4. Domínio, na camada mais interna: entidades (`Usuario`, `Salao`, `HorarioFuncionamento`, `BloqueioData`, `Reserva`, `Avaliacao`) e eventos de domínio.

O domínio não importa nada de framework. Isso permite que regras sensíveis (gating de avaliação por reserva concluída, janela de 24 horas pra edição da resposta do prestador, conflito entre horário padrão e bloqueio pontual) fiquem dentro das entidades e possam ser testadas sem subir banco. As portas ficam declaradas na camada de Use Cases e são implementadas pelos adapters via injeção de dependência no boot de cada processo, em `comporApi()` e `comporWorker()` dentro de `src/composition.js`.

## Eventos de domínio

Três eventos principais são publicados no RabbitMQ:

- `ReservaSolicitada`, disparado quando o cliente cria uma nova reserva.
- `ReservaAprovada`, disparado quando o prestador aprova.
- `ReservaRecusada`, disparado quando o prestador recusa.

Os eventos carregam o id da reserva, o id do salão, o id do cliente e um timestamp. O worker, único consumidor da fila, escuta os três eventos e dispara os efeitos colaterais correspondentes — empurrar o evento via WebSocket pro app do prestador (no caso de `ReservaSolicitada`) ou disponibilizar a atualização pro próximo polling do cliente (nos casos de `ReservaAprovada` e `ReservaRecusada`).

O catálogo completo de eventos, com payloads e justificativas de campo, está em `docs/eventos.md` (e no PDF correspondente).

## Diagramas relacionados

- `06-c4-1-contexto-tecnico.png` — visão técnica externa do sistema, com atores e sistemas externos.
- `07-c4-2-containers.png` — decomposição em containers (apps, API, worker, banco, MOM).
- `08-camadas-clean-arch.png` — organização do código em camadas e fluxo de dependência.
- `11-dominio.png` — entidades e regras de negócio dentro do domínio.
- `14-arquitetura.png` — visão lógica completa em três processos.
- `16-sequencia-reserva.png` — fluxo de uma reserva da criação até a notificação.
