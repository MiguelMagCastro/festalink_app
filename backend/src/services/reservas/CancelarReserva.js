const {
  DomainError,
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class CancelarReserva {
  constructor({ reservaRepository, salaoRepository }) {
    this.reservaRepository = reservaRepository;
    this.salaoRepository = salaoRepository;
  }

  executar({ reservaId, usuarioId, papel }) {
    const reserva = this.reservaRepository.buscarPorId(reservaId);
    if (!reserva) {
      throw new RecursoNaoEncontradoError('reserva não encontrada');
    }

    if (papel === 'cliente') {
      if (reserva.clienteId !== usuarioId) {
        throw new AcessoNegadoError('reserva não pertence a você');
      }
      reserva.cancelarPeloCliente();
    } else if (papel === 'prestador') {
      const salao = this.salaoRepository.buscarPorId(reserva.salaoId);
      if (!salao) {
        throw new RecursoNaoEncontradoError('salão dessa reserva não está mais disponível');
      }
      if (salao.prestadorId !== usuarioId) {
        throw new AcessoNegadoError('reserva não pertence a um salão seu');
      }
      reserva.cancelarPeloPrestador();
    } else {
      throw new DomainError(`papel inválido: ${papel}`);
    }

    return this.reservaRepository.atualizar(reserva);
  }
}

module.exports = { CancelarReserva };
