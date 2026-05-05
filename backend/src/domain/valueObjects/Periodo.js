const { DomainError } = require('../errors/DomainError');

class Periodo {
  constructor(inicio, fim) {
    Periodo.validarHora(inicio);
    Periodo.validarHora(fim);
    if (Periodo.paraMinutos(inicio) >= Periodo.paraMinutos(fim)) {
      throw new DomainError('Periodo: hora de inicio deve ser anterior à hora de fim');
    }
    this.inicio = inicio;
    this.fim = fim;
    Object.freeze(this);
  }

  static validarHora(hhmm) {
    if (typeof hhmm !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm)) {
      throw new DomainError(`Hora inválida: ${hhmm} (esperado HH:MM)`);
    }
  }

  static paraMinutos(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  intersectaCom(outro) {
    const a = Periodo.paraMinutos(this.inicio);
    const b = Periodo.paraMinutos(this.fim);
    const c = Periodo.paraMinutos(outro.inicio);
    const d = Periodo.paraMinutos(outro.fim);
    return a < d && c < b;
  }

  contem(outro) {
    return Periodo.paraMinutos(this.inicio) <= Periodo.paraMinutos(outro.inicio)
      && Periodo.paraMinutos(outro.fim) <= Periodo.paraMinutos(this.fim);
  }

  duracaoMinutos() {
    return Periodo.paraMinutos(this.fim) - Periodo.paraMinutos(this.inicio);
  }
}

module.exports = { Periodo };
