PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL CHECK (papel IN ('cliente', 'prestador')),
    deletado_em DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saloes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestador_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    endereco TEXT NOT NULL,
    capacidade_max INTEGER NOT NULL,
    valor_diaria REAL NOT NULL,
    area_m2 INTEGER,
    tem_estacionamento INTEGER,
    tem_cozinha INTEGER,
    permite_musica_ao_vivo INTEGER,
    aceita_pets INTEGER,
    regras_adicionais TEXT,
    deletado_em DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_saloes_prestador ON saloes(prestador_id, deletado_em);

CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salao_id INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    abre_em TEXT NOT NULL,
    fecha_em TEXT NOT NULL,
    UNIQUE (salao_id, dia_semana),
    FOREIGN KEY (salao_id) REFERENCES saloes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bloqueios_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salao_id INTEGER NOT NULL,
    data DATE NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fim TEXT NOT NULL,
    motivo TEXT,
    FOREIGN KEY (salao_id) REFERENCES saloes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bloqueios_salao_data ON bloqueios_data(salao_id, data);

CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    salao_id INTEGER NOT NULL,
    data_evento DATE NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fim TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovada', 'recusada', 'cancelada')),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME,
    deletado_em DATETIME,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (salao_id) REFERENCES saloes(id)
);

CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reservas_salao_data ON reservas(salao_id, data_evento);
CREATE INDEX IF NOT EXISTS idx_reservas_status ON reservas(status);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id INTEGER NOT NULL UNIQUE,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    postada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    resposta_prestador TEXT,
    respondida_em DATETIME,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id)
);
