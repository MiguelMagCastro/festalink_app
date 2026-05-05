const { DomainError } = require('../errors/DomainError');

class Salao {
  constructor({
    id = null,
    prestadorId,
    nome,
    descricao = null,
    endereco,
    capacidadeMax,
    valorDiaria,
    areaM2 = null,
    temEstacionamento = false,
    temCozinha = false,
    permiteMusicaAoVivo = false,
    aceitaPets = false,
    regrasAdicionais = null,
    deletadoEm = null,
    criadoEm = null,
  }) {
    if (!prestadorId) throw new DomainError('prestadorId obrigatório');
    if (!nome || typeof nome !== 'string') throw new DomainError('nome obrigatório');
    if (!endereco || typeof endereco !== 'string') throw new DomainError('endereco obrigatório');
    if (!Number.isInteger(capacidadeMax) || capacidadeMax <= 0) {
      throw new DomainError('capacidadeMax deve ser inteiro positivo');
    }
    if (typeof valorDiaria !== 'number' || valorDiaria < 0 || Number.isNaN(valorDiaria)) {
      throw new DomainError('valorDiaria deve ser número não-negativo');
    }
    if (areaM2 !== null && (!Number.isInteger(areaM2) || areaM2 < 0)) {
      throw new DomainError('areaM2 deve ser inteiro não-negativo');
    }

    this.id = id;
    this.prestadorId = prestadorId;
    this.nome = nome;
    this.descricao = descricao;
    this.endereco = endereco;
    this.capacidadeMax = capacidadeMax;
    this.valorDiaria = valorDiaria;
    this.areaM2 = areaM2;
    this.temEstacionamento = !!temEstacionamento;
    this.temCozinha = !!temCozinha;
    this.permiteMusicaAoVivo = !!permiteMusicaAoVivo;
    this.aceitaPets = !!aceitaPets;
    this.regrasAdicionais = regrasAdicionais;
    this.deletadoEm = deletadoEm;
    this.criadoEm = criadoEm;
  }

  pertenceA(usuario) {
    return this.prestadorId === usuario.id;
  }

  estaAtivo() {
    return this.deletadoEm === null;
  }

  arquivar(agora = new Date()) {
    if (this.deletadoEm) {
      throw new DomainError('Salão já foi arquivado');
    }
    this.deletadoEm = agora;
  }
}

module.exports = { Salao };
