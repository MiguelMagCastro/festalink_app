const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');
const { reservaAprovada } = require('../../domain/events');

class AprovarReserva {
  constructor({ reservaRepository, salaoRepository, eventPublisher }) {
    this.reservaRepository = reservaRepository;
    this.salaoRepository = salaoRepository;
    this.eventPublisher = eventPublisher;
  }

  executar({ reservaId, prestadorId }) {
    const reserva = this.reservaRepository.buscarPorId(reservaId);
    if (!reserva) {
      throw new RecursoNaoEncontradoError('reserva não encontrada');
    }
    const salao = this.salaoRepository.buscarPorId(reserva.salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão dessa reserva não está mais disponível');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('reserva não pertence a um salão seu');
    }
    reserva.aprovar();
    const atualizada = this.reservaRepository.atualizar(reserva);

    if (this.eventPublisher) {
      Promise.resolve()
        .then(() => this.eventPublisher.publicar(reservaAprovada(atualizada)))
        .catch(err => console.error('[eventos] falha ao publicar ReservaAprovada:', err.message));
    }

    return atualizada;
  }
}

module.exports = { AprovarReserva };
