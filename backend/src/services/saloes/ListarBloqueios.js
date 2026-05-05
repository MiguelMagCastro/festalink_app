const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class ListarBloqueios {
  constructor({ salaoRepository, bloqueioRepository }) {
    this.salaoRepository = salaoRepository;
    this.bloqueioRepository = bloqueioRepository;
  }

  executar({ salaoId, prestadorId }) {
    const salao = this.salaoRepository.buscarPorId(salaoId);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('salão pertence a outro prestador');
    }
    return this.bloqueioRepository.listarPorSalao(salaoId);
  }
}

module.exports = { ListarBloqueios };
