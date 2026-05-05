# FestaLink

Plataforma de reserva de salões de festa. O cliente consulta salões disponíveis e solicita reservas; o prestador (proprietário) recebe os pedidos, aprova ou recusa e acompanha o andamento.

Projeto da disciplina **Lab. de Desenvolvimento de Aplicações Móveis e Distribuídas** (PUC Minas, 1º semestre de 2026), construído de forma incremental ao longo de quatro sprints.

## Stack

- **Backend:** Node.js + Express, com WebSocket no mesmo processo
- **Autenticação:** JWT
- **Banco:** SQLite (arquivo local)
- **Mensageria:** Redis Pub/Sub via Upstash (Sprint 2)
- **Mobile:** Flutter (apps cliente e prestador — Sprints 3 e 4)

## Estrutura do repositório

```
backend/             API REST em Node.js + Express
apps/                apps Flutter (cliente e prestador)
docs/                proposta, diagramas e documentação técnica
docs/diagrams/       fontes PUML
docs/diagrams/rendered/  PNGs renderizados
postman/             coleção de testes da API
```

## Documentação

- [Proposta de domínio (PDF)](docs/proposta.pdf) — descrição do problema, perfis e funcionalidades.
- [Diagramas](docs/diagrams/rendered/) — visão geral, contexto, casos de uso, jornada, sitemap, C4-1, C4-2, camadas (Clean Architecture), modelo conceitual, modelo lógico, domínio, APIs e papéis.

## Status

Sprint 1 em andamento (entrega 11/05/2026):

- [x] Proposta de domínio
- [x] Diagramas (13)
- [x] Backend REST
- [ ] Coleção Postman

## Como rodar o backend

Pré-requisitos: Node.js 20 ou superior e npm.

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

A API fica disponível em `http://localhost:3000`. Pra confirmar que subiu:

```bash
curl http://localhost:3000/health
```

A resposta esperada é `{"status":"ok","service":"festalink-backend"}`.

### Banco de dados

O SQLite é criado automaticamente no primeiro boot, em `backend/festalink.db` (caminho configurável via `DB_PATH` no `.env`). Pra zerar o banco e começar do zero, basta parar o servidor e apagar o arquivo:

```bash
rm backend/festalink.db backend/festalink.db-wal backend/festalink.db-shm
```

### Endpoints

A API expõe 24 endpoints divididos em quatro grupos: autenticação, salões (com horários e bloqueios), reservas e avaliações. A coleção Postman completa estará em `postman/festalink.postman_collection.json`.

## Como renderizar os diagramas

É preciso ter o Java instalado e o `plantuml.jar` disponível. Os PNGs já versionados ficam em `docs/diagrams/rendered/`. Pra renderizar manualmente:

```bash
java -jar plantuml.jar -tpng -o rendered docs/diagrams/*.puml
```
