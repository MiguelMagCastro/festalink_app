const { DomainError } = require('../errors/DomainError');

const PAPEIS = Object.freeze({
  CLIENTE: 'cliente',
  PRESTADOR: 'prestador',
});

class Usuario {
  constructor({ id = null, nome, email, senhaHash, papel, deletadoEm = null, criadoEm = null }) {
    if (!nome || typeof nome !== 'string') {
      throw new DomainError('nome obrigatório');
    }
    if (!email || typeof email !== 'string') {
      throw new DomainError('email obrigatório');
    }
    if (!senhaHash || typeof senhaHash !== 'string') {
      throw new DomainError('senhaHash obrigatório');
    }
    if (papel !== PAPEIS.CLIENTE && papel !== PAPEIS.PRESTADOR) {
      throw new DomainError(`papel inválido: ${papel}`);
    }

    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senhaHash = senhaHash;
    this.papel = papel;
    this.deletadoEm = deletadoEm;
    this.criadoEm = criadoEm;
  }

  ehCliente() {
    return this.papel === PAPEIS.CLIENTE;
  }

  ehPrestador() {
    return this.papel === PAPEIS.PRESTADOR;
  }

  estaAtivo() {
    return this.deletadoEm === null;
  }

  arquivar(agora = new Date()) {
    if (this.deletadoEm) {
      throw new DomainError('Usuário já foi arquivado');
    }
    this.deletadoEm = agora;
  }
}

module.exports = { Usuario, PAPEIS };
