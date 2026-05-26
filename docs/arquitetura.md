# Arquitetura do FestaLink

Este documento descreve a arquitetura do sistema FestaLink, a ser construída ao longo das quatro sprints da disciplina. Os diagramas que acompanham este texto estão em `docs/diagrams/rendered/`.

## Visão geral

O sistema é composto por três peças de software internas e um sistema externo.

As peças internas são dois aplicativos mobile em Flutter — um para o cliente e outro para o prestador — e um backend em Node.js dividido em dois processos independentes que se comunicam exclusivamente através do broker de mensagens. O processo de API serve os dois apps via REST e mantém o banco em arquivo SQLite local. O processo de worker consome eventos do broker e empurra notificações em tempo real para o app do prestador via WebSocket. Os dois apps são executáveis separados: o cliente faz buscas e envia solicitações de reserva, o prestador recebe os pedidos e responde.

O sistema depende de um RabbitMQ externo que atua como middleware orientado a mensagens (MOM). Para o ambiente de desenvolvimento e demonstração da disciplina, esse RabbitMQ é provido por um `docker-compose.yml` que sobe um container dedicado ao projeto, mas qualquer RabbitMQ acessível por URL atende. O MOM transporta os eventos de domínio publicados pelo processo de API, mantém-nos em filas duráveis com mensagens persistentes em disco, e os entrega ao processo de worker, que então empurra a notificação em tempo real para o app do prestador.

A comunicação dos apps com a API é HTTPS com JSON no corpo e JWT no header `Authorization`. A API conversa com o RabbitMQ via protocolo AMQP 0-9-1 (`amqplib`), e o worker faz o mesmo no sentido inverso. Adicionalmente, o app prestador abre uma conexão WebSocket persistente com o worker (não com a API) para receber as notificações de pedido novo sem precisar fazer polling contínuo, atendendo ao princípio de arquitetura orientada a eventos exigido no item 2.2 do enunciado da disciplina.

## Topologia em três processos

A separação física em três runtimes é o que garante a propriedade central do sistema: cada processo pode ser reiniciado sem afetar a disponibilidade do outro, e mensagens publicadas durante a indisponibilidade do worker são entregues quando ele volta a subir.

| Processo | Porta | Função |
|---|---|---|
| `api`  (`node src/api.js`)    | 3000  | Express, rotas REST, SQLite, publisher de eventos |
| `rabbitmq` (container)        | 5672  | broker AMQP — exchange topic durável + fila durável |
| `worker` (`node src/worker.js`) | 3001 (WS) | consumer da fila + servidor WebSocket pro app prestador |

A API nunca consome eventos e o worker nunca expõe rotas HTTP. Os dois compartilham apenas o código de domínio, repositórios e serviços de infraestrutura, mas instanciam infra distinta no boot: a API instancia `RabbitMQEventPublisher`, o worker instancia `RabbitMQEventConsumer` e `WebSocketNotifier`.

## Por que essa stack

Cada decisão tem uma justificativa simples por trás:

- Node.js + Express, pela familiaridade com JavaScript e por ter ecossistema bem servido para REST e AMQP.
- SQLite em arquivo local, porque o enunciado aceita SQLite e isso elimina dependência externa na primeira sprint.
- RabbitMQ como MOM, porque o sistema precisa que o worker possa cair e, ao voltar, receber as mensagens publicadas durante a sua ausência. RabbitMQ entrega isso de fábrica com filas duráveis e mensagens persistentes; Redis Pub/Sub não, por ser fire-and-forget.
- Flutter para os dois apps mobile, conforme exigido pelo enunciado.
- JWT para autenticação, com claim de papel (cliente ou prestador) — simples o bastante para a Sprint 1 e suficiente para demonstrar Clean Architecture no backend.

## Comunicação e protocolos

Existem três caminhos principais de comunicação no sistema.

O primeiro é entre os apps e a API, via REST sobre HTTPS. Esse é o caminho de todos os fluxos síncronos: cadastro, login, listar salões, solicitar reserva, aprovar ou recusar pedido, postar avaliação. JSON no corpo das requisições e JWT no header `Authorization` para os endpoints protegidos.

O segundo é entre o worker e o app prestador, via WebSocket. O app prestador, ao abrir, estabelece uma conexão persistente com o worker e fica escutando. Quando chega uma mensagem do broker para o worker, ele invoca o `WebSocketNotifier`, que entrega o evento ao prestador correto.

O terceiro é entre os processos do backend e o RabbitMQ, via protocolo AMQP. A API é exclusivamente produtora: publica eventos quando o status de uma reserva muda — `ReservaSolicitada`, `ReservaAprovada`, `ReservaRecusada` — usando um exchange `topic` durável (`festalink.eventos`) com routing keys derivadas do tipo do evento (`reserva.solicitada`, `reserva.aprovada`, `reserva.recusada`). O worker é exclusivamente consumidor: declara uma fila durável (`festalink.worker`) ligada ao exchange por uma routing key padrão (`reserva.#`), consome com `prefetch(1)` e ACK manual, e em caso de erro de processamento faz nack com requeue para que a mensagem seja reentregue. Essa separação produtor/consumidor em processos distintos é o que torna o sistema verdadeiramente event-driven.

O app cliente reflete mudanças de status (por exemplo, quando o prestador aprova uma reserva) via polling REST com intervalo curto. Esse caminho é aceito explicitamente no item 3.4 do enunciado para o app do cliente.

## Organização do código do backend

O backend segue Clean Architecture em quatro camadas, com a regra de dependência apontando sempre de fora para dentro:

1. Frameworks e drivers, na camada mais externa: Express, lib `ws` para WebSocket, `amqplib` para conversar com o RabbitMQ, driver SQLite.
2. Adapters: controllers HTTP, repositórios SQL, publisher e consumer de eventos, notificador WebSocket.
3. Use cases (Application): regras de orquestração (criar reserva, aprovar, postar avaliação, responder avaliação) e portas (interfaces) que os adapters implementam.
4. Domínio, na camada mais interna: entidades (`Usuario`, `Salao`, `HorarioFuncionamento`, `BloqueioData`, `Reserva`, `Avaliacao`) e eventos de domínio.

O domínio não importa nada de framework. Isso permite que regras sensíveis — gating de avaliação por reserva concluída, janela de 24 horas para edição da resposta do prestador, conflito entre horário padrão e bloqueio pontual — fiquem dentro das entidades e possam ser testadas sem subir banco. As portas ficam declaradas na camada de Use Cases e são implementadas pelos adapters via injeção de dependência no boot de cada processo, em `comporApi()` e `comporWorker()` dentro de `src/composition.js`.

## Eventos de domínio

Três eventos principais são publicados no RabbitMQ:

- `ReservaSolicitada`, disparado quando o cliente cria uma nova reserva.
- `ReservaAprovada`, disparado quando o prestador aprova.
- `ReservaRecusada`, disparado quando o prestador recusa.

Os eventos carregam o id da reserva, o id do salão, o id do cliente e um timestamp. O worker, único consumidor da fila, escuta os três eventos e dispara os efeitos colaterais correspondentes — principalmente empurrar o evento via WebSocket para o app do prestador (no caso de `ReservaSolicitada`) ou disponibilizar a atualização para o próximo polling do cliente (nos casos de `ReservaAprovada` e `ReservaRecusada`).

## Diagramas relacionados

- `06-c4-1-contexto-tecnico.png` — visão técnica externa do sistema, com atores e sistemas externos.
- `07-c4-2-containers.png` — decomposição em containers (apps, API, worker, banco, MOM).
- `08-camadas-clean-arch.png` — organização do código em camadas e fluxo de dependência.
- `11-dominio.png` — entidades e regras de negócio dentro do domínio.
- `14-arquitetura.png` — visão lógica completa em três processos.
- `16-sequencia-reserva.png` — fluxo de uma reserva da criação até a notificação.
