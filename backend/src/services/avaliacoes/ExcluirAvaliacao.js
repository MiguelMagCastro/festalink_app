const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
  ConflitoEstadoError,
} = require('../../domain/errors/DomainError');

class ExcluirAvaliacao {
  constructor({ reservaRepository, avaliacaoRepository }) {
    this.reservaRepository = reservaRepository;
    this.avaliacaoRepository = avaliacaoRepository;
  }

  executar({ reservaId, clienteId }) {
    const reserva = this.reservaRepository.buscarPorId(reservaId);
    if (!reserva) {
      throw new RecursoNaoEncontradoError('reserva não encontrada');
    }
    if (reserva.clienteId !== clienteId) {
      throw new AcessoNegadoError('reserva não pertence a você');
    }

    const avaliacao = this.avaliacaoRepository.buscarPorReservaId(reservaId);
    if (!avaliacao) {
      throw new RecursoNaoEncontradoError('avaliação não encontrada');
    }
    if (!avaliacao.clientePodeEditar()) {
      throw new ConflitoEstadoError('avaliação não pode mais ser excluída (prestador já respondeu)');
    }

    this.avaliacaoRepository.remover(avaliacao.id);
  }
}

module.exports = { ExcluirAvaliacao };
