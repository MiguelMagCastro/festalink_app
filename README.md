# FestaLink

Plataforma de reserva de salões de festa. O cliente consulta salões disponíveis e solicita reservas; o prestador (proprietário) recebe os pedidos, aprova ou recusa e acompanha o andamento.

Projeto da disciplina **Lab. de Desenvolvimento de Aplicações Móveis e Distribuídas** (PUC Minas, 1º semestre de 2026), construído de forma incremental ao longo de quatro sprints.

## Stack

- **Backend:** Node.js + Express, com WebSocket no mesmo processo
- **Autenticação:** JWT
- **Banco:** SQLite (arquivo local)
- **Mensageria:** Redis Pub/Sub (container Docker dedicado ao projeto)
- **Mobile:** Flutter (apps cliente e prestador — Sprints 3 e 4)

## Estrutura do repositório

```
backend/             API REST em Node.js + Express, WebSocket e MOM
apps/                apps Flutter (cliente e prestador)
docs/                proposta, diagramas e documentação técnica
docs/diagrams/       fontes PUML
docs/diagrams/rendered/  PNGs renderizados
postman/             coleção de testes da API
docker-compose.yml   container Redis dedicado ao projeto
```

## Documentação

- [Proposta de domínio (PDF)](docs/proposta.pdf) — descrição do problema, perfis e funcionalidades.
- [Arquitetura](docs/arquitetura.md) — visão geral, comunicação e organização do backend.
- [Schema do banco](docs/schema-db.md) — modelagem física do SQLite.
- [Eventos de domínio (PDF)](docs/eventos.pdf) — catálogo de eventos publicados no MOM com formato e canal.
- [Relatório de integração com MOM (PDF)](docs/integracao-mom.pdf) — Sprint 2: escolhas e demonstração do fluxo assíncrono.
- [Diagramas](docs/diagrams/rendered/) — visão geral, contexto, casos de uso, jornada, sitemap, C4-1, C4-2, camadas (Clean Architecture), modelo conceitual, modelo lógico, domínio, APIs, papéis, sequência da reserva, atividades do prestador e estados da reserva.

## Status

- [x] Sprint 1 — entregue em 11/05/2026 (proposta, 13 diagramas, backend REST com 24 endpoints, coleção Postman).
- [x] Sprint 2 — entregue em 25/05/2026 (MOM com Redis Pub/Sub, WebSocket para o prestador, três eventos de domínio, três diagramas novos e relatório de integração).
- [ ] Sprint 3 — app cliente em Flutter (entrega 15/06/2026).
- [ ] Sprint 4 — app prestador em Flutter e entrega final (03/07/2026).

## Como rodar o backend

Pré-requisitos: Node.js 20 ou superior, npm, Docker (para subir o Redis local) e Java (apenas se for renderizar os diagramas).

Sobe o Redis dedicado ao projeto a partir da raiz:

```bash
docker compose up -d
```

O container `festalink-redis` fica escutando em `127.0.0.1:6380` (não conflita com outros Redis locais que use a porta padrão). Pra parar:

```bash
docker compose down
```

Entra na pasta do backend e instala as dependências:

```bash
cd backend
npm install
```

Configura o arquivo `.env` a partir do exemplo. O `JWT_SECRET` precisa ser uma string longa e aleatória — não use o valor que vem no `.env.example`:

```bash
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole o resultado do comando acima como valor de `JWT_SECRET` no `.env`.

Sobe o servidor em modo desenvolvimento (com restart automático via nodemon):

```bash
npm run dev
```

Ou em modo produção:

```bash
npm start
```

A API fica disponível em `http://localhost:3000` e o servidor WebSocket em `ws://localhost:3001`. Pra confirmar que subiu:

```bash
curl http://localhost:3000/health
```

A resposta esperada é `{"status":"ok","service":"festalink-backend"}`. Nos logs do processo devem aparecer também:

```
websocket aberto em :3001
consumer redis ouvindo canal festalink:eventos
```

Se a `REDIS_URL` não estiver definida, o backend sobe sem MOM e registra um aviso no log — útil para rodar testes locais sem Docker, mas o fluxo de eventos fica desativado.

### Banco de dados

O SQLite é criado automaticamente no primeiro boot, em `backend/festalink.db` (caminho configurável via `DB_PATH` no `.env`). Pra zerar o banco e começar do zero, basta parar o servidor e apagar o arquivo:

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

Para acompanhar os eventos chegando em tempo real, o backend inclui um cliente WebSocket de teste. Com o servidor já rodando e um prestador autenticado, capture o JWT retornado por `POST /auth/login` e abra outro terminal:

```bash
cd backend
node scripts/ws-client.js <jwt-do-prestador>
```

O cliente conecta no servidor WS e imprime cada evento recebido. Em seguida, dispare o fluxo via REST (criar reserva como cliente, aprovar/recusar como prestador) e observe os eventos `ReservaSolicitada`, `ReservaAprovada` ou `ReservaRecusada` chegando.

## Como renderizar os diagramas

É preciso ter o Java instalado e o `plantuml.jar` disponível. Os PNGs já versionados ficam em `docs/diagrams/rendered/`. Pra renderizar manualmente:

```bash
java -jar plantuml.jar -tpng -o rendered docs/diagrams/*.puml
```
