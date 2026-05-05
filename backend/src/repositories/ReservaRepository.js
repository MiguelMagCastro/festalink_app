const { Reserva } = require('../domain/entities/Reserva');

function mapearLinha(row) {
  return new Reserva({
    id: row.id,
    clienteId: row.cliente_id,
    salaoId: row.salao_id,
    dataEvento: row.data_evento,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    status: row.status,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    deletadoEm: row.deletado_em,
  });
}

function toIsoOrNull(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

class ReservaRepository {
  constructor(db) {
    this.db = db;
  }

  criar(reserva) {
    const r = this.db.prepare(`
      INSERT INTO reservas (cliente_id, salao_id, data_evento, hora_inicio, hora_fim, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      reserva.clienteId,
      reserva.salaoId,
      reserva.dataEvento,
      reserva.horaInicio,
      reserva.horaFim,
      reserva.status
    );
    reserva.id = Number(r.lastInsertRowid);
    return this.buscarPorId(reserva.id);
  }

  buscarPorId(id) {
    const row = this.db.prepare(`
      SELECT * FROM reservas WHERE id = ? AND deletado_em IS NULL
    `).get(id);
    return row ? mapearLinha(row) : null;
  }

  listarPorCliente(clienteId) {
    const rows = this.db.prepare(`
      SELECT * FROM reservas
      WHERE cliente_id = ? AND deletado_em IS NULL
      ORDER BY data_evento DESC, id DESC
    `).all(clienteId);
    return rows.map(mapearLinha);
  }

  listarPorPrestador(prestadorId) {
    const rows = this.db.prepare(`
      SELECT r.*
      FROM reservas r
      JOIN saloes s ON s.id = r.salao_id
      WHERE s.prestador_id = ? AND r.deletado_em IS NULL
      ORDER BY r.data_evento DESC, r.id DESC
    `).all(prestadorId);
    return rows.map(mapearLinha);
  }

  listarAtivasNaData(salaoId, dataEvento) {
    const rows = this.db.prepare(`
      SELECT * FROM reservas
      WHERE salao_id = ?
        AND data_evento = ?
        AND status IN ('pendente', 'aprovada')
        AND deletado_em IS NULL
    `).all(salaoId, dataEvento);
    return rows.map(mapearLinha);
  }

  atualizar(reserva) {
    this.db.prepare(`
      UPDATE reservas SET status = ?, atualizado_em = ?
      WHERE id = ?
    `).run(reserva.status, toIsoOrNull(reserva.atualizadoEm), reserva.id);
    return this.buscarPorId(reserva.id);
  }
}

module.exports = { ReservaRepository };
