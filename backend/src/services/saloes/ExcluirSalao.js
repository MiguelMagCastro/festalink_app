const {
  RecursoNaoEncontradoError,
  AcessoNegadoError,
} = require('../../domain/errors/DomainError');

class ExcluirSalao {
  constructor({ salaoRepository }) {
    this.salaoRepository = salaoRepository;
  }

  executar({ id, prestadorId }) {
    const salao = this.salaoRepository.buscarPorId(id);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    if (salao.prestadorId !== prestadorId) {
      throw new AcessoNegadoError('salão pertence a outro prestador');
    }
    this.salaoRepository.arquivar(salao.id);
  }
}

module.exports = { ExcluirSalao };
