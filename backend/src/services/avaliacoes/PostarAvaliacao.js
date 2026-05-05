const { Avaliacao } = require('../../domain/entities/Avaliacao');
const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
  ConflitoEstadoError,
} = require('../../domain/errors/DomainError');

class PostarAvaliacao {
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
    if (!reserva.podeSerAvaliada()) {
      throw new ConflitoEstadoError('reserva ainda não pode ser avaliada (precisa estar aprovada e a data já ter passado)');
    }
    const existente = this.avaliacaoRepository.buscarPorReservaId(reservaId);
    if (existente) {
      throw new ConflitoEstadoError('reserva já tem avaliação postada');
    }

    const avaliacao = new Avaliacao({
      reservaId,
      nota: dados.nota,
      comentario: dados.comentario ?? null,
    });
    return this.avaliacaoRepository.criar(avaliacao);
  }
}

module.exports = { PostarAvaliacao };
