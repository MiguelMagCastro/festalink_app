const { DomainError } = require('../errors/DomainError');
const { Periodo } = require('../valueObjects/Periodo');

class BloqueioData {
  constructor({ id = null, salaoId, data, horaInicio, horaFim, motivo = null }) {
    if (!salaoId) throw new DomainError('salaoId obrigatório');
    if (!data || typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      throw new DomainError('data deve estar no formato YYYY-MM-DD');
    }
    Periodo.validarHora(horaInicio);
    Periodo.validarHora(horaFim);
    if (Periodo.paraMinutos(horaInicio) >= Periodo.paraMinutos(horaFim)) {
      throw new DomainError('horaInicio deve ser anterior a horaFim');
    }

    this.id = id;
    this.salaoId = salaoId;
    this.data = data;
    this.horaInicio = horaInicio;
    this.horaFim = horaFim;
    this.motivo = motivo;
  }

  conflitaCom(data, periodo) {
    if (data !== this.data) return false;
    return new Periodo(this.horaInicio, this.horaFim).intersectaCom(periodo);
  }
}

module.exports = { BloqueioData };
