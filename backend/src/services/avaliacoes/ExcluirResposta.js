const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class ExcluirResposta {
  constructor({ avaliacaoRepository, reservaRepository, salaoRepository }) {
    this.avaliacaoRepository = avaliacaoRepository;
    this.reservaRepository = reservaRepository;
    this.salaoRepository = salaoRepository;
  }

  executar({ avaliacaoId, prestadorId }) {
    const avaliacao = this.avaliacaoRepository.buscarPorId(avaliacaoId);
    if (!avaliacao) {
      throw new RecursoNaoEncontradoError('avaliação não encontrada');
    }

    const reserva = this.reservaRepository.buscarPorId(avaliacao.reservaId);
    if (!reserva) {
      throw new RecursoNaoEncontradoError('reserva associada à avaliação não encontrada');
    }

    const salao = this.salaoRepository.buscarPorId(reserva.salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão dessa avaliação não está mais disponível');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('avaliação não pertence a um salão seu');
    }

    avaliacao.excluirResposta();
    return this.avaliacaoRepository.atualizar(avaliacao);
  }
}

module.exports = { ExcluirResposta };
