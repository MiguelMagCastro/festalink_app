# Arquitetura do FestaLink

Este documento descreve a arquitetura do sistema FestaLink, a ser construída ao longo das quatro sprints da disciplina. Os diagramas que acompanham este texto estão em `docs/diagrams/rendered/`.

## Visão geral

O sistema é composto por três peças de software internas e um sistema externo.

As peças internas são dois aplicativos mobile em Flutter — um para o cliente e outro para o prestador — e um backend em Node.js com Express. O backend serve os dois apps via API REST, mantém o banco em arquivo SQLite local e troca eventos com o canal de mensagens. Os dois apps são executáveis separados: o cliente faz buscas e envia solicitações de reserva, o prestador recebe os pedidos e responde.

O único sistema externo é o Upstash Redis, que atua como middleware orientado a mensagens (MOM). Ele transporta os eventos de domínio publicados pelo backend e os entrega ao consumidor que empurra notificação em tempo real para o app do prestador.

A comunicação dos apps com o backend é HTTPS com JSON no corpo e JWT no header `Authorization`. O backend conversa com o Upstash via protocolo Redis nativo. Adicionalmente, o app prestador abre uma conexão WebSocket persistente com o backend para receber as notificações de pedido novo sem precisar fazer polling contínuo, atendendo ao princípio de arquitetura orientada a eventos exigido no item 2.2 do enunciado da disciplina.

## Por que essa stack

Cada decisão tem uma justificativa simples por trás:

- Node.js + Express, pela familiaridade com JavaScript e por ter ecossistema bem servido para REST e WebSocket no mesmo processo.
- SQLite em arquivo local, porque o enunciado aceita SQLite e isso elimina dependência externa na primeira sprint.
- Redis Pub/Sub via Upstash, porque atende ao requisito de MOM sem exigir Docker nem hospedagem própria. O plano gratuito é suficiente para o escopo da disciplina.
- Flutter para os dois apps mobile, conforme exigido pelo enunciado.
- JWT para autenticação, com claim de papel (cliente ou prestador) — simples o bastante para a Sprint 1 e suficiente para demonstrar Clean Architecture no backend.

## Comunicação e protocolos

Existem três caminhos principais de comunicação no sistema.

O primeiro é entre os apps e o backend, via REST sobre HTTPS. Esse é o caminho de todos os fluxos síncronos: cadastro, login, listar salões, solicitar reserva, aprovar ou recusar pedido, postar avaliação. JSON no corpo das requisições e JWT no header `Authorization` para os endpoints protegidos.

O segundo é entre o backend e o app prestador, via WebSocket. O app prestador, ao abrir, estabelece uma conexão persistente com o backend e fica escutando. Quando chega um pedido novo, o backend publica um evento no Redis e um consumer dentro do próprio backend escuta o canal e empurra o evento via WebSocket para o prestador correto.

O terceiro é entre o backend e o Upstash Redis, via protocolo Redis nativo. O backend é produtor e consumidor ao mesmo tempo: publica eventos quando o status de uma reserva muda — `ReservaSolicitada`, `ReservaAprovada`, `ReservaRecusada` — e consome o canal para repassar ao WebSocket. Essa separação é o que torna o sistema event-driven.

O app cliente reflete mudanças de status (por exemplo, quando o prestador aprova uma reserva) via polling REST com intervalo curto. Esse caminho é aceito explicitamente no item 3.4 do enunciado para o app do cliente.

## Organização do código do backend

O backend segue Clean Architecture em quatro camadas, com a regra de dependência apontando sempre de fora para dentro:

1. Frameworks e drivers, na camada mais externa: Express, lib `ws` para WebSocket, ioredis para conversar com o Upstash, driver SQLite.
2. Adapters: controllers HTTP, repositórios SQL, publisher e consumer de eventos, notificador WebSocket.
3. Use cases (Application): regras de orquestração (criar reserva, aprovar, postar avaliação, responder avaliação) e portas (interfaces) que os adapters implementam.
4. Domínio, na camada mais interna: entidades (`Usuario`, `Salao`, `HorarioFuncionamento`, `BloqueioData`, `Reserva`, `Avaliacao`) e eventos de domínio.

O domínio não importa nada de framework. Isso permite que regras sensíveis — gating de avaliação por reserva concluída, janela de 24 horas para edição da resposta do prestador, conflito entre horário padrão e bloqueio pontual — fiquem dentro das entidades e possam ser testadas sem subir banco. As portas ficam declaradas na camada de Use Cases e são implementadas pelos adapters via injeção de dependência no boot da aplicação.

## Eventos de domínio

Três eventos principais são publicados no Redis:

- `ReservaSolicitada`, disparado quando o cliente cria uma nova reserva.
- `ReservaAprovada`, disparado quando o prestador aprova.
- `ReservaRecusada`, disparado quando o prestador recusa.

Os eventos carregam o id da reserva, o id do salão, o id do cliente e um timestamp. Um consumidor único dentro do backend escuta os três eventos e dispara os efeitos colaterais correspondentes — principalmente empurrar o evento via WebSocket para o app do prestador (no caso de `ReservaSolicitada`) ou disponibilizar a atualização para o próximo polling do cliente (nos casos de `ReservaAprovada` e `ReservaRecusada`).

## Diagramas relacionados

- `06-c4-1-contexto-tecnico.png` — visão técnica externa do sistema, com atores e sistemas externos.
- `07-c4-2-containers.png` — decomposição em containers (apps, backend, banco, MOM).
- `08-camadas-clean-arch.png` — organização do código em camadas e fluxo de dependência.
- `11-dominio.png` — entidades e regras de negócio dentro do domínio.
