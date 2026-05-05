const { BloqueioData } = require('../domain/entities/BloqueioData');

function mapearLinha(row) {
  return new BloqueioData({
    id: row.id,
    salaoId: row.salao_id,
    data: row.data,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    motivo: row.motivo,
  });
}

class BloqueioDataRepository {
  constructor(db) {
    this.db = db;
  }

  criar(bloqueio) {
    const r = this.db.prepare(`
      INSERT INTO bloqueios_data (salao_id, data, hora_inicio, hora_fim, motivo)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      bloqueio.salaoId,
      bloqueio.data,
      bloqueio.horaInicio,
      bloqueio.horaFim,
      bloqueio.motivo
    );
    bloqueio.id = Number(r.lastInsertRowid);
    return this.buscarPorId(bloqueio.id);
  }

  buscarPorId(id) {
    const row = this.db.prepare('SELECT * FROM bloqueios_data WHERE id = ?').get(id);
    return row ? mapearLinha(row) : null;
  }

  listarPorSalao(salaoId) {
    return this.db.prepare(`
      SELECT * FROM bloqueios_data
      WHERE salao_id = ?
      ORDER BY data DESC
    `).all(salaoId).map(mapearLinha);
  }

  listarPorSalaoEData(salaoId, data) {
    return this.db.prepare(`
      SELECT * FROM bloqueios_data
      WHERE salao_id = ? AND data = ?
    `).all(salaoId, data).map(mapearLinha);
  }

  remover(id) {
    this.db.prepare('DELETE FROM bloqueios_data WHERE id = ?').run(id);
  }
}

module.exports = { BloqueioDataRepository };
