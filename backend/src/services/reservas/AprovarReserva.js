const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class AprovarReserva {
  constructor({ reservaRepository, salaoRepository }) {
    this.reservaRepository = reservaRepository;
    this.salaoRepository = salaoRepository;
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
    return this.reservaRepository.atualizar(reserva);
  }
}

module.exports = { AprovarReserva };
