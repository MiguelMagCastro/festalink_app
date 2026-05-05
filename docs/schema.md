# Schema do banco de dados — FestaLink

Banco: SQLite, em arquivo local no diretório do backend.

Este documento descreve as tabelas, suas colunas e as decisões de design que orientam o schema. O DDL completo fica em `backend/src/db/schema.sql`.

## Tabelas

### usuarios

Armazena tanto clientes quanto prestadores. O papel é discriminado pela coluna `papel`.

| Coluna | Tipo | Constraint |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| email | TEXT | NOT NULL UNIQUE |
| senha_hash | TEXT | NOT NULL |
| papel | TEXT | NOT NULL, CHECK em ('cliente', 'prestador') |
| deletado_em | DATETIME | nullable (soft delete) |
| criado_em | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### saloes

Cada salão pertence a um prestador. Reúne campos estruturados (capacidade, valor, área, comodidades) e um campo de texto livre para regras adicionais que não cabem em coluna fixa.

| Coluna | Tipo | Constraint |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| prestador_id | INTEGER | NOT NULL, FK → usuarios(id) |
| nome | TEXT | NOT NULL |
| descricao | TEXT |  |
| endereco | TEXT | NOT NULL |
| capacidade_max | INTEGER | NOT NULL |
| valor_diaria | REAL | NOT NULL |
| area_m2 | INTEGER |  |
| tem_estacionamento | INTEGER | (0 ou 1) |
| tem_cozinha | INTEGER | (0 ou 1) |
| permite_musica_ao_vivo | INTEGER | (0 ou 1) |
| aceita_pets | INTEGER | (0 ou 1) |
| regras_adicionais | TEXT |  |
| deletado_em | DATETIME | nullable (soft delete) |
| criado_em | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### horarios_funcionamento

Define a grade semanal de funcionamento do salão, com um registro por dia da semana.

| Coluna | Tipo | Constraint |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| salao_id | INTEGER | NOT NULL, FK → saloes(id) ON DELETE CASCADE |
| dia_semana | INTEGER | NOT NULL, CHECK entre 0 e 6 |
| abre_em | TEXT | NOT NULL, formato HH:MM |
| fecha_em | TEXT | NOT NULL, formato HH:MM |

Constraint adicional: `UNIQUE (salao_id, dia_semana)` — garante no máximo um registro por dia da semana para cada salão.

### bloqueios_data

Exceções pontuais no calendário. Permite bloquear o dia inteiro ou apenas um intervalo, sobrescrevendo o horário padrão.

| Coluna | Tipo | Constraint |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| salao_id | INTEGER | NOT NULL, FK → saloes(id) ON DELETE CASCADE |
| data | DATE | NOT NULL |
| hora_inicio | TEXT | NOT NULL, formato HH:MM |
| hora_fim | TEXT | NOT NULL, formato HH:MM |
| motivo | TEXT |  |

### reservas

| Coluna | Tipo | Constraint |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| cliente_id | INTEGER | NOT NULL, FK → usuarios(id) |
| salao_id | INTEGER | NOT NULL, FK → saloes(id) |
| data_evento | DATE | NOT NULL |
| hora_inicio | TEXT | NOT NULL, formato HH:MM |
| hora_fim | TEXT | NOT NULL, formato HH:MM |
| status | TEXT | NOT NULL, CHECK em ('pendente', 'aprovada', 'recusada', 'cancelada') |
| criado_em | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| atualizado_em | DATETIME |  |
| deletado_em | DATETIME | nullable (soft delete) |

### avaliacoes

A resposta do prestador fica inline na própria avaliação (não em tabela separada).

| Coluna | Tipo | Constraint |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| reserva_id | INTEGER | NOT NULL UNIQUE, FK → reservas(id) |
| nota | INTEGER | NOT NULL, CHECK entre 1 e 5 |
| comentario | TEXT |  |
| postada_em | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| resposta_prestador | TEXT | nullable |
| respondida_em | DATETIME | nullable |

A constraint `UNIQUE` em `reserva_id` garante que cada reserva tem no máximo uma avaliação.

## Relacionamentos

- Um `usuarios` com `papel='prestador'` possui muitos `saloes` (1:N).
- Um `saloes` tem muitos `horarios_funcionamento` (limitado a 7, um por dia da semana).
- Um `saloes` tem muitos `bloqueios_data`.
- Um `usuarios` com `papel='cliente'` faz muitas `reservas`.
- Um `saloes` recebe muitas `reservas`.
- Uma `reservas` pode ter no máximo uma `avaliacoes` (1:0..1).

## Decisões de design

O schema usa soft delete em `usuarios`, `saloes` e `reservas`. Esses registros guardam histórico que tem valor mesmo após "exclusão" — um salão arquivado precisa continuar existindo para que avaliações antigas e relatórios continuem fazendo sentido. A exclusão é marcada na coluna `deletado_em`, e as queries de listagem filtram por `WHERE deletado_em IS NULL`.

Para `horarios_funcionamento` e `bloqueios_data` o tratamento é diferente. São dados de configuração corrente do salão, sem valor histórico, então a exclusão é hard delete com `ON DELETE CASCADE` na FK. Quando o salão é apagado de fato, eles vão junto.

A resposta do prestador fica como par de colunas na própria tabela `avaliacoes` (`resposta_prestador` e `respondida_em`). Como cada avaliação só pode ter uma resposta, manter inline evita JOIN desnecessário e simplifica as queries.

Datas e horas são guardadas como TEXT em formato ISO. SQLite não tem tipos nativos `DATE` ou `DATETIME` — a convenção `YYYY-MM-DD` para datas e `HH:MM` para horários mantém o ordenamento correto por string e simplifica a serialização JSON nas respostas da API.

Valor monetário como `REAL` atende ao escopo acadêmico. Em produção o caminho mais correto seria armazenar centavos como `INTEGER` para evitar imprecisão de ponto flutuante, mas para o escopo da disciplina `REAL` é suficiente e mantém o schema mais legível.

## Índices

Os índices abaixo cobrem os caminhos de leitura mais frequentes:

- `saloes(prestador_id, deletado_em)` — listagem de "meus salões" pelo prestador.
- `reservas(cliente_id)` — listagem de "minhas reservas" pelo cliente.
- `reservas(salao_id, data_evento)` — verificação de conflito ao criar reserva.
- `reservas(status)` — filtro por reservas pendentes na tela do prestador.
- `bloqueios_data(salao_id, data)` — verificação de bloqueio ao criar reserva.

## Diagrama relacionado

- `10-modelo-logico.png` — visão completa do schema com PKs, FKs e cardinalidades.
