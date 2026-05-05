const { HorarioFuncionamento } = require('../domain/entities/HorarioFuncionamento');

function mapearLinha(row) {
  return new HorarioFuncionamento({
    id: row.id,
    salaoId: row.salao_id,
    diaSemana: row.dia_semana,
    abreEm: row.abre_em,
    fechaEm: row.fecha_em,
  });
}

class HorarioFuncionamentoRepository {
  constructor(db) {
    this.db = db;
  }

  listarPorSalao(salaoId) {
    return this.db.prepare(`
      SELECT * FROM horarios_funcionamento
      WHERE salao_id = ?
      ORDER BY dia_semana
    `).all(salaoId).map(mapearLinha);
  }

  substituirGradeDoSalao(salaoId, horarios) {
    const apagar = this.db.prepare('DELETE FROM horarios_funcionamento WHERE salao_id = ?');
    const inserir = this.db.prepare(`
      INSERT INTO horarios_funcionamento (salao_id, dia_semana, abre_em, fecha_em)
      VALUES (?, ?, ?, ?)
    `);

    const tx = this.db.transaction((id, lista) => {
      apagar.run(id);
      for (const h of lista) {
        inserir.run(h.salaoId, h.diaSemana, h.abreEm, h.fechaEm);
      }
    });
    tx(salaoId, horarios);

    return this.listarPorSalao(salaoId);
  }
}

module.exports = { HorarioFuncionamentoRepository };
