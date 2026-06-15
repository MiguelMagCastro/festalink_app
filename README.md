# FestaLink

Plataforma de reserva de salões de festa. O cliente busca salões disponíveis e solicita reservas; o prestador (proprietário) recebe os pedidos, aprova ou recusa e acompanha o andamento.

Projeto da disciplina **Lab. de Desenvolvimento de Aplicações Móveis e Distribuídas** (PUC Minas, 1º semestre de 2026), construído de forma incremental ao longo de quatro sprints.

## Stack

- **Backend:** Node.js + Express, dividido em dois processos independentes — uma API REST na porta 3000 e um worker que consome eventos e expõe o WebSocket na porta 3001.
- **Autenticação:** JWT.
- **Banco:** SQLite (arquivo local, compartilhado entre os dois processos).
- **Mensageria:** RabbitMQ (exchange topic durável + fila durável, container Docker dedicado).
- **Mobile:** Flutter (apps cliente e prestador, Sprints 3 e 4).

## Estrutura do repositório

```
backend/                 dois processos Node.js (API e Worker)
  src/api.js             entry point da API REST (publisher de eventos)
  src/worker.js          entry point do worker (consumer + WebSocket)
  src/composition.js     comporApi() e comporWorker() para DI
apps/                    apps Flutter
  cliente/               app cliente (Sprint 3)
docs/                    proposta, diagramas e documentação técnica
docs/diagrams/           fontes PUML
docs/diagrams/rendered/  PNGs renderizados
postman/                 coleção de testes da API
docker-compose.yml       container RabbitMQ dedicado ao projeto
```

## Documentação

- [Proposta de domínio (PDF)](docs/proposta.pdf) — descrição do problema, perfis e funcionalidades.
- [Arquitetura](docs/arquitetura.md) — visão geral, comunicação e organização do backend em três processos.
- [App cliente (Flutter)](docs/app-cliente.md) — arquitetura em camadas, telas e atualização por polling do app da Sprint 3.
- [Schema do banco](docs/schema-db.md) — modelagem física do SQLite.
- [Eventos de domínio (PDF)](docs/eventos.pdf) — catálogo de eventos publicados no MOM com formato, exchange e routing keys.
- [Relatório de integração com MOM (PDF)](docs/integracao-mom.pdf) — Sprint 2: escolha do broker, demonstração do fluxo assíncrono e limitações.
- [Diagramas](docs/diagrams/rendered/) — visão geral, contexto, casos de uso, jornada, sitemap, C4-1, C4-2, camadas (Clean Architecture), modelo conceitual, modelo lógico, domínio, APIs, papéis, sequência da reserva, atividades do prestador, estados da reserva, sitemap do app cliente e autenticação mobile.

## Status

- [x] Sprint 1 — entregue em 11/05/2026 (proposta, 13 diagramas, backend REST com 24 endpoints, coleção Postman).
- [x] Sprint 2 — entregue em 25/05/2026 (MOM com RabbitMQ em arquitetura de três processos, WebSocket pro prestador, três eventos de domínio, três diagramas novos e relatório de integração).
- [x] Sprint 3 — entregue em 15/06/2026 (app cliente em Flutter: lista de salões, detalhe, criar reserva e minhas reservas com atualização por polling; leitura pública de horários e bloqueios na API; dois diagramas novos).
- [ ] Sprint 4 — app prestador em Flutter e entrega final (03/07/2026).

## Como rodar o backend

Pré-requisitos: Node.js 20 ou superior, npm, Docker (pra subir o RabbitMQ local) e Java (só se for renderizar os diagramas).

### 1. Subir o broker

A partir da raiz do repositório:

```bash
docker compose up -d
```

Sobe o container `festalink-rabbitmq` escutando em `127.0.0.1:5672` (AMQP) e expõe a UI de admin em `http://127.0.0.1:15672` (usuário `festalink`, senha `festalink`). Pra parar:

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

Cole o resultado do último comando como valor de `JWT_SECRET` no `.env`. As demais variáveis (`RABBITMQ_URL`, `EVENTOS_EXCHANGE`, `EVENTOS_FILA_WORKER`, `EVENTOS_ROUTING_KEYS`, `WS_PORT`, `PORT`, `DB_PATH`) já vêm prontas no `.env.example` apontando pro RabbitMQ do Docker.

### 3. Subir API e Worker em terminais separados

Em um terminal, a API (HTTP + publisher):

```bash
npm run dev:api
```

Em outro terminal, o worker (consumer + WebSocket):

```bash
npm run dev:worker
```

A API fica em `http://localhost:3000` e o WebSocket em `ws://localhost:3001`. Pra confirmar que a API subiu:

```bash
curl http://localhost:3000/health
```

A resposta esperada é `{"status":"ok","service":"festalink-api"}`. Nos logs dos dois processos devem aparecer linhas como:

```
# terminal da api
api conectada ao broker (festalink.eventos)
festalink api on :3000

# terminal do worker
websocket aberto em :3001
worker consumindo fila festalink.worker
```

Pra rodar em modo produção (sem nodemon):

```bash
npm run start:api      # em um terminal
npm run start:worker   # em outro terminal
```

### Como os processos se relacionam

A API e o worker são processos independentes que conversam só pelo RabbitMQ. Em prática:

- Se você subir só a API, a REST funciona normalmente; eventos publicados ficam acumulando na fila durável esperando alguém consumir.
- Se você derrubar o worker enquanto a API roda, ela continua aceitando reservas e publicando eventos. As mensagens enfileiram. Quando você subir o worker de novo, ele consome o backlog automaticamente.
- Se você subir só o worker, ele fica conectado na fila esperando alguém publicar.

Isso dá pra verificar pela UI do RabbitMQ em `http://127.0.0.1:15672/#/queues`: a fila `festalink.worker` mostra a contagem de mensagens prontas pra entrega, mesmo com o worker offline.

### Banco de dados

O SQLite é criado automaticamente no primeiro boot, em `backend/festalink.db` (caminho configurável via `DB_PATH` no `.env`). Os dois processos compartilham o mesmo arquivo. Pra zerar o banco e começar do zero, pare API e worker e apague o arquivo:

```bash
rm backend/festalink.db backend/festalink.db-wal backend/festalink.db-shm
```

### Endpoints

A API expõe 25 endpoints divididos em quatro grupos: autenticação, salões (com horários e bloqueios), reservas e avaliações. A leitura de horários e de bloqueios de um salão é aberta a qualquer usuário autenticado, para o app cliente exibir a disponibilidade. A coleção Postman completa está em `postman/festalink.postman_collection.json`.

### Suite de testes

A partir de `backend/`:

```bash
npm test
```

Cobre entidades de domínio e use cases críticos, incluindo a publicação de eventos depois do commit das transações.

## Como rodar o app cliente (Flutter)

O app cliente fica em `apps/cliente`. Pré-requisitos: Flutter no canal stable e um emulador Android ou aparelho físico com depuração USB. A arquitetura está descrita em [docs/app-cliente.md](docs/app-cliente.md).

Com o backend no ar:

```bash
cd apps/cliente
flutter pub get
flutter run
```

O app aponta por padrão para `http://10.0.2.2:3000`, que é como o emulador Android enxerga a API rodando na máquina. Em aparelho físico, informe o IP da máquina na rede local:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3000
```

Pra gerar o APK:

```bash
flutter build apk --release
```

O arquivo sai em `apps/cliente/build/app/outputs/flutter-apk/app-release.apk`.

Pra popular dados de demonstração (um prestador com salões, grade de horários e um bloqueio, mais um cliente), com a API no ar:

```bash
cd backend
node scripts/seed.js
```

O seed cria as contas `cliente@festalink.com` e `prestador@festalink.com`, ambas com senha `123456`.

## Como observar a comunicação assíncrona

Pra acompanhar os eventos chegando em tempo real, tem um cliente WebSocket de teste em `backend/scripts/ws-client.js`. Com API e worker rodando e um prestador autenticado, pegue o JWT retornado por `POST /auth/login` e abra outro terminal:

```bash
cd backend
node scripts/ws-client.js <jwt-do-prestador>
```

O cliente conecta no worker via WS e imprime cada evento recebido. Em seguida, dispare o fluxo via REST contra a API (criar reserva como cliente, aprovar/recusar como prestador) e observe os eventos `ReservaSolicitada`, `ReservaAprovada` ou `ReservaRecusada` chegando.

Pra demonstrar a durabilidade, derrube o worker (`Ctrl+C` no terminal dele), faça uma reserva via REST, confirme na UI do RabbitMQ que a mensagem entrou na fila, e suba o worker novamente. O evento é consumido e empurrado pelo WebSocket imediatamente.

## Como renderizar os diagramas

Precisa de Java instalado e do `plantuml.jar` disponível. Os PNGs já versionados ficam em `docs/diagrams/rendered/`. Pra renderizar manualmente:

```bash
java -jar plantuml.jar -tpng -o rendered docs/diagrams/*.puml
```
