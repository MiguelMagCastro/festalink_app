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
- [ ] Backend REST
- [ ] Coleção Postman

## Como rodar

O backend está em desenvolvimento. As instruções de execução serão adicionadas aqui assim que estiver navegável.

Para renderizar os diagramas localmente, é preciso ter o Java instalado e o `plantuml.jar` disponível. Os PNGs já versionados ficam em `docs/diagrams/rendered/`.
