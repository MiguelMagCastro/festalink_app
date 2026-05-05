const { BloqueioData } = require('../../domain/entities/BloqueioData');
const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class CriarBloqueio {
  constructor({ salaoRepository, bloqueioRepository }) {
    this.salaoRepository = salaoRepository;
    this.bloqueioRepository = bloqueioRepository;
  }

  executar({ salaoId, prestadorId, dados }) {
    const salao = this.salaoRepository.buscarPorId(salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('salão pertence a outro prestador');
    }

    const bloqueio = new BloqueioData({
      salaoId,
      data: dados.data,
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim,
      motivo: dados.motivo ?? null,
    });

    return this.bloqueioRepository.criar(bloqueio);
  }
}

module.exports = { CriarBloqueio };
