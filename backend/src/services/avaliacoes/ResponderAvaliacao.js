const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class ResponderAvaliacao {
  constructor({ avaliacaoRepository, reservaRepository, salaoRepository }) {
    this.avaliacaoRepository = avaliacaoRepository;
    this.reservaRepository = reservaRepository;
    this.salaoRepository = salaoRepository;
  }

  executar({ avaliacaoId, prestadorId, dados }) {
    const avaliacao = this.avaliacaoRepository.buscarPorId(avaliacaoId);
    if (!avaliacao) {
      throw new RecursoNaoEncontradoError('avaliação não encontrada');
    }

    const reserva = this.reservaRepository.buscarPorId(avaliacao.reservaId);
    if (!reserva) {
      throw new RecursoNaoEncontradoError('reserva associada à avaliação não encontrada');
    }

    const salao = this.salaoRepository.buscarPorId(reserva.salaoId);
    if (!salao || salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('avaliação não pertence a um salão seu');
    }

    avaliacao.responder(dados.texto);
    return this.avaliacaoRepository.atualizar(avaliacao);
  }
}

module.exports = { ResponderAvaliacao };
