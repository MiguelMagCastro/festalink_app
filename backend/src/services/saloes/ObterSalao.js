const { RecursoNaoEncontradoError } = require('../../domain/errors/DomainError');

class ObterSalao {
  constructor({ salaoRepository }) {
    this.salaoRepository = salaoRepository;
  }

  executar({ id }) {
    const salao = this.salaoRepository.buscarPorId(id);
    if (!salao) {
      throw new RecursoNaoEncontradoError('salão não encontrado');
    }
    return salao;
  }
}

module.exports = { ObterSalao };
