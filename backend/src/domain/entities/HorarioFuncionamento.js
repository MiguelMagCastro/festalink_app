const { DomainError } = require('../errors/DomainError');
const { Periodo } = require('../valueObjects/Periodo');

class HorarioFuncionamento {
  constructor({ id = null, salaoId, diaSemana, abreEm, fechaEm }) {
    if (!salaoId) throw new DomainError('salaoId obrigatório');
    if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
      throw new DomainError('diaSemana deve ser inteiro entre 0 e 6');
    }
    Periodo.validarHora(abreEm);
    Periodo.validarHora(fechaEm);
    if (Periodo.paraMinutos(abreEm) >= Periodo.paraMinutos(fechaEm)) {
      throw new DomainError('abreEm deve ser anterior a fechaEm');
    }

    this.id = id;
    this.salaoId = salaoId;
    this.diaSemana = diaSemana;
    this.abreEm = abreEm;
    this.fechaEm = fechaEm;
  }

  janela() {
    return new Periodo(this.abreEm, this.fechaEm);
  }

  cobre(periodo) {
    return this.janela().contem(periodo);
  }
}

module.exports = { HorarioFuncionamento };
