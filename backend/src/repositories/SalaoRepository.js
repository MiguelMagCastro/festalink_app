const { Salao } = require('../domain/entities/Salao');

function mapearLinha(row) {
  return new Salao({
    id: row.id,
    prestadorId: row.prestador_id,
    nome: row.nome,
    descricao: row.descricao,
    endereco: row.endereco,
    capacidadeMax: row.capacidade_max,
    valorDiaria: row.valor_diaria,
    areaM2: row.area_m2,
    temEstacionamento: row.tem_estacionamento === 1,
    temCozinha: row.tem_cozinha === 1,
    permiteMusicaAoVivo: row.permite_musica_ao_vivo === 1,
    aceitaPets: row.aceita_pets === 1,
    regrasAdicionais: row.regras_adicionais,
    deletadoEm: row.deletado_em,
    criadoEm: row.criado_em,
  });
}

class SalaoRepository {
  constructor(db) {
    this.db = db;
  }

  criar(salao) {
    const stmt = this.db.prepare(`
      INSERT INTO saloes (
        prestador_id, nome, descricao, endereco, capacidade_max, valor_diaria,
        area_m2, tem_estacionamento, tem_cozinha, permite_musica_ao_vivo,
        aceita_pets, regras_adicionais
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      salao.prestadorId,
      salao.nome,
      salao.descricao,
      salao.endereco,
      salao.capacidadeMax,
      salao.valorDiaria,
      salao.areaM2,
      salao.temEstacionamento ? 1 : 0,
      salao.temCozinha ? 1 : 0,
      salao.permiteMusicaAoVivo ? 1 : 0,
      salao.aceitaPets ? 1 : 0,
      salao.regrasAdicionais
    );
    salao.id = Number(r.lastInsertRowid);
    return this.buscarPorId(salao.id);
  }

  buscarPorId(id) {
    const row = this.db.prepare(`
      SELECT * FROM saloes WHERE id = ? AND deletado_em IS NULL
    `).get(id);
    return row ? mapearLinha(row) : null;
  }

  listarTodos() {
    const rows = this.db.prepare(`
      SELECT * FROM saloes WHERE deletado_em IS NULL ORDER BY id DESC
    `).all();
    return rows.map(mapearLinha);
  }

  listarPorPrestador(prestadorId) {
    const rows = this.db.prepare(`
      SELECT * FROM saloes
      WHERE prestador_id = ? AND deletado_em IS NULL
      ORDER BY id DESC
    `).all(prestadorId);
    return rows.map(mapearLinha);
  }

  atualizar(salao) {
    this.db.prepare(`
      UPDATE saloes SET
        nome = ?, descricao = ?, endereco = ?, capacidade_max = ?, valor_diaria = ?,
        area_m2 = ?, tem_estacionamento = ?, tem_cozinha = ?,
        permite_musica_ao_vivo = ?, aceita_pets = ?, regras_adicionais = ?
      WHERE id = ?
    `).run(
      salao.nome,
      salao.descricao,
      salao.endereco,
      salao.capacidadeMax,
      salao.valorDiaria,
      salao.areaM2,
      salao.temEstacionamento ? 1 : 0,
      salao.temCozinha ? 1 : 0,
      salao.permiteMusicaAoVivo ? 1 : 0,
      salao.aceitaPets ? 1 : 0,
      salao.regrasAdicionais,
      salao.id
    );
    return this.buscarPorId(salao.id);
  }

  arquivar(id, agora = new Date()) {
    this.db.prepare(`
      UPDATE saloes SET deletado_em = ? WHERE id = ?
    `).run(agora.toISOString(), id);
  }
}

module.exports = { SalaoRepository };
