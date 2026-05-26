# FestaLink

Plataforma de reserva de salões de festa. O cliente consulta salões disponíveis e solicita reservas; o prestador (proprietário) recebe os pedidos, aprova ou recusa e acompanha o andamento.

Projeto da disciplina **Lab. de Desenvolvimento de Aplicações Móveis e Distribuídas** (PUC Minas, 1º semestre de 2026), construído de forma incremental ao longo de quatro sprints.

## Stack

- **Backend:** Node.js + Express, dividido em dois processos independentes — **API** (REST :3000) e **Worker** (consumer + WebSocket :3001)
- **Autenticação:** JWT
- **Banco:** SQLite (arquivo local, compartilhado entre os dois processos)
- **Mensageria:** RabbitMQ (exchange topic durável + fila durável, container Docker dedicado ao projeto)
- **Mobile:** Flutter (apps cliente e prestador — Sprints 3 e 4)

## Estrutura do repositório

```
backend/                 dois processos Node.js (API e Worker)
  src/api.js             entry point da API REST (publisher de eventos)
  src/worker.js          entry point do worker (consumer + WebSocket)
  src/composition.js     comporApi() e comporWorker() para DI
apps/                    apps Flutter (cliente e prestador)
docs/                    proposta, diagramas e documentação técnica
docs/diagrams/           fontes PUML
docs/diagrams/rendered/  PNGs renderizados
postman/                 coleção de testes da API
docker-compose.yml       container RabbitMQ dedicado ao projeto
```

## Documentação

- [Proposta de domínio (PDF)](docs/proposta.pdf) — descrição do problema, perfis e funcionalidades.
- [Arquitetura](docs/arquitetura.md) — visão geral, comunicação e organização do backend em três processos.
- [Schema do banco](docs/schema-db.md) — modelagem física do SQLite.
- [Eventos de domínio (PDF)](docs/eventos.pdf) — catálogo de eventos publicados no MOM com formato, exchange e routing keys.
- [Relatório de integração com MOM (PDF)](docs/integracao-mom.pdf) — Sprint 2: escolhas e demonstração do fluxo assíncrono.
- [Diagramas](docs/diagrams/rendered/) — visão geral, contexto, casos de uso, jornada, sitemap, C4-1, C4-2, camadas (Clean Architecture), modelo conceitual, modelo lógico, domínio, APIs, papéis, sequência da reserva, atividades do prestador e estados da reserva.

## Status

- [x] Sprint 1 — entregue em 11/05/2026 (proposta, 13 diagramas, backend REST com 24 endpoints, coleção Postman).
- [x] Sprint 2 — entregue em 25/05/2026 (MOM com RabbitMQ em arquitetura de três processos, WebSocket para o prestador, três eventos de domínio, três diagramas novos e relatório de integração).
- [ ] Sprint 3 — app cliente em Flutter (entrega 15/06/2026).
- [ ] Sprint 4 — app prestador em Flutter e entrega final (03/07/2026).

## Como rodar o backend

Pré-requisitos: Node.js 20 ou superior, npm, Docker (para subir o RabbitMQ local) e Java (apenas se for renderizar os diagramas).

### 1. Subir o broker

A partir da raiz do repositório:

```bash
docker compose up -d
```

O container `festalink-rabbitmq` fica escutando em `127.0.0.1:5672` (AMQP) e expõe a UI de admin em `http://127.0.0.1:15672` (usuário `festalink`, senha `festalink`). Pra parar:

```bash
docker compose down
```

### 2. Instalar dependências e configurar o .env

```bash
cd backend
npm install
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole o resultado do comando acima como valor de `JWT_SECRET` no `.env`. As demais variáveis (`RABBITMQ_URL`, `EVENTOS_EXCHANGE`, `EVENTOS_FILA_WORKER`, `EVENTOS_ROUTING_KEYS`, `WS_PORT`, `PORT`, `DB_PATH`) já vêm prontas no `.env.example` apontando para o RabbitMQ do Docker.

### 3. Subir API e Worker em terminais separados

Em um terminal, a API (HTTP + publisher):

```bash
npm run dev:api
```

Em outro terminal, o Worker (consumer + WebSocket):

```bash
npm run dev:worker
```

A API fica disponível em `http://localhost:3000` e o WebSocket em `ws://localhost:3001`. Pra confirmar que a API subiu:

```bash
curl http://localhost:3000/health
```

A resposta esperada é `{"status":"ok","service":"festalink-api"}`. Nos logs dos dois processos devem aparecer:

```
# terminal da api
api conectada ao broker (festalink.eventos)
festalink api on :3000

# terminal do worker
websocket aberto em :3001
worker consumindo fila festalink.worker
```

Para produção (sem nodemon):

```bash
npm run start:api      # em um terminal
npm run start:worker   # em outro terminal
```

### Independência dos processos

A API e o Worker são processos independentes que se comunicam **exclusivamente** pelo RabbitMQ. Você pode:

- Subir só a API → REST funciona normalmente; eventos publicados ficam acumulando na fila durável.
- Derrubar o Worker enquanto a API roda → API continua publicando; mensagens enfileiram. Ao subir o Worker de novo, ele consome o backlog automaticamente.
- Subir só o Worker → ele escuta a fila ociosamente até alguém publicar.

Essa propriedade pode ser verificada via UI do RabbitMQ em `http://127.0.0.1:15672/#/queues` — a fila `festalink.worker` mostra a contagem de mensagens prontas pra entrega.

### Banco de dados

O SQLite é criado automaticamente no primeiro boot, em `backend/festalink.db` (caminho configurável via `DB_PATH` no `.env`). Os dois processos compartilham o arquivo. Pra zerar o banco e começar do zero, pare os dois processos e apague:

```bash
rm backend/festalink.db backend/festalink.db-wal backend/festalink.db-shm
```

### Endpoints

A API expõe 24 endpoints divididos em quatro grupos: autenticação, salões (com horários e bloqueios), reservas e avaliações. A coleção Postman completa está em `postman/festalink.postman_collection.json`.

### Suite de testes

Da pasta `backend/`:

```bash
npm test
```

Cobre entidades de domínio e use cases críticos, incluindo a publicação de eventos.

## Como observar a comunicação assíncrona

Para acompanhar os eventos chegando em tempo real, o backend inclui um cliente WebSocket de teste. Com API e Worker rodando e um prestador autenticado, capture o JWT retornado por `POST /auth/login` e abra outro terminal:

```bash
cd backend
node scripts/ws-client.js <jwt-do-prestador>
```

O cliente conecta no Worker via WS e imprime cada evento recebido. Em seguida, dispare o fluxo via REST contra a API (criar reserva como cliente, aprovar/recusar como prestador) e observe os eventos `ReservaSolicitada`, `ReservaAprovada` ou `ReservaRecusada` chegando.

Pra demonstrar a durabilidade, derrube o Worker (`Ctrl+C` no terminal dele), faça uma reserva via REST, confirme na UI do RabbitMQ que a mensagem entrou na fila, e suba o Worker novamente — o evento é consumido e empurrado pelo WebSocket imediatamente.

## Como renderizar os diagramas

É preciso ter o Java instalado e o `plantuml.jar` disponível. Os PNGs já versionados ficam em `docs/diagrams/rendered/`. Pra renderizar manualmente:

```bash
java -jar plantuml.jar -tpng -o rendered docs/diagrams/*.puml
```
