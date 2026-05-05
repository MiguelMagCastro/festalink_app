const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class RemoverBloqueio {
  constructor({ salaoRepository, bloqueioRepository }) {
    this.salaoRepository = salaoRepository;
    this.bloqueioRepository = bloqueioRepository;
  }

  executar({ salaoId, bloqueioId, prestadorId }) {
    const salao = this.salaoRepository.buscarPorId(salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('salão pertence a outro prestador');
    }
    const bloqueio = this.bloqueioRepository.buscarPorId(bloqueioId);
    if (!bloqueio || bloqueio.salaoId !== salaoId) {
      throw new RecursoNaoEncontradoError('bloqueio não encontrado neste salão');
    }
    this.bloqueioRepository.remover(bloqueioId);
  }
}

module.exports = { RemoverBloqueio };
