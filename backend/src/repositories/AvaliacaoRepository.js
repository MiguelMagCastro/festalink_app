const { Avaliacao } = require('../domain/entities/Avaliacao');

function mapearLinha(row) {
  return new Avaliacao({
    id: row.id,
    reservaId: row.reserva_id,
    nota: row.nota,
    comentario: row.comentario,
    postadaEm: row.postada_em,
    respostaPrestador: row.resposta_prestador,
    respondidaEm: row.respondida_em,
  });
}

function toIsoOrNull(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

class AvaliacaoRepository {
  constructor(db) {
    this.db = db;
  }

  criar(avaliacao) {
    const r = this.db.prepare(`
      INSERT INTO avaliacoes (reserva_id, nota, comentario)
      VALUES (?, ?, ?)
    `).run(avaliacao.reservaId, avaliacao.nota, avaliacao.comentario);
    avaliacao.id = Number(r.lastInsertRowid);
    return this.buscarPorId(avaliacao.id);
  }

  buscarPorId(id) {
    const row = this.db.prepare('SELECT * FROM avaliacoes WHERE id = ?').get(id);
    return row ? mapearLinha(row) : null;
  }

  buscarPorReservaId(reservaId) {
    const row = this.db.prepare('SELECT * FROM avaliacoes WHERE reserva_id = ?').get(reservaId);
    return row ? mapearLinha(row) : null;
  }

  listarPorSalao(salaoId) {
    const rows = this.db.prepare(`
      SELECT a.*
      FROM avaliacoes a
      JOIN reservas r ON r.id = a.reserva_id
      WHERE r.salao_id = ?
        AND r.deletado_em IS NULL
      ORDER BY a.postada_em DESC
    `).all(salaoId);
    return rows.map(mapearLinha);
  }

  atualizar(avaliacao) {
    this.db.prepare(`
      UPDATE avaliacoes SET
        nota = ?, comentario = ?,
        resposta_prestador = ?, respondida_em = ?
      WHERE id = ?
    `).run(
      avaliacao.nota,
      avaliacao.comentario,
      avaliacao.respostaPrestador,
      toIsoOrNull(avaliacao.respondidaEm),
      avaliacao.id
    );
    return this.buscarPorId(avaliacao.id);
  }

  remover(id) {
    this.db.prepare('DELETE FROM avaliacoes WHERE id = ?').run(id);
  }
}

module.exports = { AvaliacaoRepository };
