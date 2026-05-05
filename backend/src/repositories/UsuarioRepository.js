const { Usuario } = require('../domain/entities/Usuario');

function mapearLinha(row) {
  return new Usuario({
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    papel: row.papel,
    deletadoEm: row.deletado_em,
    criadoEm: row.criado_em,
  });
}

class UsuarioRepository {
  constructor(db) {
    this.db = db;
  }

  criar(usuario) {
    const stmt = this.db.prepare(`
      INSERT INTO usuarios (nome, email, senha_hash, papel)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(usuario.nome, usuario.email, usuario.senhaHash, usuario.papel);
    usuario.id = Number(result.lastInsertRowid);
    return usuario;
  }

  buscarPorEmail(email) {
    const row = this.db.prepare(`
      SELECT id, nome, email, senha_hash, papel, deletado_em, criado_em
      FROM usuarios
      WHERE email = ? AND deletado_em IS NULL
    `).get(email);
    return row ? mapearLinha(row) : null;
  }

  buscarPorId(id) {
    const row = this.db.prepare(`
      SELECT id, nome, email, senha_hash, papel, deletado_em, criado_em
      FROM usuarios
      WHERE id = ? AND deletado_em IS NULL
    `).get(id);
    return row ? mapearLinha(row) : null;
  }
}

module.exports = { UsuarioRepository };
