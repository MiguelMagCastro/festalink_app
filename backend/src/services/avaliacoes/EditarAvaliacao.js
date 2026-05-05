const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class EditarAvaliacao {
  constructor({ reservaRepository, avaliacaoRepository, salaoRepository }) {
    this.reservaRepository = reservaRepository;
    this.avaliacaoRepository = avaliacaoRepository;
    this.salaoRepository = salaoRepository;
  }

  executar({ reservaId, clienteId, dados }) {
    const reserva = this.reservaRepository.buscarPorId(reservaId);
    if (!reserva) {
      throw new RecursoNaoEncontradoError('reserva não encontrada');
    }
    if (reserva.clienteId !== clienteId) {
      throw new AcessoNegadoError('reserva não pertence a você');
    }
    const salao = this.salaoRepository.buscarPorId(reserva.salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão dessa reserva não está mais disponível');
    }

    const avaliacao = this.avaliacaoRepository.buscarPorReservaId(reservaId);
    if (!avaliacao) {
      throw new RecursoNaoEncontradoError('avaliação não encontrada para essa reserva');
    }

    avaliacao.editarPeloCliente(dados.nota, dados.comentario ?? null);
    return this.avaliacaoRepository.atualizar(avaliacao);
  }
}

module.exports = { EditarAvaliacao };
