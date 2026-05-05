const { DomainError, ConflitoEstadoError } = require('../errors/DomainError');
const { Periodo } = require('../valueObjects/Periodo');

const STATUS_RESERVA = Object.freeze({
  PENDENTE: 'pendente',
  APROVADA: 'aprovada',
  RECUSADA: 'recusada',
  CANCELADA: 'cancelada',
});

const JANELA_CANCELAMENTO_MS = 48 * 60 * 60 * 1000;

class Reserva {
  constructor({
    id = null,
    clienteId,
    salaoId,
    dataEvento,
    horaInicio,
    horaFim,
    status = STATUS_RESERVA.PENDENTE,
    criadoEm = null,
    atualizadoEm = null,
    deletadoEm = null,
  }) {
    if (!clienteId) throw new DomainError('clienteId obrigatório');
    if (!salaoId) throw new DomainError('salaoId obrigatório');
    if (!dataEvento || typeof dataEvento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dataEvento)) {
      throw new DomainError('dataEvento deve estar no formato YYYY-MM-DD');
    }
    Periodo.validarHora(horaInicio);
    Periodo.validarHora(horaFim);
    if (Periodo.paraMinutos(horaInicio) >= Periodo.paraMinutos(horaFim)) {
      throw new DomainError('horaInicio deve ser anterior a horaFim');
    }
    if (!Object.values(STATUS_RESERVA).includes(status)) {
      throw new DomainError(`status inválido: ${status}`);
    }

    this.id = id;
    this.clienteId = clienteId;
    this.salaoId = salaoId;
    this.dataEvento = dataEvento;
    this.horaInicio = horaInicio;
    this.horaFim = horaFim;
    this.status = status;
    this.criadoEm = criadoEm;
    this.atualizadoEm = atualizadoEm;
    this.deletadoEm = deletadoEm;
  }

  periodo() {
    return new Periodo(this.horaInicio, this.horaFim);
  }

  inicioDoEvento() {
    const [y, m, d] = this.dataEvento.split('-').map(Number);
    const [hh, mm] = this.horaInicio.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }

  cancelamentoPermitido(agora = new Date()) {
    const limite = this.inicioDoEvento().getTime() - JANELA_CANCELAMENTO_MS;
    return agora.getTime() <= limite;
  }

  aprovar(agora = new Date()) {
    if (this.status !== STATUS_RESERVA.PENDENTE) {
      throw new ConflitoEstadoError(`não dá pra aprovar uma reserva com status "${this.status}"`);
    }
    this.status = STATUS_RESERVA.APROVADA;
    this.atualizadoEm = agora;
  }

  recusar(agora = new Date()) {
    if (this.status !== STATUS_RESERVA.PENDENTE) {
      throw new ConflitoEstadoError(`não dá pra recusar uma reserva com status "${this.status}"`);
    }
    this.status = STATUS_RESERVA.RECUSADA;
    this.atualizadoEm = agora;
  }

  cancelarPeloCliente(agora = new Date()) {
    const permitido = this.status === STATUS_RESERVA.PENDENTE
      || this.status === STATUS_RESERVA.APROVADA;
    if (!permitido) {
      throw new ConflitoEstadoError(`cliente não pode cancelar reserva com status "${this.status}"`);
    }
    if (!this.cancelamentoPermitido(agora)) {
      throw new ConflitoEstadoError('cancelamento só é permitido até 48 horas antes do evento');
    }
    this.status = STATUS_RESERVA.CANCELADA;
    this.atualizadoEm = agora;
  }

  cancelarPeloPrestador(agora = new Date()) {
    if (this.status === STATUS_RESERVA.CANCELADA || this.status === STATUS_RESERVA.RECUSADA) {
      throw new ConflitoEstadoError(`reserva já está em estado final: "${this.status}"`);
    }
    if (!this.cancelamentoPermitido(agora)) {
      throw new ConflitoEstadoError('cancelamento só é permitido até 48 horas antes do evento');
    }
    this.status = STATUS_RESERVA.CANCELADA;
    this.atualizadoEm = agora;
  }

  estaConcluida(hoje = new Date()) {
    if (this.status !== STATUS_RESERVA.APROVADA) return false;
    const hojeStr = hoje.toISOString().slice(0, 10);
    return this.dataEvento < hojeStr;
  }

  podeSerAvaliada(hoje = new Date()) {
    return this.estaConcluida(hoje);
  }
}

module.exports = { Reserva, STATUS_RESERVA };
